import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { getExerciseInfo } from '../api/exerciseInfo';

// ── Skeleton animation constants ──────────────────────────────────────────────

const JOINT_KEYS = [
  'head','neck',
  'lShoulder','rShoulder',
  'lElbow','rElbow',
  'lWrist','rWrist',
  'lHip','rHip',
  'lKnee','rKnee',
  'lAnkle','rAnkle',
];

const CONNECTIONS = [
  ['head','neck'],
  ['neck','lShoulder'], ['neck','rShoulder'],
  ['lShoulder','lElbow'], ['lElbow','lWrist'],
  ['rShoulder','rElbow'], ['rElbow','rWrist'],
  ['lShoulder','lHip'],  ['rShoulder','rHip'],
  ['lHip','rHip'],
  ['lHip','lKnee'],   ['lKnee','lAnkle'],
  ['rHip','rKnee'],   ['rKnee','rAnkle'],
];

const PHASE_MS = 1800;

function lerp(a, b, t) { return a + (b - a) * t; }
function smoothstep(t) { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); }

function lerpJoints(from, to, t) {
  const s   = smoothstep(t);
  const out = {};
  for (const k of JOINT_KEYS) {
    if (!from?.[k] || !to?.[k]) continue;
    out[k] = [lerp(from[k][0], to[k][0], s), lerp(from[k][1], to[k][1], s)];
  }
  return out;
}

