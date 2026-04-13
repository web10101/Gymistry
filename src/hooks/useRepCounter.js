import { useRef, useState, useCallback } from 'react';
import { EXERCISE_REP_CONFIG } from '../data/exerciseGuides';

const avg = (...vals) => {
  const v = vals.filter((x) => x !== null && !isNaN(x));
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
};

function getPrimaryAngle(angles, exercise) {
  const cfg = EXERCISE_REP_CONFIG[exercise];
  if (!cfg || !angles) return null;
  if (cfg.angleGroup === 'knee')  return avg(angles.leftKnee,  angles.rightKnee);
  if (cfg.angleGroup === 'hip')   return avg(angles.leftHip,   angles.rightHip);
  if (cfg.angleGroup === 'elbow') return avg(angles.leftElbow, angles.rightElbow);
  return null;
}

const SMOOTH_WINDOW = 5; // frames to smooth over

/**
 * Counts reps by detecting angle cycles (bottom → top transitions).
 *
 * State machine per exercise:
 *   'top'    — at or above the top threshold (start/rest position)
 *   'bottom' — below the bottom threshold (contracted position)
 *
 * A rep is counted when the angle transitions: top → bottom → top
 */
export function useRepCounter(exercise) {
  const [repCount, setRepCount] = useState(0);

  const phaseRef      = useRef('top');   // 'top' | 'bottom'
  const repCountRef   = useRef(0);
  const angleHistRef  = useRef([]);       // rolling buffer for smoothing

  const update = useCallback(
    (angles) => {
      const cfg = EXERCISE_REP_CONFIG[exercise];
      if (!cfg) return null;

      const raw = getPrimaryAngle(angles, exercise);
      if (raw === null) return null;

      // Smooth the angle over the last N frames
      angleHistRef.current.push(raw);
      if (angleHistRef.current.length > SMOOTH_WINDOW) angleHistRef.current.shift();
      const smoothed = angleHistRef.current.reduce((a, b) => a + b, 0) / angleHistRef.current.length;

      const { bottom, top } = cfg;
      const phase = phaseRef.current;

      if (phase === 'top' && smoothed < bottom) {
        // Entered the contracted/bottom position
        phaseRef.current = 'bottom';
      } else if (phase === 'bottom' && smoothed > top) {
        // Returned to extended/top position — rep complete
        phaseRef.current = 'top';
        repCountRef.current += 1;
        setRepCount(repCountRef.current);
        return repCountRef.current;
      }

      return null; // no new rep this frame
    },
    [exercise]
  );

  const reset = useCallback(() => {
    setRepCount(0);
    repCountRef.current  = 0;
    phaseRef.current     = 'top';
    angleHistRef.current = [];
  }, []);

  return { repCount, repCountRef, update, reset };
}
