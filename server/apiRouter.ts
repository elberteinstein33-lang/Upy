import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ai, GEMINI_MODEL } from './gemini.ts';
import { SCENARIO_RESPONSE_SCHEMA, SIMULATION_TURN_SCHEMA, ANALYSIS_SCHEMA } from './schemas.ts';
import { SYSTEM_INSTRUCTION, buildScenarioPrompt, buildTurnPrompt, buildAnalysisPrompt } from './promptTemplates.ts';
import type { ScenarioData, CharacterState, CharacterMeter, TurnResponse, SessionAnalysis } from './types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

export const apiRouter = Router();

apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    model: GEMINI_MODEL,
    hasApk: fs.existsSync(path.join(rootDir, 'CommunicationMasteryLab.apk')),
    timestamp: Date.now(),
  });
});

apiRouter.get(['/download-apk', '/apk/download'], (_req: Request, res: Response) => {
  const apkPath = path.join(rootDir, 'CommunicationMasteryLab.apk');
  if (fs.existsSync(apkPath)) {
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.setHeader('Content-Disposition', 'attachment; filename="CommunicationMasteryLab.apk"');
    return res.sendFile(apkPath);
  }
  return res.status(404).json({ error: 'APK not yet generated' });
});

apiRouter.post('/scenario/generate', async (req: Request, res: Response) => {
  try {
    const { category, conversationType, difficulty, userGoal, pastSessionsSummary } = req.body;

    if (!category || !conversationType || !difficulty) {
      return res.status(400).json({ error: 'Missing required scenario parameters' });
    }

    const prompt = buildScenarioPrompt({
      category,
      conversationType,
      difficulty,
      userGoal,
      pastSessionsSummary,
    });

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: SCENARIO_RESPONSE_SCHEMA,
        temperature: 0.85,
      },
    });

    const rawText = response.text || '{}';
    const parsed = JSON.parse(rawText);

    // Map characters to full state
    const characters: CharacterState[] = (parsed.characters || []).map((c: any, index: number) => {
      const initialMeters: CharacterMeter = {
        trust: Math.max(10, Math.min(95, c.initialTrust ?? 50)),
        interest: Math.max(10, Math.min(95, c.initialInterest ?? 50)),
        comfort: Math.max(10, Math.min(95, c.initialComfort ?? 50)),
        microReaction: c.microReaction || 'Attentive',
      };

      return {
        id: c.id || `char-${index + 1}`,
        name: c.name || `Counterpart ${index + 1}`,
        role: c.role || 'Participant',
        avatarSeed: c.name || `char-${index + 1}`,
        meters: initialMeters,
        personality: c.personality || 'Reserved and professional',
        communicationStyle: c.communicationStyle || 'Direct',
        emotionalState: c.emotionalState || 'Neutral',
        hiddenMotive: c.hiddenMotive || 'Evaluating user credibility',
        hiddenFear: c.hiddenFear || 'Wasting time or being manipulated',
        hiddenPriority: c.hiddenPriority || 'Clarity and mutual respect',
      };
    });

    const scenario: ScenarioData = {
      id: `scen-${Date.now()}`,
      title: parsed.title || `${category} Engagement`,
      category,
      conversationType,
      difficulty,
      location: parsed.location || 'Private meeting space',
      atmosphere: parsed.atmosphere || 'Focused atmosphere with quiet ambient background noise.',
      peopleNearby: parsed.peopleNearby || 'A few bystanders within visible distance.',
      socialContext: parsed.socialContext || 'High stakes interaction with clear status differences.',
      objective: parsed.objective || 'Navigate the conversation effectively and build genuine rapport.',
      constraints: parsed.constraints || ['Time is limited', 'Counterpart is attentive to subtle cues'],
      characters,
      currentTurnNumber: 1,
      openingMessage: {
        characterId: parsed.openingMessage?.characterId || characters[0]?.id || 'char-1',
        characterName: parsed.openingMessage?.characterName || characters[0]?.name || 'Counterpart',
        bodyLanguage: parsed.openingMessage?.bodyLanguage || '*observes user thoughtfully*',
        text: parsed.openingMessage?.text || 'Hello. What can I do for you today?',
      },
      openingOptions: (parsed.openingOptions || []).map((opt: any, i: number) => ({
        id: opt.id || `opt-0-${i + 1}`,
        strategy: opt.strategy || 'Diplomatic',
        text: opt.text || 'Good to meet you. Thank you for making time.',
      })),
    };

    res.json(scenario);
  } catch (error: any) {
    console.error('Error generating scenario:', error);
    res.status(500).json({
      error: 'Failed to generate scenario',
      details: error?.message || String(error),
    });
  }
});

