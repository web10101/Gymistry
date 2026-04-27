import { useRef, useState, useCallback } from 'react';
import { EXERCISE_REP_CONFIG } from '../data/exerciseGuides';
import { computeFormScore } from '../data/poseThresholds';

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

// Movement phase enum
export const PHASE = {
  REST:       'REST',
  ECCENTRIC:  'ECCENTRIC',  // contracting / going toward bottom
  AT_BOTTOM:  'AT_BOTTOM',  // near minimum angle
  CONCENTRIC: 'CONCENTRIC', // extending / returning to top
  AT_TOP:     'AT_TOP',     // near full extension
};

const SMOOTH_WINDOW = 6;
const ROM_MARGIN    = 10;  // degrees — wiggle room for ROM comparison

/**
 * Counts reps and tracks movement phase + range of motion.
 *
 * Phase machine:
 *   AT_TOP → ECCENTRIC → AT_BOTTOM → CONCENTRIC → AT_TOP (rep counted)
 *
 * ROM tracking:
 *   Records the minimum angle reached in each rep.
 *   Reports whether the person hit adequate depth for the exercise.
 */
export function useRepCounter(exercise) {
  const [repCount,     setRepCount]     = useState(0);
  const [phase,        setPhase]        = useState(PHASE.AT_TOP);
  const [lastROM,      setLastROM]      = useState(null); // bottom angle of last rep
  const [lastFormScore, setLastFormScore] = useState(null);

  const phaseRef          = useRef(PHASE.AT_TOP);
  const repCountRef       = useRef(0);
  const angleHistRef      = useRef([]);
  const prevAngleRef      = useRef(null);
  const repMinAngleRef    = useRef(Infinity); // track depth in current rep
  const repBottomAnglesRef = useRef(null);   // angles captured at deepest point
  const formScoresRef     = useRef([]);      // score for every rep

  const setPhaseSync = (p) => {
    phaseRef.current = p;
    setPhase(p);
  };

  const update = useCallback(
    (angles) => {
      const cfg = EXERCISE_REP_CONFIG[exercise];
      if (!cfg) return { newRep: null, phase: phaseRef.current, formScore: null };

      const raw = getPrimaryAngle(angles, exercise);
      if (raw === null) return { newRep: null, phase: phaseRef.current, formScore: null };

      // Smooth
      angleHistRef.current.push(raw);
      if (angleHistRef.current.length > SMOOTH_WINDOW) angleHistRef.current.shift();
      const smoothed = angleHistRef.current.reduce((a, b) => a + b, 0) / angleHistRef.current.length;

      const { bottom, top } = cfg;
      const prev    = prevAngleRef.current;
      const curPhase = phaseRef.current;

      // Velocity of angle change (positive = extending, negative = contracting)
      const velocity = prev !== null ? smoothed - prev : 0;
      prevAngleRef.current = smoothed;

      let newRep = null;
      let romData = null;

      if (curPhase === PHASE.AT_TOP || curPhase === PHASE.REST) {
        if (velocity < -1) setPhaseSync(PHASE.ECCENTRIC);
        if (smoothed < bottom) {
          setPhaseSync(PHASE.AT_BOTTOM);
          repMinAngleRef.current = smoothed;
          repBottomAnglesRef.current = angles;
        }
      }

      if (curPhase === PHASE.ECCENTRIC) {
        if (smoothed < repMinAngleRef.current) {
          repMinAngleRef.current = smoothed;
          repBottomAnglesRef.current = angles;
        }
        if (smoothed < bottom) setPhaseSync(PHASE.AT_BOTTOM);
      }

      if (curPhase === PHASE.AT_BOTTOM) {
        if (smoothed < repMinAngleRef.current) {
          repMinAngleRef.current = smoothed;
          repBottomAnglesRef.current = angles;
        }
        if (velocity > 1) setPhaseSync(PHASE.CONCENTRIC);
      }

      if (curPhase === PHASE.CONCENTRIC) {
        if (smoothed > top) {
          // Rep complete
          repCountRef.current += 1;
          setRepCount(repCountRef.current);
          newRep = repCountRef.current;

          // Form score from deepest captured angles
          const score = computeFormScore(repBottomAnglesRef.current || angles, exercise);
          formScoresRef.current.push(score);
          setLastFormScore(score);

          // ROM data
          const achievedROM = repMinAngleRef.current;
          const expectedBottom = bottom;
          romData = {
            achieved: Math.round(achievedROM),
            target: expectedBottom,
            adequate: achievedROM <= expectedBottom + ROM_MARGIN,
            formScore: score,
          };
          setLastROM(romData);

          // Reset for next rep
          repMinAngleRef.current = Infinity;
          repBottomAnglesRef.current = null;
          setPhaseSync(PHASE.AT_TOP);
        }
      }

      // Detect rest: angle stable near top and no velocity
      if (Math.abs(velocity) < 0.5 && smoothed > top - 5) {
        if (curPhase !== PHASE.AT_TOP && curPhase !== PHASE.REST) {
          // Don't interrupt a completed rep check
        }
      }

      return { newRep, phase: phaseRef.current, romData, formScore: romData?.formScore ?? null };
    },
    [exercise]
  );

  const reset = useCallback(() => {
    setRepCount(0);
    setPhase(PHASE.AT_TOP);
    setLastROM(null);
    setLastFormScore(null);
    repCountRef.current       = 0;
    phaseRef.current          = PHASE.AT_TOP;
    angleHistRef.current      = [];
    prevAngleRef.current      = null;
    repMinAngleRef.current    = Infinity;
    repBottomAnglesRef.current = null;
    formScoresRef.current     = [];
  }, []);

  return { repCount, repCountRef, phase, phaseRef, lastROM, lastFormScore, formScoresRef, update, reset };
}
