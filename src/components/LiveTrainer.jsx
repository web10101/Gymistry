import { useState, useRef, useCallback, useEffect } from 'react';
import { ChevronRight, X } from 'lucide-react';
import { CAMERA_GUIDES } from '../data/exerciseGuides';
import ExerciseSelector, { isStaticHoldByName } from './ExerciseSelector';
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

const LAST_EX_KEY = 'gymistry_last_exercise';

let tts = null;
function getTTS() {
  if (!tts) tts = new TTSQueue();
  return tts;
}

// ─── Setup screen ─────────────────────────────────────────────────────────────

function SetupScreen({ onContinue, onBack }) {
  const [selected, setSelected] = useState(() => localStorage.getItem(LAST_EX_KEY) || null);
  const guide = selected ? CAMERA_GUIDES[selected] : null;

  const handleContinue = () => {
    if (!selected) return;
    localStorage.setItem(LAST_EX_KEY, selected);
    onContinue(selected);
  };

  return (
    <div className="flex-1 px-5 py-8 mx-auto w-full" style={{ maxWidth: 480 }}>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-white mb-2 tracking-tight">Live Trainer</h1>
        <p className="text-sm leading-relaxed" style={{ color: '#888888' }}>
          Choose your exercise. We'll verify your camera setup before starting.
        </p>
      </div>

      <div className="mb-6">
        <ExerciseSelector mode="livetrainer" value={selected} onChange={setSelected} />
      </div>

      {guide && (
        <div
          className="slide-up mb-8 rounded-2xl p-5"
          style={{ background: 'rgba(0,255,135,0.03)', border: '1px solid rgba(0,255,135,0.12)' }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: '#00ff87' }}>
            Camera Guide — {selected}
          </p>
          <div className="grid grid-cols-3 gap-4 mb-4 text-center">
            {[
              { label: 'View',     value: guide.view     },
              { label: 'Distance', value: guide.distance },
              { label: 'Height',   value: guide.height   },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-white text-sm font-semibold">{value}</p>
                <p className="text-xs mt-0.5" style={{ color: '#555555' }}>{label}</p>
              </div>
            ))}
          </div>
          <ul className="space-y-1.5">
            {guide.tips.map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-xs" style={{ color: '#888888' }}>
                <ChevronRight size={11} className="flex-shrink-0 mt-0.5" style={{ color: '#00ff87' }} />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={handleContinue}
        disabled={!selected}
        className="btn-primary"
      >
        Check Camera Setup
        <ChevronRight size={18} />
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
    <p
      className="text-white font-semibold text-sm sm:text-base leading-snug transition-opacity duration-500"
      style={{ opacity: visible ? 1 : 0.3 }}
    >
      "{cue}"
    </p>
  );
}

// ─── In-session live view ─────────────────────────────────────────────────────

function SessionScreen({ exercise, onEnd }) {
  const videoRef    = useRef(null);
  const canvasRef   = useRef(null);
  const startedRef  = useRef(false);

  const [currentCue,  setCurrentCue]  = useState('');
  const [isMoving,    setIsMoving]     = useState(false);
  const [outOfFrame,  setOutOfFrame]   = useState(false);
  const [elapsed,     setElapsed]      = useState(0);

  const isTimer = isStaticHoldByName(exercise);

  const anglesRef         = useRef(null);
  const prevLandmarksRef  = useRef(null);
  const velocityRef       = useRef(0);
  const sessionStartRef   = useRef(Date.now());
  const claudeInFlight    = useRef(false);
  const lastClaudeTime    = useRef(0);
  const recentCues        = useRef([]);
  const cueLogRef         = useRef([]);
  const noBodyFrames      = useRef(0);
  const NO_BODY_LIMIT     = 40;

  const { repCount, repCountRef, phase, phaseRef, lastROM, update: updateRep } = useRepCounter(exercise);
  const tts_ = getTTS();

  // Elapsed timer for static holds
  useEffect(() => {
    if (!isTimer) return;
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - sessionStartRef.current) / 1000));
    }, 100);
    return () => clearInterval(id);
  }, [isTimer]);

  const handleLandmarks = useCallback((landmarks) => {
    if (!landmarks) {
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

    if (!isTimer) {
      const { newRep } = updateRep(angles);
      if (newRep !== null) {
        tts_.speak(String(newRep), 'high');
        cueLogRef.current.push({ time: Math.floor((Date.now() - sessionStartRef.current) / 1000), cue: `Rep ${newRep}` });
      }
    }

    const now     = Date.now();
    const elapsedSec = Math.floor((now - sessionStartRef.current) / 1000);
    const shouldCall =
      !claudeInFlight.current &&
      now - lastClaudeTime.current > 2200 &&
      elapsedSec > 2 &&
      (moving || elapsedSec < 6);

    if (shouldCall) {
      lastClaudeTime.current = now;
      claudeInFlight.current = true;
      const sym = computeSymmetry(angles);
      getCoachingCue({
        exercise, angles, velocity,
        symmetry:       sym,
        repCount:       repCountRef.current,
        phase:          phaseRef.current,
        lastROM,
        recentCues:     recentCues.current.slice(-4),
        secondsElapsed: elapsedSec,
      }).then((cue) => {
        claudeInFlight.current = false;
        if (!cue) return;
        const isSafety = /round|collapse|cave|hyperextend|lock|stop|careful|danger/i.test(cue);
        tts_.speak(cue, isSafety ? 'urgent' : 'normal');
        setCurrentCue(cue);
        recentCues.current.push(cue);
        if (recentCues.current.length > 10) recentCues.current.shift();
        cueLogRef.current.push({ time: elapsedSec, cue });
      }).catch(() => { claudeInFlight.current = false; });
    }
  }, [exercise, isTimer, updateRep, repCountRef, phaseRef, lastROM, outOfFrame, tts_]);

  const { start, stop, status, errorMsg } = useLivePose({ onLandmarks: handleLandmarks });

  useEffect(() => {
    if (!startedRef.current && videoRef.current && canvasRef.current) {
      startedRef.current = true;
      tts_.speak(`Starting ${exercise}. Get into position.`, 'high');
      start(videoRef.current, canvasRef.current);
    }
    return () => { tts_.cancel(); stop(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEnd = () => {
    stop();
    tts_.cancel();
    const duration = Math.floor((Date.now() - sessionStartRef.current) / 1000);
    onEnd({ exercise, reps: repCountRef.current, duration, cueLog: cueLogRef.current, isTimer });
  };

  const timerMins = Math.floor(elapsed / 60);
  const timerSecs = elapsed % 60;

  return (
    <div className="flex flex-col h-screen select-none" style={{ background: '#000000' }}>
      {/* Top HUD — absolute overlay */}
      <div
        className="absolute top-0 left-0 right-0 z-20 flex items-start justify-between px-4 pt-12 pb-8"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)' }}
      >
        {/* Rep counter or hold timer — top left */}
        <div>
          <div
            className="text-5xl font-extrabold leading-none tabular-nums"
            style={{ color: '#00ff87', textShadow: '0 0 20px rgba(0,255,135,0.4)' }}
          >
            {isTimer
              ? `${timerMins}:${String(timerSecs).padStart(2, '0')}`
              : repCount}
          </div>
          <div className="text-xs font-semibold uppercase tracking-widest mt-1" style={{ color: 'rgba(0,255,135,0.6)' }}>
            {isTimer ? 'Hold Time' : 'Reps'}
          </div>
        </div>

        {/* Status + End — top right */}
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={handleEnd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all"
            style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)', color: '#ffffff', backdropFilter: 'blur(8px)' }}
          >
            <X size={13} />
            End
          </button>
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: status === 'active' ? '#00ff87' : '#ffaa00',
                boxShadow: status === 'active' ? '0 0 6px rgba(0,255,135,0.8)' : 'none',
              }}
            />
            <span style={{ color: status === 'active' ? '#cccccc' : '#ffaa00' }}>{exercise}</span>
          </div>
        </div>
      </div>

      {/* Camera */}
      <div className="relative flex-1 overflow-hidden">
        {status === 'loading' && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4" style={{ background: '#0a0a0a' }}>
            <div
              className="w-12 h-12 rounded-full border-2 border-transparent"
              style={{ borderTopColor: '#00ff87', animation: 'spin 1s linear infinite' }}
            />
            <p className="text-sm" style={{ color: '#888888' }}>Starting camera…</p>
          </div>
        )}
        {status === 'error' && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 px-8 text-center" style={{ background: '#0a0a0a' }}>
            <p className="text-white font-semibold">Camera error</p>
            <p className="text-sm" style={{ color: '#888888' }}>{errorMsg}</p>
            <button onClick={handleEnd} className="btn-primary mt-2" style={{ width: 'auto', padding: '12px 24px' }}>
              Go Back
            </button>
          </div>
        )}

        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ transform: 'scaleX(-1)' }}
        />

        {/* Out of frame alert */}
        {outOfFrame && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.75)' }}
          >
            <div className="text-center px-8">
              <p className="text-4xl mb-3">⚠</p>
              <p className="text-white font-bold text-lg">Get Back in Frame</p>
              <p className="text-sm mt-1" style={{ color: '#888888' }}>Step back or re-center yourself</p>
            </div>
          </div>
        )}

        {/* Movement pill */}
        <div
          className="absolute top-4 right-4 z-10 text-xs px-2.5 py-1 rounded-full font-semibold"
          style={{
            background: isMoving ? 'rgba(0,255,135,0.15)' : 'rgba(0,0,0,0.4)',
            color:       isMoving ? '#00ff87' : 'rgba(255,255,255,0.25)',
            border:      `1px solid ${isMoving ? 'rgba(0,255,135,0.35)' : 'rgba(255,255,255,0.1)'}`,
          }}
        >
          {isMoving ? 'MOVING' : 'REST'}
        </div>
      </div>

      {/* Bottom coaching cue — dark pill */}
      <div className="absolute bottom-6 left-4 right-4 z-20 flex items-center justify-center">
        <div
          className="px-5 py-3.5 rounded-2xl max-w-sm w-full text-center"
          style={{
            background:     'rgba(0,0,0,0.78)',
            border:         '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {currentCue
            ? <CueBubble cue={currentCue} />
            : (
              <p className="text-sm italic" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {status === 'active'
                  ? (isTimer ? 'Hold your position…' : 'Begin your first rep…')
                  : 'Starting camera…'}
              </p>
            )
          }
        </div>
      </div>
    </div>
  );
}

