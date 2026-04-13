export default function Home({ onNavigate }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 border-b border-zinc-900">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-black text-zinc-900"
            style={{ background: 'linear-gradient(135deg, #e8ff47, #b8f400)' }}
          >
            G
          </div>
          <span className="font-bold text-white tracking-tight text-sm">Gymistry</span>
        </div>
        <span className="text-xs text-zinc-600 uppercase tracking-widest font-medium">
          AI Personal Trainer
        </span>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-5 py-16">
        <div className="text-center mb-14 max-w-xl">
          <div
            className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6"
            style={{
              background: 'rgba(232, 255, 71, 0.1)',
              color: '#e8ff47',
              border: '1px solid rgba(232, 255, 71, 0.2)',
            }}
          >
            Phases 1, 2 + 3 Available
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight mb-4">
            Train smarter with{' '}
            <span className="text-gradient">AI coaching</span>
          </h1>
          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
            Get a personalized workout program or upload a video for professional
            form analysis — powered by the same intelligence as a certified trainer.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full max-w-3xl">
          {/* Program Card */}
          <button
            onClick={() => onNavigate('intake')}
            className="group relative card-glass rounded-2xl p-7 text-left hover:border-lime-400/40 transition-all duration-300 hover:-translate-y-1"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5"
              style={{ background: 'rgba(232, 255, 71, 0.1)', border: '1px solid rgba(232,255,71,0.2)' }}
            >
              🏋️
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Build My Program</h2>
            <p className="text-sm text-zinc-400 leading-relaxed mb-5">
              Complete a trainer intake and get a full personalized 4-week
              workout program with exercises, sets, reps, and coaching notes.
            </p>
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(232,255,71,0.12)', color: '#e8ff47' }}
              >
                ~5 min intake
              </span>
              <span className="text-xs text-zinc-500">→</span>
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(232,255,71,0.12)', color: '#e8ff47' }}
              >
                Full 4-week plan
              </span>
            </div>
            <div
              className="absolute bottom-5 right-5 text-zinc-600 group-hover:text-lime-400 transition-colors text-lg"
            >
              →
            </div>
          </button>

          {/* Form Check Card */}
          <button
            onClick={() => onNavigate('formcheck')}
            className="group relative card-glass rounded-2xl p-7 text-left hover:border-lime-400/40 transition-all duration-300 hover:-translate-y-1"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5"
              style={{ background: 'rgba(232, 255, 71, 0.1)', border: '1px solid rgba(232,255,71,0.2)' }}
            >
              🎥
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Form Check</h2>
            <p className="text-sm text-zinc-400 leading-relaxed mb-5">
              Upload a video of any exercise. AI analyzes your joint angles and
              movement patterns, then gives you detailed coaching feedback.
            </p>
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(232,255,71,0.12)', color: '#e8ff47' }}
              >
                Upload video
              </span>
              <span className="text-xs text-zinc-500">→</span>
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(232,255,71,0.12)', color: '#e8ff47' }}
              >
                Instant analysis
              </span>
            </div>
            <div
              className="absolute bottom-5 right-5 text-zinc-600 group-hover:text-lime-400 transition-colors text-lg"
            >
              →
            </div>
          </button>

          {/* Live Trainer Card */}
          <button
            onClick={() => onNavigate('livetrainer')}
            className="group relative card-glass rounded-2xl p-7 text-left hover:border-lime-400/40 transition-all duration-300 hover:-translate-y-1 sm:col-span-2 lg:col-span-1"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ background: 'rgba(232, 255, 71, 0.1)', border: '1px solid rgba(232,255,71,0.2)' }}
              >
                🎙️
              </div>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)' }}
              >
                LIVE
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Live Trainer</h2>
            <p className="text-sm text-zinc-400 leading-relaxed mb-5">
              Turn on your camera and train with a live AI trainer — counts reps
              out loud, corrects form in real time, and flags injury risk.
            </p>
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(232,255,71,0.12)', color: '#e8ff47' }}
              >
                Live camera
              </span>
              <span className="text-xs text-zinc-500">→</span>
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(232,255,71,0.12)', color: '#e8ff47' }}
              >
                Voice coaching
              </span>
            </div>
            <div className="absolute bottom-5 right-5 text-zinc-600 group-hover:text-lime-400 transition-colors text-lg">
              →
            </div>
          </button>
        </div>

        {/* Bottom note */}
        <p className="mt-10 text-xs text-zinc-600 text-center max-w-sm">
          Powered by Claude AI + MediaPipe Pose — no account required.
        </p>
      </main>
    </div>
  );
}
