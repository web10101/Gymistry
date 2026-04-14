import { describeVelocity, describeSpine, computeSymmetry } from '../hooks/useLivePose';
import { PHASE } from '../hooks/useRepCounter';

const COACHING_MODEL = 'claude-haiku-4-5-20251001';

// ─── TTS Queue ────────────────────────────────────────────────────────────────

/**
 * Queued, non-overlapping text-to-speech with priority support.
 * Priority 'urgent' (safety) immediately interrupts and clears the queue.
 * Priority 'normal' queues behind current speech.
 */
export class TTSQueue {
  constructor() {
    this._q       = [];
    this._busy    = false;
    this._enabled = typeof window !== 'undefined' && 'speechSynthesis' in window;
    this._voice   = null;

    if (this._enabled) {
      // Populate voice once available
      const load = () => {
        const voices = window.speechSynthesis.getVoices();
        this._voice =
          voices.find(
            (v) =>
              (v.lang === 'en-US' || v.lang === 'en-GB') &&
              (v.name.includes('Natural') ||
                v.name.includes('Google') ||
                v.name.includes('Samantha') ||
                v.name.includes('Alex') ||
                v.name.includes('Daniel'))
          ) || voices.find((v) => v.lang === 'en-US') || null;
      };
      window.speechSynthesis.addEventListener('voiceschanged', load);
      load();
    }
  }

  /** Add text to the queue. Priority: 'urgent' | 'high' | 'normal' */
  speak(text, priority = 'normal') {
    if (!this._enabled || !text?.trim()) return;

    if (priority === 'urgent') {
      // Safety correction — interrupt everything immediately
      window.speechSynthesis.cancel();
      this._q = [];
      this._busy = false;
      this._say(text, { rate: 0.97, pitch: 0.95 });
      return;
    }

    if (priority === 'high') {
      // Rep count or important milestone — prepend to queue
      this._q.unshift(text);
    } else {
      // Skip if a near-duplicate is already queued
      const shortened = text.slice(0, 12);
      if (this._q.some((t) => t.startsWith(shortened))) return;
      this._q.push(text);
    }

    if (!this._busy) this._next();
  }

  cancel() {
    if (!this._enabled) return;
    window.speechSynthesis.cancel();
    this._q    = [];
    this._busy = false;
  }

  _next() {
    if (!this._q.length) { this._busy = false; return; }
    this._busy = true;
    const text = this._q.shift();

    // Adjust delivery by content
    const isNumber    = /^\d+$/.test(text.trim());
    const isUrgent    = /knee|back|round|cave|collapse|stop|careful/i.test(text);
    const isEncourage = /good|great|solid|nice|well done|keep|better/i.test(text);

    const opts = isNumber
      ? { rate: 1.15, pitch: 1.1 }
      : isUrgent
      ? { rate: 0.95, pitch: 0.93 }
      : isEncourage
      ? { rate: 1.0,  pitch: 1.05 }
      : { rate: 1.02, pitch: 1.0 };

    this._say(text, opts);
  }

  _say(text, { rate = 1.0, pitch = 1.0 } = {}) {
    try {
      const u         = new SpeechSynthesisUtterance(text);
      u.rate          = rate;
      u.pitch         = pitch;
      u.volume        = 1.0;
      if (this._voice) u.voice = this._voice;
      u.onend         = () => this._next();
      u.onerror       = () => { this._busy = false; this._next(); };
      window.speechSynthesis.speak(u);
    } catch {
      this._busy = false;
    }
  }
}

// ─── Claude coaching prompt ───────────────────────────────────────────────────

function fmtA(v) { return v !== null && !isNaN(v) ? `${Math.round(v)}°` : '—'; }
function fmtS(v) { return v !== undefined ? `${v}°` : '—'; }

