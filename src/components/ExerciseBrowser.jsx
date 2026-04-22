import { useState, useMemo } from 'react';
import { EXERCISE_LIST } from '../data/exerciseList';
import BodyMap from './BodyMap';

const EQUIPMENT = [
  'Barbell', 'Dumbbell', 'Cable', 'Machine',
  'Kettlebell', 'Band', 'Bodyweight', 'Smith Machine',
];

function inferEquipment(name) {
  const n = name.toLowerCase();
  if (n.includes('barbell'))                          return 'Barbell';
  if (n.includes('dumbbell'))                         return 'Dumbbell';
  if (n.includes('cable') || n.includes('pulldown') || n.includes('pull-down')) return 'Cable';
  if (n.includes('machine') || n.includes('leg press') || n.includes('leg curl') || n.includes('leg extension')) return 'Machine';
  if (n.includes('kettlebell'))                       return 'Kettlebell';
  if (n.includes(' band') || n.includes('resistance band')) return 'Band';
  if (n.includes('smith'))                            return 'Smith Machine';
  return 'Bodyweight';
}

function ExerciseCard({ exercise, onClick }) {
  return (
    <button
      onClick={() => onClick(exercise)}
      className="group card-glass rounded-xl p-4 text-left w-full transition-all duration-200 hover:-translate-y-0.5"
      style={{ borderColor: 'rgba(255,255,255,0.07)' }}
    >
      <p className="text-sm font-semibold text-white leading-snug group-hover:text-lime-400 transition-colors">
        {exercise.name}
      </p>
      <p className="text-xs text-zinc-600 mt-1">{exercise.muscleGroup}</p>
    </button>
  );
}

export default function ExerciseBrowser({ onSelectExercise, onBack }) {
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [selectedEquip, setSelectedEquip] = useState(null);
  const [search, setSearch]               = useState('');
  const [equipOpen, setEquipOpen]         = useState(false);

  const filtered = useMemo(() => {
    let list = EXERCISE_LIST;
    if (selectedGroup !== 'All') list = list.filter((e) => e.muscleGroup === selectedGroup);
    if (selectedEquip)           list = list.filter((e) => inferEquipment(e.name) === selectedEquip);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((e) => e.name.toLowerCase().includes(q) || e.muscleGroup.toLowerCase().includes(q));
    }
    return list;
  }, [selectedGroup, selectedEquip, search]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 border-b border-zinc-900 sticky top-0 z-10 bg-zinc-950/95 backdrop-blur">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-zinc-500 hover:text-zinc-300 transition-colors text-sm">
            ← Back
          </button>
          <div className="w-px h-4 bg-zinc-800" />
          <span className="font-semibold text-white text-sm">Exercise Library</span>
        </div>
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(232,255,71,0.10)', color: '#e8ff47', border: '1px solid rgba(232,255,71,0.2)' }}
        >
          {filtered.length}
        </span>
      </header>

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 pt-6 pb-10">

        {/* Body map */}
        <div className="mb-6">
          <BodyMap selected={selectedGroup} onSelect={setSelectedGroup} />
        </div>

        {/* Equipment filter */}
        <div
          className="rounded-xl mb-5 overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <button
            onClick={() => setEquipOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-zinc-300"
          >
            <span>Equipment {selectedEquip && <span style={{ color: '#e8ff47' }}>· {selectedEquip}</span>}</span>
            <span className="text-zinc-600 text-base leading-none">{equipOpen ? '−' : '+'}</span>
          </button>
          {equipOpen && (
            <div className="px-4 pb-4 grid grid-cols-2 gap-2">
              {EQUIPMENT.map((eq) => (
                <button
                  key={eq}
                  onClick={() => setSelectedEquip(selectedEquip === eq ? null : eq)}
                  className="flex items-center gap-2 text-xs py-2 px-3 rounded-lg text-left transition-all"
                  style={selectedEquip === eq
                    ? { background: 'rgba(232,255,71,0.14)', color: '#e8ff47', border: '1px solid rgba(232,255,71,0.35)' }
                    : { background: 'rgba(255,255,255,0.04)', color: '#a1a1aa', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <span
                    className="w-4 h-4 rounded flex-shrink-0 flex items-center justify-center text-[9px] font-bold"
                    style={selectedEquip === eq
                      ? { background: '#e8ff47', color: '#0a0a0a' }
                      : { border: '1px solid rgba(255,255,255,0.15)', color: 'transparent' }}
                  >
                    ✓
                  </span>
                  {eq}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-4">
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
            >×</button>
          )}
        </div>

        {/* Results */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {filtered.map((ex) => (
              <ExerciseCard key={ex.id} exercise={ex} onClick={onSelectExercise} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-3xl mb-3">🔍</p>
            <p className="text-zinc-400 text-sm">No exercises found</p>
            <button
              onClick={() => { setSearch(''); setSelectedGroup('All'); setSelectedEquip(null); }}
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
