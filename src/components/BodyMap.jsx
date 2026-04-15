import { useState } from 'react';

// ── Helpers ───────────────────────────────────────────────────────────────────

function fill(group, selected, hovered) {
  if (selected === group) return 'rgba(232,255,71,0.32)';
  if (hovered  === group) return 'rgba(232,255,71,0.18)';
  return 'rgba(255,255,255,0.07)';
}

function stroke(group, selected, hovered) {
  return (selected === group || hovered === group) ? '#e8ff47' : 'rgba(255,255,255,0.13)';
}

function sw(group, selected, hovered) {
  return (selected === group || hovered === group) ? 1.5 : 0.8;
}

// Bind all SVG interaction props to a muscle group
function rp(g, sel, hov, setHov, onSelect) {
  return {
    fill:         fill(g, sel, hov),
    stroke:       stroke(g, sel, hov),
    strokeWidth:  sw(g, sel, hov),
    strokeLinejoin: 'round',
    style: { cursor: 'pointer', transition: 'fill 0.12s, stroke 0.12s' },
    onMouseEnter: () => setHov(g),
    onMouseLeave: () => setHov(null),
    onClick:      () => onSelect(g === sel ? 'All' : g),
  };
}

// Non-interactive structural parts (head, neck)
const GHOST = {
  fill: 'rgba(255,255,255,0.05)',
  stroke: 'rgba(255,255,255,0.1)',
  strokeWidth: 0.6,
};

// ── Front body (viewBox 0 0 96 188) ─────────────────────────────────────────
// Figure centred at x=48.  All coords stay within 0–96 × 0–188.
// Regions:  Chest | Core | Shoulders (L+R) | Arms (L+R, upper+forearm)
//           Legs  (L+R quad + calf)

function FrontBody({ sel, hov, setHov, onSelect }) {
  const p = (g) => rp(g, sel, hov, setHov, onSelect);
  return (
    <svg viewBox="0 0 96 188" width="96" height="188" overflow="visible">
      {/* Head */}
      <circle cx="48" cy="12" r="10" {...GHOST} />
      {/* Neck */}
      <rect x="44" y="22" width="8" height="5" rx="1" {...GHOST} />

      {/* Left shoulder cap */}
      <path d="M 16,30 L 34,27 L 32,52 L 14,54 Z" {...p('Shoulders')} />
      {/* Right shoulder cap */}
      <path d="M 62,27 L 80,30 L 82,54 L 64,52 Z" {...p('Shoulders')} />

      {/* Chest */}
      <path d="M 34,27 L 62,27 L 64,52 L 62,72 L 34,72 L 32,52 Z" {...p('Chest')} />

      {/* Core / abs */}
      <path d="M 34,72 L 62,72 L 64,96 L 32,96 Z" {...p('Core')} />

      {/* Left upper arm (bicep) */}
      <path d="M 10,30 L 20,30 L 18,68 L 8,66 Z" {...p('Arms')} />
      {/* Left forearm */}
      <path d="M 8,66 L 18,68 L 16,104 L 6,102 Z" {...p('Arms')} />

      {/* Right upper arm */}
      <path d="M 76,30 L 86,30 L 88,66 L 78,68 Z" {...p('Arms')} />
      {/* Right forearm */}
      <path d="M 78,68 L 88,66 L 90,102 L 80,104 Z" {...p('Arms')} />

      {/* Hips / pelvis (structural, not a group) */}
      <path d="M 32,96 L 64,96 L 66,112 L 30,112 Z" {...GHOST} />

      {/* Left quad */}
      <path d="M 30,112 L 48,112 L 48,154 L 29,152 Z" {...p('Legs')} />
      {/* Right quad */}
      <path d="M 48,112 L 66,112 L 67,152 L 48,154 Z" {...p('Legs')} />

      {/* Left calf */}
      <path d="M 29,152 L 48,154 L 47,180 L 28,178 Z" {...p('Legs')} />
      {/* Right calf */}
      <path d="M 48,154 L 67,152 L 68,178 L 49,180 Z" {...p('Legs')} />
    </svg>
  );
}

// ── Back body ─────────────────────────────────────────────────────────────────
// Same coordinate system. Regions: Back (upper+lower) | Shoulders | Arms
//   Glutes | Legs (hamstrings + calves)

