export interface CostPerMileBreakdown {
  fuelPerMile: number;
  driverLaborPerMile: number;
  maintenancePerMile: number;
  tollsPerMile: number;
  insuranceOverheadPerMile: number;
}

export interface LaneFinancialInput {
  id: string;
  laneName: string;
  origin: string;
  destination: string;
  corridor: string;
  freightType: 'ORD Bonded Air Cargo' | 'Expedited Hot Shot' | 'Regional FTL' | 'Intermodal Drayage' | 'Dedicated LTL Liftgate';
  loadedMiles: number;
  deadheadMiles: number;
  billedRevenue: number;
  accessorialRevenue: number; // detention, liftgate, TSA bonded handling
  tollCostFixed: number;
  avgDurationHours: number;
  weeklyFrequency: number;
  assignedTruckId: string;
  cpmRates: CostPerMileBreakdown;
}

export interface LaneFinancialMetrics {
  totalMiles: number;
  deadheadRatioPct: number;
  grossRevenue: number;
  fuelCost: number;
  driverLaborCost: number;
  maintenanceCost: number;
  tollCost: number;
  insuranceOverheadCost: number;
  totalRouteCost: number;
  costPerTotalMile: number;
  costPerLoadedMile: number;
  revenuePerTotalMile: number;
  revenuePerLoadedMile: number;
  netProfitPerRoute: number;
  profitMarginPct: number;
  operatingRatioPct: number;
  weeklyTotalLaneCost: number;
  weeklyNetProfit: number;
}

export interface DriverTelemetryInput {
  driverId: string;
  name: string;
  cdlClass: 'Class A' | 'Class B';
  tsaStaVerified: boolean;
  tsaExpirationDate: string;
  assignedTruckId: string;
  milesDriven30d: number;
  harshBrakingCount: number;
  rapidAccelCount: number;
  speedingEventsCount: number;
  sharpCorneringCount: number;
  idleMinutes: number;
  totalEngineMinutes: number;
  hosDrivingRemainingHrs: number;
  hosDutyRemainingHrs: number;
  hosCycleRemainingHrs: number;
  dvirCompliant: boolean;
  onTimeDeliveryRatePct: number;
  coachingStatus: 'None Required' | 'Scheduled' | 'Completed' | 'Urgent Review';
}

export interface DriverPerformanceScore {
  overallSafetyScore: number; // 0 - 100
  riskLevel: 'Low' | 'Moderate' | 'High';
  idlePercentage: number;
  eventsPer1000Miles: number;
  estimatedMonthlyFuelWasteUsd: number;
  hosViolationRisk: boolean;
  recommendedProtocol: string;
}

export type TruckOperationalState =
  | 'En Route - Loaded'
  | 'En Route - Bobtail'
  | 'At ORD Cargo Gate'
  | 'In Maintenance Shop'
  | 'Available at Terminal'
  | 'En Route - Fault Warning'
  | 'Emergency Roadside Hold';

export type DiagnosticSeverity = 'Nominal' | 'Advisory (Return-to-Base)' | 'Critical (Immediate Emergency)';

export interface J1939FaultCode {
  code: string; // e.g. "SPN 3251 FMI 0"
  subsystem: 'Aftertreatment / DPF' | 'Cooling System' | 'Air Brake System' | 'Electrical / Alternator' | 'Transmission / Drivetrain';
  description: string;
  severity: DiagnosticSeverity;
  estimatedRepairCostUsd: number;
  estimatedShopHours: number;
  cpmMaintenanceImpact: number;
}

export interface TruckUnit {
  id: string; // e.g. "MX-101"
  unitNumber: string;
  makeModel: string;
  year: number;
  equipmentType: 'Day Cab Tractor 53ft' | '26ft Straight Box w/ Liftgate' | 'Sleeper Tractor 53ft' | 'Expedite Sprinter / Hot Shot';
  vin: string;
  licensePlate: string;
  status: TruckOperationalState;
  currentLocationName: string;
  lat: number;
  lng: number;
  headingDeg: number;
  speedMph: number;
  fuelLevelPct: number;
  engineTempF: number;
  odometerMiles: number;
  milesUntilNextPm: number;
  assignedDriverId: string;
  activeLaneId: string | null;
  currentLoadNumber: string | null;
  etaLocal: string;
  activeFaults: J1939FaultCode[];
  shopBayAssigned: string | null; // e.g., "Elk Grove Bay 2"
  healthScore: number; // 0 - 100
}

export type OnboardingStage =
  | '1_APPLICATION_INTERVIEW'
  | '2_ROAD_TEST_PENDING'
  | '3_OFFICE_DOC_VERIFICATION'
  | '4_CLEARED_FOR_DISPATCH';

