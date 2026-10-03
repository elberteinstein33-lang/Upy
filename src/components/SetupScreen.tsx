import React, { useState } from 'react';
import {
  Users,
  Briefcase,
  Heart,
  Award,
  Dice5,
  Clock,
  Coffee,
  Sparkles,
  MessageSquare,
  ShieldAlert,
  Handshake,
  TrendingUp,
  AlertCircle,
  Mic2,
  DollarSign,
  UserCheck,
  Zap,
  ArrowRight,
  Brain,
  RotateCcw,
} from 'lucide-react';
import type { TrainingCategory, ConversationType, DifficultyLevel } from '../../server/types';
import { playTacticalClick } from '../utils/sound';

interface SetupScreenProps {
  onStartSimulation: (params: {
    category: TrainingCategory;
    conversationType: ConversationType;
    difficulty: DifficultyLevel;
    userGoal?: string;
  }) => void;
  isLoading: boolean;
  error?: string | null;
  pastSummary?: string;
}

const CATEGORIES: Array<{ id: TrainingCategory; label: string; icon: any; desc: string }> = [
  { id: 'Social', label: 'Social', icon: Coffee, desc: 'Everyday gatherings, acquaintances, social dynamics' },
  { id: 'Professional', label: 'Professional', icon: Briefcase, desc: 'Workplace, cross-functional stakeholders, boardrooms' },
  { id: 'Personal', label: 'Personal', icon: Heart, desc: 'Friends, family, romance, close emotional bonds' },
  { id: 'Authority', label: 'Authority', icon: Award, desc: 'Power imbalances, executives, inspectors, gatekeepers' },
  { id: 'Random Scenario', label: 'Random Scenario', icon: Dice5, desc: 'Unforeseen unpredictable real-world test' },
];

const CONVERSATION_TYPES: Array<{
  id: ConversationType;
  title: string;
  duration: string;
  intensity: 'Standard' | 'Intense' | 'Extreme';
  icon: any;
  desc: string;
}> = [
  {
    id: 'Quick Interaction (15-60s)',
    title: 'Quick Interaction',
    duration: '15-60s',
    intensity: 'Standard',
    icon: Clock,
    desc: 'High-speed corridor or elevator encounter with immediate stakes.',
  },
  {
    id: 'Small Talk',
    title: 'Small Talk',
    duration: '2-4 mins',
    intensity: 'Standard',
    icon: Coffee,
    desc: 'Break conversational ice and pivot naturally into meaningful connection.',
  },
  {
    id: 'Deep Conversation',
    title: 'Deep Conversation',
    duration: '5-10 mins',
    intensity: 'Intense',
    icon: Heart,
    desc: 'Navigate emotional vulnerability, philosophical depth, and unsaid truths.',
  },
  {
    id: 'Professional',
    title: 'Professional',
    duration: '4-8 mins',
    intensity: 'Standard',
    icon: Briefcase,
    desc: 'Strategic alignment, managing expectations, cross-functional diplomacy.',
  },
  {
    id: 'Leadership',
    title: 'Leadership',
    duration: '5-8 mins',
    intensity: 'Intense',
    icon: Award,
    desc: 'Rallying teams, delivering hard decisions, instilling high standard clarity.',
  },
  {
    id: 'Negotiation',
    title: 'Negotiation',
    duration: '6-10 mins',
    intensity: 'Extreme',
    icon: Handshake,
    desc: 'Leverage dynamics, tactical concessions, managing hostile pushback.',
  },
  {
    id: 'Persuasion & Influence',
    title: 'Persuasion & Influence',
    duration: '5-8 mins',
    intensity: 'Intense',
    icon: TrendingUp,
    desc: 'Dismantle resistance and persuade an opposing mindset without friction.',
  },
  {
    id: 'Difficult Conversation',
    title: 'Difficult Conversation',
    duration: '5-8 mins',
    intensity: 'Extreme',
    icon: AlertCircle,
    desc: 'Delivering corrective feedback, setting boundaries, addressing betrayal.',
  },
  {
    id: 'Networking',
    title: 'Networking',
    duration: '3-6 mins',
    intensity: 'Standard',
    icon: Users,
    desc: 'High-status events, building memorable presence without appearing needy.',
  },
  {
    id: 'Public Speaking',
    title: 'Public Speaking & Q&A',
    duration: '4-7 mins',
    intensity: 'Extreme',
    icon: Mic2,
    desc: 'Address skeptical stakeholders or hostile audience members during live Q&A.',
  },
  {
    id: 'Sales',
    title: 'High-Stakes Sales',
    duration: '6-10 mins',
    intensity: 'Intense',
    icon: DollarSign,
    desc: 'Uncover real objections, build value asymmetry, close commitments.',
  },
  {
    id: 'Interview',
    title: 'Executive Interview',
    duration: '5-8 mins',
    intensity: 'Intense',
    icon: UserCheck,
    desc: 'High-pressure behavioral interrogation and cultural stress tests.',
  },
  {
    id: 'Dating & Relationships',
    title: 'Dating & Romance',
    duration: '4-8 mins',
    intensity: 'Intense',
    icon: Sparkles,
    desc: 'Tension, playful banter, emotional boundaries, repairing rupture.',
  },
  {
    id: 'Crisis Communication',
    title: 'Crisis Communication',
    duration: '4-7 mins',
    intensity: 'Extreme',
    icon: ShieldAlert,
    desc: 'High-risk containment when reputation, safety, or millions are on the line.',
  },
  {
    id: 'Multi-Person Conversation (3-10 characters)',
    title: 'Multi-Person Arena',
    duration: '6-12 mins',
    intensity: 'Extreme',
    icon: Users,
    desc: 'Group dynamic: 3-10 characters with divergent agendas, interruptions, side chatter.',
  },
  {
    id: 'Free Conversation (user types all replies, no options)',
    title: 'Free Conversation',
    duration: 'Open',
    intensity: 'Extreme',
    icon: MessageSquare,
    desc: 'Zero assisted options. You type every verbatim sentence completely unassisted.',
  },
];

