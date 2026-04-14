const MODEL = 'claude-sonnet-4-20250514';

function buildPrompt(exercise) {
  const primaryMuscles = exercise.muscles.primary.join(', ');
  const secondaryMuscles = exercise.muscles.secondary?.join(', ') || 'none';
  const equipment = exercise.equipment.join(', ');

  return `You are an elite strength coach and exercise science expert with 20 years of coaching experience. Write a comprehensive, professional exercise guide for the **${exercise.name}**.

Context: Category — ${exercise.category} | Equipment — ${equipment} | Primary muscles — ${primaryMuscles} | Secondary muscles — ${secondaryMuscles} | Difficulty — ${exercise.difficulty}

Use this exact markdown format. Be specific, expert-level, and practical. Never be generic or vague.

## Overview
[2-3 paragraphs. What makes this exercise important. Why it belongs in a program. What it uniquely trains that other exercises don't. Include any key biomechanical points.]

## How to Perform

**Setup & Starting Position**
[Detailed equipment setup and body position. Every detail a beginner needs to get it right before the first rep.]

**The Concentric Phase** *(the working phase)*
[Numbered steps. Exactly what happens, in sequence, from start to completion of the movement. Be specific about where to push, pull, or hinge.]

**The Eccentric Phase** *(the return)*
[How to reverse the movement with control. Tempo cues, what to resist against, where not to rush.]

## Form Breakdown

**Starting Position ✓**
- [Key form point]
- [Key form point]
- [Key form point]

**Mid-Movement ✓**
- [Key form point]
- [Key form point]

**Completion / Lockout ✓**
- [Key form point]
- [Key form point]

## Common Mistakes ⚠️

**1. [Specific mistake name]**
What it looks like: [brief description]
Why it's wrong: [biomechanical explanation]
Injury risk: [specific tissue/joint at risk and why]

**2. [Specific mistake name]**
What it looks like: [brief description]
Why it's wrong: [biomechanical explanation]
Injury risk: [specific tissue/joint at risk and why]

**3. [Specific mistake name]**
What it looks like: [brief description]
Why it's wrong: [biomechanical explanation]
Injury risk: [specific tissue/joint at risk and why]

[Add a 4th or 5th if the exercise warrants it]

## Coaching Cues
> [Short, memorable cue — max 5 words]
> [Short, memorable cue — max 5 words]
> [Short, memorable cue — max 5 words]
> [Short, memorable cue — max 5 words]
> [Short, memorable cue — max 5 words]

## For Beginners
- [Specific tip: what to start with, what weight, what variation]
- [Specific tip: what to focus on first before adding weight]
- [Specific tip: what plateau or struggle beginners typically hit]
- [Regression option if applicable]

## For Intermediate & Advanced Athletes
- [Loading strategy: progression approach]
- [Variation: a harder or more specific version]
- [Programming note: how to use this in a training block]
- [Advanced technique: pause reps, tempo, accommodating resistance, etc.]

## Programming Notes
- **Sets & Reps:** [Typical ranges for strength, hypertrophy, and endurance goals]
- **Frequency:** [How often per week is appropriate]
- **Position in workout:** [Where in the session this should go — first, middle, end]
- **Pairs well with:** [1-2 complementary exercises]

Be specific and expert. Avoid filler language. Every sentence should deliver usable information.`;
}

export async function generateExerciseContent(exercise, onChunk) {
  const response = await fetch('/api/exercise-content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 3000,
      stream: true,
      messages: [{ role: 'user', content: buildPrompt(exercise) }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Request failed: ${response.status}`);
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
