import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const mdComponents = {
  h1: ({ children }) => (
    <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-8 mb-4 leading-tight">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-lg sm:text-xl font-bold mt-8 mb-3 pb-2 border-b border-zinc-800"
      style={{ color: '#00ff87' }}>
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base sm:text-lg font-semibold text-white mt-6 mb-3">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="text-zinc-300 text-sm sm:text-base leading-relaxed mb-3">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="list-none space-y-2 mb-4 pl-0">{children}</ul>
  ),
  li: ({ children }) => (
    <li className="flex items-start gap-2 text-sm text-zinc-300">
      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-lime-400 flex-shrink-0" />
      <span>{children}</span>
    </li>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-white">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="text-zinc-400 not-italic">{children}</em>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-[#00ff87] pl-4 my-4 text-zinc-400 italic text-sm">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="border-zinc-800 my-6" />,
  table: ({ children }) => (
    <div className="overflow-x-auto my-4 rounded-xl border border-zinc-800">
      <table className="w-full text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-zinc-900">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
      {children}
    </th>
  ),
  tbody: ({ children }) => (
    <tbody className="divide-y divide-zinc-800/50">{children}</tbody>
  ),
  tr: ({ children }) => (
    <tr className="hover:bg-zinc-800/30 transition-colors">{children}</tr>
  ),
  td: ({ children }) => (
    <td className="px-4 py-3 text-zinc-300">{children}</td>
  ),
  code: ({ inline, children }) =>
    inline ? (
      <code className="text-[#00ff87] bg-zinc-900 px-1.5 py-0.5 rounded text-xs font-mono">
        {children}
      </code>
    ) : (
      <pre className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 overflow-x-auto my-4">
        <code className="text-zinc-300 text-xs font-mono">{children}</code>
      </pre>
    ),
};

export default function WorkoutPlan({ plan, isStreaming, onRestart }) {
  return (
    <div className="fade-in w-full max-w-3xl mx-auto">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
            style={{ background: 'linear-gradient(135deg, #00ff87, #00cc6a)' }}
          >
            💪
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium">
              Your Program
            </p>
            <p className="text-white font-semibold text-sm">
              {isStreaming ? (
                <span className="flex items-center gap-2">
                  Generating
                  <span className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="inline-block w-1 h-1 rounded-full bg-lime-400"
                        style={{
                          animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                        }}
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
          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-400 text-xs font-medium hover:border-zinc-500 hover:text-white transition-all"
            >
              Print / Save PDF
            </button>
            <button
              onClick={onRestart}
              className="px-4 py-2 rounded-lg text-xs font-bold transition-all"
              style={{ background: 'linear-gradient(135deg, #00ff87, #00cc6a)', color: '#0a0a0a' }}
            >
              New Program
            </button>
          </div>
        )}
      </div>

      {/* Streaming indicator */}
      {isStreaming && (
        <div
          className="mb-4 px-4 py-2.5 rounded-lg text-xs font-medium flex items-center gap-2"
          style={{
            background: 'rgba(0,255,135, 0.08)',
            border: '1px solid rgba(0,255,135, 0.2)',
            color: '#00ff87',
          }}
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: '#00ff87', animation: 'pulse 1s ease-in-out infinite' }}
          />
          Your personalized program is being generated in real time…
        </div>
      )}

      {/* Markdown plan */}
      <div className="prose max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
          {plan}
        </ReactMarkdown>
      </div>

      {/* Done CTA */}
      {!isStreaming && (
        <div
          className="mt-10 p-6 rounded-2xl text-center"
          style={{
            background: 'rgba(0,255,135, 0.06)',
            border: '1px solid rgba(0,255,135, 0.15)',
          }}
        >
          <p className="text-zinc-300 text-sm mb-4">
            Ready to train? Save or print this plan and start your first session.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={() => window.print()}
              className="px-6 py-3 rounded-xl border border-zinc-700 text-sm font-medium text-zinc-300 hover:border-zinc-500 transition-all"
            >
              Save as PDF
            </button>
            <button
              onClick={onRestart}
              className="btn-primary px-6 py-3 rounded-xl text-sm"
            >
              Generate a New Program
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @media print {
          .no-print { display: none !important; }
          body { background: white; color: black; }
        }
      `}</style>
    </div>
  );
}
