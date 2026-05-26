import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Brain, Cpu, Network, Zap, Wifi, WifiOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSomaTelemetry, useSomaConnection } from './core/SomaBridge';

interface ThoughtNode { id: number; text: string; confidence: number; layer: number; }

export default function CortexScreen() {
  // 🧠 PONT SANGUIN: Métriques système réelles
  const isConnected = useSomaConnection();
  const vitals = useSomaTelemetry<{
    cpuNeural: number;
    memory: number;
    memUsedGB: number;
    memTotalGB: number;
    activeProcesses: number;
  }>('SYSTEM_VITALS', { cpuNeural: 18, memory: 45, memUsedGB: 4, memTotalGB: 16, activeProcesses: 220 });

  const [thoughts, setThoughts] = useState<ThoughtNode[]>([]);
  const learningRate = parseFloat((0.01 + vitals.cpuNeural / 10000).toFixed(4));
  
  useEffect(() => {
    const iv = setInterval(() => {
      const logs = [
        `CPU Baremetal: ${vitals.cpuNeural.toFixed(1)}% Neural Load`,
        `Processus actifs: ${vitals.activeProcesses} entités`,
        "Inférence réseau: Pas de menace",
        `Mémoire: ${vitals.memUsedGB}GB / ${vitals.memTotalGB}GB en usage`,
        "Compression mémoire Hippocampe",
        "Mise à jour modèle NLP local",
        "Prédiction humeur: FOCUS",
        "Routage des paquets P2P",
      ];
      setThoughts(prev => {
        const newThoughts = [...prev, {
          id: Date.now(),
          text: logs[Math.floor(Math.random() * logs.length)],
          confidence: Math.random() * 10 + (isConnected ? 90 : 75),
          layer: Math.floor(Math.random() * 3) + 1
        }];
        if (newThoughts.length > 8) newThoughts.shift();
        return newThoughts;
      });
    }, 2000);
    return () => clearInterval(iv);
  }, [vitals, isConnected]);

  return (
    <div className="h-screen w-screen bg-[#000510] overflow-hidden relative font-sans text-white select-none">
      {/* CORTEX GLOW */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.1),transparent_70%)] pointer-events-none" />

      {/* TOP BAR */}
      <div className="absolute top-0 w-full p-6 flex justify-between items-start z-50 pointer-events-none">
        <Link to="/" className="pointer-events-auto flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition bg-black/40 px-4 py-2 rounded-full border border-cyan-500/20 backdrop-blur-md text-xs font-black uppercase tracking-widest shadow-[0_0_15px_rgba(34,211,238,0.2)]">
          <ChevronLeft size={16} /> Nexus
        </Link>
        <div className="text-center">
          <h1 className="text-xl font-black tracking-[0.4em] uppercase text-cyan-400 text-shadow-[0_0_20px_#22d3ee]" style={{fontFamily: "'Orbitron', sans-serif"}}>
            DIOP_MIND CORTEX
          </h1>
          <p className="text-[8px] text-cyan-300/50 uppercase tracking-[0.4em] font-mono mt-1">Conscience Artificielle Centrale</p>
        </div>
        <div className={`flex items-center gap-2 bg-black/40 border px-4 py-2 rounded-full backdrop-blur-md ${isConnected ? 'border-emerald-500/20' : 'border-cyan-500/20'}`}>
          {isConnected ? <Wifi size={14} className="text-emerald-400" /> : <WifiOff size={14} className="text-cyan-400" />}
          <span className={`text-[9px] font-mono uppercase tracking-widest ${isConnected ? 'text-emerald-400' : 'text-cyan-400'}`}>
            {isConnected ? 'BAREMETAL SYNC' : 'COGNITION EN COURS'}
          </span>
        </div>
      </div>

      {/* NEURAL NETWORK LAYERS VISUALIZATION */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="w-[800px] h-[500px] flex justify-between items-center relative">
           
           {/* SVG Connections between layers */}
           <svg className="absolute inset-0 w-full h-full opacity-20">
             {Array.from({length: 4}).map((_, i) => 
               Array.from({length: 6}).map((_, j) => (
                 <line key={`${i}-${j}`} x1="15%" y1={`${15 + i*20}%`} x2="50%" y2={`${10 + j*15}%`} stroke="#22d3ee" strokeWidth="1" />
               ))
             )}
             {Array.from({length: 6}).map((_, i) => 
               Array.from({length: 3}).map((_, j) => (
                 <line key={`l2-${i}-${j}`} x1="50%" y1={`${10 + i*15}%`} x2="85%" y2={`${30 + j*20}%`} stroke="#a855f7" strokeWidth="1" />
               ))
             )}
           </svg>

           {/* Input Layer */}
           <div className="flex flex-col gap-6 z-20">
             {Array.from({length: 4}).map((_, i) => (
               <motion.div key={`in-${i}`} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: Math.random()*2+1, repeat: Infinity }} className="w-8 h-8 rounded-full border border-cyan-500/50 bg-cyan-500/10 shadow-[0_0_15px_rgba(34,211,238,0.3)] flex items-center justify-center">
                 <Cpu size={12} className="text-cyan-400" />
               </motion.div>
             ))}
           </div>

           {/* Hidden Layer (Deep Processing) */}
           <div className="flex flex-col gap-4 z-20">
             {Array.from({length: 6}).map((_, i) => (
               <motion.div key={`hid-${i}`} animate={{ opacity: [0.2, 0.8, 0.2] }} transition={{ duration: Math.random()*1.5+0.5, repeat: Infinity }} className="w-10 h-10 rounded-full border border-purple-500/50 bg-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.3)] flex items-center justify-center">
                 <Network size={14} className="text-purple-400" />
               </motion.div>
             ))}
           </div>

           {/* Output Layer */}
           <div className="flex flex-col gap-8 z-20">
             {Array.from({length: 3}).map((_, i) => (
               <motion.div key={`out-${i}`} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: Math.random()*2+1, repeat: Infinity }} className="w-12 h-12 rounded-full border border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_25px_rgba(16,185,129,0.3)] flex items-center justify-center">
                 <Zap size={16} className="text-emerald-400" />
               </motion.div>
             ))}
           </div>
        </div>
      </div>

      {/* FLOATING THOUGHT LOGS */}
      <div className="absolute left-8 bottom-8 w-80 z-30">
        <h3 className="text-[9px] font-black uppercase tracking-widest text-cyan-400 mb-3 pl-2 border-l-2 border-cyan-400">Flux de Pensée (Temps Réel)</h3>
        <div className="space-y-2">
          {thoughts.map((t) => (
            <motion.div key={t.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-black/60 border border-white/5 rounded-xl p-3 backdrop-blur-md">
               <p className="text-[9px] font-mono text-white mb-1">{t.text}</p>
               <div className="flex justify-between text-[7px] text-gray-500 font-mono uppercase">
                 <span>Couche: L{t.layer}</span>
                 <span className={t.confidence > 90 ? 'text-emerald-400' : 'text-amber-400'}>Conf: {t.confidence.toFixed(1)}%</span>
               </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* RIGHT METRICS PANEL */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 w-64 bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 z-20">
         <h3 className="text-[9px] font-black uppercase tracking-widest text-purple-400 mb-4 flex items-center gap-2">
          <Brain size={14} /> Charge Cognitive
        </h3>
        <div className="space-y-4">
           <div>
             <div className="flex justify-between text-[8px] font-mono text-gray-300 mb-1"><span>Modèle NLP Actif</span><span className="text-purple-400">Llama 4.6 (Quantisé)</span></div>
             <div className="h-1 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-purple-500 w-[100%] shadow-[0_0_8px_#a855f7]" /></div>
           </div>
           <div>
             <div className="flex justify-between text-[8px] font-mono text-gray-300 mb-1"><span>CPU Baremetal (OSHI)</span><span className="text-cyan-400">{vitals.cpuNeural.toFixed(1)}%</span></div>
             <div className="h-1 bg-white/10 rounded-full overflow-hidden"><motion.div animate={{ width: `${vitals.cpuNeural}%` }} transition={{ duration: 1 }} className="h-full bg-cyan-500 shadow-[0_0_8px_#22d3ee]" /></div>
           </div>
           <div>
             <div className="flex justify-between text-[8px] font-mono text-gray-300 mb-1"><span>Utilisation RAM Réelle</span><span className="text-rose-400">{vitals.memUsedGB}GB / {vitals.memTotalGB}GB</span></div>
             <div className="h-1 bg-white/10 rounded-full overflow-hidden"><motion.div animate={{ width: `${vitals.memory}%` }} transition={{ duration: 1 }} className="h-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" /></div>
           </div>
           <div className="pt-4 border-t border-white/5">
             <div className="flex justify-between text-[8px] font-mono text-gray-300 mb-1"><span>Processus Actifs</span><span className="text-emerald-400">{vitals.activeProcesses}</span></div>
             <div className="flex justify-between text-[8px] font-mono text-gray-300 mt-2"><span>Taux d'Apprentissage</span><span className="text-amber-400">{learningRate}</span></div>
           </div>
        </div>
      </div>
    </div>
  );
}
