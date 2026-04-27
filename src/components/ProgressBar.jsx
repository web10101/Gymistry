export default function ProgressBar({ current, total }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-medium tracking-widest uppercase text-zinc-500">
          Intake Progress
        </span>
        <span className="text-xs font-bold text-zinc-400">
          {current} / {total}
        </span>
      </div>
      <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #00cc6a, #00ff87)',
          }}
        />
      </div>
    </div>
  );
}
