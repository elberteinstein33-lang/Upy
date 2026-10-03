import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  ChevronDown,
  ChevronUp,
  Target,
  PenTool,
  RotateCcw,
} from 'lucide-react';
import type { ScenarioData, MessageRecord, ResponseOption } from '../../server/types';
import { playTacticalClick } from '../utils/sound';

interface SimulationScreenProps {
  scenario: ScenarioData;
  transcript: MessageRecord[];
  currentOptions: ResponseOption[];
  isSubmittingTurn: boolean;
  onSendReply: (replyText: string, strategyUsed?: string) => Promise<void>;
  onEndSimulation: () => void;
  isConversationEnded: boolean;
  endReason?: string;
  errorMessage?: string | null;
  onRetryLastTurn?: () => void;
}

export const SimulationScreen: React.FC<SimulationScreenProps> = ({
  scenario,
  transcript,
  currentOptions,
  isSubmittingTurn,
  onSendReply,
  onEndSimulation,
  isConversationEnded,
  endReason,
  errorMessage,
  onRetryLastTurn,
}) => {
  const [contextExpanded, setContextExpanded] = useState<boolean>(false);
  const [customReplyMode, setCustomReplyMode] = useState<boolean>(
    scenario.conversationType.includes('Free Conversation')
  );
  const [customInput, setCustomInput] = useState<string>('');
  const [customStrategy, setCustomStrategy] = useState<string>('Custom Stance');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, isSubmittingTurn, isConversationEnded]);

  const handleSelectOption = (option: ResponseOption) => {
    if (isSubmittingTurn || isConversationEnded) return;
    playTacticalClick();
    onSendReply(option.text, option.strategy);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim() || isSubmittingTurn || isConversationEnded) return;
    playTacticalClick();
    onSendReply(customInput.trim(), customStrategy || 'Custom Response');
    setCustomInput('');
    if (!scenario.conversationType.includes('Free Conversation')) {
      setCustomReplyMode(false);
    }
  };

  const activeCharacters = scenario.characters;
  const isMultiPerson = activeCharacters.length > 1;

  return (
    <div className="mx-auto flex h-[calc(100vh-65px)] max-w-6xl flex-col px-2 sm:px-4 pb-2">
      {/* 1. SCENARIO INTRO / STAKES HEADER (Collapsible) */}
      <div className="mt-2 rounded-xl border border-neutral-800 bg-neutral-900/90 shadow-md backdrop-blur">
        <div 
          onClick={() => setContextExpanded(!contextExpanded)}
          className="flex cursor-pointer items-center justify-between px-3 sm:px-4 py-2 text-xs text-neutral-300 hover:text-neutral-100 transition-colors"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="font-display font-bold text-amber-400 truncate text-xs sm:text-sm">
              {scenario.title}
            </span>
            <span className="hidden sm:inline-block text-[11px] font-mono text-neutral-500">·</span>
            <span className="hidden sm:inline-block text-[11px] font-mono text-neutral-400">
              {scenario.category} / {scenario.conversationType}
            </span>
            <span className="rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] font-mono text-neutral-300">
              {scenario.difficulty}
            </span>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-neutral-400">
              <Target className="h-3 w-3 text-amber-400" />
              <span className="truncate max-w-[240px]">Obj: {scenario.objective}</span>
            </span>
            <div className="flex items-center gap-1 text-neutral-400">
              <span className="text-[11px] font-mono">{contextExpanded ? 'Hide Brief' : 'View Stakes'}</span>
              {contextExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        {contextExpanded && (
          <div className="border-t border-neutral-800/80 px-3 sm:px-4 py-3 text-xs text-neutral-300 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
            <div className="space-y-2">
              <div>
                <span className="font-mono text-[10px] uppercase font-semibold text-amber-400/90 block">
                  Location & Sensory Atmosphere:
                </span>
                <p className="mt-0.5 text-neutral-300 leading-relaxed font-sans">
                  {scenario.location}. {scenario.atmosphere}
                </p>
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase font-semibold text-neutral-400 block">
                  People Nearby & Visibility:
                </span>
                <p className="mt-0.5 text-neutral-400">
                  {scenario.peopleNearby}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <span className="font-mono text-[10px] uppercase font-semibold text-neutral-400 block">
                  Social Dynamics & Power Hierarchy:
                </span>
                <p className="mt-0.5 text-neutral-300 leading-relaxed">
                  {scenario.socialContext}
                </p>
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase font-semibold text-rose-400/90 block">
                  Operational Constraints:
                </span>
                <ul className="mt-0.5 list-disc list-inside space-y-0.5 text-neutral-400">
                  {scenario.constraints.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. LIVE CHARACTER METERS BAR */}
      <div className="mt-2 rounded-xl border border-neutral-800/80 bg-neutral-900/60 p-2 sm:p-3">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-neutral-400">
              Live Counterpart Psychological State
            </span>
            <span className="text-[10px] text-neutral-500 font-mono">
              (Hidden motives concealed until analysis)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-neutral-400">
              Turns: {transcript.filter(m => m.sender === 'user').length}
            </span>
            <button
              onClick={onEndSimulation}
              className="px-2 py-0.5 rounded border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-[11px] font-medium transition-colors cursor-pointer"
            >
              End & Analyze
            </button>
          </div>
        </div>

        {/* Character Meters Grid */}
        <div className={`grid gap-2 ${isMultiPerson ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {activeCharacters.map((char) => {
            const m = char.meters;
            return (
              <div 
                key={char.id}
                className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-2 sm:p-2.5 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 truncate">
                    <div className="h-6 w-6 rounded-md bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs font-mono font-bold text-amber-400">
                      {char.name.charAt(0)}
                    </div>
                    <div className="truncate">
                      <span className="text-xs font-semibold text-neutral-200 block truncate">
                        {char.name}
                      </span>
                      <span className="text-[10px] text-neutral-400 block truncate">
                        {char.role}
                      </span>
                    </div>
                  </div>

                  {m.microReaction && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-300">
                      {m.microReaction}
                    </span>
                  )}
                </div>

                {/* 3 Metric Bars: Trust, Interest, Comfort */}
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {/* Trust */}
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 mb-0.5">
                      <span>Trust</span>
                      <span className="text-neutral-200 font-semibold">{m.trust}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-neutral-800 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          m.trust >= 70 ? 'bg-emerald-500' : m.trust >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, m.trust))}%` }}
                      />
                    </div>
                    {m.trustDelta !== undefined && m.trustDelta !== 0 && (
                      <span className={`text-[9px] font-mono flex items-center gap-0.5 mt-0.5 ${
                        m.trustDelta > 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {m.trustDelta > 0 ? '+' : ''}{m.trustDelta}
                      </span>
                    )}
                  </div>

                  {/* Interest */}
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 mb-0.5">
                      <span>Interest</span>
                      <span className="text-neutral-200 font-semibold">{m.interest}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-neutral-800 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          m.interest >= 70 ? 'bg-sky-400' : m.interest >= 40 ? 'bg-amber-500' : 'bg-neutral-600'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, m.interest))}%` }}
                      />
                    </div>
                    {m.interestDelta !== undefined && m.interestDelta !== 0 && (
                      <span className={`text-[9px] font-mono flex items-center gap-0.5 mt-0.5 ${
                        m.interestDelta > 0 ? 'text-sky-400' : 'text-neutral-400'
                      }`}>
                        {m.interestDelta > 0 ? '+' : ''}{m.interestDelta}
                      </span>
                    )}
                  </div>

                  {/* Comfort */}
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 mb-0.5">
                      <span>Comfort</span>
                      <span className="text-neutral-200 font-semibold">{m.comfort}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-neutral-800 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          m.comfort >= 70 ? 'bg-indigo-400' : m.comfort >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, m.comfort))}%` }}
                      />
                    </div>
                    {m.comfortDelta !== undefined && m.comfortDelta !== 0 && (
                      <span className={`text-[9px] font-mono flex items-center gap-0.5 mt-0.5 ${
                        m.comfortDelta > 0 ? 'text-indigo-400' : 'text-rose-400'
                      }`}>
                        {m.comfortDelta > 0 ? '+' : ''}{m.comfortDelta}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. CHAT STREAM */}
      <div className="mt-2 flex-1 overflow-y-auto rounded-xl border border-neutral-800/80 bg-neutral-950/70 p-3 sm:p-4 space-y-4">
        {transcript.map((msg, idx) => {
          const isUser = msg.sender === 'user';
          return (
            <div 
              key={msg.id || idx}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-full`}
            >
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="text-xs font-semibold text-neutral-300 font-mono">
                  {isUser ? 'YOU' : msg.characterName || 'Counterpart'}
                </span>
                {isUser && msg.strategyUsed && (
                  <span className="rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.2 text-[10px] font-mono text-amber-300">
                    {msg.strategyUsed}
                  </span>
                )}
                <span className="text-[10px] font-mono text-neutral-600">
                  Turn #{Math.floor(idx / 2) + 1}
                </span>
              </div>

              {/* Message Bubble */}
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed max-w-[92%] sm:max-w-[85%] ${
                isUser 
                  ? 'bg-amber-500/15 border border-amber-500/40 text-neutral-100 rounded-tr-sm shadow-sm'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-tl-sm shadow-sm'
              }`}>
                {/* Nonverbal Body Language */}
                {msg.bodyLanguage && (
                  <div className="mb-1 text-xs italic text-amber-400/90 font-serif">
                    {msg.bodyLanguage}
                  </div>
                )}
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          );
        })}

        {/* Typing indicator while AI reasons */}
        {isSubmittingTurn && (
          <div className="flex flex-col items-start max-w-full">
            <div className="flex items-center gap-2 mb-1 px-1">
              <span className="text-xs font-semibold text-neutral-400 font-mono">
                Counterpart
              </span>
              <span className="text-[10px] font-mono text-amber-400 animate-pulse">
                Evaluating internal psychology...
              </span>
            </div>
            <div className="rounded-2xl rounded-tl-sm border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-neutral-400 flex items-center gap-2 shadow-sm">
              <div className="flex space-x-1">
                <div className="h-2 w-2 rounded-full bg-amber-400/70 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="h-2 w-2 rounded-full bg-amber-400/70 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="h-2 w-2 rounded-full bg-amber-400/70 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs text-neutral-400">Processing nonverbal subtext & status reactions...</span>
            </div>
          </div>
        )}

        {/* Concluded Banner */}
        {isConversationEnded && (
          <div className="my-4 rounded-xl border border-amber-500/50 bg-gradient-to-r from-amber-500/15 to-neutral-900 p-4 text-center">
            <h4 className="font-display text-base font-bold text-amber-300">
              Simulation Arc Concluded
            </h4>
            <p className="mt-1 text-xs sm:text-sm text-neutral-300 max-w-xl mx-auto">
              {endReason || 'The encounter reached its natural resolution or the counterpart has made their stance definitive.'}
            </p>
            <div className="mt-4 flex justify-center">
              <button
                onClick={onEndSimulation}
                className="px-6 py-2.5 rounded-xl font-display font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
              >
                Access Deep Psychological Audit & Rewrites →
              </button>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="my-2 rounded-lg border border-rose-500/40 bg-rose-950/40 p-3 text-xs text-rose-300 flex items-center justify-between">
            <span>{errorMessage}</span>
            {onRetryLastTurn && (
              <button
                onClick={onRetryLastTurn}
                className="flex items-center gap-1 font-semibold text-rose-200 underline hover:text-white cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" /> Retry Turn
              </button>
            )}
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* 4. RESPONSE OPTIONS TRAY */}
      {!isConversationEnded && (
        <div className="mt-2 border-t border-neutral-800/80 pt-2">
          {customReplyMode ? (
            /* Custom input mode */
            <form onSubmit={handleCustomSubmit} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-amber-400 flex items-center gap-1">
                  <PenTool className="h-3.5 w-3.5" />
                  <span>Write Your Own Verbatim Response</span>
                </span>
                {!scenario.conversationType.includes('Free Conversation') && (
                  <button
                    type="button"
                    onClick={() => setCustomReplyMode(false)}
                    className="text-xs text-neutral-400 hover:text-neutral-200 underline font-mono cursor-pointer"
                  >
                    ← Switch Back to Strategy Options
                  </button>
                )}
              </div>

              <div className="relative">
                <textarea
                  rows={2}
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      handleCustomSubmit(e);
                    }
                  }}
                  placeholder="Speak your exact words or describe actions in asterisks (e.g., *maintains eye contact* 'I appreciate your perspective, but...')"
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-900/90 px-3.5 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 resize-none"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-neutral-500">Stance Tag:</span>
                  <input
                    type="text"
                    value={customStrategy}
                    onChange={(e) => setCustomStrategy(e.target.value)}
                    placeholder="e.g. Calm Inquiry, Firm Disagreement"
                    className="rounded border border-neutral-800 bg-neutral-950 px-2 py-1 text-xs text-neutral-300 w-44 font-mono focus:outline-none focus:border-neutral-700"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!customInput.trim() || isSubmittingTurn}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold font-mono transition-all ${
                    !customInput.trim() || isSubmittingTurn
                      ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                      : 'bg-amber-500 hover:bg-amber-400 text-neutral-950 cursor-pointer shadow-sm shadow-amber-500/20'
                  }`}
                >
                  <span>Deliver Response</span>
                  <Send className="h-3 w-3" />
                </button>
              </div>
            </form>
          ) : (
            /* Option Cards Grid */
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                  Select A Strategic Action (No single &ldquo;correct&rdquo; answer — each has tactical trade-offs)
                </span>
                <button
                  onClick={() => setCustomReplyMode(true)}
                  className="flex items-center gap-1 text-xs text-amber-400/90 hover:text-amber-300 font-mono hover:underline cursor-pointer"
                >
                  <PenTool className="h-3 w-3" />
                  <span>Write My Own Response</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 max-h-[175px] sm:max-h-[220px] overflow-y-auto pr-1">
                {currentOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt)}
                    disabled={isSubmittingTurn}
                    className="flex flex-col justify-between rounded-xl border border-neutral-800 bg-neutral-900/80 p-3 text-left transition-all hover:border-amber-500/70 hover:bg-neutral-900 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer shadow-sm"
                  >
                    <div>
                      <span className="inline-block mb-1 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 border border-amber-500/30 rounded px-1.5 py-0.2 bg-amber-500/10">
                        {opt.strategy}
                      </span>
                      <p className="text-xs sm:text-[13px] text-neutral-200 group-hover:text-white leading-relaxed line-clamp-3">
                        &ldquo;{opt.text}&rdquo;
                      </p>
                    </div>
                  </button>
                ))}

                {/* Final "Write My Own" option card as required */}
                <button
                  onClick={() => setCustomReplyMode(true)}
                  disabled={isSubmittingTurn}
                  className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-700 bg-neutral-950/40 p-3 text-center transition-all hover:border-amber-500 hover:bg-amber-500/5 active:scale-[0.99] disabled:opacity-50 cursor-pointer min-h-[75px]"
                >
                  <PenTool className="h-4 w-4 text-amber-400 mb-1" />
                  <span className="text-xs font-semibold text-neutral-200 font-mono">
                    + Write My Own Custom Response
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono mt-0.5">
                    Say whatever you would actually say in real life
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
