import { useState, useMemo } from 'react';
import { ArrowLeft, Search, X } from 'lucide-react';
import { EXERCISE_LIST } from '../data/exerciseList';
import BodyMap from './BodyMap';

function ExerciseCard({ exercise, onClick }) {
  return (
    <button
      onClick={() => onClick(exercise)}
      className="group text-left w-full rounded-xl px-4 py-3.5 transition-all duration-200 hover:-translate-y-0.5"
      style={{ background: '#111111', border: '1.5px solid #1e1e1e' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(0,255,135,0.3)';
        e.currentTarget.style.background  = '#141414';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#1e1e1e';
        e.currentTarget.style.background  = '#111111';
      }}
    >
      <p
        className="text-sm font-semibold text-white leading-snug group-hover:text-[#00ff87] transition-colors"
      >
        {exercise.name}
      </p>
      <p className="text-xs mt-0.5" style={{ color: '#555555' }}>{exercise.muscleGroup}</p>
    </button>
  );
}

export default function ExerciseBrowser({ onSelectExercise, onBack }) {
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [search, setSearch]               = useState('');

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
      {/* Sticky header */}
      <header
        className="flex items-center justify-between px-5 py-4 sticky top-0 z-10"
        style={{ background: 'rgba(10,10,10,0.97)', borderBottom: '1px solid #222222', backdropFilter: 'blur(12px)' }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="transition-colors"
            style={{ color: '#555555' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#555555'; }}
          >
            <ArrowLeft size={20} strokeWidth={2} />
          </button>
          <div className="w-px h-4" style={{ background: '#333333' }} />
          <span className="font-semibold text-white text-sm">Exercise Library</span>
        </div>
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full tabular-nums"
          style={{ background: 'rgba(0,255,135,0.08)', color: '#00ff87', border: '1px solid rgba(0,255,135,0.2)' }}
        >
          {filtered.length}
        </span>
      </header>

      <div className="flex-1 mx-auto w-full px-5 py-6" style={{ maxWidth: 520 }}>
        {/* Body map — prominent at top */}
        <div className="mb-7 flex justify-center">
          <BodyMap selected={selectedGroup} onSelect={setSelectedGroup} />
        </div>

        {/* Search bar */}
        <div className="relative mb-4">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: '#555555' }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exercises…"
            className="input-field"
            style={{ paddingLeft: 42, paddingRight: search ? 40 : 16, fontSize: 14 }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: '#555555' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#555555'; }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Result count */}
        <p className="text-xs mb-4" style={{ color: '#444444' }}>
          {filtered.length} {filtered.length === 1 ? 'exercise' : 'exercises'}
          {selectedGroup !== 'All' && <span style={{ color: '#00ff87' }}> · {selectedGroup}</span>}
          {search && <span> · "{search}"</span>}
        </p>

        {/* Exercise grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {filtered.map((ex) => (
              <ExerciseCard key={ex.id} exercise={ex} onClick={onSelectExercise} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: '#111111', border: '1px solid #222222' }}
            >
              <Search size={22} style={{ color: '#333333' }} />
            </div>
            <p className="text-sm font-medium text-white mb-1">No exercises found</p>
            <p className="text-xs mb-5" style={{ color: '#555555' }}>Try a different filter or search term</p>
            <button
              onClick={() => { setSearch(''); setSelectedGroup('All'); }}
              className="text-xs font-semibold px-4 py-2 rounded-lg transition-all"
              style={{ color: '#00ff87', background: 'rgba(0,255,135,0.08)', border: '1px solid rgba(0,255,135,0.2)' }}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
