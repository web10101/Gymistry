// Use Haiku for low-latency live coaching (fast response is critical here)
const COACHING_MODEL = 'claude-haiku-4-5-20251001';

function fmtAngle(a) {
  return a !== null && !isNaN(a) ? `${Math.round(a)}°` : 'N/A';
}

function buildCoachingPrompt({ exercise, angles, repCount, isMoving, recentCues, secondsElapsed }) {
  const status = !isMoving
    ? 'resting between reps'
    : repCount === 0
    ? 'warming up / about to start'
    : 'actively performing reps';

  const avoidStr = recentCues.length
    ? `Do NOT repeat: "${recentCues.join('", "')}"`
    : '';

  return `You are a personal trainer watching someone live via camera. Exercise: ${exercise}.

Status: ${status} | Rep ${repCount} | ${Math.floor(secondsElapsed / 60)}:${String(secondsElapsed % 60).padStart(2, '0')} into session

Live joint data:
- Knees: L ${fmtAngle(angles.leftKnee)} / R ${fmtAngle(angles.rightKnee)}
- Hips: L ${fmtAngle(angles.leftHip)} / R ${fmtAngle(angles.rightHip)}
- Elbows: L ${fmtAngle(angles.leftElbow)} / R ${fmtAngle(angles.rightElbow)}
- Torso lean: ${fmtAngle(angles.torsoLean)}

${avoidStr}

Give ONE coaching cue in 10 words or fewer. Be specific and direct. Examples:
"Chest up, brace your core"
"Left knee caving — push it out"
"Good depth, drive through your heels"
"Keep that bar close to your body"
"Solid — stay tight through the top"

If they are resting and form was good, say something encouraging but brief.
If a form issue is visible in the data, correct it specifically.
Reply with ONLY the cue — no quotes, no labels, no explanation.`;
}

/**
 * Non-streaming Claude call for live coaching cues.
 * Returns a short cue string or null on error.
 */
export async function getCoachingCue(data) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: COACHING_MODEL,
        max_tokens: 48,
        messages: [{ role: 'user', content: buildCoachingPrompt(data) }],
      }),
    });

    if (!res.ok) return null;
    const json = await res.json();
    return json?.content?.[0]?.text?.trim() ?? null;
  } catch {
    return null;
  }
}
