import { useRef, useState, useCallback } from 'react';
import { MOVEMENT_LANDMARKS } from '../data/exerciseGuides';

// ─── Landmark indices ─────────────────────────────────────────────────────────
const LM = {
  NOSE: 0,
  L_EAR: 7,        R_EAR: 8,
  L_SHOULDER: 11,  R_SHOULDER: 12,
  L_ELBOW: 13,     R_ELBOW: 14,
  L_WRIST: 15,     R_WRIST: 16,
  L_PINKY: 17,     R_PINKY: 18,
  L_INDEX: 19,     R_INDEX: 20,
  L_HIP: 23,       R_HIP: 24,
  L_KNEE: 25,      R_KNEE: 26,
  L_ANKLE: 27,     R_ANKLE: 28,
  L_HEEL: 29,      R_HEEL: 30,
  L_FOOT: 31,      R_FOOT: 32,
};

const KEY_JOINTS = [
  LM.L_SHOULDER, LM.R_SHOULDER,
  LM.L_ELBOW,    LM.R_ELBOW,
  LM.L_WRIST,    LM.R_WRIST,
  LM.L_HIP,      LM.R_HIP,
  LM.L_KNEE,     LM.R_KNEE,
  LM.L_ANKLE,    LM.R_ANKLE,
];

const SKELETON = [
  [LM.L_SHOULDER, LM.R_SHOULDER],
  [LM.L_SHOULDER, LM.L_ELBOW],   [LM.L_ELBOW, LM.L_WRIST],
  [LM.R_SHOULDER, LM.R_ELBOW],   [LM.R_ELBOW, LM.R_WRIST],
  [LM.L_SHOULDER, LM.L_HIP],     [LM.R_SHOULDER, LM.R_HIP],
  [LM.L_HIP,      LM.R_HIP],
  [LM.L_HIP,  LM.L_KNEE],   [LM.L_KNEE,  LM.L_ANKLE],
  [LM.R_HIP,  LM.R_KNEE],   [LM.R_KNEE,  LM.R_ANKLE],
  [LM.L_ANKLE, LM.L_FOOT],  [LM.R_ANKLE, LM.R_FOOT],
];

// ─── Math helpers ─────────────────────────────────────────────────────────────

function angleDeg(a, b, c) {
  if (!a || !b || !c) return null;
  const v1 = { x: a.x - b.x, y: a.y - b.y };
  const v2 = { x: c.x - b.x, y: c.y - b.y };
  const dot = v1.x * v2.x + v1.y * v2.y;
  const m = Math.hypot(v1.x, v1.y) * Math.hypot(v2.x, v2.y);
  if (!m) return null;
  return Math.acos(Math.max(-1, Math.min(1, dot / m))) * (180 / Math.PI);
}

