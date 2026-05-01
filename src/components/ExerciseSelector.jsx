import { useState, useMemo } from 'react';
import { EXERCISE_LIST } from '../data/exerciseList';

const EXCLUDED_KEYWORDS = ['yoga', 'breathwork', 'pregnancy', 'animal flow'];
const EQUIPMENT_OPTIONS = ['Dumbbells', 'Resistance Bands', 'Pull Up Bar', 'Kettlebell', 'Jump Rope', 'Yoga Mat', 'Chair'];
const STATIC_KEYWORDS = ['plank', 'wall sit', 'dead hang', 'l-sit', 'hollow hold', 'arch hold', 'horse stance'];

export function isStaticHold(name) {
  return STATIC_KEYWORDS.some((k) => name.toLowerCase().includes(k));
}

function inferDifficulty(name) {
  const n = name.toLowerCase();
  if (n.includes('muscle-up') || n.includes('planche') || n.includes('snatch') || n.includes('l-sit') || n.includes('one arm') || n.includes('pistol squat')) return 'Elite';
  if (n.includes('plyometric') || n.includes('box jump') || n.includes('archer') || n.includes('nordic') || n.includes('jump') || n.includes('explosive')) return 'Advanced';
  if (n.includes('barbell') || n.includes('dumbbell') || n.includes('cable') || n.includes('weighted') || n.includes('pull-up') || n.includes('chin-up') || n.includes('kettlebell')) return 'Intermediate';
  return 'Beginner';
}

function getEquipment(name) {
  const n = name.toLowerCase();
  const items = [];
  if (n.includes('dumbbell')) items.push('Dumbbells');
  if (n.includes(' band') || n.includes('resistance band')) items.push('Resistance Bands');
  if (n.includes('pull-up') || n.includes('pull up') || n.includes('chin-up') || n.includes('chin up') || n.includes('dead hang')) items.push('Pull Up Bar');
  if (n.includes('kettlebell')) items.push('Kettlebell');
  if (n.includes('jump rope') || n.includes('skipping')) items.push('Jump Rope');
  if (n.includes('yoga') || n.includes('mat work')) items.push('Yoga Mat');
  if (n.includes('chair')) items.push('Chair');
  return items;
}