export interface DriverApplicant {
  applicantId: string;
  name: string;
  cdlClass: 'Class A' | 'Class B';
  yearsExperience: number;
  appliedDate: string;
  stage: OnboardingStage;
  interviewPassed: boolean;
  roadTestPassed: boolean;
  roadTestScore?: number;
  documentsVerified: {
    cdlAndMvr: boolean;
    dotMedicalCard: boolean;
    fmcsaDrugClearinghouse: boolean;
    tsaStaApplication: boolean;
    insuranceEndorsement: boolean;
  };
  targetTruckId: string;
  targetLaneId: string;
}

export interface AgentEscalationEvent {
  id: string;
  timestamp: string;
  sourceAgentId: string; // e.g., "Agent MX-105 (Truck Unit)" or "Office Hiring Admin Agent"
  sourceTier: 'Unit Agent' | 'Department Manager' | 'COO Executive';
  targetManager:
    | 'Maintenance Manager Agent'
    | 'Operations & Dispatch Manager Agent'
    | 'Safety & Compliance Director'
    | 'Office Hiring & Compliance Manager'
    | 'COO Holistic Command';
  conflictType:
    | 'SHOP_DISPATCH_CONFLICT'
    | 'EN_ROUTE_RETURN_MAINTENANCE'
    | 'EN_ROUTE_EMERGENCY_REPOWER'
    | 'HIRING_COMPLIANCE_INTERLOCK'
    | 'HOS_SAFETY_INTERLOCK'
    | 'LANE_MARGIN_EROSION';
  severity: 'Critical' | 'Warning' | 'Resolved';
  truckId: string;
  laneId?: string;
  title: string;
  summary: string;
  financialImpactUsd: number;
  recommendedAction: string;
  status: 'Pending Action' | 'Auto-Staggered' | 'Resolved';
  resolutionNotes?: string;
}

/**
 * Calculates granular lane financial metrics including Total Route Cost,
 * Cost Per Mile (Total & Loaded), Revenue Per Mile, Profit Margin %, and Operating Ratio.
 */
export function calculateLaneFinancials(input: LaneFinancialInput): LaneFinancialMetrics {
  const totalMiles = Math.max(1, input.loadedMiles + input.deadheadMiles);
  const deadheadRatioPct = Number(((input.deadheadMiles / totalMiles) * 100).toFixed(1));
  const grossRevenue = Number((input.billedRevenue + input.accessorialRevenue).toFixed(2));

  const fuelCost = Number((totalMiles * input.cpmRates.fuelPerMile).toFixed(2));
  const driverLaborCost = Number((totalMiles * input.cpmRates.driverLaborPerMile).toFixed(2));
  const maintenanceCost = Number((totalMiles * input.cpmRates.maintenancePerMile).toFixed(2));
  const tollCost = Number(
    (input.tollCostFixed > 0 ? input.tollCostFixed : totalMiles * input.cpmRates.tollsPerMile).toFixed(2)
  );
  const insuranceOverheadCost = Number((totalMiles * input.cpmRates.insuranceOverheadPerMile).toFixed(2));

  const totalRouteCost = Number(
    (fuelCost + driverLaborCost + maintenanceCost + tollCost + insuranceOverheadCost).toFixed(2)
  );

  const costPerTotalMile = Number((totalRouteCost / totalMiles).toFixed(2));
  const costPerLoadedMile = Number((totalRouteCost / Math.max(1, input.loadedMiles)).toFixed(2));
  const revenuePerTotalMile = Number((grossRevenue / totalMiles).toFixed(2));
  const revenuePerLoadedMile = Number((grossRevenue / Math.max(1, input.loadedMiles)).toFixed(2));

  const netProfitPerRoute = Number((grossRevenue - totalRouteCost).toFixed(2));
  const profitMarginPct = grossRevenue > 0
    ? Number(((netProfitPerRoute / grossRevenue) * 100).toFixed(1))
    : 0;
  const operatingRatioPct = grossRevenue > 0
    ? Number(((totalRouteCost / grossRevenue) * 100).toFixed(1))
    : 100;

  const weeklyTotalLaneCost = Number((totalRouteCost * input.weeklyFrequency).toFixed(2));
  const weeklyNetProfit = Number((netProfitPerRoute * input.weeklyFrequency).toFixed(2));

  return {
    totalMiles,
    deadheadRatioPct,
    grossRevenue,
    fuelCost,
    driverLaborCost,
    maintenanceCost,
    tollCost,
    insuranceOverheadCost,
    totalRouteCost,
    costPerTotalMile,
    costPerLoadedMile,
    revenuePerTotalMile,
    revenuePerLoadedMile,
    netProfitPerRoute,
    profitMarginPct,
    operatingRatioPct,
    weeklyTotalLaneCost,
    weeklyNetProfit,
  };
}

/**
 * Evaluates driver safety score, idle fuel waste, and protocol recommendations.
 */
