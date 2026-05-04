const trainingModes = [
  {
    id: 'livetrainer',
    icon: '🎙️',
    title: 'Live Trainer',
    subtitle: 'camera-on coaching',
    metric: 'real-time',
    desc: 'Rep counter, pose overlay, voice corrections, and injury-risk flags while you move.',
    tint: 'from-lime-300 via-emerald-300 to-cyan-300',
  },
  {
    id: 'formcheck',
    icon: '🎥',
    title: 'Form Check',
    subtitle: 'upload a set',
    metric: 'joint angles',
    desc: 'Turn any lift video into coach notes, mistake detection, and precise movement cues.',
    tint: 'from-fuchsia-300 via-rose-300 to-orange-300',
  },
  {
    id: 'intake',
    icon: '🏋️',
    title: 'Program Builder',
    subtitle: '4-week block',
    metric: 'personalized',
    desc: 'Answer the intake and Gymistry generates a structured plan built around your goal.',
    tint: 'from-amber-200 via-lime-200 to-green-300',
  },
  {
    id: 'library',
    icon: '📚',
    title: 'Movement Lab',
    subtitle: 'exercise library',
    metric: '290+ moves',
    desc: 'Animated breakdowns, coaching cues, muscle groups, and common mistake fixes.',
    tint: 'from-sky-300 via-indigo-300 to-lime-200',
  },
];

const workoutStack = [
  ['Back Squat', '4 x 6', 'Depth + knee tracking'],
  ['Romanian Deadlift', '3 x 8', 'Hinge path + spine angle'],
  ['Walking Lunge', '3 x 10', 'Balance + symmetry'],
  ['Plank', '3 x 45s', 'Ribcage + hip position'],
];

const coachSignals = [
  ['Readiness', '86%', 'green'],
  ['Form score', '92', 'lime'],
  ['Symmetry', '94%', 'cyan'],
  ['Weekly load', '+18%', 'amber'],
];

const navItems = [
  ['home', '⌂', 'Home'],
  ['livetrainer', '●', 'Live'],
  ['formcheck', '◇', 'Form'],
  ['library', '▦', 'Lab'],
];

function SignalCard({ label, value, tone }) {
  return (
    <div className={`group rounded-[1.35rem] border border-white/10 bg-white/[0.055] p-4 backdrop-blur-xl transition hover:-translate-y-1 hover:border-lime-300/40 hover:bg-white/[0.09]`}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">{label}</p>
        <span className={`h-2.5 w-2.5 rounded-full bg-${tone}-300 shadow-[0_0_18px_currentColor]`} />
      </div>
      <p className="mt-3 text-3xl font-black tracking-[-0.04em] text-white">{value}</p>
    </div>
  );
}

