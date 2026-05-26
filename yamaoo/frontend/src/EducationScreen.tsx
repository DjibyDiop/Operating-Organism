import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Zap, Orbit, TriangleAlert, MoveDown } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EducationScreen() {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeMatrix, setActiveMatrix] = useState('PHYSIQUE QUANTIQUE');

  const matrices = ['PHYSIQUE QUANTIQUE', 'PROGRAMMATION RUST', 'HISTOIRE GLOBALE', 'NEURO-ANATOMIE'];

  useEffect(() => {
    if (downloading) {
      const iv = setInterval(() => {
        setProgress(p => {
          if (p >= 100) { clearInterval(iv); setDownloading(false); return 100; }
          return p + 0.5;
        });
      }, 50);
      return () => clearInterval(iv);
    }
  }, [downloading]);

  return (
    <div className="h-screen w-screen bg-[#010103] overflow-hidden relative font-sans text-white select-none">
      
      {/* MATRIX TUNNEL EFFECT */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none perspective-[1000px]">
        {downloading && Array.from({length: 20}).map((_, i) => (
          <motion.div
            key={i}
            initial={{ translateZ: -1000, opacity: 0 }}
            animate={{ translateZ: 1000, opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.1, ease: 'linear' }}
            className="absolute border border-blue-500/20"
            style={{ width: `${100 + i*50}px`, height: `${100 + i*50}px` }}
          />
        ))}
      </div>

      {/* TOP BAR */}
      <div className="absolute top-0 w-full p-6 flex justify-between items-start z-50 pointer-events-none">
        <Link to="/" className="pointer-events-auto flex items-center gap-2 text-blue-400 hover:text-blue-300 transition bg-black/40 px-4 py-2 rounded-full border border-blue-500/20 backdrop-blur-md text-xs font-black uppercase tracking-widest shadow-[0_0_15px_rgba(59,130,246,0.2)]">
          <ChevronLeft size={16} /> Nexus
        </Link>
        <div className="text-center">
          <h1 className="text-xl font-black tracking-[0.4em] uppercase text-blue-400 text-shadow-[0_0_20px_#3b82f6]" style={{fontFamily: "'Orbitron', sans-serif"}}>
            KNOWLEDGE MATRIX
          </h1>
          <p className="text-[8px] text-blue-300/50 uppercase tracking-[0.4em] font-mono mt-1">Téléchargement Synaptique</p>
        </div>
        <div className="flex items-center gap-2 bg-black/40 border border-white/5 px-4 py-2 rounded-full backdrop-blur-md">
          <Orbit size={14} className="text-blue-400 animate-spin-slow" />
          <span className="text-[9px] font-mono text-blue-400 uppercase tracking-widest">NEURAL LINK OK</span>
        </div>
      </div>

      {/* CENTER HUD */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        {!downloading ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6 border-b border-white/10 pb-2">Sélectionnez le module d'apprentissage</h2>
            <div className="flex flex-wrap justify-center gap-4 max-w-2xl">
              {matrices.map(m => (
                <button 
                  key={m} 
                  onClick={() => { setActiveMatrix(m); setProgress(0); setDownloading(true); }}
                  className="px-6 py-4 bg-black/40 border border-blue-500/20 rounded-2xl hover:bg-blue-500/10 hover:border-blue-400/50 transition-all group backdrop-blur-xl"
                >
                  <p className="text-xs font-black uppercase tracking-widest text-blue-300 group-hover:text-blue-200">{m}</p>
                  <p className="text-[8px] font-mono text-gray-500 mt-2">Poids Estimé: ~14.2 TB</p>
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center bg-black/60 backdrop-blur-2xl p-12 rounded-full border border-blue-500/30 shadow-[0_0_50px_rgba(59,130,246,0.2)]">
            <MoveDown size={48} className="text-blue-400 animate-bounce mb-6" />
            <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-2 text-shadow-[0_0_15px_#3b82f6]">{activeMatrix}</h2>
            <p className="text-[10px] font-mono text-blue-400 uppercase tracking-[0.3em] mb-8 animate-pulse">Injection Corticale en Cours...</p>
            
            {/* Circular Progress */}
            <div className="relative w-48 h-48 flex items-center justify-center mb-6">
              <svg className="absolute inset-0 w-full h-full rotate-[-90deg]">
                <circle cx="96" cy="96" r="90" stroke="rgba(59,130,246,0.1)" strokeWidth="4" fill="transparent" />
                <circle cx="96" cy="96" r="90" stroke="#3b82f6" strokeWidth="4" fill="transparent" strokeDasharray="565.48" strokeDashoffset={565.48 - (565.48 * progress) / 100} style={{ transition: 'stroke-dashoffset 0.1s linear' }} />
              </svg>
              <span className="text-3xl font-black font-mono text-blue-300">{Math.floor(progress)}%</span>
            </div>

            <p className="text-[8px] text-gray-500 font-mono">NE PAS DÉCONNECTER LE LIEN NEURAL</p>
          </motion.div>
        )}
      </div>

      {/* WARNINGS */}
      {downloading && (
        <div className="absolute bottom-8 right-8 bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-start gap-3 backdrop-blur-md max-w-xs">
           <TriangleAlert size={16} className="text-rose-400 shrink-0" />
           <div>
             <p className="text-[9px] font-black uppercase text-rose-400 tracking-widest mb-1">Avertissement Biologique</p>
             <p className="text-[8px] text-rose-200/70 leading-relaxed font-mono">L'injection de plus de 10TB par minute peut causer des nausées virtuelles. Respirez profondément.</p>
           </div>
        </div>
      )}
    </div>
  );
}