function buildPrompt({ exercise, angles, velocity, symmetry, repCount, phase, lastROM, recentCues, secondsElapsed }) {
  const sym = symmetry || computeSymmetry(angles);
  const asymmetries = Object.entries(sym)
    .filter(([, v]) => v > 8)
    .map(([joint, v]) => `${joint}: ${v}° L/R difference`)
    .join(', ') || 'none significant';

  const romNote = lastROM
    ? lastROM.adequate
      ? `Last rep reached ${lastROM.achieved}° — good depth ✓`
      : `Last rep only reached ${lastROM.achieved}° — target is ${lastROM.target}° or lower, cut short`
    : 'No full rep yet';

  const avoidStr = recentCues?.length
    ? `DO NOT say: "${recentCues.slice(-4).join('" | "')}"`
    : '';

  const mm = Math.floor(secondsElapsed / 60);
  const ss = String(secondsElapsed % 60).padStart(2, '0');

  return `You are an elite personal trainer watching someone perform ${exercise} via live camera.

SESSION: ${mm}:${ss} elapsed | Rep ${repCount} | Phase: ${phase}

FULL JOINT DATA:
Knees:     L ${fmtA(angles.leftKnee)} / R ${fmtA(angles.rightKnee)}
Hips:      L ${fmtA(angles.leftHip)} / R ${fmtA(angles.rightHip)}
Elbows:    L ${fmtA(angles.leftElbow)} / R ${fmtA(angles.rightElbow)}
Shoulders: L ${fmtA(angles.leftShoulder)} / R ${fmtA(angles.rightShoulder)}
Ankles:    L ${fmtA(angles.leftAnkle)} / R ${fmtA(angles.rightAnkle)}
Wrists:    L ${fmtA(angles.leftWrist)} / R ${fmtA(angles.rightWrist)}
Torso lean: ${fmtA(angles.torsoLean)} | Spine: ${describeSpine(angles.spineAngle)}
Hip tilt: ${angles.hipTilt?.toFixed(1) ?? '—'}% | Shoulder tilt: ${angles.shoulderTilt?.toFixed(1) ?? '—'}%
Stance width: ${angles.stanceWidth?.toFixed(2) ?? '—'} (0=feet together, 1=full frame width)
Head position: ${fmtA(angles.headForward)} offset from center

SYMMETRY: ${asymmetries}

MOVEMENT:
Velocity: ${describeVelocity(velocity)}
Depth / ROM: ${romNote}

${avoidStr}

YOUR RESPONSE: ONE coaching cue, MAX 12 words.

Priority order (respond to highest priority that applies):
1. URGENT SAFETY — spinal rounding, joint collapse, loss of control → interrupt immediately
2. Form correction — specific body part + exact direction ("left knee 2 inches inside your toes")
3. Depth feedback — if they're not hitting ROM ("drop 3 inches lower, you can do it")
4. Symmetry flag — if one side is deviating > 12°
5. Tempo note — if velocity indicates too fast/too slow
6. Rep acknowledgment / encouragement — when form is solid
7. EMPTY STRING — if resting with clean form and nothing needs saying

Rules:
- Hyper-specific: "left knee caving in, drive it over your pinky toe" not "watch your knees"
- Notice improvements: "knee tracked better that rep — keep that"
- Vary tone: firm corrections, calm counts, warm encouragement
- When they're RESTING (${phase === PHASE.REST ? 'YES, currently resting' : 'no, currently moving'}): brief reset cue or silence
- Return EXACTLY "" (empty string) if resting and nothing needs correcting
- Never start with "I", never use filler words ("okay", "alright", "so")

Respond with ONLY the cue text (or empty string). No quotes, no labels.`;
}

// ─── API call ─────────────────────────────────────────────────────────────────

/**
 * Non-streaming Claude Haiku call for live coaching cues.
 * Returns the cue string (may be empty string = stay quiet).
 */
export async function getCoachingCue(data) {
  try {
    const res = await fetch('/api/live-coaching', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: COACHING_MODEL,
        max_tokens: 48,
        messages: [{ role: 'user', content: buildPrompt(data) }],
      }),
    });

    if (!res.ok) return null;
    const json = await res.json();
    const cue  = json?.content?.[0]?.text?.trim() ?? '';
    return cue === '' ? null : cue;
  } catch {
    return null;
  }
}
