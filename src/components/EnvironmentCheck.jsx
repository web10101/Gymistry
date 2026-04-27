import { useState, useEffect, useRef, useCallback } from 'react';

// Landmark indices
const LM = { NOSE: 0, L_SHOULDER: 11, R_SHOULDER: 12, L_HIP: 23, R_HIP: 24, L_KNEE: 25, R_KNEE: 26, L_ANKLE: 27, R_ANKLE: 28 };
const KEY_JOINTS = [LM.L_SHOULDER, LM.R_SHOULDER, LM.L_HIP, LM.R_HIP, LM.L_KNEE, LM.R_KNEE, LM.L_ANKLE, LM.R_ANKLE];
const SKELETON_PAIRS = [
  [LM.L_SHOULDER, LM.R_SHOULDER], [LM.L_SHOULDER, LM.L_HIP], [LM.R_SHOULDER, LM.R_HIP],
  [LM.L_HIP, LM.R_HIP], [LM.L_HIP, LM.L_KNEE], [LM.R_HIP, LM.R_KNEE],
  [LM.L_KNEE, LM.L_ANKLE], [LM.R_KNEE, LM.R_ANKLE],
];

// 3-tier joint color: green = high confidence, yellow = medium, red = low
function jointColor(visibility) {
  const v = visibility ?? 1;
  if (v >= 0.72) return '#4ade80';
  if (v >= 0.45) return '#fbbf24';
  return '#ef4444';
}

function boneColor(v1, v2) {
  const avg = ((v1 ?? 1) + (v2 ?? 1)) / 2;
  if (avg >= 0.72) return 'rgba(74,222,128,0.55)';
  if (avg >= 0.45) return 'rgba(251,191,36,0.5)';
  return 'rgba(239,68,68,0.45)';
}

// ─── Lighting analysis ────────────────────────────────────────────────────────

function analyzeLighting(canvas) {
  try {
    const ctx = canvas.getContext('2d');
    const { width: w, height: h } = canvas;
    const cx = Math.round(w * 0.2), cy = Math.round(h * 0.05);
    const cw = Math.round(w * 0.6), ch = Math.round(h * 0.9);
    const centerPx = ctx.getImageData(cx, cy, cw, ch).data;
    const topPx    = ctx.getImageData(0, 0, w, Math.round(h * 0.12)).data;

    const brightness = (px) => {
      let s = 0, n = 0;
      for (let i = 0; i < px.length; i += 4) {
        s += px[i] * 0.299 + px[i + 1] * 0.587 + px[i + 2] * 0.114;
        n++;
      }
      return n ? s / n : 0;
    };

    const centerBright = brightness(centerPx);
    const bgBright     = brightness(topPx);
    return {
      centerBright,
      tooDark:   centerBright < 55,
      tooHot:    centerBright > 230,
      backlight: bgBright > centerBright + 55 && bgBright > 120,
    };
  } catch {
    return { centerBright: 128, tooDark: false, tooHot: false, backlight: false };
  }
}

// ─── Pose checks ──────────────────────────────────────────────────────────────

