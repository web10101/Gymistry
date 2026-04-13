// Exercises available in Live Trainer with rep-counting config
// angleGroup: which joint pair drives the rep cycle
// bottom: angle threshold for "contracted/bottom" position
// top: angle threshold for "extended/top" position
// A rep is counted when the angle crosses bottom then returns past top

export const LIVE_EXERCISES = [
  { value: 'Squat',            icon: '🏋️', label: 'Squat' },
  { value: 'Deadlift',         icon: '🔩', label: 'Deadlift' },
  { value: 'Push-up',          icon: '🤜', label: 'Push-up' },
  { value: 'Pull-up',          icon: '🔝', label: 'Pull-up' },
  { value: 'Overhead Press',   icon: '⬆️', label: 'OHP' },
  { value: 'Bench Press',      icon: '🪑', label: 'Bench Press' },
  { value: 'Romanian Deadlift',icon: '🦵', label: 'Romanian DL' },
  { value: 'Lunge',            icon: '🚶', label: 'Lunge' },
  { value: 'Barbell Row',      icon: '↔️', label: 'Barbell Row' },
  { value: 'Hip Thrust',       icon: '🍑', label: 'Hip Thrust' },
];

export const EXERCISE_REP_CONFIG = {
  'Squat':             { angleGroup: 'knee', bottom: 108, top: 152 },
  'Deadlift':          { angleGroup: 'hip',  bottom: 88,  top: 152 },
  'Push-up':           { angleGroup: 'elbow',bottom: 84,  top: 155 },
  'Pull-up':           { angleGroup: 'elbow',bottom: 76,  top: 152 },
  'Overhead Press':    { angleGroup: 'elbow',bottom: 84,  top: 162 },
  'Bench Press':       { angleGroup: 'elbow',bottom: 84,  top: 158 },
  'Romanian Deadlift': { angleGroup: 'hip',  bottom: 68,  top: 148 },
  'Lunge':             { angleGroup: 'knee', bottom: 98,  top: 152 },
  'Barbell Row':       { angleGroup: 'elbow',bottom: 66,  top: 150 },
  'Hip Thrust':        { angleGroup: 'hip',  bottom: 98,  top: 162 },
};

// Camera setup guides per exercise
export const CAMERA_GUIDES = {
  'Squat': {
    view: 'Side view',
    distance: '6–8 ft away',
    height: 'Hip height',
    diagram: '📷 ←— 👤',
    tips: [
      'Film from directly to the side',
      'Full body head-to-feet in frame',
      'Camera at hip level works best',
    ],
  },
  'Deadlift': {
    view: 'Side view',
    distance: '6–8 ft away',
    height: 'Hip height',
    diagram: '📷 ←— 👤',
    tips: [
      'Side angle shows hip hinge clearly',
      'Full body visible — including the bar',
      'Keep a few feet clear on each side',
    ],
  },
  'Push-up': {
    view: 'Side view',
    distance: '4–6 ft away',
    height: 'Floor level',
    diagram: '📷 ←— 🫅',
    tips: [
      'Camera at ground level, to the side',
      'Elbow and shoulder joint both visible',
      'Slight angle forward is fine',
    ],
  },
  'Pull-up': {
    view: 'Side or front',
    distance: '6–8 ft away',
    height: 'Mid-bar height',
    diagram: '📷 ←— 🧑',
    tips: [
      'Film from the side or slight angle',
      'Full body from bar to feet',
      'Camera at bar height is ideal',
    ],
  },
  'Overhead Press': {
    view: 'Side view',
    distance: '6–8 ft away',
    height: 'Shoulder height',
    diagram: '📷 ←— 🏋️',
    tips: [
      'Side angle shows bar path clearly',
      'Full arm range needs to be visible',
      'Camera at shoulder level',
    ],
  },
  'Bench Press': {
    view: 'Side view',
    distance: '5–7 ft away',
    height: 'Bench height',
    diagram: '📷 ←— 🛏',
    tips: [
      'Film from the side of the bench',
      'Elbow and chest visible at bottom',
      'Camera at bench level',
    ],
  },
  'Romanian Deadlift': {
    view: 'Side view',
    distance: '6–8 ft away',
    height: 'Hip height',
    diagram: '📷 ←— 👤',
    tips: [
      'Side angle shows hip hinge perfectly',
      'Full body visible — head to feet',
      'Camera at hip or mid-torso height',
    ],
  },
  'Lunge': {
    view: 'Side or 45°',
    distance: '6–8 ft away',
    height: 'Hip height',
    diagram: '📷 ↗ 🚶',
    tips: [
      'Side view shows knee tracking',
      'Leave space in front for the step',
      'Both legs need to be visible',
    ],
  },
  'Barbell Row': {
    view: 'Side view',
    distance: '6–7 ft away',
    height: 'Hip height',
    diagram: '📷 ←— 🏋️',
    tips: [
      'Side view shows torso angle clearly',
      'Full body visible including the bar',
      'Camera slightly below hip height',
    ],
  },
  'Hip Thrust': {
    view: 'Side view',
    distance: '5–7 ft away',
    height: 'Bench height',
    diagram: '📷 ←— 🍑',
    tips: [
      'Side angle is essential for hip extension',
      'Bench and feet both in frame',
      'Camera at bench/hip height',
    ],
  },
};

// Key body landmarks for movement detection
export const MOVEMENT_LANDMARKS = [11, 12, 23, 24, 25, 26]; // shoulders, hips, knees
