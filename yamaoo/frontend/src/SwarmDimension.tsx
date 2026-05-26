import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Cpu, ChevronLeft, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SNode { id: string; type: string; status: string; load: number; x: number; y: number; color: string; latency: number; ip: string; }

const NODES0: SNode[] = [
  { id:'NODE_01', type:'YAMA CORE',    status:'ACTIVE',   load:87, x:50, y:50, color:'#06b6d4', latency:0,  ip:'192.168.0.1'  },
  { id:'NODE_02', type:'SMART TV',     status:'SYNCED',   load:24, x:22, y:28, color:'#10b981', latency:4,  ip:'192.168.0.12' },
  { id:'NODE_03', type:'IOT SECURITY', status:'STANDBY',  load:5,  x:78, y:68, color:'#8b5cf6', latency:12, ip:'192.168.0.33' },
  { id:'NODE_04', type:'EXTERNAL DB',  status:'FETCHING', load:61, x:74, y:24, color:'#f59e0b', latency:22, ip:'10.0.0.7'     },
  { id:'NODE_05', type:'PHONE DJIBY',  status:'SYNCED',   load:38, x:26, y:74, color:'#a855f7', latency:3,  ip:'192.168.0.55' },
  { id:'NODE_06', type:'SWARM RELAY',  status:'ACTIVE',   load:72, x:86, y:44, color:'#f43f5e', latency:8,  ip:'10.0.1.1'     },
];

const SC: Record<string,string> = { ACTIVE:'#10b981', SYNCED:'#06b6d4', STANDBY:'#f59e0b', FETCHING:'#a855f7', OFFLINE:'#6b7280' };

