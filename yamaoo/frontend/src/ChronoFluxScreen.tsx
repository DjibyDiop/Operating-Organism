import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Clock, Zap, Calendar, GitBranch, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ChronoEvent {
  id: string;
  ts: number; // timestamp ms
  label: string;
  type: 'system' | 'cognitive' | 'user' | 'kernel';
  value?: number;
}

const TYPE_COLORS = {
  system:    { line: '#22d3ee', glow: 'rgba(34,211,238,0.4)',  badge: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' },
  cognitive: { line: '#a855f7', glow: 'rgba(168,85,247,0.4)', badge: 'bg-purple-500/20 border-purple-500/40 text-purple-300' },
  user:      { line: '#f59e0b', glow: 'rgba(245,158,11,0.4)', badge: 'bg-amber-500/20 border-amber-500/40 text-amber-300' },
  kernel:    { line: '#f43f5e', glow: 'rgba(244,63,94,0.4)',  badge: 'bg-rose-500/20 border-rose-500/40 text-rose-300' },
};

export default function ChronoFluxScreen() {
  const [events, setEvents] = useState<ChronoEvent[]>([]);
  const [now, setNow] = useState(Date.now());
  const [paused, setPaused] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const EVENT_POOL = [
    { label: 'CPU spike détecté', type: 'kernel' as const },
    { label: 'Intention vocale traitée', type: 'cognitive' as const },
    { label: 'Pulse SomaBridge reçu', type: 'system' as const },
    { label: 'Processus Phage activé', type: 'kernel' as const },
    { label: 'Mémoire Hippocampe écrite', type: 'cognitive' as const },
    { label: 'Synapse réseau établie', type: 'system' as const },
    { label: 'Interaction utilisateur', type: 'user' as const },
    { label: 'Module YRM activé', type: 'system' as const },
    { label: 'Décision DIOP_MIND', type: 'cognitive' as const },
    { label: 'Interruption Kernel', type: 'kernel' as const },
  ];

  // Génération d'événements en temps réel
  useEffect(() => {
    if (paused) return;
    const iv = setInterval(() => {
      const src = EVENT_POOL[Math.floor(Math.random() * EVENT_POOL.length)];
      const evt: ChronoEvent = {
        id: `${Date.now()}-${Math.random()}`,
        ts: Date.now(),
        label: src.label,
        type: src.type,
        value: Math.random() * 100,
      };
      setEvents(prev => [...prev.slice(-40), evt]);
      setNow(Date.now());
    }, 800);
    return () => clearInterval(iv);
  }, [paused]);

  // Tick de l'horloge
  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(iv);
  }, []);

  // Dessin du flux temporel sur canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;

    ctx.clearRect(0, 0, W, H);

    // Axe temporel horizontal
    const centerY = H / 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(W, centerY);
    ctx.stroke();

    // Dessiner les événements
    const windowMs = 12000;
    const visibleEvts = events.filter(e => now - e.ts < windowMs);
    visibleEvts.forEach(evt => {
      const age = now - evt.ts;
      const x = W - (age / windowMs) * W;
      const alpha = 1 - age / windowMs;
      const colors = TYPE_COLORS[evt.type];

      // Ligne verticale depuis l'axe
      const yDir = evt.type === 'system' || evt.type === 'user' ? -1 : 1;
      const yEnd = centerY + yDir * (40 + (evt.value || 0) * 0.6);

      ctx.globalAlpha = alpha;
      ctx.strokeStyle = colors.line;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = colors.glow;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(x, centerY);
      ctx.lineTo(x, yEnd);
      ctx.stroke();

      // Point terminal
      ctx.fillStyle = colors.line;
      ctx.beginPath();
      ctx.arc(x, yEnd, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    });
  }, [events, now]);

  // Compteurs par type
  const counts = events.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const clockStr = new Date(now).toLocaleTimeString('fr-FR', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 1
  });

  return (
    <div className="h-screen w-screen bg-[#010208] overflow-hidden relative font-sans text-white select-none flex flex-col">
      {/* AMBIENT */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(34,211,238,0.03),transparent_70%)] pointer-events-none" />

      {/* TOP BAR */}
      <div className="absolute top-0 w-full p-6 flex justify-between items-center z-50 pointer-events-none">
        <Link to="/" className="pointer-events-auto flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition bg-black/40 px-4 py-2 rounded-full border border-cyan-500/20 backdrop-blur-md text-xs font-black uppercase tracking-widest">
          <ChevronLeft size={16} /> Nexus
        </Link>
        <div className="text-center">
          <h1 className="text-xl font-black tracking-[0.4em] uppercase text-cyan-400" style={{fontFamily: "'Orbitron', sans-serif"}}>
            CHRONO-FLUX
          </h1>
          <p className="text-[8px] text-cyan-300/50 uppercase tracking-[0.4em] font-mono mt-1">Mémoire Temporelle de l'Organisme</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPaused(p => !p)}
            className="pointer-events-auto flex items-center gap-2 bg-black/40 border border-white/10 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-white/5 transition"
          >
            {paused ? <Zap size={12} className="text-emerald-400" /> : <Eye size={12} className="text-amber-400" />}
            {paused ? 'Reprendre' : 'Pause'}
          </button>
        </div>
      </div>

      {/* HORLOGE CENTRALE */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 text-center z-20 pointer-events-none">
        <div className="font-mono text-5xl font-black text-cyan-300 tracking-widest text-shadow-[0_0_30px_rgba(34,211,238,0.5)]">
          {clockStr}
        </div>
        <p className="text-[8px] text-cyan-500/40 uppercase tracking-[0.5em] mt-2 font-mono">FLUX TEMPOREL EN COURS</p>
      </div>

      {/* CANVAS FLUX */}
      <div className="absolute inset-0 top-36 bottom-48 z-10">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>

      {/* ÉVÉNEMENTS RÉCENTS (bas) */}
      <div className="absolute bottom-0 left-0 right-0 h-44 z-20 px-6 pb-4">
        <div className="h-full overflow-hidden flex flex-col-reverse gap-1">
          <AnimatePresence>
            {[...events].reverse().slice(0, 6).map(evt => {
              const colors = TYPE_COLORS[evt.type];
              const age = Math.round((now - evt.ts) / 1000);
              return (
                <motion.div
                  key={evt.id}
                  initial={{ opacity: 0, y: 20, x: -10 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className={`flex items-center gap-3 px-4 py-2 rounded-xl border backdrop-blur-md ${colors.badge}`}
                >
                  <Clock size={10} className="shrink-0 opacity-60" />
                  <span className="text-[9px] font-mono font-black uppercase tracking-widest">{evt.label}</span>
                  <span className="text-[8px] font-mono opacity-40 ml-auto">T-{age}s</span>
                  <span className="text-[8px] font-mono opacity-40 uppercase">{evt.type}</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* MÉTRIQUES LATÉRALES */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 space-y-3 z-30">
        {Object.entries(TYPE_COLORS).map(([type, colors]) => (
          <div key={type} className={`px-4 py-3 rounded-2xl border backdrop-blur-xl ${colors.badge} min-w-[120px]`}>
            <p className="text-[7px] uppercase tracking-widest opacity-60 mb-1">{type}</p>
            <p className="text-2xl font-black font-mono">{counts[type] || 0}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
