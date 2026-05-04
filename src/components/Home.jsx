const actions = [
  { id: 'intake', emoji: '🏋️', label: 'Build My Program', kicker: 'Smart plan builder', copy: 'Answer a fast coach-style intake and get a personalized 4-week training program with sets, reps, notes, and progression.', accent: 'from-lime-300 to-emerald-300' },
  { id: 'formcheck', emoji: '🎥', label: 'Form Check', kicker: 'Upload + improve', copy: 'Drop in a lift video and get movement feedback, joint-angle notes, mistake fixes, and clean coaching cues.', accent: 'from-fuchsia-300 to-orange-300' },
  { id: 'livetrainer', emoji: '🎙️', label: 'Live Trainer', kicker: 'Real-time coaching', copy: 'Turn on your camera for rep counting, live voice cues, symmetry checks, and form alerts while you train.', accent: 'from-sky-300 to-lime-300', live: true },
  { id: 'library', emoji: '📚', label: 'Exercise Library', kicker: 'Master every move', copy: 'Browse 290+ exercises with animated breakdowns, muscle targeting, mistake fixes, and pro-level coaching cues.', accent: 'from-amber-200 to-rose-300' },
];

const tickerItems = ['AI PROGRAMS', 'FORM FIXES', 'LIVE REPS', 'POSE INTELLIGENCE', 'NO ACCOUNT NEEDED'];

