import { Type } from '@google/genai';

export const SCENARIO_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: 'Short evocative title for the simulation scenario' },
    location: { type: Type.STRING, description: 'Specific environment and setting' },
    atmosphere: { type: Type.STRING, description: 'Atmosphere with rich sensory details (lighting, acoustics, temperature, tension)' },
    peopleNearby: { type: Type.STRING, description: 'Bystanders, colleagues, or environmental presence' },
    socialContext: { type: Type.STRING, description: 'Relationship history, status differentials, stakes, and dynamics' },
    objective: { type: Type.STRING, description: 'The user’s primary target or conversational win condition' },
    constraints: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '2-4 realistic social, situational, or time constraints'
    },
    characters: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          role: { type: Type.STRING },
          initialTrust: { type: Type.INTEGER, description: 'Starting trust 0-100' },
          initialInterest: { type: Type.INTEGER, description: 'Starting interest 0-100' },
          initialComfort: { type: Type.INTEGER, description: 'Starting comfort 0-100' },
          personality: { type: Type.STRING },
          communicationStyle: { type: Type.STRING },
          emotionalState: { type: Type.STRING },
          hiddenMotive: { type: Type.STRING, description: 'Unspoken private motive kept secret until final analysis' },
          hiddenFear: { type: Type.STRING, description: 'Private vulnerability or fear' },
          hiddenPriority: { type: Type.STRING, description: 'What they actually care about most right now' },
          microReaction: { type: Type.STRING, description: 'Current nonverbal poise' }
        },
        required: [
          'id', 'name', 'role', 'initialTrust', 'initialInterest', 'initialComfort',
          'personality', 'communicationStyle', 'emotionalState',
          'hiddenMotive', 'hiddenFear', 'hiddenPriority', 'microReaction'
        ]
      }
    },
    openingMessage: {
      type: Type.OBJECT,
      properties: {
        characterId: { type: Type.STRING },
        characterName: { type: Type.STRING },
        bodyLanguage: { type: Type.STRING, description: 'Action/body-language description, e.g. *checks phone without looking up*' },
        text: { type: Type.STRING, description: 'The opening line spoken directly to the user' }
      },
      required: ['characterId', 'characterName', 'bodyLanguage', 'text']
    },
    openingOptions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          strategy: { type: Type.STRING, description: 'Strategy label like Confident, Warm, Curious, Humorous, Diplomatic, Strategic Silence, High-Status, Playful, Boundary Setting' },
          text: { type: Type.STRING, description: 'Realistic verbatim sentence or action user could take' }
        },
        required: ['id', 'strategy', 'text']
      },
      description: '4 to 5 distinctly different options varying in length, posture, tone, and strategic direction'
    }
  },
  required: [
    'title', 'location', 'atmosphere', 'peopleNearby', 'socialContext',
    'objective', 'constraints', 'characters', 'openingMessage', 'openingOptions'
  ]
};

export const SIMULATION_TURN_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    characterId: { type: Type.STRING },
    characterName: { type: Type.STRING },
    bodyLanguage: { type: Type.STRING, description: 'Action/body-language description in italics, e.g. *glances toward the exit, crossing arms*' },
    text: { type: Type.STRING, description: 'Natural spoken dialogue. Realistic human behavior: hesitation, sarcasm, deflection, genuine response' },
    interruptionOrSideTalk: { type: Type.STRING, description: 'Optional: In multi-person or high-distraction scenarios, another character cutting in or side remark. Empty string if none.' },
    characterMeters: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          characterId: { type: Type.STRING },
          trust: { type: Type.INTEGER, description: 'Updated trust 0-100' },
          interest: { type: Type.INTEGER, description: 'Updated interest 0-100' },
          comfort: { type: Type.INTEGER, description: 'Updated comfort 0-100' },
          trustDelta: { type: Type.INTEGER, description: 'Change from previous turn, e.g. -5, 0, +8' },
          interestDelta: { type: Type.INTEGER, description: 'Change from previous turn' },
          comfortDelta: { type: Type.INTEGER, description: 'Change from previous turn' },
          microReaction: { type: Type.STRING, description: 'Subtle micro-reaction clue, e.g. Guarded, Intrigued, Wary, Respectful' }
        },
        required: ['characterId', 'trust', 'interest', 'comfort', 'trustDelta', 'interestDelta', 'comfortDelta', 'microReaction']
      }
    },
    isConversationEnded: { type: Type.BOOLEAN, description: 'True if conversation naturally concluded, reached its climax, or user lost the person' },
    endReason: { type: Type.STRING, description: 'Reason for conclusion if ended, otherwise empty string' },
    options: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          strategy: { type: Type.STRING, description: 'Strategy label (e.g. Confident, Warm, Curious, Humorous, Diplomatic, Analytical, High-Status, Strategic Silence, Blunt Disagreement, Disarming Vulnerability)' },
          text: { type: Type.STRING, description: 'Realistic verbatim sentence or action to take. Different lengths and directions' }
        },
        required: ['id', 'strategy', 'text']
      },
      description: '4 to 5 fresh, distinct response options generated specifically for this turn'
    }
  },
  required: ['characterId', 'characterName', 'bodyLanguage', 'text', 'interruptionOrSideTalk', 'characterMeters', 'isConversationEnded', 'endReason', 'options']
};

