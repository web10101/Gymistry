const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

function buildPrompt(answers) {
  const weightDisplay = answers.weight
    ? `${answers.weight} ${answers.weightUnit || 'lbs'}`
    : 'Not provided';
  const heightDisplay = answers.height
    ? `${answers.height} ${answers.heightUnit || 'in'}`
    : 'Not provided';
  const injuriesDisplay = Array.isArray(answers.injuries)
    ? answers.injuries.join(', ')
    : answers.injuries || 'None';
  const equipmentDisplay = Array.isArray(answers.equipment)
    ? answers.equipment.join(', ')
    : answers.equipment || 'Not specified';

  return `You are an elite personal trainer and strength & conditioning coach with 15+ years of experience. A client has just completed a detailed intake assessment. Create a complete, highly personalized workout program for them.

CLIENT PROFILE:
- Name: ${answers.name}
- Age: ${answers.age}
- Gender: ${answers.gender}
- Weight: ${weightDisplay}
- Height: ${heightDisplay}
- Primary Goal: ${answers.primaryGoal}
- Secondary Goal: ${answers.secondaryGoal || 'None'}
- Experience Level: ${answers.experienceLevel}
- Training History: ${answers.trainingHistory}
- Injuries / Limitations: ${injuriesDisplay}
- Available Equipment: ${equipmentDisplay}
- Training Days Per Week: ${answers.daysPerWeek}
- Session Duration: ${answers.sessionDuration} minutes
- Current Diet: ${answers.diet}
- Additional Notes: ${answers.additionalInfo || 'None'}

INSTRUCTIONS:
Create a complete 4-week progressive workout program. Your response must be structured, detailed, and professional. Use this exact format:

# ${answers.name}'s Personalized Training Program

## Your Trainer's Assessment
[2-3 sentences explaining your read of this client, what they need, and your overall approach. Be direct and personal.]

## Program Overview
- **Program Type:** [e.g., Upper/Lower Split, Full Body, Push/Pull/Legs]
- **Duration:** 4 Weeks (progressive)
- **Frequency:** ${answers.daysPerWeek} days/week
- **Session Length:** ~${answers.sessionDuration} minutes
- **Focus:** [Primary focus based on their goal]

## Weekly Schedule
[Show each day of the week and what the session is (or Rest)]

---

## Week 1–2: Foundation Phase

### [Day 1 Name — e.g., Monday: Upper Body Push]
**Warm-up (5 min):** [Specific warm-up routine]

| Exercise | Sets | Reps | Rest | Notes |
|----------|------|------|------|-------|
[List 5-7 exercises with specific sets, reps, rest periods. Add a brief coaching note for each.]

**Cool-down (5 min):** [Specific stretches]

### [Day 2 Name]
[Same format]

[Continue for all training days]

---

## Week 3–4: Progressive Overload Phase
[Explain how to progress from weeks 1-2 — what changes in weight, reps, or volume. Be specific.]

[Show updated Day 1 with progression applied as an example]

---

## Key Coaching Notes
- **Nutrition Guidance:** [Specific advice based on their diet habits and goal]
- **Recovery:** [Sleep, stress, active recovery recommendations]
- **What to Track:** [What metrics matter most for this person's goal]
- **Injury Modifications:** [If they have injuries, specific modifications to protect them]
- **Progress Indicators:** [How they'll know the program is working — specific milestones for 4 weeks]

---

## 4-Week Milestone Targets
[3-4 specific, measurable targets this person should hit by end of week 4, based on their starting point and goal]

Be specific with exercises — use real exercise names, proper form cues where needed, and make every recommendation tied to their specific profile. Don't be generic.`;
}

export async function generateWorkoutPlan(answers, onChunk) {
  const response = await fetch('/api/generate-program', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      stream: true,
      messages: [{ role: 'user', content: buildPrompt(answers) }],
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.error?.message || `Request failed: ${response.status}`
    );
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;
        try {
          const parsed = JSON.parse(data);
          if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
            fullText += parsed.delta.text;
            onChunk(fullText);
          }
        } catch {
          // skip malformed SSE lines
        }
      }
    }
  }

  return fullText;
}