const DIFFICULTIES: Array<{ id: DifficultyLevel; label: string; desc: string; color: string }> = [
  { id: 'Beginner', label: 'Beginner', desc: 'Predictable reactions, forgiving stakes, open motives', color: 'border-emerald-500/40 text-emerald-400' },
  { id: 'Intermediate', label: 'Intermediate', desc: 'Realistic professional stakes, mild subtext, moderate skepticism', color: 'border-blue-500/40 text-blue-400' },
  { id: 'Advanced', label: 'Advanced', desc: 'Ambiguous verbal cues, hidden agendas, defensive postures', color: 'border-amber-500/40 text-amber-400' },
  { id: 'Elite', label: 'Elite', desc: 'Deep emotional friction, tight time constraints, heavy power imbalances', color: 'border-rose-500/40 text-rose-400' },
  { id: 'Master', label: 'Master', desc: 'Hostile interruptions, volatile stakes, veiled motives, zero margin for error', color: 'border-purple-500/40 text-purple-400' },
];

const SUGGESTED_GOALS = [
  'De-escalate defensive tension without apologizing unnecessarily',
  'Project calm authority without sounding haughty or dismissive',
  'Uncover the hidden objection before making any proposal',
  'Set a firm boundary while maintaining genuine rapport',
  'Handle aggressive interruptions with poise and control',
];

