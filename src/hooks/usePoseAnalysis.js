// MediaPipe Pose landmark indices
const LM = {
  LEFT_SHOULDER: 11, RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,    RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,    RIGHT_WRIST: 16,
  LEFT_HIP: 23,      RIGHT_HIP: 24,
  LEFT_KNEE: 25,     RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,    RIGHT_ANKLE: 28,
};

function angle(a, b, c) {
  if (!a || !b || !c) return null;
  const v1 = { x: a.x - b.x, y: a.y - b.y };
  const v2 = { x: c.x - b.x, y: c.y - b.y };
  const dot = v1.x * v2.x + v1.y * v2.y;
  const m1 = Math.hypot(v1.x, v1.y);
  const m2 = Math.hypot(v2.x, v2.y);
  if (!m1 || !m2) return null;
  return Math.acos(Math.max(-1, Math.min(1, dot / (m1 * m2)))) * (180 / Math.PI);
}

function summarize(vals) {
  const v = vals.filter((x) => x !== null && !isNaN(x));
  if (!v.length) return null;
  const min = Math.min(...v);
  const max = Math.max(...v);
  return {
    min: Math.round(min),
    max: Math.round(max),
    avg: Math.round(v.reduce((a, b) => a + b, 0) / v.length),
    range: Math.round(max - min),
  };
}

function extractAngles(lm) {
  const L = (i) => lm[i];

  const midShoulder = {
    x: (L(LM.LEFT_SHOULDER).x + L(LM.RIGHT_SHOULDER).x) / 2,
    y: (L(LM.LEFT_SHOULDER).y + L(LM.RIGHT_SHOULDER).y) / 2,
  };
  const midHip = {
    x: (L(LM.LEFT_HIP).x + L(LM.RIGHT_HIP).x) / 2,
    y: (L(LM.LEFT_HIP).y + L(LM.RIGHT_HIP).y) / 2,
  };
  const dy = midShoulder.y - midHip.y;
  const dx = midShoulder.x - midHip.x;
  const torsoLean = Math.abs(Math.atan2(dx, Math.abs(dy)) * (180 / Math.PI));

  return {
    leftKnee:      angle(L(LM.LEFT_HIP),      L(LM.LEFT_KNEE),   L(LM.LEFT_ANKLE)),
    rightKnee:     angle(L(LM.RIGHT_HIP),     L(LM.RIGHT_KNEE),  L(LM.RIGHT_ANKLE)),
    leftHip:       angle(L(LM.LEFT_SHOULDER),  L(LM.LEFT_HIP),    L(LM.LEFT_KNEE)),
    rightHip:      angle(L(LM.RIGHT_SHOULDER), L(LM.RIGHT_HIP),   L(LM.RIGHT_KNEE)),
    leftElbow:     angle(L(LM.LEFT_SHOULDER),  L(LM.LEFT_ELBOW),  L(LM.LEFT_WRIST)),
    rightElbow:    angle(L(LM.RIGHT_SHOULDER), L(LM.RIGHT_ELBOW), L(LM.RIGHT_WRIST)),
    leftShoulder:  angle(L(LM.LEFT_ELBOW),     L(LM.LEFT_SHOULDER),  L(LM.LEFT_HIP)),
    rightShoulder: angle(L(LM.RIGHT_ELBOW),    L(LM.RIGHT_SHOULDER), L(LM.RIGHT_HIP)),
    torsoLean,
  };
}

let mediaPipeLoaded = false;

async function loadMediaPipe() {
  if (mediaPipeLoaded || window.Pose) {
    mediaPipeLoaded = true;
    return;
  }
  await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js';
    script.crossOrigin = 'anonymous';
    script.onload = resolve;
    script.onerror = () => reject(new Error('Failed to load MediaPipe Pose'));
    document.head.appendChild(script);
  });
  mediaPipeLoaded = true;
}

/**
 * Analyzes a video file using MediaPipe Pose and returns biomechanical summary data.
 *
 * @param {File} videoFile
 * @param {(progress: {stage: string, pct: number, message: string}) => void} onProgress
 * @returns {Promise<{framesAnalyzed, duration, summary, symmetry}>}
 */
