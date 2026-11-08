import React from 'react';
import { 
  X, 
  Sliders, 
  Eye,
  Globe
} from 'lucide-react';

interface UIDecisionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  densityMode: 'compact' | 'spacious';
  setDensityMode: (mode: 'compact' | 'spacious') => void;
  protocolDisplay: 'api_technical' | 'business_plain';
  setProtocolDisplay: (val: 'api_technical' | 'business_plain') => void;
}

export const UIDecisionsDrawer: React.FC<UIDecisionsDrawerProps> = ({
  isOpen,
  onClose,
  densityMode,
  setDensityMode,
  protocolDisplay,
  setProtocolDisplay,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div 
        className="w-full max-w-xl bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 shadow-2xl h-full flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                Dispatch UI Architecture & REST API Decisions
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Modern frontend patterns connecting directly to freight forwarder APIs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Interactive Preferences */}
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/70 space-y-4">
            <div className="font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-500" />
              <span>Interactive Cockpit Customization</span>
            </div>

            {/* Density Selector */}
            <div className="space-y-1.5">
              <label className="text-neutral-600 dark:text-neutral-400 font-medium">
                Information Density Preference
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setDensityMode('compact')}
                  className={`p-2.5 rounded-lg border text-left transition-colors ${
                    densityMode === 'compact'
                      ? 'border-indigo-500 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white font-semibold shadow-xs'
                      : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  <div className="font-medium text-xs">High-Density TMS (Recommended)</div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">Compact table rows & maximum screen real estate</div>
                </button>
                <button
                  onClick={() => setDensityMode('spacious')}
                  className={`p-2.5 rounded-lg border text-left transition-colors ${
                    densityMode === 'spacious'
                      ? 'border-indigo-500 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white font-semibold shadow-xs'
                      : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  <div className="font-medium text-xs">Balanced SaaS Modern</div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">More breathing room, larger cards & badges</div>
                </button>
              </div>
            </div>

            {/* Protocol Display Mode */}
            <div className="space-y-1.5">
              <label className="text-neutral-600 dark:text-neutral-400 font-medium">
                Forwarder API Action Display
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setProtocolDisplay('api_technical')}
                  className={`p-2.5 rounded-lg border text-left transition-colors ${
                    protocolDisplay === 'api_technical'
                      ? 'border-indigo-500 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white font-semibold shadow-xs'
                      : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  <div className="font-medium text-xs">REST Endpoint Verbs (POST /v1/...)</div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">Direct HTTP REST and Webhook payload visibility</div>
                </button>
                <button
                  onClick={() => setProtocolDisplay('business_plain')}
                  className={`p-2.5 rounded-lg border text-left transition-colors ${
                    protocolDisplay === 'business_plain'
                      ? 'border-indigo-500 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white font-semibold shadow-xs'
                      : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  <div className="font-medium text-xs">Plain Human English</div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">Tender Offered, Rolling, Delivered, Exception</div>
                </button>
              </div>
            </div>
          </div>

          {/* Key UI Architectural Decisions & Rationale */}
          <div className="space-y-4">
            <h4 className="font-bold text-neutral-900 dark:text-white text-xs uppercase tracking-wider text-neutral-500">
              Key Architectural Decisions Made For This Dispatch UI
            </h4>

            {/* Decision 1: Pure Modern REST API vs Legacy EDI */}
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-neutral-900 dark:text-white">
                <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[10px] font-mono">1</span>
                <span>Pure REST & Webhook APIs vs Legacy EDI Batching</span>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Legacy trucking relies on antiquated EDI batch translators that run every 30 to 60 minutes over proprietary VANs. LogixForward TMS is built on pure real-time REST JSON APIs with webhook callbacks. When a dispatcher accepts a load or advances a milestone, an HTTP POST request fires immediately with sub-50ms acknowledgement, enabling instant visibility.
              </p>
            </div>

            {/* Decision 2 */}
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-neutral-900 dark:text-white">
                <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[10px] font-mono">2</span>
                <span>Zero-Pill Metadata vs Legacy "Candy Badge" Clutter</span>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Legacy trucking boards wrap every single piece of information (dates, status, trailer type, commodity, miles) in colored pill boxes. In a 50-load board, that causes visual fatigue. LogixForward renders metadata as clean unboxed text with subtle typographic separators (<code className="font-mono">·</code>), reserving colored badges strictly for real semantic state changes.
              </p>
            </div>

            {/* Decision 3 */}
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-neutral-900 dark:text-white">
                <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[10px] font-mono">3</span>
                <span>HOS (Hours of Service) Awareness at Point of Dispatch</span>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Dispatching a driver without seeing their FMCSA 11-hour driving clock leads to costly out-of-service violations. In LogixForward, every driver assignment dropdown displays real-time driving minutes remaining and warns if the route distance exceeds their legal duty window.
              </p>
            </div>

            {/* Decision 4 */}
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-neutral-900 dark:text-white">
                <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[10px] font-mono">4</span>
                <span>Tabular Numeral Discipline (<code className="font-mono">tabular-nums</code>)</span>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Rates, margins, timestamps, odometer miles, and HOS clocks are strictly paired with monospaced tabular figures (<code className="font-mono">font-mono tabular-nums</code>), eliminating character-width jitter as live numbers update.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
