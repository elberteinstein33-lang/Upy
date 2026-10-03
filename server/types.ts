export type TrainingCategory = 
  | 'Social'
  | 'Professional'
  | 'Personal'
  | 'Authority'
  | 'Random Scenario';

export type ConversationType =
  | 'Quick Interaction (15-60s)'
  | 'Small Talk'
  | 'Deep Conversation'
  | 'Professional'
  | 'Leadership'
  | 'Negotiation'
  | 'Persuasion & Influence'
  | 'Difficult Conversation'
  | 'Networking'
  | 'Public Speaking'
  | 'Sales'
  | 'Interview'
  | 'Dating & Relationships'
  | 'Crisis Communication'
  | 'Multi-Person Conversation (3-10 characters)'
  | 'Free Conversation (user types all replies, no options)';

export type DifficultyLevel = 
  | 'Beginner'
  | 'Intermediate'
  | 'Advanced'
  | 'Elite'
  | 'Master';

export interface CharacterMeter {
  trust: number;     // 0-100
  interest: number;  // 0-100
  comfort: number;   // 0-100
  trustDelta?: number;
  interestDelta?: number;
  comfortDelta?: number;
  microReaction?: string; // e.g. "Skeptical but listening", "Relaxing shoulders", "Guarded"
}

export interface CharacterState {
  id: string;
  name: string;
  role: string;
  avatarSeed?: string;
  meters: CharacterMeter;
  personality: string;
  communicationStyle: string;
  emotionalState: string;
  hiddenMotive: string;    // Kept secret until analysis!
  hiddenFear: string;      // Kept secret until analysis!
  hiddenPriority: string;  // Kept secret until analysis!
}

export interface ResponseOption {
  id: string;
  strategy: string; // e.g. "Confident", "Warm", "Curious", "Humorous", "Diplomatic", "Strategic Silence", "High-Status", "Boundary Setting"
  text: string;     // Realistic sentence or actionable verbal conduct
}

export interface ScenarioData {
  id: string;
  title: string;
  category: TrainingCategory;
  conversationType: ConversationType;
  difficulty: DifficultyLevel;
  location: string;
  atmosphere: string;
  peopleNearby: string;
  socialContext: string;
  objective: string;
  constraints: string[];
  characters: CharacterState[];
  currentTurnNumber: number;
  openingMessage: {
    characterId: string;
    characterName: string;
    bodyLanguage: string;
    text: string;
  };
  openingOptions: ResponseOption[];
}

export interface MessageRecord {
  id: string;
  sender: 'user' | 'character';
  characterId?: string;
  characterName?: string;
  bodyLanguage?: string;
  text: string;
  strategyUsed?: string;
  characterMetersSnapshot?: Record<string, CharacterMeter>;
  timestamp: number;
}

export interface TurnResponse {
  characterId: string;
  characterName: string;
  bodyLanguage: string;
  text: string;
  interruptionOrSideTalk?: string; // In multi-person mode, another person's reaction or side chatter
  metersUpdate: Record<string, CharacterMeter>;
  isConversationEnded: boolean;
  endReason?: string; // Natural conclusion, lost the person, or objective achieved
  options: ResponseOption[];
}

export interface AnalysisSubscores {
  executivePresence: number;
  confidence: number;
  emotionalIntelligence: number;
  listening: number;
  curiosity: number;
  influence: number;
  assertiveness: number;
  clarity: number;
  storytelling: number;
  rapport: number;
  authenticity: number;
  adaptability: number;
  leadership: number;
  persuasion: number;
  conflictManagement: number;
  humor: number;
  trustBuilding: number;
  overallEffectiveness: number;
}

export interface ChoiceReviewItem {
  turnIndex: number;
  userSaid: string;
  strategyUsed: string;
  outcomeTier: 'Exemplary' | 'Effective' | 'Mixed' | 'Counterproductive';
  whyItWorkedOrFailed: string;
  psychologicalImpactOnCharacter: string;
  counterfactualComparison: string;
  bestStrategyForGoals: {
    forRapport: string;
    forPersuasion: string;
    forAuthority: string;
    forConflictResolution: string;
  };
}

export interface EliteRewriteItem {
  originalUserReply: string;
  contextSituation: string;
  executiveRewrite: { text: string; rationale: string };
  negotiatorRewrite: { text: string; rationale: string };
  diplomatRewrite: { text: string; rationale: string };
  leaderRewrite: { text: string; rationale: string };
}

export interface SessionAnalysis {
  communicationScore: number; // 0-100
  overallAssessment: string;
  subScores: AnalysisSubscores;
  deepPsychologicalBreakdown: {
    whyUserLikelyChoseResponses: string;
    emotionsAndAssumptionsAtPlay: string;
    behavioralPatterns: {
      approvalSeeking: string;
      avoidanceAndDefensiveness: string;
      overexplaining: string;
      dominatingOrInterrupting: string;
      withdrawingOrHesitation: string;
    };
    wordingImpactAnalysis: string;
  };
  choiceByChoiceReview: ChoiceReviewItem[];
  missedOpportunities: Array<{
    category: 'Stronger Question' | 'Rapport Moment' | 'Leadership Stance' | 'Empathy Bridge' | 'Strategic Silence' | 'Humor & Defusion';
    opportunityDescription: string;
    turnReference: string;
    recommendedVerbatim: string;
  }>;
  eliteRewrites: EliteRewriteItem[];
  learningLoop: {
    targetedExercises: Array<{
      exerciseName: string;
      skillTargeted: string;
      instructions: string;
    }>;
    realWorldChallengeForToday: string;
    reflectionQuestion: string;
    corePrincipleToRemember: string;
    recommendedNextScenario: {
      suggestedCategory: TrainingCategory;
      suggestedType: ConversationType;
      suggestedDifficulty: DifficultyLevel;
      strategicRationale: string;
    };
  };
  revealedHiddenInfo: Array<{
    characterId: string;
    characterName: string;
    role: string;
    secretMotive: string;
    secretFear: string;
    unspokenPriority: string;
    howUserBehaviorTriggeredThem: string;
  }>;
}

export interface StoredSession {
  id: string;
  timestamp: number;
  dateStr: string;
  title: string;
  category: TrainingCategory;
  conversationType: ConversationType;
  difficulty: DifficultyLevel;
  userGoal?: string;
  overallScore: number;
  subScores: AnalysisSubscores;
  topStrengths: string[];
  growthAreas: string[];
  turnsCount: number;
  analysisSummary: string;
  fullAnalysis?: SessionAnalysis;
  transcript?: MessageRecord[];
}
