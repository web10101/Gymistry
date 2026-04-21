function SkeletonLine({ width = '100%', height = 10 }) {
  return (
    <div
      className="skeleton-green rounded-lg"
      style={{ width, height }}
    />
  );
}

export default function LoadingState({ name }) {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-[60vh] text-center px-5 mx-auto w-full"
      style={{ maxWidth: 480 }}
    >
      {/* Animated logo mark */}
      <div className="relative mb-8">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center pulse-glow"
          style={{ background: '#111111', border: '1px solid #222222' }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-black text-lg"
            style={{ background: '#00ff87' }}
          >
            G
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-extrabold text-white mb-2 tracking-tight">
        Building{name ? ` ${name}'s` : ' your'} program
      </h2>
      <p className="text-sm mb-10 max-w-[260px] leading-relaxed" style={{ color: '#888888' }}>
        Your AI trainer is designing a plan tailored specifically to you.
      </p>

      {/* Skeleton preview lines */}
      <div className="w-full max-w-[280px] space-y-3 mb-8">
        {[85, 65, 90, 55, 75, 60].map((w, i) => (
          <SkeletonLine
            key={i}
            width={`${w}%`}
            height={9}
          />
        ))}
      </div>

      {/* Bouncing dots */}
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full"
            style={{
              background: '#00ff87',
              animation: `bounceDot 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
