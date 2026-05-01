import { useState, useEffect, useRef, useCallback } from 'react';
import { Dumbbell, Video, Zap, BookOpen } from 'lucide-react';

const FEATURES = [
  {
    id:   'intake',
    Icon: Dumbbell,
    name: 'Build My Program',
    desc: 'A full 4-week plan built for your body and goals.',
  },
  {
    id:   'formcheck',
    Icon: Video,
    name: 'Form Check',
    desc: 'Upload a video and get instant pro coaching.',
  },
  {
    id:   'livetrainer',
    Icon: Zap,
    name: 'Live Trainer',
    desc: 'Real-time rep counting and form coaching.',
    live: true,
  },
  {
    id:   'library',
    Icon: BookOpen,
    name: 'Exercise Library',
    desc: '290+ exercises with animated form guides.',
  },
];

const NOISE_URI = (() => {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/></filter><rect width="200" height="200" filter="url(#n)"/></svg>';
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
})();

function useCountUp(target, duration = 800) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const steps = 40;
    const intervalMs = duration / steps;
    const increment = target / steps;
    let current = 0;
    const id = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(id);
      } else {
        setCount(Math.floor(current));
      }
    }, intervalMs);
    return () => clearInterval(id);
  }, [target, duration]);
  return count;
}

function FeatureCard({ feature, onNavigate, index }) {
  const { id, Icon, name, desc, live } = feature;
  const cardRef = useRef(null);
  const iconRef = useRef(null);

  const onMouseMove = useCallback((e) => {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    el.style.transition  = 'border-color 0.25s, box-shadow 0.25s';
    el.style.transform   = `perspective(800px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg)`;
    el.style.borderColor = 'rgba(232,255,71,0.4)';
    if (iconRef.current) iconRef.current.style.boxShadow = '0 0 20px rgba(232,255,71,0.35)';
  }, []);

  const onMouseLeave = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transition  = 'border-color 0.25s, box-shadow 0.25s, transform 0.4s cubic-bezier(0.16,1,0.3,1)';
    el.style.transform   = 'perspective(800px) rotateY(0deg) rotateX(0deg)';
    el.style.borderColor = 'rgba(255,255,255,0.07)';
    if (iconRef.current) iconRef.current.style.boxShadow = 'none';
  }, []);

  return (
    <button
      ref={cardRef}
      onClick={() => onNavigate(id)}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="group relative text-left rounded-2xl p-5 card-glass active:scale-[0.98]"
      style={{
        border:      '1px solid rgba(255,255,255,0.07)',
        willChange:  'transform',
        animation:   'cardEntrance 0.55s cubic-bezier(0.16,1,0.3,1) both',
        animationDelay: `${index * 80 + 420}ms`,
      }}
    >
      {/* Icon row */}
      <div className="mb-4 flex items-start justify-between">
        <div
          ref={iconRef}
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(232,255,71,0.1)', transition: 'box-shadow 0.25s' }}
        >
          <Icon size={20} style={{ color: '#e8ff47' }} strokeWidth={2} />
        </div>
        {live && (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="live-dot" />
            <span
              className="text-[9px] font-bold uppercase tracking-wider"
              style={{ color: '#4ade80' }}
            >Live</span>
          </div>
        )}
      </div>

      {/* Text */}
      <h2 className="text-sm font-bold text-white leading-snug mb-1.5">{name}</h2>
      <p className="text-xs leading-relaxed" style={{ color: '#666666' }}>{desc}</p>

      {/* Arrow */}
      <span
        className="absolute bottom-4 right-4 text-xs transition-transform duration-200 group-hover:translate-x-1"
        style={{ color: '#444444' }}
      >→</span>
    </button>
  );
}

