import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, SkipForward, SkipBack, Disc,
  ChevronLeft, Volume2, Shuffle, Repeat, Heart,
  ListMusic
} from 'lucide-react';
import { Link } from 'react-router-dom';

const PLAYLIST = [
  { id: 1, title: 'Interstellar Theme', artist: 'Hans Zimmer', duration: 268, genre: 'Cinematic' },
  { id: 2, title: 'Neural Drift', artist: 'YAMA Synthesis', duration: 194, genre: 'Organic Techno' },
  { id: 3, title: 'Djoune', artist: 'Youssou N\'Dour', duration: 312, genre: 'Afro-Soul' },
  { id: 4, title: 'Black Hole Sun', artist: 'Soundgarden', duration: 325, genre: 'Rock' },
  { id: 5, title: 'Quantum Lullaby', artist: 'YAMA Synthesis', duration: 221, genre: 'Ambient Neural' },
];

const SOURCES = [
  { id: 'SPOTIFY', label: 'Spotify', color: '#1DB954', icon: '♫' },
  { id: 'APPLE', label: 'Apple Music', color: '#FA243C', icon: '' },
  { id: 'LOCAL', label: 'Neural Audio', color: '#06B6D4', icon: '⚙' },
  { id: 'YOUTUBE', label: 'YT Music', color: '#FF0000', icon: '▶' },
];

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function MusicDimension() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSource, setActiveSource] = useState('LOCAL');
  const [trackIndex, setTrackIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(78);
  const [liked, setLiked] = useState<number[]>([]);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [bars, setBars] = useState<number[]>(Array(64).fill(4));
  const animRef = useRef<number>(0);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const track = PLAYLIST[trackIndex];
  const src = SOURCES.find(s => s.id === activeSource)!;

  // Animate visualizer bars
  useEffect(() => {
    const animate = () => {
      setBars(prev => prev.map(() =>
        isPlaying
          ? Math.random() * 90 + 10
          : Math.max(4, prev[0] - 2)
      ));
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying]);

  // Progress ticker
  useEffect(() => {
    if (progressRef.current) clearInterval(progressRef.current);
    if (isPlaying) {
      progressRef.current = setInterval(() => {
        setProgress(p => {
          if (p >= track.duration) {
            nextTrack();
            return 0;
          }
          return p + 1;
        });
      }, 1000);
    }
    return () => { if (progressRef.current) clearInterval(progressRef.current); };
  }, [isPlaying, trackIndex]);

  const nextTrack = () => {
    if (shuffle) {
      setTrackIndex(Math.floor(Math.random() * PLAYLIST.length));
    } else {
      setTrackIndex(i => (i + 1) % PLAYLIST.length);
    }
    setProgress(0);
  };

  const prevTrack = () => {
    setTrackIndex(i => (i - 1 + PLAYLIST.length) % PLAYLIST.length);
    setProgress(0);
  };

  const toggleLike = (id: number) => {
    setLiked(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const progressPct = (progress / track.duration) * 100;

  return (
    <div className="h-screen w-screen bg-[#060408] overflow-hidden relative font-sans text-white select-none">
      {/* === VISUALIZER BACKGROUND === */}
      <div className="absolute inset-0 flex items-end justify-center gap-[2px] px-2 pb-0 opacity-20 pointer-events-none">
        {bars.map((h, i) => (
          <motion.div
            key={i}
            animate={{ height: `${h}%` }}
            transition={{ duration: 0.08 }}
            className="flex-1 rounded-t-full"
            style={{
              background: `hsl(${180 + i * 2}, 80%, 60%)`,
              height: `${h}%`,
              maxWidth: '12px'
            }}
          />
        ))}
      </div>

      {/* === AMBIENT GLOW === */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-1000"
        style={{
          background: `radial-gradient(ellipse at 50% 100%, ${src.color}15 0%, transparent 70%)`
        }}
      />

      {/* === TOP BAR === */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50">
        <Link to="/" className="flex items-center gap-2 text-white/50 hover:text-white transition bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md text-xs font-bold uppercase tracking-widest">
          <ChevronLeft size={16} /> Sortir du Studio
        </Link>
        <div className="flex items-center gap-2 text-[10px] text-white/30 font-mono uppercase tracking-widest">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: src.color }} />
          {src.label} · Neural Audio Engine v3.1
        </div>
        <button
          onClick={() => setShowPlaylist(!showPlaylist)}
          className="flex items-center gap-2 text-white/50 hover:text-white transition bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md text-xs font-bold uppercase tracking-widest"
        >
          <ListMusic size={14} /> Playlist
        </button>
      </div>

      {/* === MAIN CONTENT === */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-8 z-10" style={{ width: '480px' }}>

          {/* DISC */}
          <motion.div
            animate={{ rotate: isPlaying ? 360 : 0 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="w-64 h-64 rounded-full border border-white/10 relative flex items-center justify-center"
            style={{ boxShadow: isPlaying ? `0 0 60px ${src.color}40, 0 0 120px ${src.color}20` : '0 0 30px rgba(0,0,0,0.8)' }}
          >
            <div className="absolute inset-0 rounded-full border-[1px] border-white/5" />
            <div className="absolute inset-4 rounded-full border border-white/5" />
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(from 0deg, ${src.color}20, transparent, ${src.color}10, transparent)`,
              }}
            />
            <div className="w-20 h-20 rounded-full bg-black/80 backdrop-blur-xl border border-white/10 flex items-center justify-center z-10">
              <Disc size={36} className="text-white/30" />
            </div>
          </motion.div>

          {/* TRACK INFO */}
          <div className="text-center">
            <motion.h1
              key={track.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-black tracking-[0.15em] uppercase"
            >
              {track.title}
            </motion.h1>
            <p className="text-white/40 mt-2 tracking-widest text-sm uppercase font-mono">{track.artist} · {track.genre}</p>
          </div>

          {/* PROGRESS BAR */}
          <div className="w-full">
            <div className="relative h-1 bg-white/10 rounded-full cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = (e.clientX - rect.left) / rect.width;
                setProgress(Math.floor(pct * track.duration));
              }}
            >
              <motion.div
                className="h-full rounded-full relative"
                style={{ width: `${progressPct}%`, background: src.color }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-md" />
              </motion.div>
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-white/30 font-mono">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(track.duration)}</span>
            </div>
          </div>

          {/* CONTROLS */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => setShuffle(!shuffle)}
              className={`transition-all ${shuffle ? 'text-white' : 'text-white/30 hover:text-white/60'}`}
              style={shuffle ? { color: src.color } : {}}
            >
              <Shuffle size={20} />
            </button>
            <button onClick={prevTrack} className="text-white/60 hover:text-white transition">
              <SkipBack size={28} />
            </button>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-20 h-20 rounded-full flex items-center justify-center text-black font-black text-2xl transition-all"
              style={{
                background: src.color,
                boxShadow: `0 0 30px ${src.color}80`
              }}
            >
              {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
            </motion.button>
            <button onClick={nextTrack} className="text-white/60 hover:text-white transition">
              <SkipForward size={28} />
            </button>
            <button
              onClick={() => setRepeat(!repeat)}
              className={`transition-all ${repeat ? 'text-white' : 'text-white/30 hover:text-white/60'}`}
              style={repeat ? { color: src.color } : {}}
            >
              <Repeat size={20} />
            </button>
          </div>

          {/* VOLUME + LIKE */}
          <div className="flex items-center gap-6 w-full">
            <Volume2 size={16} className="text-white/30 shrink-0" />
            <div className="flex-1 relative h-1 bg-white/10 rounded-full cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setVolume(Math.round(((e.clientX - rect.left) / rect.width) * 100));
              }}
            >
              <div className="h-full rounded-full" style={{ width: `${volume}%`, background: src.color }} />
            </div>
            <span className="text-[10px] text-white/30 font-mono w-8">{volume}%</span>
            <button onClick={() => toggleLike(track.id)}>
              <Heart
                size={20}
                fill={liked.includes(track.id) ? '#f43f5e' : 'none'}
                className={liked.includes(track.id) ? 'text-rose-500' : 'text-white/30 hover:text-white/60'}
              />
            </button>
          </div>
        </div>
      </div>

      {/* === SOURCE SWITCHER === */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-50">
        {SOURCES.map(s => (
          <motion.button
            key={s.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveSource(s.id)}
            className="px-5 py-2.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all border backdrop-blur-md"
            style={{
              borderColor: activeSource === s.id ? s.color : 'rgba(255,255,255,0.1)',
              background: activeSource === s.id ? `${s.color}20` : 'rgba(0,0,0,0.4)',
              color: activeSource === s.id ? s.color : 'rgba(255,255,255,0.4)',
              boxShadow: activeSource === s.id ? `0 0 20px ${s.color}30` : 'none'
            }}
          >
            {s.icon} {s.label}
          </motion.button>
        ))}
      </div>

      {/* === PLAYLIST DRAWER === */}
      <AnimatePresence>
        {showPlaylist && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="absolute right-0 top-0 bottom-0 w-80 bg-black/80 backdrop-blur-xl border-l border-white/5 z-50 flex flex-col p-6 pt-24"
          >
            <h3 className="text-xs font-black uppercase tracking-widest text-white/50 mb-6">File de lecture</h3>
            <div className="flex-1 overflow-y-auto space-y-2">
              {PLAYLIST.map((t, i) => (
                <motion.div
                  key={t.id}
                  whileHover={{ x: 4 }}
                  onClick={() => { setTrackIndex(i); setProgress(0); setIsPlaying(true); }}
                  className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all ${i === trackIndex ? 'bg-white/10 border border-white/10' : 'hover:bg-white/5'}`}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black"
                    style={{ background: i === trackIndex ? `${src.color}30` : 'rgba(255,255,255,0.05)', color: i === trackIndex ? src.color : 'rgba(255,255,255,0.3)' }}
                  >
                    {i === trackIndex && isPlaying ? '▶' : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold truncate ${i === trackIndex ? 'text-white' : 'text-white/60'}`}>{t.title}</p>
                    <p className="text-[9px] text-white/30 truncate font-mono">{t.artist}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); toggleLike(t.id); }}>
                      <Heart size={12} fill={liked.includes(t.id) ? '#f43f5e' : 'none'} className={liked.includes(t.id) ? 'text-rose-500' : 'text-white/20'} />
                    </button>
                    <span className="text-[9px] text-white/20 font-mono">{formatTime(t.duration)}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
