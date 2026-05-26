import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Maximize, Play, Pause, ChevronLeft, MonitorPlay, SkipForward, SkipBack, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Movie { id: number; title: string; year: number; genre: string; duration: string; rating: number; platform: string; desc: string; }

const CATALOG: Movie[] = [
  { id:1, title:'The Matrix',         year:1999, genre:'Sci-Fi',    duration:'2h16',  rating:9.2, platform:'YAMA_CORE', desc:'Un hacker découvre la vraie nature de la réalité simulée.' },
  { id:2, title:'Interstellar',       year:2014, genre:'Space',     duration:'2h49',  rating:9.5, platform:'YAMA_CORE', desc:'Un voyage au-delà du temps et de l\'espace pour sauver l\'humanité.' },
  { id:3, title:'Dune',               year:2021, genre:'Epic',      duration:'2h35',  rating:9.0, platform:'NETFLIX',   desc:'Paul Atreides hérite d\'une planète désertique clé de l\'univers.' },
  { id:4, title:'Blade Runner 2049',  year:2017, genre:'Noir',      duration:'2h44',  rating:9.1, platform:'PRIME',     desc:'Un blade runner découvre un secret qui pourrait tout changer.' },
  { id:5, title:'Ghost in the Shell', year:1995, genre:'Cyberpunk', duration:'1h23',  rating:9.3, platform:'YAMA_CORE', desc:'Une cyborg enquêtrice traque un hacker fantôme au futur.' },
  { id:6, title:'2001: A Space Odyssey', year:1968, genre:'Classic', duration:'2h29', rating:9.4, platform:'MAX',     desc:'L\'humanité découvre un monolithe mystérieux près de Jupiter.' },
];

const PLATFORMS = [
  { id:'YAMA_CORE', label:'Neural File', color:'#06b6d4' },
  { id:'NETFLIX',   label:'Netflix',     color:'#E50914'  },
  { id:'PRIME',     label:'Prime',       color:'#00A8E1'  },
  { id:'MAX',       label:'Max',         color:'#5822B4'  },
];

function fmt(s: number) {
  const m = Math.floor(s/60), sec = (s%60).toString().padStart(2,'0');
  return `${m}:${sec}`;
}

