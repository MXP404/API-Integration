import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Gemini API client on server-side
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export interface ApiIncidentDiagnosticRequest {
  incidentId?: string;
  endpoint: string;
  method: string;
  statusCode: number;
  forwarderId: string;
  forwarderName: string;
  loadNumber?: string;
  forwarderRef?: string;
  requestPayload?: any;
  responseBody?: any;
  errorSnippet?: string;
}

export interface ApiIncidentDiagnosticResponse {
  incidentTitle: string;
  severity: 'critical' | 'warning' | 'info';
  blameSide: 'forwarder' | 'carrier' | 'network';
  blameExplanation: string;
  rootCause: string;
  clientCallScript: string;
  proposedFix: string;
  actionType: 'resend_with_fix' | 'renew_token' | 'reroute' | 'notify_broker' | 'reassign_driver';
  actionLabel: string;
  confidenceScore: number;
  generatedBy: 'gemini-3.8-flash' | 'carrier-rules-engine';
}

// Fallback rule-based generator for offline/unconfigured environments
function generateFallbackDiagnostic(data: ApiIncidentDiagnosticRequest): ApiIncidentDiagnosticResponse {
  const { statusCode, endpoint, forwarderName, loadNumber, errorSnippet } = data;

  if (statusCode === 401 || statusCode === 403) {
    return {
      incidentTitle: `Authentication Revoked / Token Expired on ${forwarderName}`,
      severity: 'critical',
      blameSide: 'carrier',
      blameExplanation: 'Our carrier TMS bearer token or OAuth authorization expired and was rejected by the forwarder authentication gateway.',
      rootCause: `HTTP ${statusCode} at ${endpoint}. Forwarder token header expired or certificate revoked.`,
      clientCallScript: `If ${forwarderName} or the shipper calls, advise: "Our system detected an API authorization key refresh requirement during our status broadcast for load ${loadNumber || 'your run'}. We are refreshing our carrier OAuth token right now; all drivers remain on schedule and our telematics will resync within 2 minutes."`,
      proposedFix: 'Trigger carrier API token renewal to exchange refreshed OAuth refresh_token with the forwarder IAM service.',
      actionType: 'renew_token',
      actionLabel: 'Renew OAuth Token & Retry',
      confidenceScore: 0.98,
      generatedBy: 'carrier-rules-engine',
    };
  }

  if (statusCode === 422) {
    return {
      incidentTitle: `Unprocessable Entity: Missing Customs Reference or Schema Rule`,
      severity: 'warning',
      blameSide: 'forwarder',
      blameExplanation: 'The forwarder endpoint rejected the milestone or tender because required brokerage headers (such as US Customs Entry 1C or IT Bond) are missing in their system.',
      rootCause: `HTTP 422 at ${endpoint}. ${errorSnippet || 'Validation rejected by partner business logic layer.'}`,
      clientCallScript: `If ${forwarderName} calls asking why the status is pending, advise: "We have our unit staged for load ${loadNumber || 'this shipment'}, but your API returned a 422 validation refusal stating customs/commodity reference is incomplete on your side. Please verify the 7512 in-bond number on your portal so our automated milestone can clear."`,
      proposedFix: 'Patch payload with Moscoso Express customs bond reference (ORD-BND-8841 / C136) and retransmit.',
      actionType: 'resend_with_fix',
      actionLabel: 'Inject Bond Ref & Retransmit',
      confidenceScore: 0.95,
      generatedBy: 'carrier-rules-engine',
    };
  }

  if (statusCode >= 500 && statusCode <= 504) {
    return {
      incidentTitle: `${forwarderName} Gateway Outage / Downstream Timeout (${statusCode})`,
      severity: 'critical',
      blameSide: 'forwarder',
      blameExplanation: `${forwarderName}'s air cargo/intermodal EDI-REST proxy is experiencing high latency or downtime upstream.`,
      rootCause: `HTTP ${statusCode} at ${endpoint}. Forwarder API gateway timed out after 30,000ms.`,
      clientCallScript: `If the client calls about missing track-and-trace pings, reassure them immediately: "Our GPS telematics and driver are 100% active and moving normally. ${forwarderName}'s external API gateway has been returning HTTP ${statusCode} upstream errors for the past few minutes. We have queued all milestone timestamps locally and will auto-retransmit as soon as their service recovers."`,
      proposedFix: 'Queue updates in carrier offline buffer and activate exponential backoff retry (30s, 60s, 120s).',
      actionType: 'reroute',
      actionLabel: 'Enable Offline Buffer & Retry',
      confidenceScore: 0.92,
      generatedBy: 'carrier-rules-engine',
    };
  }

  return {
    incidentTitle: `API Error ${statusCode} on ${endpoint}`,
    severity: 'warning',
    blameSide: 'network',
    blameExplanation: 'General connection rejection or HTTP protocol error between carrier TMS and forwarder.',
    rootCause: `HTTP ${statusCode} encountered. ${errorSnippet || 'Unexpected response status code received.'}`,
    clientCallScript: `If client calls about load ${loadNumber || 'this shipment'}, explain: "Our dispatch console detected a transient network communication handshake error (HTTP ${statusCode}). Our team has already logged the telematics offline and will verify receipt with the receiving terminal."`,
    proposedFix: 'Verify network route, inspect payload fields, and resubmit.',
    actionType: 'resend_with_fix',
    actionLabel: 'Resend Diagnostic Ping',
    confidenceScore: 0.85,
    generatedBy: 'carrier-rules-engine',
  };
}

