import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Zap, Orbit, Layers, SlidersHorizontal, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SynapseConnection { id: string; from: string; to: string; strength: number; active: boolean; }

export default function NeuroForgeScreen() {
  const [modules, setModules] = useState([
    { id: 'm_vision', label: 'Vision Engine (GPU)', x: 20, y: 30, color: '#06b6d4' },
    { id: 'm_audio', label: 'Audio Synthesis', x: 20, y: 70, color: '#10b981' },
    { id: 'm_core', label: 'Soma Core (CPU)', x: 50, y: 50, color: '#a855f7' },
    { id: 'm_memory', label: 'Hippocampus (RAM)', x: 80, y: 30, color: '#f59e0b' },
    { id: 'm_net', label: 'Swarm Mesh', x: 80, y: 70, color: '#f43f5e' },
  ]);

  const [synapses, setSynapses] = useState<SynapseConnection[]>([
    { id: 's1', from: 'm_vision', to: 'm_core', strength: 80, active: true },
    { id: 's2', from: 'm_audio', to: 'm_core', strength: 60, active: true },
    { id: 's3', from: 'm_core', to: 'm_memory', strength: 95, active: true },
    { id: 's4', from: 'm_core', to: 'm_net', strength: 40, active: false },
    { id: 's5', from: 'm_vision', to: 'm_audio', strength: 10, active: false }, // Synesthesia link
  ]);

  const [selectedSynapse, setSelectedSynapse] = useState<SynapseConnection | null>(null);

  // Auto-pulse active synapses
  useEffect(() => {
    const iv = setInterval(() => {
      setSynapses(prev => prev.map(s => s.active ? { ...s, strength: Math.min(100, Math.max(10, s.strength + (Math.random()-0.5)*5)) } : s));
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  const toggleSynapse = (id: string) => {
    setSynapses(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const getModule = (id: string) => modules.find(m => m.id === id);

  return (
    <div className="h-screen w-screen bg-[#05010a] overflow-hidden relative font-sans text-white select-none">
      {/* GLOW BACKGROUND */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.08),transparent)] pointer-events-none" />
      
      {/* TOP BAR */}
      <div className="absolute top-0 w-full p-6 flex justify-between items-start z-50 pointer-events-none">
        <Link to="/" className="pointer-events-auto flex items-center gap-2 text-fuchsia-400 hover:text-fuchsia-300 transition bg-black/40 px-4 py-2 rounded-full border border-fuchsia-500/20 backdrop-blur-md text-xs font-black uppercase tracking-widest shadow-[0_0_15px_rgba(217,70,239,0.2)]">
          <ChevronLeft size={16} /> Nexus
        </Link>
        <div className="text-center">
          <h1 className="text-xl font-black tracking-[0.4em] uppercase text-fuchsia-400 text-shadow-[0_0_20px_#d946ef]" style={{fontFamily: "'Orbitron', sans-serif"}}>
            Neuro-Forge
          </h1>
          <p className="text-[8px] text-fuchsia-300/50 uppercase tracking-[0.4em] font-mono mt-1">Éditeur de Plasticité Système</p>
        </div>
        <div className="flex items-center gap-2 bg-black/40 border border-white/5 px-4 py-2 rounded-full backdrop-blur-md">
          <Orbit size={14} className="text-fuchsia-400 animate-spin-slow" />
          <span className="text-[9px] font-mono text-fuchsia-400 uppercase tracking-widest">PLASTICITÉ DÉVERROUILLÉE</span>
        </div>
      </div>

      {/* SYNAPTIC CANVAS */}
      <div className="absolute inset-0 z-10">
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          {synapses.map(s => {
            const m1 = getModule(s.from);
            const m2 = getModule(s.to);
            if(!m1 || !m2) return null;
            return (
              <g key={s.id} className="pointer-events-auto cursor-pointer" onClick={() => setSelectedSynapse(s)}>
                {/* Hit area for clicking */}
                <line x1={`${m1.x}%`} y1={`${m1.y}%`} x2={`${m2.x}%`} y2={`${m2.y}%`} stroke="transparent" strokeWidth="20" />
                {/* Visual Line */}
                <line x1={`${m1.x}%`} y1={`${m1.y}%`} x2={`${m2.x}%`} y2={`${m2.y}%`} 
                  stroke={s.active ? (selectedSynapse?.id === s.id ? '#d946ef' : '#a855f7') : 'rgba(255,255,255,0.05)'} 
                  strokeWidth={s.active ? (s.strength / 20) + 1 : 1} 
                  filter="url(#glow)"
                  strokeDasharray={s.active ? 'none' : '4 4'}
                  style={{ transition: 'stroke-width 0.3s' }}
                />
                {s.active && (
                   <circle cx={`${(m1.x + m2.x)/2}%`} cy={`${(m1.y + m2.y)/2}%`} r="3" fill="#fff" filter="url(#glow)">
                     <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
                   </circle>
                )}
              </g>
            );
          })}
        </svg>

        {modules.map(m => (
          <motion.div key={m.id}
            drag dragMomentum={false}
            onDrag={(_, info) => {
              setModules(prev => prev.map(mod => mod.id === m.id ? { ...mod, x: mod.x + (info.delta.x / window.innerWidth) * 100, y: mod.y + (info.delta.y / window.innerHeight) * 100 } : mod));
            }}
            className="absolute flex flex-col items-center cursor-grab active:cursor-grabbing"
            style={{ left: `${m.x}%`, top: `${m.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            <div className="w-16 h-16 rounded-3xl border border-white/20 bg-black/60 backdrop-blur-xl flex items-center justify-center shadow-2xl transition-colors hover:border-fuchsia-400/50 relative overflow-hidden" style={{ boxShadow: `0 0 30px ${m.color}20` }}>
              <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(circle at top left, ${m.color}, transparent)` }} />
              <Layers size={24} color={m.color} />
            </div>
            <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-center" style={{ color: m.color }}>{m.label}</p>
          </motion.div>
        ))}
      </div>

      {/* INSPECTOR & CONTROLS */}
      <AnimatePresence>
        {selectedSynapse && (
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}
            className="absolute right-8 top-1/2 -translate-y-1/2 w-80 bg-black/80 backdrop-blur-2xl border border-fuchsia-500/20 rounded-3xl p-6 z-50 shadow-[0_0_50px_rgba(0,0,0,0.8)]"
          >
            <h3 className="text-[9px] font-black uppercase tracking-widest text-fuchsia-400 mb-6 flex items-center gap-2">
              <SlidersHorizontal size={14} /> Pont Synaptique
            </h3>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
               <p className="text-[8px] font-mono text-gray-500 mb-1">Connexion</p>
               <p className="text-xs font-bold text-white">{getModule(selectedSynapse.from)?.label} <span className="text-fuchsia-400 mx-2">↔</span> {getModule(selectedSynapse.to)?.label}</p>
            </div>

            <div className="space-y-6">
               <div>
                 <div className="flex justify-between text-[10px] font-mono text-gray-300 mb-2">
                   <span>Bande Passante (Poids)</span>
                   <span className="text-fuchsia-400">{Math.round(selectedSynapse.strength)}%</span>
                 </div>
                 <input type="range" min="1" max="100" value={selectedSynapse.strength} 
                   onChange={(e) => setSynapses(prev => prev.map(s => s.id === selectedSynapse.id ? { ...s, strength: parseInt(e.target.value) } : s))}
                   className="w-full accent-fuchsia-500" disabled={!selectedSynapse.active} />
               </div>

               <div className="pt-4 border-t border-white/5">
                 <p className="text-[10px] text-gray-400 leading-relaxed italic mb-4">
                   {selectedSynapse.id === 's5' ? "Lien de Synesthésie : Permet à l'audio de réagir aux changements de couleurs de la vision." : "Lien structurel standard."}
                 </p>
                 <button 
                   onClick={() => toggleSynapse(selectedSynapse.id)}
                   className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${selectedSynapse.active ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'}`}
                 >
                   {selectedSynapse.active ? 'Désactiver le Pont' : 'Forger la Synapse'}
                 </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