export default function CinemaDimension() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [activePlatform, setActivePlatform] = useState('YAMA_CORE');
  const [activeMovie, setActiveMovie] = useState<Movie>(CATALOG[0]);
  const [showBrowser, setShowBrowser] = useState(false);
  const [progress, setProgress] = useState(1240); // seconds
  const [volume, setVolume] = useState(85);
  const [aiSub, setAiSub] = useState(true);
  const [upscale, setUpscale] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSecs = (() => {
    const [h, m] = activeMovie.duration.replace('h','').split(' ');
    return (parseInt(h)*60 + parseInt(m||'0'))*60;
  })();

  const pct = Math.min(100, (progress/totalSecs)*100);

  // Hide controls after inactivity
  const resetHide = () => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (isPlaying) hideTimer.current = setTimeout(()=>setShowControls(false), 3500);
  };
  useEffect(() => { window.addEventListener('mousemove', resetHide); return () => window.removeEventListener('mousemove', resetHide); }, [isPlaying]);

  // Progress tick
  useEffect(() => {
    if (progressTimer.current) clearInterval(progressTimer.current);
    if (isPlaying) progressTimer.current = setInterval(()=>setProgress(p=>Math.min(totalSecs,p+1)),1000);
    return ()=>{
      if (progressTimer.current) clearInterval(progressTimer.current);
    };
  },[isPlaying, activeMovie]);

  const plat = PLATFORMS.find(p=>p.id===activePlatform)!;
  return (
    <div className="h-screen w-screen bg-black overflow-hidden relative text-white select-none" style={{fontFamily:"'Rajdhani',sans-serif"}}>

      {/* ── CINEMATIC BACKGROUND ── */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0" style={{background:`radial-gradient(ellipse at 40% 60%, ${plat.color}08 0%, #000 70%)`}}/>
        <motion.div animate={{opacity:isPlaying?[0.6,1,0.6]:0.4}} transition={{duration:5,repeat:Infinity}}
          className="absolute inset-0 flex items-center justify-center">
          <span style={{fontFamily:"'Orbitron',sans-serif",fontSize:200,fontWeight:900,color:`${plat.color}06`,letterSpacing:'0.05em',userSelect:'none'}}>
            {activeMovie.title.split(' ')[0].toUpperCase()}
          </span>
        </motion.div>
        {isPlaying && (
          <motion.div animate={{opacity:[0.3,0.6,0.3]}} transition={{duration:2,repeat:Infinity}}
            className="absolute bottom-0 left-0 right-0 h-1/3 pointer-events-none"
            style={{background:'linear-gradient(to top, rgba(0,0,0,0.9), transparent)'}}/>
        )}
      </div>

      {/* ── TOP BAR ── */}
      <AnimatePresence>
        {showControls && (
          <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}}
            className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5"
            style={{background:'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)'}}>
            <Link to="/" className="flex items-center gap-2 text-white/60 hover:text-white bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md text-xs font-black uppercase tracking-widest transition">
              <ChevronLeft size={14}/> Nexus
            </Link>

            {/* Platform tabs */}
            <div className="flex gap-1.5 p-1 bg-black/50 rounded-full border border-white/10 backdrop-blur-md">
              {PLATFORMS.map(p=>(
                <button key={p.id} onClick={()=>{setActivePlatform(p.id);setShowBrowser(true);}}
                  className="px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase transition-all"
                  style={{background:activePlatform===p.id?`${p.color}25`:'transparent',color:activePlatform===p.id?p.color:'rgba(255,255,255,0.3)',border:`1px solid ${activePlatform===p.id?p.color+'50':'transparent'}`,boxShadow:activePlatform===p.id?`0 0 15px ${p.color}30`:'none'}}>
                  {p.label}
                </button>
              ))}
            </div>

            {/* AI Toggles */}
            <div className="flex items-center gap-4">
              {[{l:'AI Sub', v:aiSub, set:setAiSub},{l:'4K Upscale', v:upscale, set:setUpscale}].map(t=>(
                <button key={t.l} onClick={()=>t.set(!t.v)}
                  className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border transition"
                  style={{background:t.v?`${plat.color}15`:'rgba(255,255,255,0.03)',borderColor:t.v?`${plat.color}40`:'rgba(255,255,255,0.1)',color:t.v?plat.color:'rgba(255,255,255,0.3)'}}>
                  <span style={{width:6,height:6,borderRadius:'50%',background:t.v?plat.color:'#6b7280',display:'inline-block'}}/>
                  {t.l}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CATALOG BROWSER (slide-in from right) ── */}
      <AnimatePresence>
        {showBrowser && (
          <motion.div initial={{x:'100%'}} animate={{x:0}} exit={{x:'100%'}} transition={{type:'spring',damping:28}}
            className="absolute right-0 top-0 bottom-0 z-50 flex flex-col" style={{width:320,background:'rgba(0,0,0,0.92)',backdropFilter:'blur(20px)',borderLeft:'1px solid rgba(255,255,255,0.06)'}}>
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <span className="text-[9px] font-black uppercase tracking-[0.3em]" style={{color:plat.color}}>{plat.label} · Catalogue</span>
              <button onClick={()=>setShowBrowser(false)} className="text-white/30 hover:text-white transition text-xl leading-none">×</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{scrollbarWidth:'thin',scrollbarColor:`${plat.color}30 transparent`}}>
              {CATALOG.map(m=>(
                <motion.div key={m.id} whileHover={{x:4}} onClick={()=>{setActiveMovie(m);setProgress(0);setIsPlaying(true);setShowBrowser(false);}}
                  className="p-4 rounded-2xl cursor-pointer transition-all border"
                  style={{background:activeMovie.id===m.id?`${plat.color}12`:'rgba(255,255,255,0.02)',borderColor:activeMovie.id===m.id?`${plat.color}35`:'rgba(255,255,255,0.05)'}}>
                  <div className="flex items-start justify-between mb-1.5">
                    <div>
                      <p className="text-sm font-bold text-white/90">{m.title}</p>
                      <p className="text-[8px] text-white/30 font-mono mt-0.5">{m.year} · {m.genre} · {m.duration}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <Star size={9} style={{color:'#f59e0b',fill:'#f59e0b'}}/>
                      <span className="text-[9px] font-black font-mono text-yellow-500">{m.rating}</span>
                    </div>
                  </div>
                  <p className="text-[9px] text-white/30 leading-relaxed italic">{m.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── BOTTOM CONTROLS ── */}
      <AnimatePresence>
        {showControls && (
          <motion.div initial={{opacity:0,y:40}} animate={{opacity:1,y:0}} exit={{opacity:0,y:40}}
            className="absolute bottom-0 left-0 z-50 px-6 pb-6" style={{right:showBrowser?320:0,transition:'right 0.3s'}}>
            <div className="bg-black/50 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 flex flex-col gap-4">

              {/* Progress bar */}
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-mono text-white/30 shrink-0">{fmt(progress)}</span>
                <div className="flex-1 relative h-1.5 bg-white/10 rounded-full cursor-pointer"
                  onClick={e=>{const r=e.currentTarget.getBoundingClientRect();setProgress(Math.floor(((e.clientX-r.left)/r.width)*totalSecs));}}>
                  <motion.div animate={{width:`${pct}%`}} className="h-full rounded-full relative" style={{background:plat.color,boxShadow:`0 0 10px ${plat.color}60`}}>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow"/>
                  </motion.div>
                </div>
                <span className="text-[9px] font-mono text-white/30 shrink-0">{activeMovie.duration}</span>
              </div>

              {/* Controls row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button onClick={()=>setProgress(p=>Math.max(0,p-15))} className="text-white/50 hover:text-white transition"><SkipBack size={20}/></button>
                  <motion.button whileTap={{scale:0.9}} onClick={()=>setIsPlaying(!isPlaying)}
                    className="w-14 h-14 rounded-full flex items-center justify-center text-black font-black transition"
                    style={{background:plat.color,boxShadow:`0 0 25px ${plat.color}70`}}>
                    {isPlaying ? <Pause size={26} fill="currentColor"/> : <Play size={26} fill="currentColor" className="ml-1"/>}
                  </motion.button>
                  <button onClick={()=>setProgress(p=>Math.min(totalSecs,p+15))} className="text-white/50 hover:text-white transition"><SkipForward size={20}/></button>
                  <div>
                    <p className="text-sm font-bold text-white tracking-wide">{activeMovie.title} <span className="text-white/30 font-normal">({activeMovie.year})</span></p>
                    <p className="text-[9px] font-mono mt-0.5" style={{color:plat.color}}>{plat.label} · {activeMovie.genre} · {upscale?'4K Neural Upscale':'HD'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  <button onClick={()=>setShowBrowser(!showBrowser)}
                    className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white transition">
                    <MonitorPlay size={16}/> Catalogue
                  </button>
                  <div className="flex items-center gap-2">
                    <Volume2 size={14} className="text-white/30"/>
                    <div className="w-20 h-1 bg-white/10 rounded-full cursor-pointer" onClick={e=>{const r=e.currentTarget.getBoundingClientRect();setVolume(Math.round(((e.clientX-r.left)/r.width)*100));}}>
                      <div className="h-full rounded-full" style={{width:`${volume}%`,background:plat.color}}/>
                    </div>
                  </div>
                  <button className="text-white/30 hover:text-white transition"><Maximize size={18}/></button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MOVIE INFO OVERLAY (center, when paused) ── */}
      <AnimatePresence>
        {!isPlaying && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="text-[9px] font-mono uppercase tracking-[0.5em] mb-3" style={{color:plat.color}}>En Pause · {plat.label}</p>
              <h2 style={{fontFamily:"'Orbitron',sans-serif",fontSize:42,fontWeight:900,color:'rgba(255,255,255,0.08)',letterSpacing:'0.1em'}}>{activeMovie.title.toUpperCase()}</h2>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Star size={12} style={{color:'#f59e0b',fill:'#f59e0b'}}/>
                <span className="text-yellow-500 font-black font-mono text-sm">{activeMovie.rating}</span>
                <span className="text-white/20 font-mono text-sm">· {activeMovie.genre} · {activeMovie.duration}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