export function evaluateDriverPerformance(driver: DriverTelemetryInput, dieselPricePerGal = 4.12): DriverPerformanceScore {
  const totalEvents =
    driver.harshBrakingCount * 1.5 +
    driver.speedingEventsCount * 2.0 +
    driver.rapidAccelCount * 1.0 +
    driver.sharpCorneringCount * 1.2;

  const milesFactor = Math.max(500, driver.milesDriven30d) / 1000;
  const weightedEventsPer1000 = totalEvents / milesFactor;
  const rawEventCountPer1000 =
    ((driver.harshBrakingCount +
      driver.speedingEventsCount +
      driver.rapidAccelCount +
      driver.sharpCorneringCount) /
      milesFactor);

  const idlePercentage =
    driver.totalEngineMinutes > 0
      ? Number(((driver.idleMinutes / driver.totalEngineMinutes) * 100).toFixed(1))
      : 0;

  // Idle penalty over 12% baseline
  const idlePenalty = Math.max(0, (idlePercentage - 12) * 0.65);
  const dvirPenalty = driver.dvirCompliant ? 0 : 8;
  const tsaPenalty = driver.tsaStaVerified ? 0 : 5;

  const rawScore = 100 - weightedEventsPer1000 * 2.2 - idlePenalty - dvirPenalty - tsaPenalty;
  const overallSafetyScore = Math.max(40, Math.min(100, Math.round(rawScore)));

  let riskLevel: 'Low' | 'Moderate' | 'High' = 'Low';
  if (overallSafetyScore < 76) {
    riskLevel = 'High';
  } else if (overallSafetyScore < 88) {
    riskLevel = 'Moderate';
  }

  // Heavy truck burns ~0.85 gal/hr while idling
  const idleHours = driver.idleMinutes / 60;
  const excessIdleHours = Math.max(0, idleHours * ((idlePercentage - 10) / Math.max(1, idlePercentage)));
  const estimatedMonthlyFuelWasteUsd = Number((excessIdleHours * 0.85 * dieselPricePerGal).toFixed(2));

  const hosViolationRisk = driver.hosDrivingRemainingHrs < 1.5 || driver.hosDutyRemainingHrs < 2.0;

  let recommendedProtocol = 'Maintain standard quarterly safety check-in; eligible for clean-mile bonus.';
  if (!driver.tsaStaVerified) {
    recommendedProtocol = 'Renew TSA/STA security threat clearance before next ORD bonded air cargo dispatch.';
  } else if (driver.speedingEventsCount >= 3 || driver.harshBrakingCount >= 4) {
    recommendedProtocol = 'Assign I-294/I-90 Following-Distance & Forward Collision Mitigation coaching module.';
  } else if (idlePercentage > 20) {
    recommendedProtocol = 'Enforce 5-minute automatic engine idle shutdown protocol at ORD South Cargo staging.';
  } else if (hosViolationRisk) {
    recommendedProtocol = 'Restrict to local Elk Grove / ORD short-haul shuttle (<25 mi radius) until HOS reset.';
  }

  return {
    overallSafetyScore,
    riskLevel,
    idlePercentage,
    eventsPer1000Miles: Number(rawEventCountPer1000.toFixed(2)),
    estimatedMonthlyFuelWasteUsd,
    hosViolationRisk,
    recommendedProtocol,
  };
}

/**
 * Validates whether assigning a specific truck to a route triggers a hierarchical
 * Maintenance Manager <-> Dispatch Manager conflict or en-route maintenance triage.
 */