function drawSkeleton(ctx, joints, W, H, { lineColor, nodeColor, criticals = [], errors = [], glowScale = 1 }) {
  ctx.clearRect(0, 0, W, H);
  for (const [a, b] of CONNECTIONS) {
    if (!joints[a] || !joints[b]) continue;
    const isErr = errors.includes(a) || errors.includes(b);
    ctx.beginPath();
    ctx.moveTo(joints[a][0] * W, joints[a][1] * H);
    ctx.lineTo(joints[b][0] * W, joints[b][1] * H);
    ctx.strokeStyle = isErr ? 'rgba(255,68,68,0.85)' : lineColor;
    ctx.lineWidth   = 2.2;
    ctx.lineCap     = 'round';
    ctx.stroke();
  }
  for (const k of JOINT_KEYS) {
    if (!joints[k]) continue;
    const x      = joints[k][0] * W;
    const y      = joints[k][1] * H;
    const isCrit = criticals.includes(k);
    const isErr  = errors.includes(k);
    const r      = (isCrit || isErr) ? 5 : 3.5;
    const color  = isErr ? '#ff4444' : isCrit ? '#00ff87' : nodeColor;
    if (isCrit || isErr) {
      ctx.beginPath();
      ctx.arc(x, y, r * 2.8 * glowScale, 0, Math.PI * 2);
      ctx.fillStyle = isErr ? 'rgba(255,68,68,0.2)' : 'rgba(0,255,135,0.18)';
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }
}

// ── Skeleton pair ─────────────────────────────────────────────────────────────

function SkeletonPair({ phases, errorPose, criticalJoints }) {
  const goodRef = useRef(null);
  const errRef  = useRef(null);
  const rafRef  = useRef(null);
  const t0Ref   = useRef(null);

  useEffect(() => {
    if (!phases?.length) return;
    const gc = goodRef.current;
    const ec = errRef.current;
    if (!gc || !ec) return;
    const gctx = gc.getContext('2d');
    const ectx = ec.getContext('2d');
    t0Ref.current = null;

    function frame(ts) {
      if (!t0Ref.current) t0Ref.current = ts;
      const elapsed = ts - t0Ref.current;
      const W = gc.width;
      const H = gc.height;

      const total   = phases.length * PHASE_MS;
      const cycle   = elapsed % total;
      const idx     = Math.floor(cycle / PHASE_MS);
      const phaseT  = (cycle % PHASE_MS) / PHASE_MS;
      const nextIdx = (idx + 1) % phases.length;
      const joints  = lerpJoints(phases[idx].joints, phases[nextIdx].joints, phaseT);
      const glow    = 1 + 0.18 * Math.sin(elapsed / 620);

      drawSkeleton(gctx, joints, W, H, {
        lineColor:  'rgba(0,255,135,0.75)',
        nodeColor:  '#00ff87',
        criticals:  criticalJoints || [],
        glowScale:  glow,
      });

      if (errorPose?.joints) {
        const errGlow = 1 + 0.28 * Math.sin(elapsed / 440);
        drawSkeleton(ectx, errorPose.joints, W, H, {
          lineColor:  'rgba(255,68,68,0.75)',
          nodeColor:  '#ff6666',
          errors:     errorPose.errorJoints || [],
          glowScale:  errGlow,
        });
      }

      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [phases, errorPose, criticalJoints]);

  return (
    <div className="grid grid-cols-2 gap-3 mb-8">
      {/* Correct form */}
      <div>
        <div
          className="rounded-2xl overflow-hidden mb-2"
          style={{ background: 'rgba(0,255,135,0.03)', border: '1px solid rgba(0,255,135,0.12)' }}
        >
          <canvas
            ref={goodRef}
            width={220}
            height={280}
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
        <p className="text-xs text-center font-semibold" style={{ color: '#00ff87' }}>
          Correct Form
        </p>
        {phases?.length > 0 && (
          <p className="text-xs text-center mt-0.5" style={{ color: '#444444' }}>
            {phases.map((p) => p.name).join(' → ')}
          </p>
        )}
      </div>

      {/* Common mistake */}
      <div>
        <div
          className="rounded-2xl overflow-hidden mb-2"
          style={{ background: 'rgba(255,68,68,0.03)', border: '1px solid rgba(255,68,68,0.12)' }}
        >
          <canvas
            ref={errRef}
            width={220}
            height={280}
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
        <p className="text-xs text-center font-semibold" style={{ color: '#ff6666' }}>
          Common Mistake
        </p>
        {errorPose?.description && (
          <p className="text-xs text-center mt-0.5 leading-snug" style={{ color: '#444444' }}>
            {errorPose.description}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

function Section({ label, children }) {
  return (
    <div className="mb-8">
      <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#00ff87' }}>
        {label}
      </p>
      {children}
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div>
      {/* Canvas placeholders */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {[0, 1].map((i) => (
          <div key={i}>
            <div
              className="rounded-2xl skeleton mb-2"
              style={{ aspectRatio: '220/280' }}
            />
            <div className="skeleton-green h-2.5 rounded mx-auto w-24 mb-1" />
            <div className="skeleton h-2 rounded mx-auto w-28" />
          </div>
        ))}
      </div>

      {/* Text placeholders */}
      <div className="space-y-4">
        {[75, 90, 60, 82, 55, 70, 88].map((w, i) => (
          <div
            key={i}
            className="skeleton h-3 rounded"
            style={{ width: `${w}%` }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ExerciseDetail({ exercise, onBack }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    setData(null);
    setLoading(true);
    setError(null);

    getExerciseInfo(exercise)
      .then((d) => { setData(d); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise.id]);

  const { content } = data || {};

  return (
    <div className="min-h-screen flex flex-col">
      {/* Sticky header */}
      <header
        className="flex items-center justify-between px-5 py-4 sticky top-0 z-10"
        style={{ background: 'rgba(10,10,10,0.97)', borderBottom: '1px solid #222222', backdropFilter: 'blur(12px)' }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 transition-colors"
          style={{ color: '#555555' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#555555'; }}
        >
          <ArrowLeft size={18} strokeWidth={2} />
          <span className="text-sm font-medium">Library</span>
        </button>
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(0,255,135,0.08)', color: '#00ff87', border: '1px solid rgba(0,255,135,0.15)' }}
        >
          {exercise.muscleGroup}
        </span>
      </header>

      <main className="flex-1 mx-auto w-full px-5 py-8" style={{ maxWidth: 520 }}>
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-white leading-tight tracking-tight">
            {exercise.name}
          </h1>
          <p className="text-sm mt-1" style={{ color: '#555555' }}>{exercise.muscleGroup}</p>
        </div>

        {loading && <LoadingState />}

        {error && (
          <div
            className="px-4 py-3 rounded-xl text-sm mb-6"
            style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.25)', color: '#ff8888' }}
          >
            Failed to load: {error}
          </div>
        )}

        {data && (
          <div className="fade-in">
            {/* Animated skeleton canvases */}
            <SkeletonPair
              phases={data.phases}
              errorPose={data.errorPose}
              criticalJoints={data.criticalJoints}
            />

            {/* What It Trains */}
            {content?.whatItTrains && (
              <Section label="What It Trains">
                <p className="text-sm leading-relaxed" style={{ color: '#aaaaaa' }}>
                  {content.whatItTrains}
                </p>
              </Section>
            )}

            {/* How To Do It */}
            {content?.howToDoIt?.length > 0 && (
              <Section label="How To Do It">
                <ol className="space-y-3">
                  {content.howToDoIt.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span
                        className="font-extrabold tabular-nums flex-shrink-0 w-5 text-right"
                        style={{ color: '#00ff87' }}
                      >
                        {i + 1}.
                      </span>
                      <span className="leading-relaxed" style={{ color: '#aaaaaa' }}>{step}</span>
                    </li>
                  ))}
                </ol>
              </Section>
            )}

            {/* Coaching Cues */}
            {content?.coachingCues?.length > 0 && (
              <Section label="Coaching Cues">
                <div className="space-y-2">
                  {content.coachingCues.map((cue, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-sm font-semibold" style={{ color: '#00ff87' }}>
                      <ChevronRight size={14} className="flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                      <span className="leading-snug">{cue}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Common Mistakes */}
            {content?.commonMistakes?.length > 0 && (
              <Section label="Common Mistakes">
                <div className="space-y-3">
                  {content.commonMistakes.map((m, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-sm" style={{ color: '#aaaaaa' }}>
                      <span className="flex-shrink-0 font-bold mt-0.5" style={{ color: '#ff4444' }}>✕</span>
                      <span className="leading-relaxed">{m}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
