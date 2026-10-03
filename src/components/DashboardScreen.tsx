import React, { useState } from 'react';
import {
  TrendingUp,
  Activity,
  Award,
  Zap,
  ArrowRight,
  Trash2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Brain,
  Sparkles,
  RotateCcw,
  Download,
  Smartphone,
} from 'lucide-react';
import type { StoredSession, TrainingCategory, ConversationType, DifficultyLevel } from '../../server/types';
import { formatSkillName, clearAllStoredSessions, deleteStoredSession } from '../services/storage';
import { playTacticalClick } from '../utils/sound';

interface DashboardScreenProps {
  sessions: StoredSession[];
  onOpenSession: (session: StoredSession) => void;
  onRefreshSessions: () => void;
  onStartAdaptiveSession: () => void;
  onNavigateNew: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  sessions,
  onOpenSession,
  onRefreshSessions,
  onStartAdaptiveSession,
  onNavigateNew,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const totalSessions = sessions.length;
  const avgScore = totalSessions > 0
    ? Math.round(sessions.reduce((acc, s) => acc + s.overallScore, 0) / totalSessions)
    : 0;

  const highestScore = totalSessions > 0
    ? Math.max(...sessions.map(s => s.overallScore))
    : 0;

  // Aggregate recurring strengths and weaknesses across all sessions
  const strengthCounts: Record<string, number> = {};
  const weaknessCounts: Record<string, number> = {};

  sessions.forEach(s => {
    s.topStrengths.forEach(st => {
      strengthCounts[st] = (strengthCounts[st] || 0) + 1;
    });
    s.growthAreas.forEach(wk => {
      weaknessCounts[wk] = (weaknessCounts[wk] || 0) + 1;
    });
  });

  const sortedStrengths = Object.entries(strengthCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const sortedWeaknesses = Object.entries(weaknessCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const filteredSessions = filterCategory === 'All'
    ? sessions
    : sessions.filter(s => s.category === filterCategory);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this saved session audit?')) {
      playTacticalClick();
      deleteStoredSession(id);
      onRefreshSessions();
    }
  };

