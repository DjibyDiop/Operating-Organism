import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Users, Globe, ChevronLeft, Send,
  Sparkles, Zap, Shield, Radio, TrendingUp, Heart
} from 'lucide-react';
import { Link } from 'react-router-dom';

// ── Types ──────────────────────────────────────────────────────────────────
interface SwarmMember { id: number; name: string; online: boolean; latency: number; color: string; avatar: string; }
interface FeedItem { id: number; platform: 'whatsapp' | 'instagram' | 'x' | 'p2p'; author: string; content: string; time: string; likes: number; color: string; }
interface ChatMsg { id: number; from: 'me' | 'yama'; text: string; ts: string; }

// ── Static data ────────────────────────────────────────────────────────────
const SWARM: SwarmMember[] = [
  { id: 1, name: 'Mamadou', online: true,  latency: 2,   color: '#06b6d4', avatar: 'M' },
  { id: 2, name: 'Aïcha',   online: true,  latency: 5,   color: '#a855f7', avatar: 'A' },
  { id: 3, name: 'Papa',    online: true,  latency: 14,  color: '#f59e0b', avatar: 'P' },
  { id: 4, name: 'Moussa',  online: false, latency: 999, color: '#6b7280', avatar: 'Mo' },
  { id: 5, name: 'Keurgui', online: true,  latency: 3,   color: '#10b981', avatar: 'K' },
  { id: 6, name: 'Node-7',  online: true,  latency: 1,   color: '#8b5cf6', avatar: '7' },
];

const INITIAL_FEED: FeedItem[] = [
  { id: 1, platform: 'p2p',       author: 'Mamadou',    content: 'Hey Djiby, are we still on for the server setup tonight?',        time: '11:42', likes: 0, color: '#06b6d4' },
  { id: 2, platform: 'whatsapp',  author: 'Aïcha',      content: '🎉 Félicitations pour le déploiement du kernel 2.5.9 !',           time: '11:30', likes: 3, color: '#25d366' },
  { id: 3, platform: 'x',         author: '@YamaooOS',  content: '#BaremetalOS is trending at #1 globally. The future is sovereign.', time: '11:15', likes: 847, color: '#1d9bf0' },
  { id: 4, platform: 'instagram', author: 'Keurgui',    content: '3 new holograms uploaded in your neural network. 🧠✨',            time: '10:58', likes: 124, color: '#e1306c' },
  { id: 5, platform: 'p2p',       author: 'Node-7',     content: 'P2P handshake complete. Mesh topology: 6 nodes, latency avg 5ms.',  time: '10:44', likes: 0, color: '#8b5cf6' },
];

const PLATFORM_LABELS: Record<string, string> = { whatsapp: 'WhatsApp', instagram: 'Instagram', x: 'X / Twitter', p2p: 'OO Swarm P2P' };

const YAMA_REPLIES = [
  'Signal multiplexé envoyé au Swarm. Canal E2E actif.',
  'Message intégré dans le buffer cognitif. Probabilité de réponse : 97%.',
  'Transmission P2P encryptée. Latence: 2ms. Cohérence: 99.8%.',
  'Analyse sémantique complète. Sentiment : Positif. Priorité : Haute.',
];

