// Ideal joint angle ranges and deviation limits for the top 15 exercises.
// bottom = angles at bottom/contracted position
// top = angles at top/extended position
// dev = max acceptable deviation in degrees per joint group
// All angles in degrees.

export const POSE_THRESHOLDS = {
  'Squat': {
    joints: ['leftKnee','rightKnee','leftHip','rightHip','torsoLean'],
    bottom: { leftKnee:[85,115],  rightKnee:[85,115],  leftHip:[80,115],  rightHip:[80,115],  torsoLean:[10,40] },
    top:    { leftKnee:[155,180], rightKnee:[155,180], leftHip:[155,180], rightHip:[155,180], torsoLean:[0,15]  },
    dev:    { leftKnee:20, rightKnee:20, leftHip:20, rightHip:20, torsoLean:15 },
  },
  'Deadlift': {
    joints: ['leftHip','rightHip','leftKnee','rightKnee','spineAngle'],
    bottom: { leftHip:[75,105], rightHip:[75,105], leftKnee:[100,135], rightKnee:[100,135], spineAngle:[130,170] },
    top:    { leftHip:[158,180], rightHip:[158,180], leftKnee:[158,180], rightKnee:[158,180], spineAngle:[162,180] },
    dev:    { leftHip:20, rightHip:20, leftKnee:20, rightKnee:20, spineAngle:25 },
  },
  'Push-up': {
    joints: ['leftElbow','rightElbow','leftShoulder','rightShoulder'],
    bottom: { leftElbow:[78,100], rightElbow:[78,100], leftShoulder:[75,105], rightShoulder:[75,105] },
    top:    { leftElbow:[152,180], rightElbow:[152,180], leftShoulder:[152,180], rightShoulder:[152,180] },
    dev:    { leftElbow:18, rightElbow:18, leftShoulder:20, rightShoulder:20 },
  },
  'Pull-up': {
    joints: ['leftElbow','rightElbow','leftShoulder','rightShoulder'],
    bottom: { leftElbow:[68,90],  rightElbow:[68,90],  leftShoulder:[60,90],  rightShoulder:[60,90]  },
    top:    { leftElbow:[152,180], rightElbow:[152,180], leftShoulder:[150,178], rightShoulder:[150,178] },
    dev:    { leftElbow:18, rightElbow:18, leftShoulder:20, rightShoulder:20 },
  },
  'Overhead Press': {
    joints: ['leftElbow','rightElbow','leftShoulder','rightShoulder'],
    bottom: { leftElbow:[80,100], rightElbow:[80,100], leftShoulder:[78,105], rightShoulder:[78,105] },
    top:    { leftElbow:[158,180], rightElbow:[158,180], leftShoulder:[160,180], rightShoulder:[160,180] },
    dev:    { leftElbow:18, rightElbow:18, leftShoulder:18, rightShoulder:18 },
  },
  'Bench Press': {
    joints: ['leftElbow','rightElbow','leftShoulder','rightShoulder'],
    bottom: { leftElbow:[78,100], rightElbow:[78,100], leftShoulder:[72,105], rightShoulder:[72,105] },
    top:    { leftElbow:[148,175], rightElbow:[148,175], leftShoulder:[148,175], rightShoulder:[148,175] },
    dev:    { leftElbow:18, rightElbow:18, leftShoulder:20, rightShoulder:20 },
  },
  'Romanian Deadlift': {
    joints: ['leftHip','rightHip','leftKnee','rightKnee','spineAngle'],
    bottom: { leftHip:[58,85], rightHip:[58,85], leftKnee:[138,170], rightKnee:[138,170], spineAngle:[120,158] },
    top:    { leftHip:[148,175], rightHip:[148,175], leftKnee:[155,180], rightKnee:[155,180], spineAngle:[160,180] },
    dev:    { leftHip:20, rightHip:20, leftKnee:18, rightKnee:18, spineAngle:25 },
  },
  'Lunge': {
    joints: ['leftKnee','rightKnee','leftHip','rightHip'],
    bottom: { leftKnee:[88,110], rightKnee:[82,108], leftHip:[80,110], rightHip:[80,110] },
    top:    { leftKnee:[150,180], rightKnee:[150,180], leftHip:[155,180], rightHip:[155,180] },
    dev:    { leftKnee:20, rightKnee:20, leftHip:20, rightHip:20 },
  },
  'Barbell Row': {
    joints: ['leftElbow','rightElbow','leftHip','rightHip'],
    bottom: { leftElbow:[152,178], rightElbow:[152,178], leftHip:[78,112], rightHip:[78,112] },
    top:    { leftElbow:[52,80],   rightElbow:[52,80],   leftHip:[78,112], rightHip:[78,112] },
    dev:    { leftElbow:20, rightElbow:20, leftHip:20, rightHip:20 },
  },
  'Hip Thrust': {
    joints: ['leftHip','rightHip','leftKnee','rightKnee'],
    bottom: { leftHip:[78,105], rightHip:[78,105], leftKnee:[78,105], rightKnee:[78,105] },
    top:    { leftHip:[152,180], rightHip:[152,180], leftKnee:[78,105], rightKnee:[78,105] },
    dev:    { leftHip:20, rightHip:20, leftKnee:18, rightKnee:18 },
  },
  'Bicep Curl': {
    joints: ['leftElbow','rightElbow'],
    bottom: { leftElbow:[148,180], rightElbow:[148,180] },
    top:    { leftElbow:[32,68],   rightElbow:[32,68]   },
    dev:    { leftElbow:18, rightElbow:18 },
  },
  'Tricep Extension': {
    joints: ['leftElbow','rightElbow'],
    bottom: { leftElbow:[52,90],   rightElbow:[52,90]   },
    top:    { leftElbow:[152,180], rightElbow:[152,180] },
    dev:    { leftElbow:18, rightElbow:18 },
  },
  'Glute Bridge': {
    joints: ['leftHip','rightHip','leftKnee','rightKnee'],
    bottom: { leftHip:[82,112], rightHip:[82,112], leftKnee:[72,100], rightKnee:[72,100] },
    top:    { leftHip:[148,180], rightHip:[148,180], leftKnee:[72,100], rightKnee:[72,100] },
    dev:    { leftHip:20, rightHip:20, leftKnee:18, rightKnee:18 },
  },
  'Plank': {
    joints: ['torsoLean','spineAngle'],
    bottom: { torsoLean:[0,12], spineAngle:[152,180] },
    top:    { torsoLean:[0,12], spineAngle:[152,180] },
    dev:    { torsoLean:12, spineAngle:20 },
  },
  'Sit-up': {
    joints: ['leftHip','rightHip'],
    bottom: { leftHip:[158,180], rightHip:[158,180] },
    top:    { leftHip:[68,100],  rightHip:[68,100]  },
    dev:    { leftHip:22, rightHip:22 },
  },
};

