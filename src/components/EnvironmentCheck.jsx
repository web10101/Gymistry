import { useState, useEffect, useRef, useCallback } from 'react';
import { Check, X as XIcon } from 'lucide-react';

// Landmark indices
const LM = { NOSE: 0, L_SHOULDER: 11, R_SHOULDER: 12, L_HIP: 23, R_HIP: 24, L_KNEE: 25, R_KNEE: 26, L_ANKLE: 27, R_ANKLE: 28 };
const KEY_JOINTS = [LM.L_SHOULDER, LM.R_SHOULDER, LM.L_HIP, LM.R_HIP, LM.L_KNEE, LM.R_KNEE, LM.L_ANKLE, LM.R_ANKLE];
const SKELETON_PAIRS = [
  [LM.L_SHOULDER, LM.R_SHOULDER], [LM.L_SHOULDER, LM.L_HIP], [LM.R_SHOULDER, LM.R_HIP],
  [LM.L_HIP, LM.R_HIP], [LM.L_HIP, LM.L_KNEE], [LM.R_HIP, LM.R_KNEE],
  [LM.L_KNEE, LM.L_ANKLE], [LM.R_KNEE, LM.R_ANKLE],
];

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

function runPoseChecks(landmarks) {
  if (!landmarks) return null;
  const lm = landmarks;
  const visible = (idx, thresh = 0.5) => lm[idx] && (lm[idx].visibility ?? 1) >= thresh;
  const visibleCount = KEY_JOINTS.filter((i) => visible(i, 0.5)).length;
  const poseDetected = visibleCount >= 5;
  const MARGIN = 0.06;
  let cutPart = null;
  if (visible(LM.NOSE)       && lm[LM.NOSE].y < MARGIN)            cutPart = 'head';
  if (visible(LM.L_ANKLE)   && lm[LM.L_ANKLE].y > 1 - MARGIN)     cutPart = 'feet';
  if (visible(LM.R_ANKLE)   && lm[LM.R_ANKLE].y > 1 - MARGIN)     cutPart = 'feet';
  if (visible(LM.L_SHOULDER) && lm[LM.L_SHOULDER].x < MARGIN)      cutPart = 'left side';
  if (visible(LM.R_SHOULDER) && lm[LM.R_SHOULDER].x > 1 - MARGIN)  cutPart = 'right side';
  const fullBody = poseDetected && !cutPart;
  let centered = false, centerDir = '';
  if (visible(LM.L_HIP) && visible(LM.R_HIP)) {
    const midX = (lm[LM.L_HIP].x + lm[LM.R_HIP].x) / 2;
    centered = midX > 0.25 && midX < 0.75;
    centerDir = midX <= 0.25 ? 'right' : midX >= 0.75 ? 'left' : '';
  }
  let distance = 'ok', distMsg = '';
  if (visible(LM.NOSE) && (visible(LM.L_ANKLE) || visible(LM.R_ANKLE))) {
    const topY = lm[LM.NOSE].y;
    const botY = Math.max(
      visible(LM.L_ANKLE) ? lm[LM.L_ANKLE].y : 0,
      visible(LM.R_ANKLE) ? lm[LM.R_ANKLE].y : 0
    );
    const bodyH = botY - topY;
    if (bodyH < 0.45) { distance = 'far';   distMsg = 'Step closer to the camera'; }
    if (bodyH > 0.92) { distance = 'close'; distMsg = 'Step back — you\'re too close'; }
  }
  return { poseDetected, visibleCount, fullBody, cutPart, centered, centerDir, distance, distMsg };
}

// ─── Check item ───────────────────────────────────────────────────────────────

