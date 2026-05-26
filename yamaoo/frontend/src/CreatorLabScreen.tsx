import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Cpu, Hexagon, TerminalSquare, Wand2, Box } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CreatorLabScreen() {
  const [prompt, setPrompt] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);

  const handleSynthesize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setIsSynthesizing(true);
    setResult(null);
    setApiResponse(null);

    try {
      // Appel réel à DIOP_MIND via l'API du noyau Java
      const res = await fetch('http://localhost:8080/api/cortex/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: prompt, urgency: 'NORMAL' }),
      });

      if (res.ok) {
        const data = await res.json();
        setApiResponse(data);
        setResult(data.response);
      } else {
        throw new Error('Backend injoignable');
      }
    } catch (err) {
      // Fallback hors-ligne
      await new Promise(r => setTimeout(r, 2000));
      setResult('SYNTHÈSE HORS-LIGNE: Module généré localement (Backend non connecté).');
    } finally {
      setIsSynthesizing(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#05010a] overflow-hidden relative font-sans text-white select-none flex flex-col">
      {/* SYNTHESIS GLOW BACKGROUND */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(217,70,239,0.05),transparent_60%)] pointer-events-none" />

      {/* TOP BAR */}
      <div className="absolute top-0 w-full p-6 flex justify-between items-start z-50 pointer-events-none">
        <Link to="/" className="pointer-events-auto flex items-center gap-2 text-fuchsia-400 hover:text-fuchsia-300 transition bg-black/40 px-4 py-2 rounded-full border border-fuchsia-500/20 backdrop-blur-md text-xs font-black uppercase tracking-widest shadow-[0_0_15px_rgba(217,70,239,0.2)]">
          <ChevronLeft size={16} /> Nexus
        </Link>
        <div className="text-center">
          <h1 className="text-xl font-black tracking-[0.4em] uppercase text-fuchsia-400 text-shadow-[0_0_20px_#d946ef]" style={{fontFamily: "'Orbitron', sans-serif"}}>
            SYNTHESIS FORGE
          </h1>
          <p className="text-[8px] text-fuchsia-300/50 uppercase tracking-[0.4em] font-mono mt-1">Laboratoire de Création Cognitive</p>
        </div>
        <div className="flex items-center gap-2 bg-black/40 border border-white/5 px-4 py-2 rounded-full backdrop-blur-md">
          <Wand2 size={14} className="text-fuchsia-400" />
          <span className="text-[9px] font-mono text-fuchsia-400 uppercase tracking-widest">DIOP_LLM ACTIF</span>
        </div>
      </div>

      {/* MAIN WORKSPACE */}
      <div className="flex-1 mt-24 px-8 pb-8 flex gap-8 z-10">
        
        {/* LEFT PANEL: PROMPT & TOOLS */}
        <div className="w-[400px] flex flex-col gap-6">
           <div className="bg-black/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl flex-1 flex flex-col">
             <h2 className="text-[10px] font-black uppercase tracking-widest text-fuchsia-400 mb-6 flex items-center gap-2">
               <TerminalSquare size={14} /> Intention Humaine
             </h2>
             
             <p className="text-[10px] font-mono text-gray-400 leading-relaxed mb-4 flex-1">
               Décrivez votre intention. Le noyau générera instantanément la structure logique, le code source ou la matrice 3D correspondante.
             </p>

             <form onSubmit={handleSynthesize} className="flex flex-col gap-4">
               <textarea 
                 className="w-full h-32 bg-black/40 border border-fuchsia-500/20 rounded-xl p-4 text-[11px] font-mono text-fuchsia-100 placeholder-fuchsia-900/50 focus:outline-none focus:border-fuchsia-500/50 resize-none transition"
                 placeholder="Ex: 'Génère l'architecture neuronale pour un sous-système de vision par drone...'"
                 value={prompt}
                 onChange={(e) => setPrompt(e.target.value)}
                 disabled={isSynthesizing}
               />
               <button 
                 type="submit" 
                 disabled={isSynthesizing || !prompt.trim()}
                 className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${isSynthesizing ? 'bg-fuchsia-500/10 text-fuchsia-400/50 border border-fuchsia-500/20 cursor-wait' : 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40 hover:bg-fuchsia-500/30 hover:shadow-[0_0_20px_rgba(217,70,239,0.3)]'}`}
               >
                 {isSynthesizing ? (
                   <><Cpu size={14} className="animate-spin" /> Forgeage en cours...</>
                 ) : (
                   <><Wand2 size={14} /> Synthétiser la Matière</>
                 )}
               </button>
             </form>
           </div>
        </div>

        {/* RIGHT PANEL: HOLOGRAM / PREVIEW */}
        <div className="flex-1 bg-black/60 backdrop-blur-xl border border-white/5 rounded-3xl relative overflow-hidden flex items-center justify-center shadow-2xl">
           
           {isSynthesizing ? (
             <div className="flex flex-col items-center">
                <div className="relative w-48 h-48 flex items-center justify-center">
                  <motion.div animate={{ rotateX: 360, rotateY: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }} className="absolute inset-0 border-2 border-dashed border-fuchsia-500/30 rounded-full" />
                  <motion.div animate={{ rotateX: -360, rotateY: -360 }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }} className="absolute inset-4 border border-blue-500/30 rounded-full" />
                  <Hexagon size={48} className="text-fuchsia-400" />
                </div>
                <p className="text-[10px] font-mono text-fuchsia-400 uppercase tracking-widest mt-8 animate-pulse">Compilation de l'Intention...</p>
             </div>
           ) : result ? (
             <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center max-w-md">
                <Box size={64} className="text-emerald-400 mb-6 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                <p className="text-sm font-black uppercase tracking-widest text-emerald-400 mb-4">{result}</p>
                <div className="w-full bg-black/50 border border-emerald-500/20 p-4 rounded-xl text-left">
                  <p className="text-[9px] font-mono text-emerald-200/50">struct DroneVisionNode {'{'}</p>
                  <p className="text-[9px] font-mono text-emerald-200/50 pl-4">resolution: 4K,</p>
                  <p className="text-[9px] font-mono text-emerald-200/50 pl-4">neural_links: vec!["core_cortex"],</p>
                  <p className="text-[9px] font-mono text-emerald-200/50">{'}'}</p>
                </div>
             </motion.div>
           ) : (
             <div className="text-center opacity-30">
                <Box size={48} className="mx-auto mb-4" />
                <p className="text-[10px] font-mono uppercase tracking-widest">En attente d'intention...</p>
             </div>
           )}

        </div>
      </div>
    </div>
  );
}
