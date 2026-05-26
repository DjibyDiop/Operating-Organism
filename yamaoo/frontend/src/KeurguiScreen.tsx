import { useState } from 'react';
import { motion } from 'framer-motion';
import { Thermometer, Lock, ShieldCheck, Zap, Users, ChevronLeft, Power } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function KeurguiScreen() {
  const [securityStatus, setSecurityStatus] = useState('ARMED');
  
  return (
    <div className="h-screen w-screen bg-[#070502] overflow-hidden relative font-sans text-white">
      {/* ARCHITECTURAL GRID BACKGROUND */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.03)_1px,transparent_1px)]" style={{ backgroundSize: '40px 40px' }}></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.08)_0%,transparent_70%)]"></div>

      <div className="absolute top-10 left-10 z-50">
         <Link to="/" className="flex items-center gap-2 text-amber-500/70 hover:text-amber-400 transition bg-black/60 px-4 py-2 rounded-full border border-amber-500/20 backdrop-blur-md text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.1)]">
            <ChevronLeft size={16} /> Exit Habitat
         </Link>
      </div>

      <div className="absolute top-10 right-10 flex gap-4 z-50">
         <div className="bg-amber-900/40 border border-amber-500/50 px-4 py-1.5 rounded-full text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
            <Zap size={14} className="animate-pulse" /> EUTTOU KEUR / SMART HABITAT
         </div>
      </div>

      <div className="w-full h-full pt-28 pb-10 px-10 grid grid-cols-12 gap-8 relative z-10">
         
         {/* LEFT : BIOMETRIC & FAMILY STATUS */}
         <div className="col-span-3 flex flex-col gap-6">
            <div className="bg-black/60 border border-amber-500/20 rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 blur-xl"></div>
               <h3 className="text-amber-500 text-[10px] font-bold tracking-[0.3em] uppercase mb-6 flex items-center gap-2"><Users size={14}/> Famille (Takkusaan)</h3>
               
               <div className="space-y-4">
                  {[
                     { name: 'Djiby', location: 'Lab', vitals: 'Optimal', color: 'amber' },
                     { name: 'Awa', location: 'Living Room', vitals: 'Resting', color: 'blue' },
                     { name: 'Moussa', location: 'Outside', vitals: 'In Transit', color: 'emerald' }
                  ].map((member, i) => (
                     <div key={i} className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/5">
                        <div className={`w-10 h-10 rounded-full border-2 border-${member.color}-500/50 flex items-center justify-center bg-${member.color}-900/30`}>
                           <span className="text-xs font-bold">{member.name[0]}</span>
                        </div>
                        <div>
                           <p className="text-xs font-bold text-gray-200">{member.name}</p>
                           <p className={`text-[9px] uppercase tracking-widest text-${member.color}-400`}>{member.location} • {member.vitals}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            <div className="bg-black/60 border border-amber-500/20 rounded-3xl p-6 backdrop-blur-xl flex-1">
               <h3 className="text-amber-500 text-[10px] font-bold tracking-[0.3em] uppercase mb-4 flex items-center gap-2"><Thermometer size={14}/> Climat Neural</h3>
               <div className="flex items-end gap-2 mb-2">
                  <span className="text-5xl font-light text-white">24</span>
                  <span className="text-xl text-amber-500 mb-1">°C</span>
               </div>
               <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-6">Optimisation thermique via IA</p>
               
               <div className="space-y-3">
                  <div className="flex justify-between text-[10px] text-gray-500 uppercase tracking-widest">
                     <span>Humidité</span><span className="text-white">45%</span>
                  </div>
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                     <div className="w-[45%] h-full bg-blue-400"></div>
                  </div>
               </div>
            </div>
         </div>

         {/* CENTER : HOLOGRAPHIC BLUEPRINT */}
         <div className="col-span-6 border border-amber-500/10 rounded-3xl bg-black/40 backdrop-blur-sm relative flex items-center justify-center overflow-hidden">
            {/* Simulated 3D Blueprint of the house */}
            <motion.div 
               animate={{ rotateX: [60, 65, 60], rotateZ: [0, 5, 0] }}
               transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
               className="w-full h-full absolute inset-0 flex items-center justify-center pointer-events-none opacity-50"
               style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
            >
               <div className="w-3/4 h-1/2 border border-amber-500/30 relative">
                  <div className="absolute top-0 left-0 w-1/2 h-full border-r border-amber-500/30"></div>
                  <div className="absolute top-1/2 left-0 w-full h-1/2 border-t border-amber-500/30"></div>
                  
                  {/* Nodes on blueprint */}
                  <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-amber-400 rounded-full shadow-[0_0_15px_#f59e0b] animate-ping"></div>
                  <div className="absolute top-3/4 left-3/4 w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_15px_#10b981]"></div>
               </div>
            </motion.div>
            
            <div className="absolute bottom-6 bg-black/80 px-6 py-3 rounded-full border border-amber-500/30 flex items-center gap-6">
               <button className="flex flex-col items-center text-amber-500 hover:text-amber-400 transition">
                  <Power size={20} />
                  <span className="text-[8px] uppercase tracking-widest mt-1">Éclairage</span>
               </button>
               <button className="flex flex-col items-center text-gray-500 hover:text-white transition">
                  <ShieldCheck size={20} />
                  <span className="text-[8px] uppercase tracking-widest mt-1">Drones</span>
               </button>
               <button className="flex flex-col items-center text-gray-500 hover:text-white transition">
                  <Lock size={20} />
                  <span className="text-[8px] uppercase tracking-widest mt-1">Portes</span>
               </button>
            </div>
         </div>

         {/* RIGHT : SECURITY & LOGS */}
         <div className="col-span-3 flex flex-col gap-6">
            <div className="bg-black/60 border border-amber-500/20 rounded-3xl p-6 backdrop-blur-xl">
               <h3 className="text-amber-500 text-[10px] font-bold tracking-[0.3em] uppercase mb-4 flex items-center gap-2"><Lock size={14}/> Périmètre (Sutura)</h3>
               <button 
                  onClick={() => setSecurityStatus(securityStatus === 'ARMED' ? 'DISARMED' : 'ARMED')}
                  className={`w-full py-4 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest transition-all ${securityStatus === 'ARMED' ? 'bg-red-500/10 border-red-500/50 text-red-400' : 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'}`}
               >
                  <ShieldCheck size={16} /> 
                  {securityStatus === 'ARMED' ? 'Système Armé' : 'Désarmé'}
               </button>
               <p className="text-[9px] text-gray-500 mt-3 text-center">Détection de mouvement active via caméras IA.</p>
            </div>

            <div className="bg-black/60 border border-amber-500/20 rounded-3xl p-6 backdrop-blur-xl flex-1 flex flex-col">
               <h3 className="text-amber-500 text-[10px] font-bold tracking-[0.3em] uppercase mb-4">Journal IA de la maison</h3>
               <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
                  <div className="border-l-2 border-amber-500 pl-3">
                     <p className="text-[9px] text-amber-500 font-bold uppercase">14:02 - Sécurité</p>
                     <p className="text-xs text-gray-300 mt-1">Porte principale verrouillée.</p>
                  </div>
                  <div className="border-l-2 border-emerald-500 pl-3">
                     <p className="text-[9px] text-emerald-500 font-bold uppercase">13:45 - Climat</p>
                     <p className="text-xs text-gray-300 mt-1">Température ajustée pour économie d'énergie.</p>
                  </div>
                  <div className="border-l-2 border-blue-500 pl-3">
                     <p className="text-[9px] text-blue-500 font-bold uppercase">12:30 - Takkusaan</p>
                     <p className="text-xs text-gray-300 mt-1">Awa est arrivée dans le salon.</p>
                  </div>
               </div>
            </div>
         </div>

      </div>
    </div>
  );
}
