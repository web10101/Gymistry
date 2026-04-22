import { useState, useMemo } from 'react';
import { Search, X, ChevronRight, Timer } from 'lucide-react';
import { EXERCISE_LIST } from '../data/exerciseList';

// ─── Exercise metadata ────────────────────────────────────────────────────────

const EXCLUDE_GROUPS = new Set(['Cardio']);

// Static holds that suit a timer better than a rep counter
const STATIC_HOLD_IDS = new Set([
  'plank', 'side-plank', 'weighted-plank', 'hollow-hold',
  'l-sit', 'wall-sit', 'copenhagen-plank',
]);

const ADVANCED_IDS = new Set([
  'handstand-push-up', 'pistol-squat', 'l-sit', 'dragon-flag',
  'nordic-hamstring-curl', 'power-clean', 'hang-clean', 'clean-and-jerk',
  'power-snatch', 'dumbbell-snatch', 'snatch-grip-deadlift', 'overhead-squat',
  'zercher-squat', 'turkish-getup', 'bear-complex', 'man-maker',
  'clean-pull', 'snatch-pull', 'toes-to-bar', 'ab-wheel-rollout',
  'barbell-rollout', 'glute-ham-raise', 'renegade-row', 'renegade-row-fb',
  'barbell-complex', 'single-arm-kb-clean', 'pike-push-up',
]);

const BEGINNER_IDS = new Set([
  'push-up', 'wide-grip-push-up', 'incline-push-up', 'decline-push-up',
  'push-up-plus', 'plank', 'side-plank', 'hollow-hold', 'dead-bug', 'bird-dog',
  'glute-bridge', 'single-leg-glute-bridge', 'banded-glute-bridge', 'frog-pump',
  'donkey-kick', 'fire-hydrant', 'clamshell', 'banded-clamshell',
  'lateral-band-walk', 'monster-walk',
  'crunch', 'sit-up', 'bicycle-crunch', 'reverse-crunch',
  'lying-leg-raise', 'flutter-kick', 'scissor-kick', 'hanging-knee-raise',
  'goblet-squat', 'wall-sit', 'step-up', 'standing-calf-raise', 'seated-calf-raise',
  'lateral-raise', 'seated-lateral-raise', 'front-raise', 'rear-delt-fly',
  'dumbbell-curl', 'hammer-curl', 'dumbbell-kickback',
  'chest-press-machine', 'pec-deck', 'machine-curl',
  'leg-press', 'leg-extension', 'lying-leg-curl', 'seated-leg-curl', 'standing-leg-curl',
  'adductor-machine', 'abductor-machine', 'hip-abduction-machine', 'seated-hip-abduction',
  'cable-kickback', 'weighted-donkey-kick', 'banded-fire-hydrant', 'banded-squat',
  'wrist-curl', 'reverse-wrist-curl', 'behind-back-wrist-curl',
  'jumping-jacks', 'high-knees', 'mountain-climbers', 'jump-rope', 'burpee',
]);

function getDifficulty(id) {
  if (ADVANCED_IDS.has(id)) return 'Advanced';
  if (BEGINNER_IDS.has(id)) return 'Beginner';
  return 'Intermediate';
}

const DIFF_STYLE = {
  Beginner:     { color: '#00ff87', bg: 'rgba(0,255,135,0.08)',  border: 'rgba(0,255,135,0.2)' },
  Intermediate: { color: '#ffaa00', bg: 'rgba(255,170,0,0.08)',  border: 'rgba(255,170,0,0.2)' },
  Advanced:     { color: '#ff6666', bg: 'rgba(255,68,68,0.08)',   border: 'rgba(255,68,68,0.2)' },
};

// ─── Public helper ────────────────────────────────────────────────────────────

export function isStaticHoldByName(name) {
  const ex = EXERCISE_LIST.find(e => e.name === name);
  return ex ? STATIC_HOLD_IDS.has(ex.id) : false;
}

// ─── ExerciseSelector component ───────────────────────────────────────────────
//
// Props:
//   value:    string | null   — currently selected exercise name
//   onChange: (name) => void  — called with name or null
//   mode:     'formcheck' | 'livetrainer'

