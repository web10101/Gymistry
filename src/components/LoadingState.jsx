export default function LoadingState({ name }) {
  const steps = [
    'Analyzing your profile…',
    'Selecting optimal exercise selection…',
    'Programming sets, reps & periodization…',
    'Calibrating progressive overload…',
    'Finalizing your personalized plan…',
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      {/* Animated logo mark */}
      <div className="relative mb-10">
        <div
          className="w-20 h-20 rounded-full pulse-glow flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #1a1a1a, #222)' }}
        >
          <span className="text-3xl">🏋️</span>
        </div>
        {/* Spinning ring */}
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent"
          style={{
            borderTopColor: '#e8ff47',
            animation: 'spin 1.2s linear infinite',
          }}
        />
      </div>

      <h2 className="text-2xl font-bold text-white mb-2">
        Building{name ? ` ${name}'s` : ' your'} program
      </h2>
      <p className="text-zinc-500 text-sm mb-10 max-w-xs">
        Your AI trainer is designing a program tailored specifically to you.
      </p>

      {/* Animated steps */}
      <div className="flex flex-col gap-2.5 max-w-xs w-full">
        {steps.map((step, i) => (
          <div
            key={step}
            className="flex items-center gap-3 text-left fade-in"
            style={{ animationDelay: `${i * 0.6}s`, opacity: 0 }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{
                background: '#e8ff47',
                animation: `pulse-dot ${1}s ease-in-out ${i * 0.6}s infinite`,
              }}
            />
            <span className="text-sm text-zinc-400">{step}</span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}
