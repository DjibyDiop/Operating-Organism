/**
 * colony_bridge.js — OO-Shell ↔ Colony-Server WebSocket bridge
 * Operating Organism · Living Desktop
 *
 * Connects to colony-server (ws://127.0.0.1:8080/ws).
 * Falls back gracefully to simulation when offline.
 * Provides real vitals, Hermes events, registry data to the HUD.
 *
 * Usage: loaded by index.html after the main script block.
 *   colonySend('/status')   — forward REPL command to real organism
 *   colonyConnect()         — called on page load
 */

const COLONY_WS_URL  = 'ws://127.0.0.1:8080/ws';
const COLONY_API_URL = 'http://127.0.0.1:8080';

let colonyWs    = null;
let colonyRetry = 0;
const COLONY_MAX_RETRY = 6;

/* ── Connect ────────────────────────────────────────────────────────────────── */
function colonyConnect() {
  if (colonyRetry >= COLONY_MAX_RETRY) {
    appendSystemMsg('[COLONY] Max retries — running in simulation mode');
    return;
  }

  try {
    colonyWs = new WebSocket(COLONY_WS_URL);

    colonyWs.onopen = () => {
      colonyRetry = 0;
      state.colonyOnline = true;

      const dot = document.getElementById('model-dot');
      if (dot) {
        dot.style.background = 'var(--green)';
        dot.style.boxShadow  = '0 0 8px var(--green)';
      }

      appendSystemMsg('[COLONY] WebSocket connected · ws://127.0.0.1:8080/ws');

      try {
        colonyWs.send(JSON.stringify({
          type: 'subscribe',
          topics: ['vitals', 'hermes', 'registry', 'windows', 'repl']
        }));
      } catch(_) {}
    };

    colonyWs.onmessage = (evt) => {
      try {
        colonyHandleMsg(JSON.parse(evt.data));
      } catch(_) {
        // Raw text from colony (e.g. REPL output stream)
        if (evt.data && evt.data.trim()) {
          appendSystemMsg('[COLONY] ' + evt.data.slice(0, 120));
        }
      }
    };

    colonyWs.onerror = () => {
      state.colonyOnline = false;
    };

    colonyWs.onclose = () => {
      state.colonyOnline = false;
      state.peers = 0;
      colonyWs = null;
      colonyRetry++;
      if (colonyRetry < COLONY_MAX_RETRY) {
        const delay = Math.min(2000 * colonyRetry, 16000);
        setTimeout(colonyConnect, delay);
      }
    };

  } catch(_) {
    state.colonyOnline = false;
  }
}

/* ── Message router ─────────────────────────────────────────────────────────── */
function colonyHandleMsg(msg) {
  if (!msg || !msg.type) return;

  switch (msg.type) {

    // Real organism vitals
    case 'vitals':
    case 'oo_vitals': {
      if (msg.vitality !== undefined) {
        const v = parseFloat(msg.vitality);
        for (const w of state.windows) w.vitality = v || w.vitality;
      }
      if (msg.peers  !== undefined) state.peers  = parseInt(msg.peers);
      if (msg.mode   !== undefined) {
        const el = document.getElementById('sv-mode');
        if (el) el.textContent = msg.mode;
      }
      if (msg.warden !== undefined) state.warden = msg.warden;
      if (msg.tick   !== undefined) state.tick   = parseInt(msg.tick);
      break;
    }

    // Hermes bus event
    case 'hermes_event':
    case 'hermes': {
      state.hermes.push({
        ch:      parseInt(msg.channel || msg.ch || 0),
        from:    (msg.from || msg.sender || 'OO').slice(0, 12),
        summary: (msg.summary || msg.payload || '…').slice(0, 32)
      });
      if (state.hermes.length > 64) state.hermes.shift();
      break;
    }

    // OO Living Registry snapshot
    case 'registry':
    case 'oo_registry': {
      const entries = msg.oo_registry || msg.entries || [];
      const modules = entries.filter(e => e.type === 1 /* OO_REG_TYPE_MODULE */);
      for (const rm of modules) {
        const nm = (rm.name || 'ORG').toUpperCase();
        if (!state.windows.find(w => w.name === nm)) {
          const nw = new OoWindow(rm.id, nm, 0.25);
          nw.vitality = (rm.flags & 1) ? 0.95 : 0.4; // ACTIVE flag
          state.windows.push(nw);
        }
      }
      // Update peer count from registry peers
      const peers = entries.filter(e => e.type === 8 /* OO_REG_TYPE_PEER */);
      if (peers.length > 0) state.peers = peers.length;
      break;
    }

    // REPL / Cortex response
    case 'repl_response':
    case 'cortex_reply': {
      const text = msg.text || msg.response || msg.output || '';
      if (text) {
        removeThinking();
        appendOoMsg(text, true);
        state.thinking = false;
      }
      break;
    }

    // Genesis acknowledgment from colony
    case 'genesis_ack': {
      const organ = msg.organ || msg.name || '?';
      const id    = msg.id || '?';
      appendSystemMsg(`[GENESIS] Colony ack · organ=${organ} id=${id}`);
      break;
    }

    // Peer swarm update
    case 'peers':
    case 'swarm': {
      state.peers = parseInt(msg.count || msg.peers || 0);
      break;
    }

    // Living Window update from real organism
    case 'window_update':
    case 'living_window': {
      const name = (msg.name || '').toUpperCase();
      const w = state.windows.find(w => w.name === name);
      if (w) {
        if (msg.vitality !== undefined) w.vitality = parseFloat(msg.vitality);
      }
      break;
    }

    default:
      break;
  }
}

/* ── Send REPL command to real organism ─────────────────────────────────────── */
function colonySend(cmd) {
  if (!colonyWs || colonyWs.readyState !== WebSocket.OPEN) return false;
  try {
    colonyWs.send(JSON.stringify({ type: 'repl', command: cmd }));
    return true;
  } catch(_) {
    return false;
  }
}

/* ── REST fallback poll ──────────────────────────────────────────────────────── */
async function colonyPollRest() {
  try {
    const r = await fetch(COLONY_API_URL + '/api/status', {
      signal: AbortSignal.timeout(2000)
    });
    if (r.ok) {
      const d = await r.json();
      if (d.vitality !== undefined) {
        const v = parseFloat(d.vitality);
        for (const w of state.windows) w.vitality = v || w.vitality;
      }
      if (d.peers !== undefined) state.peers = parseInt(d.peers);
      if (d.hermes && Array.isArray(d.hermes)) {
        for (const h of d.hermes) colonyHandleMsg({ type: 'hermes', ...h });
      }
    }
  } catch(_) { /* offline — stay in simulation */ }
}

/* ── Bootstrap: called by main index.html init ───────────────────────────────── */
function colonyBootstrap() {
  colonyConnect();
  // REST fallback poll every 5s when WebSocket is down
  setInterval(() => {
    if (!state.colonyOnline) colonyPollRest();
  }, 5000);
}