export default function Home({ onNavigate }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#080907] text-white">
      <div className="fixed inset-0 -z-10 gymistry-grid opacity-70" />
      <div className="fixed -left-32 top-20 -z-10 h-96 w-96 rounded-full bg-lime-300/25 blur-3xl animate-blob" />
      <div className="fixed -right-28 top-1/3 -z-10 h-[28rem] w-[28rem] rounded-full bg-fuchsia-500/20 blur-3xl animate-blob-delayed" />

      <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <button onClick={() => onNavigate('home')} className="group flex items-center gap-3" aria-label="Gymistry home">
          <span className="flex h-11 w-11 rotate-[-7deg] items-center justify-center rounded-2xl border-2 border-zinc-950 bg-lime-300 text-xl font-black text-zinc-950 shadow-[5px_5px_0_#000] transition-transform group-hover:rotate-3 group-hover:scale-105">G</span>
          <span><span className="block text-lg font-black uppercase tracking-tight">Gymistry</span><span className="block text-[10px] font-bold uppercase tracking-[0.32em] text-lime-200/80">AI sweat lab</span></span>
        </button>
        <button onClick={() => onNavigate('livetrainer')} className="rounded-full border-2 border-zinc-950 bg-white px-4 py-2 text-xs font-black uppercase tracking-wider text-zinc-950 shadow-[4px_4px_0_#000] transition hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#000]">Train live</button>
      </header>

      <main>
        <section className="relative mx-auto grid min-h-[calc(100svh-84px)] w-full max-w-7xl items-center gap-10 px-5 pb-16 pt-8 sm:px-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative z-10 max-w-3xl">
            <div className="slide-up mb-7 inline-flex rotate-[-1.5deg] items-center gap-3 rounded-full border-2 border-zinc-950 bg-lime-300 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-zinc-950 shadow-[5px_5px_0_#000]"><span className="h-2 w-2 animate-ping rounded-full bg-zinc-950" />Phases 1-4 unlocked</div>
            <h1 className="hero-title slide-up text-[clamp(4.2rem,13vw,10rem)] font-black uppercase leading-[0.76] tracking-[-0.11em] text-white">
              Train <span className="relative mx-1 inline-block rotate-[-3deg] rounded-[1.6rem] border-[3px] border-zinc-950 bg-lime-300 px-3 text-zinc-950 shadow-[9px_9px_0_#000] sm:mx-3 sm:px-5">like</span> your AI
              <span className="block bg-gradient-to-r from-lime-200 via-white to-orange-200 bg-clip-text text-transparent">is yelling.</span>
            </h1>
            <p className="slide-up mt-8 max-w-2xl text-lg font-semibold leading-8 text-zinc-300 sm:text-xl">A loud, fast, cinematic fitness cockpit for programs, form checks, live rep coaching, and exercise mastery.</p>
            <div className="slide-up mt-9 flex flex-col gap-4 sm:flex-row">
              <button onClick={() => onNavigate('intake')} className="rounded-full border-2 border-zinc-950 bg-lime-300 px-8 py-4 text-sm font-black uppercase tracking-wider text-zinc-950 shadow-[7px_7px_0_#000] transition hover:-translate-y-1 hover:shadow-[10px_10px_0_#000]">Build my program →</button>
              <button onClick={() => onNavigate('formcheck')} className="rounded-full border-2 border-white/15 bg-white/10 px-8 py-4 text-sm font-black uppercase tracking-wider text-white backdrop-blur-xl transition hover:border-white hover:bg-white hover:text-zinc-950">Check my form</button>
            </div>
          </div>

          <div className="relative min-h-[560px] lg:min-h-[660px]">
            <div className="absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full border-[18px] border-lime-300/80 bg-gradient-to-br from-lime-200 via-emerald-200 to-white shadow-[0_0_80px_rgba(190,242,100,0.35)] sm:h-[34rem] sm:w-[34rem]" />
            <div className="absolute left-1/2 top-[48%] w-[18rem] -translate-x-1/2 -translate-y-1/2 rotate-[-7deg] rounded-[2.4rem] border-[3px] border-zinc-950 bg-white p-5 text-zinc-950 shadow-[14px_14px_0_#000] sm:w-[22rem] animate-float">
              <div className="flex items-center justify-between"><span className="rounded-full bg-zinc-950 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-lime-200">Live Trainer</span><span className="flex h-9 w-9 items-center justify-center rounded-full bg-lime-300 text-lg">🎙️</span></div>
              <div className="mt-8 text-6xl font-black leading-none tracking-[-0.08em] sm:text-7xl">12</div><div className="mt-1 text-xs font-black uppercase tracking-[0.35em] text-zinc-500">perfect reps</div>
              <div className="mt-8 space-y-3"><div className="h-4 rounded-full bg-zinc-200"><div className="h-full w-[88%] rounded-full bg-lime-300" /></div><div className="h-4 rounded-full bg-zinc-200"><div className="h-full w-[64%] rounded-full bg-fuchsia-300" /></div><div className="h-4 rounded-full bg-zinc-200"><div className="h-full w-[76%] rounded-full bg-orange-300" /></div></div>
              <p className="mt-7 text-sm font-black uppercase leading-5 tracking-tight">Chest up. Knees tracking. Keep cooking.</p>
            </div>
            <div className="absolute left-0 top-10 rotate-[-9deg] rounded-3xl border-2 border-zinc-950 bg-fuchsia-300 px-5 py-4 text-zinc-950 shadow-[8px_8px_0_#000] animate-float-slow"><div className="text-3xl font-black">AI</div><div className="text-[10px] font-black uppercase tracking-widest">coach brain</div></div>
            <div className="absolute right-2 top-24 rotate-[10deg] rounded-full border-2 border-zinc-950 bg-orange-300 px-5 py-3 text-xs font-black uppercase tracking-widest text-zinc-950 shadow-[7px_7px_0_#000] animate-float-delayed">Form fixed</div>
          </div>
        </section>

        <section className="relative -rotate-1 border-y-2 border-zinc-950 bg-lime-300 py-4 text-zinc-950 shadow-[0_10px_0_#000]">
          <div className="ticker flex whitespace-nowrap text-3xl font-black uppercase tracking-[-0.04em] sm:text-5xl">{[...tickerItems, ...tickerItems, ...tickerItems].map((item, index) => (<span key={`${item}-${index}`} className="mx-5 inline-flex items-center gap-5">{item} <span>✦</span></span>))}</div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8">
          <div className="mb-10"><p className="text-xs font-black uppercase tracking-[0.35em] text-lime-200">Choose your training mode</p><h2 className="mt-3 text-5xl font-black uppercase leading-none tracking-[-0.08em] sm:text-7xl">Pick your power-up.</h2></div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {actions.map((action) => (
              <button key={action.id} onClick={() => onNavigate(action.id)} className="group relative min-h-[330px] overflow-hidden rounded-[2rem] border-2 border-white/10 bg-white/[0.04] p-6 text-left backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:border-zinc-950 hover:bg-white hover:text-zinc-950 hover:shadow-[12px_12px_0_#000]">
                <div className={`absolute -right-14 -top-14 h-36 w-36 rounded-full bg-gradient-to-br ${action.accent} opacity-80 blur-xl transition group-hover:blur-none`} />
                <span className="relative z-10 flex h-16 w-16 rotate-[-8deg] items-center justify-center rounded-3xl border-2 border-zinc-950 bg-white text-3xl shadow-[6px_6px_0_#000] transition group-hover:rotate-3 group-hover:bg-lime-300">{action.emoji}</span>
                <p className="relative z-10 mt-9 text-[10px] font-black uppercase tracking-[0.28em] text-lime-200 group-hover:text-zinc-500">{action.kicker}</p>
                <h3 className="relative z-10 mt-3 text-3xl font-black uppercase leading-none tracking-[-0.06em]">{action.label}</h3>
                <p className="relative z-10 mt-5 text-sm font-semibold leading-6 text-zinc-400 group-hover:text-zinc-700">{action.copy}</p>
                <span className="absolute bottom-5 right-6 text-4xl font-black transition group-hover:translate-x-1">→</span>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
