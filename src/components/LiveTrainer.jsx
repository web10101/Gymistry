import { useState, useRef, useCallback, useEffect } from 'react';
import { LIVE_EXERCISES, CAMERA_GUIDES } from '../data/exerciseGuides';
import { getJointDeviations } from '../data/poseThresholds';
import {
  useLivePose,
  extractAnglesFromLandmarks,
  computeSymmetry,
  computeVelocity,
  detectMovement,
} from '../hooks/useLivePose';
import { useRepCounter, PHASE } from '../hooks/useRepCounter';
import { getCoachingCue, TTSQueue } from '../api/liveCoaching';
import EnvironmentCheck from './EnvironmentCheck';

// Singleton TTS queue — persists for the session
let tts = null;
function getTTS() {
  if (!tts) tts = new TTSQueue();
  return tts;
}

// ─── Setup screen ─────────────────────────────────────────────────────────────

function SetupScreen({ onContinue, onBack }) {
  const [selected, setSelected] = useState(null);
  const guide = selected ? CAMERA_GUIDES[selected] : null;

  return (
    <div className="flex-1 px-5 py-8 max-w-2xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Live Trainer</h1>
        <p className="text-zinc-400 text-sm leading-relaxed">
          Choose your exercise. We'll verify your camera setup before starting
          so you get the most accurate coaching.
        </p>
      </div>

      <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium mb-3">Select exercise</p>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 mb-6">
        {LIVE_EXERCISES.map((ex) => (
          <button
            key={ex.value}
            onClick={() => setSelected(ex.value)}
            className={`option-card flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 transition-all ${selected === ex.value ? 'selected' : ''}`}
          >
            <span className="text-xl">{ex.icon}</span>
            <span className="text-xs font-medium text-zinc-300 leading-tight text-center">{ex.label}</span>
          </button>
        ))}
      </div>

      {guide && (
        <div className="slide-up mb-8 rounded-2xl p-5"
          style={{ background: 'rgba(232,255,71,0.04)', border: '1px solid rgba(232,255,71,0.12)' }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#e8ff47' }}>
            Camera Guide — {selected}
          </p>
          <div className="grid grid-cols-3 gap-4 mb-4 text-center">
            {[
              { label: 'View',     value: guide.view },
              { label: 'Distance', value: guide.distance },
              { label: 'Height',   value: guide.height },
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
                <span style={{ color: '#e8ff47' }} className="flex-shrink-0 mt-0.5">→</span>{tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={() => onContinue(selected)}
        disabled={!selected}
        className="btn-primary w-full py-4 rounded-xl text-sm font-bold tracking-wide disabled:opacity-30 disabled:pointer-events-none"
      >
        Check Camera Setup →
      </button>
    </div>
  );
}

// ─── Coaching cue overlay ─────────────────────────────────────────────────────

function CueBubble({ cue }) {
  const [visible, setVisible] = useState(false);
  const prevRef = useRef('');

  useEffect(() => {
    if (cue && cue !== prevRef.current) {
      prevRef.current = cue;
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 6000);
      return () => clearTimeout(t);
    }
  }, [cue]);

  if (!cue) return null;
  return (
    <p className="text-white font-semibold text-base sm:text-lg leading-snug transition-all duration-400"
      style={{ opacity: visible ? 1 : 0.35 }}>
      "{cue}"
    </p>
  );
}

// ─── Live environment monitor (mirrors EnvironmentCheck logic) ───────────────

function checkEnvironmentFrame(video, analysisCanvas, landmarks) {
  // Lighting
  let tooDark = false, backlight = false;
  if (video && analysisCanvas && video.readyState >= 2) {
    try {
      const ctx = analysisCanvas.getContext('2d');
      const { width: w, height: h } = analysisCanvas;
      ctx.drawImage(video, 0, 0, w, h);
      const centerPx = ctx.getImageData(Math.round(w * 0.2), Math.round(h * 0.05), Math.round(w * 0.6), Math.round(h * 0.9)).data;
      const topPx    = ctx.getImageData(0, 0, w, Math.round(h * 0.12)).data;
      const lum = (px) => { let s = 0, n = 0; for (let i = 0; i < px.length; i += 4) { s += px[i] * 0.299 + px[i + 1] * 0.587 + px[i + 2] * 0.114; n++; } return n ? s / n : 0; };
      const cb = lum(centerPx), bg = lum(topPx);
      tooDark   = cb < 55;
      backlight = bg > cb + 55 && bg > 120;
    } catch { /* ignore canvas errors */ }
  }

  // Pose / frame
  let outOfFrame = false;
  if (!landmarks) {
    outOfFrame = true;
  } else {
    const lm  = landmarks;
    const vis = (i, t = 0.5) => lm[i] && (lm[i].visibility ?? 1) >= t;
    const KEY = [11, 12, 23, 24, 25, 26, 27, 28];
    if (KEY.filter((i) => vis(i)).length < 5) outOfFrame = true;
    if (!outOfFrame) {
      const M = 0.06;
      if (vis(0)  && lm[0].y  < M)     outOfFrame = true; // head clipped top
      if (vis(27) && lm[27].y > 1 - M) outOfFrame = true; // left ankle clipped bottom
      if (vis(28) && lm[28].y > 1 - M) outOfFrame = true; // right ankle clipped bottom
      if (vis(11) && lm[11].x < M)     outOfFrame = true; // left shoulder clipped left
      if (vis(12) && lm[12].x > 1 - M) outOfFrame = true; // right shoulder clipped right
    }
  }

  // Priority: frame issues first, then backlight, then darkness
  if (outOfFrame) return { ok: false, message: "Hold on — step back into frame" };
  if (backlight)  return { ok: false, message: "Move away from that window behind you" };
  if (tooDark)    return { ok: false, message: "Turn on a light" };
  return { ok: true, message: null };
}

// ─── In-session live view ─────────────────────────────────────────────────────

// Map angle names to MediaPipe landmark indices (the pivot joint)
const JOINT_LANDMARK_IDX = {
  leftShoulder: 11, rightShoulder: 12,
  leftElbow:    13, rightElbow:    14,
  leftWrist:    15, rightWrist:    16,
  leftHip:      23, rightHip:      24,
  leftKnee:     25, rightKnee:     26,
  leftAnkle:    27, rightAnkle:    28,
};

const DEV_COLOR = {
  green:  '34,197,94',
  yellow: '234,179,8',
  red:    '239,68,68',
};

function drawJointOverlay(overlayCanvas, mainCanvas, landmarks, deviations) {
  if (!overlayCanvas || !mainCanvas || !landmarks) return;
  if (overlayCanvas.width !== mainCanvas.width || overlayCanvas.height !== mainCanvas.height) {
    overlayCanvas.width  = mainCanvas.width;
    overlayCanvas.height = mainCanvas.height;
  }
  const ctx = overlayCanvas.getContext('2d');
  ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  if (!deviations) return;

  for (const [joint, { color }] of Object.entries(deviations)) {
    const idx = JOINT_LANDMARK_IDX[joint];
    if (idx == null) continue;
    const lm = landmarks[idx];
    if (!lm || (lm.visibility ?? 1) < 0.3) continue;

    const x   = lm.x * overlayCanvas.width;
    const y   = lm.y * overlayCanvas.height;
    const rgb = DEV_COLOR[color] ?? DEV_COLOR.green;

    // Glow ring
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${rgb},0.35)`;
    ctx.lineWidth   = 5;
    ctx.stroke();

    // Solid dot
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fillStyle   = `rgba(${rgb},0.9)`;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.55)';
    ctx.lineWidth   = 1.5;
    ctx.stroke();
  }
}

function SessionScreen({ exercise, onEnd }) {
  const videoRef      = useRef(null);
  const canvasRef     = useRef(null);
  const overlayRef    = useRef(null);
  const startedRef    = useRef(false);

  const [currentCue,  setCurrentCue]  = useState('');
  const [isMoving,    setIsMoving]     = useState(false);
  const [outOfFrame,  setOutOfFrame]   = useState(false);
  const [envPaused,   setEnvPaused]    = useState(false);
  const [envIssue,    setEnvIssue]     = useState(null);
  const [formScore,   setFormScore]    = useState(null);

  // Rich session state
  const anglesRef        = useRef(null);
  const prevLandmarksRef = useRef(null);
  const velocityRef      = useRef(0);
  const sessionStartRef  = useRef(Date.now());
  const claudeInFlight   = useRef(false);
  const lastClaudeTime   = useRef(0);
  const recentCues       = useRef([]);
  const cueLogRef        = useRef([]);
  const noBodyFrames     = useRef(0);
  const NO_BODY_LIMIT    = 40; // ~4 seconds at 10fps → show out-of-frame warning
  const envPausedRef     = useRef(false); // ref mirror of envPaused for use inside callbacks
  const envAnalysisRef   = useRef(null);  // off-screen canvas for lighting analysis

  // Rep counter with phase, ROM and form score
  const { repCount, repCountRef, phase, phaseRef, lastROM, lastFormScore, update: updateRep, reset: resetRep } = useRepCounter(exercise);

  const tts_ = getTTS();

  // ── Landmarks callback ──────────────────────────────────────────────────────
  const handleLandmarks = useCallback((landmarks) => {
    if (!landmarks) {
      // Clear overlay when body lost
      if (overlayRef.current) {
        const ctx = overlayRef.current.getContext('2d');
        ctx.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);
      }
      noBodyFrames.current++;
      if (noBodyFrames.current > NO_BODY_LIMIT) setOutOfFrame(true);
      return;
    }

    noBodyFrames.current = 0;
    if (outOfFrame) {
      setOutOfFrame(false);
      tts_.speak('Back in frame — let\'s go', 'high');
    }

    const angles   = extractAnglesFromLandmarks(landmarks);
    const velocity = computeVelocity(landmarks, prevLandmarksRef.current);
    const moving   = detectMovement(prevLandmarksRef.current, landmarks);

    anglesRef.current        = angles;
    velocityRef.current      = velocity;
    prevLandmarksRef.current = landmarks;
    setIsMoving(moving);

    // Per-frame joint deviation overlay
    const deviations = getJointDeviations(angles, exercise, phaseRef.current);
    drawJointOverlay(overlayRef.current, canvasRef.current, landmarks, deviations);

    // Rep counting
    const { newRep, romData } = updateRep(angles);
    if (newRep !== null) {
      tts_.speak(String(newRep), 'high');
      if (romData?.formScore != null) setFormScore(romData.formScore);
      cueLogRef.current.push({
        time: Math.floor((Date.now() - sessionStartRef.current) / 1000),
        cue: `Rep ${newRep}`,
      });
    }

    // Throttled Claude coaching (~2s)
    const now     = Date.now();
    const elapsed = Math.floor((now - sessionStartRef.current) / 1000);
    const shouldCall =
      !claudeInFlight.current &&
      !envPausedRef.current &&
      now - lastClaudeTime.current > 2200 &&
      elapsed > 2 &&
      (moving || elapsed < 6);

    if (shouldCall) {
      lastClaudeTime.current = now;
      claudeInFlight.current = true;

      getCoachingCue({
        exercise,
        angles,
        deviations,
        formScore:      lastFormScore,
        repCount:       repCountRef.current,
        phase:          phaseRef.current,
        lastROM,
        recentCues:     recentCues.current.slice(-3),
      }).then((cue) => {
        claudeInFlight.current = false;
        if (!cue) return;

        const isSafety = /round|collapse|cave|hyperextend|lock|stop|careful|danger/i.test(cue);
        tts_.speak(cue, isSafety ? 'urgent' : 'normal');

        setCurrentCue(cue);
        recentCues.current.push(cue);
        if (recentCues.current.length > 10) recentCues.current.shift();
        cueLogRef.current.push({ time: elapsed, cue });
      }).catch(() => { claudeInFlight.current = false; });
    }
  }, [exercise, updateRep, repCountRef, phaseRef, lastROM, lastFormScore, outOfFrame, tts_]);

  const { start, stop, status, errorMsg } = useLivePose({ onLandmarks: handleLandmarks });

  // Start camera on mount
  useEffect(() => {
    if (!startedRef.current && videoRef.current && canvasRef.current) {
      startedRef.current = true;
      tts_.speak(`Starting ${exercise}. Get into position.`, 'high');
      start(videoRef.current, canvasRef.current);
    }
    return () => {
      tts_.cancel();
      stop();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 3-second environment monitor — pauses coaching if frame/lighting fails
  useEffect(() => {
    const ac = document.createElement('canvas');
    ac.width = 160; ac.height = 90;
    envAnalysisRef.current = ac;

    const id = setInterval(() => {
      const result = checkEnvironmentFrame(
        videoRef.current,
        envAnalysisRef.current,
        prevLandmarksRef.current,
      );

      if (!result.ok && !envPausedRef.current) {
        // Transition into paused state
        envPausedRef.current = true;
        setEnvPaused(true);
        setEnvIssue(result.message);
        getTTS().speak(result.message, 'urgent');
      } else if (result.ok && envPausedRef.current) {
        // Transition back to active
        envPausedRef.current = false;
        setEnvPaused(false);
        setEnvIssue(null);
        getTTS().speak("Good, let's keep going", 'high');
      }
    }, 3000);

    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEnd = () => {
    stop();
    tts_.cancel();
    const duration = Math.floor((Date.now() - sessionStartRef.current) / 1000);
    onEnd({ exercise, reps: repCountRef.current, duration, cueLog: cueLogRef.current });
  };

  // Phase label
  const phaseLabel = {
    [PHASE.AT_TOP]:     '⬆ Top',
    [PHASE.ECCENTRIC]:  '⬇ Down',
    [PHASE.AT_BOTTOM]:  '⬇ Bottom',
    [PHASE.CONCENTRIC]: '⬆ Up',
    [PHASE.REST]:       '— Rest',
  }[phase] || '';

  return (
    <div className="flex flex-col h-screen bg-zinc-950 select-none">
      {/* Minimal top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3"
        style={{ background: 'linear-gradient(to bottom, rgba(10,10,10,0.92) 0%, transparent 100%)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full"
            style={{ background: status === 'active' ? '#4ade80' : '#f59e0b', boxShadow: status === 'active' ? '0 0 8px rgba(74,222,128,0.7)' : 'none', animation: status === 'active' ? 'pulse 2s ease-in-out infinite' : 'none' }} />
          <span className="text-white text-sm font-semibold">{exercise}</span>
          {phaseLabel && (
            <span className="text-xs text-zinc-500 font-medium">{phaseLabel}</span>
          )}
        </div>
        <button onClick={handleEnd}
          className="px-4 py-1.5 rounded-full text-xs font-bold border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white transition-all">
          End Session
        </button>
      </div>

      {/* Camera */}
      <div className="relative flex-1 overflow-hidden bg-black">
        {status === 'loading' && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-zinc-950">
            <div className="w-12 h-12 rounded-full border-2 border-transparent" style={{ borderTopColor: '#e8ff47', animation: 'spin 1s linear infinite' }} />
            <p className="text-zinc-400 text-sm">Starting camera…</p>
          </div>
        )}
        {status === 'error' && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 px-8 text-center bg-zinc-950">
            <span className="text-4xl">📷</span>
            <p className="text-white font-semibold">Camera error</p>
            <p className="text-zinc-400 text-sm">{errorMsg}</p>
            <button onClick={handleEnd} className="btn-primary px-6 py-3 rounded-xl text-sm font-bold mt-2">Go Back</button>
          </div>
        )}

        <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} playsInline muted />
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ transform: 'scaleX(-1)' }} />
        <canvas ref={overlayRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ transform: 'scaleX(-1)' }} />

        {/* Out of frame alert */}
        {outOfFrame && (
          <div className="absolute inset-0 z-15 flex items-center justify-center"
            style={{ background: 'rgba(10,10,10,0.75)' }}>
            <div className="text-center px-8">
              <p className="text-3xl mb-3">⚠️</p>
              <p className="text-white font-bold text-lg">Get Back in Frame</p>
              <p className="text-zinc-400 text-sm mt-1">Step back or re-center yourself</p>
            </div>
          </div>
        )}

        {/* Environment-check pause overlay */}
        {envPaused && (
          <div className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'rgba(10,10,10,0.82)', zIndex: 18 }}>
            <div className="text-center px-8">
              <p className="text-3xl mb-3">⏸</p>
              <p className="text-white font-bold text-lg">Coaching Paused</p>
              {envIssue && (
                <p className="text-sm mt-2" style={{ color: '#fbbf24' }}>{envIssue}</p>
              )}
              <p className="text-zinc-500 text-xs mt-3">Fix the issue and coaching will resume automatically</p>
            </div>
          </div>
        )}

        {/* Symmetry flag */}
        {anglesRef.current && (() => {
          const sym = computeSymmetry(anglesRef.current);
          const worst = Object.entries(sym).find(([, v]) => v > 15);
          return worst ? (
            <div className="absolute top-14 left-3 z-10 text-xs px-2.5 py-1.5 rounded-lg font-medium"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
              ⚠ {worst[0]} asymmetry {worst[1]}°
            </div>
          ) : null;
        })()}

        {/* Movement pill */}
        <div className="absolute top-14 right-3 z-10 text-xs px-2.5 py-1 rounded-full font-medium transition-all"
          style={{
            background: isMoving ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.05)',
            color: isMoving ? '#4ade80' : '#52525b',
            border: `1px solid ${isMoving ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.08)'}`,
          }}>
          {isMoving ? 'MOVING' : 'REST'}
        </div>
      </div>

      {/* Bottom HUD */}
      <div className="relative z-10 px-4 py-4 flex items-center gap-4"
        style={{ background: 'rgba(10,10,10,0.97)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex-shrink-0 text-center min-w-[60px]">
          <div className="text-4xl font-extrabold leading-none"
            style={{ color: '#e8ff47', fontVariantNumeric: 'tabular-nums' }}>
            {repCount}
          </div>
          <div className="text-zinc-600 text-xs mt-0.5 uppercase tracking-wider">Reps</div>
        </div>
        <div className="w-px h-10 bg-zinc-800 flex-shrink-0" />
        {formScore !== null && (
          <>
            <div className="flex-shrink-0 text-center min-w-[48px]">
              <div className="text-xl font-bold leading-none transition-colors duration-300"
                style={{
                  color: formScore >= 85 ? '#4ade80' : formScore >= 60 ? '#eab308' : '#f87171',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                {formScore}%
              </div>
              <div className="text-zinc-600 text-xs mt-0.5 uppercase tracking-wider">Form</div>
            </div>
            <div className="w-px h-10 bg-zinc-800 flex-shrink-0" />
          </>
        )}
        <div className="flex-1 min-w-0">
          {currentCue
            ? <CueBubble cue={currentCue} />
            : <p className="text-zinc-600 text-sm italic">
                {status === 'active' ? 'Begin your first rep…' : 'Starting camera…'}
              </p>
          }
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
  const coachingCues = cueLog.filter(({ cue }) => !cue.startsWith('Rep '));

  return (
    <div className="flex-1 px-5 py-8 max-w-2xl mx-auto w-full fade-in">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
          style={{ background: 'linear-gradient(135deg, #e8ff47, #b8f400)' }}>
          🏆
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Session Complete</h1>
        <p className="text-zinc-400 text-sm">{exercise}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {[
          { label: 'Reps Completed', value: reps },
          { label: 'Session Time', value: `${mins}:${String(secs).padStart(2, '0')}` },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-2xl p-5 text-center"
            style={{ background: 'rgba(232,255,71,0.06)', border: '1px solid rgba(232,255,71,0.12)' }}>
            <p className="text-3xl font-extrabold text-white mb-1">{value}</p>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">{label}</p>
          </div>
        ))}
      </div>

      {coachingCues.length > 0 && (
        <div className="mb-8">
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium mb-3">Trainer Notes</p>
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {coachingCues.map(({ time, cue }, i) => {
              const m = Math.floor(time / 60);
              const s = time % 60;
              return (
                <div key={i} className="flex items-start gap-3 rounded-xl px-3 py-2.5"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
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

      <div className="flex gap-3">
        <button onClick={onBack}
          className="flex-1 py-3.5 rounded-xl border border-zinc-700 text-sm font-medium text-zinc-300 hover:border-zinc-500 transition-all">
          Home
        </button>
        <button onClick={onRestart} className="btn-primary flex-1 py-3.5 rounded-xl text-sm font-bold">
          New Session
        </button>
      </div>
    </div>
  );
}

// ─── Root orchestrator ────────────────────────────────────────────────────────

const STAGES = { SETUP: 'setup', VALIDATION: 'validation', SESSION: 'session', SUMMARY: 'summary' };

export default function LiveTrainer({ onBack }) {
  const [stage,    setStage]    = useState(STAGES.SETUP);
  const [exercise, setExercise] = useState(null);
  const [result,   setResult]   = useState(null);

  const handleStart = (ex) => {
    setExercise(ex);
    setStage(STAGES.VALIDATION);
  };

  const handleValidationPassed = () => setStage(STAGES.SESSION);

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
      {/* Header (hidden during full-screen session) */}
      {stage !== STAGES.SESSION && (
        <header className="flex items-center justify-between px-5 py-4 border-b border-zinc-900">
          <div className="flex items-center gap-3">
            <button onClick={onBack}
              className="text-zinc-500 hover:text-zinc-300 transition-colors text-sm flex items-center gap-1.5">
              ← Back
            </button>
            <div className="w-px h-4 bg-zinc-800" />
            <div className="flex items-center gap-2">
              <span className="text-base">🎙️</span>
              <span className="font-semibold text-white text-sm">Live Trainer</span>
            </div>
          </div>
          <div className="text-xs px-2.5 py-1 rounded-full font-bold"
            style={{ background: 'rgba(232,255,71,0.1)', color: '#e8ff47', border: '1px solid rgba(232,255,71,0.2)' }}>
            {stage === STAGES.VALIDATION ? 'CHECKING' : 'LIVE'}
          </div>
        </header>
      )}

      {stage === STAGES.SETUP && (
        <SetupScreen onContinue={handleStart} onBack={onBack} />
      )}

      {stage === STAGES.VALIDATION && exercise && (
        <EnvironmentCheck
          exercise={exercise}
          onPassed={handleValidationPassed}
          onBack={() => setStage(STAGES.SETUP)}
        />
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
