const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

function fmt(s) {
  if (!s) return 'N/A';
  return `avg ${s.avg}° (min ${s.min}°, max ${s.max}°, ROM ${s.range}°)`;
}

function buildPrompt(poseData, exercise) {
  const asymmetries = Object.entries(poseData.symmetry)
    .filter(([, diff]) => diff > 8)
    .map(([joint, diff]) => `  - ${joint}: ${diff}° difference left vs right`)
    .join('\n');

  return `You are an elite strength and conditioning coach with deep expertise in biomechanics and corrective exercise.

I used computer vision (MediaPipe Pose) to analyze a video of someone performing: **${exercise}**

BIOMECHANICAL DATA — ${poseData.framesAnalyzed} frames over ${poseData.duration}s:

| Joint           | Data |
|-----------------|------|
| Left Knee       | ${fmt(poseData.summary.leftKnee)} |
| Right Knee      | ${fmt(poseData.summary.rightKnee)} |
| Left Hip        | ${fmt(poseData.summary.leftHip)} |
| Right Hip       | ${fmt(poseData.summary.rightHip)} |
| Left Shoulder   | ${fmt(poseData.summary.leftShoulder)} |
| Right Shoulder  | ${fmt(poseData.summary.rightShoulder)} |
| Left Elbow      | ${fmt(poseData.summary.leftElbow)} |
| Right Elbow     | ${fmt(poseData.summary.rightElbow)} |
| Torso Lean      | ${fmt(poseData.summary.torsoLean)} |

${
  asymmetries
    ? `ASYMMETRY FLAGS (differences > 8°):\n${asymmetries}`
    : 'ASYMMETRY: No significant left-right asymmetry detected.'
}

Provide detailed, professional coaching feedback using this exact format:

## Overall Assessment
[2-3 sentences. Honest, direct read of movement quality. Reference specific angle data. Don't be generic.]

## What You're Doing Well ✓
- [3-4 specific positives tied to the data]

## Form Corrections
- [3-5 specific issues. For each: state the problem, cite the data behind it, and explain the biomechanical consequence]

## Coaching Cues
> [4-5 short, memorable verbal cues a trainer would actually say. One per line. E.g. "Drive the floor away", "Chest tall", "Knees track over pinky toe"]

## Injury Risk
[Honest risk assessment. Flag any concerns with explanation. If low risk overall, say so clearly.]

## Fix-It Drills
1. **[Drill name]** — [What it targets and how to perform it]
2. **[Drill name]** — [What it targets and how to perform it]
3. **[Drill name]** — [What it targets and how to perform it]

Reference specific numbers from the data. If the data is insufficient to assess something, say so instead of guessing. Be direct — this person is here to improve, not to be flattered.`;
}

export async function analyzeForm(poseData, exercise, onChunk) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('No API key found. Add VITE_ANTHROPIC_API_KEY to your .env file.');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 2048,
      stream: true,
      messages: [{ role: 'user', content: buildPrompt(poseData, exercise) }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let full = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    for (const line of chunk.split('\n')) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (data === '[DONE]') continue;
      try {
        const parsed = JSON.parse(data);
        if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
          full += parsed.delta.text;
          onChunk(full);
        }
      } catch { /* skip */ }
    }
  }

  return full;
}