const DIFF_STYLE = {
  Beginner:     { background: 'rgba(74,222,128,0.12)',  color: '#4ade80', border: '1px solid rgba(74,222,128,0.25)' },
  Intermediate: { background: 'rgba(0,255,135,0.10)',  color: '#00ff87', border: '1px solid rgba(0,255,135,0.25)' },
  Advanced:     { background: 'rgba(251,146,60,0.12)',  color: '#fb923c', border: '1px solid rgba(251,146,60,0.25)' },
  Elite:        { background: 'rgba(239,68,68,0.12)',   color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' },
};

const BASE_LIST = EXERCISE_LIST.filter(
  (e) => !EXCLUDED_KEYWORDS.some((k) => e.muscleGroup.toLowerCase().includes(k))
);

export default function ExerciseSelector({ mode, onSelect }) {
  const equipKey = `gymistry_equip_${mode}`;

  const [search,        setSearch]        = useState('');
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [equipOpen,     setEquipOpen]     = useState(false);
  const [selectedEquip, setSelectedEquip] = useState(() => {
    try { return JSON.parse(localStorage.getItem(equipKey) || '[]'); } catch { return []; }
  });
  const [lastEx] = useState(() => {
    try { return localStorage.getItem('gymistry_last_ex') || null; } catch { return null; }
  });

  const groups = useMemo(() => {
    const seen = new Set();
    for (const e of BASE_LIST) seen.add(e.muscleGroup);
    return ['All', ...Array.from(seen).sort()];
  }, []);

  const filtered = useMemo(() => {
    let list = BASE_LIST;
    if (selectedGroup !== 'All') list = list.filter((e) => e.muscleGroup === selectedGroup);
    list = list.filter((e) => {
      const eq = getEquipment(e.name);
      return eq.length === 0 || eq.some((q) => selectedEquip.includes(q));
    });
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((e) => e.name.toLowerCase().includes(q) || e.muscleGroup.toLowerCase().includes(q));
    }
    if (lastEx) {
      const idx = list.findIndex((e) => e.name === lastEx);
      if (idx > 0) list = [list[idx], ...list.slice(0, idx), ...list.slice(idx + 1)];
    }
    return list;
  }, [selectedGroup, selectedEquip, search, lastEx]);

  const toggleEquip = (eq) => {
    const next = selectedEquip.includes(eq)
      ? selectedEquip.filter((e) => e !== eq)
      : [...selectedEquip, eq];
    setSelectedEquip(next);
    try { localStorage.setItem(equipKey, JSON.stringify(next)); } catch {}
  };

  const handleSelect = (ex) => {
    try { localStorage.setItem('gymistry_last_ex', ex.name); } catch {}
    onSelect(ex.name, isStaticHold(ex.name));
  };

  const clearAll = () => {
    setSearch('');
    setSelectedGroup('All');
    setSelectedEquip([]);
    try { localStorage.setItem(equipKey, '[]'); } catch {}
  };

  return (
    <div>
      {/* Search */}
      <div className="relative mb-4">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">🔍</span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search exercises…"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#e8ff47]/50 transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 text-xl leading-none"
          >×</button>
        )}
      </div>

      {/* Muscle group chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4" style={{ scrollbarWidth: 'none' }}>
        {groups.map((g) => (
          <button
            key={g}
            onClick={() => setSelectedGroup(g)}
            className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-all"
            style={selectedGroup === g
              ? { background: 'rgba(232,255,71,0.14)', color: '#e8ff47', border: '1px solid rgba(232,255,71,0.35)' }
              : { background: 'rgba(255,255,255,0.04)', color: '#a1a1aa', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Equipment filter */}
      <div
        className="rounded-xl mb-4 overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <button
          onClick={() => setEquipOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-zinc-300"
        >
          <span>
            Equipment
            {selectedEquip.length > 0 && (
              <span style={{ color: '#e8ff47' }}> · {selectedEquip.length} selected</span>
            )}
          </span>
          <span className="text-zinc-600 text-base leading-none">{equipOpen ? '−' : '+'}</span>
        </button>
        {equipOpen && (
          <div className="px-4 pb-4 grid grid-cols-2 gap-2">
            {EQUIPMENT_OPTIONS.map((eq) => (
              <button
                key={eq}
                onClick={() => toggleEquip(eq)}
                className="flex items-center gap-2 text-xs py-2 px-3 rounded-lg text-left transition-all"
                style={selectedEquip.includes(eq)
                  ? { background: 'rgba(232,255,71,0.14)', color: '#e8ff47', border: '1px solid rgba(232,255,71,0.35)' }
                  : { background: 'rgba(255,255,255,0.04)', color: '#a1a1aa', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <span
                  className="w-4 h-4 rounded flex-shrink-0 flex items-center justify-center text-[9px] font-bold"
                  style={selectedEquip.includes(eq)
                    ? { background: '#e8ff47', color: '#0a0a0a' }
                    : { border: '1px solid rgba(255,255,255,0.15)', color: 'transparent' }}
                >✓</span>
                {eq}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Count */}
      <p className="text-xs text-zinc-600 mb-3">{filtered.length} exercises</p>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {filtered.map((ex) => {
            const diff = inferDifficulty(ex.name);
            const hold = mode === 'livetrainer' && isStaticHold(ex.name);
            const isLast = ex.name === lastEx;
            return (
              <button
                key={ex.id}
                onClick={() => handleSelect(ex)}
                className="group text-left rounded-xl p-3 transition-all hover:-translate-y-0.5"
                style={{
                  background: isLast ? 'rgba(232,255,71,0.06)' : 'rgba(255,255,255,0.03)',
                  border: isLast ? '1px solid rgba(232,255,71,0.2)' : '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <p className="text-xs font-semibold text-white leading-snug group-hover:text-[#e8ff47] transition-colors mb-2">
                  {ex.name}
                </p>
                <div className="flex flex-wrap gap-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={DIFF_STYLE[diff]}>
                    {diff}
                  </span>
                  {hold && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                      style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.25)' }}>
                      Timer
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-zinc-400 text-sm">No exercises found</p>
          <button onClick={clearAll} className="mt-3 text-xs underline" style={{ color: '#e8ff47' }}>
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
