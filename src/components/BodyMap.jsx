import { useState } from 'react';

function fill(group, selected, hovered) {
  if (selected === group) return 'rgba(0,255,135,0.30)';
  if (hovered  === group) return 'rgba(0,255,135,0.16)';
  return 'rgba(255,255,255,0.07)';
}

function stroke(group, selected, hovered) {
  return (selected === group || hovered === group) ? '#00ff87' : 'rgba(255,255,255,0.14)';
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
    strokeLinecap:  'round',
    style: { cursor: 'pointer', transition: 'fill 0.12s, stroke 0.12s' },
    onMouseEnter:   () => setHov(g),
    onMouseLeave:   () => setHov(null),
    onClick:        () => onSelect(g === sel ? 'All' : g),
  };
}

const GHOST = {
  fill:        'rgba(255,255,255,0.05)',
  stroke:      'rgba(255,255,255,0.12)',
  strokeWidth: 0.8,
};

// ── Front figure (viewBox 0 0 100 265) ───────────────────────────────────────

function FrontBody({ sel, hov, setHov, onSelect }) {
  const p = g => rp(g, sel, hov, setHov, onSelect);
  return (
    <svg viewBox="0 0 100 265" width="100" height="265" overflow="visible">

      {/* Ghost: head, neck, hip crease */}
      <circle cx="50" cy="14" r="12" {...GHOST} />
      <path d="M 45,26 L 44,34 L 56,34 L 55,26 Z" {...GHOST} />
      <path d="M 40,150 C 44,154 50,156 56,154 C 60,152 62,150 62,150 C 58,153 50,155 42,153 Z" {...GHOST} />

      {/* Shoulders — anterior deltoids */}
      <path d="M 38,34 C 18,30 9,46 11,61 C 13,72 23,76 33,72 C 39,68 40,57 40,46 Z" {...p('Shoulders')} />
      <path d="M 62,34 C 82,30 91,46 89,61 C 87,72 77,76 67,72 C 61,68 60,57 60,46 Z" {...p('Shoulders')} />

      {/* Chest — pectorals */}
      <path d="M 40,46 C 39,33 48,31 52,31 L 56,36 C 57,50 54,65 49,70 C 45,74 39,70 40,62 Z" {...p('Chest')} />
      <path d="M 60,46 C 61,33 52,31 48,31 L 44,36 C 43,50 46,65 51,70 C 55,74 61,70 60,62 Z" {...p('Chest')} />

      {/* Arms — biceps */}
      <path d="M 9,48 C 3,66 4,90 8,100 C 12,107 18,109 24,106 C 30,103 33,92 33,76 C 33,60 31,46 23,46 Z" {...p('Arms')} />
      <path d="M 91,48 C 97,66 96,90 92,100 C 88,107 82,109 76,106 C 70,103 67,92 67,76 C 67,60 69,46 77,46 Z" {...p('Arms')} />
      {/* Arms — forearms */}
      <path d="M 4,102 C 0,120 1,140 5,148 C 9,154 15,155 21,152 C 26,149 28,140 27,124 C 26,110 25,102 20,102 Z" {...p('Arms')} />
      <path d="M 96,102 C 100,120 99,140 95,148 C 91,154 85,155 79,152 C 74,149 72,140 73,124 C 74,110 75,102 80,102 Z" {...p('Arms')} />

      {/* Core — rectus abdominis + obliques */}
      <path d="M 40,68 C 37,90 37,118 39,144 C 43,150 50,152 50,152 C 50,152 57,150 61,144 C 63,118 63,90 60,68 C 56,66 50,65 44,65 Z" {...p('Core')} />

      {/* Legs — quadriceps */}
      <path d="M 38,160 C 27,180 26,203 29,218 C 33,226 41,228 49,226 C 55,223 57,214 57,200 C 57,182 56,162 52,160 Z" {...p('Legs')} />
      <path d="M 62,160 C 73,180 74,203 71,218 C 67,226 59,228 51,226 C 45,223 43,214 43,200 C 43,182 44,162 48,160 Z" {...p('Legs')} />
      {/* Legs — tibialis anterior / lower leg front */}
      <path d="M 32,220 C 28,232 28,248 31,253 C 34,257 41,258 47,256 C 51,253 52,245 51,232 C 50,222 48,218 43,219 Z" {...p('Legs')} />
      <path d="M 68,220 C 72,232 72,248 69,253 C 66,257 59,258 53,256 C 49,253 48,245 49,232 C 50,222 52,218 57,219 Z" {...p('Legs')} />
    </svg>
  );
}

