import { useState } from 'react';

function fill(group, selected, hovered) {
  if (selected === group) return 'rgba(0,255,135,0.28)';
  if (hovered  === group) return 'rgba(0,255,135,0.14)';
  return 'rgba(255,255,255,0.06)';
}

function stroke(group, selected, hovered) {
  return (selected === group || hovered === group) ? '#00ff87' : 'rgba(255,255,255,0.11)';
}

function sw(group, selected, hovered) {
  return (selected === group || hovered === group) ? 1.5 : 0.8;
}

function rp(g, sel, hov, setHov, onSelect) {
  return {
    fill:           fill(g, sel, hov),
    stroke:         stroke(g, sel, hov),
    strokeWidth:    sw(g, sel, hov),
    strokeLinejoin: 'round',
    style: { cursor: 'pointer', transition: 'fill 0.12s, stroke 0.12s' },
    onMouseEnter:   () => setHov(g),
    onMouseLeave:   () => setHov(null),
    onClick:        () => onSelect(g === sel ? 'All' : g),
  };
}

const GHOST = {
  fill:        'rgba(255,255,255,0.04)',
  stroke:      'rgba(255,255,255,0.09)',
  strokeWidth: 0.6,
};

function FrontBody({ sel, hov, setHov, onSelect }) {
  const p = (g) => rp(g, sel, hov, setHov, onSelect);
  return (
    <svg viewBox="0 0 96 188" width="96" height="188" overflow="visible">
      <circle cx="48" cy="12" r="10" {...GHOST} />
      <rect x="44" y="22" width="8" height="5" rx="1" {...GHOST} />
      <path d="M 16,30 L 34,27 L 32,52 L 14,54 Z" {...p('Shoulders')} />
      <path d="M 62,27 L 80,30 L 82,54 L 64,52 Z" {...p('Shoulders')} />
      <path d="M 34,27 L 62,27 L 64,52 L 62,72 L 34,72 L 32,52 Z" {...p('Chest')} />
      <path d="M 34,72 L 62,72 L 64,96 L 32,96 Z" {...p('Core')} />
      <path d="M 10,30 L 20,30 L 18,68 L 8,66 Z" {...p('Arms')} />
      <path d="M 8,66 L 18,68 L 16,104 L 6,102 Z" {...p('Arms')} />
      <path d="M 76,30 L 86,30 L 88,66 L 78,68 Z" {...p('Arms')} />
      <path d="M 78,68 L 88,66 L 90,102 L 80,104 Z" {...p('Arms')} />
      <path d="M 32,96 L 64,96 L 66,112 L 30,112 Z" {...GHOST} />
      <path d="M 30,112 L 48,112 L 48,154 L 29,152 Z" {...p('Legs')} />
      <path d="M 48,112 L 66,112 L 67,152 L 48,154 Z" {...p('Legs')} />
      <path d="M 29,152 L 48,154 L 47,180 L 28,178 Z" {...p('Legs')} />
      <path d="M 48,154 L 67,152 L 68,178 L 49,180 Z" {...p('Legs')} />
    </svg>
  );
}

function BackBody({ sel, hov, setHov, onSelect }) {
  const p = (g) => rp(g, sel, hov, setHov, onSelect);
  return (
    <svg viewBox="0 0 96 188" width="96" height="188" overflow="visible">
      <circle cx="48" cy="12" r="10" {...GHOST} />
      <rect x="44" y="22" width="8" height="5" rx="1" {...GHOST} />
      <path d="M 16,30 L 34,27 L 32,52 L 14,54 Z" {...p('Shoulders')} />
      <path d="M 62,27 L 80,30 L 82,54 L 64,52 Z" {...p('Shoulders')} />
      <path d="M 34,27 L 62,27 L 64,52 L 62,72 L 34,72 L 32,52 Z" {...p('Back')} />
      <path d="M 34,72 L 62,72 L 64,96 L 32,96 Z" {...p('Back')} />
      <path d="M 10,30 L 20,30 L 18,68 L 8,66 Z" {...p('Arms')} />
      <path d="M 8,66 L 18,68 L 16,104 L 6,102 Z" {...p('Arms')} />
      <path d="M 76,30 L 86,30 L 88,66 L 78,68 Z" {...p('Arms')} />
      <path d="M 78,68 L 88,66 L 90,102 L 80,104 Z" {...p('Arms')} />
      <path d="M 30,96 L 66,96 L 68,120 L 28,120 Z" {...p('Glutes')} />
      <path d="M 28,120 L 48,120 L 48,158 L 27,156 Z" {...p('Legs')} />
      <path d="M 48,120 L 68,120 L 69,156 L 48,158 Z" {...p('Legs')} />
      <path d="M 27,156 L 48,158 L 47,180 L 26,178 Z" {...p('Legs')} />
      <path d="M 48,158 L 69,156 L 70,178 L 49,180 Z" {...p('Legs')} />
    </svg>
  );
}

export default function BodyMap({ selected, onSelect }) {
  const [hovered, setHovered] = useState(null);
  const label = hovered || (selected !== 'All' ? selected : null);

  return (
    <div className="select-none">
      <div className="flex items-start justify-center gap-10">
        <div className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: '#444444' }}>Front</p>
          <FrontBody sel={selected} hov={hovered} setHov={setHovered} onSelect={onSelect} />
        </div>
        <div className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: '#444444' }}>Back</p>
          <BackBody sel={selected} hov={hovered} setHov={setHovered} onSelect={onSelect} />
        </div>
      </div>

      {/* Extra category buttons */}
      <div className="flex justify-center gap-2 mt-5">
        {[
          { group: 'Full Body', label: 'Full Body' },
          { group: 'Cardio',    label: 'Cardio'    },
        ].map(({ group, label: btn }) => (
          <button
            key={group}
            onClick={() => onSelect(group === selected ? 'All' : group)}
            className="text-xs px-4 py-1.5 rounded-full font-semibold transition-all"
            style={
              selected === group
                ? { background: 'rgba(0,255,135,0.12)', color: '#00ff87', border: '1px solid rgba(0,255,135,0.4)' }
                : { background: 'rgba(255,255,255,0.04)', color: '#555555', border: '1px solid rgba(255,255,255,0.08)' }
            }
            onMouseEnter={() => setHovered(group)}
            onMouseLeave={() => setHovered(null)}
          >
            {btn}
          </button>
        ))}
      </div>

      {/* Active label */}
      <div className="h-5 mt-2 text-center">
        {label && (
          <p className="text-xs font-semibold tracking-wide" style={{ color: '#00ff87' }}>
            {label}
          </p>
        )}
      </div>
    </div>
  );
}
