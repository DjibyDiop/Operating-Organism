import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ScanEye, Mic, Activity, Radar, Fingerprint } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HomeScreen() {
  const [ambientAudio, setAmbientAudio] = useState<number[]>(new Array(20).fill(10));
  const [presenceScan, setPresenceScan] = useState(0);

  // Simulation du capteur audio ambiant
  useEffect(() => {
    const iv = setInterval(() => {
      setAmbientAudio(prev => {
        const newArr = [...prev.slice(1)];
        // Bruit de fond aléatoire avec parfois des pics (voix)
        const peak = Math.random() > 0.8 ? Math.random() * 80 + 20 : Math.random() * 20;
        newArr.push(peak);
        return newArr;
      });
    }, 150);
    return () => clearInterval(iv);
  }, []);

  // Simulation du radar de présence
  useEffect(() => {
    const iv = setInterval(() => setPresenceScan(p => (p + 5) % 360), 50);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="h-screen w-screen bg-[#020005] overflow-hidden relative font-sans text-white select-none">
      {/* OCULUS GLOW BACKGROUND */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.08),transparent_60%)] pointer-events-none" />

      {/* TOP BAR */}
      <div className="absolute top-0 w-full p-6 flex justify-between items-start z-50 pointer-events-none">
        <Link to="/" className="pointer-events-auto flex items-center gap-2 text-amber-500 hover:text-amber-400 transition bg-black/40 px-4 py-2 rounded-full border border-amber-500/20 backdrop-blur-md text-xs font-black uppercase tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.2)]">
          <ChevronLeft size={16} /> Nexus
        </Link>
        <div className="text-center">
          <h1 className="text-xl font-black tracking-[0.4em] uppercase text-amber-500 text-shadow-[0_0_20px_#f59e0b]" style={{fontFamily: "'Orbitron', sans-serif"}}>
            HOME
          </h1>
          <p className="text-[8px] text-amber-300/50 uppercase tracking-[0.4em] font-mono mt-1">L'Œil de l'Organisme (Oculus)</p>
        </div>
        <div className="flex items-center gap-3 bg-black/40 border border-white/5 px-4 py-2 rounded-full backdrop-blur-md">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[8px] font-mono text-gray-400">CAM</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[8px] font-mono text-gray-400">MIC</span>
          </div>
        </div>
      </div>

      {/* CENTER IRIS / PRESENCE RADAR */}
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
         <div className="relative w-[500px] h-[500px] flex items-center justify-center">
            {/* Radar Grid */}
            <div className="absolute inset-0 rounded-full border border-amber-500/10" />
            <div className="absolute inset-10 rounded-full border border-amber-500/20 border-dashed" />
            <div className="absolute inset-24 rounded-full border border-amber-500/10" />
            
            {/* Radar Scanner Line */}
            <motion.div 
              className="absolute w-1/2 h-[1px] bg-gradient-to-r from-transparent to-amber-500/80 origin-left top-1/2 left-1/2"
              style={{ rotate: presenceScan }}
            />
            {/* Radar Scan Gradient */}
            <motion.div 
              className="absolute w-[250px] h-[250px] origin-bottom-right bottom-1/2 right-1/2"
              style={{ 
                rotate: presenceScan,
                background: 'conic-gradient(from 180deg at 100% 100%, transparent 0deg, rgba(245,158,11,0.15) 90deg)'
              }}
            />

            {/* Simulated Human Presence */}
            <motion.div 
              animate={{ opacity: [0.2, 0.8, 0.2] }} 
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute top-[30%] left-[60%] w-6 h-6 rounded-full bg-amber-500/30 flex items-center justify-center shadow-[0_0_20px_#f59e0b]"
            >
               <Fingerprint size={14} className="text-amber-400" />
            </motion.div>

            {/* Core Pupil */}
            <div className="w-32 h-32 bg-black rounded-full z-20 border-2 border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.3)] flex flex-col items-center justify-center relative overflow-hidden">
               <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity }} className="absolute inset-0 bg-amber-500/10 rounded-full" />
               <ScanEye size={32} className="text-amber-500 mb-1" />
               <span className="text-[8px] font-mono text-amber-400 uppercase tracking-widest">Tracking</span>
            </div>
         </div>
      </div>

      {/* LEFT PANEL: AUDIO SPECTRUM */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 w-64 bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 z-20">
        <h3 className="text-[9px] font-black uppercase tracking-widest text-amber-500 mb-4 flex items-center gap-2">
          <Mic size={14} /> Spectre Vocal (Ambiance)
        </h3>
        <div className="h-24 flex items-end justify-between gap-1 border-b border-white/5 pb-2">
          {ambientAudio.map((val, i) => (
             <motion.div key={i} animate={{ height: `${val}%` }} transition={{ type: 'tween', duration: 0.15 }}
               className="flex-1 bg-amber-500/60 rounded-t-sm" style={{ filter: `drop-shadow(0 0 5px rgba(245,158,11,0.5))` }}
             />
          ))}
        </div>
        <div className="mt-4 space-y-2 text-[9px] font-mono text-gray-400">
           <div className="flex justify-between"><span>Niveau Sonore</span><span className="text-amber-400">{Math.round(ambientAudio[ambientAudio.length-1])} dB</span></div>
           <div className="flex justify-between"><span>Analyse Vocale</span><span className="text-emerald-400">Voix Détectée (Djiby)</span></div>
           <div className="flex justify-between"><span>Sentiment IA</span><span className="text-purple-400">Calme / Concentré</span></div>
        </div>
      </div>

      {/* RIGHT PANEL: CONTEXT VECTORS */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 w-64 bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 z-20">
        <h3 className="text-[9px] font-black uppercase tracking-widest text-amber-500 mb-4 flex items-center gap-2">
          <Activity size={14} /> Vecteurs de Contexte
        </h3>
        <p className="text-[8px] text-gray-500 leading-relaxed italic mb-4">
          "Voici comment l'Organisme te perçoit actuellement."
        </p>
        <div className="space-y-4">
           <div>
             <div className="flex justify-between text-[8px] font-mono text-gray-300 mb-1"><span>Attention Visuelle (Focus)</span><span className="text-amber-400">85%</span></div>
             <div className="h-1 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-amber-500 w-[85%] shadow-[0_0_8px_#f59e0b]" /></div>
           </div>
           <div>
             <div className="flex justify-between text-[8px] font-mono text-gray-300 mb-1"><span>Température Pièce</span><span className="text-cyan-400">22.4°C</span></div>
             <div className="h-1 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-cyan-400 w-[45%] shadow-[0_0_8px_#22d3ee]" /></div>
           </div>
           <div>
             <div className="flex justify-between text-[8px] font-mono text-gray-300 mb-1"><span>Rythme Biométrique (Montre)</span><span className="text-rose-400">72 BPM</span></div>
             <div className="h-1 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-rose-500 w-[60%] shadow-[0_0_8px_#f43f5e]" /></div>
           </div>
        </div>
      </div>
    </div>
  );
}
