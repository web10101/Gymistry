import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Printer, RefreshCw } from 'lucide-react';

const mdComponents = {
  h2: ({ children }) => (
    <h2
      className="text-base font-bold mt-8 mb-3 pb-2"
      style={{ color: '#00ff87', borderBottom: '1px solid #222222' }}
    >
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-sm font-semibold text-white mt-5 mb-2">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-sm leading-relaxed mb-3" style={{ color: '#aaaaaa' }}>
      {children}
    </p>
  ),
  ul: ({ children }) => <ul className="space-y-2 mb-4">{children}</ul>,
  ol: ({ children }) => <ol className="space-y-3 mb-4 list-none pl-0">{children}</ol>,
  li: ({ children, ...props }) => {
    if (props.index !== undefined) {
      return (
        <li className="flex gap-3 text-sm" style={{ color: '#aaaaaa' }}>
          <span
            className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold text-black"
            style={{ background: '#00ff87' }}
          >
            {props.index + 1}
          </span>
          <span className="leading-relaxed">{children}</span>
        </li>
      );
    }
    return (
      <li className="flex items-start gap-2.5 text-sm" style={{ color: '#aaaaaa' }}>
        <span
          className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: '#00ff87' }}
        />
        <span className="leading-relaxed">{children}</span>
      </li>
    );
  },
  strong: ({ children }) => (
    <strong className="font-semibold text-white">{children}</strong>
  ),
  blockquote: ({ children }) => (
    <blockquote
      className="pl-4 my-4 italic text-sm"
      style={{ borderLeft: '2px solid #00ff87', color: '#888888' }}
    >
      {children}
    </blockquote>
  ),
  hr: () => <hr style={{ borderColor: '#222222' }} className="my-6" />,
  table: ({ children }) => (
    <div className="overflow-x-auto my-4 rounded-xl" style={{ border: '1px solid #222222' }}>
      <table className="w-full text-xs">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead style={{ background: '#111111' }}>{children}</thead>,
  th: ({ children }) => (
    <th
      className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider"
      style={{ color: '#888888', borderBottom: '1px solid #222222' }}
    >
      {children}
    </th>
  ),
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => (
    <tr style={{ borderBottom: '1px solid #1a1a1a' }}>{children}</tr>
  ),
  td: ({ children }) => (
    <td className="px-3 py-2.5" style={{ color: '#cccccc' }}>{children}</td>
  ),
};

function PoseDataSummary({ poseData }) {
  if (!poseData) return null;

  const rows = [
    { label: 'Left Knee',  data: poseData.summary.leftKnee  },
    { label: 'Right Knee', data: poseData.summary.rightKnee },
    { label: 'Left Hip',   data: poseData.summary.leftHip   },
    { label: 'Right Hip',  data: poseData.summary.rightHip  },
    { label: 'Torso Lean', data: poseData.summary.torsoLean },
  ].filter((r) => r.data);

  const asymmetries = Object.entries(poseData.symmetry).filter(([, v]) => v > 0);

  return (
    <div
      className="mb-6 rounded-2xl overflow-hidden"
      style={{ border: '1px solid #222222', background: '#111111' }}
    >
      <div
        className="px-4 py-3 flex items-center gap-2"
        style={{ borderBottom: '1px solid #222222', background: '#0f0f0f' }}
      >
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#555555' }}>
          Pose Data · {poseData.framesAnalyzed} frames · {poseData.duration}s
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-5">
        {rows.map(({ label, data }) => (
          <div key={label} className="text-center">
            <p className="text-2xl font-extrabold text-white tabular-nums">{data.avg}°</p>
            <p className="text-xs mt-0.5" style={{ color: '#888888' }}>{label} avg</p>
            <p className="text-xs mt-0.5" style={{ color: '#444444' }}>{data.min}° – {data.max}°</p>
          </div>
        ))}
      </div>
      {asymmetries.length > 0 && (
        <div
          className="px-4 py-3 flex flex-wrap gap-2"
          style={{ borderTop: '1px solid #222222' }}
        >
          {asymmetries.map(([joint, diff]) => (
            <span
              key={joint}
              className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{
                background: diff > 15 ? 'rgba(255,68,68,0.08)' : 'rgba(255,170,0,0.08)',
                color:      diff > 15 ? '#ff8888' : '#ffcc55',
                border:     `1px solid ${diff > 15 ? 'rgba(255,68,68,0.2)' : 'rgba(255,170,0,0.2)'}`,
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
      <div
        className="flex items-center justify-between mb-6 pb-5"
        style={{ borderBottom: '1px solid #222222' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-black text-sm flex-shrink-0"
            style={{ background: '#00ff87' }}
          >
            ◈
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#555555' }}>
              Form Analysis
            </p>
            <p className="text-white font-bold text-sm">{exercise}</p>
          </div>
        </div>
        {!isStreaming && (
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all"
              style={{ border: '1px solid #333333', color: '#888888' }}
            >
              <Printer size={13} />
              PDF
            </button>
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold"
              style={{ background: '#00ff87', color: '#000000' }}
            >
              <RefreshCw size={13} />
              New
            </button>
          </div>
        )}
      </div>

      {/* Streaming banner */}
      {isStreaming && (
        <div
          className="mb-5 px-4 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2.5"
          style={{ background: 'rgba(0,255,135,0.06)', border: '1px solid rgba(0,255,135,0.18)', color: '#00ff87' }}
        >
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: '#00ff87', animation: 'pulse 1s ease-in-out infinite' }}
          />
          Analyzing your form in real time…
        </div>
      )}

      {/* Pose data summary */}
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
          className="mt-10 p-6 rounded-2xl text-center"
          style={{ background: 'rgba(0,255,135,0.04)', border: '1px solid rgba(0,255,135,0.12)' }}
        >
          <p className="text-sm mb-5 leading-relaxed" style={{ color: '#888888' }}>
            Apply these cues in your next session and film again to track improvement.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all"
              style={{ border: '1px solid #333333', color: '#aaaaaa' }}
            >
              <Printer size={15} />
              Save as PDF
            </button>
            <button
              onClick={onReset}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold"
              style={{ background: '#00ff87', color: '#000000' }}
            >
              <RefreshCw size={15} />
              Analyze Another Video
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