export function evaluateTruckDispatchEligibility(
  truck: TruckUnit,
  targetLane: LaneFinancialInput,
  allTrucks: TruckUnit[]
): {
  eligible: boolean;
  conflictType: 'NONE' | 'SHOP_BAY_LOCKOUT' | 'CRITICAL_FAULT_ACTIVE' | 'RETURN_TO_BASE_MAINTENANCE_DUE';
  alertTitle: string;
  headline?: string;
  escalationChain: string[];
  recommendedSubstituteTruckId: string | null;
  actionPlan: string;
} {
  // Find best substitute available truck
  const substitute = allTrucks.find(
    (t) =>
      t.id !== truck.id &&
      (t.status === 'Available at Terminal' || t.status === 'At ORD Cargo Gate') &&
      t.activeFaults.length === 0
  );

  if (truck.status === 'In Maintenance Shop' || truck.shopBayAssigned !== null) {
    const alertTitle = `Unit ${truck.id} is Locked in ${truck.shopBayAssigned || 'Maintenance Shop'} — Dispatch Blocked`;
    return {
      eligible: false,
      conflictType: 'SHOP_BAY_LOCKOUT',
      alertTitle,
      headline: alertTitle,
      escalationChain: [
        `Agent ${truck.id} (Shop Telemetry Lock)`,
        'Maintenance Manager Agent (Work Order Active)',
        'Operations & Dispatch Manager Agent (Route Reassignment)',
        'COO Holistic Command',
      ],
      recommendedSubstituteTruckId: substitute ? substitute.id : null,
      actionPlan: `Maintenance Bot blocked assignment of ${truck.id} to ${targetLane.laneName}. Unit is undergoing scheduled repair at ${truck.shopBayAssigned || 'Elk Grove Shop'}. Reassign load to ${substitute ? substitute.id : 'standby unit'} immediately to preserve on-time delivery.`,
    };
  }

  const criticalFault = truck.activeFaults.find((f) => f.severity === 'Critical (Immediate Emergency)');
  if (criticalFault || truck.status === 'Emergency Roadside Hold') {
    const alertTitle = `Critical J1939 Fault (${criticalFault?.code || 'Engine Derate'}) on ${truck.id} — Emergency Triage`;
    return {
      eligible: false,
      conflictType: 'CRITICAL_FAULT_ACTIVE',
      alertTitle,
      headline: alertTitle,
      escalationChain: [
        `Agent ${truck.id} (J1939 ECM Broadcast)`,
        'Maintenance Manager Agent (Emergency Road Service)',
        'Operations & Dispatch Manager Agent (Load Repower)',
        'COO Holistic Command',
      ],
      recommendedSubstituteTruckId: substitute ? substitute.id : null,
      actionPlan: `Unit ${truck.id} reported ${criticalFault?.description || 'critical mechanical fault'}. Dispatch backup tractor ${substitute ? substitute.id : 'from Elk Grove'} to repower load and route ${truck.id} to emergency bay.`,
    };
  }

  const advisoryFault = truck.activeFaults.find((f) => f.severity === 'Advisory (Return-to-Base)');
  if (advisoryFault || truck.milesUntilNextPm <= targetLane.loadedMiles + targetLane.deadheadMiles) {
    const alertTitle = `Post-Route Maintenance Scheduled for ${truck.id} upon Return to Elk Grove`;
    return {
      eligible: true,
      conflictType: 'RETURN_TO_BASE_MAINTENANCE_DUE',
      alertTitle,
      headline: alertTitle,
      escalationChain: [
        `Agent ${truck.id} (Predictive Telemetry)`,
        'Maintenance Manager Agent (Bay Pre-Booking)',
        'Operations & Dispatch Manager Agent (Next-Shift Hold)',
      ],
      recommendedSubstituteTruckId: substitute ? substitute.id : null,
      actionPlan: `Unit ${truck.id} can safely complete current run (${targetLane.laneName}), but Maintenance Manager has pre-booked Elk Grove Bay 1 immediately upon return for ${advisoryFault ? advisoryFault.description : 'Preventive Maintenance'}.`,
    };
  }

  return {
    eligible: true,
    conflictType: 'NONE',
    alertTitle: `Unit ${truck.id} Cleared for Dispatch`,
    headline: `Unit ${truck.id} Cleared for Dispatch`,
    escalationChain: [`Agent ${truck.id}`, 'Operations & Dispatch Manager Agent'],
    recommendedSubstituteTruckId: null,
    actionPlan: `All telemetry systems nominal (Health ${truck.healthScore}%). Cleared for ${targetLane.laneName}.`,
  };
}

/**
 * Route Optimization comparison between standard highway corridor and optimized dispatch plan.
 */
export interface RouteOptimizationResult {
  laneId: string;
  standardMiles: number;
  optimizedMiles: number;
  milesSaved: number;
  standardDurationMins: number;
  optimizedDurationMins: number;
  timeSavedMins: number;
  ordGateWaitReductionMins: number;
  standardCostUsd: number;
  optimizedCostUsd: number;
  costSavingsPerTripUsd: number;
  projectedAnnualSavingsUsd: number;
  originalMarginPct: number;
  optimizedMarginPct: number;
  routingStrategy: string;
}

