import { useRef, useState, useCallback } from 'react';
import { MOVEMENT_LANDMARKS } from '../data/exerciseGuides';

// Pose landmark indices (same as Phase 2)
const LM = {
  LEFT_SHOULDER: 11, RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,    RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,    RIGHT_WRIST: 16,
  LEFT_HIP: 23,      RIGHT_HIP: 24,
  LEFT_KNEE: 25,     RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,    RIGHT_ANKLE: 28,
};

// Skeleton connections to draw (subset of POSE_CONNECTIONS)
const SKELETON = [
  [LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER],
  [LM.LEFT_SHOULDER, LM.LEFT_ELBOW],   [LM.LEFT_ELBOW, LM.LEFT_WRIST],
  [LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW], [LM.RIGHT_ELBOW, LM.RIGHT_WRIST],
  [LM.LEFT_SHOULDER, LM.LEFT_HIP],     [LM.RIGHT_SHOULDER, LM.RIGHT_HIP],
  [LM.LEFT_HIP, LM.RIGHT_HIP],
  [LM.LEFT_HIP, LM.LEFT_KNEE],         [LM.LEFT_KNEE, LM.LEFT_ANKLE],
  [LM.RIGHT_HIP, LM.RIGHT_KNEE],       [LM.RIGHT_KNEE, LM.RIGHT_ANKLE],
];

const KEY_JOINTS = [
  LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER,
  LM.LEFT_ELBOW,    LM.RIGHT_ELBOW,
  LM.LEFT_HIP,      LM.RIGHT_HIP,
  LM.LEFT_KNEE,     LM.RIGHT_KNEE,
  LM.LEFT_ANKLE,    LM.RIGHT_ANKLE,
];

// ─── Angle math ──────────────────────────────────────────────────────────────

function angleDeg(a, b, c) {
  if (!a || !b || !c) return null;
  const v1 = { x: a.x - b.x, y: a.y - b.y };
  const v2 = { x: c.x - b.x, y: c.y - b.y };
  const dot = v1.x * v2.x + v1.y * v2.y;
  const m = Math.hypot(v1.x, v1.y) * Math.hypot(v2.x, v2.y);
  if (!m) return null;
  return Math.acos(Math.max(-1, Math.min(1, dot / m))) * (180 / Math.PI);
}

export function extractAnglesFromLandmarks(lm) {
  const L = (i) => lm[i];
  const midShoulder = { x: (L(LM.LEFT_SHOULDER).x + L(LM.RIGHT_SHOULDER).x) / 2, y: (L(LM.LEFT_SHOULDER).y + L(LM.RIGHT_SHOULDER).y) / 2 };
  const midHip      = { x: (L(LM.LEFT_HIP).x + L(LM.RIGHT_HIP).x) / 2,           y: (L(LM.LEFT_HIP).y + L(LM.RIGHT_HIP).y) / 2 };
  const torsoLean   = Math.abs(Math.atan2(midShoulder.x - midHip.x, Math.abs(midShoulder.y - midHip.y)) * (180 / Math.PI));

  return {
    leftKnee:      angleDeg(L(LM.LEFT_HIP),      L(LM.LEFT_KNEE),   L(LM.LEFT_ANKLE)),
    rightKnee:     angleDeg(L(LM.RIGHT_HIP),     L(LM.RIGHT_KNEE),  L(LM.RIGHT_ANKLE)),
    leftHip:       angleDeg(L(LM.LEFT_SHOULDER),  L(LM.LEFT_HIP),    L(LM.LEFT_KNEE)),
    rightHip:      angleDeg(L(LM.RIGHT_SHOULDER), L(LM.RIGHT_HIP),   L(LM.RIGHT_KNEE)),
    leftElbow:     angleDeg(L(LM.LEFT_SHOULDER),  L(LM.LEFT_ELBOW),  L(LM.LEFT_WRIST)),
    rightElbow:    angleDeg(L(LM.RIGHT_SHOULDER), L(LM.RIGHT_ELBOW), L(LM.RIGHT_WRIST)),
    leftShoulder:  angleDeg(L(LM.LEFT_ELBOW),     L(LM.LEFT_SHOULDER),  L(LM.LEFT_HIP)),
    rightShoulder: angleDeg(L(LM.RIGHT_ELBOW),    L(LM.RIGHT_SHOULDER), L(LM.RIGHT_HIP)),
    torsoLean,
  };
}

