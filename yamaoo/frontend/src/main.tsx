import { StrictMode, Suspense, lazy, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import './index.css'

const routeLoaders = {
  '/screen/yama': () => import('./App.tsx'),
  '/screen/home': () => import('./HomeScreen.tsx'),
  '/screen/education': () => import('./EducationScreen.tsx'),
  '/screen/creator': () => import('./CreatorLabScreen.tsx'),
  '/screen/care': () => import('./HealthCareScreen.tsx'),
  '/screen/cinema': () => import('./CinemaDimension.tsx'),
  '/screen/swarm': () => import('./SwarmDimension.tsx'),
  '/screen/dream': () => import('./DreamStateDimension.tsx'),
  '/screen/music': () => import('./MusicDimension.tsx'),
  '/screen/social': () => import('./SocialDimension.tsx'),
  '/screen/hippocampus': () => import('./HippocampusScreen.tsx'),
  '/screen/phage': () => import('./ImmuneSystemScreen.tsx'),
  '/screen/neuroforge': () => import('./NeuroForgeScreen.tsx'),
  '/screen/cortex': () => import('./CortexScreen.tsx'),
  '/screen/chrono': () => import('./ChronoFluxScreen.tsx'),
} as const

const preloadCache = new Set<string>()

function canPreloadRoutes() {
  if (typeof navigator === 'undefined') return true

  const nav = navigator as Navigator & {
    connection?: {
      saveData?: boolean
      effectiveType?: string
    }
  }

  if (nav.connection?.saveData) return false

  const speed = nav.connection?.effectiveType
  if (speed === 'slow-2g' || speed === '2g') return false

  return true
}

const preloadEnabled = canPreloadRoutes()

function preloadRoute(route: string) {
  if (!preloadEnabled) return

  const loader = routeLoaders[route as keyof typeof routeLoaders]
  if (!loader || preloadCache.has(route)) return

  preloadCache.add(route)
  void loader().catch(() => {
    preloadCache.delete(route)
  })
}

const App = lazy(routeLoaders['/screen/yama'])
const HomeScreen = lazy(routeLoaders['/screen/home'])
const EducationScreen = lazy(routeLoaders['/screen/education'])
const CreatorLabScreen = lazy(routeLoaders['/screen/creator'])
const HealthCareScreen = lazy(routeLoaders['/screen/care'])
const CinemaDimension = lazy(routeLoaders['/screen/cinema'])
const SwarmDimension = lazy(routeLoaders['/screen/swarm'])
const DreamStateDimension = lazy(routeLoaders['/screen/dream'])
const MusicDimension = lazy(routeLoaders['/screen/music'])
const SocialDimension = lazy(routeLoaders['/screen/social'])
const HippocampusScreen = lazy(routeLoaders['/screen/hippocampus'])
const ImmuneSystemScreen = lazy(routeLoaders['/screen/phage'])
const NeuroForgeScreen = lazy(routeLoaders['/screen/neuroforge'])
const CortexScreen = lazy(routeLoaders['/screen/cortex'])
const ChronoFluxScreen = lazy(routeLoaders['/screen/chrono'])

function RouteLoader() {
  return (
    <div className="w-screen h-screen bg-black flex items-center justify-center">
      <span
        style={{
          fontFamily: 'monospace',
          fontSize: 10,
          color: 'rgba(6,182,212,0.7)',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
        }}
      >
        Chargement module
      </span>
    </div>
  )
}

// ─── Node definitions ───────────────────────────────────────────────────────
interface NexusNode {
  id: string
  label: string
  sublabel: string
  icon: string
  route: string
  x: number   // % of viewport width
  y: number   // % of viewport height
  size: number
  color: string
  glow: string
  delay: number
  floatAmp: number
  connections: string[]
  status: 'active' | 'idle' | 'dream'
  pulse?: boolean
}

const NODES: NexusNode[] = [
  {
    id: 'core', label: 'YAMA', sublabel: 'Soma Core', icon: '◎', route: '/screen/yama',
    x: 50, y: 48, size: 160, color: '#0e2233', glow: '#06b6d4',
    delay: 0, floatAmp: 8, connections: ['cinema', 'social', 'music', 'creator', 'dream', 'swarm', 'cortex'],
    status: 'active', pulse: true,
  },
  {
    id: 'dream', label: 'Dream State', sublabel: 'Synaptic Sleep', icon: '☾', route: '/screen/dream',
    x: 50, y: 14, size: 120, color: '#0c0b1e', glow: '#6366f1',
    delay: 0.8, floatAmp: 6, connections: [],
    status: 'dream',
  },
  {
    id: 'cinema', label: 'Cinéma', sublabel: 'Neural Vision', icon: '◈', route: '/screen/cinema',
    x: 18, y: 44, size: 112, color: '#0a0e1f', glow: '#3b82f6',
    delay: 1.2, floatAmp: 9, connections: [],
    status: 'active',
  },
  {
    id: 'social', label: 'Social Matrix', sublabel: 'Earth + P2P', icon: '⬡', route: '/screen/social',
    x: 82, y: 44, size: 120, color: '#120a1e', glow: '#a855f7',
    delay: 0.5, floatAmp: 7, connections: ['swarm'],
    status: 'active',
  },
  {
    id: 'music', label: 'Neural Audio', sublabel: 'Frequency Studio', icon: '♫', route: '/screen/music',
    x: 30, y: 78, size: 108, color: '#041510', glow: '#10b981',
    delay: 1.5, floatAmp: 10, connections: [],
    status: 'active',
  },
  {
    id: 'creator', label: 'Synthesis Forge', sublabel: 'Creator Lab', icon: '✦', route: '/screen/creator',
    x: 70, y: 78, size: 108, color: '#18081e', glow: '#d946ef',
    delay: 2.0, floatAmp: 8, connections: [],
    status: 'active',
  },
  {
    id: 'swarm', label: 'Swarm P2P', sublabel: 'Mesh Network', icon: '⬡', route: '/screen/swarm',
    x: 86, y: 20, size: 90, color: '#0f0b1a', glow: '#8b5cf6',
    delay: 1.0, floatAmp: 5, connections: [],
    status: 'active',
  },
  {
    id: 'hippocampus', label: 'Hippocampe', sublabel: 'Memory Matrix', icon: '✧', route: '/screen/hippocampus',
    x: 14, y: 20, size: 100, color: '#0f0518', glow: '#a855f7',
    delay: 1.8, floatAmp: 7, connections: ['core'],
    status: 'active',
  },
  {
    id: 'phage', label: 'Phage OS', sublabel: 'Immune System', icon: '⚕', route: '/screen/phage',
    x: 50, y: 86, size: 90, color: '#180505', glow: '#f43f5e',
    delay: 2.2, floatAmp: 5, connections: ['core', 'swarm'],
    status: 'active',
  },
  {
    id: 'neuroforge', label: 'Neuro-Forge', sublabel: 'Plasticity', icon: '⎈', route: '/screen/neuroforge',
    x: 86, y: 65, size: 105, color: '#100512', glow: '#d946ef',
    delay: 1.5, floatAmp: 6, connections: ['core'],
    status: 'active',
  },
  {
    id: 'cortex', label: 'Cortex', sublabel: 'DIOP MIND', icon: '🧠', route: '/screen/cortex',
    x: 50, y: 78, size: 130, color: '#000510', glow: '#22d3ee',
    delay: 0.3, floatAmp: 4, connections: ['phage'],
    status: 'active',
  },
  {
    id: 'chrono', label: 'Chrono-Flux', sublabel: 'Temporal Flow', icon: '⌛', route: '/screen/chrono',
    x: 30, y: 20, size: 100, color: '#05121c', glow: '#06b6d4',
    delay: 1.1, floatAmp: 6, connections: ['core'],
    status: 'active',
  },
]

const SECONDARY: { route: string; label: string; color: string }[] = [
  { route: '/screen/home',      label: 'Home',                 color: '#f59e0b' },
  { route: '/screen/education', label: 'Knowledge Matrix',     color: '#3b82f6' },
  { route: '/screen/care',      label: 'Bio-Resonance',        color: '#10b981' },
]

// ─── Particle canvas background ──────────────────────────────────────────────
function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = ref.current!
    const ctx = cv.getContext('2d')!
    let w = cv.width = window.innerWidth
    let h = cv.height = window.innerHeight

    const pts = Array.from({ length: 90 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.5 + 0.3,
      a: Math.random() * 0.5 + 0.1,
    }))

    let raf: number
    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > w) p.vx *= -1
        if (p.y < 0 || p.y > h) p.vy *= -1
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(6,182,212,${p.a})`
        ctx.fill()
      }
      // Faint connection lines between close particles
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x
          const dy = pts[i].y - pts[j].y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 120) {
            ctx.beginPath()
            ctx.moveTo(pts[i].x, pts[i].y)
            ctx.lineTo(pts[j].x, pts[j].y)
            ctx.strokeStyle = `rgba(6,182,212,${0.06 * (1 - d / 120)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
      raf = requestAnimationFrame(draw)
    }
    draw()

    const onResize = () => { w = cv.width = window.innerWidth; h = cv.height = window.innerHeight }
    window.addEventListener('resize', onResize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize) }
  }, [])

  return <canvas ref={ref} className="absolute inset-0 z-0 pointer-events-none" />
}