export function computeRouteOptimization(
  lane: LaneFinancialInput,
  avoidPeakTollCongestion: boolean,
  consolidateBackhaul: boolean,
  staggerOrdCargoWindow: boolean
): RouteOptimizationResult {
  const baseMetrics = calculateLaneFinancials(lane);

  const mileageReductionFactor = avoidPeakTollCongestion ? 0.045 : 0.015;
  const backhaulDeadheadReduction = consolidateBackhaul ? Math.round(lane.deadheadMiles * 0.65) : 0;

  const optimizedLoadedMiles = Math.max(5, Math.round(lane.loadedMiles * (1 - mileageReductionFactor)));
  const optimizedDeadheadMiles = Math.max(1, lane.deadheadMiles - backhaulDeadheadReduction);

  const standardMiles = baseMetrics.totalMiles;
  const optimizedMiles = optimizedLoadedMiles + optimizedDeadheadMiles;
  const milesSaved = Math.max(0, standardMiles - optimizedMiles);

  const ordGateWaitReductionMins = staggerOrdCargoWindow ? 28 : 0;
  const trafficSaveMins = avoidPeakTollCongestion ? 19 : 5;
  const standardDurationMins = Math.round(lane.avgDurationHours * 60);
  const timeSavedMins = ordGateWaitReductionMins + trafficSaveMins + Math.round(milesSaved * 1.1);
  const optimizedDurationMins = Math.max(25, standardDurationMins - timeSavedMins);

  // Fuel & labor savings from reduced idle + reduced miles
  const optimizedCpm: CostPerMileBreakdown = {
    ...lane.cpmRates,
    fuelPerMile: Number((lane.cpmRates.fuelPerMile * (staggerOrdCargoWindow ? 0.93 : 0.98)).toFixed(3)),
    driverLaborPerMile: Number((lane.cpmRates.driverLaborPerMile * (avoidPeakTollCongestion ? 0.95 : 0.99)).toFixed(3)),
  };

  const optimizedMetrics = calculateLaneFinancials({
    ...lane,
    loadedMiles: optimizedLoadedMiles,
    deadheadMiles: optimizedDeadheadMiles,
    tollCostFixed: avoidPeakTollCongestion ? Number((lane.tollCostFixed * 0.88).toFixed(2)) : lane.tollCostFixed,
    cpmRates: optimizedCpm,
  });

  const costSavingsPerTripUsd = Number(
    Math.max(0, baseMetrics.totalRouteCost - optimizedMetrics.totalRouteCost).toFixed(2)
  );
  const projectedAnnualSavingsUsd = Number((costSavingsPerTripUsd * lane.weeklyFrequency * 52).toFixed(0));

  const strategies: string[] = [];
  if (avoidPeakTollCongestion) {
    strategies.push('IL-390 / I-294 Dynamic I-PASS Bypass');
  }
  if (staggerOrdCargoWindow) {
    strategies.push('Off-Peak ORD South Cargo Dock Slot');
  }
  if (consolidateBackhaul) {
    strategies.push('Matched Return Backhaul to Elk Grove');
  }

  return {
    laneId: lane.id,
    standardMiles,
    optimizedMiles,
    milesSaved,
    standardDurationMins,
    optimizedDurationMins,
    timeSavedMins,
    ordGateWaitReductionMins,
    standardCostUsd: baseMetrics.totalRouteCost,
    optimizedCostUsd: optimizedMetrics.totalRouteCost,
    costSavingsPerTripUsd,
    projectedAnnualSavingsUsd,
    originalMarginPct: baseMetrics.profitMarginPct,
    optimizedMarginPct: optimizedMetrics.profitMarginPct,
    routingStrategy: strategies.length > 0 ? strategies.join(' + ') : 'Standard Corridor Dispatch',
  };
}

/**
 * Evaluates staggered Recruiting -> Road Test -> Office Hiring Admin Document Gate
 * before Operations can assign a newly hired driver to an active route.
 */
