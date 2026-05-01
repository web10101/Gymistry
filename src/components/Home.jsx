import { useState, useEffect, useRef, useCallback } from 'react';

const FEATURES = [
  {
    id:    'intake',
    emoji: '🏋️',
    name:  'Build My Program',
    desc:  'A full 4-week plan built for your body and goals.',
  },
  {
    id:    'formcheck',
    emoji: '🎥',
    name:  'Form Check',
    desc:  'Upload a video and get instant pro coaching.',
  },
  {
    id:    'livetrainer',
    emoji: '⚡',
    name:  'Live Trainer',
    desc:  'Real-time rep counting and form coaching.',
    live:  true,
  },
  {
    id:    'library',
    emoji: '📚',
    name:  'Exercise Library',
    desc:  '290+ exercises with animated form guides.',
  },
];

const NOISE_URI = (() => {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/></filter><rect width="200" height="200" filter="url(#n)"/></svg>';
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
})();

function useCountUpRAF(target, duration = 1200) {
  const [count, setCount] = useState(0);
  const rafRef = useRef(null);
  useEffect(() => {
    let start = null;
    const easeOut = (t) => 1 - (1 - t) ** 3;
    const step = (ts) => {
      if (!start) start = ts;
      const t = Math.min((ts - start) / duration, 1);
      setCount(Math.round(easeOut(t) * target));
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);
  return count;
}

function FeatureCard({ feature, onNavigate, index }) {
  const wrapRef  = useRef(null);
  const cardRef  = useRef(null);
  const iconRef  = useRef(null);
  const [hovered, setHovered] = useState(false);

  const DELAYS = [80, 160, 240, 320];

  const onMouseMove = useCallback((e) => {
    const wrap = wrapRef.current;
    const card = cardRef.current;
    if (!wrap || !card) return;
    const r = wrap.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    card.style.transition = 'transform 0.15s ease, border-color 0.25s, box-shadow 0.25s';
    card.style.transform  = `rotateY(${x * 8}deg) rotateX(${-y * 6}deg)`;
  }, []);

  const onMouseEnter = useCallback(() => setHovered(true), []);

  const onMouseLeave = useCallback(() => {
    setHovered(false);
    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1), border-color 0.25s, box-shadow 0.25s';
      cardRef.current.style.transform  = 'rotateY(0deg) rotateX(0deg)';
    }
  }, []);

  return (
    <div
      ref={wrapRef}
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        perspective: '1000px',
        flexShrink:  0,
        width:       260,
        animation:   `cardEntrance 0.6s cubic-bezier(0.16,1,0.3,1) both`,
        animationDelay: `${DELAYS[index] || 80}ms`,
      }}
    >
      <div
        ref={cardRef}
        style={{
          height:      340,
          background:  'rgba(255,255,255,0.025)',
          border:      hovered ? '1px solid rgba(232,255,71,0.35)' : '1px solid rgba(255,255,255,0.07)',
          boxShadow:   hovered ? '0 24px 80px -12px rgba(184,244,0,0.15)' : 'none',
          borderRadius: 20,
          padding:     24,
          display:     'flex',
          flexDirection: 'column',
          cursor:      'pointer',
          willChange:  'transform',
        }}
        onClick={() => onNavigate(feature.id)}
      >
        {/* Icon */}
        <div
          ref={iconRef}
          style={{
            width:        72,
            height:       72,
            borderRadius: 18,
            background:   'rgba(232,255,71,0.08)',
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'center',
            fontSize:     32,
            marginBottom: 20,
            flexShrink:   0,
            boxShadow:    hovered ? '0 0 24px rgba(232,255,71,0.4)' : 'none',
            transition:   'box-shadow 0.25s',
          }}
        >
          <span style={{ animation: hovered ? 'floatY 2s ease-in-out infinite' : 'none', display: 'block' }}>
            {feature.emoji}
          </span>
        </div>

        {/* Live badge */}
        {feature.live && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span className="live-dot" />
            <span style={{ fontSize: 9, fontWeight: 700, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Live
            </span>
          </div>
        )}

        {/* Text */}
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#fff', lineHeight: 1.3, margin: '0 0 8px' }}>
            {feature.name}
          </h2>
          <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6, margin: 0 }}>
            {feature.desc}
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate(feature.id); }}
          className="btn-primary"
          style={{ borderRadius: 12, height: 44, marginTop: 16, fontSize: 13 }}
        >
          Open →
        </button>
      </div>
    </div>
  );
}