export const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    communicationScore: { type: Type.INTEGER, description: 'Overall communication score 0-100' },
    overallAssessment: { type: Type.STRING, description: 'Executive summary of how the conversation was handled based strictly on observed actions' },
    subScores: {
      type: Type.OBJECT,
      properties: {
        executivePresence: { type: Type.INTEGER },
        confidence: { type: Type.INTEGER },
        emotionalIntelligence: { type: Type.INTEGER },
        listening: { type: Type.INTEGER },
        curiosity: { type: Type.INTEGER },
        influence: { type: Type.INTEGER },
        assertiveness: { type: Type.INTEGER },
        clarity: { type: Type.INTEGER },
        storytelling: { type: Type.INTEGER },
        rapport: { type: Type.INTEGER },
        authenticity: { type: Type.INTEGER },
        adaptability: { type: Type.INTEGER },
        leadership: { type: Type.INTEGER },
        persuasion: { type: Type.INTEGER },
        conflictManagement: { type: Type.INTEGER },
        humor: { type: Type.INTEGER },
        trustBuilding: { type: Type.INTEGER },
        overallEffectiveness: { type: Type.INTEGER }
      },
      required: [
        'executivePresence', 'confidence', 'emotionalIntelligence', 'listening',
        'curiosity', 'influence', 'assertiveness', 'clarity', 'storytelling',
        'rapport', 'authenticity', 'adaptability', 'leadership', 'persuasion',
        'conflictManagement', 'humor', 'trustBuilding', 'overallEffectiveness'
      ]
    },
    deepPsychologicalBreakdown: {
      type: Type.OBJECT,
      properties: {
        whyUserLikelyChoseResponses: { type: Type.STRING, description: 'Psychological drivers behind choices based on evidence in the session' },
        emotionsAndAssumptionsAtPlay: { type: Type.STRING, description: 'Inferred assumptions and cognitive framing observed' },
        behavioralPatterns: {
          type: Type.OBJECT,
          properties: {
            approvalSeeking: { type: Type.STRING, description: 'Analysis of any approval-seeking habits or absence thereof' },
            avoidanceAndDefensiveness: { type: Type.STRING, description: 'Analysis of avoidance or defensiveness triggers' },
            overexplaining: { type: Type.STRING, description: 'Analysis of word economy and overjustification tendencies' },
            dominatingOrInterrupting: { type: Type.STRING, description: 'Analysis of space-taking, dominance or conversational balance' },
            withdrawingOrHesitation: { type: Type.STRING, description: 'Analysis of passivity, timidness, or hesitation' }
          },
          required: ['approvalSeeking', 'avoidanceAndDefensiveness', 'overexplaining', 'dominatingOrInterrupting', 'withdrawingOrHesitation']
        },
        wordingImpactAnalysis: { type: Type.STRING, description: 'How exact diction and vocal phrasing shifted other characters’ defensive guards or warmth' }
      },
      required: ['whyUserLikelyChoseResponses', 'emotionsAndAssumptionsAtPlay', 'behavioralPatterns', 'wordingImpactAnalysis']
    },
    choiceByChoiceReview: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          turnIndex: { type: Type.INTEGER },
          userSaid: { type: Type.STRING },
          strategyUsed: { type: Type.STRING },
          outcomeTier: { type: Type.STRING, description: 'Exemplary, Effective, Mixed, or Counterproductive' },
          whyItWorkedOrFailed: { type: Type.STRING },
          psychologicalImpactOnCharacter: { type: Type.STRING },
          counterfactualComparison: { type: Type.STRING, description: 'What would have unfolded if user had chosen an alternative path' },
          bestStrategyForGoals: {
            type: Type.OBJECT,
            properties: {
              forRapport: { type: Type.STRING },
              forPersuasion: { type: Type.STRING },
              forAuthority: { type: Type.STRING },
              forConflictResolution: { type: Type.STRING }
            },
            required: ['forRapport', 'forPersuasion', 'forAuthority', 'forConflictResolution']
          }
        },
        required: [
          'turnIndex', 'userSaid', 'strategyUsed', 'outcomeTier',
          'whyItWorkedOrFailed', 'psychologicalImpactOnCharacter',
          'counterfactualComparison', 'bestStrategyForGoals'
        ]
      }
    },
    missedOpportunities: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING, description: 'Stronger Question, Rapport Moment, Leadership Stance, Empathy Bridge, Strategic Silence, or Humor & Defusion' },
          opportunityDescription: { type: Type.STRING },
          turnReference: { type: Type.STRING },
          recommendedVerbatim: { type: Type.STRING, description: 'Exact words or strategic stance that would have unlocked deeper outcomes' }
        },
        required: ['category', 'opportunityDescription', 'turnReference', 'recommendedVerbatim']
      }
    },
    eliteRewrites: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          originalUserReply: { type: Type.STRING },
          contextSituation: { type: Type.STRING },
          executiveRewrite: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              rationale: { type: Type.STRING }
            },
            required: ['text', 'rationale']
          },
          negotiatorRewrite: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              rationale: { type: Type.STRING }
            },
            required: ['text', 'rationale']
          },
          diplomatRewrite: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              rationale: { type: Type.STRING }
            },
            required: ['text', 'rationale']
          },
          leaderRewrite: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              rationale: { type: Type.STRING }
            },
            required: ['text', 'rationale']
          }
        },
        required: ['originalUserReply', 'contextSituation', 'executiveRewrite', 'negotiatorRewrite', 'diplomatRewrite', 'leaderRewrite']
      },
      description: 'The 3 weakest or most suboptimal user replies rewritten into 4 elite personas'
    },
    learningLoop: {
      type: Type.OBJECT,
      properties: {
        targetedExercises: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              exerciseName: { type: Type.STRING },
              skillTargeted: { type: Type.STRING },
              instructions: { type: Type.STRING }
            },
            required: ['exerciseName', 'skillTargeted', 'instructions']
          },
          description: '3 targeted high-yield exercises'
        },
        realWorldChallengeForToday: { type: Type.STRING, description: '1 concrete low-stakes challenge to practice in real life today' },
        reflectionQuestion: { type: Type.STRING, description: '1 penetrating self-reflection question' },
        corePrincipleToRemember: { type: Type.STRING, description: '1 foundational communication axiom distilled from this session' },
        recommendedNextScenario: {
          type: Type.OBJECT,
          properties: {
            suggestedCategory: { type: Type.STRING },
            suggestedType: { type: Type.STRING },
            suggestedDifficulty: { type: Type.STRING },
            strategicRationale: { type: Type.STRING }
          },
          required: ['suggestedCategory', 'suggestedType', 'suggestedDifficulty', 'strategicRationale']
        }
      },
      required: ['targetedExercises', 'realWorldChallengeForToday', 'reflectionQuestion', 'corePrincipleToRemember', 'recommendedNextScenario']
    },
    revealedHiddenInfo: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          characterId: { type: Type.STRING },
          characterName: { type: Type.STRING },
          role: { type: Type.STRING },
          secretMotive: { type: Type.STRING },
          secretFear: { type: Type.STRING },
          unspokenPriority: { type: Type.STRING },
          howUserBehaviorTriggeredThem: { type: Type.STRING }
        },
        required: ['characterId', 'characterName', 'role', 'secretMotive', 'secretFear', 'unspokenPriority', 'howUserBehaviorTriggeredThem']
      },
      description: 'Reveals the secret motives and fears that were hidden during the simulation'
    }
  },
  required: [
    'communicationScore', 'overallAssessment', 'subScores',
    'deepPsychologicalBreakdown', 'choiceByChoiceReview',
    'missedOpportunities', 'eliteRewrites', 'learningLoop', 'revealedHiddenInfo'
  ]
};