function runPoseChecks(landmarks) {
  if (!landmarks) return null;
  const lm = landmarks;
  const visible = (idx, thresh = 0.5) => lm[idx] && (lm[idx].visibility ?? 1) >= thresh;

  const visibleCount = KEY_JOINTS.filter((i) => visible(i, 0.5)).length;
  const poseDetected = visibleCount >= 5;

  // joints cut off at edges
  const MARGIN = 0.06;
  let cutPart = null;
  if (visible(LM.NOSE)       && lm[LM.NOSE].y      < MARGIN)       cutPart = 'head';
  if (visible(LM.L_ANKLE)    && lm[LM.L_ANKLE].y   > 1 - MARGIN)   cutPart = 'feet';
  if (visible(LM.R_ANKLE)    && lm[LM.R_ANKLE].y   > 1 - MARGIN)   cutPart = 'feet';
  if (visible(LM.L_SHOULDER) && lm[LM.L_SHOULDER].x < MARGIN)      cutPart = 'left side';
  if (visible(LM.R_SHOULDER) && lm[LM.R_SHOULDER].x > 1 - MARGIN)  cutPart = 'right side';

  // body centered — hip midpoint
  let centered = false, centerDir = '';
  if (visible(LM.L_HIP) && visible(LM.R_HIP)) {
    const midX = (lm[LM.L_HIP].x + lm[LM.R_HIP].x) / 2;
    centered   = midX > 0.25 && midX < 0.75;
    centerDir  = midX <= 0.25 ? 'right' : midX >= 0.75 ? 'left' : '';
  }

  // distance — body height fraction
  let distance = 'ok', distMsg = '';
  if (visible(LM.NOSE) && (visible(LM.L_ANKLE) || visible(LM.R_ANKLE))) {
    const topY  = lm[LM.NOSE].y;
    const botY  = Math.max(
      visible(LM.L_ANKLE) ? lm[LM.L_ANKLE].y : 0,
      visible(LM.R_ANKLE) ? lm[LM.R_ANKLE].y : 0,
    );
    const bodyH = botY - topY;
    if (bodyH < 0.45) { distance = 'far';   distMsg = 'Step closer to the camera'; }
    if (bodyH > 0.92) { distance = 'close'; distMsg = 'Step back a little'; }
  }

  return {
    poseDetected,
    visibleCount,
    cutPart,
    noJointsCut: poseDetected && !cutPart,
    centered,
    centerDir,
    distance,
    distMsg,
  };
}

// ─── Check item ────────────────────────────────────────────────────────────────