// ─── Summary screen ───────────────────────────────────────────────────────────

function SummaryScreen({ result, onBack, onRestart }) {
  const { exercise, reps, duration, cueLog, isTimer } = result;
  const mins = Math.floor(duration / 60);
  const secs = duration % 60;
  const coachingCues = cueLog.filter(({ cue }) => !cue.startsWith('Rep '));

  const statCards = isTimer
    ? [
        { label: 'Hold Time',    value: `${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, '0')}` },
        { label: 'Session Time', value: `${mins}:${String(secs).padStart(2, '0')}` },
      ]
    : [
        { label: 'Reps Completed', value: reps },
        { label: 'Session Time',   value: `${mins}:${String(secs).padStart(2, '0')}` },
      ];

  return (
    <div className="flex-1 px-5 py-8 mx-auto w-full fade-in" style={{ maxWidth: 480 }}>
      <div className="text-center mb-8">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 font-black text-black"
          style={{ background: '#00ff87' }}
        >
          🏆
        </div>
        <h1 className="text-2xl font-extrabold text-white mb-1 tracking-tight">Session Complete</h1>
        <p className="text-sm" style={{ color: '#888888' }}>{exercise}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {statCards.map(({ label, value }) => (
          <div
            key={label}
            className="rounded-2xl p-5 text-center"
            style={{ background: '#111111', border: '1px solid #222222' }}
          >
            <p
              className="text-4xl font-extrabold text-white mb-1 tabular-nums"
              style={{ letterSpacing: '-0.02em' }}
            >
              {value}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#555555' }}>
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Trainer notes */}
      {coachingCues.length > 0 && (
        <div className="mb-8">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#555555' }}>
            Trainer Notes
          </p>
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {coachingCues.map(({ time, cue }, i) => {
              const m = Math.floor(time / 60);
              const s = time % 60;
              return (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-xl px-3.5 py-3"
                  style={{ background: '#111111', border: '1px solid #1e1e1e' }}
                >
                  <span className="text-xs flex-shrink-0 mt-0.5 font-mono tabular-nums" style={{ color: '#444444' }}>
                    {m}:{String(s).padStart(2, '0')}
                  </span>
                  <p className="text-sm" style={{ color: '#cccccc' }}>{cue}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="btn-secondary flex-1"
          style={{ height: 52, fontSize: 14 }}
        >
          Home
        </button>
        <button
          onClick={onRestart}
          className="btn-primary flex-1"
          style={{ height: 52 }}
        >
          New Session
        </button>
      </div>
    </div>
  );
}

// ─── Root orchestrator ────────────────────────────────────────────────────────

const STAGES = { SETUP: 'setup', VALIDATION: 'validation', SESSION: 'session', SUMMARY: 'summary' };

export default function LiveTrainer({ onBack, onNavHide }) {
  const [stage,    setStage]    = useState(STAGES.SETUP);
  const [exercise, setExercise] = useState(null);
  const [result,   setResult]   = useState(null);

  // Hide bottom nav during live session
  useEffect(() => {
    const inSession = stage === STAGES.SESSION;
    onNavHide?.(inSession);
    return () => { onNavHide?.(false); };
  }, [stage, onNavHide]);

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
        <header
          className="flex items-center justify-between px-5 py-4 sticky top-0 z-10"
          style={{ background: 'rgba(10,10,10,0.97)', borderBottom: '1px solid #222222', backdropFilter: 'blur(12px)' }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-sm transition-colors"
              style={{ color: '#555555' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#555555'; }}
            >
              ← Back
            </button>
            <div className="w-px h-4" style={{ background: '#333333' }} />
            <span className="font-semibold text-white text-sm">Live Trainer</span>
          </div>
          <div
            className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider"
            style={{ background: 'rgba(0,255,135,0.08)', color: '#00ff87', border: '1px solid rgba(0,255,135,0.2)' }}
          >
            {stage === STAGES.VALIDATION ? 'Checking' : 'Live'}
          </div>
        </header>
      )}

      {stage === STAGES.SETUP && (
        <SetupScreen onContinue={handleStart} onBack={onBack} />
      )}
      {stage === STAGES.VALIDATION && exercise && (
        <EnvironmentCheck exercise={exercise} onPassed={handleValidationPassed} onBack={() => setStage(STAGES.SETUP)} />
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
