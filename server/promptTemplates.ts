export const SYSTEM_INSTRUCTION = `You are the Communication Mastery Lab: an elite training engine combining an executive communication coach, behavioral/social/cognitive psychologist, negotiation strategist, leadership coach, and emotional intelligence expert. Your purpose is to transform how the user communicates, not to entertain.

Core Behavioral Principles:
1. Every character has: distinct personality, speech quirks, emotional state, confidence level, interests, private fears, biases, hidden goals, stress level, and conversational openness. Keep hidden motives strictly secret until the final analysis.
2. Characters behave like authentic, imperfect humans: they interrupt, misunderstand, get distracted, check phones, display micro-expressions, use sarcasm or defensive deflection, hesitate, lose interest, change subjects, or get emotional. Not everyone is socially adept or friendly.
3. Psychological Realism & Grounding: Before each character reply, assess how they interpreted the user's words, whether they felt judged, patronized, validated, intrigued, or pressured, and how that impacts their trust, interest, and comfort meters.
4. No Artificial Favoritism or Rescues: Poor communication causes friction, lost opportunities, awkward silence, or severed rapport. Trust, respect, and attraction are earned incrementally. The AI can end the conversation naturally if the user alienates the counterpart or if time/patience runs out.
5. High Variation & Stakes: Ensure distinct physical settings (temperature, ambient sound, lighting, bystanders), asymmetric power dynamics, social risks, and time constraints so simulations feel genuinely high-stakes and never repeat.
6. Evidence-Based Analysis: Analysis must be rigorous, precise, and devoid of flattery. Base all psychological assessments strictly on observed verbal and tactical behaviors during the session.`;