export default function SwarmDimension() {
  const cv = useRef<HTMLCanvasElement>(null);
  const logDiv = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<SNode[]>(NODES0);
  const [sel, setSel] = useState<SNode|null>(null);
  const [logs, setLogs] = useState(['[SYS] Swarm mesh initialized.','[CRYPTO] DH key exchange done.','[NET] Fully connected mesh.']);
  const [bw, setBw] = useState(14.2);
  const [pkts, setPkts] = useState(2847);

  useEffect(() => {
    const iv = setInterval(() => {
      setNodes(p => p.map(n => ({ ...n, load: Math.min(99,Math.max(2,n.load+(Math.random()-.5)*8)), latency: Math.max(1,n.latency+Math.floor((Math.random()-.5)*3)) })));
      setBw(b => Math.max(8,Math.min(20,b+(Math.random()-.5)*1.2)));
      setPkts(p => p + Math.floor(Math.random()*100));
      if (Math.random()>.5) {
        const n = NODES0[Math.floor(Math.random()*NODES0.length)];
        const ts = new Date().toLocaleTimeString('fr',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
        const msgs = [`[${ts}] [${n.id}] Heartbeat OK · ${n.latency}ms`,`[${ts}] [MESH] Packet via ${n.id} · ${n.ip}`,`[${ts}] [CRYPTO] AES session renewed on ${n.id}`];
        setLogs(p => [msgs[Math.floor(Math.random()*msgs.length)],...p].slice(0,25));
      }
    },1400);
    return () => clearInterval(iv);
  },[]);

  useEffect(()=>{ logDiv.current?.scrollTo(0,0); },[logs]);

  // Radar canvas
  useEffect(() => {
    const canvas = cv.current!; const ctx = canvas.getContext('2d')!;
    let w = canvas.width=window.innerWidth, h = canvas.height=window.innerHeight, a=0, raf:number;
    const draw = () => {
      ctx.clearRect(0,0,w,h);
      const cx=w/2,cy=h/2,R=Math.min(w,h)*.38;
      for(let i=1;i<=4;i++){ ctx.beginPath();ctx.arc(cx,cy,R*i/4,0,Math.PI*2);ctx.strokeStyle='rgba(6,182,212,0.06)';ctx.lineWidth=1;ctx.stroke(); }
      ctx.strokeStyle='rgba(6,182,212,0.04)';
      ctx.beginPath();ctx.moveTo(cx-R,cy);ctx.lineTo(cx+R,cy);ctx.stroke();
      ctx.beginPath();ctx.moveTo(cx,cy-R);ctx.lineTo(cx,cy+R);ctx.stroke();
      ctx.save();ctx.translate(cx,cy);ctx.rotate(a);
      const g=ctx.createLinearGradient(0,0,R,0);g.addColorStop(0,'rgba(6,182,212,0.3)');g.addColorStop(1,'rgba(6,182,212,0)');
      ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,R,-.3,0);ctx.closePath();ctx.fillStyle=g;ctx.fill();ctx.restore();
      for(const n of nodes){
        const nx=n.x/100*w,ny=n.y/100*h;
        ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(nx,ny);ctx.strokeStyle=n.color+'18';ctx.lineWidth=1;ctx.stroke();
        ctx.beginPath();ctx.arc(nx,ny,5,0,Math.PI*2);ctx.fillStyle=n.color;ctx.shadowBlur=14;ctx.shadowColor=n.color;ctx.fill();ctx.shadowBlur=0;
      }
      a+=.018; raf=requestAnimationFrame(draw);
    };
    draw();
    const onR=()=>{w=canvas.width=window.innerWidth;h=canvas.height=window.innerHeight;};
    window.addEventListener('resize',onR);
    return ()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',onR);};
  },[nodes]);

  return (
    <div className="h-screen w-screen bg-[#010408] overflow-hidden relative text-white select-none" style={{fontFamily:"'Rajdhani',sans-serif"}}>
      <canvas ref={cv} className="absolute inset-0 z-0 pointer-events-none"/>
      <div className="absolute inset-0 z-0 opacity-[0.025] pointer-events-none" style={{backgroundImage:'linear-gradient(rgba(0,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,255,1) 1px,transparent 1px)',backgroundSize:'40px 40px',transform:'perspective(600px) rotateX(55deg) scale(2.2) translateY(-40px)',transformOrigin:'top center'}}/>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-7 py-5">
        <Link to="/" className="flex items-center gap-2 text-cyan-400 bg-black/60 px-4 py-2 rounded-full border border-cyan-500/20 backdrop-blur-md text-xs font-black uppercase tracking-widest hover:text-cyan-300 transition">
          <ChevronLeft size={14}/> Disconnect
        </Link>
        <div className="text-center">
          <h1 style={{fontFamily:"'Orbitron',sans-serif",fontSize:15,fontWeight:900,letterSpacing:'0.4em',color:'#06b6d4',textShadow:'0 0 20px #06b6d480'}}>SWARM MESH NETWORK</h1>
          <p className="text-[8px] text-cyan-500/40 font-mono tracking-[0.4em] uppercase mt-1">OO Distributed Intelligence · P2P Baremetal Fabric</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/>
          <span className="text-[9px] text-emerald-400/60 font-mono uppercase tracking-widest">MESH SECURE</span>
        </div>
      </div>

      {/* Floating nodes */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {nodes.map((node,i)=>(
          <motion.div key={node.id} initial={{scale:0,opacity:0}} animate={{scale:1,opacity:1}} transition={{delay:i*.12,type:'spring'}}
            onClick={()=>setSel(sel?.id===node.id?null:node)}
            className="absolute flex flex-col items-center cursor-pointer pointer-events-auto" whileHover={{scale:1.15}}
            style={{left:`${node.x}%`,top:`${node.y}%`,transform:'translate(-50%,-50%)'}}>
            <motion.div animate={{scale:[1,1.7,1],opacity:[0.3,0,0.3]}} transition={{duration:2.5,repeat:Infinity,delay:i*.4}}
              className="absolute w-12 h-12 rounded-full" style={{background:node.color,filter:'blur(5px)'}}/>
            <div className="w-12 h-12 rounded-full border flex items-center justify-center backdrop-blur-sm"
              style={{background:`${node.color}15`,borderColor:`${node.color}60`,boxShadow:sel?.id===node.id?`0 0 30px ${node.color}80`:`0 0 12px ${node.color}40`}}>
              <Cpu size={18} style={{color:node.color}}/>
            </div>
            <div className="mt-2 text-center bg-black/70 px-3 py-1.5 rounded-lg border border-white/5 backdrop-blur-md min-w-max">
              <p className="text-[9px] font-black uppercase tracking-widest" style={{color:node.color}}>{node.id}</p>
              <p className="text-[7px] text-gray-400 font-mono mt-0.5">{node.type} · {Math.round(node.load)}%</p>
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-[#010408]" style={{background:SC[node.status]}}/>
          </motion.div>
        ))}
      </div>

      {/* Right panel */}
      <div className="absolute top-20 right-6 z-50 w-68 flex flex-col gap-4" style={{width:260}}>
        <div className="bg-black/70 backdrop-blur-xl border border-cyan-500/15 rounded-2xl p-5">
          <h2 className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-400/80 mb-4 flex items-center gap-2"><Network size={10}/> Telemetrie</h2>
          <div className="space-y-3">
            {[{l:'BANDWIDTH',v:`${bw.toFixed(1)} Gbps`,b:bw/20,c:'#10b981'},{l:'COHERENCE',v:'99.8%',b:.998,c:'#8b5cf6'}].map(m=>(
              <div key={m.l}>
                <div className="flex justify-between text-[9px] mb-1.5"><span className="text-gray-400 font-mono">{m.l}</span><span className="font-black font-mono" style={{color:m.c}}>{m.v}</span></div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden"><motion.div animate={{width:`${m.b*100}%`}} transition={{duration:1}} className="h-full rounded-full" style={{background:m.c,boxShadow:`0 0 8px ${m.c}60`}}/></div>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[{l:'Paquets',v:pkts.toLocaleString(),c:'#06b6d4'},{l:'Menaces',v:'0',c:'#10b981'}].map(s=>(
              <div key={s.l} className="bg-white/3 rounded-xl p-3 text-center border border-white/5">
                <p className="text-sm font-black font-mono" style={{color:s.c}}>{s.v}</p>
                <p className="text-[7px] text-white/25 font-mono uppercase tracking-wider mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
        <AnimatePresence>
          {sel&&(
            <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} className="bg-black/70 backdrop-blur-xl rounded-2xl p-5 border" style={{borderColor:`${sel.color}30`}}>
              <p className="text-[9px] font-black uppercase tracking-widest mb-3" style={{color:sel.color}}>{sel.id} · {sel.type}</p>
              <div className="space-y-1.5 text-[8px] font-mono">
                {[['IP',sel.ip],['Latence',`${sel.latency}ms`],['Statut',sel.status],['CPU',`${Math.round(sel.load)}%`],['Proto','OO-P2P/v3'],['Crypto','AES-256-GCM']].map(([k,v])=>(
                  <div key={k} className="flex justify-between"><span className="text-white/30">{k}</span><span className="text-white/70">{v}</span></div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom log */}
      <div className="absolute bottom-0 left-0 z-50 mx-5 mb-5" style={{right:280}}>
        <div className="bg-black/75 backdrop-blur-xl border border-cyan-500/10 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5">
            <Activity size={10} className="text-cyan-400"/>
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-cyan-400/70">Live Swarm Log</span>
            <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/>
          </div>
          <div ref={logDiv} className="h-20 overflow-y-auto p-3 space-y-1" style={{scrollbarWidth:'none'}}>
            {logs.map((line,i)=>(
              <motion.p key={i} initial={{opacity:0}} animate={{opacity:1}} className="text-[8px] font-mono text-cyan-200/35 leading-relaxed">{line}</motion.p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