function CheckItem({ pass, label, message }) {
  return (
    <div className="flex items-start gap-3 py-1">
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-400"
        style={
          pass
            ? { background: 'rgba(0,255,135,0.12)', border: '1.5px solid rgba(0,255,135,0.4)', animation: 'checkIn 0.25s ease forwards' }
            : { background: 'rgba(255,68,68,0.08)', border: '1.5px solid rgba(255,68,68,0.3)' }
        }
      >
        {pass
          ? <Check size={13} style={{ color: '#00ff87' }} strokeWidth={2.5} />
          : <XIcon size={13} style={{ color: '#ff4444' }} strokeWidth={2.5} />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{ color: pass ? '#cccccc' : '#ffffff' }}>
          {label}
        </p>
        {!pass && message && (
          <p className="text-xs mt-0.5 leading-snug" style={{ color: '#ff6666' }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function EnvironmentCheck({ exercise, onPassed, onBack }) {
  const videoRef    = useRef(null);
  const canvasRef   = useRef(null);
  const analysisRef = useRef(null);
  const poseRef     = useRef(null);
  const streamRef   = useRef(null);
  const rafRef      = useRef(null);
  const busyRef     = useRef(false);
  const frameRef    = useRef(0);

  const [cameraStatus, setCameraStatus] = useState('loading');
  const [errorMsg, setErrorMsg]         = useState('');
  const [poseChecks, setPoseChecks]     = useState(null);
  const [lightChecks, setLightChecks]   = useState(null);

  const ensurePose = async () => {
    if (window.Pose) return;
    await new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js';
      s.crossOrigin = 'anonymous';
      s.onload = res;
      s.onerror = () => rej(new Error('Failed to load MediaPipe'));
      document.head.appendChild(s);
    });
  };

  const drawSkeleton = useCallback((landmarks) => {
    const canvas = canvasRef.current;
    const video  = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext('2d');
    const { width: w, height: h } = canvas;
    ctx.clearRect(0, 0, w, h);
    for (const [si, ei] of SKELETON_PAIRS) {
      const s = landmarks[si], e = landmarks[ei];
      if (!s || !e || (s.visibility ?? 1) < 0.4 || (e.visibility ?? 1) < 0.4) continue;
      ctx.strokeStyle = 'rgba(0,255,135,0.5)';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(s.x * w, s.y * h);
      ctx.lineTo(e.x * w, e.y * h);
      ctx.stroke();
    }
    for (const idx of KEY_JOINTS) {
      const lm = landmarks[idx];
      if (!lm || (lm.visibility ?? 1) < 0.4) continue;
      const conf = lm.visibility ?? 1;
      ctx.beginPath();
      ctx.arc(lm.x * w, lm.y * h, 5, 0, 2 * Math.PI);
      ctx.fillStyle = conf > 0.7 ? '#00ff87' : '#ffaa00';
      ctx.fill();
    }
  }, []);

  const onResults = useCallback((results) => {
    busyRef.current = false;
    const lm = results.poseLandmarks || null;
    if (analysisRef.current && videoRef.current) {
      const ac  = analysisRef.current;
      const ctx = ac.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, ac.width, ac.height);
      setLightChecks(analyzeLighting(ac));
    }
    if (lm) {
      drawSkeleton(lm);
      setPoseChecks(runPoseChecks(lm));
    } else {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      setPoseChecks(null);
    }
  }, [drawSkeleton]);

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
        video.srcObject = stream;
        video.muted = true;
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

  const checks = [
    {
      id: 'pose',
      label: 'Body detected',
      pass: poseChecks?.poseDetected ?? false,
      message: 'Stand fully in frame — can\'t detect your body yet',
    },
    {
      id: 'fullbody',
      label: 'Full body in frame',
      pass: poseChecks?.fullBody ?? false,
      message: poseChecks?.cutPart
        ? `Your ${poseChecks.cutPart} is cut off — step back`
        : 'Ensure head to feet are visible',
    },
    {
      id: 'centered',
      label: 'Body centered',
      pass: poseChecks?.centered ?? false,
      message: poseChecks?.centerDir
        ? `Move ${poseChecks.centerDir} to center yourself`
        : 'Position yourself in the center of frame',
    },
    {
      id: 'distance',
      label: 'Correct distance',
      pass: poseChecks?.distance === 'ok',
      message: poseChecks?.distMsg || 'Adjust your distance from the camera',
    },
    {
      id: 'lighting',
      label: 'Good lighting',
      pass: lightChecks ? !lightChecks.tooDark && !lightChecks.tooHot : false,
      message: lightChecks?.tooDark
        ? 'Too dark — turn on lights or open blinds'
        : lightChecks?.tooHot
        ? 'Overexposed — dim harsh lighting'
        : 'Check your lighting',
    },
    {
      id: 'backlight',
      label: 'No backlight',
      pass: lightChecks ? !lightChecks.backlight : true,
      message: 'Bright source behind you — move so light is in front',
    },
  ];

  const allPass   = checks.every(c => c.pass) && cameraStatus === 'active';
  const passCount = checks.filter(c => c.pass).length;

  return (
    <div className="flex-1 flex flex-col">
      {/* Camera preview */}
      <div className="relative bg-black" style={{ minHeight: '45vh' }}>
        {cameraStatus === 'loading' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4" style={{ background: '#0a0a0a' }}>
            <div
              className="w-10 h-10 rounded-full border-2 border-transparent"
              style={{ borderTopColor: '#00ff87', animation: 'spin 1s linear infinite' }}
            />
            <p className="text-sm" style={{ color: '#888888' }}>Starting camera…</p>
          </div>
        )}
        {cameraStatus === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center" style={{ background: '#0a0a0a' }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: '#111111', border: '1px solid #222222' }}>
              <XIcon size={24} style={{ color: '#ff4444' }} />
            </div>
            <p className="text-white font-semibold">Camera access denied</p>
            <p className="text-sm leading-relaxed" style={{ color: '#888888' }}>{errorMsg}</p>
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

        {/* Confidence pill */}
        {poseChecks && (
          <div
            className="absolute bottom-3 left-3 text-xs px-3 py-1.5 rounded-full font-semibold"
            style={{
              background: 'rgba(10,10,10,0.85)',
              color: poseChecks.visibleCount >= 6 ? '#00ff87' : '#ffaa00',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {poseChecks.visibleCount}/{KEY_JOINTS.length} joints tracked
          </div>
        )}
      </div>

      {/* Checklist panel */}
      <div className="flex-1 px-5 py-5 mx-auto w-full" style={{ maxWidth: 480 }}>
        {/* Header */}
        <div className="mb-5">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#555555' }}>
            Environment Check
          </p>
          <h2 className="text-white font-bold text-base">{exercise} — Position Validation</h2>
        </div>

        {/* Progress bar */}
        <div className="mb-5">
          <div className="flex justify-between text-xs mb-2">
            <span style={{ color: '#555555' }}>Checks passing</span>
            <span
              className="font-bold tabular-nums"
              style={{ color: allPass ? '#00ff87' : '#888888' }}
            >
              {passCount}/{checks.length}
            </span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: '#1a1a1a' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(passCount / checks.length) * 100}%`,
                background: allPass ? '#00ff87' : '#00ff87',
              }}
            />
          </div>
        </div>

        {/* Check items */}
        <div className="space-y-1 mb-6">
          {checks.map((c) => (
            <CheckItem key={c.id} pass={c.pass} label={c.label} message={c.message} />
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={onPassed}
          disabled={!allPass}
          className="btn-primary mb-3"
          style={!allPass ? { background: '#1a1a1a', color: '#444444', border: '1px solid #222222' } : {}}
        >
          {allPass
            ? 'Ready — Start Session'
            : `Fix ${checks.length - passCount} check${checks.length - passCount !== 1 ? 's' : ''} to continue`}
        </button>

        <button
          onClick={onBack}
          className="w-full text-sm transition-colors text-center py-2"
          style={{ color: '#444444' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#888888'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#444444'; }}
        >
          ← Choose a different exercise
        </button>
      </div>
    </div>
  );
}
