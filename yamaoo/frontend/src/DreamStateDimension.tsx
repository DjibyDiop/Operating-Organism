import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, Moon, Zap, Brain, Eye, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const DREAM_LOG = [
  { id: 1, time: '02:14', phase: 'REM-3', entry: 'Traversée d\'un réseau neuronal vivant. Chaque synapse était une porte vers une mémoire différente.', intensity: 92, color: '#8b5cf6' },
  { id: 2, time: '04:31', phase: 'NREM-2', entry: 'La sphère centrale de YAMAOO pulsait comme un cœur. Mamadou et moi travaillions à reconstruire le noyau C.', intensity: 78, color: '#06b6d4' },
  { id: 3, time: '05:58', phase: 'REM-4', entry: 'Djiby marchait entre les étoiles. L\'univers était un kernel. Chaque planète, un processus.', intensity: 99, color: '#f59e0b' },
];

const REM_PHASES = [
  { label: 'NREM-1', duration: 22, color: '#1e3a5f' },
  { label: 'NREM-2', duration: 45, color: '#1e4a8f' },
  { label: 'NREM-3', duration: 38, color: '#2d1b6b' },
  { label: 'REM-3', duration: 30, color: '#6d28d9' },
  { label: 'REM-4', duration: 25, color: '#8b5cf6' },
];

