import { useState } from 'react';

function rp(g, sel, hov, setHov, onSelect) {
  const on = sel === g || hov === g;
  return {
    fill:           on ? (sel === g ? 'rgba(232,255,71,0.28)' : 'rgba(232,255,71,0.13)') : 'rgba(255,255,255,0.055)',
    stroke:         on ? '#e8ff47' : 'rgba(255,255,255,0.16)',
    strokeWidth:    on ? 1.3 : 0.7,
    strokeLinejoin: 'round',
    strokeLinecap:  'round',
    style: { cursor: 'pointer', transition: 'fill 0.14s, stroke 0.14s' },
    onMouseEnter:   () => setHov(g),
    onMouseLeave:   () => setHov(null),
    onClick:        () => onSelect(g === sel ? 'All' : g),
  };
}

const G = { fill: 'rgba(255,255,255,0.04)', stroke: 'rgba(255,255,255,0.13)', strokeWidth: 0.7, strokeLinejoin: 'round' };
const GL = { fill: 'none', stroke: 'rgba(255,255,255,0.10)', strokeWidth: 0.55 };

// ── Front body ────────────────────────────────────────────────────────────────
// viewBox 0 0 200 450

function FrontBody({ sel, hov, setHov, onSelect }) {
  const p = (g) => rp(g, sel, hov, setHov, onSelect);
  return (
    <svg viewBox="0 0 200 450" style={{ width: '100%', height: '100%' }} overflow="visible">

      {/* Structural ghost */}
      <ellipse cx="100" cy="21" rx="19" ry="21" {...G} />
      {/* hair tuft */}
      <path d="M 84,4 C 88,0 96,0 100,2 C 104,0 112,0 116,4" fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="1.2" />
      <path d="M 88,43 C 91,41 100,40 112,43 L 114,62 C 110,64 105,65 100,65 C 95,65 90,64 86,62 Z" {...G} />
      <ellipse cx="16" cy="328" rx="8" ry="11" {...G} />
      <ellipse cx="184" cy="328" rx="8" ry="11" {...G} />
      <ellipse cx="72" cy="436" rx="13" ry="9" {...G} />
      <ellipse cx="128" cy="436" rx="13" ry="9" {...G} />

      {/* Shoulders */}
      <path d="M 56,74 C 47,69 33,67 21,75 C 11,82 9,98 13,112 C 17,123 29,129 41,127 C 51,125 56,117 56,107 L 56,85 Z" {...p('Shoulders')} />
      <path d="M 144,74 C 153,69 167,67 179,75 C 189,82 191,98 187,112 C 183,123 171,129 159,127 C 149,125 144,117 144,107 L 144,85 Z" {...p('Shoulders')} />

      {/* Chest */}
      <path d="M 56,82 C 60,72 70,66 84,64 L 100,64 L 100,132 C 88,136 74,134 64,126 C 58,120 56,110 56,100 Z" {...p('Chest')} />
      <path d="M 144,82 C 140,72 130,66 116,64 L 100,64 L 100,132 C 112,136 126,134 136,126 C 142,120 144,110 144,100 Z" {...p('Chest')} />
      <line x1="100" y1="64" x2="100" y2="132" {...GL} />
      <path d="M 58,102 C 72,106 88,108 100,108 C 112,108 128,106 142,102" {...GL} />

      {/* Core — obliques + abs */}
      <path d="M 56,102 C 54,116 51,132 49,150 C 47,166 49,182 55,194 L 66,198 L 62,132 C 61,120 59,110 56,102 Z" {...p('Core')} />
      <path d="M 144,102 C 146,116 149,132 151,150 C 153,166 151,182 145,194 L 134,198 L 138,132 C 139,120 141,110 144,102 Z" {...p('Core')} />
      <path d="M 62,132 L 100,132 L 100,204 C 93,208 82,206 74,201 C 66,195 62,183 62,169 Z" {...p('Core')} />
      <path d="M 138,132 L 100,132 L 100,204 C 107,208 118,206 126,201 C 134,195 138,183 138,169 Z" {...p('Core')} />
      {/* 6-pack lines */}
      <path d="M 66,153 C 80,156 92,157 100,157 C 108,157 120,156 134,153" {...GL} />
      <path d="M 64,173 C 78,177 91,179 100,179 C 109,179 122,177 136,173" {...GL} />
      <line x1="100" y1="132" x2="100" y2="204" {...GL} />

      {/* Arms */}
      <path d="M 50,125 C 41,123 29,127 21,139 C 14,150 14,168 18,180 C 22,190 33,196 43,194 C 52,192 56,185 56,175 C 56,158 54,140 50,125 Z" {...p('Arms')} />
      <path d="M 150,125 C 159,123 171,127 179,139 C 186,150 186,168 182,180 C 178,190 167,196 157,194 C 148,192 144,185 144,175 C 144,158 146,140 150,125 Z" {...p('Arms')} />
      <path d="M 43,194 C 34,194 22,199 14,213 C 8,225 8,252 12,269 C 16,283 27,289 38,287 C 48,285 54,277 54,262 C 54,243 51,216 43,194 Z" {...p('Arms')} />
      <path d="M 157,194 C 166,194 178,199 186,213 C 192,225 192,252 188,269 C 184,283 173,289 162,287 C 152,285 146,277 146,262 C 146,243 149,216 157,194 Z" {...p('Arms')} />

      {/* Legs — quads */}
      <path d="M 62,218 C 55,220 51,232 51,248 L 51,318 C 51,330 57,338 69,340 L 87,340 C 95,338 100,330 100,318 L 100,248 C 100,232 93,220 84,218 C 78,216 68,216 62,218 Z" {...p('Legs')} />
      <path d="M 138,218 C 145,220 149,232 149,248 L 149,318 C 149,330 143,338 131,340 L 113,340 C 105,338 100,330 100,318 L 100,248 C 100,232 107,220 116,218 C 122,216 132,216 138,218 Z" {...p('Legs')} />
      {/* knee line */}
      <path d="M 55,320 C 68,326 84,328 100,328 C 116,328 132,326 145,320" {...GL} />

      {/* Legs — calves */}
      <path d="M 60,340 C 53,342 49,354 47,370 L 47,400 C 47,412 53,420 63,422 L 81,422 C 91,420 97,412 97,400 L 97,370 C 95,354 88,342 80,340 C 74,338 66,338 60,340 Z" {...p('Legs')} />
      <path d="M 140,340 C 147,342 151,354 153,370 L 153,400 C 153,412 147,420 137,422 L 119,422 C 109,420 103,412 103,400 L 103,370 C 105,354 112,342 120,340 C 126,338 134,338 140,340 Z" {...p('Legs')} />

      {/* Hip/pelvis ghost */}
      <path d="M 58,206 C 64,218 80,226 100,228 C 120,226 136,218 142,206" fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="0.7" />
    </svg>
  );
}

