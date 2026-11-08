export type LoadStatus = 
  | 'tendered'
  | 'booked'
  | 'dispatched'
  | 'in_transit'
  | 'at_delivery'
  | 'delivered'
  | 'exception';

export type EquipmentType = 
  | '53_DRY_VAN'
  | '53_REEFER'
  | '48_FLATBED'
  | 'STEP_DECK'
  | 'CONESTOGA';

export interface LocationPoint {
  facilityName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  appointmentTime: string;
  appointmentType: 'Strict' | 'Window' | 'First Come First Serve';
  contactName: string;
  contactPhone: string;
  dockNumber?: string;
}

export interface ForwarderIntegration {
  id: string;
  name: string;
  code: string;
  logoText: string;
  apiEndpoint: string;
  protocol: 'REST_JSON' | 'WEBHOOK_STREAM' | 'GRAPHQL';
  status: 'connected' | 'degraded' | 'syncing' | 'offline';
  lastPingMs: number;
  lastSyncTime: string;
  apiKeyMasked: string;
  webhookUrl: string;
  activeTendersCount: number;
  accountRep: string;
  supportPhone: string;
}

export interface Driver {
  id: string;
  name: string;
  avatarUrl?: string;
  phone: string;
  cdlNumber: string;
  status: 'driving' | 'on_duty' | 'sleeper' | 'off_duty';
  currentCity: string;
  currentState: string;
  lat: number;
  lng: number;
  assignedTruckId: string;
  assignedTrailerId: string;
  hosDrivingMinutesRemaining: number; // Max 660 (11h)
  hosDutyMinutesRemaining: number;    // Max 840 (14h)
  hosCycleMinutesRemaining: number;   // Max 4200 (70h/8d)
  currentSpeedMph: number;
  safetyScore: number;
}

export interface Equipment {
  id: string;
  type: EquipmentType;
  unitNumber: string;
  plate: string;
  status: 'available' | 'in_use' | 'maintenance';
  currentLocation: string;
  reeferTempSetPointF?: number;
  reeferCurrentTempF?: number;
  fuelPercent: number;
}

export interface ApiMilestoneUpdate {
  code: 'STATUS_DISPATCHED' | 'STATUS_ARRIVED_SHIPPER' | 'STATUS_DEPARTED_SHIPPER' | 'STATUS_IN_TRANSIT' | 'STATUS_ARRIVED_CONSIGNEE' | 'STATUS_DELIVERED_POD';
  label: string;
  timestamp: string;
  city: string;
  state: string;
  notes?: string;
}

export interface Load {
  id: string;
  loadNumber: string; // e.g. "LX-8924"
  forwarderReference: string; // e.g. "FLX-994102-ORD"
  forwarderId: string;
  status: LoadStatus;
  commodity: string;
  weightLbs: number;
  palletCount: number;
  equipmentType: EquipmentType;
  temperatureRequirement?: string; // e.g. "-10°F to 0°F Frozen"
  
  origin: LocationPoint;
  destination: LocationPoint;
  
  distanceMiles: number;
  deadheadMiles: number;
  
  // Financials & Rates
  linehaulRate: number;
  fuelSurcharge: number;
  accessorials: number;
  totalRate: number;
  driverPayRate: number;
  projectedMargin: number; // e.g. 18.5 (%)
  
  // Assigned entities
  assignedDriverId?: string;
  assignedTruckId?: string;
  assignedTrailerId?: string;
  
  // Documents & Compliance
  rateConNumber: string;
  bolNumber: string;
  podSignedUrl?: string;
  specialInstructions: string;
  
  // Forwarder API State
  apiSyncState: 'synced' | 'pending_ack' | 'error' | 'manual_override';
  lastApiTransmission: string;
  milestones: ApiMilestoneUpdate[];
}

export interface ForwarderApiLog {
  id: string;
  timestamp: string;
  forwarderId: string;
  forwarderName: string;
  method: 'POST' | 'GET' | 'PUT' | 'WEBHOOK';
  endpoint: string;
  statusCode: number;
  durationMs: number;
  type: 'tender_offer' | 'status_milestone' | 'rate_con' | 'pod_upload' | 'telematics_ping';
  direction: 'inbound' | 'outbound';
  payloadSummary: string;
  rawPayload: Record<string, unknown>;
  responseBody: Record<string, unknown>;
}

export interface ApiIncident {
  id: string;
  detectedAt: string;
  forwarderId: string;
  forwarderName: string;
  loadNumber?: string;
  forwarderRef?: string;
  endpoint: string;
  method: string;
  statusCode: number;
  durationMs: number;
  errorSnippet?: string;
  requestPayload?: any;
  responseBody?: any;
  status: 'active' | 'investigating' | 'resolved' | 'bypassed';
  
  // AI Diagnostics powered by Gemini 3.8 Flash
  diagnostic?: {
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
  };
  resolutionNotes?: string;
}