function CheckItem({ pass, label, message }) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold transition-all duration-300"
        style={
          pass
            ? { background: 'rgba(74,222,128,0.2)',  color: '#4ade80', border: '1px solid rgba(74,222,128,0.4)' }
            : { background: 'rgba(239,68,68,0.15)',  color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }
        }
      >
        {pass ? '✓' : '✕'}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${pass ? 'text-zinc-300' : 'text-white'}`}>{label}</p>
        {!pass && message && <p className="text-xs text-red-400 mt-0.5">{message}</p>}
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function EnvironmentCheck({ exercise, onPassed, onBack }) {
  const videoRef    = useRef(null);
  const canvasRef   = useRef(null);
  const analysisRef = useRef(null);
  const poseRef     = useRef(null);
  const streamRef   = useRef(null);
  const rafRef      = useRef(null);
  const busyRef     = useRef(false);
  const frameRef    = useRef(0);
  // Raw results written every frame, read by 1-second interval
  const rawPoseRef  = useRef(null);
  const rawLightRef = useRef(null);

  const [cameraStatus, setCameraStatus] = useState('loading'); // loading | active | error
  const [errorMsg, setErrorMsg]         = useState('');
  // Checklist state — refreshed every second
  const [poseChecks,  setPoseChecks]    = useState(null);
  const [lightChecks, setLightChecks]   = useState(null);

  const ensurePose = async () => {
    if (window.Pose) return;
    await new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js';
      s.crossOrigin = 'anonymous';
      s.onload  = res;
      s.onerror = () => rej(new Error('Failed to load MediaPipe'));
      document.head.appendChild(s);
    });
  };

  const drawSkeleton = useCallback((landmarks) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width: w, height: h } = canvas;
    ctx.clearRect(0, 0, w, h);

    // Bones — colored by average confidence of endpoints
    for (const [si, ei] of SKELETON_PAIRS) {
      const s = landmarks[si], e = landmarks[ei];
      if (!s || !e) continue;
      ctx.strokeStyle = boneColor(s.visibility, e.visibility);
      ctx.lineWidth   = 2;
      ctx.beginPath();
      ctx.moveTo(s.x * w, s.y * h);
      ctx.lineTo(e.x * w, e.y * h);
      ctx.stroke();
    }

    // Joints — green / yellow / red by visibility
    for (const idx of KEY_JOINTS) {
      const lm = landmarks[idx];
      if (!lm) continue;
      ctx.beginPath();
      ctx.arc(lm.x * w, lm.y * h, 5, 0, 2 * Math.PI);
      ctx.fillStyle = jointColor(lm.visibility);
      ctx.fill();
      // Bright centre dot for readability
      ctx.beginPath();
      ctx.arc(lm.x * w, lm.y * h, 2, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.fill();
    }
  }, []);

  const onResults = useCallback((results) => {
    busyRef.current = false;
    const lm = results.poseLandmarks || null;

    // Lighting — write raw result to ref (interval will push to state)
    if (analysisRef.current && videoRef.current) {
      const ac  = analysisRef.current;
      const ctx = ac.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, ac.width, ac.height);
      rawLightRef.current = analyzeLighting(ac);
    }

    if (lm) {
      drawSkeleton(lm);
      rawPoseRef.current = runPoseChecks(lm);
    } else {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      rawPoseRef.current = null;
    }
  }, [drawSkeleton]);

  // Checklist state updates every second from the latest raw refs
  useEffect(() => {
    const id = setInterval(() => {
      setPoseChecks(rawPoseRef.current);
      setLightChecks(rawLightRef.current);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await ensurePose();
        if (!mounted) return;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: false,
        });
        if (!mounted) { stream.getTracks().forEach(t => t.stop()); return; }

        streamRef.current = stream;
        const video = videoRef.current;
        video.srcObject  = stream;
        video.muted      = true;
        video.playsInline = true;
        await video.play();

        video.addEventListener('loadedmetadata', () => {
          if (canvasRef.current) {
            canvasRef.current.width  = video.videoWidth;
            canvasRef.current.height = video.videoHeight;
          }
          const ac = document.createElement('canvas');
          ac.width = 160; ac.height = 90;
          analysisRef.current = ac;
        }, { once: true });

        const pose = new window.Pose({
          locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${f}`,
        });
        pose.setOptions({ modelComplexity: 1, smoothLandmarks: true, enableSegmentation: false, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
        pose.onResults(onResults);
        poseRef.current = pose;

        const loop = () => {
          frameRef.current++;
          if (!busyRef.current && frameRef.current % 4 === 0 && video.readyState >= 2) {
            busyRef.current = true;
            pose.send({ image: video }).catch(() => { busyRef.current = false; });
          }
          rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
        if (mounted) setCameraStatus('active');
      } catch (err) {
        if (mounted) { setErrorMsg(err.message || 'Camera error'); setCameraStatus('error'); }
      }
    })();

    return () => {
      mounted = false;
      if (rafRef.current)    cancelAnimationFrame(rafRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (poseRef.current)   poseRef.current.close();
    };
  }, [onResults]);

  // ── Derive checklist (6 items, updated from state every second) ─────────────
  const checks = [
    {
      id: 'pose',
      label: 'Full body visible',
      pass: poseChecks?.poseDetected ?? false,
      message: 'Stand fully in frame so your whole body is visible',
    },
    {
      id: 'distance',
      label: 'Correct distance',
      pass: poseChecks?.distance === 'ok',
      message: poseChecks?.distance === 'close'
        ? 'Step back a little'
        : 'Step closer to the camera',
    },
    {
      id: 'centered',
      label: 'Body centered',
      pass: poseChecks?.centered ?? false,
      message: 'Move to center',
    },
    {
      id: 'joints',
      label: 'No joints cut off',
      pass: poseChecks?.noJointsCut ?? false,
      message: poseChecks?.cutPart
        ? `Your ${poseChecks.cutPart} is cut off — step back a little`
        : 'Make sure no part of your body is outside the frame',
    },
    {
      id: 'lighting',
      label: 'Not too dark',
      pass: lightChecks ? !lightChecks.tooDark && !lightChecks.tooHot : false,
      message: lightChecks?.tooDark
        ? 'Turn on a light'
        : 'Too bright — move away from direct sunlight',
    },
    {
      id: 'backlight',
      label: 'No strong backlight',
      pass: lightChecks ? !lightChecks.backlight : true,
      message: 'Move away from that window',
    },
  ];

  const allPass   = checks.every(c => c.pass) && cameraStatus === 'active';
  const passCount = checks.filter(c => c.pass).length;

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-0 overflow-hidden">
      {/* ── Camera preview ───────────────────────────────────────────────────── */}
      <div className="relative flex-1 bg-black min-h-[40vh] lg:min-h-0">
        {cameraStatus === 'loading' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-transparent"
              style={{ borderTopColor: '#e8ff47', animation: 'spin 1s linear infinite' }} />
            <p className="text-zinc-500 text-sm">Starting camera…</p>
          </div>
        )}
        {cameraStatus === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <span className="text-4xl">📷</span>
            <p className="text-white font-semibold">Camera access denied</p>
            <p className="text-zinc-400 text-sm">{errorMsg}</p>
          </div>
        )}

        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
          playsInline muted
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ transform: 'scaleX(-1)' }}
        />

        {/* Joint-count badge */}
        {poseChecks && (
          <div
            className="absolute bottom-3 left-3 text-xs px-2.5 py-1 rounded-full font-medium"
            style={{
              background: 'rgba(10,10,10,0.8)',
              color: poseChecks.visibleCount >= 6 ? '#4ade80' : '#fbbf24',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {poseChecks.visibleCount}/{KEY_JOINTS.length} joints tracked
          </div>
        )}

        {/* Confidence legend */}
        {poseChecks && (
          <div
            className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(10,10,10,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#4ade80' }} />
            <span className="text-zinc-400">High</span>
            <span className="w-2 h-2 rounded-full inline-block ml-1" style={{ background: '#fbbf24' }} />
            <span className="text-zinc-400">Mid</span>
            <span className="w-2 h-2 rounded-full inline-block ml-1" style={{ background: '#ef4444' }} />
            <span className="text-zinc-400">Low</span>
          </div>
        )}
      </div>

      {/* ── Checklist panel ──────────────────────────────────────────────────── */}
      <div className="w-full lg:w-80 p-5 flex flex-col gap-4 border-t lg:border-t-0 lg:border-l border-zinc-900 bg-zinc-950">
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium mb-1">Environment Check</p>
          <h2 className="text-white font-bold text-sm">{exercise} — Position Validation</h2>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-zinc-500">Checks passing</span>
            <span className="font-bold" style={{ color: allPass ? '#4ade80' : '#e8ff47' }}>
              {passCount}/{checks.length}
            </span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(passCount / checks.length) * 100}%`,
                background: allPass
                  ? 'linear-gradient(90deg, #4ade80, #22c55e)'
                  : 'linear-gradient(90deg, #b8f400, #e8ff47)',
              }}
            />
          </div>
        </div>

        {/* Checks — state refreshes every second */}
        <div className="space-y-3 flex-1">
          {checks.map((c) => (
            <CheckItem key={c.id} pass={c.pass} label={c.label} message={c.message} />
          ))}
        </div>

        {/* Start button — only rendered when all checks pass */}
        {allPass ? (
          <button
            onClick={onPassed}
            className="w-full py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-300"
            style={{ background: 'linear-gradient(135deg, #4ade80, #22c55e)', color: '#0a0a0a' }}
          >
            Ready — Start Session ✓
          </button>
        ) : (
          <div
            className="w-full py-3.5 rounded-xl text-sm font-medium text-center select-none"
            style={{ background: 'rgba(255,255,255,0.04)', color: '#52525b' }}
          >
            Fix {checks.length - passCount} check{checks.length - passCount !== 1 ? 's' : ''} to continue
          </div>
        )}

        <button
          onClick={onBack}
          className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors text-center"
        >
          ← Choose different exercise
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
