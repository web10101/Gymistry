const primaryActions = [
  {
    id: 'livetrainer',
    icon: '🎙️',
    title: 'Start Live Trainer',
    desc: 'Camera rep counting, voice cues, and form alerts in real time.',
    cta: 'Start session',
    featured: true,
  },
  {
    id: 'formcheck',
    icon: '🎥',
    title: 'Form Check',
    desc: 'Upload a lift video and get joint-angle coaching feedback.',
    cta: 'Analyze video',
  },
  {
    id: 'intake',
    icon: '🏋️',
    title: 'Build Program',
    desc: 'Generate a personalized 4-week training block.',
    cta: 'Create plan',
  },
  {
    id: 'library',
    icon: '📚',
    title: 'Exercise Library',
    desc: 'Browse 290+ movements, cues, and common mistakes.',
    cta: 'Browse',
  },
];

const todaysWorkout = [
  ['Back Squat', '4 x 6', 'Form target: knees track over toes'],
  ['Romanian Deadlift', '3 x 8', 'Keep ribs stacked and hips back'],
  ['Walking Lunge', '3 x 10', 'Smooth tempo, no knee collapse'],
];

const metrics = [
  ['Readiness', '86%', '+12%'],
  ['Form score', '92', 'stable'],
  ['Weekly volume', '18 sets', '+4 sets'],
];

