import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, BrainCircuit, Search, Database, Fingerprint, Network } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MemoryNode {
  id: string;
  title: string;
  type: 'TEXT' | 'CODE' | 'VISUAL' | 'AUDIO' | 'PERSON';
  timestamp: string;
  size: string;
  x: number;
  y: number;
  color: string;
  related: string[];
}

const MEMORIES: MemoryNode[] = [
  { id: 'm1', title: 'Kernel Boot Logs', type: 'CODE', timestamp: 'Hier 22:14', size: '1.2MB', x: 50, y: 50, color: '#06b6d4', related: ['m2', 'm4'] },
  { id: 'm2', title: 'Call w/ Mamadou', type: 'PERSON', timestamp: 'Mardi 14:00', size: '14MB', x: 30, y: 30, color: '#10b981', related: ['m1'] },
  { id: 'm3', title: 'Neural UI Concepts', type: 'VISUAL', timestamp: '12 Mai 2026', size: '42MB', x: 70, y: 25, color: '#a855f7', related: ['m5'] },
  { id: 'm4', title: 'Rust Baremetal Docs', type: 'TEXT', timestamp: 'Mardi 15:30', size: '300KB', x: 20, y: 70, color: '#f59e0b', related: ['m1'] },
  { id: 'm5', title: 'Hans Zimmer Audio', type: 'AUDIO', timestamp: 'Il y a 2h', size: '8MB', x: 80, y: 75, color: '#f43f5e', related: ['m3'] },
  { id: 'm6', title: 'Swarm Telemetry', type: 'CODE', timestamp: 'Live', size: '45KB', x: 50, y: 85, color: '#06b6d4', related: ['m4', 'm5'] },
];