// ─── Skeleton drawing ─────────────────────────────────────────────────────────

function drawSkeletonOnCanvas(ctx, landmarks, w, h) {
  if (!ctx || !landmarks) return;
  ctx.clearRect(0, 0, w, h);

  // Connections
  ctx.strokeStyle = 'rgba(232, 255, 71, 0.55)';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  for (const [si, ei] of SKELETON) {
    const s = landmarks[si];
    const e = landmarks[ei];
    if (!s || !e || (s.visibility ?? 1) < 0.35 || (e.visibility ?? 1) < 0.35) continue;
    ctx.beginPath();
    ctx.moveTo(s.x * w, s.y * h);
    ctx.lineTo(e.x * w, e.y * h);
    ctx.stroke();
  }

  // Joint dots
  for (const idx of KEY_JOINTS) {
    const lm = landmarks[idx];
    if (!lm || (lm.visibility ?? 1) < 0.35) continue;
    ctx.beginPath();
    ctx.arc(lm.x * w, lm.y * h, 5, 0, 2 * Math.PI);
    ctx.fillStyle = '#e8ff47';
    ctx.fill();
    // inner dot
    ctx.beginPath();
    ctx.arc(lm.x * w, lm.y * h, 2.5, 0, 2 * Math.PI);
    ctx.fillStyle = '#0a0a0a';
    ctx.fill();
  }
}

// ─── Movement detection ───────────────────────────────────────────────────────

export function detectMovement(prev, curr) {
  if (!prev || !curr) return false;
  let total = 0;
  for (const idx of MOVEMENT_LANDMARKS) {
    const p = prev[idx];
    const c = curr[idx];
    if (p && c) total += Math.hypot(c.x - p.x, c.y - p.y);
  }
  return (total / MOVEMENT_LANDMARKS.length) > 0.004;
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
 * Manages a live camera session with MediaPipe Pose running continuously.
 *
 * Usage:
 *   const { start, stop, status, errorMsg } = useLivePose({ onLandmarks });
 *   start(videoEl, overlayCanvasEl);  // call after refs are ready
 */
export function useLivePose({ onLandmarks }) {
  const [status, setStatus] = useState('idle'); // idle | loading | active | error
  const [errorMsg, setErrorMsg] = useState('');

  const poseRef   = useRef(null);
  const streamRef = useRef(null);
  const rafRef    = useRef(null);
  const busyRef   = useRef(false);    // prevent overlapping pose.send() calls
  const frameRef  = useRef(0);
  const SKIP      = 3;               // process every 3rd frame ≈ 10 fps at 30 fps camera

  const stop = useCallback(() => {
    if (rafRef.current)  cancelAnimationFrame(rafRef.current);
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

      // Camera stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      videoEl.srcObject = stream;
      videoEl.muted = true;
      videoEl.playsInline = true;
      await videoEl.play();

      // Size the overlay canvas to match the video
      const setCanvasSize = () => {
        if (overlayCanvas) {
          overlayCanvas.width  = videoEl.videoWidth  || 1280;
          overlayCanvas.height = videoEl.videoHeight || 720;
        }
      };
      videoEl.addEventListener('loadedmetadata', setCanvasSize, { once: true });
      setCanvasSize();

      // MediaPipe Pose
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
        if (!results.poseLandmarks) return;

        // Draw skeleton
        if (overlayCanvas) {
          const ctx = overlayCanvas.getContext('2d');
          drawSkeletonOnCanvas(
            ctx, results.poseLandmarks,
            overlayCanvas.width, overlayCanvas.height
          );
        }

        // Notify parent
        onLandmarks(results.poseLandmarks);
      });
      poseRef.current = pose;

      // Frame loop
      const loop = () => {
        frameRef.current++;
        if (
          !busyRef.current &&
          frameRef.current % SKIP === 0 &&
          videoEl.readyState >= 2
        ) {
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