export function evaluateDriverOnboardingGate(applicant: DriverApplicant): {
  clearedForRouteAssignment: boolean;
  blockingDepartment: 'NONE' | 'RECRUITING_INTERVIEW' | 'SAFETY_ROAD_TEST' | 'OFFICE_HIRING_ADMIN_DOCS';
  missingItems: string[];
  escalationChain: string[];
  statusSummary: string;
  headline: string;
} {
  const missing: string[] = [];
  if (!applicant.interviewPassed) missing.push('CDL Recruiting Interview');
  if (!applicant.roadTestPassed) missing.push('Elk Grove / I-90 Road Test Evaluation');
  if (!applicant.documentsVerified.cdlAndMvr) missing.push('CDL & Illinois MVR Abstract');
  if (!applicant.documentsVerified.dotMedicalCard) missing.push('DOT Medical Examiner Certificate');
  if (!applicant.documentsVerified.fmcsaDrugClearinghouse) missing.push('FMCSA Drug & Alcohol Clearinghouse Query');
  if (!applicant.documentsVerified.tsaStaApplication) missing.push('ORD TSA / STA Security Threat Assessment Filing');
  if (!applicant.documentsVerified.insuranceEndorsement) missing.push('Great West Casualty Fleet Insurance Endorsement');

  if (!applicant.interviewPassed) {
    const statusSummary = `Applicant ${applicant.name} cannot be assigned to ${applicant.targetLaneId}: CDL Recruiting Interview & Road Test still pending.`;
    return {
      clearedForRouteAssignment: false,
      blockingDepartment: 'RECRUITING_INTERVIEW',
      missingItems: missing,
      escalationChain: [
        'Recruiting & Interview Agent',
        'Office Hiring & Compliance Manager',
        'Operations & Dispatch Manager Agent',
        'COO Holistic Command',
      ],
      statusSummary,
      headline: statusSummary,
    };
  }

  if (!applicant.roadTestPassed) {
    const statusSummary = `Applicant ${applicant.name} passed interview but has not completed the mandatory Elk Grove / ORD Road Test.`;
    return {
      clearedForRouteAssignment: false,
      blockingDepartment: 'SAFETY_ROAD_TEST',
      missingItems: missing,
      escalationChain: [
        'Road Test Evaluator Agent',
        'Safety & Compliance Director',
        'Operations & Dispatch Manager Agent',
        'COO Holistic Command',
      ],
      statusSummary,
      headline: statusSummary,
    };
  }

  if (missing.length > 0) {
    const statusSummary = `${applicant.name} passed Interview & Road Test, but Office Hiring Admin blocked route assignment until ${missing.length} compliance document(s) are verified: ${missing.join(', ')}.`;
    return {
      clearedForRouteAssignment: false,
      blockingDepartment: 'OFFICE_HIRING_ADMIN_DOCS',
      missingItems: missing,
      escalationChain: [
        'Office Hiring Admin Agent (Doc Gate)',
        'Safety & Compliance Director',
        'Operations & Dispatch Manager Agent (Route Block)',
        'COO Holistic Command',
      ],
      statusSummary,
      headline: statusSummary,
    };
  }

  const statusSummary = `All Recruiting, Road Test, and Office Hiring Admin compliance documents verified for ${applicant.name}. Cleared for Operations route assignment on ${applicant.targetTruckId}.`;
  return {
    clearedForRouteAssignment: true,
    blockingDepartment: 'NONE',
    missingItems: [],
    escalationChain: [
      'Office Hiring Admin Agent (100% Verified)',
      'Operations & Dispatch Manager Agent (Cleared for Route)',
    ],
    statusSummary,
    headline: statusSummary,
  };
}

export type ExpenseCategory =
  | 'Fuel'
  | 'Maintenance & Shop'
  | 'Brake & Tire Wear'
  | 'Tolls (I-PASS)'
  | 'Insurance & Permits'
  | 'Preventive Maintenance'
  | 'Unscheduled Repair'
  | 'Tires & Brakes'
  | 'Aftertreatment / DPF';

export type DrivingScope =
  | 'Local Chicagoland (<50 mi)'
  | 'Regional Midwest (50–250 mi)'
  | 'Local Chicagoland (<80 mi)'
  | 'Regional Interstate (80–300 mi)';

export interface UploadedExpenseRecord {
  id: string;
  date: string;
  truckId: string;
  driverId: string;
  laneId: string;
  category: ExpenseCategory;
  drivingScope: DrivingScope;
  amountUsd: number;
  milesCovered?: number;
  gallons?: number;
  vendor: string;
  notes: string;
}

export type ExpenseRecord = UploadedExpenseRecord;