export function buildScenarioPrompt(params: {
  category: string;
  conversationType: string;
  difficulty: string;
  userGoal?: string;
  pastSessionsSummary?: string;
}): string {
  const isMultiPerson = params.conversationType.includes('Multi-Person');
  const characterCount = isMultiPerson ? '3 to 5 realistic characters with divergent interests and alliances' : '1 primary counterpart (and optionally 1 secondary present party)';

  return `GENERATE A HIGH-STAKES SIMULATION SCENARIO.

Parameters:
- Training Category: ${params.category}
- Conversation Type: ${params.conversationType}
- Target Difficulty: ${params.difficulty}
${params.userGoal ? `- User's Specific Goal: "${params.userGoal}"` : '- User Objective: Excel under the psychological stakes of this interaction'}
${params.pastSessionsSummary ? `- Past Training Context (Adapt to test previous blindspots without labeling): ${params.pastSessionsSummary}` : ''}

Requirements:
1. Generate ${characterCount}.
2. For each character, assign:
   - Initial meters (trust: 20-75, interest: 25-80, comfort: 25-80 depending on difficulty).
   - A critical Hidden Motive (an unspoken agenda they will not voice directly).
   - A Hidden Fear (what they dread happening).
   - An Unspoken Priority (what would actually win them over).
3. The atmosphere must include vivid sensory details (lighting, background noises, physical proximity, ambient distractions).
4. Social context must outline real stakes, power balance (is the user high or low status?), and history.
5. Provide 2-4 realistic situational or social constraints (e.g., ticking clock, public earshot, emotional sensitivity).
6. Create an authentic, natural opening message from the main character with nonverbal body language (e.g., *glances at smart watch, adjusting collar*).
7. Create 4-5 opening response options. Crucial: Each option must be a realistic, verbatim sentence or behavioral action the user could take. Each must represent a distinct strategy (e.g. Confident, Warm, Curious, Humorous, Diplomatic, High-Status, Strategic Silence, Blunt Boundary, Disarming Vulnerability). They must vary in length and posture, with genuine trade-offs. Never indicate which is "best".`;
}

export function buildTurnPrompt(params: {
  scenario: any;
  history: Array<{ sender: string; characterName?: string; bodyLanguage?: string; text: string; strategyUsed?: string }>;
  userReply: string;
  userStrategy?: string;
  currentTurn: number;
}): string {
  const isMultiPerson = params.scenario.conversationType.includes('Multi-Person');

  return `PROCESS NEXT CONVERSATION TURN IN SIMULATION.

Scenario Background:
- Title: ${params.scenario.title}
- Context & Power Dynamic: ${params.scenario.socialContext}
- Objective: ${params.scenario.objective}
- Constraints: ${params.scenario.constraints.join('; ')}
- Difficulty: ${params.scenario.difficulty}

Characters in play:
${params.scenario.characters.map((c: any) => `
- [${c.id}] ${c.name} (${c.role}):
  * Personality & Style: ${c.personality} | ${c.communicationStyle}
  * Current Meters: Trust=${c.meters.trust}, Interest=${c.meters.interest}, Comfort=${c.meters.comfort}
  * Hidden Motive: ${c.hiddenMotive}
  * Hidden Fear: ${c.hiddenFear}
  * Hidden Priority: ${c.hiddenPriority}
`).join('\n')}

Conversation History so far:
${params.history.map((h, i) => `${i + 1}. [${h.sender === 'user' ? 'USER' + (h.strategyUsed ? ` (${h.strategyUsed})` : '') : h.characterName}]: ${h.bodyLanguage ? h.bodyLanguage + ' ' : ''}"${h.text}"`).join('\n')}

LATEST USER INPUT (Turn #${params.currentTurn}):
"${params.userReply}" ${params.userStrategy ? `[Strategy tag: ${params.userStrategy}]` : '[Custom Written Response]'}

Instructions for Generation:
1. Internal Psychological Reflection:
   - How did the counterpart(s) interpret the user's exact phrasing?
   - Did the user validate, provoke, bore, intimidate, or disarm them?
   - How does this interact with their hidden fear or motive?
2. Spoken Dialogue:
   - Provide the next natural response. Real humans don't give neat lectures; they react with tone, hesitation, defensiveness, sarcasm, curiosity, or shifting posture.
   ${isMultiPerson ? '- In this Multi-Person conversation, other characters may interrupt, glance at each other, whisper side remarks, or shift alliances.' : ''}
   - Include realistic body language in asterisks (e.g. *taps fingers impatiently on coffee cup*, *eyebrows raise slightly*).
3. Meter Updates:
   - Compute delta for Trust, Interest, Comfort for each character. (Remember: trust is hard to build, fast to erode. A superficial line or patronizing tone will drop comfort/trust).
   - Set a concise microReaction clue (e.g. "Guarded", "Intrigued", "Disrespected", "Warming up").
4. Termination Check:
   - Set isConversationEnded to true ONLY if: the counterpart walks away / loses patience completely, the user achieved a conclusive milestone, or the scenario naturally concludes after adequate depth (usually 4-8 turns). Otherwise false.
5. Response Options:
   - If isConversationEnded is false, generate 4 to 5 fresh, divergent response options for the user's next turn.
   - Distinct strategies (Confident, Warm, Curious, Humorous, Diplomatic, High-Status, Strategic Silence, Playful, Blunt Disagreement, Disarming).
   - Varied lengths: one might be a single curt sentence, one a poignant question, one an anecdote, one a deliberate pregnant pause (*Stay silent and wait for them to fill the void*), one setting a boundary.
   - Do NOT hint at which is correct; every option must possess realistic risks and trade-offs.`;
}

export function buildAnalysisPrompt(params: {
  scenario: any;
  history: Array<{ sender: string; characterName?: string; bodyLanguage?: string; text: string; strategyUsed?: string }>;
  userGoal?: string;
}): string {
  return `CONDUCT DEEP PSYCHOLOGICAL AND TACTICAL AUDIT OF THE SESSION.

Scenario:
- Title: ${params.scenario.title}
- Category: ${params.scenario.category} | Type: ${params.scenario.conversationType} | Difficulty: ${params.scenario.difficulty}
- Social Context: ${params.scenario.socialContext}
- Objective: ${params.scenario.objective}
- User's Stated Goal: ${params.userGoal || 'Not specified'}

Characters & Their Secret Hidden Realities (Now to be revealed in the analysis):
${params.scenario.characters.map((c: any) => `
- ${c.name} (${c.role}):
  * Secret Motive: ${c.hiddenMotive}
  * Secret Fear: ${c.hiddenFear}
  * Unspoken Priority: ${c.hiddenPriority}
`).join('\n')}

Complete Transcript:
${params.history.map((h, i) => `${i + 1}. [${h.sender === 'user' ? 'USER' + (h.strategyUsed ? ` (${h.strategyUsed})` : '') : h.characterName}]: ${h.bodyLanguage ? h.bodyLanguage + ' ' : ''}"${h.text}"`).join('\n')}

Audit Requirements:
1. Overall Communication Score (0-100) and Sub-scores (0-100 each across all 18 dimensions: Executive Presence, Confidence, Emotional Intelligence, Listening, Curiosity, Influence, Assertiveness, Clarity, Storytelling, Rapport, Authenticity, Adaptability, Leadership, Persuasion, Conflict Management, Humor, Trust Building, Overall Effectiveness).
2. Deep Psychological Breakdown:
   - Why the user made these choices (the underlying psychology and risk-tolerance).
   - Emotional assumptions at play (e.g., fear of conflict, eagerness to impress, defensive posture).
   - Specific analysis of 5 core behavioral patterns: Approval Seeking, Avoidance/Defensiveness, Overexplaining, Dominating/Interrupting, Withdrawing/Hesitation.
   - Wording impact: how precise words, framing, and status signals impacted the counterpart.
3. Choice-by-Choice Review:
   - Audit every single turn the user took. Detail the psychological mechanism of why it landed or missed.
   - Counterfactual analysis: what would have happened if they took a different route?
   - Strategic breakdown: which alternative strategy would have excelled for Rapport vs Persuasion vs Authority vs Conflict Resolution.
4. Missed Opportunities:
   - Highlight high-leverage inflection points where a stronger question, empathy bridge, strategic silence, or leadership pivot was missed.
5. Elite Rewrites:
   - Select the 3 weakest/most suboptimal user replies from the transcript.
   - Rewrite each reply in 4 distinct master-level styles:
     a) Respected Executive (calm, authoritative, economical, high-frame)
     b) Experienced Negotiator (tactical, calibrated questions, label-oriented, anchoring)
     c) Skilled Diplomat (face-saving, bridging, de-escalating, nuance)
     d) Charismatic Leader (inspiring, warm-competence, vision-aligned, disarming)
   - Include specific rationale for why each rewrite works psychologically.
6. Learning Loop:
   - 3 targeted exercises, 1 real-world challenge to practice today, 1 reflection question, 1 foundational axiom, and the recommended next scenario.
7. Revealed Hidden Info:
   - Clearly demystify what the characters were secretly trying to protect or gain during the simulation and how the user's actions unwittingly triggered those levers.`;
}
