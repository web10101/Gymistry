import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { generateExerciseContent } from '../api/exerciseContent';

const DIFFICULTY_COLOR = {
  Beginner:     { bg: 'rgba(74,222,128,0.12)',  text: '#4ade80',  border: 'rgba(74,222,128,0.25)'  },
  Intermediate: { bg: 'rgba(251,191,36,0.12)',  text: '#fbbf24',  border: 'rgba(251,191,36,0.25)'  },
  Advanced:     { bg: 'rgba(239,68,68,0.12)',   text: '#f87171',  border: 'rgba(239,68,68,0.25)'   },
};

const mdComponents = {
  h2: ({ children }) => (
    <h2 className="text-base sm:text-lg font-bold mt-8 mb-3 pb-2 border-b border-zinc-800"
      style={{ color: '#00ff87' }}>
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
  ol: ({ children }) => <ol className="space-y-2 mb-4 list-none pl-0 counter-reset-item">{children}</ol>,
  li: ({ children }) => (
    <li className="flex items-start gap-2.5 text-sm text-zinc-300">
      <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#00ff87' }} />
      <span>{children}</span>
    </li>
  ),
  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
  em: ({ children }) => <em className="text-zinc-400 not-italic text-xs">{children}</em>,
  blockquote: ({ children }) => (
    <blockquote
      className="border-l-2 pl-4 my-3 text-sm font-medium"
      style={{ borderColor: '#00ff87', color: '#00ff87' }}
    >
      {children}
    </blockquote>
  ),
  hr: () => <hr className="border-zinc-800 my-6" />,
};

function SkeletonLoader() {
  return (
    <div className="space-y-4 animate-pulse">
      {[100, 80, 90, 60, 85, 70].map((w, i) => (
        <div key={i} className="h-3 rounded-full bg-zinc-800" style={{ width: `${w}%` }} />
      ))}
      <div className="h-8" />
      {[95, 75, 88].map((w, i) => (
        <div key={i} className="h-3 rounded-full bg-zinc-800" style={{ width: `${w}%` }} />
      ))}
    </div>
  );
}

export default function ExercisePage({ exercise, onBack }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const dc = DIFFICULTY_COLOR[exercise.difficulty] || DIFFICULTY_COLOR.Beginner;

  useEffect(() => {
    setContent('');
    setLoading(true);
    setError(null);

    generateExerciseContent(exercise, (partial) => {
      setContent(partial);
      if (loading) setLoading(false);
    })
      .then(() => setLoading(false))
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise.id]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 border-b border-zinc-900 sticky top-0 z-10 bg-zinc-950/95 backdrop-blur">
        <button
          onClick={onBack}
          className="text-zinc-500 hover:text-zinc-300 transition-colors text-sm flex items-center gap-1.5"
        >
          ← Library
        </button>
        <span className="text-xs text-zinc-500 font-medium">{exercise.category}</span>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-5 py-8">
        {/* Exercise header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: dc.bg, color: dc.text, border: `1px solid ${dc.border}` }}
            >
              {exercise.difficulty}
            </span>
            {exercise.equipment.map((eq) => (
              <span
                key={eq}
                className="text-xs px-2.5 py-1 rounded-full text-zinc-500"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {eq}
              </span>
            ))}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-2">
            {exercise.name}
          </h1>
          <p className="text-zinc-400 text-sm">{exercise.short}</p>

          {/* Muscle groups */}
          <div className="flex flex-wrap gap-4 mt-4">
            <div>
              <p className="text-xs text-zinc-600 uppercase tracking-wider mb-1">Primary</p>
              <div className="flex flex-wrap gap-1.5">
                {exercise.muscles.primary.map((m) => (
                  <span
                    key={m}
                    className="text-xs font-medium px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(0,255,135,0.08)', color: '#00ff87', border: '1px solid rgba(0,255,135,0.2)' }}
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
            {exercise.muscles.secondary?.length > 0 && (
              <div>
                <p className="text-xs text-zinc-600 uppercase tracking-wider mb-1">Secondary</p>
                <div className="flex flex-wrap gap-1.5">
                  {exercise.muscles.secondary.map((m) => (
                    <span
                      key={m}
                      className="text-xs px-2.5 py-1 rounded-full text-zinc-500"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-zinc-800 mb-8" />

        {/* Error */}
        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Content */}
        {loading && !content && <SkeletonLoader />}

        {content && (
          <div className="fade-in">
            {loading && (
              <div
                className="mb-4 px-4 py-2.5 rounded-lg text-xs font-medium flex items-center gap-2"
                style={{ background: 'rgba(0,255,135,0.06)', border: '1px solid rgba(0,255,135,0.15)', color: '#00ff87' }}
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#00ff87', animation: 'pulse 1s ease-in-out infinite' }} />
                Generating expert guide…
              </div>
            )}
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
              {content}
            </ReactMarkdown>
          </div>
        )}
      </main>
    </div>
  );
}
