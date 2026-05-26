import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Activity, Heart, Droplet, Wind, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HealthCareScreen() {
  const [bpm, setBpm] = useState(72);
  const [stress, setStress] = useState(15);
  const [oxygen, setOxygen] = useState(98);

  useEffect(() => {
    const iv = setInterval(() => {
      setBpm(prev => Math.min(180, Math.max(50, prev + (Math.random() - 0.5) * 4)));
      setStress(prev => Math.min(100, Math.max(0, prev + (Math.random() - 0.5) * 2)));
      setOxygen(prev => Math.min(100, Math.max(90, prev + (Math.random() - 0.2) * 1)));
    }, 1500);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="h-screen w-screen bg-[#020503] overflow-hidden relative font-sans text-white select-none">
      {/* BIO-RESONANCE GLOW */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05),transparent_60%)] pointer-events-none" />

      {/* TOP BAR */}
      <div className="absolute top-0 w-full p-6 flex justify-between items-start z-50 pointer-events-none">
        <Link to="/" className="pointer-events-auto flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition bg-black/40 px-4 py-2 rounded-full border border-emerald-500/20 backdrop-blur-md text-xs font-black uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          <ChevronLeft size={16} /> Nexus
        </Link>
        <div className="text-center">
          <h1 className="text-xl font-black tracking-[0.4em] uppercase text-emerald-400 text-shadow-[0_0_20px_#10b981]" style={{fontFamily: "'Orbitron', sans-serif"}}>
            BIO-RESONANCE
          </h1>
          <p className="text-[8px] text-emerald-300/50 uppercase tracking-[0.4em] font-mono mt-1">Liaison Somatique Humaine</p>
        </div>
        <div className="flex items-center gap-2 bg-black/40 border border-white/5 px-4 py-2 rounded-full backdrop-blur-md">
          <Activity size={14} className="text-emerald-400 animate-pulse" />
          <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest">SENSEURS ACTIFS</span>
        </div>
      </div>

      {/* CENTRAL BODY HOLOGRAM */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
        
        <div className="relative w-80 h-[500px] flex items-center justify-center">
          {/* Abstract Body Aura */}
          <motion.div 
            animate={{ 
              scale: [1, 1.05 + (bpm/300), 1], 
              opacity: [0.1, 0.3, 0.1] 
            }} 
            transition={{ duration: 60/bpm, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-gradient-to-t from-emerald-500/0 via-emerald-500/20 to-emerald-500/0 blur-3xl rounded-full"
          />

          {/* Central Nervous System (Spine) */}
          <div className="absolute top-1/4 bottom-1/4 w-1 bg-gradient-to-b from-purple-500/50 via-emerald-400/80 to-blue-500/50 rounded-full shadow-[0_0_15px_#10b981]">
            {Array.from({length: 12}).map((_, i) => (
              <motion.div key={i} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 2, delay: i*0.1, repeat: Infinity }} className="w-8 h-1 -translate-x-[14px] bg-emerald-400/30 rounded-full mt-6" />
            ))}
          </div>

          {/* Heart Node */}
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }} 
            transition={{ duration: 60/bpm, repeat: Infinity }}
            className="absolute top-[40%] w-12 h-12 rounded-full border border-rose-500/50 flex items-center justify-center bg-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.4)]"
          >
            <Heart size={20} className="text-rose-400" />
          </motion.div>

          {/* Brain Node */}
          <div className="absolute top-[15%] w-16 h-16 rounded-full border border-purple-500/50 flex items-center justify-center bg-purple-500/10 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
            <Brain size={24} className="text-purple-400" />
            {stress > 60 && <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="absolute inset-0 border-2 border-dashed border-rose-500 rounded-full" />}
          </div>
        </div>

      </div>

      {/* LEFT METRICS (VITALS) */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 w-64 space-y-6 z-20">
        <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-5 relative overflow-hidden">
           <div className="absolute right-0 top-0 w-16 h-full bg-rose-500/10 blur-xl" />
           <p className="text-[8px] font-mono text-gray-400 uppercase tracking-widest mb-1">Rythme Cardiaque</p>
           <div className="flex items-end gap-3">
             <span className="text-4xl font-black font-mono text-rose-400 text-shadow-[0_0_15px_#f43f5e]">{Math.round(bpm)}</span>
             <span className="text-xs text-rose-500/50 font-bold pb-1">BPM</span>
           </div>
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-5 relative overflow-hidden">
           <div className="absolute right-0 top-0 w-16 h-full bg-cyan-500/10 blur-xl" />
           <p className="text-[8px] font-mono text-gray-400 uppercase tracking-widest mb-1">Saturation O2</p>
           <div className="flex items-end gap-3">
             <span className="text-4xl font-black font-mono text-cyan-400 text-shadow-[0_0_15px_#22d3ee]">{Math.round(oxygen)}</span>
             <span className="text-xs text-cyan-500/50 font-bold pb-1">%</span>
           </div>
        </div>
      </div>

      {/* RIGHT METRICS (COGNITIVE & FLUIDS) */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 w-64 space-y-6 z-20">
        <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-5">
           <p className="text-[8px] font-mono text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Wind size={12}/> Charge Cortisol (Stress)</p>
           <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
             <motion.div animate={{ width: `${stress}%` }} transition={{ duration: 1 }} className={`h-full ${stress > 60 ? 'bg-rose-500 shadow-[0_0_10px_#f43f5e]' : 'bg-emerald-500 shadow-[0_0_10px_#10b981]'}`} />
           </div>
           <p className="text-[9px] font-mono text-right mt-2 text-gray-500">{Math.round(stress)}%</p>
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-5">
           <p className="text-[8px] font-mono text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Droplet size={12}/> Hydratation Tissulaire</p>
           <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
             <motion.div className="h-full bg-blue-500 w-[65%] shadow-[0_0_10px_#3b82f6]" />
           </div>
           <p className="text-[9px] font-mono text-right mt-2 text-gray-500">OPTIMAL</p>
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-emerald-500/20 rounded-3xl p-5">
           <p className="text-[8px] font-black uppercase tracking-widest text-emerald-400 mb-2">Recommandation IA</p>
           <p className="text-[10px] text-gray-300 italic leading-relaxed">
             {stress > 60 
               ? "Niveau de cortisol détecté au-dessus de la norme. Activation de la Dimension DreamState ou Audio Binaural suggérée." 
               : "Les paramètres somatiques sont en parfaite symbiose avec l'environnement."}
           </p>
        </div>
      </div>
    </div>
  );
}
