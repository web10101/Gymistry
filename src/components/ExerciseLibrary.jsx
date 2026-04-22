import { useState, useMemo } from 'react';
import { EXERCISES, CATEGORIES } from '../data/exercises';

const DIFFICULTY_COLOR = {
  Beginner:     { bg: 'rgba(74,222,128,0.12)',  text: '#4ade80',  border: 'rgba(74,222,128,0.25)'  },
  Intermediate: { bg: 'rgba(251,191,36,0.12)',  text: '#fbbf24',  border: 'rgba(251,191,36,0.25)'  },
  Advanced:     { bg: 'rgba(239,68,68,0.12)',   text: '#f87171',  border: 'rgba(239,68,68,0.25)'   },
};

function DifficultyBadge({ level }) {
  const c = DIFFICULTY_COLOR[level] || DIFFICULTY_COLOR.Beginner;
  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
    >
      {level}
    </span>
  );
}

function ExerciseCard({ exercise, onClick }) {
  return (
    <button
      onClick={() => onClick(exercise)}
      className="group card-glass rounded-2xl p-5 text-left hover:border-[#00ff87]/30 transition-all duration-200 hover:-translate-y-0.5 w-full"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h3 className="text-sm font-bold text-white group-hover:text-[#00ff87] transition-colors leading-tight">
            {exercise.name}
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">{exercise.muscles.primary.join(' · ')}</p>
        </div>
        <DifficultyBadge level={exercise.difficulty} />
      </div>
      <p className="text-xs text-zinc-400 leading-relaxed mb-3">{exercise.short}</p>
      <div className="flex flex-wrap gap-1.5">
        {exercise.equipment.slice(0, 3).map((eq) => (
          <span
            key={eq}
            className="text-xs px-2 py-0.5 rounded-full text-zinc-500"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {eq}
          </span>
        ))}
      </div>
    </button>
  );
}

export default function ExerciseLibrary({ onSelect, onBack }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list = EXERCISES;
    if (activeCategory !== 'All') list = list.filter((e) => e.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.muscles.primary.some((m) => m.toLowerCase().includes(q)) ||
          e.category.toLowerCase().includes(q) ||
          (e.muscles.secondary || []).some((m) => m.toLowerCase().includes(q))
      );
    }
    return list;
  }, [activeCategory, search]);

  // Count per category
  const counts = useMemo(() => {
    const c = {};
    for (const cat of CATEGORIES) {
      c[cat] = cat === 'All' ? EXERCISES.length : EXERCISES.filter((e) => e.category === cat).length;
    }
    return c;
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 border-b border-zinc-900 sticky top-0 z-10 bg-zinc-950/95 backdrop-blur">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-zinc-500 hover:text-zinc-300 transition-colors text-sm flex items-center gap-1.5"
          >
            ← Back
          </button>
          <div className="w-px h-4 bg-zinc-800" />
          <div className="flex items-center gap-2">
            <span className="text-base">📚</span>
            <span className="font-semibold text-white text-sm">Exercise Library</span>
          </div>
        </div>
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(0,255,135,0.1)', color: '#00ff87', border: '1px solid rgba(0,255,135,0.2)' }}
        >
          {EXERCISES.length} exercises
        </span>
      </header>

      <div className="flex-1 max-w-4xl mx-auto w-full px-5 py-6">
        {/* Search */}
        <div className="relative mb-5">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exercises, muscles, equipment…"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#00ff87]/50 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 text-lg"
            >
              ×
            </button>
          )}
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="flex-shrink-0 text-xs font-semibold px-3.5 py-2 rounded-full transition-all"
              style={
                activeCategory === cat
                  ? { background: 'linear-gradient(135deg, #00ff87, #00cc6a)', color: '#0a0a0a' }
                  : { background: 'rgba(255,255,255,0.05)', color: '#71717a', border: '1px solid rgba(255,255,255,0.08)' }
              }
            >
              {cat}
              <span className="ml-1.5 opacity-60">{counts[cat]}</span>
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-xs text-zinc-600 mb-4">
          {filtered.length} {filtered.length === 1 ? 'exercise' : 'exercises'}
          {search && ` matching "${search}"`}
          {activeCategory !== 'All' && !search && ` in ${activeCategory}`}
        </p>

        {/* Exercise grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((ex) => (
              <ExerciseCard key={ex.id} exercise={ex} onClick={onSelect} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-3xl mb-3">🔍</p>
            <p className="text-zinc-400 text-sm">No exercises found for "{search}"</p>
            <button
              onClick={() => { setSearch(''); setActiveCategory('All'); }}
              className="mt-4 text-xs text-[#00ff87] hover:text-lime-300 underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