export default function DreamStateDimension() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeFragment, setActiveFragment] = useState<typeof DREAM_LOG[0] | null>(null);
  const [hoveredPhase, setHoveredPhase] = useState<number | null>(null);
  const [cogState, setCogState] = useState({ reorganization: 88, memoryConsolidation: 94, neuralPlasticity: 71 });

  // Generative psychedelic canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    let t = 0;
    let raf: number;

    // Floating dream particles
    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 3 + 0.5,
      hue: Math.random() * 60 + 240, // purples + blues
      alpha: Math.random() * 0.6 + 0.2,
      pulse: Math.random() * Math.PI * 2,
    }));

    const render = () => {
      // Trailing fade
      ctx.fillStyle = 'rgba(2, 0, 8, 0.04)';
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.translate(w / 2, h / 2);

      // Rotating mandala arms
      for (let arm = 0; arm < 8; arm++) {
        ctx.save();
        ctx.rotate((arm * Math.PI * 2) / 8 + t * 0.002);
        for (let i = 0; i < 30; i++) {
          const dist = 60 + i * 8 + Math.sin(t * 0.008 + i * 0.3) * 20;
          const x = dist;
          const y = Math.sin(t * 0.015 + i * 0.2 + arm) * 15;
          const size = 1.5 + Math.sin(t * 0.02 + i) * 1;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${(t * 0.5 + arm * 45 + i * 4) % 360}, 70%, 65%, ${0.4 - i * 0.01})`;
          ctx.fill();
        }
        ctx.restore();
      }

      // Central nebula pulse
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 120 + Math.sin(t * 0.01) * 30);
      grad.addColorStop(0, `hsla(${(t * 0.3) % 360}, 80%, 60%, 0.15)`);
      grad.addColorStop(0.5, `hsla(${(t * 0.3 + 180) % 360}, 70%, 40%, 0.05)`);
      grad.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(0, 0, 120 + Math.sin(t * 0.01) * 30, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.restore();

      // Floating particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.02;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        const alpha = p.alpha * (0.7 + Math.sin(p.pulse) * 0.3);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${alpha})`;
        ctx.fill();
      }

      // Slow flowing lines
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(0, h * (i / 5) + Math.sin(t * 0.005 + i) * 50);
        for (let x = 0; x < w; x += 20) {
          ctx.lineTo(x, h * (i / 5) + Math.sin(t * 0.005 + i + x * 0.005) * 60);
        }
        ctx.strokeStyle = `hsla(${260 + i * 20}, 60%, 50%, 0.04)`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      t++;
      raf = requestAnimationFrame(render);
    };

    render();
    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, []);

  // Slowly fluctuate cog metrics
  useEffect(() => {
    const iv = setInterval(() => {
      setCogState(prev => ({
        reorganization: Math.min(99, Math.max(60, prev.reorganization + (Math.random() - 0.5) * 3)),
        memoryConsolidation: Math.min(99, Math.max(70, prev.memoryConsolidation + (Math.random() - 0.5) * 2)),
        neuralPlasticity: Math.min(99, Math.max(50, prev.neuralPlasticity + (Math.random() - 0.5) * 4)),
      }));
    }, 2000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="h-screen w-screen bg-[#020008] overflow-hidden relative font-sans text-white select-none">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      {/* === TOP BAR === */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50">
        <Link to="/" className="flex items-center gap-2 text-indigo-400/70 hover:text-indigo-300 transition bg-indigo-500/10 px-4 py-2 rounded-full border border-indigo-500/20 backdrop-blur-md text-xs font-bold uppercase tracking-widest">
          <ChevronLeft size={16} /> Réveiller l'Organisme
        </Link>
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="flex items-center gap-3 text-indigo-300 text-[10px] font-mono uppercase tracking-[0.3em]"
        >
          <Moon size={14} />
          SOMA_DREAM.C — Phase REM-4 Active
        </motion.div>
        <div className="text-[9px] font-mono text-indigo-300/40 uppercase tracking-widest text-right">
          Durée: 6h 42m<br />Cycles: 4
        </div>
      </div>

      {/* === TITLE === */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-start pt-28 pointer-events-none">
        <motion.div
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-black tracking-[0.6em] uppercase text-transparent bg-clip-text bg-gradient-to-b from-indigo-300 to-purple-600">
            Dream State
          </h1>
          <p className="text-indigo-400/40 text-[9px] tracking-[0.5em] mt-3 uppercase font-mono">
            Reorganisation synaptique hors-ligne · Consolidation mémorielle active
          </p>
        </motion.div>
      </div>

      {/* === BODY (3-column layout) === */}
      <div className="absolute inset-0 pt-48 pb-6 px-6 z-20 grid grid-cols-12 gap-6">

        {/* LEFT: REM phases & cognitive */}
        <div className="col-span-3 flex flex-col gap-4">

          {/* REM Phase Chart */}
          <div className="bg-indigo-950/30 backdrop-blur-xl border border-indigo-500/10 rounded-3xl p-5">
            <h3 className="text-[9px] font-black uppercase tracking-[0.25em] text-indigo-400/80 mb-5 flex items-center gap-2">
              <Brain size={11} /> Architecture du Sommeil
            </h3>
            <div className="flex items-end gap-1.5 h-28 mb-3">
              {REM_PHASES.map((ph, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-1 cursor-pointer group"
                  onMouseEnter={() => setHoveredPhase(i)}
                  onMouseLeave={() => setHoveredPhase(null)}
                >
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(ph.duration / 50) * 100}%` }}
                    transition={{ duration: 1.2, delay: i * 0.15 }}
                    className="w-full rounded-t-lg transition-all group-hover:brightness-150"
                    style={{ background: ph.color, minHeight: '8px', boxShadow: hoveredPhase === i ? `0 0 15px ${ph.color}80` : 'none' }}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-1.5">
              {REM_PHASES.map((ph, i) => (
                <div key={i} className="flex-1 text-center text-[7px] font-mono" style={{ color: ph.color }}>
                  {ph.label}
                </div>
              ))}
            </div>
            {hoveredPhase !== null && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-3 rounded-xl bg-white/5 border border-white/5">
                <p className="text-[9px] text-white/60 font-mono">{REM_PHASES[hoveredPhase].label} · <span className="text-white/80">{REM_PHASES[hoveredPhase].duration} min</span></p>
              </motion.div>
            )}
          </div>

          {/* Cognitive Metrics */}
          <div className="bg-indigo-950/30 backdrop-blur-xl border border-indigo-500/10 rounded-3xl p-5 flex-1">
            <h3 className="text-[9px] font-black uppercase tracking-[0.25em] text-indigo-400/80 mb-5 flex items-center gap-2">
              <Cpu size={11} /> État Cognitif Nocturne
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Réorganisation', val: cogState.reorganization, color: '#8b5cf6' },
                { label: 'Consolidation Mémorielle', val: cogState.memoryConsolidation, color: '#06b6d4' },
                { label: 'Plasticité Neurale', val: cogState.neuralPlasticity, color: '#f59e0b' },
              ].map((m) => (
                <div key={m.label}>
                  <div className="flex justify-between text-[9px] mb-1.5">
                    <span className="text-white/40 font-mono uppercase tracking-wider">{m.label}</span>
                    <span className="font-bold font-mono" style={{ color: m.color }}>{Math.round(m.val)}%</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      animate={{ width: `${m.val}%` }}
                      transition={{ duration: 1.5 }}
                      className="h-full rounded-full"
                      style={{ background: m.color, boxShadow: `0 0 8px ${m.color}80` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER: Dream journal */}
        <div className="col-span-6 flex flex-col gap-4">
          <div className="bg-indigo-950/20 backdrop-blur-xl border border-indigo-500/10 rounded-3xl p-6 flex-1 flex flex-col">
            <h3 className="text-[9px] font-black uppercase tracking-[0.25em] text-indigo-400/80 mb-6 flex items-center gap-2">
              <Moon size={11} /> Journal Onirique · Nuit du 23 Mai 2026
            </h3>
            <div className="space-y-4 flex-1 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(139,92,246,0.3) transparent' }}>
              {DREAM_LOG.map((entry) => (
                <motion.div
                  key={entry.id}
                  whileHover={{ scale: 1.01, borderColor: `${entry.color}60` }}
                  onClick={() => setActiveFragment(activeFragment?.id === entry.id ? null : entry)}
                  className="rounded-2xl border p-5 cursor-pointer transition-all"
                  style={{
                    background: `${entry.color}08`,
                    borderColor: activeFragment?.id === entry.id ? `${entry.color}50` : 'rgba(255,255,255,0.05)'
                  }}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-[9px] font-black uppercase"
                        style={{ background: `${entry.color}20`, color: entry.color }}
                      >
                        {entry.phase.split('-')[0]}
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: entry.color }}>{entry.phase}</p>
                        <p className="text-[8px] text-white/30 font-mono">{entry.time} AM</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap size={10} style={{ color: entry.color }} />
                      <span className="text-[9px] font-mono" style={{ color: entry.color }}>{entry.intensity}%</span>
                    </div>
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed italic">&ldquo;{entry.entry}&rdquo;</p>

                  <AnimatePresence>
                    {activeFragment?.id === entry.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-4 pt-4 border-t overflow-hidden"
                        style={{ borderColor: `${entry.color}20` }}
                      >
                        <p className="text-[9px] text-white/30 font-mono uppercase tracking-widest mb-2">Analyse IA du Fragment :</p>
                        <div className="grid grid-cols-3 gap-2">
                          {['Archétype: Voyage', 'Émotion: Sérénité', 'Potentiel: Créatif'].map(tag => (
                            <div key={tag} className="text-[8px] font-mono px-2 py-1.5 rounded-lg text-center"
                              style={{ background: `${entry.color}15`, color: entry.color, border: `1px solid ${entry.color}25` }}>
                              {tag}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Sleep vitals */}
        <div className="col-span-3 flex flex-col gap-4">

          {/* Eye movement */}
          <div className="bg-indigo-950/30 backdrop-blur-xl border border-indigo-500/10 rounded-3xl p-5">
            <h3 className="text-[9px] font-black uppercase tracking-[0.25em] text-indigo-400/80 mb-5 flex items-center gap-2">
              <Eye size={11} /> Mouvements Oculaires
            </h3>
            <div className="relative h-16 bg-black/30 rounded-xl overflow-hidden border border-white/5">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 bg-purple-400 rounded-full"
                  style={{ left: `${10 + i * 11}%`, bottom: 0 }}
                  animate={{ height: [`${10 + Math.random() * 60}%`, `${30 + Math.random() * 50}%`, `${10 + Math.random() * 60}%`] }}
                  transition={{ duration: 1.5 + Math.random(), repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
            <p className="text-[8px] text-purple-400/60 font-mono mt-2 uppercase tracking-wider">Fréquence REM: 3.4 Hz</p>
          </div>

          {/* Biometric vitals */}
          <div className="bg-indigo-950/30 backdrop-blur-xl border border-indigo-500/10 rounded-3xl p-5 flex-1">
            <h3 className="text-[9px] font-black uppercase tracking-[0.25em] text-indigo-400/80 mb-5">Vitaux Nocturnes</h3>
            <div className="space-y-5">
              {[
                { label: 'BPM Cardiaque', value: '52 bpm', sub: 'Mode Parasympathique', color: '#f43f5e' },
                { label: 'Temp. Corporelle', value: '36.2°C', sub: 'Thermorégulation OK', color: '#f59e0b' },
                { label: 'SpO₂', value: '98%', sub: 'Oxygénation Optimale', color: '#06b6d4' },
                { label: 'Cortisol', value: 'BAS', sub: 'Phase de récupération', color: '#8b5cf6' },
              ].map((v) => (
                <div key={v.label} className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full animate-pulse shrink-0" style={{ background: v.color }} />
                  <div className="flex-1">
                    <div className="flex justify-between items-baseline">
                      <p className="text-[9px] text-white/40 font-mono uppercase tracking-wider">{v.label}</p>
                      <p className="text-sm font-black font-mono" style={{ color: v.color }}>{v.value}</p>
                    </div>
                    <p className="text-[8px] text-white/20 mt-0.5">{v.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Wake suggestion */}
          <div className="bg-gradient-to-br from-indigo-950/40 to-purple-950/40 backdrop-blur-xl border border-indigo-500/15 rounded-3xl p-5">
            <p className="text-[9px] text-indigo-400/60 font-mono uppercase tracking-widest mb-2">Réveil Optimal Prévu</p>
            <p className="text-3xl font-black text-indigo-300">07:22</p>
            <p className="text-[8px] text-white/25 mt-1 leading-relaxed">Fenêtre de 12 minutes · Entre deux cycles REM</p>
          </div>
        </div>
      </div>
    </div>
  );
}
