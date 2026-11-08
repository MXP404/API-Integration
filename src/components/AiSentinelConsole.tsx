import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  PhoneCall, 
  RefreshCw, 
  Zap, 
  Copy, 
  Check, 
  ArrowRight, 
  Sliders, 
  Activity, 
  Clock, 
  Sparkles,
  Bot,
  Info,
  Server,
  Play,
  XCircle,
  Radio
} from 'lucide-react';
import { ApiIncident, ForwarderIntegration } from '../types/dispatch';

interface AiSentinelConsoleProps {
  incidents: ApiIncident[];
  forwarders: ForwarderIntegration[];
  onResolveIncident: (incidentId: string, actionNote: string) => void;
  onSimulateError: (scenario: '422_missing_bond' | '502_bad_gateway' | '504_cfs_timeout' | '401_expired_token' | '400_schema_mismatch') => void;
  onTriggerHealthSweep: () => void;
  isSweepRunning: boolean;
  autoSweepEnabled: boolean;
  toggleAutoSweep: () => void;
}

export const AiSentinelConsole: React.FC<AiSentinelConsoleProps> = ({
  incidents,
  forwarders,
  onResolveIncident,
  onSimulateError,
  onTriggerHealthSweep,
  isSweepRunning,
  autoSweepEnabled,
  toggleAutoSweep,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('active');

  const activeIncidents = incidents.filter((inc) => inc.status === 'active');
  const resolvedIncidents = incidents.filter((inc) => inc.status === 'resolved');

  const displayedIncidents = filter === 'active' 
    ? activeIncidents 
    : filter === 'resolved' 
    ? resolvedIncidents 
    : incidents;

  const handleCopyScript = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Sentinel Header & Heartbeat Strip */}
      <div className="p-4 sm:p-5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/80 via-white to-neutral-50 dark:from-indigo-950/40 dark:via-neutral-900 dark:to-neutral-900 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <span>AI Sentinel · Continuous API Reliability Watchdog</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold">
                  Gemini 3.8 Flash
                </span>
              </h2>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-3xl">
              Autonomous logistics agent continuously scanning carrier-to-forwarder API exchanges. Proactively diagnoses 400 & 500 status codes, determines fault attribution (carrier vs forwarder), and drafts ready-to-read talking points so dispatchers know the exact issue before answering the phone.
            </p>
          </div>

          {/* Action buttons & Auto-sweep toggle */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={toggleAutoSweep}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border flex items-center gap-1.5 transition-colors ${
                autoSweepEnabled
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                  : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-300 dark:border-neutral-700'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${autoSweepEnabled ? 'text-emerald-500 animate-pulse' : 'text-neutral-400'}`} />
              <span>Auto-Sweep {autoSweepEnabled ? '(Every 15s ON)' : '(Paused)'}</span>
            </button>

            <button
              onClick={onTriggerHealthSweep}
              disabled={isSweepRunning}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSweepRunning ? 'animate-spin' : ''}`} />
              <span>{isSweepRunning ? 'Scanning APIs...' : 'Scan APIs Now'}</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-indigo-100 dark:border-indigo-900/40 text-xs">
          <div>
            <span className="text-neutral-500 dark:text-neutral-400 text-[11px] block">Active API Incidents</span>
            <span className={`font-mono font-bold text-base ${activeIncidents.length > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {activeIncidents.length} Issue{activeIncidents.length === 1 ? '' : 's'} Detected
            </span>
          </div>

          <div>
            <span className="text-neutral-500 dark:text-neutral-400 text-[11px] block">Forwarder API Uptime</span>
            <span className="font-mono font-bold text-base text-neutral-900 dark:text-white">
              98.7% Nominal
            </span>
          </div>

          <div>
            <span className="text-neutral-500 dark:text-neutral-400 text-[11px] block">Average Forwarder Ping</span>
            <span className="font-mono font-bold text-base text-neutral-900 dark:text-white">
              34ms (Fast)
            </span>
          </div>

          <div>
            <span className="text-neutral-500 dark:text-neutral-400 text-[11px] block">Dispatcher Phone Readiness</span>
            <span className="font-mono font-bold text-base text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Scripts Armed
            </span>
          </div>
        </div>
      </div>

      {/* Simulator Quick Bar for Testing 4xx/5xx Scenarios */}
      <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Test Error Scenarios (Simulate 400 & 500 Level Errors)</span>
          </div>
          <span className="text-[11px] text-neutral-500 font-mono">
            Triggers Real AI Diagnostic Pipeline
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={() => onSimulateError('422_missing_bond')}
            className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-800 dark:hover:text-amber-300 border border-neutral-200 dark:border-neutral-700 transition-colors flex items-center gap-1.5"
          >
            <span className="font-mono font-bold text-[11px] text-amber-600">422</span>
            <span>Missing Customs 7512 In-Bond</span>
          </button>

          <button
            onClick={() => onSimulateError('502_bad_gateway')}
            className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-800 dark:hover:text-rose-300 border border-neutral-200 dark:border-neutral-700 transition-colors flex items-center gap-1.5"
          >
            <span className="font-mono font-bold text-[11px] text-rose-600">502</span>
            <span>Air Cargo Proxy Bad Gateway</span>
          </button>

          <button
            onClick={() => onSimulateError('504_cfs_timeout')}
            className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-800 dark:hover:text-rose-300 border border-neutral-200 dark:border-neutral-700 transition-colors flex items-center gap-1.5"
          >
            <span className="font-mono font-bold text-[11px] text-rose-600">504</span>
            <span>Chicago CFS Gateway Timeout</span>
          </button>

          <button
            onClick={() => onSimulateError('401_expired_token')}
            className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-800 dark:hover:text-amber-300 border border-neutral-200 dark:border-neutral-700 transition-colors flex items-center gap-1.5"
          >
            <span className="font-mono font-bold text-[11px] text-amber-600">401</span>
            <span>OAuth Token Expired</span>
          </button>

          <button
            onClick={() => onSimulateError('400_schema_mismatch')}
            className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-800 dark:hover:text-amber-300 border border-neutral-200 dark:border-neutral-700 transition-colors flex items-center gap-1.5"
          >
            <span className="font-mono font-bold text-[11px] text-amber-600">400</span>
            <span>Equipment Schema Mismatch</span>
          </button>
        </div>
      </div>

      {/* Incident Stream Filter Controls */}
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              filter === 'active'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <span>Active Incidents</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-mono">
              {activeIncidents.length}
            </span>
          </button>

          <button
            onClick={() => setFilter('resolved')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              filter === 'resolved'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <span>Resolved History</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-mono">
              {resolvedIncidents.length}
            </span>
          </button>

          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <span>All ({incidents.length})</span>
          </button>
        </div>

        <span className="text-xs text-neutral-500 font-mono hidden sm:inline">
          Showing {displayedIncidents.length} incident record{displayedIncidents.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Incidents Dossier Grid */}
      <div className="space-y-4">
        {displayedIncidents.length === 0 ? (
          <div className="p-8 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-800 text-center space-y-2 bg-white/40 dark:bg-neutral-900/40">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white">All API Connections Nominal</h3>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              No 400 or 500 error responses detected across all 5 freight forwarders. Outbound milestones and telematics are syncing without rejection.
            </p>
          </div>
        ) : (
          displayedIncidents.map((incident) => {
            const diag = incident.diagnostic;
            const isResolved = incident.status === 'resolved';

            return (
              <div
                key={incident.id}
                className={`p-5 rounded-xl border transition-all ${
                  isResolved
                    ? 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-900/40 opacity-75'
                    : incident.statusCode >= 500
                    ? 'border-rose-300 dark:border-rose-900/60 bg-white dark:bg-neutral-900 shadow-sm ring-1 ring-rose-400/30'
                    : 'border-amber-300 dark:border-amber-900/60 bg-white dark:bg-neutral-900 shadow-sm ring-1 ring-amber-400/30'
                }`}
              >
                {/* Header row: Status code, Endpoint, Blame tag */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                      incident.statusCode >= 500
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    }`}>
                      HTTP {incident.statusCode}
                    </span>

                    <span className="font-bold text-sm text-neutral-900 dark:text-white">
                      {diag?.incidentTitle || `${incident.method} ${incident.endpoint}`}
                    </span>

                    {diag?.blameSide && (
                      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                        diag.blameSide === 'forwarder'
                          ? 'bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                          : diag.blameSide === 'carrier'
                          ? 'bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                      }`}>
                        Fault: {diag.blameSide.toUpperCase()} SIDE
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{incident.detectedAt}</span>
                    <span>·</span>
                    <span>{incident.forwarderName}</span>
                  </div>
                </div>

                {/* Blame Clarification & Technical Root Cause */}
                <div className="mt-3 space-y-1.5 text-xs">
                  {diag?.blameExplanation && (
                    <div className="text-neutral-700 dark:text-neutral-300 font-medium">
                      <strong>Attribution:</strong> {diag.blameExplanation}
                    </div>
                  )}

                  <div className="text-neutral-600 dark:text-neutral-400">
                    <strong>Technical Root Cause:</strong> {diag?.rootCause || incident.errorSnippet}
                  </div>

                  {incident.loadNumber && (
                    <div className="text-neutral-500 font-mono text-[11px]">
                      Associated Load: <strong>{incident.loadNumber}</strong> (Ref: {incident.forwarderRef || 'N/A'}) · Endpoint: <code>{incident.method} {incident.endpoint}</code>
                    </div>
                  )}
                </div>

                {/* THE CLIENT PHONE CALL TALKING POINTS BRIEF */}
                {diag?.clientCallScript && (
                  <div className="mt-4 p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-900/70 bg-gradient-to-r from-indigo-50/90 to-blue-50/50 dark:from-indigo-950/40 dark:to-blue-950/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950 dark:text-indigo-200">
                        <PhoneCall className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span>Client Phone Call Brief (Say this when client/broker calls):</span>
                      </div>
                      <button
                        onClick={() => handleCopyScript(incident.id, diag.clientCallScript)}
                        className="px-2 py-1 text-[11px] font-medium rounded bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:border-indigo-400 flex items-center gap-1 shadow-2xs"
                      >
                        {copiedId === incident.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Talking Points</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-indigo-900 dark:text-indigo-100 font-sans leading-relaxed italic bg-white/60 dark:bg-black/20 p-2.5 rounded-lg border border-indigo-100 dark:border-indigo-900/40">
                      "{diag.clientCallScript}"
                    </p>
                  </div>
                )}

                {/* Proposed Fix & 1-Click Action */}
                <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs text-neutral-600 dark:text-neutral-300 flex-1">
                    <strong>Proposed Fix:</strong> {diag?.proposedFix || 'Investigate API connection and retry with corrected headers.'}
                  </div>

                  {!isResolved ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onResolveIncident(incident.id, diag?.proposedFix || 'Resolved by dispatcher')}
                        className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />
                        <span>{diag?.actionLabel || 'Apply Fix & Re-transmit'}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{incident.resolutionNotes || 'Resolved & Synchronized'}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