// ── Back figure (viewBox 0 0 100 290) ────────────────────────────────────────

function BackBody({ sel, hov, setHov, onSelect }) {
  const p = g => rp(g, sel, hov, setHov, onSelect);
  return (
    <svg viewBox="0 0 100 290" width="100" height="290" overflow="visible">

      {/* Ghost: head, neck */}
      <circle cx="50" cy="14" r="12" {...GHOST} />
      <path d="M 45,26 L 44,34 L 56,34 L 55,26 Z" {...GHOST} />

      {/* Shoulders — rear deltoids */}
      <path d="M 38,34 C 18,30 9,46 11,61 C 13,72 23,76 33,72 C 39,68 40,57 40,46 Z" {...p('Shoulders')} />
      <path d="M 62,34 C 82,30 91,46 89,61 C 87,72 77,76 67,72 C 61,68 60,57 60,46 Z" {...p('Shoulders')} />
      {/* Shoulders — trapezius diamond */}
      <path d="M 40,46 C 40,57 44,63 50,65 C 56,63 60,57 60,46 L 55,34 L 45,34 Z" {...p('Shoulders')} />

      {/* Back — latissimus dorsi */}
      <path d="M 40,62 C 27,82 25,112 28,136 C 30,146 39,152 47,150 C 52,148 53,138 53,122 L 53,66 Z" {...p('Back')} />
      <path d="M 60,62 C 73,82 75,112 72,136 C 70,146 61,152 53,150 C 48,148 47,138 47,122 L 47,66 Z" {...p('Back')} />
      {/* Back — erector spinae / lower back */}
      <path d="M 42,150 C 46,161 50,164 50,164 C 50,164 54,161 58,150 C 54,146 50,144 50,144 C 50,144 46,146 42,150 Z" {...p('Back')} />

      {/* Arms — triceps */}
      <path d="M 9,48 C 3,66 4,90 8,100 C 12,107 18,109 24,106 C 30,103 33,92 33,76 C 33,60 31,46 23,46 Z" {...p('Arms')} />
      <path d="M 91,48 C 97,66 96,90 92,100 C 88,107 82,109 76,106 C 70,103 67,92 67,76 C 67,60 69,46 77,46 Z" {...p('Arms')} />
      {/* Arms — forearms */}
      <path d="M 4,102 C 0,120 1,140 5,148 C 9,154 15,155 21,152 C 26,149 28,140 27,124 C 26,110 25,102 20,102 Z" {...p('Arms')} />
      <path d="M 96,102 C 100,120 99,140 95,148 C 91,154 85,155 79,152 C 74,149 72,140 73,124 C 74,110 75,102 80,102 Z" {...p('Arms')} />

      {/* Glutes */}
      <path d="M 36,165 C 23,176 21,197 25,212 C 29,221 39,225 50,222 C 54,219 55,210 53,199 C 51,182 48,166 50,164 Z" {...p('Glutes')} />
      <path d="M 64,165 C 77,176 79,197 75,212 C 71,221 61,225 50,222 C 46,219 45,210 47,199 C 49,182 52,166 50,164 Z" {...p('Glutes')} />

      {/* Legs — hamstrings */}
      <path d="M 25,214 C 20,230 20,250 24,258 C 27,264 36,266 44,264 C 50,261 52,253 51,238 C 50,224 47,212 42,212 Z" {...p('Legs')} />
      <path d="M 75,214 C 80,230 80,250 76,258 C 73,264 64,266 56,264 C 50,261 48,253 49,238 C 50,224 53,212 58,212 Z" {...p('Legs')} />
      {/* Legs — gastrocnemius (calves) */}
      <path d="M 24,260 C 20,274 22,284 26,288 C 30,291 40,291 46,287 C 50,283 52,274 50,262 Z" {...p('Legs')} />
      <path d="M 76,260 C 80,274 78,284 74,288 C 70,291 60,291 54,287 C 50,283 48,274 50,262 Z" {...p('Legs')} />
    </svg>
  );
}

// ── Public component ──────────────────────────────────────────────────────────

export default function BodyMap({ selected, onSelect }) {
  const [hovered, setHovered] = useState(null);
  const label = hovered || (selected !== 'All' ? selected : null);

  return (
    <div className="select-none">
      <div className="flex items-end justify-center gap-10">
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