  const handleClearAll = () => {
    if (confirm('Clear all saved simulation records?')) {
      playTacticalClick();
      clearAllStoredSessions();
      onRefreshSessions();
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-3 py-1 text-xs font-mono font-medium text-amber-300">
            <Activity className="h-3.5 w-3.5 text-amber-400" />
            <span>PROGRESS & HISTORICAL PSYCHOMETRICS</span>
          </div>
          <h1 className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight text-neutral-100">
            Longitudinal Mastery Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            Track communication velocity, recurring habits, and adaptive conditioning over time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/CommunicationMasteryLab.apk"
            download="CommunicationMasteryLab.apk"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold font-mono transition-all"
            title="Download Android APK package"
          >
            <Smartphone className="h-4 w-4 text-amber-400" />
            <span>Download APK</span>
            <Download className="h-3.5 w-3.5 text-amber-400" />
          </a>

          {totalSessions > 0 && (
            <button
              onClick={onStartAdaptiveSession}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-display font-bold text-xs bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Launch Adaptive Session</span>
            </button>
          )}
          <button
            onClick={onNavigateNew}
            className="px-4 py-2.5 rounded-xl border border-neutral-700 bg-neutral-900 text-neutral-200 hover:bg-neutral-800 text-xs font-semibold font-mono transition-colors cursor-pointer"
          >
            + New Scenario
          </button>
        </div>
      </div>

      {totalSessions === 0 ? (
        /* Empty State */
        <div className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/40 p-12 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Brain className="h-7 w-7" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-neutral-200">
              No Simulation Sessions Recorded Yet
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-neutral-400 max-w-md mx-auto">
              Complete your first high-stakes simulation to initiate the adaptive memory engine and track psychological trends.
            </p>
          </div>
          <button
            onClick={onNavigateNew}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-display font-bold text-sm bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <span>Start Your First Simulation</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      ) : (
        /* Dashboard Stats & Content */
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block">
                Sessions Completed
              </span>
              <span className="font-mono text-2xl sm:text-3xl font-bold text-neutral-100 mt-1 block">
                {totalSessions}
              </span>
              <span className="text-[10px] text-neutral-500 font-mono mt-1 block">
                Total simulated dialogues
              </span>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block">
                Average Score
              </span>
              <span className={`font-mono text-2xl sm:text-3xl font-bold mt-1 block ${
                avgScore >= 80 ? 'text-amber-400' : avgScore >= 65 ? 'text-sky-400' : 'text-neutral-300'
              }`}>
                {avgScore}
                <span className="text-xs text-neutral-500 font-normal"> / 100</span>
              </span>
              <span className="text-[10px] text-neutral-500 font-mono mt-1 block">
                Across all competencies
              </span>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block">
                Peak Performance
              </span>
              <span className="font-mono text-2xl sm:text-3xl font-bold text-amber-400 mt-1 block">
                {highestScore}
                <span className="text-xs text-neutral-500 font-normal"> / 100</span>
              </span>
              <span className="text-[10px] text-neutral-500 font-mono mt-1 block">
                Highest single session score
              </span>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block">
                Adaptive Memory Status
              </span>
              <span className="font-mono text-xs sm:text-sm font-semibold text-emerald-400 mt-2 flex items-center gap-1.5 block">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Active & Calibrated
              </span>
              <span className="text-[10px] text-neutral-500 font-mono mt-1 block">
                Tailoring future scenarios
              </span>
            </div>
          </div>

          {/* Strengths & Growth Areas Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recurring Strengths */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-neutral-200">
                  Recurring Strengths Observed
                </h3>
              </div>
              <p className="text-xs text-neutral-400">
                Skills consistently rated above average across your practice history:
              </p>

              <div className="space-y-2 pt-1">
                {sortedStrengths.map(([skill, count]) => (
                  <div
                    key={skill}
                    className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-950 p-2.5 text-xs"
                  >
                    <span className="font-medium text-neutral-200">{skill}</span>
                    <span className="font-mono text-[11px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      Demonstrated in {count} session{count > 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recurring Weaknesses */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-400" />
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-neutral-200">
                  Recurring Blindspots & Weaknesses
                </h3>
              </div>
              <p className="text-xs text-neutral-400">
                Friction patterns targeted by the adaptive engine for reinforcement:
              </p>

              <div className="space-y-2 pt-1">
                {sortedWeaknesses.map(([skill, count]) => (
                  <div
                    key={skill}
                    className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-950 p-2.5 text-xs"
                  >
                    <span className="font-medium text-neutral-200">{skill}</span>
                    <span className="font-mono text-[11px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                      Flagged in {count} session{count > 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Historical Sessions Log */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="font-display text-base font-bold text-neutral-100">
                  Simulation Practice Archives
                </h3>
                <p className="text-xs text-neutral-400">
                  Click any session to reopen its full 18-competency audit, choice review, and rewrites.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Category filter */}
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="rounded-lg border border-neutral-800 bg-neutral-950 px-2.5 py-1.5 text-xs text-neutral-300 font-mono focus:outline-none"
                >
                  <option value="All">All Categories</option>
                  <option value="Social">Social</option>
                  <option value="Professional">Professional</option>
                  <option value="Personal">Personal</option>
                  <option value="Authority">Authority</option>
                  <option value="Random Scenario">Random Scenario</option>
                </select>

                <button
                  onClick={handleClearAll}
                  className="text-xs text-neutral-500 hover:text-rose-400 font-mono transition-colors p-1.5 cursor-pointer"
                  title="Clear all stored sessions"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {filteredSessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => onOpenSession(session)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-neutral-800 bg-neutral-950 p-4 transition-all hover:border-amber-500/50 hover:bg-neutral-900 cursor-pointer group"
                >
                  <div className="space-y-1 truncate pr-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display font-semibold text-neutral-200 text-sm group-hover:text-amber-300 transition-colors">
                        {session.title}
                      </span>
                      <span className="rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] font-mono text-neutral-400">
                        {session.category}
                      </span>
                      <span className="rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] font-mono text-neutral-400">
                        {session.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 truncate max-w-xl">
                      {session.conversationType} · {session.turnsCount} turns · {session.analysisSummary}
                    </p>
                  </div>

                  <div className="mt-3 sm:mt-0 flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <span className={`font-mono text-lg font-bold block ${
                        session.overallScore >= 80 ? 'text-amber-400' : session.overallScore >= 65 ? 'text-sky-400' : 'text-rose-400'
                      }`}>
                        {session.overallScore}
                        <span className="text-xs text-neutral-500 font-normal"> / 100</span>
                      </span>
                      <span className="text-[10px] font-mono text-neutral-500 block">
                        {session.dateStr}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleDelete(session.id, e)}
                      className="text-neutral-600 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                      title="Delete session"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
