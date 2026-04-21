import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Printer, RefreshCw } from 'lucide-react';

const mdComponents = {
  h1: ({ children }) => (
    <h1 className="text-2xl font-extrabold text-white mt-8 mb-4 leading-tight tracking-tight">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2
      className="text-lg font-bold mt-8 mb-3 pb-2"
      style={{ color: '#00ff87', borderBottom: '1px solid #222222' }}
    >
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-semibold text-white mt-6 mb-3">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-sm leading-relaxed mb-3" style={{ color: '#aaaaaa' }}>
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="list-none space-y-2 mb-4 pl-0">{children}</ul>
  ),
  li: ({ children }) => (
    <li className="flex items-start gap-2.5 text-sm" style={{ color: '#aaaaaa' }}>
      <span
        className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: '#00ff87' }}
      />
      <span className="leading-relaxed">{children}</span>
    </li>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-white">{children}</strong>
  ),
  em: ({ children }) => (
    <em style={{ color: '#888888' }} className="not-italic">{children}</em>
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
      <table className="w-full text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead style={{ background: '#111111' }}>{children}</thead>
  ),
  th: ({ children }) => (
    <th
      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
      style={{ color: '#888888', borderBottom: '1px solid #222222' }}
    >
      {children}
    </th>
  ),
  tbody: ({ children }) => (
    <tbody>{children}</tbody>
  ),
  tr: ({ children }) => (
    <tr style={{ borderBottom: '1px solid #1a1a1a' }}>{children}</tr>
  ),
  td: ({ children }) => (
    <td className="px-4 py-3" style={{ color: '#cccccc' }}>{children}</td>
  ),
  code: ({ inline, children }) =>
    inline ? (
      <code
        className="px-1.5 py-0.5 rounded text-xs font-mono"
        style={{ color: '#00ff87', background: '#111111' }}
      >
        {children}
      </code>
    ) : (
      <pre
        className="rounded-xl p-4 overflow-x-auto my-4"
        style={{ background: '#111111', border: '1px solid #222222' }}
      >
        <code className="text-xs font-mono" style={{ color: '#aaaaaa' }}>{children}</code>
      </pre>
    ),
};

export default function WorkoutPlan({ plan, isStreaming, onRestart }) {
  return (
    <div className="fade-in w-full">
      {/* Header bar */}
      <div
        className="flex items-center justify-between mb-6 pb-5"
        style={{ borderBottom: '1px solid #222222' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-black text-base flex-shrink-0"
            style={{ background: '#00ff87' }}
          >
            G
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#555555' }}>
              Your Program
            </p>
            <p className="text-white font-bold text-sm">
              {isStreaming ? (
                <span className="flex items-center gap-2">
                  Generating
                  <span className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="inline-block w-1.5 h-1.5 rounded-full"
                        style={{ background: '#00ff87', animation: `bounceDot 1.2s ease-in-out ${i * 0.2}s infinite` }}
                      />
                    ))}
                  </span>
                </span>
              ) : (
                'Complete'
              )}
            </p>
          </div>
        </div>

        {!isStreaming && (
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all"
              style={{ border: '1px solid #333333', color: '#888888' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.borderColor = '#555555'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#888888'; e.currentTarget.style.borderColor = '#333333'; }}
            >
              <Printer size={13} />
              Print
            </button>
            <button
              onClick={onRestart}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all"
              style={{ background: '#00ff87', color: '#000000' }}
            >
              <RefreshCw size={13} />
              New
            </button>
          </div>
        )}
      </div>

      {/* Streaming indicator */}
      {isStreaming && (
        <div
          className="mb-5 px-4 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2.5"
          style={{ background: 'rgba(0,255,135,0.06)', border: '1px solid rgba(0,255,135,0.18)', color: '#00ff87' }}
        >
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: '#00ff87', animation: 'pulse 1s ease-in-out infinite' }}
          />
          Your personalized program is being generated in real time…
        </div>
      )}

      {/* Markdown plan */}
      <div>
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
          {plan}
        </ReactMarkdown>
      </div>

      {/* Done CTA */}
      {!isStreaming && (
        <div
          className="mt-10 p-6 rounded-2xl text-center"
          style={{ background: 'rgba(0,255,135,0.04)', border: '1px solid rgba(0,255,135,0.12)' }}
        >
          <p className="text-sm mb-5 leading-relaxed" style={{ color: '#888888' }}>
            Ready to train? Save or print this plan and start your first session.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all"
              style={{ border: '1px solid #333333', color: '#aaaaaa' }}
            >
              <Printer size={15} />
              Save as PDF
            </button>
            <button
              onClick={onRestart}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all"
              style={{ background: '#00ff87', color: '#000000', border: 'none' }}
            >
              <RefreshCw size={15} />
              New Program
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @media print {
          body { background: white; color: black; }
        }
      `}</style>
    </div>
  );
}
