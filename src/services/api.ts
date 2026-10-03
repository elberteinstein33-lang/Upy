import type { ScenarioData, MessageRecord, TurnResponse, SessionAnalysis, TrainingCategory, ConversationType, DifficultyLevel } from '../../server/types';

export interface GenerateScenarioParams {
  category: TrainingCategory;
  conversationType: ConversationType;
  difficulty: DifficultyLevel;
  userGoal?: string;
  pastSessionsSummary?: string;
}

export interface TurnParams {
  scenario: ScenarioData;
  history: MessageRecord[];
  userReply: string;
  userStrategy?: string;
  currentTurn: number;
}

export interface AnalyzeParams {
  scenario: ScenarioData;
  history: MessageRecord[];
  userGoal?: string;
}

export async function checkBackendHealth(): Promise<{ status: string; hasGeminiKey: boolean }> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (err) {
    console.warn('API health check error:', err);
    return { status: 'offline', hasGeminiKey: false };
  }
}

export async function generateScenarioApi(params: GenerateScenarioParams): Promise<ScenarioData> {
  const res = await fetch('/api/scenario/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Network response was not ok' }));
    throw new Error(errorData.error || errorData.details || `Failed to generate scenario (${res.status})`);
  }

  return await res.json();
}

export async function simulateTurnApi(params: TurnParams): Promise<TurnResponse> {
  const res = await fetch('/api/simulation/turn', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Turn processing failed' }));
    throw new Error(errorData.error || errorData.details || `Failed to process turn (${res.status})`);
  }

  return await res.json();
}

export async function analyzeSimulationApi(params: AnalyzeParams): Promise<SessionAnalysis> {
  const res = await fetch('/api/simulation/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Analysis failed' }));
    throw new Error(errorData.error || errorData.details || `Failed to analyze session (${res.status})`);
  }

  return await res.json();
}