// ── Component ──────────────────────────────────────────────────────────────
export default function SocialDimension() {
  const [activeTab, setActiveTab] = useState<'AUTONOMOUS' | 'EARTH' | 'ANALYTICS'>('AUTONOMOUS');
  const [feed, setFeed] = useState<FeedItem[]>(INITIAL_FEED);
  const [chatLog, setChatLog] = useState<ChatMsg[]>([
    { id: 1, from: 'yama', text: 'Swarm connecté. 5 membres actifs. Réseau E2E opérationnel.', ts: '11:40' },
  ]);
  const [input, setInput] = useState('');
  const [selectedMember, setSelectedMember] = useState<SwarmMember | null>(null);
  const [pulse, setPulse] = useState({ swarmVibe: 82, earthNoise: 47, aiFilter: 97 });
  const chatEndRef = useRef<HTMLDivElement>(null);
  const msgId = useRef(100);

  // Auto-scroll chat
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatLog]);

  // Live pulse fluctuations
  useEffect(() => {
    const iv = setInterval(() => {
      setPulse(p => ({
        swarmVibe: Math.min(99, Math.max(60, p.swarmVibe + (Math.random() - 0.5) * 4)),
        earthNoise: Math.min(90, Math.max(20, p.earthNoise + (Math.random() - 0.5) * 6)),
        aiFilter: Math.min(99, Math.max(90, p.aiFilter + (Math.random() - 0.4) * 2)),
      }));
    }, 2500);
    return () => clearInterval(iv);
  }, []);

  // Auto-feed new messages
  useEffect(() => {
    const msgs = [
      { platform: 'p2p' as const, author: 'Mamadou', content: 'Kernel boot time réduit à 180ms 🔥', color: '#06b6d4' },
      { platform: 'x' as const, author: '@YamaooOS', content: 'New commit pushed: neural-io/v3-alpha — 2 contributors', color: '#1d9bf0' },
      { platform: 'whatsapp' as const, author: 'Papa', content: 'Comment ça se passe le projet ? 🙂', color: '#25d366' },
    ];
    const iv = setInterval(() => {
      const m = msgs[Math.floor(Math.random() * msgs.length)];
      const now = new Date().toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' });
      setFeed(f => [{ ...m, id: Date.now(), time: now, likes: 0 }, ...f].slice(0, 12));
    }, 8000);
    return () => clearInterval(iv);
  }, []);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const ts = new Date().toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMsg = { id: msgId.current++, from: 'me', text: input.trim(), ts };
    setChatLog(prev => [...prev, userMsg]);
    setInput('');
    setTimeout(() => {
      const reply = YAMA_REPLIES[Math.floor(Math.random() * YAMA_REPLIES.length)];
      setChatLog(prev => [...prev, { id: msgId.current++, from: 'yama', text: reply, ts: new Date().toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' }) }]);
    }, 600);
  };

  const likeFeed = (id: number) => setFeed(f => f.map(x => x.id === id ? { ...x, likes: x.likes + 1 } : x));

  const TABS = [
    { id: 'AUTONOMOUS', label: 'OO P2P Swarm', icon: <Radio size={12} /> },
    { id: 'EARTH',      label: 'Earth Matrix',  icon: <Globe size={12} /> },
    { id: 'ANALYTICS',  label: 'AI Sentiment',  icon: <Sparkles size={12} /> },
  ] as const;

  return (
    <div className="h-screen w-screen bg-[#04030A] overflow-hidden relative font-sans text-white select-none flex flex-col">

      {/* === AMBIENT BG === */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.07),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom-right,rgba(168,85,247,0.05),transparent_50%)]" />
      </div>

      {/* === TOP BAR === */}
      <header className="relative z-50 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/20 backdrop-blur-xl shrink-0">
        <Link to="/" className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition bg-indigo-500/10 px-4 py-2 rounded-full border border-indigo-500/20 text-xs font-bold uppercase tracking-widest">
          <ChevronLeft size={14} /> Disconnect
        </Link>

        <div className="flex gap-1.5 p-1 bg-white/5 rounded-full border border-white/5">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black tracking-widest uppercase transition-all"
              style={{
                background: activeTab === tab.id ? 'rgba(99,102,241,0.3)' : 'transparent',
                color: activeTab === tab.id ? '#a5b4fc' : 'rgba(255,255,255,0.4)',
                boxShadow: activeTab === tab.id ? '0 0 20px rgba(99,102,241,0.3)' : 'none',
                border: activeTab === tab.id ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent',
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-[9px] font-mono text-indigo-400/50 uppercase tracking-widest">
          <Shield size={12} className="text-emerald-400" />
          E2E Neural Sync · 5/6 nœuds actifs
        </div>
      </header>

      {/* === BODY === */}
      <div className="flex-1 grid grid-cols-12 gap-5 p-5 overflow-hidden relative z-10">

        {/* ── LEFT: Swarm Members ── */}
        <div className="col-span-3 flex flex-col gap-4 overflow-hidden">
          <div className="bg-black/30 border border-white/5 rounded-3xl backdrop-blur-xl p-4 flex-1 flex flex-col overflow-hidden">
            <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-400/80 mb-4 flex items-center gap-2">
              <Users size={10} /> Synaptic Links
              <span className="ml-auto text-emerald-400 font-mono">{SWARM.filter(s => s.online).length} online</span>
            </h3>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1" style={{ scrollbarWidth: 'none' }}>
              {SWARM.map(m => (
                <motion.div
                  key={m.id}
                  whileHover={{ x: 3 }}
                  onClick={() => setSelectedMember(selectedMember?.id === m.id ? null : m)}
                  className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all"
                  style={{
                    background: selectedMember?.id === m.id ? `${m.color}12` : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${selectedMember?.id === m.id ? `${m.color}30` : 'rgba(255,255,255,0.05)'}`,
                  }}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs relative shrink-0" style={{ background: `${m.color}20`, color: m.color }}>
                    {m.avatar}
                    <span
                      className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#04030A]"
                      style={{ background: m.online ? '#10b981' : '#4b5563' }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate" style={{ color: m.online ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)' }}>{m.name}</p>
                    <p className="text-[8px] font-mono mt-0.5" style={{ color: m.online ? '#10b981' : '#4b5563' }}>
                      {m.online ? `Online · ${m.latency}ms` : 'Offline'}
                    </p>
                  </div>
                  {m.online && (
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }}>
                      <Radio size={10} style={{ color: m.color }} />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Selected member card */}
          <AnimatePresence>
            {selectedMember && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-black/30 border rounded-3xl backdrop-blur-xl p-4 shrink-0"
                style={{ borderColor: `${selectedMember.color}30` }}
              >
                <p className="text-[9px] font-black uppercase tracking-widest mb-3" style={{ color: selectedMember.color }}>{selectedMember.name}</p>
                <div className="space-y-1.5 text-[8px] font-mono">
                  <div className="flex justify-between"><span className="text-white/30">Latence</span><span className="text-white/60">{selectedMember.latency}ms</span></div>
                  <div className="flex justify-between"><span className="text-white/30">Protocole</span><span className="text-white/60">OO-P2P/v3</span></div>
                  <div className="flex justify-between"><span className="text-white/30">Chiffrement</span><span className="text-emerald-400">AES-256</span></div>
                </div>
                <button
                  onClick={() => { setInput(`@${selectedMember.name} `); setActiveTab('AUTONOMOUS'); }}
                  className="mt-3 w-full py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition"
                  style={{ background: `${selectedMember.color}20`, color: selectedMember.color, border: `1px solid ${selectedMember.color}30` }}
                >
                  Envoyer un signal →
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── CENTER: Main content ── */}
        <div className="col-span-6 flex flex-col gap-4 overflow-hidden">
          <AnimatePresence mode="wait">

            {/* P2P SWARM CHAT */}
            {activeTab === 'AUTONOMOUS' && (
              <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col bg-black/30 border border-white/5 rounded-3xl backdrop-blur-xl overflow-hidden">
                <div className="p-4 border-b border-white/5 flex items-center gap-2">
                  <Radio size={12} className="text-indigo-400" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">OO Swarm — Canal Chiffré</span>
                  <span className="ml-auto text-[8px] font-mono text-emerald-400">● LIVE</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(99,102,241,0.2) transparent' }}>
                  {chatLog.map(msg => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className="max-w-[75%] px-4 py-2.5 rounded-2xl"
                        style={{
                          background: msg.from === 'me' ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.05)',
                          border: msg.from === 'me' ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        {msg.from === 'yama' && <p className="text-[8px] font-black uppercase tracking-widest text-indigo-400 mb-1">YAMA</p>}
                        <p className="text-xs leading-relaxed text-white/80">{msg.text}</p>
                        <p className="text-[7px] text-white/20 font-mono mt-1 text-right">{msg.ts}</p>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <form onSubmit={sendMessage} className="p-4 border-t border-white/5 flex gap-3">
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Envoyer une pensée au Swarm..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-2.5 text-xs outline-none focus:border-indigo-500/50 text-white placeholder-white/20 transition"
                  />
                  <motion.button type="submit" whileTap={{ scale: 0.92 }}
                    className="bg-indigo-500 hover:bg-indigo-400 text-white rounded-full px-5 font-black text-xs flex items-center gap-2 transition"
                  >
                    <Send size={14} />
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* EARTH FEED */}
            {activeTab === 'EARTH' && (
              <motion.div key="earth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(99,102,241,0.2) transparent' }}>
                {feed.map(item => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-black/30 border border-white/5 rounded-2xl p-4 backdrop-blur-xl shrink-0"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-md flex items-center justify-center text-[8px] font-black" style={{ background: `${item.color}20`, color: item.color }}>
                          {item.platform === 'whatsapp' ? '💬' : item.platform === 'instagram' ? '📸' : item.platform === 'x' ? '✕' : '📡'}
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: item.color }}>{PLATFORM_LABELS[item.platform]}</span>
                        <span className="text-[8px] text-white/30 font-mono">· {item.author}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[8px] text-white/20 font-mono">{item.time}</span>
                        <button onClick={() => likeFeed(item.id)} className="flex items-center gap-1 text-white/20 hover:text-rose-400 transition">
                          <Heart size={10} />
                          {item.likes > 0 && <span className="text-[8px] font-mono">{item.likes}</span>}
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed">{item.content}</p>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* ANALYTICS */}
            {activeTab === 'ANALYTICS' && (
              <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col gap-4">
                <div className="bg-black/30 border border-white/5 rounded-3xl backdrop-blur-xl p-6 flex-1">
                  <h3 className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-6 flex items-center gap-2">
                    <TrendingUp size={12} /> Analyse Sémantique IA en Temps Réel
                  </h3>
                  <div className="space-y-8">
                    {[
                      { label: 'Énergie du Swarm', val: pulse.swarmVibe, color: '#10b981', desc: 'Vibe collective : positive et créative' },
                      { label: 'Bruit Earth Matrix', val: pulse.earthNoise, color: '#f59e0b', desc: '47 messages filtrés automatiquement' },
                      { label: 'Précision Filtre IA', val: pulse.aiFilter, color: '#6366f1', desc: 'Aucun faux positif détecté' },
                    ].map(m => (
                      <div key={m.label}>
                        <div className="flex justify-between mb-2">
                          <span className="text-xs text-white/60 font-mono uppercase tracking-wider">{m.label}</span>
                          <span className="text-xs font-black font-mono" style={{ color: m.color }}>{Math.round(m.val)}%</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <motion.div animate={{ width: `${m.val}%` }} transition={{ duration: 1.5 }}
                            className="h-full rounded-full" style={{ background: m.color, boxShadow: `0 0 10px ${m.color}60` }} />
                        </div>
                        <p className="text-[9px] text-white/25 mt-2">{m.desc}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 grid grid-cols-3 gap-3">
                    {['Activité en hausse +23%', '0 menaces détectées', 'Swarm: COHÉRENT'].map(t => (
                      <div key={t} className="bg-white/3 border border-white/5 rounded-xl p-3 text-center">
                        <p className="text-[9px] text-white/40 font-mono leading-relaxed">{t}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <button className="w-full py-3 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-black uppercase tracking-widest hover:bg-indigo-500/20 transition">
                  Activer Auto-Reply IA Contextuel
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── RIGHT: Live vitals ── */}
        <div className="col-span-3 flex flex-col gap-4 overflow-hidden">

          {/* Network pulse */}
          <div className="bg-black/30 border border-white/5 rounded-3xl backdrop-blur-xl p-5 shrink-0">
            <h3 className="text-[9px] font-black uppercase tracking-widest text-indigo-400/80 mb-4 flex items-center gap-2">
              <Zap size={10} /> Pulse Réseau
            </h3>
            <div className="flex items-end gap-1 h-16 w-full">
              {Array.from({ length: 20 }, (_, i) => (
                <motion.div
                  key={i}
                  animate={{ height: [`${10 + Math.random() * 60}%`, `${20 + Math.random() * 70}%`, `${10 + Math.random() * 60}%`] }}
                  transition={{ duration: 1.2 + Math.random(), repeat: Infinity, delay: i * 0.1 }}
                  className="flex-1 rounded-t-sm"
                  style={{ background: 'rgba(99,102,241,0.6)' }}
                />
              ))}
            </div>
          </div>

          {/* Recent activity */}
          <div className="bg-black/30 border border-white/5 rounded-3xl backdrop-blur-xl p-5 flex-1 flex flex-col overflow-hidden">
            <h3 className="text-[9px] font-black uppercase tracking-widest text-indigo-400/80 mb-4 flex items-center gap-2">
              <MessageSquare size={10} /> Activité Récente
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3" style={{ scrollbarWidth: 'none' }}>
              {feed.slice(0, 6).map(item => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: item.color }} />
                  <div>
                    <p className="text-[9px] text-white/50 font-mono leading-relaxed">
                      <span className="font-black" style={{ color: item.color }}>{item.author}</span>
                      {' · '}{PLATFORM_LABELS[item.platform]}
                    </p>
                    <p className="text-[8px] text-white/25 mt-0.5 font-mono">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-black/30 border border-white/5 rounded-3xl backdrop-blur-xl p-5 shrink-0 grid grid-cols-2 gap-4">
            {[
              { label: 'Messages', value: '312', color: '#6366f1' },
              { label: 'Filtrés', value: '47', color: '#f59e0b' },
              { label: 'Nœuds', value: '6', color: '#10b981' },
              { label: 'Latence moy.', value: '5ms', color: '#06b6d4' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-xl font-black font-mono" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[8px] text-white/25 uppercase tracking-wider font-mono mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
