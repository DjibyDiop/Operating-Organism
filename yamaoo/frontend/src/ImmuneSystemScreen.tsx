import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ShieldAlert, Bug, ShieldCheck, Activity, Target, Wifi, WifiOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSomaTelemetry, useSomaConnection } from './core/SomaBridge';

export default function ImmuneSystemScreen() {
  // 🩸 PONT SANGUIN: Données réelles du backend Java via SomaBridge
  const isConnected = useSomaConnection();
  const phageData = useSomaTelemetry<{threats: {pid:number, name:string, cpuPct:number}[]}>(
    'PHAGE_ALERTS', { threats: [] }
  );

  const [threats, setThreats] = useState<{id:number, name:string, severity:number, status:'HUNTING'|'QUARANTINED'|'DESTROYED', x:number, y:number}[]>([
    { id: 1, name: 'Anomalie Memoire 0xFA4', severity: 85, status: 'HUNTING', x: 20, y: 30 },
    { id: 2, name: 'P2P Ping Inconnu', severity: 40, status: 'QUARANTINED', x: 70, y: 60 },
  ]);
  const [phages, setPhages] = useState<{id:number, x:number, y:number}[]>([
    { id: 1, x: 50, y: 50 }, { id: 2, x: 40, y: 60 }, { id: 3, x: 60, y: 40 }
  ]);

  // 🧬 Quand le backend envoie de vraies alertes, on les intègre
  useEffect(() => {
    if (!isConnected || phageData.threats.length === 0) return;
    const liveThreat = phageData.threats[0];
    setThreats(prev => {
      const exists = prev.find(t => t.id === liveThreat.pid);
      if (exists) return prev;
      return [...prev.filter(t => t.status !== 'DESTROYED').slice(-3), {
        id: liveThreat.pid,
        name: liveThreat.name,
        severity: Math.round(liveThreat.cpuPct),
        status: liveThreat.cpuPct > 5 ? 'HUNTING' : 'QUARANTINED',
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
      }];
    });
  }, [phageData, isConnected]);

  // Simulation de la chasse immunitaire (fonctionne même hors-ligne)
  useEffect(() => {
    const iv = setInterval(() => {
      setPhages(prev => prev.map(p => {
        const hunt = threats.find(t => t.status === 'HUNTING');
        if (!hunt) return { ...p, x: p.x + (Math.random()-0.5)*5, y: p.y + (Math.random()-0.5)*5 };
        const dx = hunt.x - p.x; const dy = hunt.y - p.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 5) {
          setThreats(ts => ts.map(t => t.id === hunt.id ? { ...t, status: 'DESTROYED' } : t));
          return p;
        }
        return { ...p, x: p.x + (dx/dist)*2, y: p.y + (dy/dist)*2 };
      }));
    }, 100);
    return () => clearInterval(iv);
  }, [threats]);

  // Spawn aléatoire si hors-ligne
  useEffect(() => {
    if (isConnected) return; // Le backend s'en charge
    const iv = setInterval(() => {
      if (Math.random() > 0.7 && threats.filter(t => t.status !== 'DESTROYED').length < 4) {
        setThreats(prev => [...prev, {
          id: Date.now(),
          name: `Process Malloc_${Math.floor(Math.random()*1000)}`,
          severity: Math.floor(Math.random() * 90 + 10),
          status: 'HUNTING',
          x: Math.random() * 80 + 10,
          y: Math.random() * 80 + 10
        }]);
      }
    }, 4000);
    return () => clearInterval(iv);
  }, [threats, isConnected]);

  return (
    <div className="h-screen w-screen bg-[#050000] overflow-hidden relative font-sans text-white select-none">
      {/* VASCULAR BACKGROUND */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle at 50% 50%, #f43f5e 0%, transparent 60%)',
        filter: 'blur(100px)'
      }} />

      {/* TOP BAR */}
      <div className="absolute top-0 w-full p-6 flex justify-between items-start z-50 pointer-events-none">
        <Link to="/" className="pointer-events-auto flex items-center gap-2 text-rose-400 hover:text-rose-300 transition bg-black/40 px-4 py-2 rounded-full border border-rose-500/20 backdrop-blur-md text-xs font-black uppercase tracking-widest shadow-[0_0_15px_rgba(244,63,94,0.2)]">
          <ChevronLeft size={16} /> Nexus
        </Link>
        <div className="text-center">
          <h1 className="text-xl font-black tracking-[0.4em] uppercase text-rose-500 text-shadow-[0_0_20px_#f43f5e]" style={{fontFamily: "'Orbitron', sans-serif"}}>
            Baremetal Phage
          </h1>
          <p className="text-[8px] text-rose-300/50 uppercase tracking-[0.4em] font-mono mt-1">Système Immunitaire Autonome</p>
        </div>
        <div className={`flex items-center gap-2 bg-black/40 border px-4 py-2 rounded-full backdrop-blur-md ${isConnected ? 'border-emerald-500/20' : 'border-rose-500/20'}`}>
          {isConnected ? <Wifi size={12} className="text-emerald-400" /> : <WifiOff size={12} className="text-rose-400 animate-pulse" />}
          <span className={`text-[9px] font-mono uppercase tracking-widest ${isConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isConnected ? 'BAREMETAL CONNECTÉ' : 'SIMULATION HORS-LIGNE'}
          </span>
        </div>
      </div>

      {/* BLOODSTREAM BATTLEFIELD */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        
        {/* Phages (Immune Agents) */}
        {phages.map(p => (
          <motion.div key={`phage-${p.id}`}
            animate={{ left: `${p.x}%`, top: `${p.y}%` }}
            transition={{ ease: "linear", duration: 0.1 }}
            className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
          >
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} className="absolute inset-0 rounded-full border border-dashed border-cyan-400/50 bg-cyan-400/10" />
            <Target size={14} className="text-cyan-400" />
          </motion.div>
        ))}

        {/* Threats */}
        <AnimatePresence>
          {threats.map(t => t.status !== 'DESTROYED' && (
            <motion.div key={`threat-${t.id}`}
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0, filter: 'brightness(2)' }}
              className="absolute flex flex-col items-center"
              style={{ left: `${t.x}%`, top: `${t.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              <div className="w-10 h-10 rounded-full border border-rose-500/50 flex items-center justify-center bg-rose-500/20 relative">
                {t.status === 'QUARANTINED' && <div className="absolute inset-0 rounded-full border-2 border-amber-500" />}
                <Bug size={16} className={t.status === 'HUNTING' ? 'text-rose-400 animate-pulse' : 'text-amber-500'} />
              </div>
              <div className="mt-2 bg-black/80 px-2 py-1 rounded border border-rose-500/30 backdrop-blur-md text-center">
                <p className="text-[8px] font-black uppercase text-rose-400 tracking-widest">{t.name}</p>
                <p className="text-[7px] font-mono text-gray-400 mt-0.5">{t.status} · LVL {t.severity}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* METRICS PANEL */}
      <div className="absolute bottom-8 left-8 w-80 bg-black/60 backdrop-blur-xl border border-rose-500/20 rounded-3xl p-6 z-50">
        <h3 className="text-[9px] font-black text-rose-400 tracking-widest uppercase mb-4 flex items-center gap-2">
          <Activity size={12} /> Télémétrie Immunitaire
        </h3>
        <div className="space-y-4">
           <div>
             <div className="flex justify-between text-[8px] font-mono text-gray-400 mb-1"><span>Intégrité Kernel</span><span className="text-emerald-400">99.8%</span></div>
             <div className="h-1 bg-white/10 rounded-full"><div className="h-full bg-emerald-400 w-[99.8%] shadow-[0_0_8px_#34d399]" /></div>
           </div>
           <div>
             <div className="flex justify-between text-[8px] font-mono text-gray-400 mb-1"><span>Activité Macrophage</span><span className="text-cyan-400">Élevée</span></div>
             <div className="h-1 bg-white/10 rounded-full"><div className="h-full bg-cyan-400 w-[75%] shadow-[0_0_8px_#22d3ee]" /></div>
           </div>
        </div>
        <div className="mt-6 pt-4 border-t border-white/5 grid grid-cols-2 gap-2">
           <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
              <p className="text-2xl font-black font-mono text-rose-400">{threats.filter(t=>t.status==='DESTROYED').length}</p>
              <p className="text-[7px] uppercase tracking-widest text-gray-500 mt-1">Éliminés</p>
           </div>
           <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
              <p className="text-2xl font-black font-mono text-amber-400">{threats.filter(t=>t.status==='QUARANTINED').length}</p>
              <p className="text-[7px] uppercase tracking-widest text-gray-500 mt-1">Isolés</p>
           </div>
        </div>
      </div>
    </div>
  );
}
