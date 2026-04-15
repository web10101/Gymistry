
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

function buildPrompt({ exercise, angles, deviations, formScore, phase, repCount, lastROM, recentCues }) {
  // Summarise worst joint deviations (red first, then yellow)
  const devEntries = Object.entries(deviations || {})
    .filter(([, d]) => d.color !== 'green')
    .sort(([, a], [, b]) => b.deviation - a.deviation);

  const devStr = devEntries.length
    ? devEntries.map(([j, d]) => `${j} ${d.deviation}° off (${d.color})`).join(', ')
    : 'all joints within range';

  const score = formScore != null ? `${formScore}%` : 'n/a';

  const romNote = lastROM
    ? lastROM.adequate ? 'good depth' : `only ${lastROM.achieved}° — target ${lastROM.target}°`
    : '';

  const avoidStr = recentCues?.length
    ? `NEVER repeat: "${recentCues.slice(-3).join('" | "')}"`
    : '';

  return `Trainer for ${exercise}. Rep ${repCount}. Phase: ${phase}. Form score: ${score}.
Joint deviations: ${devStr}.${romNote ? ` Depth: ${romNote}.` : ''}
${avoidStr}

Rules — read carefully:
- ONE sentence max. Short. Natural. Like a real trainer talking.
- Form score >85: just count the rep or say something encouraging.
- A joint is red/yellow: name it specifically and give one simple fix.
- Never give a technical report. Never start with "I".
- Never repeat the last 3 cues above.
- Return empty string if nothing important to say.

Examples of good responses:
"Three. Good depth."
"Chest is dropping — chin up."
"Nice, that's better."
"Knees out a bit more."
"Four. Keep that pace."

Respond with ONLY the cue (or empty string). No quotes, no labels.`;
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
