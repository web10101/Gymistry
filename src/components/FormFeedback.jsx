import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const mdComponents = {
  h2: ({ children }) => (
    <h2
      className="text-base sm:text-lg font-bold mt-8 mb-3 pb-2 border-b border-zinc-800 flex items-center gap-2"
      style={{ color: '#00ff87' }}
    >
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-sm font-semibold text-white mt-5 mb-2">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-zinc-300 text-sm leading-relaxed mb-3">{children}</p>
  ),
  ul: ({ children }) => <ul className="space-y-2 mb-4">{children}</ul>,
  ol: ({ children }) => <ol className="space-y-3 mb-4 list-none pl-0">{children}</ol>,
  li: ({ children, ...props }) => {
    // ordered list items
    if (props.index !== undefined) {
      return (
        <li className="flex gap-3 text-sm text-zinc-300">
          <span
            className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-zinc-900"
            style={{ background: 'linear-gradient(135deg, #00ff87, #00cc6a)' }}
          >
            {props.index + 1}
          </span>
          <span>{children}</span>
        </li>
      );
    }
    return (
      <li className="flex items-start gap-2 text-sm text-zinc-300">
        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-lime-400 flex-shrink-0" />
        <span>{children}</span>
      </li>
    );
  },
  strong: ({ children }) => (
    <strong className="font-semibold text-white">{children}</strong>
  ),
  blockquote: ({ children }) => (
    <blockquote
      className="border-l-2 pl-4 my-4 italic text-sm"
      style={{ borderColor: '#00ff87', color: '#a3a3a3' }}
    >
      {children}
    </blockquote>
  ),
  hr: () => <hr className="border-zinc-800 my-6" />,
  table: ({ children }) => (
    <div className="overflow-x-auto my-4 rounded-xl border border-zinc-800">
      <table className="w-full text-xs">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-zinc-900">{children}</thead>,
  th: ({ children }) => (
    <th className="px-3 py-2.5 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
      {children}
    </th>
  ),
  tbody: ({ children }) => <tbody className="divide-y divide-zinc-800/40">{children}</tbody>,
  tr: ({ children }) => (
    <tr className="hover:bg-zinc-800/20 transition-colors">{children}</tr>
  ),
  td: ({ children }) => (
    <td className="px-3 py-2.5 text-zinc-300">{children}</td>
  ),
};

function PoseDataSummary({ poseData }) {
  if (!poseData) return null;

  const rows = [
    { label: 'Left Knee', data: poseData.summary.leftKnee },
    { label: 'Right Knee', data: poseData.summary.rightKnee },
    { label: 'Left Hip', data: poseData.summary.leftHip },
    { label: 'Right Hip', data: poseData.summary.rightHip },
    { label: 'Torso Lean', data: poseData.summary.torsoLean },
  ].filter((r) => r.data);

  const asymmetries = Object.entries(poseData.symmetry).filter(([, v]) => v > 0);

  return (
    <div
      className="mb-6 rounded-xl overflow-hidden"
      style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
    >
      <div
        className="px-4 py-3 flex items-center gap-2 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
      >
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
          Pose Data · {poseData.framesAnalyzed} frames · {poseData.duration}s
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4">
        {rows.map(({ label, data }) => (
          <div key={label} className="text-center">
            <p className="text-2xl font-extrabold text-white">{data.avg}°</p>
            <p className="text-xs text-zinc-500 mt-0.5">{label} avg</p>
            <p className="text-xs text-zinc-700">{data.min}° – {data.max}°</p>
          </div>
        ))}
      </div>
      {asymmetries.length > 0 && (
        <div
          className="px-4 py-3 border-t flex flex-wrap gap-2"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          {asymmetries.map(([joint, diff]) => (
            <span
              key={joint}
              className="text-xs px-2.5 py-1 rounded-full"
              style={{
                background: diff > 15 ? 'rgba(239,68,68,0.1)' : 'rgba(234,179,8,0.1)',
                color: diff > 15 ? '#fca5a5' : '#fde047',
                border: `1px solid ${diff > 15 ? 'rgba(239,68,68,0.2)' : 'rgba(234,179,8,0.2)'}`,
              }}
            >
              {joint}: {diff}° asymmetry
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FormFeedback({ feedback, isStreaming, exercise, poseData, onReset }) {
  return (
    <div className="fade-in w-full">
      {/* Title bar */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
            style={{ background: 'linear-gradient(135deg, #00ff87, #00cc6a)' }}
          >
            📐
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium">
              Form Analysis
            </p>
            <p className="text-white font-semibold text-sm">{exercise}</p>
          </div>
        </div>
        {!isStreaming && (
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-2 rounded-lg border border-zinc-700 text-zinc-400 text-xs font-medium hover:border-zinc-500 hover:text-white transition-all"
            >
              Save PDF
            </button>
            <button
              onClick={onReset}
              className="px-4 py-2 rounded-lg text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #00ff87, #00cc6a)', color: '#0a0a0a' }}
            >
              New Video
            </button>
          </div>
        )}
      </div>

      {/* Streaming banner */}
      {isStreaming && (
        <div
          className="mb-5 px-4 py-2.5 rounded-lg text-xs font-medium flex items-center gap-2"
          style={{
            background: 'rgba(0,255,135,0.06)',
            border: '1px solid rgba(0,255,135,0.15)',
            color: '#00ff87',
          }}
        >
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: '#00ff87', animation: 'pulse 1s ease-in-out infinite' }}
          />
          Analyzing your form in real time…
        </div>
      )}

      {/* Pose data summary cards */}
      <PoseDataSummary poseData={poseData} />

      {/* Markdown feedback */}
      <div>
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
          {feedback}
        </ReactMarkdown>
      </div>

      {/* Done CTA */}
      {!isStreaming && (
        <div
          className="mt-10 p-5 rounded-2xl text-center"
          style={{
            background: 'rgba(0,255,135,0.04)',
            border: '1px solid rgba(0,255,135,0.12)',
          }}
        >
          <p className="text-zinc-400 text-sm mb-4">
            Apply these cues in your next session and film again to track improvement.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={() => window.print()}
              className="px-5 py-2.5 rounded-xl border border-zinc-700 text-sm font-medium text-zinc-300 hover:border-zinc-500 transition-all"
            >
              Save as PDF
            </button>
            <button
              onClick={onReset}
              className="btn-primary px-5 py-2.5 rounded-xl text-sm"
            >
              Analyze Another Video
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
