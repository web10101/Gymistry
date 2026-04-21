export default function ProgressBar({ current, total }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="w-full">
      <div
        className="h-1 w-full rounded-full overflow-hidden"
        style={{ background: '#1a1a1a' }}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%`, background: '#00ff87' }}
        />
      </div>
    </div>
  );
}