// POST /api/ai/diagnose: Run Gemini 3.8 Flash to analyze API failures and generate phone talking points
app.post('/api/ai/diagnose', async (req, res) => {
  const incidentData: ApiIncidentDiagnosticRequest = req.body;

  if (!incidentData || !incidentData.endpoint || !incidentData.statusCode) {
    return res.status(400).json({ error: 'Missing endpoint or statusCode in request' });
  }

  // If no Gemini key is set, return rule-based fallback immediately
  if (!apiKey) {
    const fallback = generateFallbackDiagnostic(incidentData);
    return res.json(fallback);
  }

  try {
    const prompt = `You are the Senior Logistics Systems & API Reliability Architect for Moscoso Express Inc. (USDOT 1263850, MC-489212, property carrier based in Elk Grove Village, IL specializing in Chicago O'Hare ORD Customs Bonded air cargo and regional FTL).

An API connection or HTTP error has been detected between our carrier dispatch platform and a freight forwarder/client API endpoint.

Analyze this failure and generate an actionable diagnostic dossier for our freight dispatcher.

INCIDENT DETAILS:
- Partner / Forwarder: ${incidentData.forwarderName} (${incidentData.forwarderId})
- HTTP Method & Endpoint: ${incidentData.method} ${incidentData.endpoint}
- HTTP Status Code: ${incidentData.statusCode}
- Associated Load / Reference: ${incidentData.loadNumber || 'N/A'} (Forwarder Ref: ${incidentData.forwarderRef || 'N/A'})
- Error Snippet: ${incidentData.errorSnippet || 'N/A'}
- Outbound Payload Sent:
${JSON.stringify(incidentData.requestPayload || {}, null, 2)}
- Inbound Response Received:
${JSON.stringify(incidentData.responseBody || {}, null, 2)}

TASK REQUIREMENTS:
1. Identify who is to blame: "forwarder" (their API is down, validation error on their end, missing contract data), "carrier" (we sent malformed JSON, bad token, unassigned driver), or "network" (upstream proxy/timeout).
2. Write a concise technical root cause.
3. CRITICAL: Formulate the "Client Phone Call Brief". When a customer, shipper, or freight forwarder calls the dispatch desk complaining about missing tracking or an API error, give the dispatcher the EXACT 2-3 sentence talking points to read. It must be polite, authoritative, protective of our driver/carrier reputation, and state the exact issue and expected resolution time.
4. Recommend a concrete proposed fix.
5. Provide an action button type and label.

Return strictly JSON matching this structure:
{
  "incidentTitle": "Short punchy title (under 10 words)",
  "severity": "critical" | "warning" | "info",
  "blameSide": "forwarder" | "carrier" | "network",
  "blameExplanation": "1 sentence clarifying whose system is causing the hangup",
  "rootCause": "2-3 sentences explaining technical reason",
  "clientCallScript": "2-3 sentences formatted for the dispatcher to say aloud when picking up the phone with the customer",
  "proposedFix": "1-2 sentences on how to remediate",
  "actionType": "resend_with_fix" | "renew_token" | "reroute" | "notify_broker" | "reassign_driver",
  "actionLabel": "Short button label under 5 words",
  "confidenceScore": 0.95
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are an expert freight logistics software reliability engineer. Respond ONLY with valid structured JSON. Do not wrap in markdown quotes if possible, or use standard JSON.",
        responseMimeType: "application/json",
      },
    });

    const rawText = response.text || '';
    const parsed = JSON.parse(rawText);

    return res.json({
      ...parsed,
      generatedBy: 'gemini-3.8-flash',
    });
  } catch (err: any) {
    console.error('Error in Gemini API diagnosis, falling back to rule engine:', err?.message || err);
    const fallback = generateFallbackDiagnostic(incidentData);
    return res.json(fallback);
  }
});

// GET /api/ai/health: Health check and status summary
app.get('/api/ai/health', (req, res) => {
  res.json({
    status: 'online',
    watchdog: 'active',
    aiConfigured: Boolean(apiKey),
    model: 'gemini-3.8-flash',
    carrier: 'Moscoso Express Inc. (USDOT 1263850)',
    timestamp: new Date().toISOString(),
  });
});

// Vite dev server mounting or static build serving
async function initServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[LogixForward Server] Running on http://0.0.0.0:${PORT} (Node: ${process.version})`);
  });
}

initServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