// ── Back body ─────────────────────────────────────────────────────────────────

function BackBody({ sel, hov, setHov, onSelect }) {
  const p = (g) => rp(g, sel, hov, setHov, onSelect);
  return (
    <svg viewBox="0 0 200 450" style={{ width: '100%', height: '100%' }} overflow="visible">

      {/* Structural ghost */}
      <ellipse cx="100" cy="21" rx="19" ry="21" {...G} />
      <path d="M 84,4 C 88,0 96,0 100,2 C 104,0 112,0 116,4" fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="1.2" />
      <path d="M 88,43 C 91,41 100,40 112,43 L 114,62 C 110,64 105,65 100,65 C 95,65 90,64 86,62 Z" {...G} />
      <ellipse cx="16" cy="328" rx="8" ry="11" {...G} />
      <ellipse cx="184" cy="328" rx="8" ry="11" {...G} />
      <ellipse cx="72" cy="436" rx="13" ry="9" {...G} />
      <ellipse cx="128" cy="436" rx="13" ry="9" {...G} />

      {/* Rear delts */}
      <path d="M 56,74 C 47,69 33,67 21,75 C 11,82 9,98 13,112 C 17,123 29,129 41,127 C 51,125 56,117 56,107 L 56,85 Z" {...p('Shoulders')} />
      <path d="M 144,74 C 153,69 167,67 179,75 C 189,82 191,98 187,112 C 183,123 171,129 159,127 C 149,125 144,117 144,107 L 144,85 Z" {...p('Shoulders')} />

      {/* Traps */}
      <path d="M 100,64 C 114,66 130,71 142,79 C 152,86 158,97 155,109 C 152,120 142,126 130,130 C 118,133 108,134 100,134 C 92,134 82,133 70,130 C 58,126 48,120 45,109 C 42,97 48,86 58,79 C 70,71 86,66 100,64 Z" {...p('Back')} />

      {/* Lats */}
      <path d="M 56,102 C 51,116 47,134 45,152 C 43,168 45,184 51,196 L 70,204 L 68,132 C 67,119 63,109 56,102 Z" {...p('Back')} />
      <path d="M 144,102 C 149,116 153,134 155,152 C 157,168 155,184 149,196 L 130,204 L 132,132 C 133,119 137,109 144,102 Z" {...p('Back')} />

      {/* Lower back erectors */}
      <path d="M 70,134 C 67,150 67,168 70,186 L 86,190 L 88,132 Z" {...p('Back')} />
      <path d="M 130,134 C 133,150 133,168 130,186 L 114,190 L 112,132 Z" {...p('Back')} />
      <line x1="100" y1="64" x2="100" y2="204" {...GL} />

      {/* Triceps */}
      <path d="M 50,125 C 41,123 29,127 21,139 C 14,150 14,168 18,180 C 22,190 33,196 43,194 C 52,192 56,185 56,175 C 56,158 54,140 50,125 Z" {...p('Arms')} />
      <path d="M 150,125 C 159,123 171,127 179,139 C 186,150 186,168 182,180 C 178,190 167,196 157,194 C 148,192 144,185 144,175 C 144,158 146,140 150,125 Z" {...p('Arms')} />
      {/* Forearms */}
      <path d="M 43,194 C 34,194 22,199 14,213 C 8,225 8,252 12,269 C 16,283 27,289 38,287 C 48,285 54,277 54,262 C 54,243 51,216 43,194 Z" {...p('Arms')} />
      <path d="M 157,194 C 166,194 178,199 186,213 C 192,225 192,252 188,269 C 184,283 173,289 162,287 C 152,285 146,277 146,262 C 146,243 149,216 157,194 Z" {...p('Arms')} />

      {/* Glutes — two prominent round shapes */}
      <ellipse cx="76" cy="228" rx="32" ry="34" {...p('Glutes')} />
      <ellipse cx="124" cy="228" rx="32" ry="34" {...p('Glutes')} />
      <line x1="100" y1="204" x2="100" y2="262" {...GL} />
      <path d="M 56,258 C 68,266 84,270 100,270 C 116,270 132,266 144,258" {...GL} />

      {/* Hamstrings */}
      <path d="M 58,268 C 51,270 47,282 47,298 L 47,328 C 47,340 53,348 65,350 L 85,350 C 94,348 100,340 100,328 L 100,298 C 100,282 93,270 83,268 C 76,266 66,266 58,268 Z" {...p('Legs')} />
      <path d="M 142,268 C 149,270 153,282 153,298 L 153,328 C 153,340 147,348 135,350 L 115,350 C 106,348 100,340 100,328 L 100,298 C 100,282 107,270 117,268 C 124,266 134,266 142,268 Z" {...p('Legs')} />

      {/* Calves — teardrop shapes */}
      <path d="M 58,350 C 50,353 45,366 43,382 L 43,410 C 43,422 50,430 62,432 L 80,432 C 92,430 99,422 99,410 L 99,382 C 97,365 90,353 80,350 C 74,348 64,348 58,350 Z" {...p('Legs')} />
      <path d="M 142,350 C 150,353 155,366 157,382 L 157,410 C 157,422 150,430 138,432 L 120,432 C 108,430 101,422 101,410 L 101,382 C 103,365 110,353 120,350 C 126,348 136,348 142,350 Z" {...p('Legs')} />
    </svg>
  );
}