export default function Home({ onNavigate }) {
  const exCount = useCountUp(290);
  const wkCount = useCountUp(4);

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>

      {/* ── Full-screen background layer ─────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        {/* Noise texture */}
        <div
          className="absolute inset-0"
          style={{ backgroundImage: NOISE_URI, backgroundRepeat: 'repeat', opacity: 0.03 }}
        />
        {/* Radial glow */}
        <div className="absolute" style={{
          top: 60, left: '50%', transform: 'translateX(-50%)',
          width: 800, height: 400, borderRadius: '50%',
          background: 'rgba(184,244,0,0.08)', filter: 'blur(60px)',
        }} />
        {/* Light beam */}
        <div style={{
          position:   'absolute',
          top:        '-50%',
          left:       0,
          width:      2,
          height:     '200%',
          background: 'rgba(232,255,71,0.15)',
          willChange: 'transform',
          animation:  'beamDrift 8s linear infinite',
        }} />
      </div>

      {/* ── Constrained column ───────────────────────────────────────── */}
      <div
        className="relative flex flex-col mx-auto px-5"
        style={{ maxWidth: 480, zIndex: 1 }}
      >
        {/* Sticky frosted header */}
        <header
          className="sticky top-0 z-50 flex items-center py-4 -mx-5 px-5"
          style={{
            backdropFilter:       'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            background:           'rgba(10,10,10,0.7)',
            borderBottom:         '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-black text-sm"
              style={{ background: '#e8ff47', boxShadow: '0 0 14px rgba(232,255,71,0.45)' }}
            >G</div>
            <span className="font-bold text-white tracking-tight text-base">Gymistry</span>
          </div>
        </header>

        {/* Hero */}
        <div className="pt-12 pb-8">
          <h1 className="text-[38px] font-extrabold text-white leading-[1.1] tracking-tight mb-4">
            <span
              className="block"
              style={{ animation: 'heroLine 0.7s cubic-bezier(0.16,1,0.3,1) both', animationDelay: '0ms' }}
            >Train smarter.</span>
            <span
              className="block"
              style={{ animation: 'heroLine 0.7s cubic-bezier(0.16,1,0.3,1) both', animationDelay: '100ms' }}
            >
              <span className="shimmer-text">AI coaching</span>
              {' '}<span style={{ color: '#e8ff47' }}>that works.</span>
            </span>
          </h1>
          <p
            className="text-base leading-relaxed"
            style={{ color: '#888888', animation: 'heroFade 0.5s ease both', animationDelay: '300ms' }}
          >
            AI-powered personal training in your pocket.
          </p>
        </div>

        {/* Counter strip */}
        <div
          className="flex items-center justify-center mb-10 py-4 rounded-2xl"
          style={{
            background:     'rgba(255,255,255,0.03)',
            border:         '1px solid rgba(255,255,255,0.06)',
            animation:      'heroFade 0.5s ease both',
            animationDelay: '380ms',
          }}
        >
          <div className="flex-1 text-center">
            <p className="text-white text-sm font-bold tabular-nums">{exCount}+</p>
            <p className="text-xs mt-0.5" style={{ color: '#71717a' }}>Exercises</p>
          </div>
          <div className="w-px self-stretch my-3" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <div className="flex-1 text-center">
            <p className="text-white text-sm font-bold tabular-nums">{wkCount}-Week</p>
            <p className="text-xs mt-0.5" style={{ color: '#71717a' }}>Programs</p>
          </div>
          <div className="w-px self-stretch my-3" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <div className="flex-1 text-center">
            <p className="text-white text-sm font-bold">Real-time</p>
            <p className="text-xs mt-0.5" style={{ color: '#71717a' }}>Form AI</p>
          </div>
        </div>

        {/* Feature cards — 2-col grid preserved */}
        <div className="grid grid-cols-2 gap-3">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.id} feature={f} onNavigate={onNavigate} index={i} />
          ))}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs mt-10 mb-4" style={{ color: '#333333' }}>
          Powered by Claude AI + MediaPipe Pose
        </p>
      </div>

      {/* ── All keyframes ─────────────────────────────────────────────── */}
      <style>{`
        @keyframes heroLine {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroFade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes cardEntrance {
          from { opacity: 0; transform: perspective(800px) translateY(24px); }
          to   { opacity: 1; transform: perspective(800px) translateY(0); }
        }
        @keyframes beamDrift {
          from { transform: translateX(-100px) rotate(35deg); }
          to   { transform: translateX(110vw)  rotate(35deg); }
        }
        @keyframes shimmer {
          from { background-position: 0%    center; }
          to   { background-position: 200%  center; }
        }
        @keyframes livePulse {
          0%, 100% { transform: scale(1);   box-shadow: 0 0 0   0   rgba(74,222,128,0.5); }
          50%       { transform: scale(1.4); box-shadow: 0 0 8px 2px rgba(74,222,128,0.4); }
        }
        .shimmer-text {
          background: linear-gradient(90deg, #e8ff47 0%, #ffffff 50%, #e8ff47 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 2.5s linear infinite;
        }
        .live-dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #4ade80;
          animation: livePulse 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
