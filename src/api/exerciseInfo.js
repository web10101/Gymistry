const MODEL = 'claude-haiku-4-5-20251001';
const LS_PREFIX = 'gymistry_ex_';

// In-memory cache for this session; localStorage persists across sessions.
const cache = new Map();

// ── Prompt ────────────────────────────────────────────────────────────────────

function buildPrompt({ name, muscleGroup }) {
  return `You are a biomechanics and coaching expert. Provide data for the exercise "${name}" (primary group: ${muscleGroup}).

Return ONLY a single valid JSON object — no markdown, no code fences, no explanation.

Schema:

{
  "phases": [
    {
      "name": "Phase name (e.g. Setup, Bottom, Lockout)",
      "joints": {
        "head":      [x, y],
        "neck":      [x, y],
        "lShoulder": [x, y], "rShoulder": [x, y],
        "lElbow":    [x, y], "rElbow":    [x, y],
        "lWrist":    [x, y], "rWrist":    [x, y],
        "lHip":      [x, y], "rHip":      [x, y],
        "lKnee":     [x, y], "rKnee":     [x, y],
        "lAnkle":    [x, y], "rAnkle":    [x, y]
      }
    }
  ],
  "errorPose": {
    "description": "One sentence naming the most common mistake and why it matters.",
    "joints": { ...same 14 joints... },
    "errorJoints": ["joint names that are in the wrong position, e.g. lKnee, rKnee"]
  },
  "criticalJoints": ["joint names to highlight on the correct-form canvas"],
  "content": {
    "whatItTrains": "1-2 sentences. What muscles and why this movement matters.",
    "howToDoIt": ["Step 1 text", "Step 2 text", "Step 3 text", "Step 4 text"],
    "coachingCues": ["Short cue", "Short cue", "Short cue", "Short cue"],
    "commonMistakes": ["Mistake name: one-sentence explanation", "Second mistake: explanation"]
  }
}

Joint coordinate rules:
- x and y are floats from 0.0 to 1.0
- (0,0) = top-left of canvas, (1,1) = bottom-right
- Standing neutral reference: head=[0.50,0.06], neck=[0.50,0.13], lShoulder=[0.36,0.21], rShoulder=[0.64,0.21], lHip=[0.41,0.50], rHip=[0.59,0.50], lKnee=[0.41,0.68], rKnee=[0.59,0.68], lAnkle=[0.41,0.87], rAnkle=[0.59,0.87]
- Provide 2–3 phases that show the full movement arc
- For side-view exercises: shift the figure so it reads as a profile (person facing right = head at higher x)
- For horizontal exercises (plank, push-up): lay the figure diagonally (head at top-right, feet at bottom-left)
- The error pose uses the same 14 joints; errorJoints lists which ones are in the wrong position

Return ONLY the raw JSON object.`;
}

// ── Fetch ─────────────────────────────────────────────────────────────────────

export async function getExerciseInfo(exercise) {
  if (cache.has(exercise.id)) return cache.get(exercise.id);

  try {
    const stored = localStorage.getItem(LS_PREFIX + exercise.id);
    if (stored) {
      const data = JSON.parse(stored);
      cache.set(exercise.id, data);
      return data;
    }
  } catch { /* ignore localStorage errors */ }

  const res = await fetch('/api/exercise-info', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2000,
      messages: [{ role: 'user', content: buildPrompt(exercise) }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Request failed: ${res.status}`);
  }

  const json = await res.json();
  const text = json?.content?.[0]?.text?.trim() ?? '';

  // Strip accidental markdown code fences if Claude adds them
  const clean = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  const data  = JSON.parse(clean);

  cache.set(exercise.id, data);
  try { localStorage.setItem(LS_PREFIX + exercise.id, JSON.stringify(data)); } catch { /* ignore */ }
  return data;
}