export const SetupScreen: React.FC<SetupScreenProps> = ({
  onStartSimulation,
  isLoading,
  error,
  pastSummary,
}) => {
  const [category, setCategory] = useState<TrainingCategory>('Professional');
  const [conversationType, setConversationType] = useState<ConversationType>('Negotiation');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Advanced');
  const [userGoal, setUserGoal] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playTacticalClick();
    onStartSimulation({
      category,
      conversationType,
      difficulty,
      userGoal: userGoal.trim() || undefined,
    });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Hero Header */}
      <div className="mb-8 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-3 py-1 text-xs font-mono font-medium text-amber-300">
          <Brain className="h-3.5 w-3.5 text-amber-400" />
          <span>REAL-TIME BEHAVIORAL ROLEPLAY SIMULATOR</span>
        </div>
        <h1 className="mt-3 font-display text-2xl sm:text-4xl font-bold tracking-tight text-neutral-100">
          Calibrate Your Next High-Stakes Simulation
        </h1>
        <p className="mt-2 text-sm sm:text-base text-neutral-400 max-w-2xl">
          Every counterpart holds secret fears, unspoken agendas, and nuanced human flaws. Train under genuine psychological resistance.
        </p>
      </div>

      {/* Adaptive Memory Banner if past sessions exist */}
      {pastSummary && (
        <div className="mb-8 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <Zap className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-400" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-300">
                  Adaptive Engine Active
                </span>
                <span className="text-[11px] text-amber-400/80">· Past Performance Memory</span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-neutral-300 leading-relaxed">
                {pastSummary}
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-lg border border-rose-500/40 bg-rose-950/40 p-4 text-sm text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => onStartSimulation({ category, conversationType, difficulty, userGoal })}
            className="flex items-center gap-1 text-xs font-medium text-rose-200 underline hover:text-white cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" /> Retry
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 1. Category */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-300 font-mono">
              1. Training Category
            </h2>
            <span className="text-xs text-neutral-400">Context Framing</span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 sm:gap-3">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = category === cat.id;
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => {
                    playTacticalClick();
                    setCategory(cat.id);
                  }}
                  className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-amber-500/80 bg-amber-500/10 text-neutral-100 shadow-sm shadow-amber-500/10'
                      : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                  }`}
                >
                  <Icon className={`h-5 w-5 mb-2 ${isSelected ? 'text-amber-400' : 'text-neutral-400'}`} />
                  <span className="text-xs sm:text-sm font-semibold">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 2. Conversation Type */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-300 font-mono">
                2. Conversation Type
              </h2>
              <span className="text-xs text-amber-400/90 font-mono">REQUIRED</span>
            </div>
            <span className="text-xs text-neutral-400">{CONVERSATION_TYPES.length} Scenarios Available</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {CONVERSATION_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = conversationType === type.id;
              return (
                <div
                  key={type.id}
                  onClick={() => {
                    playTacticalClick();
                    setConversationType(type.id);
                  }}
                  className={`cursor-pointer rounded-xl border p-4 transition-all relative group flex flex-col justify-between ${
                    isSelected
                      ? 'border-amber-500/80 bg-gradient-to-b from-amber-500/10 to-neutral-900 text-neutral-100 shadow-md shadow-amber-500/5'
                      : 'border-neutral-800/90 bg-neutral-900/50 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-900'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-lg border ${
                          isSelected ? 'border-amber-500/40 bg-amber-500/20 text-amber-300' : 'border-neutral-800 bg-neutral-800 text-neutral-400'
                        }`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <h3 className="text-sm font-semibold text-neutral-100 leading-tight">
                          {type.title}
                        </h3>
                      </div>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                        type.intensity === 'Extreme'
                          ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                          : type.intensity === 'Intense'
                          ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                          : 'border-neutral-700 bg-neutral-800 text-neutral-400'
                      }`}>
                        {type.duration}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      {type.desc}
                    </p>
                  </div>

                  {isSelected && (
                    <div className="mt-3 pt-2 border-t border-amber-500/20 flex items-center justify-between text-[11px] font-mono text-amber-400">
                      <span>SELECTED SCENARIO</span>
                      <span>● ACTIVE</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. Difficulty */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-300 font-mono">
              3. Difficulty Level
            </h2>
            <span className="text-xs text-neutral-400">Emotional Friction & Hidden Motive Depth</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-5">
            {DIFFICULTIES.map((diff) => {
              const isSelected = difficulty === diff.id;
              return (
                <button
                  type="button"
                  key={diff.id}
                  onClick={() => {
                    playTacticalClick();
                    setDifficulty(diff.id);
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? `border-amber-500/80 bg-neutral-900 shadow-sm ${diff.color}`
                      : 'border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:border-neutral-700 hover:text-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase font-bold tracking-wider">
                      {diff.label}
                    </span>
                    {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />}
                  </div>
                  <p className="mt-1.5 text-[11px] text-neutral-400 leading-tight">
                    {diff.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* 4. Optional Goal for this session */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="user-goal" className="text-sm font-semibold uppercase tracking-wider text-neutral-300 font-mono">
              4. Session Objective (Optional)
            </label>
            <span className="text-xs text-neutral-400">What specific skill do you want to test?</span>
          </div>

          <div className="relative">
            <input
              id="user-goal"
              type="text"
              value={userGoal}
              onChange={(e) => setUserGoal(e.target.value)}
              placeholder="e.g. Hold firm on pricing without sounding defensive, or handle multi-person interruption..."
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900/80 px-4 py-3 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-amber-500/70 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
            />
          </div>

          {/* Quick chips */}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-mono text-neutral-500 mr-1">Inspirations:</span>
            {SUGGESTED_GOALS.map((g, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => {
                  playTacticalClick();
                  setUserGoal(g);
                }}
                className="text-[11px] rounded-md border border-neutral-800 bg-neutral-900/60 px-2 py-0.5 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200 transition-colors cursor-pointer"
              >
                + {g}
              </button>
            ))}
          </div>
        </section>

        {/* Start Button */}
        <div className="pt-4 border-t border-neutral-800/80">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 px-6 rounded-xl font-display font-bold text-base sm:text-lg flex items-center justify-center gap-3 transition-all ${
              isLoading
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 shadow-lg shadow-amber-500/20 active:scale-[0.99] cursor-pointer'
            }`}
          >
            {isLoading ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-400 border-t-transparent" />
                <span>Generating High-Stakes Atmosphere & Psychology...</span>
              </>
            ) : (
              <>
                <span>Launch {conversationType} Simulator</span>
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
          <p className="mt-2.5 text-center text-xs text-neutral-500">
            Powered by Gemini 3.8 Flash structured behavioral reasoning. No canned templates.
          </p>
        </div>
      </form>
    </div>
  );
};