export default function HippocampusScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeMem, setActiveMem] = useState<MemoryNode | null>(null);
  const [search, setSearch] = useState('');

  // Draw associative links
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    
    let w = cv.width = window.innerWidth;
    let h = cv.height = window.innerHeight;
    let t = 0;
    let raf: number;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // Draw faint connections
      MEMORIES.forEach(m1 => {
        m1.related.forEach(rId => {
          const m2 = MEMORIES.find(m => m.id === rId);
          if (m2) {
            ctx.beginPath();
            ctx.moveTo((m1.x / 100) * w, (m1.y / 100) * h);
            // Draw a bezier curve for an organic feel
            ctx.quadraticCurveTo(w/2, h/2, (m2.x / 100) * w, (m2.y / 100) * h);
            ctx.strokeStyle = `rgba(168, 85, 247, ${0.1 + Math.sin(t*0.05)*0.05})`;
            ctx.lineWidth = activeMem?.id === m1.id || activeMem?.id === m2.id ? 2 : 1;
            if (activeMem?.id === m1.id || activeMem?.id === m2.id) {
               ctx.strokeStyle = `rgba(6, 182, 212, 0.4)`;
            }
            ctx.stroke();
          }
        });
      });

      t++;
      raf = requestAnimationFrame(draw);
    };
    draw();

    const onResize = () => { w = cv.width = window.innerWidth; h = cv.height = window.innerHeight; };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, [activeMem]);

  return (
    <div className="h-screen w-screen bg-[#000205] overflow-hidden relative font-sans text-white select-none">
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

      {/* AMBIENT GLOW */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.05),transparent)] pointer-events-none" />

      {/* TOP BAR */}
      <div className="absolute top-0 w-full p-6 flex justify-between items-start z-50 pointer-events-none">
        <Link to="/" className="pointer-events-auto flex items-center gap-2 text-purple-400 hover:text-purple-300 transition bg-black/40 px-4 py-2 rounded-full border border-purple-500/20 backdrop-blur-md text-xs font-black uppercase tracking-widest shadow-[0_0_15px_rgba(168,85,247,0.2)]">
          <ChevronLeft size={16} /> Nexus
        </Link>
        <div className="text-center">
          <h1 className="text-xl font-black tracking-[0.4em] uppercase text-purple-400 text-shadow-[0_0_15px_#a855f7]" style={{fontFamily: "'Orbitron', sans-serif"}}>
            L'Hippocampe
          </h1>
          <p className="text-[8px] text-purple-300/50 uppercase tracking-[0.4em] font-mono mt-1">Explorateur Associatif de Souvenirs</p>
        </div>
        <div className="flex items-center gap-4 bg-black/40 border border-white/5 px-4 py-2 rounded-full backdrop-blur-md pointer-events-auto">
          <Search size={14} className="text-gray-400" />
          <input 
            placeholder="Évoquer un souvenir..." 
            className="bg-transparent text-[10px] w-48 outline-none placeholder-gray-600 font-mono"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* 3D MEMORY NODES */}
      <div className="absolute inset-0 z-10">
        {MEMORIES.filter(m => m.title.toLowerCase().includes(search.toLowerCase())).map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.1, type: 'spring' }}
            onClick={() => setActiveMem(activeMem?.id === m.id ? null : m)}
            className="absolute flex flex-col items-center cursor-pointer group"
            style={{ left: `${m.x}%`, top: `${m.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            <motion.div
              animate={{ 
                boxShadow: activeMem?.id === m.id 
                  ? `0 0 40px ${m.color}80, inset 0 0 20px ${m.color}40` 
                  : `0 0 15px ${m.color}20, inset 0 0 5px ${m.color}10` 
              }}
              className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center backdrop-blur-md transition-all group-hover:scale-110"
              style={{ background: `${m.color}10`, borderColor: activeMem?.id === m.id ? m.color : 'rgba(255,255,255,0.1)' }}
            >
              {m.type === 'CODE' ? <Database size={20} color={m.color} /> :
               m.type === 'PERSON' ? <Fingerprint size={20} color={m.color} /> :
               m.type === 'VISUAL' ? <BrainCircuit size={20} color={m.color} /> :
               <Network size={20} color={m.color} />}
            </motion.div>
            <div className="mt-3 text-center bg-black/60 px-3 py-1.5 rounded-lg border border-white/5 backdrop-blur-xl">
              <p className="text-[10px] font-black tracking-widest uppercase" style={{ color: m.color }}>{m.title}</p>
              <p className="text-[8px] text-gray-400 font-mono mt-0.5">{m.timestamp}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* INSPECTOR PANEL */}
      <AnimatePresence>
        {activeMem && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="absolute right-8 top-1/2 -translate-y-1/2 w-80 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 z-50 shadow-[0_0_50px_rgba(0,0,0,0.8)]"
          >
            <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${activeMem.color}20` }}>
                <BrainCircuit size={16} color={activeMem.color} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest" style={{ color: activeMem.color }}>{activeMem.title}</p>
                <p className="text-[8px] font-mono text-gray-400 mt-1">{activeMem.id} · {activeMem.type}</p>
              </div>
            </div>

            <div className="space-y-4 text-[9px] font-mono">
               <div className="flex justify-between text-gray-300"><span>Date d'encodage</span><span className="text-white">{activeMem.timestamp}</span></div>
               <div className="flex justify-between text-gray-300"><span>Poids Synaptique</span><span className="text-white">{activeMem.size}</span></div>
               <div className="flex justify-between text-gray-300"><span>Intégrité Hash</span><span className="text-emerald-400">99.9% VALID</span></div>
               <div className="flex justify-between text-gray-300"><span>Associations</span><span className="text-purple-400">{activeMem.related.length} liens directs</span></div>
            </div>

            <div className="mt-8">
              <p className="text-[8px] text-gray-500 uppercase tracking-widest mb-2 border-b border-white/5 pb-1">Contexte IA (DIOP)</p>
              <p className="text-[10px] text-gray-300 leading-relaxed italic">
                "Ce souvenir a été accédé pour la dernière fois suite à une requête système. Il est fortement lié au noyau Baremetal et aux journaux de sécurité d'hier."
              </p>
            </div>

            <div className="mt-8 flex gap-3">
               <button className="flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all" style={{ borderColor: activeMem.color, color: activeMem.color, background: `${activeMem.color}10` }}>
                 Revivre (Ouvrir)
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