export default function Home({ onNavigate }) {
  const [shown, setShown] = useState(false);
  const exCount = useCountUpRAF(290);
  const wkCount = useCountUpRAF(4);

  useEffect(() => {
    const t = setTimeout(() => setShown(true), 50);
    return () => clearTimeout(t);
  }, []);

  const lineStyle = (delayMs) => ({
    opacity:           shown ? 1 : 0,
    transform:         shown ? 'translateY(0)' : 'translateY(32px)',
    transition:        shown ? `opacity 700ms cubic-bezier(0.16,1,0.3,1) ${delayMs}ms, transform 700ms cubic-bezier(0.16,1,0.3,1) ${delayMs}ms` : 'none',
  });

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>

      {/* ── Full-screen background layer ─────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        {/* Layer 3: noise */}
        <div className="absolute inset-0"
          style={{ backgroundImage: NOISE_URI, backgroundRepeat: 'repeat', opacity: 0.03 }} />
        {/* Layer 2: radial glow at 50% 35% */}
        <div className="absolute" style={{
          top: '35%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 900, height: 400, borderRadius: '50%',
          background: 'rgba(184,244,0,0.07)', filter: 'blur(80px)',
        }} />
        {/* Layer 1: diagonal beam */}
        <div style={{
          position:   'absolute',
          top:        '-50%',
          left:       0,
          width:      2,
          height:     '200%',
          background: 'rgba(232,255,71,0.12)',
          willChange: 'transform',
          animation:  'beamDrift 12s linear infinite',
        }} />
      </div>

      {/* ── Constrained column (header + hero + stats) ───────────────── */}
      <div className="relative" style={{ maxWidth: 480, margin: '0 auto', padding: '0 20px', zIndex: 1 }}>

        {/* Sticky frosted header */}
        <header
          className="sticky top-0 z-50 flex items-center py-4 -mx-5 px-5"
          style={{
            backdropFilter:       'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            background:           'rgba(10,10,10,0.75)',
            borderBottom:         '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-black text-sm glow-pulse"
              style={{ background: '#e8ff47' }}
            >G</div>
            <span className="font-bold text-white tracking-tight text-base">Gymistry</span>
          </div>
        </header>

        {/* Hero */}
        <div className="pt-12 pb-8">
          <h1 className="font-extrabold text-white leading-[1.1] tracking-tight mb-4"
            style={{ fontSize: 38 }}>
            <span className="block" style={lineStyle(0)}>Train smarter.</span>
            <span className="block" style={lineStyle(120)}>
              <span className="shimmer-ai">AI coaching</span>
              {' '}<span style={{ color: '#e8ff47' }}>that works.</span>
            </span>
          </h1>
          <p className="text-base leading-relaxed" style={{ color: '#888', ...lineStyle(240) }}>
            AI-powered personal training in your pocket.
          </p>
        </div>

        {/* Stats strip */}
        <div
          className="flex items-center justify-center mb-8 py-4 rounded-2xl"
          style={{
            background:     'rgba(255,255,255,0.03)',
            border:         '1px solid rgba(255,255,255,0.06)',
            ...lineStyle(320),
          }}
        >
          <div className="flex-1 text-center">
            <p className="text-white font-bold tabular-nums" style={{ fontSize: 22 }}>{exCount}+</p>
            <p className="text-xs mt-0.5" style={{ color: '#71717a' }}>Exercises</p>
          </div>
          <div className="w-px self-stretch my-3" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <div className="flex-1 text-center">
            <p className="text-white font-bold tabular-nums" style={{ fontSize: 22 }}>{wkCount}</p>
            <p className="text-xs mt-0.5" style={{ color: '#71717a' }}>Week Programs</p>
          </div>
          <div className="w-px self-stretch my-3" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <div className="flex-1 text-center">
            <p className="text-white font-bold" style={{ fontSize: 22 }}>AI</p>
            <p className="text-xs mt-0.5" style={{ color: '#71717a' }}>Real-time Form</p>
          </div>
        </div>
      </div>

      {/* ── Full-width horizontal card rail ──────────────────────────── */}
      <div className="relative" style={{ zIndex: 1 }}>
        <div style={{
          overflowX:               'auto',
          scrollbarWidth:          'none',
          WebkitOverflowScrolling: 'touch',
          paddingLeft:             20,
          paddingRight:            20,
          paddingBottom:           20,
        }}>
          <div style={{ display: 'flex', gap: 16, width: 'max-content' }}>
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.id} feature={f} onNavigate={onNavigate} index={i} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <div className="relative" style={{ maxWidth: 480, margin: '0 auto', padding: '0 20px', zIndex: 1 }}>
        <p className="text-center text-xs mt-6 mb-6" style={{ color: '#333' }}>
          Powered by Claude AI + MediaPipe Pose
        </p>
      </div>

      <style>{`
        @keyframes beamDrift {
          from { transform: translateX(-150px) rotate(35deg); }
          to   { transform: translateX(110vw)  rotate(35deg); }
        }
        @keyframes livePulse {
          0%, 100% { transform: scale(1);   box-shadow: 0 0 0   0   rgba(74,222,128,0.5); }
          50%       { transform: scale(1.4); box-shadow: 0 0 8px 2px rgba(74,222,128,0.4); }
        }
        .shimmer-ai {
          background: linear-gradient(90deg, #b8f400, #e8ff47, #ffffff, #e8ff47, #b8f400);
          background-size: 300% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
        .live-dot {
          display: inline-block;
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #4ade80;
          animation: livePulse 1.5s ease-in-out infinite;
        }
        div[style*="overflow-x"]::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
