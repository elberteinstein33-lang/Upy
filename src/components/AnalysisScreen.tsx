import React, { useState } from 'react';
import {
  Award,
  TrendingUp,
  Brain,
  Sparkles,
  ArrowRight,
  Eye,
  Lock,
  Unlock,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  ChevronRight,
  Flame,
  Shield,
  Zap,
  Target,
  FileText,
  RotateCcw,
} from 'lucide-react';
import type { SessionAnalysis, ScenarioData, MessageRecord, TrainingCategory, ConversationType, DifficultyLevel } from '../../server/types';
import { formatSkillName } from '../services/storage';
import { playTacticalClick } from '../utils/sound';

interface AnalysisScreenProps {
  scenario: ScenarioData;
  transcript: MessageRecord[];
  analysis: SessionAnalysis;
  onRestartNewSession: () => void;
  onLaunchRecommendedScenario: (params: {
    category: TrainingCategory;
    conversationType: ConversationType;
    difficulty: DifficultyLevel;
  }) => void;
}

export const AnalysisScreen: React.FC<AnalysisScreenProps> = ({
  scenario,
  transcript,
  analysis,
  onRestartNewSession,
  onLaunchRecommendedScenario,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'psychology' | 'choiceReview' | 'missedOpportunities' | 'eliteRewrites' | 'learningLoop' | 'hiddenMotives'
  >('overview');

  const [expandedChoiceTurn, setExpandedChoiceTurn] = useState<number | null>(1);
  const [expandedRewriteIndex, setExpandedRewriteIndex] = useState<number>(0);
  const [skillFilter, setSkillFilter] = useState<'all' | 'high' | 'growth'>('all');

  const subScores = analysis.subScores || {};
  const subScoreList = Object.entries(subScores).map(([key, score]) => ({
    key,
    name: formatSkillName(key),
    score: Number(score) || 0,
  }));

  const filteredSubscores = subScoreList.filter(s => {
    if (skillFilter === 'high') return s.score >= 75;
    if (skillFilter === 'growth') return s.score < 70;
    return true;
  });

  // Calculate radar chart coordinates for the 18 sub-scores
  const radarPoints = subScoreList.map((item, i) => {
    const angle = (Math.PI * 2 / subScoreList.length) * i - Math.PI / 2;
    const r = (item.score / 100) * 110;
    const x = 140 + r * Math.cos(angle);
    const y = 140 + r * Math.sin(angle);
    return { x, y, ...item, angle };
  });

  const radarPolygonPath = radarPoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Top Header Card */}
      <div className="mb-6 rounded-2xl border border-neutral-800 bg-gradient-to-br from-neutral-900 via-neutral-950 to-amber-950/20 p-5 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-amber-400">
                AUDIT COMPLETE
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                {scenario.category} · {scenario.conversationType} · {scenario.difficulty}
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-neutral-100">
              {scenario.title}
            </h1>

            <p className="text-sm text-neutral-300 max-w-2xl leading-relaxed">
              {analysis.overallAssessment}
            </p>
          </div>

          {/* Master Score Display */}
          <div className="flex flex-shrink-0 items-center gap-4 rounded-xl border border-neutral-800 bg-neutral-900/90 p-4 sm:p-5">
            <div className="relative flex h-20 w-20 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-neutral-800 stroke-current"
                  strokeWidth="3.5"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={`stroke-current ${
                    analysis.communicationScore >= 80 ? 'text-amber-400' : analysis.communicationScore >= 60 ? 'text-sky-400' : 'text-rose-400'
                  }`}
                  strokeWidth="3.5"
                  strokeDasharray={`${analysis.communicationScore}, 100`}
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="font-mono text-2xl font-bold text-neutral-100">
                  {analysis.communicationScore}
                </span>
                <span className="text-[9px] font-mono text-neutral-400">/ 100</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-mono uppercase tracking-wider font-semibold text-neutral-400 block">
                Mastery Rating
              </span>
              <span className={`text-base font-bold font-display ${
                analysis.communicationScore >= 85 ? 'text-amber-400' : analysis.communicationScore >= 70 ? 'text-sky-400' : 'text-neutral-300'
              }`}>
                {analysis.communicationScore >= 90 ? 'Executive Mastery' : analysis.communicationScore >= 80 ? 'Commanding & Influential' : analysis.communicationScore >= 65 ? 'Competent with Blindspots' : 'Needs Tactical Realignment'}
              </span>
              <span className="text-[11px] text-neutral-500 font-mono block mt-0.5">
                {transcript.filter(t => t.sender === 'user').length} conversational decisions analyzed
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 flex flex-wrap gap-1.5 border-t border-neutral-800/80 pt-4">
          {[
            { id: 'overview', label: '18 Competencies & Radar' },
            { id: 'psychology', label: 'Psychological Breakdown' },
            { id: 'choiceReview', label: 'Choice-by-Choice Review' },
            { id: 'missedOpportunities', label: 'Missed Opportunities' },
            { id: 'eliteRewrites', label: '4-Way Elite Rewrites' },
            { id: 'hiddenMotives', label: 'Hidden Agendas Revealed' },
            { id: 'learningLoop', label: 'Next Action & Loop' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                playTacticalClick();
                setActiveTab(tab.id as any);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB CONTENT */}

      {/* 1. OVERVIEW: 18 COMPETENCIES + RADAR */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Radar Chart Visualizer */}
            <div className="lg:col-span-5 rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 flex flex-col items-center justify-center">
              <div className="text-center mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
                  18-Dimensional Competency Polygon
                </span>
                <p className="text-[11px] text-neutral-400">
                  Visual balance across Presence, Empathy, Strategy & Control
                </p>
              </div>

              <div className="relative w-[280px] h-[280px]">
                <svg className="w-full h-full" viewBox="0 0 280 280">
                  {/* Concentric guide circles */}
                  {[0.25, 0.5, 0.75, 1.0].map((step, idx) => (
                    <circle
                      key={idx}
                      cx="140"
                      cy="140"
                      r={110 * step}
                      fill="none"
                      stroke="#262626"
                      strokeWidth="1"
                      strokeDasharray={step < 1.0 ? '2,2' : undefined}
                    />
                  ))}

                  {/* Spokes */}
                  {radarPoints.map((pt, idx) => {
                    const outerX = 140 + 110 * Math.cos(pt.angle);
                    const outerY = 140 + 110 * Math.sin(pt.angle);
                    return (
                      <line
                        key={idx}
                        x1="140"
                        y1="140"
                        x2={outerX}
                        y2={outerY}
                        stroke="#262626"
                        strokeWidth="1"
                      />
                    );
                  })}

                  {/* Shaded polygon */}
                  <polygon
                    points={radarPolygonPath}
                    fill="rgba(245, 158, 11, 0.25)"
                    stroke="#f59e0b"
                    strokeWidth="2"
                  />

                  {/* Data points */}
                  {radarPoints.map((pt, idx) => (
                    <circle
                      key={idx}
                      cx={pt.x}
                      cy={pt.y}
                      r="3"
                      fill="#fbbf24"
                      className="hover:r-4 transition-all"
                    />
                  ))}
                </svg>
              </div>
            </div>

            {/* Sub-scores Bar Breakdown */}
            <div className="lg:col-span-7 rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono uppercase tracking-wider text-neutral-300 font-semibold">
                  Competency Scoreboard ({subScoreList.length} Metrics)
                </span>
                
                {/* Segmented Filter */}
                <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
                  <button
                    onClick={() => setSkillFilter('all')}
                    className={`px-2 py-0.5 text-[11px] font-mono rounded transition-colors cursor-pointer ${
                      skillFilter === 'all' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    All ({subScoreList.length})
                  </button>
                  <button
                    onClick={() => setSkillFilter('high')}
                    className={`px-2 py-0.5 text-[11px] font-mono rounded transition-colors cursor-pointer ${
                      skillFilter === 'high' ? 'bg-amber-500/20 text-amber-300' : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    Strengths (&ge;75)
                  </button>
                  <button
                    onClick={() => setSkillFilter('growth')}
                    className={`px-2 py-0.5 text-[11px] font-mono rounded transition-colors cursor-pointer ${
                      skillFilter === 'growth' ? 'bg-rose-500/20 text-rose-300' : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    Growth Areas (&lt;70)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 max-h-[380px] overflow-y-auto pr-2">
                {filteredSubscores.map(item => (
                  <div key={item.key} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-neutral-300 truncate max-w-[180px]">
                        {item.name}
                      </span>
                      <span className="font-mono font-semibold text-neutral-200">
                        {item.score}/100
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-neutral-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          item.score >= 80 ? 'bg-amber-400' : item.score >= 65 ? 'bg-sky-400' : 'bg-rose-400'
                        }`}
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. DEEP PSYCHOLOGICAL BREAKDOWN */}
      {activeTab === 'psychology' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 sm:p-6 space-y-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold block mb-1">
                Drivers & Internal Framing
              </span>
              <h3 className="text-base font-semibold text-neutral-100 mb-2">
                Why You Chose These Exact Responses
              </h3>
              <p className="text-sm text-neutral-300 leading-relaxed font-sans">
                {analysis.deepPsychologicalBreakdown.whyUserLikelyChoseResponses}
              </p>
            </div>

            <div className="border-t border-neutral-800/80 pt-4">
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold block mb-1">
                Cognitive Biases & Assumptions
              </span>
              <h3 className="text-base font-semibold text-neutral-100 mb-2">
                Emotions & Perceptual Filters In Play
              </h3>
              <p className="text-sm text-neutral-300 leading-relaxed">
                {analysis.deepPsychologicalBreakdown.emotionsAndAssumptionsAtPlay}
              </p>
            </div>

            <div className="border-t border-neutral-800/80 pt-4">
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold block mb-3">
                Core Behavioral Pattern Audit
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(analysis.deepPsychologicalBreakdown.behavioralPatterns || {}).map(([patternKey, text]) => (
                  <div key={patternKey} className="rounded-lg border border-neutral-800 bg-neutral-950/70 p-3.5 space-y-1">
                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-300 block">
                      {patternKey.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      {text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-neutral-800/80 pt-4">
              <span className="text-xs font-mono uppercase tracking-wider text-sky-400 font-semibold block mb-1">
                Micro-Linguistic Diction Analysis
              </span>
              <h3 className="text-base font-semibold text-neutral-100 mb-2">
                How Your Specific Wording Shifted Reactions
              </h3>
              <p className="text-sm text-neutral-300 leading-relaxed">
                {analysis.deepPsychologicalBreakdown.wordingImpactAnalysis}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. CHOICE-BY-CHOICE REVIEW */}
      {activeTab === 'choiceReview' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
              Chronological Audit ({analysis.choiceByChoiceReview?.length || 0} Decision Points)
            </span>
          </div>

          <div className="space-y-3">
            {(analysis.choiceByChoiceReview || []).map((review) => {
              const isExpanded = expandedChoiceTurn === review.turnIndex;
              return (
                <div
                  key={review.turnIndex}
                  className="rounded-xl border border-neutral-800 bg-neutral-900/60 overflow-hidden transition-all"
                >
                  <div
                    onClick={() => {
                      playTacticalClick();
                      setExpandedChoiceTurn(isExpanded ? null : review.turnIndex);
                    }}
                    className="flex cursor-pointer items-center justify-between p-4 hover:bg-neutral-850 transition-colors"
                  >
                    <div className="flex items-center gap-3 truncate pr-2">
                      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-neutral-800 font-mono text-xs font-bold text-amber-400">
                        #{review.turnIndex}
                      </span>
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-semibold text-amber-300">
                            [{review.strategyUsed}]
                          </span>
                          <span className={`text-[10px] font-mono px-2 py-0.2 rounded border ${
                            review.outcomeTier === 'Exemplary'
                              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                              : review.outcomeTier === 'Effective'
                              ? 'border-sky-500/40 bg-sky-500/10 text-sky-300'
                              : review.outcomeTier === 'Mixed'
                              ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                              : 'border-rose-500/40 bg-rose-500/10 text-rose-300'
                          }`}>
                            {review.outcomeTier}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-300 truncate mt-0.5 italic">
                          &ldquo;{review.userSaid}&rdquo;
                        </p>
                      </div>
                    </div>

                    <div className="text-neutral-500 text-xs font-mono">
                      {isExpanded ? 'Collapse' : 'Details →'}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-neutral-800 bg-neutral-950/70 p-4 sm:p-5 space-y-4 animate-in fade-in duration-150">
                      <div>
                        <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold block mb-1">
                          Why It Succeeded Or Failed
                        </span>
                        <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed">
                          {review.whyItWorkedOrFailed}
                        </p>
                      </div>

                      <div>
                        <span className="text-xs font-mono uppercase tracking-wider text-sky-400 font-semibold block mb-1">
                          Psychological Impact On Counterpart
                        </span>
                        <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                          {review.psychologicalImpactOnCharacter}
                        </p>
                      </div>

                      <div>
                        <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold block mb-1">
                          Counterfactual: What If You Took Alternative Path?
                        </span>
                        <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                          {review.counterfactualComparison}
                        </p>
                      </div>

                      {/* Best Strategy for each goal */}
                      {review.bestStrategyForGoals && (
                        <div className="border-t border-neutral-800/80 pt-3">
                          <span className="text-xs font-mono uppercase tracking-wider text-amber-300 font-semibold block mb-2">
                            Optimal Path Breakdown By Tactical Aim:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div className="p-2.5 rounded-lg border border-neutral-800 bg-neutral-900/40">
                              <span className="font-mono text-[10px] text-amber-400 uppercase font-semibold block">For Rapport & Warmth:</span>
                              <span className="text-neutral-300 mt-0.5 block">{review.bestStrategyForGoals.forRapport}</span>
                            </div>
                            <div className="p-2.5 rounded-lg border border-neutral-800 bg-neutral-900/40">
                              <span className="font-mono text-[10px] text-sky-400 uppercase font-semibold block">For Persuasion & Buy-in:</span>
                              <span className="text-neutral-300 mt-0.5 block">{review.bestStrategyForGoals.forPersuasion}</span>
                            </div>
                            <div className="p-2.5 rounded-lg border border-neutral-800 bg-neutral-900/40">
                              <span className="font-mono text-[10px] text-purple-400 uppercase font-semibold block">For Frame & Authority:</span>
                              <span className="text-neutral-300 mt-0.5 block">{review.bestStrategyForGoals.forAuthority}</span>
                            </div>
                            <div className="p-2.5 rounded-lg border border-neutral-800 bg-neutral-900/40">
                              <span className="font-mono text-[10px] text-emerald-400 uppercase font-semibold block">For De-escalation & Conflict:</span>
                              <span className="text-neutral-300 mt-0.5 block">{review.bestStrategyForGoals.forConflictResolution}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. MISSED OPPORTUNITIES */}
      {activeTab === 'missedOpportunities' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
              High-Leverage Pivot Points You Overlooked
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(analysis.missedOpportunities || []).map((opp, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-5 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-semibold uppercase text-amber-400 border border-amber-500/30 rounded px-2 py-0.5 bg-amber-500/10">
                      {opp.category}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500">
                      {opp.turnReference}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                    {opp.opportunityDescription}
                  </p>
                </div>

                <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3">
                  <span className="text-[10px] font-mono text-amber-400 uppercase font-bold block mb-1">
                    Elite Verbatim Execution:
                  </span>
                  <p className="text-xs text-neutral-200 italic font-serif leading-relaxed">
                    &ldquo;{opp.recommendedVerbatim}&rdquo;
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. ELITE REWRITES */}
      {activeTab === 'eliteRewrites' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
              Your 3 Weakest Decisional Moments Rewritten By 4 Master Archetypes
            </span>
          </div>

          {/* Sub-selector for the 3 weak replies */}
          <div className="flex flex-wrap gap-2">
            {(analysis.eliteRewrites || []).map((rw, idx) => (
              <button
                key={idx}
                onClick={() => {
                  playTacticalClick();
                  setExpandedRewriteIndex(idx);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                  expandedRewriteIndex === idx
                    ? 'bg-neutral-800 text-amber-300 border border-amber-500/40'
                    : 'bg-neutral-900/60 text-neutral-400 border border-neutral-800 hover:text-neutral-200'
                }`}
              >
                Weakness Case #{idx + 1}
              </button>
            ))}
          </div>

          {/* Active Rewrite Case */}
          {analysis.eliteRewrites?.[expandedRewriteIndex] && (
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 sm:p-6 space-y-6">
              {/* Original Weak Reply Card */}
              <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-rose-400 block mb-1">
                  Your Original Suboptimal Delivery:
                </span>
                <p className="text-sm font-semibold text-rose-200 italic font-serif">
                  &ldquo;{analysis.eliteRewrites[expandedRewriteIndex].originalUserReply}&rdquo;
                </p>
                <p className="text-xs text-neutral-400 mt-2">
                  Context: {analysis.eliteRewrites[expandedRewriteIndex].contextSituation}
                </p>
              </div>

              {/* 4 Persona Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Respected Executive */}
                <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase text-amber-400">
                      1. Respected Executive
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500">Calm Frame & Authority</span>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-200 font-serif italic border-l-2 border-amber-400 pl-2.5">
                    &ldquo;{analysis.eliteRewrites[expandedRewriteIndex].executiveRewrite.text}&rdquo;
                  </p>
                  <p className="text-xs text-neutral-400 pt-1 leading-relaxed">
                    {analysis.eliteRewrites[expandedRewriteIndex].executiveRewrite.rationale}
                  </p>
                </div>

                {/* 2. Experienced Negotiator */}
                <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase text-sky-400">
                      2. Experienced Negotiator
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500">Tactical Labeling & Leverage</span>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-200 font-serif italic border-l-2 border-sky-400 pl-2.5">
                    &ldquo;{analysis.eliteRewrites[expandedRewriteIndex].negotiatorRewrite.text}&rdquo;
                  </p>
                  <p className="text-xs text-neutral-400 pt-1 leading-relaxed">
                    {analysis.eliteRewrites[expandedRewriteIndex].negotiatorRewrite.rationale}
                  </p>
                </div>

                {/* 3. Skilled Diplomat */}
                <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase text-emerald-400">
                      3. Skilled Diplomat
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500">Face-Saving & Bridge</span>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-200 font-serif italic border-l-2 border-emerald-400 pl-2.5">
                    &ldquo;{analysis.eliteRewrites[expandedRewriteIndex].diplomatRewrite.text}&rdquo;
                  </p>
                  <p className="text-xs text-neutral-400 pt-1 leading-relaxed">
                    {analysis.eliteRewrites[expandedRewriteIndex].diplomatRewrite.rationale}
                  </p>
                </div>

                {/* 4. Charismatic Leader */}
                <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase text-purple-400">
                      4. Charismatic Leader
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500">Inspirational & Disarming</span>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-200 font-serif italic border-l-2 border-purple-400 pl-2.5">
                    &ldquo;{analysis.eliteRewrites[expandedRewriteIndex].leaderRewrite.text}&rdquo;
                  </p>
                  <p className="text-xs text-neutral-400 pt-1 leading-relaxed">
                    {analysis.eliteRewrites[expandedRewriteIndex].leaderRewrite.rationale}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. HIDDEN AGENDAS REVEALED */}
      {activeTab === 'hiddenMotives' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
              The Unspoken Underworld: Secret Motives Revealed
            </span>
            <p className="text-xs text-neutral-400 mt-0.5">
              During the live simulation, these agendas were concealed. Here is what was actually driving them:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(analysis.revealedHiddenInfo || []).map((info, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-amber-500/30 bg-neutral-900/80 p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Unlock className="h-4 w-4 text-amber-400" />
                    <span className="font-display font-bold text-neutral-100 text-sm">
                      {info.characterName}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-neutral-400">
                    {info.role}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg border border-neutral-800 bg-neutral-950">
                    <span className="font-mono text-[10px] text-amber-400 uppercase font-semibold block">
                      Secret Hidden Motive:
                    </span>
                    <p className="text-neutral-200 mt-0.5">{info.secretMotive}</p>
                  </div>

                  <div className="p-2.5 rounded-lg border border-neutral-800 bg-neutral-950">
                    <span className="font-mono text-[10px] text-rose-400 uppercase font-semibold block">
                      Hidden Fear / Vulnerability:
                    </span>
                    <p className="text-neutral-200 mt-0.5">{info.secretFear}</p>
                  </div>

                  <div className="p-2.5 rounded-lg border border-neutral-800 bg-neutral-950">
                    <span className="font-mono text-[10px] text-sky-400 uppercase font-semibold block">
                      What Would Have Won Them Over:
                    </span>
                    <p className="text-neutral-200 mt-0.5">{info.unspokenPriority}</p>
                  </div>

                  <div className="pt-1">
                    <span className="font-mono text-[10px] text-neutral-400 uppercase block">
                      How Your Decisions Triggered Them:
                    </span>
                    <p className="text-neutral-300 mt-0.5 leading-relaxed">{info.howUserBehaviorTriggeredThem}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. LEARNING LOOP & RECOMMENDED SCENARIO */}
      {activeTab === 'learningLoop' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Targeted Exercises */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold block">
                3 Targeted Repetition Exercises
              </span>

              <div className="space-y-3">
                {(analysis.learningLoop?.targetedExercises || []).map((ex, idx) => (
                  <div key={idx} className="rounded-lg border border-neutral-800 bg-neutral-950 p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-200">
                        {idx + 1}. {ex.exerciseName}
                      </span>
                      <span className="text-[10px] font-mono text-amber-400">
                        {ex.skillTargeted}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      {ex.instructions}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Challenge & Reflection */}
            <div className="space-y-4">
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold block">
                  1 Real-World Challenge For Today
                </span>
                <p className="text-sm text-neutral-200 leading-relaxed font-sans">
                  {analysis.learningLoop?.realWorldChallengeForToday}
                </p>
              </div>

              <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-sky-400 font-semibold block">
                  Penetrating Reflection Question
                </span>
                <p className="text-sm text-neutral-200 italic font-serif leading-relaxed">
                  &ldquo;{analysis.learningLoop?.reflectionQuestion}&rdquo;
                </p>
              </div>

              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 space-y-1">
                <span className="text-xs font-mono uppercase tracking-wider text-amber-300 font-semibold block">
                  Core Axiom To Remember
                </span>
                <p className="text-sm font-semibold text-neutral-100 font-display">
                  {analysis.learningLoop?.corePrincipleToRemember}
                </p>
              </div>
            </div>
          </div>

          {/* Recommended Next Scenario Card */}
          {analysis.learningLoop?.recommendedNextScenario && (
            <div className="rounded-2xl border border-amber-500/50 bg-gradient-to-r from-amber-500/15 via-neutral-900 to-neutral-950 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
                  Recommended Adaptive Follow-Up Scenario
                </span>
                <h3 className="font-display text-lg font-bold text-neutral-100">
                  {analysis.learningLoop.recommendedNextScenario.suggestedCategory} · {analysis.learningLoop.recommendedNextScenario.suggestedType} ({analysis.learningLoop.recommendedNextScenario.suggestedDifficulty})
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl leading-relaxed">
                  {analysis.learningLoop.recommendedNextScenario.strategicRationale}
                </p>
              </div>

              <button
                onClick={() => {
                  playTacticalClick();
                  onLaunchRecommendedScenario({
                    category: analysis.learningLoop.recommendedNextScenario.suggestedCategory as any,
                    conversationType: analysis.learningLoop.recommendedNextScenario.suggestedType as any,
                    difficulty: analysis.learningLoop.recommendedNextScenario.suggestedDifficulty as any,
                  });
                }}
                className="flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl font-display font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                <span>Launch This Adaptive Scenario</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Bottom Actions */}
      <div className="mt-8 border-t border-neutral-800 pt-6 flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onRestartNewSession}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-neutral-700 bg-neutral-900 text-neutral-200 hover:bg-neutral-800 text-xs sm:text-sm font-semibold font-mono transition-colors cursor-pointer"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Configure New Scenario</span>
        </button>

        <span className="text-xs text-neutral-500 font-mono">
          Session performance permanently saved to local training memory.
        </span>
      </div>
    </div>
  );
};