apiRouter.post('/simulation/turn', async (req: Request, res: Response) => {
  try {
    const { scenario, history, userReply, userStrategy, currentTurn } = req.body;

    if (!scenario || !history || userReply === undefined) {
      return res.status(400).json({ error: 'Missing turn simulation parameters' });
    }

    const prompt = buildTurnPrompt({
      scenario,
      history,
      userReply,
      userStrategy,
      currentTurn: currentTurn || history.length + 1,
    });

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: SIMULATION_TURN_SCHEMA,
        temperature: 0.8,
      },
    });

    const rawText = response.text || '{}';
    const parsed = JSON.parse(rawText);

    // Format updated meters map
    const metersUpdate: Record<string, CharacterMeter> = {};
    if (Array.isArray(parsed.characterMeters)) {
      parsed.characterMeters.forEach((m: any) => {
        const charId = m.characterId;
        metersUpdate[charId] = {
          trust: Math.max(0, Math.min(100, m.trust ?? 50)),
          interest: Math.max(0, Math.min(100, m.interest ?? 50)),
          comfort: Math.max(0, Math.min(100, m.comfort ?? 50)),
          trustDelta: m.trustDelta || 0,
          interestDelta: m.interestDelta || 0,
          comfortDelta: m.comfortDelta || 0,
          microReaction: m.microReaction || 'Evaluating',
        };
      });
    }

    const turnResult: TurnResponse = {
      characterId: parsed.characterId || scenario.characters[0]?.id || 'char-1',
      characterName: parsed.characterName || scenario.characters[0]?.name || 'Counterpart',
      bodyLanguage: parsed.bodyLanguage || '*pauses and considers your response*',
      text: parsed.text || 'I understand what you are getting at.',
      interruptionOrSideTalk: parsed.interruptionOrSideTalk || '',
      metersUpdate,
      isConversationEnded: Boolean(parsed.isConversationEnded),
      endReason: parsed.endReason || '',
      options: (parsed.options || []).map((opt: any, i: number) => ({
        id: opt.id || `opt-${currentTurn}-${i + 1}`,
        strategy: opt.strategy || 'Confident',
        text: opt.text || 'Let us address that directly.',
      })),
    };

    res.json(turnResult);
  } catch (error: any) {
    console.error('Error generating simulation turn:', error);
    res.status(500).json({
      error: 'Failed to process conversation turn',
      details: error?.message || String(error),
    });
  }
});

apiRouter.post('/simulation/analyze', async (req: Request, res: Response) => {
  try {
    const { scenario, history, userGoal } = req.body;

    if (!scenario || !history) {
      return res.status(400).json({ error: 'Missing simulation data for analysis' });
    }

    const prompt = buildAnalysisPrompt({
      scenario,
      history,
      userGoal,
    });

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: ANALYSIS_SCHEMA,
        temperature: 0.5,
      },
    });

    const rawText = response.text || '{}';
    const parsed: SessionAnalysis = JSON.parse(rawText);

    res.json(parsed);
  } catch (error: any) {
    console.error('Error analyzing simulation:', error);
    res.status(500).json({
      error: 'Failed to complete analysis',
      details: error?.message || String(error),
    });
  }
});