export default function ExerciseSelector({ value, onChange, mode = 'formcheck' }) {
  const [search, setSearch]     = useState('');
  const [group, setGroup]       = useState('All');
  const [browsing, setBrowsing] = useState(!value);

  // Build filtered master list (excludes Cardio for both modes)
  const exercises = useMemo(
    () => EXERCISE_LIST.filter(e => !EXCLUDE_GROUPS.has(e.muscleGroup)),
    []
  );

  // Muscle group tab list derived from filtered master list
  const groups = useMemo(() => {
    const seen = new Set();
    const out  = ['All'];
    exercises.forEach(e => {
      if (!seen.has(e.muscleGroup)) { seen.add(e.muscleGroup); out.push(e.muscleGroup); }
    });
    return out;
  }, [exercises]);

  // Apply search + group filter
  const filtered = useMemo(() => {
    let list = exercises;
    if (group !== 'All') list = list.filter(e => e.muscleGroup === group);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(e => e.name.toLowerCase().includes(q));
    }
    return list;
  }, [exercises, group, search]);

  const handleSelect = (ex) => {
    onChange(ex.name);
    setBrowsing(false);
  };

  // ── Selected state ──────────────────────────────────────────────────────────
  if (value && !browsing) {
    const ex     = exercises.find(e => e.name === value);
    const diff   = ex ? getDifficulty(ex.id) : 'Intermediate';
    const ds     = DIFF_STYLE[diff];
    const isHold = mode === 'livetrainer' && ex && STATIC_HOLD_IDS.has(ex.id);

    return (
      <div className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#555555' }}>
          Selected exercise
        </p>
        <div
          className="flex items-center justify-between rounded-2xl px-4 py-4"
          style={{ background: 'rgba(0,255,135,0.05)', border: '1.5px solid rgba(0,255,135,0.2)' }}
        >
          <div className="min-w-0">
            <p className="font-semibold text-white text-sm truncate">{value}</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {ex && <span className="text-xs" style={{ color: '#555555' }}>{ex.muscleGroup}</span>}
              {ex && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ color: ds.color, background: ds.bg, border: `1px solid ${ds.border}` }}
                >
                  {diff}
                </span>
              )}
              {isHold && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                  style={{ color: '#888888', background: 'rgba(255,255,255,0.05)', border: '1px solid #333333' }}
                >
                  <Timer size={9} />
                  Timer
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setBrowsing(true)}
            className="ml-4 flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
            style={{ color: '#00ff87', background: 'rgba(0,255,135,0.08)', border: '1px solid rgba(0,255,135,0.2)' }}
          >
            Change
          </button>
        </div>
      </div>
    );
  }

  // ── Browse state ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#555555' }}>
          {mode === 'formcheck' ? 'Select exercise' : 'Choose exercise'}
        </p>
        {value && (
          <button
            onClick={() => setBrowsing(false)}
            className="text-xs font-medium transition-colors"
            style={{ color: '#555555' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#ffffff'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#555555'; }}
          >
            Cancel
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: '#555555' }}
        />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search exercises…"
          className="input-field"
          style={{ paddingLeft: 36, paddingRight: search ? 36 : 14, fontSize: 14, height: 44 }}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
            style={{ color: '#555555' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#ffffff'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#555555'; }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Muscle group tabs — horizontal scroll */}
      <div
        className="flex gap-2 overflow-x-auto pb-1"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {groups.map(g => (
          <button
            key={g}
            onClick={() => setGroup(g)}
            className="flex-shrink-0 text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap"
            style={
              group === g
                ? { background: '#00ff87', color: '#000000', border: '1px solid transparent' }
                : { background: '#111111', color: '#888888', border: '1px solid #222222' }
            }
          >
            {g}
          </button>
        ))}
      </div>

      {/* Result count */}
      <p className="text-xs" style={{ color: '#444444' }}>
        {filtered.length} exercise{filtered.length !== 1 ? 's' : ''}
        {group !== 'All' && <span style={{ color: '#00ff87' }}> · {group}</span>}
      </p>

      {/* Exercise list — scrollable */}
      <div className="space-y-1.5 overflow-y-auto pr-0.5" style={{ maxHeight: 300 }}>
        {filtered.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm font-medium text-white mb-1">No exercises found</p>
            <button
              onClick={() => { setSearch(''); setGroup('All'); }}
              className="text-xs font-semibold mt-2"
              style={{ color: '#00ff87' }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          filtered.map(ex => {
            const diff   = getDifficulty(ex.id);
            const ds     = DIFF_STYLE[diff];
            const isHold = mode === 'livetrainer' && STATIC_HOLD_IDS.has(ex.id);
            return (
              <button
                key={ex.id}
                onClick={() => handleSelect(ex)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-left"
                style={{ background: '#111111', border: '1.5px solid #1e1e1e' }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(0,255,135,0.25)';
                  e.currentTarget.style.background  = '#141414';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#1e1e1e';
                  e.currentTarget.style.background  = '#111111';
                }}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white truncate">{ex.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#555555' }}>{ex.muscleGroup}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
                  {isHold && (
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5"
                      style={{ color: '#888888', background: 'rgba(255,255,255,0.05)', border: '1px solid #333333' }}
                    >
                      <Timer size={9} />Timer
                    </span>
                  )}
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ color: ds.color, background: ds.bg, border: `1px solid ${ds.border}` }}
                  >
                    {diff}
                  </span>
                  <ChevronRight size={14} style={{ color: '#333333' }} />
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
