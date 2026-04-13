import { useState, useRef, useCallback, useEffect } from 'react';
import { LIVE_EXERCISES, CAMERA_GUIDES } from '../data/exerciseGuides';
import { useLivePose, extractAnglesFromLandmarks, detectMovement } from '../hooks/useLivePose';
import { useRepCounter } from '../hooks/useRepCounter';
import { getCoachingCue } from '../api/liveCoaching';

// ─── TTS ─────────────────────────────────────────────────────────────────────

const ttsAvailable = typeof window !== 'undefined' && 'speechSynthesis' in window;

function speak(text, interrupt = false) {
  if (!ttsAvailable || !text) return;
  try {
    if (interrupt) window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.1;
    u.pitch = 1.0;
    u.volume = 1.0;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) =>
        (v.lang === 'en-US' || v.lang === 'en-GB') &&
        (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Premium'))
    );
    if (preferred) u.voice = preferred;
    window.speechSynthesis.speak(u);
  } catch { /* TTS unavailable — silent fallback */ }
}

// ─── Setup screen ─────────────────────────────────────────────────────────────

function SetupScreen({ onStart, onBack }) {
  const [selected, setSelected] = useState(null);
  const guide = selected ? CAMERA_GUIDES[selected] : null;

  return (
    <div className="flex-1 px-5 py-8 max-w-2xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Live Trainer</h1>
        <p className="text-zinc-400 text-sm">
          Choose your exercise, position your camera, then start. Your AI trainer
          will coach you live — counting reps, correcting form, out loud.
        </p>
      </div>

      {/* Exercise grid */}
      <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium mb-3">
        Select exercise
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 mb-6">
        {LIVE_EXERCISES.map((ex) => (
          <button
            key={ex.value}
            onClick={() => setSelected(ex.value)}
            className={`option-card flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 transition-all ${
              selected === ex.value ? 'selected' : ''
            }`}
          >
            <span className="text-xl">{ex.icon}</span>
            <span className="text-xs font-medium text-zinc-300 leading-tight text-center">{ex.label}</span>
          </button>
        ))}
      </div>

      {/* Camera guide */}
      {guide && (
        <div
          className="slide-up mb-8 rounded-2xl p-5"
          style={{ background: 'rgba(232,255,71,0.04)', border: '1px solid rgba(232,255,71,0.12)' }}
        >
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#e8ff47' }}>
            Camera Setup — {selected}
          </p>
          <div className="grid grid-cols-3 gap-4 mb-4 text-center">
            {[
              { label: 'View', value: guide.view },
              { label: 'Distance', value: guide.distance },
              { label: 'Height', value: guide.height },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-white text-sm font-semibold">{value}</p>
                <p className="text-zinc-500 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
          <ul className="space-y-1.5">
            {guide.tips.map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-xs text-zinc-400">
                <span style={{ color: '#e8ff47' }} className="mt-0.5 flex-shrink-0">→</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={() => onStart(selected)}
        disabled={!selected}
        className="btn-primary w-full py-4 rounded-xl text-sm font-bold tracking-wide disabled:opacity-30 disabled:pointer-events-none"
      >
        Start Session →
      </button>
    </div>
  );
}

// ─── Coaching cue bubble ──────────────────────────────────────────────────────

function CueBubble({ cue }) {
  const [visible, setVisible] = useState(false);
  const prevCue = useRef('');

  useEffect(() => {
    if (cue && cue !== prevCue.current) {
      prevCue.current = cue;
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 5000);
      return () => clearTimeout(t);
    }
  }, [cue]);

  if (!cue) return null;

  return (
    <div
      className="transition-all duration-300"
      style={{ opacity: visible ? 1 : 0.4, transform: visible ? 'translateY(0)' : 'translateY(4px)' }}
    >
      <p className="text-white text-base sm:text-lg font-semibold leading-snug">
        "{cue}"
      </p>
    </div>
  );
}

// ─── Live session screen ──────────────────────────────────────────────────────

function SessionScreen({ exercise, onEnd }) {
  const videoRef   = useRef(null);
  const canvasRef  = useRef(null);
  const startedRef = useRef(false);

  // Coaching state
  const [currentCue, setCurrentCue] = useState('');
  const [isMoving, setIsMoving]     = useState(false);

  // Session tracking
  const sessionStartRef   = useRef(Date.now());
  const prevLandmarksRef  = useRef(null);
  const anglesRef         = useRef(null);
  const claudeInFlight    = useRef(false);
  const lastClaudeTime    = useRef(0);
  const recentCues        = useRef([]);
  const cueLogRef         = useRef([]); // full log for summary

  // Rep counter
  const { repCount, repCountRef, update: updateRep, reset: resetRep } = useRepCounter(exercise);

  // Pose hook
  const handleLandmarks = useCallback((landmarks) => {
    const angles = extractAnglesFromLandmarks(landmarks);
    anglesRef.current = angles;

    // Rep counting
    const newRep = updateRep(angles);
    if (newRep !== null) {
      speak(String(newRep), true);
    }

    // Movement detection
    const moving = detectMovement(prevLandmarksRef.current, landmarks);
    prevLandmarksRef.current = landmarks;
    setIsMoving(moving);

    // Throttled Claude coaching (every 2.5s, only while moving or just started)
    const now = Date.now();
    const elapsed = Math.floor((now - sessionStartRef.current) / 1000);
    if (
      !claudeInFlight.current &&
      now - lastClaudeTime.current > 2500 &&
      elapsed > 3 &&           // wait 3s before first call
      (moving || elapsed < 8)  // coach during movement or at start
    ) {
      lastClaudeTime.current = now;
      claudeInFlight.current = true;
      getCoachingCue({
        exercise,
        angles,
        repCount: repCountRef.current,
        isMoving: moving,
        recentCues: recentCues.current.slice(-4),
        secondsElapsed: elapsed,
      }).then((cue) => {
        claudeInFlight.current = false;
        if (!cue) return;
        setCurrentCue(cue);
        speak(cue, false);
        recentCues.current.push(cue);
        if (recentCues.current.length > 10) recentCues.current.shift();
        cueLogRef.current.push({ time: elapsed, cue });
      }).catch(() => { claudeInFlight.current = false; });
    }
  }, [exercise, updateRep, repCountRef]);

  const { start, stop, status, errorMsg } = useLivePose({ onLandmarks: handleLandmarks });

  // Start camera once refs are mounted
  useEffect(() => {
    if (!startedRef.current && videoRef.current && canvasRef.current) {
      startedRef.current = true;
      speak(`Starting ${exercise}. Get into position.`, true);
      start(videoRef.current, canvasRef.current);
    }
    return () => {
      if (ttsAvailable) window.speechSynthesis.cancel();
      stop();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEnd = () => {
    stop();
    if (ttsAvailable) window.speechSynthesis.cancel();
    const duration = Math.floor((Date.now() - sessionStartRef.current) / 1000);
    onEnd({
      exercise,
      reps: repCountRef.current,
      duration,
      cueLog: cueLogRef.current,
    });
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-950 select-none">
      {/* Top bar — minimal, non-distracting */}
      <div
        className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3"
        style={{ background: 'linear-gradient(to bottom, rgba(10,10,10,0.9) 0%, transparent 100%)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: status === 'active' ? '#4ade80' : '#f59e0b',
              boxShadow: status === 'active' ? '0 0 8px rgba(74,222,128,0.7)' : 'none',
              animation: status === 'active' ? 'pulse 2s ease-in-out infinite' : 'none',
            }}
          />
          <span className="text-white text-sm font-semibold">{exercise}</span>
        </div>
        <button
          onClick={handleEnd}
          className="px-4 py-1.5 rounded-full text-xs font-bold border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white transition-all"
        >
          End Session
        </button>
      </div>

      {/* Camera feed */}
      <div className="relative flex-1 overflow-hidden bg-black">
        {/* Loading overlay */}
        {status === 'loading' && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-zinc-950 gap-4">
            <div
              className="w-12 h-12 rounded-full border-2 border-transparent"
              style={{ borderTopColor: '#e8ff47', animation: 'spin 1s linear infinite' }}
            />
            <p className="text-zinc-400 text-sm">Starting camera…</p>
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 px-8 text-center bg-zinc-950">
            <span className="text-4xl">📷</span>
            <p className="text-white font-semibold">Camera access denied</p>
            <p className="text-zinc-400 text-sm">{errorMsg}</p>
            <button onClick={handleEnd} className="btn-primary px-6 py-3 rounded-xl text-sm font-bold mt-2">
              Go Back
            </button>
          </div>
        )}

        {/* Video feed — mirrored so it looks like a mirror */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
          playsInline
          muted
        />

        {/* Skeleton overlay — also mirrored to align with video */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ transform: 'scaleX(-1)', objectFit: 'cover' }}
        />

        {/* Movement indicator */}
        <div
          className="absolute top-14 right-4 z-10 text-xs px-2.5 py-1 rounded-full font-medium transition-all"
          style={{
            background: isMoving ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.06)',
            color: isMoving ? '#4ade80' : '#52525b',
            border: `1px solid ${isMoving ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.08)'}`,
          }}
        >
          {isMoving ? 'MOVING' : 'REST'}
        </div>
      </div>

      {/* Bottom HUD */}
      <div
        className="relative z-10 px-4 py-4 flex items-center gap-4"
        style={{
          background: 'rgba(10,10,10,0.95)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Rep counter */}
        <div className="flex-shrink-0 text-center min-w-[56px]">
          <div
            className="text-4xl font-extrabold leading-none"
            style={{ color: '#e8ff47', fontVariantNumeric: 'tabular-nums' }}
          >
            {repCount}
          </div>
          <div className="text-zinc-600 text-xs mt-0.5 uppercase tracking-wider">Reps</div>
        </div>

        {/* Divider */}
        <div className="w-px h-10 bg-zinc-800 flex-shrink-0" />

        {/* Coaching cue */}
        <div className="flex-1 min-w-0">
          {currentCue ? (
            <CueBubble cue={currentCue} />
          ) : (
            <p className="text-zinc-600 text-sm italic">
              {status === 'active'
                ? 'Begin your first rep…'
                : 'Starting camera…'}
            </p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
      `}</style>
    </div>
  );
}

// ─── Summary screen ───────────────────────────────────────────────────────────

function SummaryScreen({ result, onBack, onRestart }) {
  const { exercise, reps, duration, cueLog } = result;
  const mins = Math.floor(duration / 60);
  const secs = duration % 60;

  return (
    <div className="flex-1 px-5 py-8 max-w-2xl mx-auto w-full fade-in">
      {/* Trophy header */}
      <div className="text-center mb-8">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
          style={{ background: 'linear-gradient(135deg, #e8ff47, #b8f400)' }}
        >
          🏆
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Session Complete</h1>
        <p className="text-zinc-400 text-sm">{exercise}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {[
          { label: 'Reps Completed', value: reps, unit: 'reps' },
          { label: 'Session Time', value: `${mins}:${String(secs).padStart(2, '0')}`, unit: 'min:sec' },
        ].map(({ label, value, unit }) => (
          <div
            key={label}
            className="rounded-2xl p-5 text-center"
            style={{ background: 'rgba(232,255,71,0.06)', border: '1px solid rgba(232,255,71,0.12)' }}
          >
            <p className="text-3xl font-extrabold text-white mb-1">{value}</p>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">{label}</p>
          </div>
        ))}
      </div>

      {/* Coaching log */}
      {cueLog.length > 0 && (
        <div className="mb-8">
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium mb-3">
            Trainer Notes
          </p>
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {cueLog.map(({ time, cue }, i) => {
              const m = Math.floor(time / 60);
              const s = time % 60;
              return (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-xl px-3 py-2.5"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <span className="text-xs text-zinc-600 flex-shrink-0 mt-0.5 font-mono">
                    {m}:{String(s).padStart(2, '0')}
                  </span>
                  <p className="text-sm text-zinc-300">{cue}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3.5 rounded-xl border border-zinc-700 text-sm font-medium text-zinc-300 hover:border-zinc-500 transition-all"
        >
          Home
        </button>
        <button
          onClick={onRestart}
          className="btn-primary flex-1 py-3.5 rounded-xl text-sm font-bold"
        >
          New Session
        </button>
      </div>
    </div>
  );
}

// ─── Root component ───────────────────────────────────────────────────────────

const STAGES = { SETUP: 'setup', SESSION: 'session', SUMMARY: 'summary' };

export default function LiveTrainer({ onBack }) {
  const [stage, setStage]       = useState(STAGES.SETUP);
  const [exercise, setExercise] = useState(null);
  const [result, setResult]     = useState(null);

  const handleStart = (ex) => {
    setExercise(ex);
    setStage(STAGES.SESSION);
  };

  const handleEnd = (sessionResult) => {
    setResult(sessionResult);
    setStage(STAGES.SUMMARY);
  };

  const handleRestart = () => {
    setResult(null);
    setExercise(null);
    setStage(STAGES.SETUP);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header — only shown outside session (session is full-screen) */}
      {stage !== STAGES.SESSION && (
        <header className="flex items-center justify-between px-5 py-4 border-b border-zinc-900">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="text-zinc-500 hover:text-zinc-300 transition-colors text-sm flex items-center gap-1.5"
            >
              ← Back
            </button>
            <div className="w-px h-4 bg-zinc-800" />
            <div className="flex items-center gap-2">
              <span className="text-base">🎙️</span>
              <span className="font-semibold text-white text-sm">Live Trainer</span>
            </div>
          </div>
          <div
            className="text-xs px-2.5 py-1 rounded-full font-bold"
            style={{ background: 'rgba(232,255,71,0.1)', color: '#e8ff47', border: '1px solid rgba(232,255,71,0.2)' }}
          >
            LIVE
          </div>
        </header>
      )}

      {stage === STAGES.SETUP && (
        <SetupScreen onStart={handleStart} onBack={onBack} />
      )}

      {stage === STAGES.SESSION && exercise && (
        <SessionScreen exercise={exercise} onEnd={handleEnd} />
      )}

      {stage === STAGES.SUMMARY && result && (
        <SummaryScreen result={result} onBack={onBack} onRestart={handleRestart} />
      )}
    </div>
  );
}
