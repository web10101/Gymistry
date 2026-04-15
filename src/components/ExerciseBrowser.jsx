import { useState, useMemo } from 'react';
import { EXERCISE_LIST } from '../data/exerciseList';
import BodyMap from './BodyMap';

// ── Exercise card ─────────────────────────────────────────────────────────────

function ExerciseCard({ exercise, onClick }) {
  return (
    <button
      onClick={() => onClick(exercise)}
      className="group card-glass rounded-xl p-4 text-left w-full transition-all duration-200 hover:-translate-y-0.5 hover:border-lime-400/30"
    >
      <p className="text-sm font-semibold text-white group-hover:text-lime-400 transition-colors leading-snug">
        {exercise.name}
      </p>
      <p className="text-xs text-zinc-600 mt-1">{exercise.muscleGroup}</p>
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ExerciseBrowser({ onSelectExercise, onBack }) {
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list = EXERCISE_LIST;
    if (selectedGroup !== 'All') list = list.filter((e) => e.muscleGroup === selectedGroup);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) => e.name.toLowerCase().includes(q) || e.muscleGroup.toLowerCase().includes(q)
      );
    }
    return list;
  }, [selectedGroup, search]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 border-b border-zinc-900 sticky top-0 z-10 bg-zinc-950/95 backdrop-blur">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-zinc-500 hover:text-zinc-300 transition-colors text-sm"
          >
            ← Back
          </button>
          <div className="w-px h-4 bg-zinc-800" />
          <span className="font-semibold text-white text-sm">Exercise Library</span>
        </div>
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{
            background: 'rgba(232,255,71,0.1)',
            color: '#e8ff47',
            border: '1px solid rgba(232,255,71,0.2)',
          }}
        >
          {filtered.length} exercises
        </span>
      </header>

      <div className="flex-1 max-w-4xl mx-auto w-full px-5 py-6">
        {/* Body map filter */}
        <div className="mb-7 flex justify-center">
          <BodyMap selected={selectedGroup} onSelect={setSelectedGroup} />
        </div>

        {/* Search bar */}
        <div className="relative mb-5">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exercises…"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-lime-400/50 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 text-xl leading-none"
            >
              ×
            </button>
          )}
        </div>

        {/* Result count */}
        <p className="text-xs text-zinc-600 mb-4">
          {filtered.length} {filtered.length === 1 ? 'exercise' : 'exercises'}
          {selectedGroup !== 'All' && ` · ${selectedGroup}`}
          {search && ` · "${search}"`}
        </p>

        {/* Exercise grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {filtered.map((ex) => (
              <ExerciseCard key={ex.id} exercise={ex} onClick={onSelectExercise} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-3xl mb-3">🔍</p>
            <p className="text-zinc-400 text-sm">No exercises found</p>
            <button
              onClick={() => { setSearch(''); setSelectedGroup('All'); }}
              className="mt-4 text-xs underline"
              style={{ color: '#e8ff47' }}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
