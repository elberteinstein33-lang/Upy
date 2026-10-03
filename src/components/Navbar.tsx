import React from 'react';
import { Volume2, VolumeX, Shield, Activity, Download, Smartphone } from 'lucide-react';
import { isSoundEnabled, toggleSound } from '../utils/sound';

interface NavbarProps {
  currentScreen: 'setup' | 'simulation' | 'analysis' | 'dashboard';
  onNavigate: (screen: 'setup' | 'simulation' | 'analysis' | 'dashboard') => void;
  hasActiveSimulation: boolean;
  hasCurrentAnalysis: boolean;
  sessionsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  onNavigate,
  hasActiveSimulation,
  hasCurrentAnalysis,
  sessionsCount,
}) => {
  const [soundOn, setSoundOn] = React.useState(isSoundEnabled());

  const handleToggleSound = () => {
    const nextState = toggleSound();
    setSoundOn(nextState);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-800/80 bg-neutral-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div 
          onClick={() => onNavigate(hasActiveSimulation ? 'simulation' : 'setup')}
          className="flex cursor-pointer items-center gap-3 group"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/20 via-neutral-900 to-amber-600/10 border border-amber-500/30 text-amber-400 shadow-sm transition-all group-hover:border-amber-500/60">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-base font-bold tracking-tight text-neutral-100 sm:text-lg">
                Communication Mastery Lab
              </span>
              <span className="hidden sm:inline-block text-[11px] font-mono font-medium text-amber-400/90 border border-amber-500/30 rounded px-1.5 py-0.2 bg-amber-500/10">
                PRO ENGINE
              </span>
            </div>
            <p className="hidden text-xs text-neutral-400 sm:block">
              AI Decision Roleplay & Psychological Simulator
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onNavigate('setup')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors cursor-pointer ${
              currentScreen === 'setup'
                ? 'bg-neutral-800 text-neutral-100 border border-neutral-700'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            New Session
          </button>

          {hasActiveSimulation && (
            <button
              onClick={() => onNavigate('simulation')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                currentScreen === 'simulation'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-amber-400 hover:bg-amber-500/10'
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              Simulation
            </button>
          )}

          {hasCurrentAnalysis && (
            <button
              onClick={() => onNavigate('analysis')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                currentScreen === 'analysis'
                  ? 'bg-neutral-800 text-neutral-100 border border-neutral-700'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
              }`}
            >
              Analysis
            </button>
          )}

          <button
            onClick={() => onNavigate('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors cursor-pointer ${
              currentScreen === 'dashboard'
                ? 'bg-neutral-800 text-neutral-100 border border-neutral-700'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            <Activity className="h-3.5 w-3.5 text-neutral-400" />
            <span className="hidden xs:inline">Dashboard</span>
            {sessionsCount > 0 && (
              <span className="text-[10px] font-mono bg-neutral-800 text-neutral-400 px-1 rounded">
                {sessionsCount}
              </span>
            )}
          </button>

          {/* APK Direct Download Button */}
          <a
            href="/CommunicationMasteryLab.apk"
            download="CommunicationMasteryLab.apk"
            title="Download Android APK directly"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-xs font-mono font-medium transition-all"
          >
            <Smartphone className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">APK</span>
            <Download className="h-3 w-3 text-amber-400" />
          </a>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            aria-label={soundOn ? 'Disable tactical audio' : 'Enable tactical audio'}
            title={soundOn ? 'Tactical Audio: On' : 'Tactical Audio: Muted'}
            className="ml-1 p-2 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 border border-transparent hover:border-neutral-800 transition-colors cursor-pointer"
          >
            {soundOn ? <Volume2 className="h-4 w-4 text-amber-400/80" /> : <VolumeX className="h-4 w-4 text-neutral-500" />}
          </button>
        </nav>
      </div>
    </header>
  );
};