// ─── Animated SVG neural connection lines ────────────────────────────────────
function NeuralLines() {
  const allEdges: [NexusNode, NexusNode][] = []
  for (const node of NODES) {
    for (const cid of node.connections) {
      const target = NODES.find(n => n.id === cid)
      if (target) allEdges.push([node, target])
    }
  }

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ overflow: 'visible' }}>
      <defs>
        {NODES.map(n => (
          <marker key={`arrow-${n.id}`} id={`arrow-${n.id}`} markerWidth="6" markerHeight="6"
            refX="3" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill={n.glow} opacity="0.4" />
          </marker>
        ))}
        <filter id="glow-line">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {allEdges.map(([a, b], i) => {
        const ax = `${a.x}%`; const ay = `${a.y}%`
        const bx = `${b.x}%`; const by = `${b.y}%`
        return (
          <g key={i}>
            {/* Static faint base line */}
            <line x1={ax} y1={ay} x2={bx} y2={by}
              stroke={a.glow} strokeWidth="0.8" strokeOpacity="0.12"
              strokeDasharray="4 6"
            />
            {/* Animated signal pulse */}
            <line x1={ax} y1={ay} x2={bx} y2={by}
              stroke={a.glow} strokeWidth="1.5" strokeOpacity="0.5"
              strokeDasharray="16 200" filter="url(#glow-line)"
            >
              <animate attributeName="stroke-dashoffset"
                from="0" to="-216"
                dur={`${2 + i * 0.4}s`} repeatCount="indefinite"
              />
            </line>
          </g>
        )
      })}
    </svg>
  )
}