export async function analyzePoseFromVideo(videoFile, onProgress) {
  onProgress({ stage: 'loading', pct: 5, message: 'Loading pose model…' });

  await loadMediaPipe();

  onProgress({ stage: 'loading', pct: 15, message: 'Initializing…' });

  const pose = new window.Pose({
    locateFile: (file) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
  });

  pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  // Load the video
  const video = document.createElement('video');
  const objectURL = URL.createObjectURL(videoFile);
  video.src = objectURL;
  video.muted = true;
  video.playsInline = true;

  await new Promise((resolve, reject) => {
    video.onloadedmetadata = resolve;
    video.onerror = () => reject(new Error('Unable to read video file.'));
    video.load();
  });

  // Canvas — scale to max 640px wide for perf
  const canvas = document.createElement('canvas');
  const scale = Math.min(1, 640 / (video.videoWidth || 640));
  canvas.width = Math.round((video.videoWidth || 640) * scale);
  canvas.height = Math.round((video.videoHeight || 480) * scale);
  const ctx = canvas.getContext('2d');

  // Sample evenly — at most 30 frames
  const duration = video.duration || 5;
  const MAX_FRAMES = 30;
  const interval = Math.max(0.2, duration / MAX_FRAMES);
  const timestamps = [];
  for (let t = 0.15; t < duration - 0.1; t += interval) {
    timestamps.push(parseFloat(t.toFixed(2)));
  }

  const frameAngles = [];
  const collectedLandmarks = [];
  let resolveFrame = null;

  pose.onResults((results) => {
    collectedLandmarks.push(results.poseLandmarks || null);
    if (resolveFrame) {
      resolveFrame();
      resolveFrame = null;
    }
  });

  const sendFrame = async () => {
    const countBefore = collectedLandmarks.length;
    pose.send({ image: canvas }); // fire-and-forget — result comes via onResults
    await new Promise((resolve) => {
      if (collectedLandmarks.length > countBefore) {
        resolve();
      } else {
        resolveFrame = resolve;
        // Failsafe: don't hang forever
        setTimeout(resolve, 3000);
      }
    });
    return collectedLandmarks[collectedLandmarks.length - 1] ?? null;
  };

  for (let i = 0; i < timestamps.length; i++) {
    video.currentTime = timestamps[i];
    await new Promise((r) => { video.onseeked = r; });
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const landmarks = await sendFrame();
    if (landmarks) frameAngles.push(extractAngles(landmarks));

    onProgress({
      stage: 'analyzing',
      pct: 15 + Math.round(((i + 1) / timestamps.length) * 75),
      message: `Analyzing frame ${i + 1} of ${timestamps.length}…`,
    });
  }

  URL.revokeObjectURL(objectURL);
  pose.close();

  onProgress({ stage: 'done', pct: 90, message: 'Pose analysis complete.' });

  if (!frameAngles.length) {
    throw new Error(
      'No pose detected. Make sure your full body is visible in the video.'
    );
  }

  const joints = [
    'leftKnee', 'rightKnee', 'leftHip', 'rightHip',
    'leftElbow', 'rightElbow', 'leftShoulder', 'rightShoulder', 'torsoLean',
  ];
  const summary = {};
  for (const joint of joints) {
    summary[joint] = summarize(frameAngles.map((f) => f[joint]));
  }

  // Left-right symmetry (lower = more symmetrical)
  const symmetry = {};
  const pairs = [
    ['Knee', 'leftKnee', 'rightKnee'],
    ['Hip', 'leftHip', 'rightHip'],
    ['Elbow', 'leftElbow', 'rightElbow'],
    ['Shoulder', 'leftShoulder', 'rightShoulder'],
  ];
  for (const [name, l, r] of pairs) {
    if (summary[l] && summary[r]) {
      symmetry[name] = Math.round(Math.abs(summary[l].avg - summary[r].avg));
    }
  }

  return { framesAnalyzed: frameAngles.length, duration: Math.round(duration), summary, symmetry };
}