export function aggregateFleetExpenseAndRevenueAnalytics(
  trucks: TruckUnit[],
  lanes: LaneFinancialInput[],
  drivers: DriverTelemetryInput[],
  uploadedExpenses: UploadedExpenseRecord[]
) {
  // 1. Maintenance per truck
  const maintenancePerTruck = trucks.map((truck) => {
    const assignedLane = lanes.find((l) => l.assignedTruckId === truck.id) || lanes[0];
    const laneMetrics = calculateLaneFinancials(assignedLane);
    const monthlyMiles = Math.max(2400, laneMetrics.totalMiles * assignedLane.weeklyFrequency * 4.33);

    const scheduledPmMonthlyUsd = Math.round(
      laneMetrics.maintenanceCost * assignedLane.weeklyFrequency * 4.33
    );
    const unscheduledFaultRepairUsd = truck.activeFaults.reduce(
      (sum, f) => sum + f.estimatedRepairCostUsd,
      0
    );
    const uploadedShopExpenseUsd = uploadedExpenses
      .filter((e) => e.truckId === truck.id && e.category !== 'Fuel')
      .reduce((sum, e) => sum + e.amountUsd, 0);

    const tiresAndBrakesCost = uploadedExpenses
      .filter((e) => e.truckId === truck.id && e.category.toLowerCase().includes('tire'))
      .reduce((sum, e) => sum + e.amountUsd, 0) + 180;

    const totalMonthlyMaintenanceUsd = Math.round(
      scheduledPmMonthlyUsd + unscheduledFaultRepairUsd + uploadedShopExpenseUsd
    );
    const maintenanceCpmUsd = Number((totalMonthlyMaintenanceUsd / monthlyMiles).toFixed(2));

    return {
      truckId: truck.id,
      makeModel: truck.makeModel,
      equipmentType: truck.equipmentType,
      scheduledPmMonthlyUsd,
      unscheduledFaultRepairUsd,
      uploadedShopExpenseUsd: Math.round(uploadedShopExpenseUsd),
      totalMonthlyMaintenanceUsd,
      maintenanceCpmUsd,
      // Aliases used by charts & tests
      preventiveCost: scheduledPmMonthlyUsd,
      unscheduledAndDpfCost: unscheduledFaultRepairUsd + Math.round(uploadedShopExpenseUsd * 0.6),
      tiresAndBrakesCost: Math.round(tiresAndBrakesCost),
      totalMaintCost: totalMonthlyMaintenanceUsd,
      maintCpm: maintenanceCpmUsd,
      status: truck.status,
    };
  });

  // 2. Revenue generated per equipment unit
  const revenuePerEquipment = trucks.map((truck) => {
    const matchingLanes = lanes.filter((l) => l.assignedTruckId === truck.id);
    const primaryLane =
      matchingLanes[0] ||
      lanes.find((l) => l.id === truck.activeLaneId) ||
      lanes[0];
    const m = calculateLaneFinancials(primaryLane);
    const factor = truck.status === 'In Maintenance Shop' ? 3.0 : 4.0;
    const monthlyGrossRevenueUsd = Math.round(
      m.grossRevenue * primaryLane.weeklyFrequency * factor
    );
    const uploadedForTruck = uploadedExpenses
      .filter((e) => e.truckId === truck.id)
      .reduce((s, e) => s + e.amountUsd, 0);
    const monthlyOperatingCostUsd = Math.round(
      m.totalRouteCost * primaryLane.weeklyFrequency * factor + uploadedForTruck
    );
    const monthlyNetProfitUsd = monthlyGrossRevenueUsd - monthlyOperatingCostUsd;
    const marginPct =
      monthlyGrossRevenueUsd > 0
        ? Number(((monthlyNetProfitUsd / monthlyGrossRevenueUsd) * 100).toFixed(1))
        : 0;

    return {
      truckId: truck.id,
      makeModel: truck.makeModel,
      equipmentType: truck.equipmentType,
      assignedLaneName: primaryLane.laneName,
      monthlyGrossRevenueUsd,
      monthlyOperatingCostUsd,
      monthlyNetProfitUsd,
      monthlyGrossRevenue: monthlyGrossRevenueUsd,
      monthlyNetProfit: monthlyNetProfitUsd,
      marginPct,
    };
  });

  // 2b. Revenue generated per lane
  const revenuePerLane = lanes.map((ln) => {
    const m = calculateLaneFinancials(ln);
    const monthlyRevenue = Math.round(m.grossRevenue * ln.weeklyFrequency * 4);
    const monthlyProfit = Math.round(m.netProfitPerRoute * ln.weeklyFrequency * 4);
    return {
      laneId: ln.id,
      laneName: ln.laneName,
      monthlyRevenue,
      monthlyProfit,
      rpm: m.revenuePerTotalMile,
      cpm: m.costPerTotalMile,
      profitMarginPct: m.profitMarginPct,
    };
  });

  // 3. Revenue generated by truck type
  const totalFleetMonthlyRev = Math.max(
    1,
    revenuePerEquipment.reduce((s, r) => s + r.monthlyGrossRevenueUsd, 0)
  );
  const distinctTypes = Array.from(new Set(trucks.map((t) => t.equipmentType)));

  const revenueByTruckType = distinctTypes.map((eqType) => {
    const units = revenuePerEquipment.filter((r) => r.equipmentType === eqType);
    const rev = units.reduce((s, u) => s + u.monthlyGrossRevenueUsd, 0);
    const cost = units.reduce((s, u) => s + u.monthlyOperatingCostUsd, 0);
    const net = rev - cost;
    const unitCount = Math.max(1, units.length);
    return {
      equipmentType: eqType,
      unitCount: units.length,
      monthlyGrossRevenueUsd: rev,
      monthlyOperatingCostUsd: cost,
      monthlyNetProfitUsd: net,
      monthlyGrossRevenue: rev,
      monthlyNetProfit: net,
      avgRevenuePerUnit: Math.round(rev / unitCount),
      shareOfFleetRevenuePct: Number(((rev / totalFleetMonthlyRev) * 100).toFixed(1)),
      avgMarginPct: rev > 0 ? Number(((net / rev) * 100).toFixed(1)) : 0,
    };
  });

  // 4. Fuel expense ranges for Local vs Regional
  const fuelRangesByScope = [
    {
      scope: 'Local Chicagoland (<80 mi)' as DrivingScope,
      minFuelCpmUsd: 0.62,
      avgFuelCpmUsd: 0.68,
      maxFuelCpmUsd: 0.76,
      minFuelCpm: 0.62,
      avgFuelCpm: 0.68,
      maxFuelCpm: 0.76,
      avgMpg: 6.1,
      estimatedMpg: 6.1,
      monthlyFuelSpendUsd: 9840,
      totalFuelSpendUsd: 9840,
      idleFuelSharePct: 19.4,
      corridorExamples: 'ORD South Cargo Shuttle · Downtown Chicago Loop · Joliet Intermodal',
    },
    {
      scope: 'Regional Interstate (80–300 mi)' as DrivingScope,
      minFuelCpmUsd: 0.54,
      avgFuelCpmUsd: 0.59,
      maxFuelCpmUsd: 0.65,
      minFuelCpm: 0.54,
      avgFuelCpm: 0.59,
      maxFuelCpm: 0.65,
      avgMpg: 7.4,
      estimatedMpg: 7.4,
      monthlyFuelSpendUsd: 13420,
      totalFuelSpendUsd: 13420,
      idleFuelSharePct: 9.8,
      corridorExamples: 'I-90 Rockford Air Hub · I-94 Milwaukee · I-65 Indianapolis',
    },
  ];

  // 5. Driver trends on fuel & maintenance expenses
  const driverTrends = drivers.map((drv) => {
    const truck = trucks.find((t) => t.id === drv.assignedTruckId) || trucks[0];
    const perf = evaluateDriverPerformance(drv);
    const truckMaint = maintenancePerTruck.find((m) => m.truckId === truck.id);
    const harshEvents = drv.harshBrakingCount + drv.rapidAccelCount + drv.speedingEventsCount;
    const isLocal = truck.id === 'MX-102' || truck.id === 'MX-103' || truck.id === 'MX-107';
    const baseFuelCpm = isLocal ? 0.65 : 0.58;
    const behaviorFuelPenalty =
      Math.max(0, (perf.idlePercentage - 10) * 0.004) + harshEvents * 0.005;
    const effectiveFuelCpmUsd = Number((baseFuelCpm + behaviorFuelPenalty).toFixed(2));

    const driverUploadedFuel = uploadedExpenses
      .filter((e) => e.driverId === drv.driverId && e.category === 'Fuel')
      .reduce((s, e) => s + e.amountUsd, 0);

    const monthlyFuelExpenseUsd = Math.round(
      drv.milesDriven30d * effectiveFuelCpmUsd + driverUploadedFuel
    );
    const monthlyMaintenanceExpenseUsd = truckMaint
      ? truckMaint.totalMonthlyMaintenanceUsd
      : Math.round(drv.milesDriven30d * 0.25);
    const effectiveMaintCpmUsd = Number(
      (monthlyMaintenanceExpenseUsd / Math.max(1000, drv.milesDriven30d)).toFixed(2)
    );

    let trendClassification = 'Optimal Efficiency Anchor';
    let trendFinding =
      'Progressive highway shifting & low dock idle (<12%) keep fuel and brake wear 11% below fleet baseline.';

    if (harshEvents >= 8) {
      trendClassification = 'Harsh Braking / Brake & DPF Wear Spike';
      trendFinding = `${drv.harshBrakingCount} harsh brakes & ${drv.speedingEventsCount} speeding events correlate with +$${(behaviorFuelPenalty * drv.milesDriven30d).toFixed(0)}/mo excess fuel & elevated brake/DPF maintenance ($${effectiveMaintCpmUsd.toFixed(2)}/mi).`;
    } else if (perf.idlePercentage >= 15) {
      trendClassification = 'Elevated Idle Fuel Burn';
      trendFinding = `${perf.idlePercentage}% engine idle time at ORD/intermodal staging adds $${perf.estimatedMonthlyFuelWasteUsd.toFixed(0)}/mo in unproductive diesel burn and accelerates DPF soot loading.`;
    }

    return {
      driverId: drv.driverId,
      driverName: drv.name,
      assignedTruckId: truck.id,
      truckId: truck.id,
      equipmentType: truck.equipmentType,
      drivingScope: (isLocal ? 'Local Chicagoland (<80 mi)' : 'Regional Interstate (80–300 mi)') as DrivingScope,
      monthlyMiles: drv.milesDriven30d,
      monthlyFuelExpenseUsd,
      effectiveFuelCpmUsd,
      fuelCpm: effectiveFuelCpmUsd,
      monthlyMaintenanceExpenseUsd,
      effectiveMaintCpmUsd,
      maintCpm: effectiveMaintCpmUsd,
      idlePercentage: perf.idlePercentage,
      idleRatioPct: perf.idlePercentage,
      harshEvents,
      harshBrakingAndAccel: harshEvents,
      trendClassification,
      trendFinding,
      noticedPatternInsight: trendFinding,
    };
  });

  return {
    maintenancePerTruck,
    revenuePerEquipment,
    revenuePerLane,
    revenueByTruckType,
    fuelRangesByScope,
    fuelExpenseRanges: fuelRangesByScope,
    driverTrends,
    driverExpenseTrends: driverTrends,
  };
}



