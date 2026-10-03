import type { StoredSession, SessionAnalysis, ScenarioData, MessageRecord } from '../../server/types';

const STORAGE_KEY = 'cml_training_sessions_v1';

export function getStoredSessions(): StoredSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse stored sessions:', e);
    return [];
  }
}

export function saveSession(
  scenario: ScenarioData,
  transcript: MessageRecord[],
  analysis: SessionAnalysis,
  userGoal?: string
): StoredSession {
  const sessions = getStoredSessions();

  // Determine top strengths and growth areas from subscores
  const subScoreEntries = Object.entries(analysis.subScores);
  subScoreEntries.sort((a, b) => b[1] - a[1]);
  
  const topStrengths = subScoreEntries.slice(0, 3).map(([key]) => formatSkillName(key));
  const growthAreas = subScoreEntries.slice(-3).map(([key]) => formatSkillName(key));

  const newSession: StoredSession = {
    id: `sess-${Date.now()}`,
    timestamp: Date.now(),
    dateStr: new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    title: scenario.title,
    category: scenario.category,
    conversationType: scenario.conversationType,
    difficulty: scenario.difficulty,
    userGoal,
    overallScore: analysis.communicationScore,
    subScores: analysis.subScores,
    topStrengths,
    growthAreas,
    turnsCount: transcript.filter(t => t.sender === 'user').length,
    analysisSummary: analysis.overallAssessment,
    fullAnalysis: analysis,
    transcript,
  };

  sessions.unshift(newSession);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to save session to localStorage:', e);
  }

  return newSession;
}

export function deleteStoredSession(id: string): void {
  const sessions = getStoredSessions().filter(s => s.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to delete session:', e);
  }
}

export function clearAllStoredSessions(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear sessions:', e);
  }
}

export function getAdaptivePastSummary(): string {
  const sessions = getStoredSessions();
  if (sessions.length === 0) return '';

  const recent = sessions.slice(0, 5);
  const avgScore = Math.round(recent.reduce((acc, s) => acc + s.overallScore, 0) / recent.length);
  
  // Aggregate common growth areas
  const growthCounts: Record<string, number> = {};
  recent.forEach(s => {
    s.growthAreas.forEach(area => {
      growthCounts[area] = (growthCounts[area] || 0) + 1;
    });
  });

  const sortedWeaknesses = Object.entries(growthCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([skill]) => skill);

  const topWeakness = sortedWeaknesses[0] || 'Assertiveness & Boundary Setting';
  const recentCategories = [...new Set(recent.map(r => r.category))].join(', ');

  return `User has completed ${sessions.length} prior session(s) (recent average score: ${avgScore}/100). Recurring growth area: "${topWeakness}". Categories practiced: ${recentCategories}. Calibrate the counterpart's skepticism, boundary testing, or hidden agendas to provide targeted practice in this area.`;
}

export function formatSkillName(key: string): string {
  const map: Record<string, string> = {
    executivePresence: 'Executive Presence',
    confidence: 'Confidence',
    emotionalIntelligence: 'Emotional Intelligence',
    listening: 'Active Listening',
    curiosity: 'Curiosity',
    influence: 'Influence',
    assertiveness: 'Assertiveness',
    clarity: 'Clarity & Economy',
    storytelling: 'Storytelling',
    rapport: 'Rapport Building',
    authenticity: 'Authenticity',
    adaptability: 'Adaptability',
    leadership: 'Leadership Stance',
    persuasion: 'Persuasion',
    conflictManagement: 'Conflict Management',
    humor: 'Humor & Defusion',
    trustBuilding: 'Trust Building',
    overallEffectiveness: 'Overall Effectiveness',
  };
  return map[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
}