function BackBody({ sel, hov, setHov, onSelect }) {
  const p = (g) => rp(g, sel, hov, setHov, onSelect);
  return (
    <svg viewBox="0 0 96 188" width="96" height="188" overflow="visible">
      {/* Head */}
      <circle cx="48" cy="12" r="10" {...GHOST} />
      {/* Neck */}
      <rect x="44" y="22" width="8" height="5" rx="1" {...GHOST} />

      {/* Left rear delt */}
      <path d="M 16,30 L 34,27 L 32,52 L 14,54 Z" {...p('Shoulders')} />
      {/* Right rear delt */}
      <path d="M 62,27 L 80,30 L 82,54 L 64,52 Z" {...p('Shoulders')} />

      {/* Upper back — traps / lats */}
      <path d="M 34,27 L 62,27 L 64,52 L 62,72 L 34,72 L 32,52 Z" {...p('Back')} />
      {/* Lower back — spinal erectors */}
      <path d="M 34,72 L 62,72 L 64,96 L 32,96 Z" {...p('Back')} />

      {/* Left tricep */}
      <path d="M 10,30 L 20,30 L 18,68 L 8,66 Z" {...p('Arms')} />
      {/* Left forearm */}
      <path d="M 8,66 L 18,68 L 16,104 L 6,102 Z" {...p('Arms')} />

      {/* Right tricep */}
      <path d="M 76,30 L 86,30 L 88,66 L 78,68 Z" {...p('Arms')} />
      {/* Right forearm */}
      <path d="M 78,68 L 88,66 L 90,102 L 80,104 Z" {...p('Arms')} />

      {/* Glutes */}
      <path d="M 30,96 L 66,96 L 68,120 L 28,120 Z" {...p('Glutes')} />

      {/* Left hamstring */}
      <path d="M 28,120 L 48,120 L 48,158 L 27,156 Z" {...p('Legs')} />
      {/* Right hamstring */}
      <path d="M 48,120 L 68,120 L 69,156 L 48,158 Z" {...p('Legs')} />

      {/* Left calf */}
      <path d="M 27,156 L 48,158 L 47,180 L 26,178 Z" {...p('Legs')} />
      {/* Right calf */}
      <path d="M 48,158 L 69,156 L 70,178 L 49,180 Z" {...p('Legs')} />
    </svg>
  );
}

// ── Public component ──────────────────────────────────────────────────────────

export default function BodyMap({ selected, onSelect }) {
  const [hovered, setHovered] = useState(null);
  const label = hovered || (selected !== 'All' ? selected : null);

  return (
    <div className="select-none">
      {/* SVG pair */}
      <div className="flex items-start justify-center gap-8">
        <div className="text-center">
          <p className="text-xs text-zinc-600 uppercase tracking-widest mb-2">Front</p>
          <FrontBody sel={selected} hov={hovered} setHov={setHovered} onSelect={onSelect} />
        </div>
        <div className="text-center">
          <p className="text-xs text-zinc-600 uppercase tracking-widest mb-2">Back</p>
          <BackBody sel={selected} hov={hovered} setHov={setHovered} onSelect={onSelect} />
        </div>
      </div>

      {/* Full Body + Cardio buttons */}
      <div className="flex justify-center gap-2 mt-5">
        {[
          { group: 'Full Body', icon: '⚡' },
          { group: 'Cardio',    icon: '🏃' },
        ].map(({ group, icon }) => (
          <button
            key={group}
            onClick={() => onSelect(group === selected ? 'All' : group)}
            className="text-xs px-3.5 py-1.5 rounded-full font-semibold transition-all"
            style={
              selected === group
                ? { background: 'rgba(232,255,71,0.16)', color: '#e8ff47', border: '1px solid rgba(232,255,71,0.45)' }
                : { background: 'rgba(255,255,255,0.05)', color: '#52525b', border: '1px solid rgba(255,255,255,0.09)' }
            }
            onMouseEnter={() => setHovered(group)}
            onMouseLeave={() => setHovered(null)}
          >
            {icon} {group}
          </button>
        ))}
      </div>

      {/* Active label */}
      <div className="h-5 mt-2.5 text-center">
        {label && (
          <p className="text-xs font-semibold tracking-wide" style={{ color: '#e8ff47' }}>
            {label}
          </p>
        )}
      </div>
    </div>
  );
}
