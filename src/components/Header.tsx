import React from 'react';
import { 
  Truck, 
  Layers, 
  MapPin, 
  Code2, 
  FileText, 
  Users, 
  Plus, 
  SlidersHorizontal,
  Moon,
  Sun,
  Radio,
  Sparkles
} from 'lucide-react';
import { ForwarderIntegration } from '../types/dispatch';

interface HeaderProps {
  activeTab: 'dispatch' | 'smart_match' | 'fleet' | 'api_hub' | 'rate_cons' | 'map';
  setActiveTab: (tab: 'dispatch' | 'smart_match' | 'fleet' | 'api_hub' | 'rate_cons' | 'map') => void;
  onOpenNewLoad: () => void;
  onOpenUIDecisions: () => void;
  forwarders: ForwarderIntegration[];
  isDark: boolean;
  toggleTheme: () => void;
  connectedForwarderCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewLoad,
  onOpenUIDecisions,
  forwarders,
  isDark,
  toggleTheme,
  connectedForwarderCount
}) => {
  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark with domain mark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white shadow-sm">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                  LogixForward TMS
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                  USDOT 1263850
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Moscoso Express · {connectedForwarderCount}/{forwarders.length} APIs Live</span>
              </div>
            </div>
          </div>

          {/* Zone 2: 4-6 clean single-line navigation links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-medium">
            <button
              onClick={() => setActiveTab('dispatch')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'dispatch'
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Dispatch Board</span>
            </button>

            <button
              onClick={() => setActiveTab('smart_match')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'smart_match'
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900'
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Smart Match</span>
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'map'
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Live Telematics</span>
            </button>

            <button
              onClick={() => setActiveTab('fleet')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'fleet'
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Drivers & Fleet</span>
            </button>

            <button
              onClick={() => setActiveTab('api_hub')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'api_hub'
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Forwarder API Hub</span>
            </button>

            <button
              onClick={() => setActiveTab('rate_cons')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'rate_cons'
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Rate Vault</span>
            </button>
          </nav>

          {/* Zone 3: Primary action + UI Controls */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenUIDecisions}
              title="UI Decisions & Architecture Guide"
              className="px-2.5 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">UI Decisions</span>
            </button>

            <button
              onClick={toggleTheme}
              aria-label="Toggle light or dark theme"
              className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors shrink-0"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={onOpenNewLoad}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>New Load</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