// ── Public component ──────────────────────────────────────────────────────────

const MUSCLE_LABELS = {
  Chest: 'Chest', Shoulders: 'Shoulders', Arms: 'Arms',
  Core: 'Core', Back: 'Back', Legs: 'Legs', Glutes: 'Glutes',
};

export default function BodyMap({ selected, onSelect }) {
  const [hovered, setHovered] = useState(null);
  const label = MUSCLE_LABELS[hovered] || (selected !== 'All' ? selected : null);

  return (
    <div className="select-none w-full">
      <div className="flex items-start justify-center gap-2">
        {/* Front */}
        <div className="flex-1 max-w-[160px]">
          <p className="text-center text-[10px] text-zinc-600 uppercase tracking-widest mb-1">Front</p>
          <FrontBody sel={selected} hov={hovered} setHov={setHovered} onSelect={onSelect} />
        </div>
        {/* Back */}
        <div className="flex-1 max-w-[160px]">
          <p className="text-center text-[10px] text-zinc-600 uppercase tracking-widest mb-1">Back</p>
          <BackBody sel={selected} hov={hovered} setHov={setHovered} onSelect={onSelect} />
        </div>
      </div>

      {/* Special groups */}
      <div className="flex justify-center gap-2 mt-4">
        {[{ g: 'Full Body', label: 'Full Body' }, { g: 'Cardio', label: 'Cardio' }].map(({ g, label: lb }) => (
          <button
            key={g}
            onClick={() => onSelect(g === selected ? 'All' : g)}
            onMouseEnter={() => setHovered(g)}
            onMouseLeave={() => setHovered(null)}
            className="text-xs px-4 py-1.5 rounded-full font-semibold transition-all"
            style={selected === g
              ? { background: 'rgba(232,255,71,0.16)', color: '#e8ff47', border: '1px solid rgba(232,255,71,0.4)' }
              : { background: 'rgba(255,255,255,0.04)', color: '#52525b', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {lb}
          </button>
        ))}
        {selected !== 'All' && (
          <button
            onClick={() => onSelect('All')}
            className="text-xs px-4 py-1.5 rounded-full font-semibold transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', color: '#71717a', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Active label */}
      <div className="h-5 mt-2 text-center">
        {label && <p className="text-xs font-bold tracking-widest uppercase" style={{ color: '#e8ff47' }}>{label}</p>}
      </div>
    </div>
  );
}
