import { useState, useEffect, useRef } from 'react';
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

const PHASE_MS = 1800; // ms per phase transition

function lerp(a, b, t) { return a + (b - a) * t; }
function smoothstep(t) { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); }

function lerpJoints(from, to, t) {
  const s = smoothstep(t);
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
    ctx.strokeStyle = isErr ? 'rgba(239,68,68,0.85)' : lineColor;
    ctx.lineWidth   = 2.2;
    ctx.lineCap     = 'round';
    ctx.stroke();
  }

  for (const k of JOINT_KEYS) {
    if (!joints[k]) continue;
    const x  = joints[k][0] * W;
    const y  = joints[k][1] * H;
    const isCrit = criticals.includes(k);
    const isErr  = errors.includes(k);
    const r      = (isCrit || isErr) ? 5 : 3.5;
    const color  = isErr ? '#ef4444' : isCrit ? '#e8ff47' : nodeColor;

    if (isCrit || isErr) {
      ctx.beginPath();
      ctx.arc(x, y, r * 2.8 * glowScale, 0, Math.PI * 2);
      ctx.fillStyle = isErr ? 'rgba(239,68,68,0.22)' : 'rgba(232,255,71,0.22)';
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }
}

// ── SkeletonPair: two canvases side by side ───────────────────────────────────

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

      // ── Correct form: cycle through phases ──
      const total    = phases.length * PHASE_MS;
      const cycle    = elapsed % total;
      const idx      = Math.floor(cycle / PHASE_MS);
      const phaseT   = (cycle % PHASE_MS) / PHASE_MS;
      const nextIdx  = (idx + 1) % phases.length;
      const joints   = lerpJoints(phases[idx].joints, phases[nextIdx].joints, phaseT);
      const glow     = 1 + 0.18 * Math.sin(elapsed / 620);

      drawSkeleton(gctx, joints, W, H, {
        lineColor:  'rgba(74,222,128,0.82)',
        nodeColor:  '#4ade80',
        criticals:  criticalJoints || [],
        glowScale:  glow,
      });

      // ── Error pose: static with pulsing error joints ──
      if (errorPose?.joints) {
        const errGlow = 1 + 0.28 * Math.sin(elapsed / 440);
        drawSkeleton(ectx, errorPose.joints, W, H, {
          lineColor:  'rgba(239,68,68,0.78)',
          nodeColor:  '#f87171',
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
          className="rounded-xl overflow-hidden mb-2"
          style={{ background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.15)' }}
        >
          <canvas
            ref={goodRef}
            width={220}
            height={280}
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
        <p className="text-xs text-center font-semibold" style={{ color: '#4ade80' }}>
          Correct Form
        </p>
        {phases?.length > 0 && (
          <p className="text-xs text-center text-zinc-600 mt-0.5">
            {phases.map((p) => p.name).join(' → ')}
          </p>
        )}
      </div>

      {/* Common mistake */}
      <div>
        <div
          className="rounded-xl overflow-hidden mb-2"
          style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)' }}
        >
          <canvas
            ref={errRef}
            width={220}
            height={280}
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
        <p className="text-xs text-center font-semibold" style={{ color: '#f87171' }}>
          Common Mistake
        </p>
        {errorPose?.description && (
          <p className="text-xs text-center text-zinc-600 mt-0.5 leading-snug">
            {errorPose.description}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Content sections ──────────────────────────────────────────────────────────

function Section({ label, children }) {
  return (
    <div className="mb-7">
      <p
        className="text-xs font-bold uppercase tracking-widest mb-3"
        style={{ color: '#e8ff47' }}
      >
        {label}
      </p>
      {children}
    </div>
  );
}

// ── YouTube video embed ───────────────────────────────────────────────────────

function VideoSkeleton() {
  return (
    <div
      className="w-full rounded-xl mb-8 animate-pulse"
      style={{
        aspectRatio: '16/9',
        background: 'rgba(24,24,27,0.9)',
        border: '1px solid rgba(39,39,42,0.8)',
      }}
    />
  );
}

function YouTubeEmbed({ videoId }) {
  return (
    <div
      className="w-full rounded-xl overflow-hidden mb-8"
      style={{ aspectRatio: '16/9', border: '1px solid rgba(39,39,42,0.8)' }}
    >
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
        title="Exercise tutorial"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
      />
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="animate-pulse">
      {/* Canvas placeholders */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {[0, 1].map((i) => (
          <div key={i}>
            <div className="rounded-xl bg-zinc-900 mb-2" style={{ aspectRatio: '220/280' }} />
            <div className="h-2.5 bg-zinc-800 rounded mx-auto w-20 mb-1" />
            <div className="h-2 bg-zinc-900 rounded mx-auto w-28" />
          </div>
        ))}
      </div>
      {/* Text placeholders */}
      <div className="space-y-3">
        {[75, 90, 60, 80, 55, 70].map((w, i) => (
          <div key={i} className="h-3 bg-zinc-800 rounded" style={{ width: `${w}%` }} />
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ExerciseDetail({ exercise, onBack }) {
  const [data,         setData]         = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [videoId,      setVideoId]      = useState(null);
  const [videoLoading, setVideoLoading] = useState(true);

  useEffect(() => {
    setData(null);
    setLoading(true);
    setError(null);

    getExerciseInfo(exercise)
      .then((d) => { setData(d); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise.id]);

  useEffect(() => {
    setVideoId(null);
    setVideoLoading(true);

    fetch('/api/youtube-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exerciseName: exercise.name }),
    })
      .then((res) => res.json())
      .then((d) => { setVideoId(d.videoId || null); setVideoLoading(false); })
      .catch(() => { setVideoLoading(false); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise.id]);

  const { content } = data || {};

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 border-b border-zinc-900 sticky top-0 z-10 bg-zinc-950/95 backdrop-blur">
        <button
          onClick={onBack}
          className="text-zinc-500 hover:text-zinc-300 transition-colors text-sm flex items-center gap-1.5"
        >
          ← Library
        </button>
        <span className="text-xs text-zinc-500 font-medium">{exercise.muscleGroup}</span>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-5 py-8">
        {/* YouTube tutorial video */}
        {videoLoading && <VideoSkeleton />}
        {!videoLoading && videoId && <YouTubeEmbed videoId={videoId} />}

        {/* Title */}
        <div className="mb-8">
          <p className="text-xs text-zinc-600 uppercase tracking-widest mb-2">
            {exercise.muscleGroup}
          </p>
          <h1 className="text-2xl font-extrabold text-white leading-tight">
            {exercise.name}
          </h1>
        </div>

        {/* States */}
        {loading && <LoadingState />}

        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-sm mb-6">
            Failed to load: {error}
          </div>
        )}

        {data && (
          <div className="fade-in">
            {/* Skeleton animations */}
            <SkeletonPair
              phases={data.phases}
              errorPose={data.errorPose}
              criticalJoints={data.criticalJoints}
            />

            {/* What It Trains */}
            {content?.whatItTrains && (
              <Section label="What It Trains">
                <p className="text-sm text-zinc-300 leading-relaxed">{content.whatItTrains}</p>
              </Section>
            )}

            {/* How To Do It */}
            {content?.howToDoIt?.length > 0 && (
              <Section label="How To Do It">
                <ol className="space-y-3">
                  {content.howToDoIt.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm text-zinc-300">
                      <span
                        className="font-bold tabular-nums flex-shrink-0 w-5 text-right"
                        style={{ color: '#e8ff47' }}
                      >
                        {i + 1}.
                      </span>
                      <span className="leading-relaxed">{step}</span>
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
                    <div
                      key={i}
                      className="flex items-start gap-2 text-sm font-semibold"
                      style={{ color: '#e8ff47' }}
                    >
                      <span className="opacity-50 mt-0.5">›</span>
                      <span>{cue}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Common Mistakes */}
            {content?.commonMistakes?.length > 0 && (
              <Section label="Common Mistakes">
                <div className="space-y-2.5">
                  {content.commonMistakes.map((m, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-sm text-zinc-300">
                      <span className="flex-shrink-0 mt-0.5" style={{ color: '#f87171' }}>✕</span>
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