function midpoint(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

// ─── Full pose data extraction ────────────────────────────────────────────────

export function extractAnglesFromLandmarks(lm) {
  const L = (i) => lm[i];
  const midShoulder = midpoint(L(LM.L_SHOULDER), L(LM.R_SHOULDER));
  const midHip      = midpoint(L(LM.L_HIP),      L(LM.R_HIP));
  const midAnkle    = midpoint(L(LM.L_ANKLE),     L(LM.R_ANKLE));
  const torsoLean   = Math.abs(Math.atan2(midShoulder.x - midHip.x, Math.abs(midShoulder.y - midHip.y)) * (180 / Math.PI));

  // Spine alignment: angle at hip between shoulder and ankle midpoints
  const spineAngle = angleDeg(midShoulder, midHip, midAnkle);

  // Hip / shoulder tilt (vertical asymmetry between L and R)
  const hipTilt      = Math.abs(L(LM.L_HIP).y      - L(LM.R_HIP).y)      * 100; // as % of frame height
  const shoulderTilt = Math.abs(L(LM.L_SHOULDER).y  - L(LM.R_SHOULDER).y) * 100;

  // Stance width: ankle x-distance, normalized to frame width
  const stanceWidth = Math.abs(L(LM.L_ANKLE).x - L(LM.R_ANKLE).x);

  // Head forward position: nose vs midShoulder x offset
  const headForward = Math.abs(L(LM.NOSE).x - midShoulder.x);

  return {
    // Core angles (used by rep counter too)
    leftKnee:      angleDeg(L(LM.L_HIP),      L(LM.L_KNEE),   L(LM.L_ANKLE)),
    rightKnee:     angleDeg(L(LM.R_HIP),      L(LM.R_KNEE),   L(LM.R_ANKLE)),
    leftHip:       angleDeg(L(LM.L_SHOULDER), L(LM.L_HIP),    L(LM.L_KNEE)),
    rightHip:      angleDeg(L(LM.R_SHOULDER), L(LM.R_HIP),    L(LM.R_KNEE)),
    leftElbow:     angleDeg(L(LM.L_SHOULDER), L(LM.L_ELBOW),  L(LM.L_WRIST)),
    rightElbow:    angleDeg(L(LM.R_SHOULDER), L(LM.R_ELBOW),  L(LM.R_WRIST)),
    leftShoulder:  angleDeg(L(LM.L_ELBOW),    L(LM.L_SHOULDER), L(LM.L_HIP)),
    rightShoulder: angleDeg(L(LM.R_ELBOW),    L(LM.R_SHOULDER), L(LM.R_HIP)),

    // Extended angles
    leftAnkle:  angleDeg(L(LM.L_KNEE),  L(LM.L_ANKLE), L(LM.L_FOOT)),
    rightAnkle: angleDeg(L(LM.R_KNEE),  L(LM.R_ANKLE), L(LM.R_FOOT)),
    leftWrist:  angleDeg(L(LM.L_ELBOW), L(LM.L_WRIST), L(LM.L_INDEX)),
    rightWrist: angleDeg(L(LM.R_ELBOW), L(LM.R_WRIST), L(LM.R_INDEX)),

    // Body mechanics
    torsoLean,
    spineAngle,
    hipTilt,
    shoulderTilt,
    stanceWidth,
    headForward,
  };
}

/**
 * Compute symmetry deltas (positive = left side tighter / smaller angle).
 */
export function computeSymmetry(angles) {
  const pairs = [
    ['knee',     'leftKnee',     'rightKnee'],
    ['hip',      'leftHip',      'rightHip'],
    ['elbow',    'leftElbow',    'rightElbow'],
    ['shoulder', 'leftShoulder', 'rightShoulder'],
    ['ankle',    'leftAnkle',    'rightAnkle'],
  ];
  const sym = {};
  for (const [name, l, r] of pairs) {
    if (angles[l] !== null && angles[r] !== null) {
      sym[name] = Math.round(Math.abs(angles[l] - angles[r]));
    }
  }
  return sym;
}

/**
 * Compute velocity as average normalized displacement of key landmarks per frame.
 * Returns a 0–1 value (typically 0.001–0.05 range in practice).
 */
export function computeVelocity(curr, prev) {
  if (!prev || !curr) return 0;
  const TRACKED = [LM.L_SHOULDER, LM.R_SHOULDER, LM.L_HIP, LM.R_HIP, LM.L_KNEE, LM.R_KNEE];
  let total = 0, n = 0;
  for (const idx of TRACKED) {
    const c = curr[idx], p = prev[idx];
    if (c && p) { total += Math.hypot(c.x - p.x, c.y - p.y); n++; }
  }
  return n ? total / n : 0;
}

/**
 * Describe velocity in human terms.
 */
export function describeVelocity(v) {
  if (v < 0.003) return 'static / resting';
  if (v < 0.008) return 'slow and controlled';
  if (v < 0.018) return 'normal tempo';
  if (v < 0.030) return 'fast — pushing the pace';
  return 'very fast — possible loss of control';
}

/**
 * Describe spinal alignment.
 */
export function describeSpine(spineAngle) {
  if (!spineAngle) return 'unknown';
  if (spineAngle > 165) return 'neutral and upright';
  if (spineAngle > 145) return 'slight forward lean';
  if (spineAngle > 120) return 'moderate forward lean';
  return 'significant forward lean / rounding';
}

// ─── Movement detection ───────────────────────────────────────────────────────

export function detectMovement(prev, curr) {
  if (!prev || !curr) return false;
  let total = 0;
  for (const idx of MOVEMENT_LANDMARKS) {
    const p = prev[idx], c = curr[idx];
    if (p && c) total += Math.hypot(c.x - p.x, c.y - p.y);
  }
  return (total / MOVEMENT_LANDMARKS.length) > 0.004;
}

// ─── Skeleton drawing ─────────────────────────────────────────────────────────

function drawSkeletonOnCanvas(ctx, landmarks, w, h) {
  if (!ctx || !landmarks) return;
  ctx.clearRect(0, 0, w, h);
  ctx.lineCap = 'round';

  for (const [si, ei] of SKELETON) {
    const s = landmarks[si], e = landmarks[ei];
    if (!s || !e || (s.visibility ?? 1) < 0.3 || (e.visibility ?? 1) < 0.3) continue;
    // Fade line by joint confidence
    const conf = Math.min((s.visibility ?? 1), (e.visibility ?? 1));
    ctx.strokeStyle = `rgba(232, 255, 71, ${(0.3 + conf * 0.5).toFixed(2)})`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(s.x * w, s.y * h);
    ctx.lineTo(e.x * w, e.y * h);
    ctx.stroke();
  }

  for (const idx of KEY_JOINTS) {
    const lm = landmarks[idx];
    if (!lm || (lm.visibility ?? 1) < 0.3) continue;
    const conf = lm.visibility ?? 1;
    // Outer dot — color by confidence
    ctx.beginPath();
    ctx.arc(lm.x * w, lm.y * h, 5, 0, 2 * Math.PI);
    ctx.fillStyle = conf > 0.7 ? '#e8ff47' : '#f59e0b';
    ctx.fill();
    // Inner dark dot
    ctx.beginPath();
    ctx.arc(lm.x * w, lm.y * h, 2.5, 0, 2 * Math.PI);
    ctx.fillStyle = '#0a0a0a';
    ctx.fill();
  }
}

// ─── MediaPipe loader ─────────────────────────────────────────────────────────

async function ensureMediaPipe() {
  if (window.Pose) return;
  await new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js';
    s.crossOrigin = 'anonymous';
    s.onload = resolve;
    s.onerror = () => reject(new Error('Failed to load MediaPipe Pose'));
    document.head.appendChild(s);
  });
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Manages a live camera session with full MediaPipe Pose running at ~10fps.
 * onLandmarks receives raw landmarks; caller extracts angles.
 */
