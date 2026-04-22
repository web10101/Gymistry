import { Dumbbell, Video, Zap, BookOpen, ChevronRight } from 'lucide-react';

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

export default function Home({ onNavigate }) {
  return (
    <div className="min-h-screen flex flex-col mx-auto px-5" style={{ maxWidth: 480 }}>
      {/* Header */}
      <header className="flex items-center pt-14 pb-10">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-black text-sm"
            style={{ background: '#00ff87' }}
          >
            G
          </div>
          <span className="font-bold text-white tracking-tight text-base">Gymistry</span>
        </div>
      </header>

      {/* Hero */}
      <div className="mb-10">
        <h1 className="text-[38px] font-extrabold text-white leading-[1.1] tracking-tight mb-3">
          Train smarter.<br />
          <span style={{ color: '#00ff87' }}>Not harder.</span>
        </h1>
        <p className="text-base leading-relaxed" style={{ color: '#888888' }}>
          AI-powered personal training in your pocket.
        </p>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-2 gap-3">
        {FEATURES.map(({ id, Icon, name, desc, live }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className="group relative text-left rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
            style={{ background: '#111111', border: '1px solid #222222' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0,255,135,0.35)';
              e.currentTarget.style.boxShadow   = '0 4px 24px rgba(0,255,135,0.07)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#222222';
              e.currentTarget.style.boxShadow   = 'none';
            }}
          >
            {/* Icon + Live badge */}
            <div className="mb-4 flex items-start justify-between">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(0,255,135,0.1)' }}
              >
                <Icon size={20} style={{ color: '#00ff87' }} strokeWidth={2} />
              </div>
              {live && (
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0"
                  style={{ background: 'rgba(0,255,135,0.12)', color: '#00ff87', border: '1px solid rgba(0,255,135,0.25)' }}
                >
                  Live
                </span>
              )}
            </div>

            {/* Text */}
            <h2 className="text-sm font-bold text-white leading-snug mb-1.5">{name}</h2>
            <p className="text-xs leading-relaxed" style={{ color: '#666666' }}>{desc}</p>

            {/* Arrow */}
            <ChevronRight
              size={14}
              className="absolute bottom-4 right-4 transition-all duration-200 group-hover:translate-x-0.5"
              style={{ color: '#333333' }}
            />
          </button>
        ))}
      </div>

      {/* Footer note */}
      <p className="text-center text-xs mt-10 mb-4" style={{ color: '#333333' }}>
        Powered by Claude AI + MediaPipe Pose
      </p>
    </div>
  );
}