// ─── Single floating node ────────────────────────────────────────────────────
function NexusNodeCard({ node, hovered, onHover, onPreload }: {
  node: NexusNode
  hovered: string | null
  onHover: (id: string | null) => void
  onPreload: (route: string) => void
}) {
  const isHovered = hovered === node.id
  const isCore = node.id === 'core'

  return (
    <Link
      to={node.route}
      onFocus={() => onPreload(node.route)}
      style={{ position: 'absolute', left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)', zIndex: 20 }}
    >
      <motion.div
        animate={{ y: [`${-node.floatAmp}px`, `${node.floatAmp}px`, `${-node.floatAmp}px`] }}
        transition={{ duration: 5 + node.delay, repeat: Infinity, ease: 'easeInOut', delay: node.delay }}
        onHoverStart={() => {
          onPreload(node.route)
          onHover(node.id)
        }}
        onHoverEnd={() => onHover(null)}
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.95 }}
        style={{
          width: node.size,
          height: node.size,
          background: node.color,
          borderRadius: '50%',
          border: `1px solid ${node.glow}${isHovered ? 'aa' : '33'}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          backdropFilter: 'blur(12px)',
          boxShadow: isHovered
            ? `0 0 60px ${node.glow}50, 0 0 120px ${node.glow}20, inset 0 0 30px ${node.glow}10`
            : `0 0 30px ${node.glow}20`,
          transition: 'box-shadow 0.4s, border-color 0.4s',
          position: 'relative',
          overflow: 'visible',
        }}
      >
        {/* Rotating ring (core only) */}
        {isCore && (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
              style={{
                position: 'absolute',
                inset: -8,
                borderRadius: '50%',
                border: `1px dashed ${node.glow}40`,
              }}
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              style={{
                position: 'absolute',
                inset: -20,
                borderRadius: '50%',
                border: `1px solid ${node.glow}15`,
              }}
            />
          </>
        )}

        {/* Pulse dot */}
        {node.pulse && (
          <motion.div
            animate={{ scale: [1, 2.5, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: `${node.glow}08`,
            }}
          />
        )}

        {/* Status dot */}
        <div style={{
          position: 'absolute',
          top: 10, right: 10,
          width: 7, height: 7,
          borderRadius: '50%',
          background: node.status === 'active' ? '#10b981' : node.status === 'dream' ? '#6366f1' : '#f59e0b',
          boxShadow: `0 0 8px ${node.status === 'active' ? '#10b981' : '#6366f1'}`,
        }} />

        {/* Icon */}
        <span style={{ fontSize: isCore ? 32 : 22, color: node.glow, lineHeight: 1, marginBottom: 6, filter: `drop-shadow(0 0 8px ${node.glow})` }}>
          {node.icon}
        </span>

        {/* Labels */}
        <span style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: isCore ? 15 : 9,
          fontWeight: 900,
          color: isCore ? node.glow : 'rgba(255,255,255,0.8)',
          letterSpacing: '0.15em',
          textAlign: 'center',
          lineHeight: 1.1,
          textShadow: `0 0 15px ${node.glow}80`,
        }}>
          {node.label}
        </span>
        <span style={{
          fontSize: 7.5,
          color: 'rgba(255,255,255,0.3)',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          marginTop: 4,
          fontFamily: 'monospace',
        }}>
          {node.sublabel}
        </span>

        {/* Hover tooltip */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              style={{
                position: 'absolute',
                top: '110%',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0,0,0,0.85)',
                border: `1px solid ${node.glow}40`,
                borderRadius: 8,
                padding: '5px 12px',
                whiteSpace: 'nowrap',
                fontSize: 9,
                color: node.glow,
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '0.15em',
                backdropFilter: 'blur(8px)',
                pointerEvents: 'none',
                zIndex: 100,
              }}
            >
              → {node.route.split('/').pop()?.toUpperCase()}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Link>
  )
}

// ─── Main ScreenHub ──────────────────────────────────────────────────────────
function ScreenHub() {
  const [hovered, setHovered] = useState<string | null>(null)
  const [tick, setTick] = useState(0)
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const iv = setInterval(() => { setTick(t => t + 1); setTime(new Date()) }, 1000)
    return () => clearInterval(iv)
  }, [])

  const activeNode = hovered ? NODES.find(n => n.id === hovered) : null

  return (
    <div className="w-screen h-screen bg-[#010205] overflow-hidden relative select-none" style={{ fontFamily: "'Rajdhani', sans-serif" }}>

      {/* Deep space gradient */}
      <div className="absolute inset-0 z-0"
        style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(6,182,212,0.04) 0%, rgba(0,0,0,1) 70%)' }}
      />

      {/* Subtle grid */}
      <div className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(6,182,212,1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Particle canvas */}
      <ParticleCanvas />

      {/* Neural SVG connections */}
      <NeuralLines />

      {/* ── HEADER ── */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-start justify-between p-7 pointer-events-none">
        {/* LEFT: time + build */}
        <div className="flex flex-col gap-1 pointer-events-none">
          <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(6,182,212,0.4)', letterSpacing: '0.3em' }}>
            {time.toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          <span style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.15)', letterSpacing: '0.25em' }}>
            YAMAOO NEXUS · BUILD 3.0.1 · BAREMETAL ACTIVE
          </span>
        </div>

        {/* CENTER: Title */}
        <div className="absolute left-1/2 top-7 -translate-x-1/2 text-center pointer-events-none">
          <motion.h1
            animate={{ textShadow: ['0 0 20px #22d3ee80', '0 0 50px #22d3eecc', '0 0 20px #22d3ee80'] }}
            transition={{ duration: 4, repeat: Infinity }}
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 28,
              fontWeight: 900,
              letterSpacing: '0.5em',
              background: 'linear-gradient(135deg, #22d3ee, #a855f7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            YAMAOO NEXUS
          </motion.h1>
          <p style={{ fontSize: 9, color: 'rgba(6,182,212,0.5)', letterSpacing: '0.5em', textTransform: 'uppercase', fontFamily: 'monospace', marginTop: 6 }}>
            Arbre Généalogique Synaptique · Organisme Vivant
          </p>
        </div>

        {/* RIGHT: live status */}
        <div className="flex flex-col items-end gap-1.5 pointer-events-none">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }}
            />
            <span style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(16,185,129,0.7)', letterSpacing: '0.2em' }}>
              {NODES.filter(n => n.status === 'active').length} DIMENSIONS ACTIVES
            </span>
          </div>
          <span style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.15)', letterSpacing: '0.2em' }}>
            SYNC 99.8% · MEM_WARDEN OK
          </span>
        </div>
      </div>

      {/* ── FLOATING NODES ── */}
      {NODES.map(node => (
        <NexusNodeCard key={node.id} node={node} hovered={hovered} onHover={setHovered} onPreload={preloadRoute} />
      ))}

      {/* ── HOVER SIDE INFO PANEL ── */}
      <AnimatePresence>
        {activeNode && (
          <motion.div
            key={activeNode.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute left-6 bottom-24 z-50 pointer-events-none"
            style={{ width: 220 }}
          >
            <div style={{
              background: 'rgba(0,0,0,0.85)',
              border: `1px solid ${activeNode.glow}30`,
              borderRadius: 16,
              padding: '16px 20px',
              backdropFilter: 'blur(16px)',
            }}>
              <p style={{ fontSize: 8, color: activeNode.glow, fontFamily: 'monospace', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 10 }}>
                DIMENSION INFO
              </p>
              <p style={{ fontSize: 16, fontWeight: 900, color: 'white', letterSpacing: '0.1em', fontFamily: "'Orbitron', sans-serif" }}>
                {activeNode.label}
              </p>
              <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace', marginTop: 4, letterSpacing: '0.2em' }}>
                {activeNode.sublabel}
              </p>
              <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 8, fontFamily: 'monospace', padding: '3px 8px', borderRadius: 20,
                  background: `${activeNode.glow}15`, color: activeNode.glow, border: `1px solid ${activeNode.glow}30`, letterSpacing: '0.15em' }}>
                  {activeNode.status.toUpperCase()}
                </span>
                <span style={{ fontSize: 8, fontFamily: 'monospace', padding: '3px 8px', borderRadius: 20,
                  background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.08)', letterSpacing: '0.15em' }}>
                  {activeNode.route.split('/').pop()?.toUpperCase()}
                </span>
              </div>
              {activeNode.connections.length > 0 && (
                <p style={{ fontSize: 8, fontFamily: 'monospace', color: 'rgba(255,255,255,0.2)', marginTop: 10, letterSpacing: '0.1em' }}>
                  Links → {activeNode.connections.join(' · ').toUpperCase()}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── BOTTOM NAV: secondary dimensions ── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4">
        {SECONDARY.map(s => (
          <Link key={s.route} to={s.route} onFocus={() => preloadRoute(s.route)}>
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.96 }}
              style={{
                padding: '8px 20px',
                borderRadius: 40,
                background: 'rgba(0,0,0,0.6)',
                border: `1px solid rgba(255,255,255,0.07)`,
                fontSize: 9,
                fontFamily: 'monospace',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.35)',
                cursor: 'pointer',
                backdropFilter: 'blur(12px)',
                transition: 'all 0.25s',
              }}
              onHoverStart={e => {
                preloadRoute(s.route)
                ;(e.currentTarget as HTMLElement).style.color = s.color
                ;(e.currentTarget as HTMLElement).style.borderColor = `${s.color}50`
              }}
              onHoverEnd={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)' }}
            >
              {s.label}
            </motion.div>
          </Link>
        ))}
      </div>

      {/* ── BOTTOM RIGHT: live tick ── */}
      <div className="absolute bottom-6 right-7 z-50 pointer-events-none">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
            style={{ width: 4, height: 4, borderRadius: '50%', background: '#06b6d4' }}
          />
          <span style={{ fontFamily: 'monospace', fontSize: 8, color: 'rgba(6,182,212,0.3)', letterSpacing: '0.2em' }}>
            HEARTBEAT #{tick}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Router ──────────────────────────────────────────────────────────────────
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          <Route path="/"                  element={<ScreenHub />} />
          <Route path="/screen/yama"       element={<App />} />
          <Route path="/screen/cinema"     element={<CinemaDimension />} />
          <Route path="/screen/music"      element={<MusicDimension />} />
          <Route path="/screen/social"     element={<SocialDimension />} />
          <Route path="/screen/swarm"      element={<SwarmDimension />} />
          <Route path="/screen/dream"      element={<DreamStateDimension />} />
          <Route path="/screen/home"       element={<HomeScreen />} />
          <Route path="/screen/education"  element={<EducationScreen />} />
          <Route path="/screen/creator"    element={<CreatorLabScreen />} />
          <Route path="/screen/care"       element={<HealthCareScreen />} />
          <Route path="/screen/hippocampus" element={<HippocampusScreen />} />
          <Route path="/screen/phage"       element={<ImmuneSystemScreen />} />
          <Route path="/screen/neuroforge"  element={<NeuroForgeScreen />} />
          <Route path="/screen/cortex"      element={<CortexScreen />} />
          <Route path="/screen/chrono"      element={<ChronoFluxScreen />} />
          <Route path="*"                  element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
)