// Phases where bottom thresholds apply
const BOTTOM_PHASES = new Set(['AT_BOTTOM', 'ECCENTRIC']);

/**
 * Compute form score (0–100) at the bottom of a rep.
 * 100 = every tracked joint within ideal range.
 */
export function computeFormScore(angles, exercise) {
  const t = POSE_THRESHOLDS[exercise];
  if (!t || !angles) return 100;
  const scores = [];
  for (const joint of t.joints) {
    const angle = angles[joint];
    const range = t.bottom[joint];
    const maxDev = t.dev[joint];
    if (angle == null || isNaN(angle) || !range || !maxDev) continue;
    const dev = angle < range[0] ? range[0] - angle : angle > range[1] ? angle - range[1] : 0;
    scores.push(Math.max(0, 1 - dev / maxDev));
  }
  if (!scores.length) return 100;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 100);
}

/**
 * Per-joint deviations from ideal for the current phase.
 * Returns { [jointName]: { deviation: number, color: 'green'|'yellow'|'red' } }
 */
export function getJointDeviations(angles, exercise, phase) {
  const t = POSE_THRESHOLDS[exercise];
  if (!t || !angles) return {};
  const ranges = BOTTOM_PHASES.has(phase) ? t.bottom : t.top;
  const result = {};
  for (const joint of t.joints) {
    const angle = angles[joint];
    const range = ranges[joint];
    const maxDev = t.dev[joint];
    if (angle == null || isNaN(angle) || !range || !maxDev) continue;
    const dev = angle < range[0] ? range[0] - angle : angle > range[1] ? angle - range[1] : 0;
    const ratio = dev / maxDev;
    result[joint] = {
      deviation: Math.round(dev),
      color: dev === 0 ? 'green' : ratio <= 0.5 ? 'yellow' : 'red',
    };
  }
  return result;
}