export default function Home({ onNavigate }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070807] text-white">
      <div className="fixed inset-0 -z-10 gymistry-grid opacity-60" />
      <div className="fixed -left-28 top-12 -z-10 h-80 w-80 rounded-full bg-lime-300/20 blur-3xl animate-blob" />
      <div className="fixed bottom-0 right-0 -z-10 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl animate-blob-delayed" />

      <div className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 lg:grid-cols-[260px_1fr]">
        <aside className="hidden border-r border-white/10 bg-zinc-950/45 p-5 backdrop-blur-2xl lg:flex lg:flex-col">
          <button onClick={() => onNavigate('home')} className="flex items-center gap-3 text-left">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-zinc-950 bg-lime-300 text-xl font-black text-zinc-950 shadow-[4px_4px_0_#000]">G</span>
            <span>
              <span className="block text-lg font-black tracking-tight">Gymistry</span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.28em] text-lime-200/70">AI trainer</span>
            </span>
          </button>

          <nav className="mt-10 space-y-2">
            {primaryActions.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="group flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3 text-left text-sm font-bold text-zinc-300 transition hover:border-lime-300/40 hover:bg-lime-300 hover:text-zinc-950"
              >
                <span className="text-lg">{item.icon}</span>
                {item.title}
              </button>
            ))}
          </nav>

          <div className="mt-auto rounded-[1.5rem] border border-lime-300/20 bg-lime-300/10 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-lime-200">Coach note</p>
            <p className="mt-3 text-sm font-semibold leading-6 text-zinc-200">Your lower-body day is loaded. Start with Live Trainer for real-time squat feedback.</p>
          </div>
        </aside>

        <main className="p-4 sm:p-6 lg:p-8">
          <header className="mb-6 flex items-center justify-between gap-4 lg:hidden">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-lime-300 font-black text-zinc-950">G</span>
              <div>
                <h1 className="font-black">Gymistry</h1>
                <p className="text-xs text-zinc-500">AI training dashboard</p>
              </div>
            </div>
            <button onClick={() => onNavigate('livetrainer')} className="rounded-full bg-lime-300 px-4 py-2 text-xs font-black uppercase text-zinc-950">Live</button>
          </header>

          <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl sm:p-8">
              <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-lime-300/20 blur-3xl" />
              <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="inline-flex rounded-full border border-lime-300/25 bg-lime-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-lime-200">Today in Gymistry</p>
                  <h2 className="mt-5 max-w-2xl text-5xl font-black uppercase leading-[0.88] tracking-[-0.08em] sm:text-7xl">Lower body strength</h2>
                  <p className="mt-5 max-w-xl text-sm font-semibold leading-6 text-zinc-400 sm:text-base">AI coach has your session ready: heavy squats, hinge work, unilateral control, and live form tracking.</p>
                </div>
                <button onClick={() => onNavigate('livetrainer')} className="rounded-2xl border-2 border-zinc-950 bg-lime-300 px-6 py-4 text-sm font-black uppercase tracking-wider text-zinc-950 shadow-[7px_7px_0_#000] transition hover:-translate-y-1 hover:shadow-[10px_10px_0_#000]">Start workout →</button>
              </div>

              <div className="relative z-10 mt-8 grid gap-3 sm:grid-cols-3">
                {metrics.map(([label, value, trend]) => (
                  <div key={label} className="rounded-3xl border border-white/10 bg-zinc-950/60 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">{label}</p>
                    <div className="mt-3 flex items-end justify-between gap-3">
                      <span className="text-3xl font-black text-white">{value}</span>
                      <span className="rounded-full bg-lime-300/10 px-2 py-1 text-[10px] font-black text-lime-200">{trend}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-zinc-950/70 p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-lime-200">AI Coach</p>
                  <h3 className="mt-2 text-2xl font-black tracking-tight">Form focus</h3>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-300 text-2xl shadow-[5px_5px_0_#000]">🧠</div>
              </div>

              <div className="mt-6 rounded-3xl border border-lime-300/20 bg-lime-300/10 p-5">
                <p className="text-sm font-semibold leading-6 text-zinc-200">Keep your torso angle consistent on squats. I’ll watch knee travel, hip depth, and left/right symmetry when you start Live Trainer.</p>
              </div>

              <div className="mt-6 space-y-3">
                {['Depth target: parallel', 'Symmetry alert: enabled', 'Voice cues: active'].map((item) => (
                  <div key={item} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                    <span className="text-sm font-bold text-zinc-300">{item}</span>
                    <span className="h-2.5 w-2.5 rounded-full bg-lime-300 shadow-[0_0_18px_rgba(190,242,100,0.8)]" />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-5 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">Session plan</p>
                  <h3 className="mt-1 text-2xl font-black">Today’s lifts</h3>
                </div>
                <button onClick={() => onNavigate('intake')} className="rounded-full border border-white/10 px-3 py-2 text-xs font-black uppercase text-zinc-400 transition hover:bg-white hover:text-zinc-950">New plan</button>
              </div>

              <div className="space-y-3">
                {todaysWorkout.map(([name, sets, cue], index) => (
                  <button key={name} onClick={() => onNavigate('library')} className="group flex w-full items-center gap-4 rounded-3xl border border-white/10 bg-zinc-950/60 p-4 text-left transition hover:border-lime-300/40 hover:bg-lime-300 hover:text-zinc-950">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-sm font-black group-hover:bg-zinc-950 group-hover:text-lime-200">0{index + 1}</span>
                    <span className="flex-1">
                      <span className="block font-black">{name}</span>
                      <span className="mt-1 block text-xs font-semibold text-zinc-500 group-hover:text-zinc-800">{cue}</span>
                    </span>
                    <span className="text-sm font-black">{sets}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {primaryActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => onNavigate(action.id)}
                  className={`group relative overflow-hidden rounded-[2rem] border p-5 text-left transition duration-300 hover:-translate-y-1 hover:shadow-[9px_9px_0_#000] ${action.featured ? 'border-lime-300/40 bg-lime-300 text-zinc-950' : 'border-white/10 bg-white/[0.04] text-white hover:border-zinc-950 hover:bg-white hover:text-zinc-950'}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className={`flex h-13 w-13 items-center justify-center rounded-2xl text-2xl ${action.featured ? 'bg-zinc-950 text-white' : 'bg-zinc-950 text-lime-200 group-hover:bg-lime-300 group-hover:text-zinc-950'}`}>{action.icon}</span>
                    <span className="text-2xl font-black">→</span>
                  </div>
                  <h3 className="mt-6 text-xl font-black uppercase tracking-tight">{action.title}</h3>
                  <p className={`mt-3 text-sm font-semibold leading-6 ${action.featured ? 'text-zinc-800' : 'text-zinc-400 group-hover:text-zinc-700'}`}>{action.desc}</p>
                  <p className="mt-5 text-[10px] font-black uppercase tracking-[0.24em] opacity-70">{action.cta}</p>
                </button>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