export function useLivePose({ onLandmarks }) {
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const poseRef   = useRef(null);
  const streamRef = useRef(null);
  const rafRef    = useRef(null);
  const busyRef   = useRef(false);
  const frameRef  = useRef(0);
  const SKIP      = 3; // process every 3rd frame ≈ 10fps

  const stop = useCallback(() => {
    if (rafRef.current)   cancelAnimationFrame(rafRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    if (poseRef.current)  poseRef.current.close();
    rafRef.current  = null;
    streamRef.current = null;
    poseRef.current  = null;
    setStatus('idle');
  }, []);

  const start = useCallback(async (videoEl, overlayCanvas) => {
    if (status === 'active') return;
    setStatus('loading');
    setErrorMsg('');

    try {
      await ensureMediaPipe();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      videoEl.srcObject = stream;
      videoEl.muted = true;
      videoEl.playsInline = true;
      await videoEl.play();

      const setSize = () => {
        if (overlayCanvas) {
          overlayCanvas.width  = videoEl.videoWidth  || 1280;
          overlayCanvas.height = videoEl.videoHeight || 720;
        }
      };
      videoEl.addEventListener('loadedmetadata', setSize, { once: true });
      setSize();

      const pose = new window.Pose({
        locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${f}`,
      });
      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      pose.onResults((results) => {
        busyRef.current = false;
        if (overlayCanvas && results.poseLandmarks) {
          const ctx = overlayCanvas.getContext('2d');
          drawSkeletonOnCanvas(ctx, results.poseLandmarks, overlayCanvas.width, overlayCanvas.height);
        } else if (overlayCanvas && !results.poseLandmarks) {
          const ctx = overlayCanvas.getContext('2d');
          ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
        }
        onLandmarks(results.poseLandmarks || null);
      });
      poseRef.current = pose;

      const loop = () => {
        frameRef.current++;
        if (!busyRef.current && frameRef.current % SKIP === 0 && videoEl.readyState >= 2) {
          busyRef.current = true;
          pose.send({ image: videoEl }).catch(() => { busyRef.current = false; });
        }
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
      setStatus('active');
    } catch (err) {
      setErrorMsg(err.message || 'Camera error');
      setStatus('error');
      stop();
    }
  }, [status, stop, onLandmarks]);

  return { start, stop, status, errorMsg };
}
