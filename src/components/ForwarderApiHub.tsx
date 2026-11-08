import React, { useState } from 'react';
import { 
  Send, 
  Copy, 
  Check, 
  Globe, 
  Zap, 
  ArrowUpRight, 
  ArrowDownLeft,
  Terminal,
  ShieldCheck,
  FileCode,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { ForwarderApiLog, ForwarderIntegration } from '../types/dispatch';
import { REPO_API_V1_CASES, ApiV1TestCase } from '../data/repoFixturesData';

interface ForwarderApiHubProps {
  forwarders: ForwarderIntegration[];
  apiLogs: ForwarderApiLog[];
  onTriggerTestPing: (forwarderId: string) => void;
  onSimulateWebhook: (type: 'flexport_tender' | 'dsv_rate_bump' | 'expeditors_customs') => void;
  onSendCustomApiRequest: (endpoint: string, payload: Record<string, unknown>) => void;
}

export const ForwarderApiHub: React.FC<ForwarderApiHubProps> = ({
  forwarders,
  apiLogs,
  onTriggerTestPing,
  onSimulateWebhook,
  onSendCustomApiRequest,
}) => {
  const [selectedForwarderId, setSelectedForwarderId] = useState<string>(forwarders[0]?.id || '');
  const [selectedEndpointAction, setSelectedEndpointAction] = useState<string>('orders');
  const [selectedRepoCaseId, setSelectedRepoCaseId] = useState<string>('V01');
  const [caseFilterGroup, setCaseFilterGroup] = useState<'all' | 'valid' | 'contract-shape' | 'failing'>('valid');

  const initialCase = REPO_API_V1_CASES.find((c) => c.id === 'V01') || REPO_API_V1_CASES[0];
  const [customPayloadText, setCustomPayloadText] = useState(
    JSON.stringify(initialCase?.request?.body || {
      ref: "TEST-PO-1001",
      pickup: { address: "1200 Example Pkwy, Elk Grove Village, IL, 60007", date: "2026-11-10" },
      delivery: { address: "2200 Sample Rd, Columbus, OH, 43217", date: "2026-11-11" },
      equipment: "tractor",
      pieces: 12,
      weight: { value: 2400, unit: "lbs" },
      commodity: "Boxed machine parts",
      notes: "Dock 4. Call 30 minutes ahead."
    }, null, 2)
  );

  const [activeLogInspect, setActiveLogInspect] = useState<ForwarderApiLog | null>(apiLogs[0] || null);
  const [copiedLogId, setCopiedLogId] = useState<string | null>(null);

  const selectedForwarder = forwarders.find((f) => f.id === selectedForwarderId) || forwarders[0];
  const currentCase = REPO_API_V1_CASES.find((c) => c.id === selectedRepoCaseId);

  const filteredRepoCases = REPO_API_V1_CASES.filter((c) => {
    if (caseFilterGroup === 'all') return true;
    return c.group === caseFilterGroup;
  });

  const handleCopyJson = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLogId(id);
    setTimeout(() => setCopiedLogId(null), 2000);
  };

  const handleSelectRepoCase = (caseId: string) => {
    setSelectedRepoCaseId(caseId);
    const found = REPO_API_V1_CASES.find((c) => c.id === caseId);
    if (found && found.request) {
      setSelectedEndpointAction('orders');
      setCustomPayloadText(JSON.stringify(found.request.body || {}, null, 2));
    }
  };

  const handleSendTestCall = () => {
    try {
      const parsed = JSON.parse(customPayloadText);
      onSendCustomApiRequest(`${selectedForwarder.apiEndpoint}/${selectedEndpointAction}`, parsed);
    } catch (err) {
      alert('Invalid JSON in payload editor. Please check format.');
    }
  };

  const handleActionChange = (action: string) => {
    setSelectedEndpointAction(action);
    if (action === 'orders') {
      const c = REPO_API_V1_CASES.find((item) => item.id === selectedRepoCaseId) || REPO_API_V1_CASES[0];
      setCustomPayloadText(JSON.stringify(c.request?.body || {}, null, 2));
    } else if (action === 'tenders_accept') {
      setCustomPayloadText(JSON.stringify({
        tenderId: "CHR-TNDR-11849",
        carrierScac: "MOSC",
        usdot: "1263850",
        action: "ACCEPT_TENDER_REST",
        assignedTractor: "MX-101",
        assignedDriver: "Carlos Moscoso",
        targetPickupTime: "2026-11-08T07:00:00-05:00"
      }, null, 2));
    } else if (action === 'milestones') {
      setCustomPayloadText(JSON.stringify({
        loadNumber: "JOB-0996",
        ref: "PMC-55120",
        status: "STATUS_IN_TRANSIT",
        location: { city: "Elk Grove Village", state: "IL", lat: 42.0085, lng: -87.9682 },
        currentSpeedMph: 48,
        driverHosRemainingHours: 5.6,
        estimatedDeliveryTimestamp: "2026-11-08T11:30:00Z"
      }, null, 2));
    } else if (action === 'telematics_ping') {
      setCustomPayloadText(JSON.stringify({
        loadNumber: "ORD-AIR-9012",
        unitId: "MX-108",
        trailerId: "REF-2044",
        reeferSetPointF: 34.0,
        reeferReturnAirTempF: 34.2,
        ambientTempF: 52.0,
        reeferEngineHours: 4120,
        fuelLevelPercent: 88,
        telematicsSource: "Samsara_ELD_API_v3"
      }, null, 2));
    } else if (action === 'pod_upload') {
      setCustomPayloadText(JSON.stringify({
        loadNumber: "ORD-BND-8841",
        forwarderRef: "FLX-994102-ORD",
        documentType: "PROOF_OF_DELIVERY_SIGNATURE",
        signerName: "Receiving Supt MKE",
        timestampIso: new Date().toISOString(),
        damagesOrShortages: false
      }, null, 2));
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-500" />
            Freight Forwarder REST API Hub & Client API v1 Test Suite
          </h2>
          <div className="text-xs text-neutral-500 mt-1 flex items-center gap-2">
            <span>Direct bidirectional REST APIs & Webhooks</span>
            <span>·</span>
            <span>74 Repo Test Cases Loaded (Valid V01-V12, Contract S01-S07, Refusal F01-F55)</span>
          </div>
        </div>

        {/* Quick Webhook Simulators */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-neutral-500">Test Webhooks:</span>
          <button
            onClick={() => onSimulateWebhook('flexport_tender')}
            className="px-2.5 py-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 rounded-md hover:bg-indigo-100 transition-colors"
          >
            + Flexport Tender Webhook
          </button>
          <button
            onClick={() => onSimulateWebhook('dsv_rate_bump')}
            className="px-2.5 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-md hover:bg-emerald-100 transition-colors"
          >
            + DSV Rate Adj (+$250)
          </button>
          <button
            onClick={() => onSimulateWebhook('expeditors_customs')}
            className="px-2.5 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-md hover:bg-amber-100 transition-colors"
          >
            + Expeditors Customs Release
          </button>
        </div>
      </div>

      {/* Forwarder Connection Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {forwarders.map((fwd) => (
          <div
            key={fwd.id}
            onClick={() => setSelectedForwarderId(fwd.id)}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              selectedForwarderId === fwd.id
                ? 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-xs'
                : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs tracking-wider text-neutral-900 dark:text-white font-mono">
                {fwd.logoText}
              </span>
              <div className="flex items-center gap-1 text-[11px] font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{fwd.lastPingMs}ms</span>
              </div>
            </div>

            <div className="mt-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">
              {fwd.name}
            </div>

            <div className="mt-1 text-[11px] text-neutral-500 flex items-center gap-1">
              <span>{fwd.protocol}</span>
              <span>·</span>
              <span className="font-mono">{fwd.activeTendersCount} active</span>
            </div>

            <div className="mt-2.5 pt-2 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs">
              <span className="text-neutral-400 font-mono text-[10px] truncate max-w-[85px]">
                {fwd.apiKeyMasked}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTriggerTestPing(fwd.id);
                }}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <Zap className="w-3 h-3" />
                <span>Ping</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Repo Test-Data Fixture Bar */}
      <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/60 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-indigo-500" />
            <span className="font-bold text-xs text-neutral-900 dark:text-white uppercase tracking-wider">
              Repo Dummy Test Fixtures (test-data/api-v1-orders)
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setCaseFilterGroup('valid')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                caseFilterGroup === 'valid'
                  ? 'bg-emerald-600 text-white font-medium shadow-xs'
                  : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              Valid Orders (V01–V12)
            </button>
            <button
              onClick={() => setCaseFilterGroup('contract-shape')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                caseFilterGroup === 'contract-shape'
                  ? 'bg-indigo-600 text-white font-medium shadow-xs'
                  : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              Contract Shapes (S01–S07)
            </button>
            <button
              onClick={() => setCaseFilterGroup('failing')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                caseFilterGroup === 'failing'
                  ? 'bg-rose-600 text-white font-medium shadow-xs'
                  : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              Refusal Edge Cases (F01–F55)
            </button>
            <button
              onClick={() => setCaseFilterGroup('all')}
              className={`px-2 py-1 rounded-md transition-colors ${
                caseFilterGroup === 'all'
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium'
                  : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              All (74)
            </button>
          </div>
        </div>

        {/* Case Selector Dropdown */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <select
            value={selectedRepoCaseId}
            onChange={(e) => handleSelectRepoCase(e.target.value)}
            className="w-full sm:w-80 text-xs font-mono bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-neutral-900 dark:text-neutral-100"
          >
            {filteredRepoCases.map((c) => (
              <option key={c.id} value={c.id}>
                [{c.id}] {c.title.substring(0, 48)}...
              </option>
            ))}
          </select>

          {currentCase && (
            <div className="text-xs text-neutral-600 dark:text-neutral-400 flex-1">
              <strong className="text-neutral-900 dark:text-white">{currentCase.id}:</strong> {currentCase.why}
              <span className="ml-2 font-mono text-[11px] text-neutral-500">
                (Expected Status: {currentCase.expect?.status || 201})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Interactive API Sandbox & Payload Playground */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Request Console (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-500" />
                Live API Transmission Console
              </span>
              <div className="text-xs font-mono text-neutral-500">
                Target: {selectedForwarder.name}
              </div>
            </div>

            {/* Action Selector */}
            <div className="flex flex-wrap gap-1.5 text-xs bg-neutral-100 dark:bg-neutral-950 p-1 rounded-lg">
              <button
                onClick={() => handleActionChange('orders')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  selectedEndpointAction === 'orders'
                    ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                Client Order (POST /v1/orders)
              </button>
              <button
                onClick={() => handleActionChange('milestones')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  selectedEndpointAction === 'milestones'
                    ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                Broadcast Milestone (POST)
              </button>
              <button
                onClick={() => handleActionChange('tenders_accept')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  selectedEndpointAction === 'tenders_accept'
                    ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                Accept Tender (POST)
              </button>
              <button
                onClick={() => handleActionChange('telematics_ping')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  selectedEndpointAction === 'telematics_ping'
                    ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                Samsara Telematics Ping
              </button>
              <button
                onClick={() => handleActionChange('pod_upload')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  selectedEndpointAction === 'pod_upload'
                    ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                Upload POD Document
              </button>
            </div>

            {/* Request URL & Method */}
            <div className="flex items-center gap-2 bg-neutral-50 dark:bg-neutral-950 p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 font-mono text-xs">
              <span className="font-bold text-emerald-600 dark:text-emerald-400">POST</span>
              <span className="text-neutral-600 dark:text-neutral-400 truncate flex-1">
                {selectedForwarder.apiEndpoint}/{selectedEndpointAction}
              </span>
              <span className="text-[10px] text-neutral-500 bg-neutral-200 dark:bg-neutral-800 px-2 py-0.5 rounded">
                Bearer Auth
              </span>
            </div>

            {/* JSON Payload Text Area */}
            <div>
              <div className="flex items-center justify-between text-xs text-neutral-500 mb-1.5">
                <span>Request Body (application/json):</span>
                <span className="font-mono text-[11px]">UTF-8 Encoded</span>
              </div>
              <textarea
                value={customPayloadText}
                onChange={(e) => setCustomPayloadText(e.target.value)}
                rows={10}
                className="w-full text-xs font-mono bg-neutral-950 text-neutral-200 p-3 rounded-lg border border-neutral-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Dispatch Action Button */}
            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-neutral-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>HMAC SHA-256 Webhook Signature Active</span>
              </div>
              <button
                onClick={handleSendTestCall}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Transmit Outbound API Call</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Real-Time API Audit Log & Inspection (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-500" />
                REST API Transmission Log
              </span>
              <span className="text-xs font-mono text-neutral-500">
                {apiLogs.length} Events
              </span>
            </div>

            {/* Log Stream List */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {apiLogs.map((log) => (
                <div
                  key={log.id}
                  onClick={() => setActiveLogInspect(log)}
                  className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                    activeLogInspect?.id === log.id
                      ? 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20'
                      : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50 hover:border-neutral-300 dark:hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {log.direction === 'outbound' ? (
                        <ArrowUpRight className="w-3.5 h-3.5 text-indigo-500" />
                      ) : (
                        <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500" />
                      )}
                      <span className="font-semibold text-neutral-900 dark:text-white">
                        {log.forwarderName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">{log.statusCode}</span>
                      <span className="text-neutral-400">·</span>
                      <span className="text-neutral-500">{log.durationMs}ms</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1 truncate">
                    {log.payloadSummary}
                  </div>

                  <div className="text-[10px] font-mono text-neutral-400 mt-1">
                    {log.timestamp}
                  </div>
                </div>
              ))}
            </div>

            {/* Inspected Log Detail Box */}
            {activeLogInspect && (
              <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                    Inspecting Event #{activeLogInspect.id}
                  </span>
                  <button
                    onClick={() => handleCopyJson(JSON.stringify(activeLogInspect.rawPayload, null, 2), activeLogInspect.id)}
                    className="flex items-center gap-1 text-[11px] text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                  >
                    {copiedLogId === activeLogInspect.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span className="text-emerald-500">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-2.5 rounded-lg bg-neutral-950 font-mono text-[11px] text-neutral-300 max-h-[160px] overflow-y-auto border border-neutral-800">
                  <pre>{JSON.stringify(activeLogInspect.rawPayload, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
