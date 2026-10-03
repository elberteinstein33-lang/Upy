/**
 * Communication Mastery Lab
 * AI-powered, decision-based roleplay simulator training real-world communication skills
 */

import React, { useState, useEffect } from 'react';
import type {
  ScenarioData,
  MessageRecord,
  ResponseOption,
  SessionAnalysis,
  StoredSession,
  TrainingCategory,
  ConversationType,
  DifficultyLevel,
} from '../server/types';
import { Navbar } from './components/Navbar';
import { SetupScreen } from './components/SetupScreen';
import { SimulationScreen } from './components/SimulationScreen';
import { AnalysisScreen } from './components/AnalysisScreen';
import { DashboardScreen } from './components/DashboardScreen';
import {
  generateScenarioApi,
  simulateTurnApi,
  analyzeSimulationApi,
  checkBackendHealth,
} from './services/api';
import {
  getStoredSessions,
  saveSession,
  getAdaptivePastSummary,
} from './services/storage';
import { playTurnArrivedSound, playMeterShiftSound } from './utils/sound';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'setup' | 'simulation' | 'analysis' | 'dashboard'>('setup');
  
  // Simulation State
  const [scenario, setScenario] = useState<ScenarioData | null>(null);
  const [transcript, setTranscript] = useState<MessageRecord[]>([]);
  const [currentOptions, setCurrentOptions] = useState<ResponseOption[]>([]);
  const [isSubmittingTurn, setIsSubmittingTurn] = useState<boolean>(false);
  const [isConversationEnded, setIsConversationEnded] = useState<boolean>(false);
  const [endReason, setEndReason] = useState<string>('');
  
  // Analysis State
  const [currentAnalysis, setCurrentAnalysis] = useState<SessionAnalysis | null>(null);
  const [userSessionGoal, setUserSessionGoal] = useState<string | undefined>(undefined);

  // App-level State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [storedSessions, setStoredSessions] = useState<StoredSession[]>([]);

  // Last turn memory for retry
  const [lastAttemptedReply, setLastAttemptedReply] = useState<{ text: string; strategy?: string } | null>(null);

  // Load stored sessions on mount
  useEffect(() => {
    refreshSessions();
    checkBackendHealth().then((health) => {
      if (!health.hasGeminiKey) {
        console.info('Backend running without GEMINI_API_KEY environment secret configured yet.');
      }
    });
  }, []);

  const refreshSessions = () => {
    setStoredSessions(getStoredSessions());
  };

  // 1. START NEW SIMULATION
  const handleStartSimulation = async (params: {
    category: TrainingCategory;
    conversationType: ConversationType;
    difficulty: DifficultyLevel;
    userGoal?: string;
  }) => {
    setIsLoading(true);
    setErrorMessage(null);
    setUserSessionGoal(params.userGoal);

    try {
      const pastSummary = getAdaptivePastSummary();
      const generatedScenario = await generateScenarioApi({
        category: params.category,
        conversationType: params.conversationType,
        difficulty: params.difficulty,
        userGoal: params.userGoal,
        pastSessionsSummary: pastSummary || undefined,
      });

      setScenario(generatedScenario);
      
      // Initialize transcript with the character's opening message
      const initialOpeningMsg: MessageRecord = {
        id: `msg-open-${Date.now()}`,
        sender: 'character',
        characterId: generatedScenario.openingMessage.characterId,
        characterName: generatedScenario.openingMessage.characterName,
        bodyLanguage: generatedScenario.openingMessage.bodyLanguage,
        text: generatedScenario.openingMessage.text,
        timestamp: Date.now(),
      };

      setTranscript([initialOpeningMsg]);
      setCurrentOptions(generatedScenario.openingOptions || []);
      setIsConversationEnded(false);
      setEndReason('');
      setCurrentAnalysis(null);
      setCurrentScreen('simulation');
      playTurnArrivedSound();
    } catch (err: any) {
      console.error('Error initiating simulation:', err);
      setErrorMessage(err.message || 'Failed to initialize simulation scenario. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. PROCESS USER TURN
  const handleSendReply = async (replyText: string, strategyUsed?: string) => {
    if (!scenario || isSubmittingTurn || isConversationEnded) return;

    setLastAttemptedReply({ text: replyText, strategy: strategyUsed });
    setIsSubmittingTurn(true);
    setErrorMessage(null);

    const userMsg: MessageRecord = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: replyText,
      strategyUsed: strategyUsed || 'Direct',
      timestamp: Date.now(),
    };

    const nextTranscript = [...transcript, userMsg];
    setTranscript(nextTranscript);

    try {
      const turnResult = await simulateTurnApi({
        scenario,
        history: nextTranscript,
        userReply: replyText,
        userStrategy: strategyUsed,
        currentTurn: nextTranscript.filter(m => m.sender === 'user').length,
      });

      // Update character meters in scenario state
      if (turnResult.metersUpdate && Object.keys(turnResult.metersUpdate).length > 0) {
        setScenario(prev => {
          if (!prev) return prev;
          const updatedChars = prev.characters.map(char => {
            const update = turnResult.metersUpdate[char.id];
            if (update) {
              const trustUp = (update.trustDelta || 0) >= 0;
              playMeterShiftSound(trustUp);
              return {
                ...char,
                meters: update,
              };
            }
            return char;
          });
          return {
            ...prev,
            characters: updatedChars,
          };
        });
      }

      // Append counterpart reply
      const charMsg: MessageRecord = {
        id: `msg-char-${Date.now()}`,
        sender: 'character',
        characterId: turnResult.characterId,
        characterName: turnResult.characterName,
        bodyLanguage: turnResult.bodyLanguage,
        text: turnResult.interruptionOrSideTalk 
          ? `${turnResult.text}\n\n[Side dynamic: ${turnResult.interruptionOrSideTalk}]`
          : turnResult.text,
        timestamp: Date.now(),
      };

      setTranscript([...nextTranscript, charMsg]);
      setCurrentOptions(turnResult.options || []);
      playTurnArrivedSound();

      if (turnResult.isConversationEnded) {
        setIsConversationEnded(true);
        setEndReason(turnResult.endReason || 'The interaction has concluded.');
      }
    } catch (err: any) {
      console.error('Error processing turn:', err);
      setErrorMessage(err.message || 'Failed to deliver response. Please retry.');
    } finally {
      setIsSubmittingTurn(false);
    }
  };

  const handleRetryLastTurn = () => {
    if (lastAttemptedReply) {
      handleSendReply(lastAttemptedReply.text, lastAttemptedReply.strategy);
    }
  };

  // 3. END SIMULATION & CONDUCT DEEP ANALYSIS
  const handleEndSimulation = async () => {
    if (!scenario || transcript.length < 2) {
      setCurrentScreen('setup');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const analysisResult = await analyzeSimulationApi({
        scenario,
        history: transcript,
        userGoal: userSessionGoal,
      });

      setCurrentAnalysis(analysisResult);

      // Save into localStorage history
      saveSession(scenario, transcript, analysisResult, userSessionGoal);
      refreshSessions();

      setCurrentScreen('analysis');
    } catch (err: any) {
      console.error('Error analyzing simulation:', err);
      setErrorMessage(err.message || 'Failed to generate deep psychological audit. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. OPEN ARCHIVED SESSION
  const handleOpenStoredSession = (session: StoredSession) => {
    if (session.fullAnalysis && session.transcript) {
      // Reconstruct mock scenario from stored meta
      const restoredScenario: ScenarioData = {
        id: session.id,
        title: session.title,
        category: session.category,
        conversationType: session.conversationType,
        difficulty: session.difficulty,
        location: 'Recorded Training Space',
        atmosphere: 'Archived session',
        peopleNearby: 'Recorded participants',
        socialContext: 'Archived social dynamic',
        objective: session.userGoal || 'Mastery practice',
        constraints: [],
        characters: [],
        currentTurnNumber: session.turnsCount,
        openingMessage: {
          characterId: 'char-1',
          characterName: 'Counterpart',
          bodyLanguage: '',
          text: '',
        },
        openingOptions: [],
      };

      setScenario(restoredScenario);
      setTranscript(session.transcript);
      setCurrentAnalysis(session.fullAnalysis);
      setCurrentScreen('analysis');
    }
  };

  // 5. LAUNCH RECOMMENDED FOLLOW-UP SCENARIO
  const handleLaunchRecommendedScenario = (params: {
    category: TrainingCategory;
    conversationType: ConversationType;
    difficulty: DifficultyLevel;
  }) => {
    handleStartSimulation({
      category: params.category,
      conversationType: params.conversationType,
      difficulty: params.difficulty,
      userGoal: `Adaptive conditioning following up from: ${scenario?.title || 'prior session'}`,
    });
  };

  const handleStartAdaptiveFromDashboard = () => {
    const pastSummary = getAdaptivePastSummary();
    handleStartSimulation({
      category: 'Professional',
      conversationType: 'Negotiation',
      difficulty: 'Advanced',
      userGoal: pastSummary ? 'Focus specifically on past recorded blindspot' : undefined,
    });
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-200">
      <Navbar
        currentScreen={currentScreen}
        onNavigate={(screen) => {
          setErrorMessage(null);
          setCurrentScreen(screen);
        }}
        hasActiveSimulation={Boolean(scenario && transcript.length > 0 && !isConversationEnded)}
        hasCurrentAnalysis={Boolean(currentAnalysis)}
        sessionsCount={storedSessions.length}
      />

      {/* Global Error Banner */}
      {errorMessage && currentScreen !== 'simulation' && (
        <div className="mx-auto max-w-5xl px-4 pt-4">
          <div className="rounded-xl border border-rose-500/40 bg-rose-950/40 p-4 text-xs sm:text-sm text-rose-300 flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs font-mono underline hover:text-white"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Screens */}
      <main className="flex-1">
        {currentScreen === 'setup' && (
          <SetupScreen
            onStartSimulation={handleStartSimulation}
            isLoading={isLoading}
            error={errorMessage}
            pastSummary={getAdaptivePastSummary()}
          />
        )}

        {currentScreen === 'simulation' && scenario && (
          <SimulationScreen
            scenario={scenario}
            transcript={transcript}
            currentOptions={currentOptions}
            isSubmittingTurn={isSubmittingTurn}
            onSendReply={handleSendReply}
            onEndSimulation={handleEndSimulation}
            isConversationEnded={isConversationEnded}
            endReason={endReason}
            errorMessage={errorMessage}
            onRetryLastTurn={handleRetryLastTurn}
          />
        )}

        {currentScreen === 'analysis' && currentAnalysis && scenario && (
          <AnalysisScreen
            scenario={scenario}
            transcript={transcript}
            analysis={currentAnalysis}
            onRestartNewSession={() => setCurrentScreen('setup')}
            onLaunchRecommendedScenario={handleLaunchRecommendedScenario}
          />
        )}

        {currentScreen === 'dashboard' && (
          <DashboardScreen
            sessions={storedSessions}
            onOpenSession={handleOpenStoredSession}
            onRefreshSessions={refreshSessions}
            onStartAdaptiveSession={handleStartAdaptiveFromDashboard}
            onNavigateNew={() => setCurrentScreen('setup')}
          />
        )}
      </main>
    </div>
  );
}