export default function Home({ onNavigate }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#060806] text-white">
      <div className="fixed inset-0 -z-20 gymistry-grid opacity-70" />
      <div className="fixed left-[-12rem] top-[-10rem] -z-10 h-[34rem] w-[34rem] rounded-full bg-lime-300/20 blur-3xl animate-blob" />
      <div className="fixed right-[-12rem] top-[20%] -z-10 h-[38rem] w-[38rem] rounded-full bg-cyan-400/12 blur-3xl animate-blob-delayed" />
      <div className="fixed bottom-[-14rem] left-[35%] -z-10 h-[34rem] w-[34rem] rounded-full bg-fuchsia-400/12 blur-3xl animate-blob-slow" />

      <div className="mx-auto grid min-h-screen max-w-[1500px] grid-cols-1 lg:grid-cols-[92px_1fr] xl:grid-cols-[260px_1fr]">
        <aside className="hidden border-r border-white/10 bg-zinc-950/45 p-4 backdrop-blur-2xl lg:flex lg:flex-col">
          <button onClick={() => onNavigate('home')} className="group flex items-center justify-center gap-3 rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-3 text-left transition hover:bg-white/[0.08] xl:justify-start">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-lime-300 text-xl font-black text-zinc-950 shadow-[5px_5px_0_#000] transition group-hover:rotate-[-6deg]">G</span>
            <span className="hidden xl:block">
              <span className="block text-lg font-black tracking-tight">Gymistry</span>
              <span className="block text-[10px] font-black uppercase tracking-[0.26em] text-lime-200/70">fitness OS</span>
            </span>
          </button>

          <nav className="mt-6 space-y-2">
            {trainingModes.map((item) => (
              <button key={item.id} onClick={() => onNavigate(item.id)} className="group flex w-full items-center justify-center gap-3 rounded-[1.25rem] border border-white/5 bg-white/[0.025] px-3 py-3.5 text-left transition hover:border-lime-300/40 hover:bg-lime-300 hover:text-zinc-950 xl:justify-start">
                <span className="text-xl grayscale transition group-hover:grayscale-0">{item.icon}</span>
                <span className="hidden xl:block">
                  <span className="block text-sm font-black">{item.title}</span>
                  <span className="block text-[10px] font-bold uppercase tracking-widest opacity-50">{item.subtitle}</span>
                </span>
              </button>
            ))}
          </nav>

          <div className="mt-auto hidden overflow-hidden rounded-[1.6rem] border border-lime-300/25 bg-lime-300/10 p-4 xl:block">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-lime-200">AI Coach</p>
            <p className="mt-3 text-sm font-semibold leading-6 text-zinc-200">Today is lower-body strength. Prioritize depth, controlled eccentrics, and symmetry.</p>
            <button onClick={() => onNavigate('livetrainer')} className="mt-4 w-full rounded-2xl bg-lime-300 px-4 py-3 text-xs font-black uppercase text-zinc-950 shadow-[5px_5px_0_#000] transition hover:-translate-y-1">Start live</button>
          </div>
        </aside>

        <main className="relative p-4 pb-24 sm:p-6 lg:p-8 lg:pb-8">
          <header className="mb-5 flex items-center justify-between gap-4 rounded-[1.6rem] border border-white/10 bg-white/[0.045] px-4 py-3 backdrop-blur-xl lg:hidden">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-lime-300 font-black text-zinc-950">G</span>
              <div>
                <h1 className="text-base font-black">Gymistry</h1>
                <p className="text-xs font-semibold text-zinc-500">AI fitness OS</p>
              </div>
            </div>
            <button onClick={() => onNavigate('livetrainer')} className="rounded-full bg-lime-300 px-4 py-2 text-xs font-black uppercase text-zinc-950">Go live</button>
          </header>

          <section className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
            <div className="relative overflow-hidden rounded-[2.25rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl backdrop-blur-2xl sm:p-8">
              <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-lime-300/20 blur-3xl" />
              <div className="absolute bottom-0 right-10 hidden h-48 w-48 rounded-full border-[24px] border-lime-300/15 xl:block" />

              <div className="relative z-10 grid gap-8 xl:grid-cols-[1fr_280px] xl:items-end">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-lime-300/25 bg-lime-300/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-lime-200">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-lime-300" /> Training cockpit online
                  </div>
                  <h2 className="mt-5 max-w-3xl text-5xl font-black uppercase leading-[0.82] tracking-[-0.085em] sm:text-7xl xl:text-8xl">
                    Build the body. <span className="bg-gradient-to-r from-lime-200 via-white to-cyan-200 bg-clip-text text-transparent">Debug the lift.</span>
                  </h2>
                  <p className="mt-5 max-w-2xl text-sm font-semibold leading-7 text-zinc-400 sm:text-base">Gymistry is your AI training layer: program generation, live camera coaching, movement analysis, and exercise intelligence in one app.</p>
                  <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    <button onClick={() => onNavigate('livetrainer')} className="rounded-2xl border-2 border-zinc-950 bg-lime-300 px-6 py-4 text-sm font-black uppercase tracking-wider text-zinc-950 shadow-[7px_7px_0_#000] transition hover:-translate-y-1 hover:shadow-[10px_10px_0_#000]">Start live trainer →</button>
                    <button onClick={() => onNavigate('formcheck')} className="rounded-2xl border border-white/10 bg-white/[0.06] px-6 py-4 text-sm font-black uppercase tracking-wider text-white backdrop-blur-xl transition hover:bg-white hover:text-zinc-950">Analyze form</button>
                  </div>
                </div>

                <div className="relative rounded-[2rem] border border-white/10 bg-zinc-950/65 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">Live scan</span>
                    <span className="rounded-full bg-lime-300 px-2.5 py-1 text-[10px] font-black text-zinc-950">READY</span>
                  </div>
                  <div className="relative mt-4 aspect-[4/5] overflow-hidden rounded-[1.5rem] border border-white/10 bg-[radial-gradient(circle_at_50%_15%,rgba(190,242,100,0.22),transparent_32%),linear-gradient(180deg,#111827,#050505)]">
                    <div className="absolute left-1/2 top-[12%] h-10 w-10 -translate-x-1/2 rounded-full border-2 border-lime-200/80 shadow-[0_0_22px_rgba(190,242,100,0.7)]" />
                    <div className="absolute left-1/2 top-[25%] h-28 w-px -translate-x-1/2 bg-lime-200/80" />
                    <div className="absolute left-[38%] top-[30%] h-px w-[24%] bg-lime-200/80" />
                    <div className="absolute left-[41%] top-[25%] h-28 w-px rotate-[18deg] bg-lime-200/80" />
                    <div className="absolute right-[41%] top-[25%] h-28 w-px rotate-[-18deg] bg-lime-200/80" />
                    <div className="absolute left-[39%] top-[54%] h-32 w-px rotate-[12deg] bg-lime-200/80" />
                    <div className="absolute right-[39%] top-[54%] h-32 w-px rotate-[-12deg] bg-lime-200/80" />
                    <div className="absolute bottom-4 left-4 rounded-2xl bg-black/55 px-3 py-2 text-xs font-black text-lime-200 backdrop-blur">12 reps</div>
                    <div className="absolute right-4 top-4 rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur">pose lock</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-[2.25rem] border border-white/10 bg-zinc-950/70 p-5 backdrop-blur-2xl sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-lime-200">Today’s block</p>
                    <h3 className="mt-2 text-3xl font-black tracking-[-0.05em]">Lower strength</h3>
                  </div>
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-lime-300 text-2xl shadow-[5px_5px_0_#000]">⚡</div>
                </div>
                <div className="mt-5 space-y-3">
                  {workoutStack.map(([name, sets, cue], index) => (
                    <button key={name} onClick={() => onNavigate('library')} className="group flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-left transition hover:border-lime-300/40 hover:bg-lime-300 hover:text-zinc-950">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-zinc-900 text-xs font-black text-lime-200 group-hover:bg-zinc-950">0{index + 1}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-black">{name}</span>
                        <span className="block truncate text-xs font-semibold text-zinc-500 group-hover:text-zinc-800">{cue}</span>
                      </span>
                      <span className="text-xs font-black">{sets}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[2.25rem] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl sm:p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">Coach command</p>
                <div className="mt-4 rounded-[1.5rem] border border-lime-300/20 bg-lime-300/10 p-4">
                  <p className="text-sm font-semibold leading-6 text-zinc-200">“Start with squats. I’ll track depth, knee path, trunk angle, and side-to-side balance.”</p>
                </div>
                <div className="mt-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-zinc-950/70 p-2">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.06] text-lg">⌘</span>
                  <span className="flex-1 text-sm font-semibold text-zinc-500">Ask Gymistry anything...</span>
                  <button onClick={() => onNavigate('intake')} className="rounded-xl bg-lime-300 px-3 py-2 text-xs font-black text-zinc-950">Plan</button>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-5 grid gap-5 xl:grid-cols-[0.72fr_1.28fr]">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-2">
              {coachSignals.map(([label, value, tone]) => <SignalCard key={label} label={label} value={value} tone={tone} />)}
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {trainingModes.map((mode) => (
                <button key={mode.id} onClick={() => onNavigate(mode.id)} className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 text-left backdrop-blur-xl transition hover:-translate-y-2 hover:border-zinc-950 hover:bg-white hover:text-zinc-950 hover:shadow-[10px_10px_0_#000]">
                  <div className={`absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br ${mode.tint} opacity-75 blur-2xl transition group-hover:blur-lg`} />
                  <div className="relative flex items-start justify-between gap-3">
                    <span className="grid h-14 w-14 place-items-center rounded-2xl border border-white/20 bg-zinc-950 text-2xl shadow-[5px_5px_0_rgba(0,0,0,0.6)] group-hover:bg-lime-300">{mode.icon}</span>
                    <span className="text-2xl font-black">→</span>
                  </div>
                  <p className="relative mt-6 text-[10px] font-black uppercase tracking-[0.22em] text-lime-200 group-hover:text-zinc-500">{mode.metric}</p>
                  <h3 className="relative mt-2 text-xl font-black uppercase leading-none tracking-[-0.04em]">{mode.title}</h3>
                  <p className="relative mt-4 text-sm font-semibold leading-6 text-zinc-400 group-hover:text-zinc-700">{mode.desc}</p>
                </button>
              ))}
            </div>
          </section>
        </main>
      </div>

      <nav className="fixed bottom-3 left-3 right-3 z-50 grid grid-cols-4 gap-2 rounded-[1.5rem] border border-white/10 bg-zinc-950/85 p-2 shadow-2xl backdrop-blur-2xl lg:hidden">
        {navItems.map(([id, icon, label]) => (
          <button key={id} onClick={() => onNavigate(id)} className="rounded-2xl px-2 py-3 text-center text-xs font-black uppercase tracking-wider text-zinc-500 transition hover:bg-lime-300 hover:text-zinc-950">
            <span className="mb-1 block text-base">{icon}</span>{label}
          </button>
        ))}
      </nav>
    </div>
  );
}
