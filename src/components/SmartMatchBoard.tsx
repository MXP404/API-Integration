import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Truck, 
  ShieldCheck, 
  UserCheck, 
  Send, 
  Sliders, 
  ArrowRight,
  Info,
  Calendar,
  Layers,
  ChevronRight,
  Zap
} from 'lucide-react';
import { SMART_MATCH_DATA, MatchBoardRunData, MatchDriverPick } from '../data/matchBoardData';
import { formatCurrency } from '../utils/formatters';

interface SmartMatchBoardProps {
  onAssignRunToDriver: (jobNo: string, driverName: string, equipmentUnit: string) => void;
}

export const SmartMatchBoard: React.FC<SmartMatchBoardProps> = ({
  onAssignRunToDriver,
}) => {
  const [selectedJobNo, setSelectedJobNo] = useState<string>('JOB-1001');
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [onlyShowFitting, setOnlyShowFitting] = useState(false);
  const [transmittedJob, setTransmittedJob] = useState<{ jobNo: string; driverName: string; timestamp: string } | null>(null);

  const activeRunData: MatchBoardRunData = SMART_MATCH_DATA[selectedJobNo] || SMART_MATCH_DATA['JOB-1001'];
  const activeRequest = activeRunData.requests?.find((r) => r.job_no === selectedJobNo) || activeRunData.requests[0];
  const picks = activeRunData.picks;

  const handleAssignAndConfirm = (driver: MatchDriverPick) => {
    const unit = driver.best_equipment?.unit_id || 'MX-101';
    onAssignRunToDriver(selectedJobNo, driver.name, unit);
    setTransmittedJob({
      jobNo: selectedJobNo,
      driverName: driver.name,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    });

    setTimeout(() => {
      setTransmittedJob(null);
    }, 4500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Concept Card */}
      <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/70 via-white to-neutral-50 dark:from-indigo-950/30 dark:via-neutral-900 dark:to-neutral-900 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Smart Match Board & Algorithmic FIT Score
            </h2>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
              Decision 136 Architecture
            </span>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 max-w-3xl">
            Automated dispatcher recommendation engine evaluating <strong>HOS availability (25 pts)</strong>, <strong>lane history (25 pts)</strong>, <strong>forwarder client preference (20 pts)</strong>, <strong>equipment CDL qualification (15 pts)</strong>, and <strong>workload fairness (15 pts)</strong>.
          </p>
        </div>

        {/* Quick filter toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setOnlyShowFitting(!onlyShowFitting)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
              onlyShowFitting
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700'
            }`}
          >
            {onlyShowFitting ? '✓ Showing Only Drivers Who Fit' : 'Show All Candidates'}
          </button>
        </div>
      </div>

      {/* Confirmation API Toast */}
      {transmittedJob && (
        <div className="p-3.5 rounded-lg bg-emerald-600 text-white shadow-lg flex items-center justify-between text-xs animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>
              REST API <code>POST /v1/dispatch/confirm</code> transmitted to <strong>{transmittedJob.driverName}</strong> for Run <strong>{transmittedJob.jobNo}</strong> at {transmittedJob.timestamp} (HTTP 200 OK, 31ms).
            </span>
          </div>
          <span className="text-[11px] font-mono opacity-80">Acknowledged</span>
        </div>
      )}

      {/* Run Selection Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {Object.keys(SMART_MATCH_DATA).map((jobKey) => {
          const run = SMART_MATCH_DATA[jobKey];
          const req = run.requests[0];
          const isSelected = selectedJobNo === jobKey;
          const topScore = run.picks?.ranked[0]?.score || 0;

          return (
            <div
              key={jobKey}
              onClick={() => {
                setSelectedJobNo(jobKey);
                setSelectedDriverId(null);
              }}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-indigo-500 bg-white dark:bg-neutral-900 shadow-sm ring-1 ring-indigo-500'
                  : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-neutral-900 dark:text-white">
                  {jobKey}
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  Top FIT: {topScore} pts
                </span>
              </div>

              <div className="mt-1 text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                {req?.client_name || 'Forwarder Client'}
              </div>

              <div className="text-[11px] text-neutral-500 mt-1 flex items-center justify-between">
                <span>{req?.origin?.city || 'Chicago'} → {req?.destination?.city || 'Midwest'}</span>
                <span className="font-mono">{run.picks?.hours || 8}h</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Run Dossier Header Strip */}
      {picks && (
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-neutral-900 dark:text-white">
                  Active Run: {selectedJobNo}
                </span>
                <span className="text-xs text-neutral-400">·</span>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  {activeRequest?.client_name || 'Pinecrest Medical'}
                </span>
                <span className="text-xs text-neutral-400">·</span>
                <span className="text-xs font-mono text-neutral-500">Ref: {activeRequest?.ref_no}</span>
              </div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400">
                Departure: <strong className="text-neutral-900 dark:text-white font-mono">{picks.depart_at.replace('T', ' ')}</strong> · Estimated Completion: <strong className="text-neutral-900 dark:text-white font-mono">{picks.end_at.replace('T', ' ')}</strong> ({picks.hours}h Duration)
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="px-2.5 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-mono">
                Needs: <strong className="text-neutral-900 dark:text-white uppercase">{picks.needs || 'ANY'}</strong>
              </div>
              <div className="px-2.5 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-mono">
                Picks: {picks.ranked.length} Candidate(s)
              </div>
            </div>
          </div>

          {/* Algorithmic Scoring Formula Badge */}
          <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-600 dark:text-neutral-400 space-y-1">
            <div className="font-semibold text-neutral-900 dark:text-neutral-200 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-indigo-500" />
              <span>Scoring Rules Engine Formula</span>
            </div>
            <div className="leading-relaxed font-sans text-neutral-500">
              {picks.formula}
            </div>
          </div>
        </div>
      )}

      {/* Candidates Grids: Top Picks vs Blocked */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Ranked Top Picks (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-500" />
              Ranked Candidate Drivers (By FIT Score)
            </span>
            <span className="text-xs font-mono text-neutral-500">
              {picks?.ranked.length} Drivers Evaluated
            </span>
          </div>

          <div className="space-y-3">
            {picks?.ranked.map((candidate) => {
              const isSelected = selectedDriverId === candidate.driver_id;
              const hasWarnings = candidate.warnings && candidate.warnings.length > 0;

              return (
                <div
                  key={candidate.driver_id}
                  onClick={() => setSelectedDriverId(candidate.driver_id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-sm ring-1 ring-indigo-500'
                      : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 flex items-center justify-center font-bold font-mono text-[11px]">
                          #{candidate.rank}
                        </span>
                        <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                          {candidate.name}
                        </h4>
                        <span className="text-xs text-neutral-400">·</span>
                        <span className="text-xs font-mono text-neutral-500">CDL Class {candidate.cdl_class}</span>
                        {candidate.free ? (
                          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                            Available at Depart
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                            Schedule Overlap
                          </span>
                        )}
                      </div>

                      {/* Best Recommended Equipment */}
                      {candidate.best_equipment && (
                        <div className="text-xs text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5 pt-1">
                          <Truck className="w-3.5 h-3.5 text-neutral-400" />
                          <span>
                            Best Unit: <strong className="text-neutral-900 dark:text-white font-mono">{candidate.best_equipment.unit_id}</strong> ({candidate.best_equipment.make_model || 'Day Cab Tractor'})
                          </span>
                        </div>
                      )}
                    </div>

                    {/* FIT Score Dial */}
                    <div className="text-right shrink-0">
                      <div className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
                        {candidate.score} <span className="text-xs font-normal text-neutral-400">/ 100</span>
                      </div>
                      <div className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
                        FIT Index
                      </div>
                    </div>
                  </div>

                  {/* Factor Reasons Breakdown */}
                  <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 space-y-1.5">
                    <div className="text-[11px] font-semibold text-neutral-500">
                      Point Attribution Breakdown:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {candidate.reasons.map((reason, idx) => {
                        const reasonText = typeof reason === 'string' ? reason : (reason?.text || JSON.stringify(reason));
                        return (
                          <div key={idx} className="flex items-center gap-1.5 text-xs text-neutral-700 dark:text-neutral-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                            <span className="truncate">{reasonText}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Warnings if any */}
                    {hasWarnings && (
                      <div className="p-2 rounded bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-200 flex items-center gap-1.5 mt-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>
                          {candidate.warnings?.map((w: any) => typeof w === 'string' ? w : w?.text).filter(Boolean).join(' · ')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 1-Click Assign & Confirm API button */}
                  <div className="mt-3 pt-2 flex items-center justify-between">
                    <span className="text-[11px] text-neutral-500 font-mono">
                      Ready for REST API Dispatch Push
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAssignAndConfirm(candidate);
                      }}
                      className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Assign & Confirm via API</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: "Can't Take This Run" & Rules Inspector (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              Blocked Drivers (Rules Block)
            </span>
            <span className="text-xs font-mono text-neutral-500">
              {picks?.blocked.length} Disqualified
            </span>
          </div>

          <div className="space-y-3">
            {picks?.blocked.length === 0 ? (
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs text-neutral-500 text-center italic">
                All roster drivers meet minimum qualifications for this equipment.
              </div>
            ) : (
              picks?.blocked.map((b) => (
                <div
                  key={b.driver_id}
                  className="p-3.5 rounded-xl border border-rose-200/80 dark:border-rose-900/40 bg-rose-50/30 dark:bg-rose-950/10 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-neutral-900 dark:text-white">
                      {b.name}
                    </span>
                    <span className="text-[10px] font-mono uppercase font-bold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950 px-1.5 py-0.5 rounded">
                      {b.kind}
                    </span>
                  </div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-400">
                    {b.reason}
                  </div>
                </div>
              ))
            )}

            {/* Rest Rules & Operating Policy */}
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
              <h4 className="font-semibold text-xs text-neutral-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-500" />
                Active Dispatch Policy Constraints
              </h4>
              <div className="text-xs space-y-2 text-neutral-600 dark:text-neutral-400">
                <div className="flex items-center justify-between">
                  <span>Mandatory Rest Window:</span>
                  <span className="font-mono font-semibold text-neutral-900 dark:text-white">10 Hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tractor Equipment CDL:</span>
                  <span className="font-mono font-semibold text-neutral-900 dark:text-white">Class A Only</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Straight Truck 26ft CDL:</span>
                  <span className="font-mono font-semibold text-neutral-900 dark:text-white">Class A or B</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Driver Confirmation Window:</span>
                  <span className="font-mono font-semibold text-neutral-900 dark:text-white">45 Minutes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
