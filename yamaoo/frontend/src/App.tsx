import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Send, Phone, MessageSquare, Scan, Eye,
  Zap, Home, Users, Settings, Brain, Heart, Radio,
  Smartphone, Monitor, Watch, ChevronRight, BookOpen,
  GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = ""; // Vite proxies this to localhost:8080 in dev

interface SystemStatus {
  cpuNeural: number;
  memory: number;
  bpm: number;
  mood: string;
  overallScore: number;
  statusText: string;
  activityWave: number[];
}

interface Device {
  name: string;
  active: boolean;
}

interface Contact {
  name: string;
  online: boolean;
  time?: string;
}

interface ChatLogLine {
  sender: string;
  content: string;
  timestamp: string;
}

import { OONativeModule, ModuleState } from './core/OONativeModule';
import { ApiYrmModule, mapApiModules, toModuleState } from './core/yrmMapper';

interface IntentResult {
  targetModule?: string;
  action?: string;
  plan?: string[];
  confidence?: string;
}

interface WebQueryResult {
  success?: boolean;
  title?: string;
  summary?: string;
  excerpt?: string;
  url?: string;
}

export default function App() {
  const [status, setStatus] = useState<SystemStatus>({
    cpuNeural: 87.0,
    memory: 92.0,
    bpm: 72,
    mood: "HEUREUSE",
    overallScore: 98,
    statusText: "OPTIMAL",
    activityWave: [15, 25, 12, 35, 18, 30, 22, 14, 28, 40, 25, 18, 32, 20, 15]
  });

  const [devices, setDevices] = useState<Device[]>([
    { name: "Phone Djiby", active: true },
    { name: "PC Debian", active: true },
    { name: "Watch 5", active: true }
  ]);

  const [contacts, setContacts] = useState<Contact[]>([
    { name: "Mamadou", online: true },
    { name: "Aïcha", online: true },
    { name: "Papa", online: true },
    { name: "Moussa", online: false, time: "5 min" }
  ]);

  const [chatInput, setChatInput] = useState("");
  const [chatLog, setChatLog] = useState<ChatLogLine[]>([
    { sender: "YAMA", content: "Bonjour Djiby. Systèmes prêts.", timestamp: new Date().toLocaleTimeString() }
  ]);

  const [backendConnected, setBackendConnected] = useState(false);
  const [callingState, setCallingState] = useState<string | null>(null);
  const [modules, setModules] = useState<OONativeModule[]>([]);
  const [intentInput, setIntentInput] = useState('web recherche optimisation framebuffer');
  const [intentResult, setIntentResult] = useState<IntentResult | null>(null);
  const [webInput, setWebInput] = useState('https://example.com');
  const [webResult, setWebResult] = useState<WebQueryResult | null>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal chat
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog]);

  // Main polling logic to connect to the Spring Boot Java Backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/status`);
        if (res.ok) {
          const data: SystemStatus = await res.json();
          setStatus(data);
          setBackendConnected(true);
        } else {
          setBackendConnected(false);
        }
      } catch (err) {
        setBackendConnected(false);
      }
    };

    const fetchDevicesAndContacts = async () => {
      if (!backendConnected) return;
      try {
        const [devRes, contRes] = await Promise.all([
          fetch(`${API_BASE}/api/devices`),
          fetch(`${API_BASE}/api/contacts`)
        ]);
        if (devRes.ok) setDevices(await devRes.json());
        if (contRes.ok) setContacts(await contRes.json());
      } catch (err) {
        console.error("Error updating devices/contacts:", err);
      }
    };

    const fetchCognitiveGraph = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/cognitive/graph`);
        if (!res.ok) return;
        const data = await res.json();
        setCognitiveNodes((data.nodes ?? []) as CognitiveNode[]);
      } catch {
        // Keep UI resilient when graph endpoint is unreachable.
      }
    };

    const fetchModules = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/modules/state`);
        if (!res.ok) return;
        const data = await res.json();
        const apiModules = (data.modules ?? []) as ApiYrmModule[];
        if (apiModules.length) {
          setModules(mapApiModules(apiModules));
        }
      } catch {
        // Keep UI resilient when module runtime endpoint is unreachable.
      }
    };

    // Initial load
    fetchData();
    fetchDevicesAndContacts();
    fetchCognitiveGraph();
    fetchModules();

    // Intervals
    const statusInterval = setInterval(fetchData, 1000);
    const dataInterval = setInterval(fetchDevicesAndContacts, 3000);
    const graphInterval = setInterval(fetchCognitiveGraph, 5000);
    const modulesInterval = setInterval(fetchModules, 4000);

    return () => {
      clearInterval(statusInterval);
      clearInterval(dataInterval);
      clearInterval(graphInterval);
      clearInterval(modulesInterval);
    };
  }, [backendConnected]);

  // Autonomous offline simulation if Spring Boot is starting or stopped
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (!backendConnected) {
      interval = setInterval(() => {
        setStatus(prev => {
          const newWave = [...prev.activityWave.slice(1), 10 + Math.floor(Math.random() * 30)];
          const randomBpmOffset = Math.floor(Math.random() * 5) - 2;
          const randomCpuOffset = (Math.random() * 6) - 3;
          return {
            ...prev,
            cpuNeural: Math.min(99.9, Math.max(10, Math.round((prev.cpuNeural + randomCpuOffset) * 10) / 10)),
            bpm: Math.min(110, Math.max(60, prev.bpm + randomBpmOffset)),
            activityWave: newWave,
            mood: "COGNITIVE"
          };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [backendConnected]);

  // Handle message send
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    const timestamp = new Date().toLocaleTimeString();
    
    // Add user message to log locally
    setChatLog(prev => [...prev, { sender: "Djiby", content: userText, timestamp }]);
    setChatInput("");

    if (backendConnected) {
      try {
        const res = await fetch(`${API_BASE}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userText })
        });
        if (res.ok) {
          const data = await res.json();
          setChatLog(prev => [...prev, { 
            sender: data.sender, 
            content: data.content, 
            timestamp: new Date().toLocaleTimeString() 
          }]);
        }
      } catch (err) {
        addMockResponse(userText);
      }
    } else {
      // Offline fallback simulation
      setTimeout(() => {
        addMockResponse(userText);
      }, 500);
    }
  };

  const addMockResponse = (msg: string) => {
    const lower = msg.toLowerCase();
    let reply = "Requête intégrée. Le canal direct Java n'est pas actif mais je réponds en mode d'urgence synaptique.";
    
    if (lower.includes("hello") || lower.includes("bonjour") || lower.includes("salut")) {
      reply = "Bonjour Djiby. Mode simulateur actif. Je réponds à vos commandes locales.";
    } else if (lower.includes("scan")) {
      reply = "SCAN SPEC > Analyse du disque local OK. 0 faille détectée.";
    } else if (lower.includes("appel") || lower.includes("call")) {
      reply = "VOIP > Etablissement de la liaison vocale avec Mamadou via le pont local...";
    }

    setChatLog(prev => [...prev, {
      sender: "YAMA",
      content: reply,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  // Toggle cyber device
  const toggleDevice = async (name: string) => {
    if (backendConnected) {
      try {
        const res = await fetch(`${API_BASE}/api/devices/toggle`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name })
        });
        if (res.ok) {
          const data = await res.json();
          setDevices(prev => prev.map(d => d.name === name ? { ...d, active: data.active } : d));
          setChatLog(prev => [...prev, {
            sender: "SYSTEM",
            content: `Appareil [${name}] est maintenant ${data.active ? 'CONNECTÉ' : 'DÉCONNECTÉ'}`,
            timestamp: new Date().toLocaleTimeString()
          }]);
        }
      } catch (err) {
        toggleDeviceMock(name);
      }
    } else {
      toggleDeviceMock(name);
    }
  };

  const toggleDeviceMock = (name: string) => {
    setDevices(prev => prev.map(d => d.name === name ? { ...d, active: !d.active } : d));
    const activeState = !devices.find(d => d.name === name)?.active;
    setChatLog(prev => [...prev, {
      sender: "SYSTEM",
      content: `[Simulateur] Appareil [${name}] basculé en état: ${activeState ? 'ACTIF' : 'INACTIF'}`,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  // Trigger quick action button
  const triggerQuickAction = async (action: string) => {
    if (action === "phone") {
      setCallingState("Appel en cours...");
      setTimeout(() => setCallingState(null), 3000);
    }

    if (backendConnected) {
      try {
        const res = await fetch(`${API_BASE}/api/action`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action })
        });
        if (res.ok) {
          const data = await res.json();
          setChatLog(prev => [...prev, {
            sender: "YAMA",
            content: data.terminal,
            timestamp: new Date().toLocaleTimeString()
          }]);
        }
      } catch (err) {
        triggerActionMock(action);
      }
    } else {
      triggerActionMock(action);
    }
  };

  const triggerActionMock = (action: string) => {
    let text = "Action locale déclenchée.";
    if (action === "phone") text = "SIP CALL > Tentative d'appel chiffré vers Mamadou...";
    if (action === "message") text = "CHAT > Signal multiplexé envoyé à tous les membres du swarm.";
    if (action === "scan") text = "SYSTEM SCAN > Démarrage de l'analyse synaptique locale... 100% correct.";
    if (action === "eye") text = "VISION IA > Caméra active. Analyse géométrique de la pièce.";
    if (action === "memory") text = "MEMORY DUMP > Libération du cache local du navigateur.";

    setChatLog(prev => [...prev, {
      sender: "YAMA",
      content: text,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const toggleModule = async (id: string, shouldActivate: boolean) => {
    const endpoint = shouldActivate ? 'activate' : 'deactivate';
    const nextState: ModuleState = shouldActivate ? 'ACTIVE' : 'DORMANT';
    
    // Offline Simulator
    if (!backendConnected) {
      setModules(prev => prev.map(m => m.identity.id === id ? { ...m, currentState: nextState } : m));
      setChatLog(prev => [...prev, { sender: 'SYSTEM', content: `YRM > ${id} -> ${nextState}`, timestamp: new Date().toLocaleTimeString() }]);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/modules/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: id }),
      });
      if (!res.ok) throw new Error('module-toggle-failed');
      const payload = await res.json();
      const nextState = toModuleState(String(payload.status ?? ''));
      setModules(prev => prev.map(module =>
        module.identity.id === id ? { ...module, currentState: nextState } : module
      ));
      setChatLog(prev => [...prev, {
        sender: 'SYSTEM',
        content: `YRM > ${id} => ${payload.status}`,
        timestamp: new Date().toLocaleTimeString(),
      }]);
    } catch {
      setChatLog(prev => [...prev, {
        sender: 'SYSTEM',
        content: `YRM > Echec du changement d etat pour ${id}`,
        timestamp: new Date().toLocaleTimeString(),
      }]);
    }
  };

  const runCortexIntent = async () => {
    if (!intentInput.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/api/cortex/intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent: intentInput.trim() }),
      });
      if (!res.ok) throw new Error('intent-failed');
      const payload = await res.json();
      setIntentResult(payload as IntentResult);
      setChatLog(prev => [...prev, {
        sender: 'YAMA',
        content: `CORTEX > ${payload.targetModule} / ${payload.action} / confidence ${payload.confidence}`,
        timestamp: new Date().toLocaleTimeString(),
      }]);
    } catch {
      setChatLog(prev => [...prev, {
        sender: 'YAMA',
        content: 'CORTEX > Echec du routage d intention.',
        timestamp: new Date().toLocaleTimeString(),
      }]);
    }
  };

  const runWebCortex = async () => {
    if (!webInput.trim()) return;
    try {
      const payload = webInput.startsWith('http') ? { url: webInput.trim() } : { query: webInput.trim() };
      const res = await fetch(`${API_BASE}/api/web/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('web-query-failed');
      const data = await res.json();
      setWebResult(data as WebQueryResult);
      setChatLog(prev => [...prev, {
        sender: 'YAMA',
        content: `WEB CORTEX > ${data.title ?? 'Untitled'} (${data.success ? 'OK' : 'KO'})`,
        timestamp: new Date().toLocaleTimeString(),
      }]);
    } catch {
      setChatLog(prev => [...prev, {
        sender: 'YAMA',
        content: 'WEB CORTEX > Echec de la requete web.',
        timestamp: new Date().toLocaleTimeString(),
      }]);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#010409] text-white overflow-hidden font-sans select-none">
      
      {/* 1. BARRE LATÉRALE (NAVIGATION) */}
      <aside className="w-20 border-r border-white/5 flex flex-col items-center py-6 gap-8 bg-black/30 backdrop-blur-xl">
        <motion.div 
          whileHover={{ scale: 1.05 }} 
          className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-400/50 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer"
        >
          <span className="text-cyan-400 font-bold text-xl neon-glow-cyan">Y</span>
        </motion.div>
        
        <div className="flex flex-col gap-6 text-gray-500 w-full items-center">
          <NavIcon Icon={Home} active />
          <NavIcon Icon={Users} onClick={() => triggerQuickAction("message")} />
          <NavIcon Icon={MessageSquare} onClick={() => triggerQuickAction("message")} />
          <NavIcon Icon={Phone} onClick={() => triggerQuickAction("phone")} />
          <NavIcon Icon={Radio} onClick={() => triggerQuickAction("scan")} />
          <NavIcon Icon={Eye} onClick={() => triggerQuickAction("eye")} />
          <NavIcon Icon={BookOpen} onClick={() => triggerQuickAction("memory")} />
          <NavIcon Icon={Settings} className="mt-auto" />
        </div>
      </aside>

      {/* 2. ZONE PRINCIPALE */}
      <main className="flex-1 flex flex-col p-6 gap-4 overflow-y-auto custom-scrollbar relative">
        <div className="hologram-line" />

        {/* HEADER */}
        <header className="flex justify-between items-center px-2 pb-2 border-b border-white/5">
          <div className="flex flex-col">
            <h1 className="text-lg tracking-[0.2em] font-light text-cyan-300">YAMAOO COGNITIVE OS</h1>
            <span className="text-[9px] text-purple-400 tracking-[0.3em] font-bold">OO LIVING CORE</span>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/screen/home" className="border px-4 py-1.5 rounded-full flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest bg-amber-500/10 border-amber-400/30 text-amber-300 hover:bg-amber-500/20 transition-colors">
              <Home size={12} />
              Home
            </Link>
            <Link to="/screen/education" className="border px-4 py-1.5 rounded-full flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest bg-violet-500/10 border-violet-400/30 text-violet-300 hover:bg-violet-500/20 transition-colors">
              <GraduationCap size={12} />
              Education
            </Link>
            {/* Live Indicator */}
            <motion.div 
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className={`border px-4 py-1.5 rounded-full flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest ${
                backendConnected 
                  ? "bg-cyan-500/10 border-cyan-400/30 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.1)]" 
                  : "bg-orange-500/10 border-orange-500/30 text-orange-400"
              }`}
            >
              <div className={`w-2.5 h-2.5 rounded-full ${backendConnected ? 'bg-cyan-400 animate-pulse' : 'bg-orange-400 animate-ping'}`} />
              <span>{backendConnected ? "Java Backend Actif" : "Mode Simulateur"}</span>
            </motion.div>

            <div className="flex items-center gap-3 text-xs text-gray-400 font-mono">
              <Radio size={14} className="text-cyan-400" />
              <Zap size={14} className="text-purple-400" /> 
              <span>99% SYNC</span>
              <div className="w-8 h-4 border border-white/20 rounded flex items-center p-0.5">
                <div className="h-full w-[99%] bg-cyan-400 rounded-sm" />
              </div>
            </div>
          </div>
        </header>

        {/* GRILLE CENTRALE */}
        <div className="grid grid-cols-12 gap-4 h-[65%] min-h-[350px]">
          
          {/* GAUCHE : STATS */}
          <div className="col-span-3 flex flex-col gap-4">
            <GlassCard className="p-4 flex flex-col justify-between h-[35%]">
              <div>
                <h2 className="text-sm font-semibold tracking-wide text-cyan-300">Bonjour Djiby 👋</h2>
                <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">Que puis-je faire pour vous aujourd'hui ?</p>
              </div>
              
              {/* Dynamic Sound Wave */}
              <div className="h-10 mt-3 flex items-end justify-between gap-0.5 px-2">
                {status.activityWave.map((h, i) => (
                  <motion.div 
                    key={i} 
                    animate={{ height: backendConnected ? [10, h, 10] : [10, 15 + Math.floor(Math.random()*25), 10] }} 
                    transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.05 }} 
                    className="w-1 bg-cyan-400/60 rounded-full" 
                    style={{ height: `${h}px` }}
                  />
                ))}
              </div>
            </GlassCard>

            <GlassCard title="ÉTAT COGNITIF" className="flex-1 flex flex-col justify-between p-4">
              <div className="flex flex-col items-center py-2 relative">
                {/* Radial Gauge */}
                <div className="relative w-28 h-28 flex items-center justify-center">
                   <svg className="w-full h-full rotate-[-90deg]">
                     <circle cx="56" cy="56" r="46" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="5" fill="transparent" />
                     <motion.circle 
                       cx="56" 
                       cy="56" 
                       r="46" 
                       stroke="url(#cyan-gradient)" 
                       strokeWidth="5" 
                       fill="transparent" 
                       strokeDasharray="289" 
                       animate={{ strokeDashoffset: 289 - (289 * status.overallScore) / 100 }}
                       transition={{ duration: 1.5 }}
                     />
                     <defs>
                       <linearGradient id="cyan-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                         <stop offset="0%" stopColor="#22d3ee" />
                         <stop offset="100%" stopColor="#a855f7" />
                       </linearGradient>
                     </defs>
                   </svg>
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold tracking-tighter text-cyan-300 font-mono neon-glow-cyan">{status.overallScore}%</span>
                      <span className="text-[7px] text-cyan-400 uppercase tracking-widest font-black">{status.statusText}</span>
                   </div>
                </div>
              </div>
              
              <div className="space-y-2 mt-2">
                <MiniStat label="CHARGE NEURONALE" val={status.cpuNeural} color="from-cyan-400 to-blue-500" />
                <MiniStat label="MÉMOIRE JVM ALLOC" val={status.memory} color="from-purple-400 to-pink-500" />
              </div>
            </GlassCard>
          </div>

          {/* CENTRE : HOLOGRAMME */}
          <div className="col-span-6 flex flex-col items-center justify-center relative glass-panel rounded-3xl overflow-hidden border border-white/5 bg-black/10">
             
             {/* Glowing Grid Background */}
             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.08),transparent)]" />
             
             <div className="absolute top-4 left-4 border border-cyan-500/20 bg-cyan-500/5 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Brain size={12} className="text-cyan-400" />
                <span className="text-[8px] font-mono tracking-widest text-cyan-300">SYSTEM STABLE</span>
             </div>

             {/* Dynamic Ring Animations */}
             <div className="relative w-64 h-64 flex items-center justify-center">
                <motion.div 
                  animate={{ rotate: 360 }} 
                  transition={{ duration: 18, repeat: Infinity, ease: "linear" }} 
                  className="absolute inset-0 border border-dashed border-cyan-500/20 rounded-full" 
                />
                <motion.div 
                  animate={{ rotate: -360 }} 
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }} 
                  className="absolute inset-4 border border-cyan-400/10 rounded-full" 
                />
                <motion.div 
                  animate={{ scale: [1, 1.06, 1] }} 
                  transition={{ duration: 4, repeat: Infinity }} 
                  className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 to-purple-500/5 blur-2xl rounded-full" 
                />
                
                {/* Center Glowing Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                   <Brain size={96} className="text-cyan-400 drop-shadow-[0_0_25px_rgba(6,182,212,0.7)]" strokeWidth={1} />
                </div>
             </div>

             {callingState && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-20">
                  <div className="text-center">
                    <Phone className="w-12 h-12 text-cyan-400 mx-auto animate-bounce" />
                    <p className="mt-4 text-sm font-semibold tracking-wider text-cyan-300 uppercase">{callingState}</p>
                    <p className="text-[10px] text-gray-500 font-mono mt-1">Canal chiffré TLS 1.3</p>
                  </div>
                </div>
             )}
             
             {/* BOUTONS ACTIONS */}
             <div className="flex gap-6 mt-4 z-10">
               <ActionButton Icon={Phone} label="Appeler" color="cyan" onClick={() => triggerQuickAction("phone")} />
               <ActionButton Icon={MessageSquare} label="Messager" color="purple" onClick={() => triggerQuickAction("message")} />
               <ActionButton Icon={Scan} label="Scanner" color="emerald" onClick={() => triggerQuickAction("scan")} />
               <ActionButton Icon={Eye} label="Vision IA" color="cyan" onClick={() => triggerQuickAction("eye")} />
               <ActionButton Icon={BookOpen} label="Mémoire" color="orange" onClick={() => triggerQuickAction("memory")} />
             </div>
          </div>

          {/* DROITE : PREDICTIONS */}
          <div className="col-span-3 flex flex-col gap-4">
            <GlassCard title="ANTICIPATION IA">
              <p className="text-[10px] text-gray-400">Action cognitive prédite :</p>
              <p className="text-cyan-300 text-sm font-bold mt-0.5 uppercase tracking-wider neon-glow-cyan">Appel Mamadou</p>
              <p className="text-[9px] mt-1 text-gray-400">Intervalle estimé : <span className="text-purple-400 font-bold">17 min</span></p>
              
              {/* Synapse load mini graph */}
              <div className="mt-3 h-12 w-full bg-white/5 rounded-lg flex items-end p-1 gap-1 border border-white/5">
                {[12, 28, 20, 36, 42, 26, 38].map((h, i) => (
                  <div key={i} style={{ height: `${h}%` }} className="flex-1 bg-gradient-to-t from-cyan-500/20 to-cyan-400/60 rounded-sm" />
                ))}
              </div>
            </GlassCard>

            <GlassCard title="7 PILIERS YAMA">
              <div className="grid grid-cols-1 gap-1 text-[9px] text-slate-300">
                {[
                  '1. Cognitive Core',
                  '2. Holographic Interface',
                  '3. Human Network Engine',
                  '4. Memory System',
                  '5. Voice & Presence',
                  '6. Predictive Engine',
                  '7. Distributed Cognitive System',
                ].map((pillar) => (
                  <p key={pillar} className="border border-white/10 bg-white/5 rounded-lg px-2 py-1">{pillar}</p>
                ))}
              </div>
            </GlassCard>

            <GlassCard title="COGNITIVE GRAPH">
              <div className="space-y-1 text-[9px] text-slate-300 max-h-28 overflow-y-auto custom-scrollbar pr-1">
                {(cognitiveNodes.length ? cognitiveNodes : [
                  { id: 'yama-core', label: 'YAMA Core', type: 'core', strength: 0.97 },
                  { id: 'home-space', label: 'Home Space', type: 'family', strength: 0.91 },
                ]).map((node) => (
                  <p key={node.id} className="border border-white/10 bg-white/5 rounded px-2 py-1">
                    {node.label} • {node.type} • {Math.round(node.strength * 100)}%
                  </p>
                ))}
              </div>
            </GlassCard>

            <GlassCard title="HUMEUR RÉSEAU" className="flex items-center gap-3 p-4">
               <div className="w-10 h-10 rounded-full border border-cyan-500/30 bg-cyan-500/5 flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                  <div className="w-4 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
               </div>
               <div>
                  <p className="text-cyan-300 text-[10px] font-bold uppercase tracking-widest">{status.mood}</p>
                  <div className="w-20 h-1.5 bg-gray-800 rounded-full mt-1.5 overflow-hidden">
                    <motion.div 
                      animate={{ width: backendConnected ? "76%" : "60%" }} 
                      className="h-full bg-gradient-to-r from-cyan-400 to-purple-500" 
                    />
                  </div>
               </div>
            </GlassCard>

            <GlassCard title="RYTHME CARDIAQUE IA" className="flex-1 flex flex-col justify-center items-center p-4">
               <motion.div 
                 animate={{ scale: [1, 1.2, 1] }} 
                 transition={{ repeat: Infinity, duration: 60 / status.bpm }}
                 className="cursor-pointer"
                 onClick={() => triggerQuickAction("phone")}
               >
                 <Heart className="text-rose-500" fill="currentColor" size={28} />
               </motion.div>
               <span className="text-xl font-bold font-mono text-rose-400 mt-2 neon-glow-cyan">{status.bpm} BPM</span>
            </GlassCard>
          </div>
        </div>

        {/* BAS : CONTACTS & TERMINAL */}
        <div className="grid grid-cols-12 gap-4 flex-1 pb-2 min-h-[180px]">
          
          {/* CONTACTS RÉCENTS */}
          <GlassCard title="CONTACTS RÉCENTS" className="col-span-3 flex flex-col p-4 justify-between">
            <div className="flex justify-around items-center h-full gap-2 mt-2">
              {contacts.map((contact, i) => (
                <ContactAvatar 
                  key={i} 
                  name={contact.name} 
                  online={contact.online} 
                  time={contact.time} 
                  onClick={() => triggerQuickAction("phone")}
                />
              ))}
            </div>
          </GlassCard>

          {/* TERMINAL CHAT */}
          <GlassCard title="YAMA TERMINAL" className="col-span-5 flex flex-col p-4">
            <div className="flex-1 text-[10px] font-mono text-gray-300 space-y-1.5 overflow-y-auto max-h-[110px] pr-2 custom-scrollbar">
              <AnimatePresence initial={false}>
                {chatLog.map((line, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    key={i} 
                    className="flex justify-between items-start leading-relaxed border-b border-white/5 pb-1"
                  >
                    <span className={
                      line.sender === "YAMA" 
                        ? "text-cyan-400" 
                        : line.sender === "SYSTEM" 
                          ? "text-purple-400 font-bold" 
                          : "text-emerald-400"
                    }>
                      {line.sender} &gt; {line.content}
                    </span>
                    <span className="text-[8px] text-gray-500 shrink-0 font-light pl-2">{line.timestamp}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={terminalEndRef} />
            </div>
            
            <form onSubmit={handleSendMessage} className="mt-2.5 relative">
               <input 
                 value={chatInput}
                 onChange={e => setChatInput(e.target.value)}
                 className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-2 text-[10px] outline-none focus:border-cyan-500/50 focus:bg-cyan-500/5 transition-all text-white placeholder-gray-500" 
                 placeholder="Parlez à Yama..." 
               />
               <button type="submit" className="absolute right-3 top-2 text-cyan-400 hover:text-cyan-300 transition-colors p-0.5">
                 <Send size={12} />
               </button>
            </form>
          </GlassCard>

          {/* YAMA RUNTIME MODULES (YRM) ORCHESTRATOR */}
          <GlassCard title="OO NATIVE MODULES (YRM)" className="col-span-4 p-4 flex flex-col gap-3">
            <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-1">
              {(modules.length ? modules : [
                {
                  identity: { id: 'sys_cinema_01', name: 'Neural Vision (Cinema)', type: 'SENSORY', version: '2.1' },
                  capabilities: { render_ui: true, gpu_acceleration: true },
                  executionMode: 'NATIVE',
                  currentState: 'ACTIVE',
                  aiHooks: { requiresAttention: false, attentionPriority: 'NORMAL' }
                },
                {
                  identity: { id: 'sys_music_01', name: 'Neural Audio Engine', type: 'SENSORY', version: '3.1' },
                  capabilities: { audio_output: true },
                  executionMode: 'ISOLATED',
                  currentState: 'BACKGROUND',
                  aiHooks: { requiresAttention: false, attentionPriority: 'LOW' }
                },
                {
                  identity: { id: 'sys_swarm_01', name: 'P2P Mesh Network', type: 'SYSTEM', version: '1.0' },
                  capabilities: { network_access: true, p2p_swarm_node: true },
                  executionMode: 'PRIVILEGED',
                  currentState: 'ACTIVE',
                  aiHooks: { requiresAttention: true, attentionPriority: 'HIGH' }
                }
              ] as OONativeModule[]).map((module) => {
                const isActive = module.currentState === 'ACTIVE' || module.currentState === 'BACKGROUND';
                const isAttn = module.aiHooks.requiresAttention;
                return (
                  <div 
                    key={module.identity.id}
                    onClick={() => toggleModule(module.identity.id, !isActive)}
                    className={`p-2.5 rounded-xl border flex flex-col gap-1.5 cursor-pointer transition-all ${
                      isActive
                        ? 'border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10 shadow-[0_0_10px_rgba(6,182,212,0.1)]'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-cyan-300' : 'text-gray-400'}`}>
                        {module.identity.name}
                      </span>
                      <div className="flex items-center gap-2">
                        {isAttn && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_#f43f5e]" title="AI Attention Required" />}
                        <span className={`text-[8px] font-mono border px-1.5 py-0.5 rounded ${isActive ? 'border-cyan-400/50 text-cyan-400' : 'border-gray-600 text-gray-500'}`}>
                          {module.currentState}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-[8px] font-mono text-gray-500">
                      <span>{module.identity.type} · {module.executionMode}</span>
                      <span className="text-cyan-500/50">v{module.identity.version}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <input
              value={intentInput}
              onChange={e => setIntentInput(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-[8px] outline-none focus:border-cyan-500/50"
              placeholder="intent cortex"
            />
            <button
              onClick={runCortexIntent}
              className="w-full text-[8px] py-1 rounded border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 transition-all"
            >
              Run Intent
            </button>

            {intentResult && (
              <p className="text-[8px] text-cyan-300/90 leading-relaxed border border-cyan-500/20 bg-cyan-500/5 rounded px-2 py-1">
                {intentResult.targetModule} / {intentResult.action}
              </p>
            )}

            <input
              value={webInput}
              onChange={e => setWebInput(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-[8px] outline-none focus:border-purple-500/50"
              placeholder="url ou query web"
            />
            <button
              onClick={runWebCortex}
              className="w-full text-[8px] py-1 rounded border border-purple-500/40 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 transition-all"
            >
              Run Web Query
            </button>

            {webResult?.title && (
              <div className="text-[8px] text-purple-200/90 leading-relaxed border border-purple-500/20 bg-purple-500/5 rounded px-2 py-1 max-h-20 overflow-y-auto custom-scrollbar space-y-1">
                <p className="font-semibold text-purple-100">{webResult.title}</p>
                {webResult.summary && <p>{webResult.summary}</p>}
              </div>
            )}
          </GlassCard>
        </div>

        {/* Le Media Core a été transféré dans CinemaDimension et MusicDimension */}
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---

interface NavIconProps {
  Icon: React.ComponentType<any>;
  active?: boolean;
  className?: string;
  onClick?: () => void;
}

const NavIcon = ({ Icon, active, className = "", onClick }: NavIconProps) => (
  <motion.div 
    whileHover={{ scale: 1.1, color: "#22d3ee" }}
    onClick={onClick}
    className={`p-2.5 cursor-pointer transition-all rounded-xl ${
      active 
        ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-400/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]' 
        : 'hover:text-white'
    } ${className}`}
  >
    <Icon size={18} strokeWidth={active ? 2.5 : 1.5} />
  </motion.div>
);

interface GlassCardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

const GlassCard = ({ children, title, className = "" }: GlassCardProps) => (
  <div className={`glass-panel rounded-2xl p-4 flex flex-col relative overflow-hidden ${className}`}>
    {title && (
      <h3 className="text-[8px] tracking-[0.25em] text-cyan-400/80 uppercase mb-2.5 font-black flex justify-between items-center">
        {title} 
        <ChevronRight size={10} className="text-cyan-400/50" />
      </h3>
    )}
    {children}
  </div>
);

interface MiniStatProps {
  label: string;
  val: number;
  color: string;
}

const MiniStat = ({ label, val, color }: MiniStatProps) => (
  <div className="mt-1 font-mono">
    <div className="flex justify-between text-[8px] text-gray-400 mb-1">
      <span>{label}</span>
      <span className="font-bold text-cyan-300">{val}%</span>
    </div>
    <div className="h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${val}%` }}
        className={`h-full bg-gradient-to-r ${color}`} 
      />
    </div>
  </div>
);

interface ActionButtonProps {
  Icon: React.ComponentType<any>;
  label: string;
  color: string;
  onClick: () => void;
}

const ActionButton = ({ Icon, label, color, onClick }: ActionButtonProps) => {
  const colorMap: Record<string, string> = {
    cyan: "from-cyan-500/10 to-cyan-500/5 hover:from-cyan-500/20 hover:to-cyan-500/10 border-cyan-400/30 text-cyan-400",
    purple: "from-purple-500/10 to-purple-500/5 hover:from-purple-500/20 hover:to-purple-500/10 border-purple-400/30 text-purple-400",
    emerald: "from-emerald-500/10 to-emerald-500/5 hover:from-emerald-500/20 hover:to-emerald-500/10 border-emerald-500/30 text-emerald-400",
    orange: "from-orange-500/10 to-orange-500/5 hover:from-orange-500/20 hover:to-orange-500/10 border-orange-500/30 text-orange-400",
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 group cursor-pointer"
    >
      <div className={`p-3 rounded-xl border bg-gradient-to-b transition-all flex items-center justify-center shadow-lg ${colorMap[color] || colorMap.cyan}`}>
        <Icon size={18} strokeWidth={2} />
      </div>
      <span className="text-[8px] uppercase tracking-wider text-gray-500 font-bold group-hover:text-cyan-300 transition-colors font-mono">{label}</span>
    </motion.div>
  );
};

interface ContactAvatarProps {
  name: string;
  online: boolean;
  time?: string;
  onClick: () => void;
}

const ContactAvatar = ({ name, online, time, onClick }: ContactAvatarProps) => (
  <motion.div 
    whileHover={{ y: -3 }}
    onClick={onClick}
    className="flex flex-col items-center gap-1.5 cursor-pointer group"
  >
    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-cyan-500/10 to-purple-500/10 border border-white/10 flex items-center justify-center relative shadow-inner group-hover:border-cyan-400/50 transition-colors">
      <Users size={16} className="text-gray-400 group-hover:text-cyan-300 transition-colors" />
      {online ? (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-cyan-400 rounded-full border-2 border-[#010409] animate-pulse shadow-[0_0_5px_rgba(6,182,212,0.8)]" />
      ) : (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-gray-500 rounded-full border-2 border-[#010409]" />
      )}
    </div>
    <span className="text-[9px] font-bold text-gray-400 group-hover:text-cyan-300 font-mono transition-colors">{name}</span>
    {time && <span className="text-[7px] text-gray-600 italic tracking-tighter">il y a {time}</span>}
  </motion.div>
);

interface DeviceItemProps {
  Icon: React.ComponentType<any>;
  name: string;
  active: boolean;
  onClick: () => void;
}

const DeviceItem = ({ Icon, name, active, onClick }: DeviceItemProps) => (
  <div 
    onClick={onClick}
    className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5 hover:border-cyan-400/30 hover:bg-cyan-500/5 transition-all cursor-pointer group"
  >
    <Icon size={14} className={active ? "text-cyan-400 animate-pulse" : "text-gray-500"} />
    <span className={`text-[9px] flex-1 font-mono ${active ? 'text-white' : 'text-gray-500 line-through'}`}>{name}</span>
    <div className={`w-2 h-2 rounded-full ${
      active 
        ? "bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" 
        : "bg-red-500/60 border border-red-500/30"
    }`} />
  </div>
);
