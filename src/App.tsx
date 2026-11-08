import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DispatchBoard } from './components/DispatchBoard';
import { FleetManagement } from './components/FleetManagement';
import { ForwarderApiHub } from './components/ForwarderApiHub';
import { TelematicsMap } from './components/TelematicsMap';
import { RateConfirmationsView } from './components/RateConfirmationsView';
import { SmartMatchBoard } from './components/SmartMatchBoard';
import { LoadDetailModal } from './components/LoadDetailModal';
import { NewLoadModal } from './components/NewLoadModal';
import { UIDecisionsDrawer } from './components/UIDecisionsDrawer';
import { 
  INITIAL_DRIVERS, 
  INITIAL_EQUIPMENT, 
  INITIAL_FORWARDERS, 
  INITIAL_LOADS, 
  INITIAL_API_LOGS 
} from './data/mockData';
import { Driver, Equipment, ForwarderApiLog, ForwarderIntegration, Load, LoadStatus } from './types/dispatch';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dispatch' | 'smart_match' | 'fleet' | 'api_hub' | 'rate_cons' | 'map'>('dispatch');
  const [loads, setLoads] = useState<Load[]>(INITIAL_LOADS);
  const [forwarders, setForwarders] = useState<ForwarderIntegration[]>(INITIAL_FORWARDERS);
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [equipment, setEquipment] = useState<Equipment[]>(INITIAL_EQUIPMENT);
  const [apiLogs, setApiLogs] = useState<ForwarderApiLog[]>(INITIAL_API_LOGS);

  // Modals & Panels
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);
  const [isNewLoadModalOpen, setIsNewLoadModalOpen] = useState(false);
  const [isUIDecisionsOpen, setIsUIDecisionsOpen] = useState(false);

  // Theme & Preferences
  const [isDark, setIsDark] = useState(true);
  const [densityMode, setDensityMode] = useState<'compact' | 'spacious'>('compact');
  const [protocolDisplay, setProtocolDisplay] = useState<'api_technical' | 'business_plain'>('api_technical');
  const [isSyncing, setIsSyncing] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Status updates & automated Forwarder API transmission
  const handleUpdateStatus = (loadId: string, newStatus: LoadStatus, milestoneLabel?: string) => {
    setLoads((prevLoads) =>
      prevLoads.map((load) => {
        if (load.id !== loadId) return load;

        const forwarder = forwarders.find((f) => f.id === load.forwarderId);
        const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });

        const updatedMilestones = [
          ...load.milestones,
          {
            code: newStatus === 'in_transit' ? 'STATUS_IN_TRANSIT' as const : 'STATUS_DISPATCHED' as const,
            label: milestoneLabel || `Status advanced to ${newStatus}`,
            timestamp,
            city: load.origin.city,
            state: load.origin.state,
          },
        ];

        // Trigger simulated outbound REST API event
        const newLog: ForwarderApiLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
          forwarderId: load.forwarderId,
          forwarderName: forwarder?.name || 'Direct Broker',
          method: 'POST',
          endpoint: `/v1/shipments/${load.loadNumber}/milestones`,
          statusCode: 200,
          durationMs: Math.floor(35 + Math.random() * 45),
          type: 'status_milestone',
          direction: 'outbound',
          payloadSummary: `Status Update (${newStatus.toUpperCase()}): ${load.loadNumber} -> ${forwarder?.name}`,
          rawPayload: {
            loadNumber: load.loadNumber,
            forwarderRef: load.forwarderReference,
            newStatus,
            milestone: milestoneLabel || newStatus,
            reportedTimestampIso: new Date().toISOString(),
          },
          responseBody: {
            status: 'ACCEPTED_200',
            syncedWithCarrierNetwork: true,
          },
        };

        setApiLogs((prev) => [newLog, ...prev]);

        return {
          ...load,
          status: newStatus,
          apiSyncState: 'synced',
          lastApiTransmission: `Just now (${newStatus.toUpperCase()})`,
          milestones: updatedMilestones,
        };
      })
    );

    // If active modal is open, sync it
    if (selectedLoad && selectedLoad.id === loadId) {
      setSelectedLoad((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    showToast(`Load ${loadId} status advanced. Milestone transmitted to Forwarder REST API (HTTP 200 OK).`);
  };

  // Driver Assignment
  const handleAssignDriver = (loadId: string, driverId: string) => {
    const driver = drivers.find((d) => d.id === driverId);

    setLoads((prev) =>
      prev.map((load) => {
        if (load.id !== loadId) return load;

        return {
          ...load,
          assignedDriverId: driverId,
          assignedTruckId: driver?.assignedTruckId,
          assignedTrailerId: driver?.assignedTrailerId,
          status: load.status === 'tendered' ? 'booked' : load.status,
          apiSyncState: 'synced',
          lastApiTransmission: `Assigned to ${driver?.name}`,
        };
      })
    );

    if (selectedLoad && selectedLoad.id === loadId) {
      setSelectedLoad((prev) => (prev ? { ...prev, assignedDriverId: driverId } : null));
    }

    if (driver) {
      showToast(`Driver ${driver.name} assigned to unit ${driver.assignedTruckId}.`);
    }
  };

  // Handle Smart Match assignment & REST API transmission
  const handleAssignRunToDriver = (jobNo: string, driverName: string, equipmentUnit: string) => {
    const driver = drivers.find((d) => d.name.toLowerCase() === driverName.toLowerCase()) || drivers[0];
    
    // Also sync load if matching jobNo exists
    setLoads((prev) =>
      prev.map((load) => {
        if (load.loadNumber.includes(jobNo) || load.forwarderReference.includes(jobNo)) {
          return {
            ...load,
            assignedDriverId: driver.id,
            assignedTruckId: equipmentUnit,
            status: load.status === 'tendered' ? 'booked' : load.status,
            apiSyncState: 'synced',
            lastApiTransmission: `Assigned to ${driverName} via Smart Match`,
          };
        }
        return load;
      })
    );

    const log: ForwarderApiLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      forwarderId: 'fwd-smartmatch',
      forwarderName: 'Smart Match Decision 136 Engine',
      method: 'POST',
      endpoint: `/v1/dispatch/confirm`,
      statusCode: 200,
      durationMs: 31,
      type: 'status_milestone',
      direction: 'outbound',
      payloadSummary: `Confirmed Driver ${driverName} on Unit ${equipmentUnit} for Run ${jobNo} (Algorithmic FIT Score)`,
      rawPayload: {
        jobNo,
        driverName,
        equipmentUnit,
        confirmedAt: new Date().toISOString(),
        protocol: 'REST_JSON_V1',
        carrierDot: 'USDOT 1263850'
      },
      responseBody: {
        success: true,
        dispatchStatus: 'CONFIRMED',
        carrierDot: 'USDOT 1263850',
        brokerAcknowledged: true
      }
    };
    setApiLogs((prev) => [log, ...prev]);
    showToast(`Run ${jobNo} confirmed for ${driverName} (${equipmentUnit}) via REST API POST /v1/dispatch/confirm.`);
  };

  // Transmit custom milestone
  const handleTransmitApiUpdate = (loadId: string, milestoneCode: string, label: string, notes?: string) => {
    const load = loads.find((l) => l.id === loadId);
    if (!load) return;

    const forwarder = forwarders.find((f) => f.id === load.forwarderId);
    const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });

    const newMilestone = {
      code: milestoneCode as any,
      label,
      timestamp,
      city: load.origin.city,
      state: load.origin.state,
      notes,
    };

    setLoads((prev) =>
      prev.map((l) => (l.id === loadId ? {
        ...l,
        lastApiTransmission: `Just now (${milestoneCode})`,
        milestones: [...l.milestones, newMilestone],
      } : l))
    );

    if (selectedLoad && selectedLoad.id === loadId) {
      setSelectedLoad((prev) => (prev ? { ...prev, milestones: [...prev.milestones, newMilestone] } : null));
    }

    const newLog: ForwarderApiLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      forwarderId: load.forwarderId,
      forwarderName: forwarder?.name || 'Direct Broker',
      method: 'POST',
      endpoint: `/v1/shipments/${load.loadNumber}/milestones`,
      statusCode: 200,
      durationMs: Math.floor(40 + Math.random() * 30),
      type: 'status_milestone',
      direction: 'outbound',
      payloadSummary: `Milestone Broadcast (${milestoneCode}): ${label} -> ${forwarder?.name}`,
      rawPayload: {
        loadNumber: load.loadNumber,
        milestoneCode,
        label,
        notes,
        reportedBy: 'Carrier Dispatch Desk',
      },
      responseBody: {
        forwarderAckId: `ack_${Date.now()}`,
        status: 'OK',
      },
    };

    setApiLogs((prev) => [newLog, ...prev]);
    showToast(`Broadcasted ${milestoneCode} to ${forwarder?.name} REST API successfully.`);
  };

  // Trigger API Test Ping
  const handleTriggerTestPing = (forwarderId: string) => {
    const fwd = forwarders.find((f) => f.id === forwarderId);
    if (!fwd) return;

    const newPing = Math.floor(32 + Math.random() * 35);
    setForwarders((prev) =>
      prev.map((f) => (f.id === forwarderId ? { ...f, lastPingMs: newPing, lastSyncTime: 'Just now' } : f))
    );

    showToast(`Pinged ${fwd.name} at ${fwd.apiEndpoint}: ${newPing}ms (HTTP 200 OK)`);
  };

  // Simulate Webhook Inbound
  const handleSimulateWebhook = (type: 'flexport_tender' | 'dsv_rate_bump' | 'expeditors_customs') => {
    if (type === 'flexport_tender') {
      const newLoad: Load = {
        id: `load-${Date.now()}`,
        loadNumber: `LX-${Math.floor(8935 + Math.random() * 100)}`,
        forwarderReference: `FLX-REST-${Math.floor(100000 + Math.random() * 900000)}`,
        forwarderId: 'fwd-flexport',
        status: 'tendered',
        commodity: 'Air Cargo Micro-Electronics (Urgent)',
        weightLbs: 26500,
        palletCount: 16,
        equipmentType: '53_DRY_VAN',
        origin: {
          facilityName: 'Flexport JFK Cargo Area B',
          address: 'Bldg 77 Federal Circle',
          city: 'Jamaica',
          state: 'NY',
          zip: '11430',
          lat: 40.6413,
          lng: -73.7781,
          appointmentTime: '2026-11-08 09:00 EST',
          appointmentType: 'Strict',
          contactName: 'JFK Expedited Desk',
          contactPhone: '+1 (718) 555-9080',
        },
        destination: {
          facilityName: 'Apple Distribution Center',
          address: '100 Gateway Blvd',
          city: 'Carlisle',
          state: 'PA',
          zip: '17013',
          lat: 40.2015,
          lng: -77.1889,
          appointmentTime: '2026-11-08 19:00 EST',
          appointmentType: 'Window',
          contactName: 'Receiving dock 4',
          contactPhone: '+1 (717) 555-1100',
        },
        distanceMiles: 188,
        deadheadMiles: 14,
        linehaulRate: 1950.00,
        fuelSurcharge: 240.00,
        accessorials: 0,
        totalRate: 2190.00,
        driverPayRate: 1450.00,
        projectedMargin: 33.8,
        rateConNumber: `RC-FLX-${Math.floor(1000 + Math.random() * 9000)}`,
        bolNumber: `BOL-FLX-${Math.floor(10000 + Math.random() * 90000)}`,
        specialInstructions: 'Inbound REST API webhook tender from Flexport air freight gateway.',
        apiSyncState: 'pending_ack',
        lastApiTransmission: 'Just arrived via Webhook (POST /v1/tenders)',
        milestones: [],
      };

      setLoads((prev) => [newLoad, ...prev]);

      const log: ForwarderApiLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
        forwarderId: 'fwd-flexport',
        forwarderName: 'Flexport Freight API',
        method: 'WEBHOOK',
        endpoint: '/api/webhooks/flexport/tenders',
        statusCode: 201,
        durationMs: 28,
        type: 'tender_offer',
        direction: 'inbound',
        payloadSummary: `Inbound Tender POST /v1/tenders: Jamaica, NY -> Carlisle, PA ($2,190.00)`,
        rawPayload: {
          event: 'tender.created',
          tenderId: newLoad.forwarderReference,
          offeredRate: 2190.00,
          commodity: newLoad.commodity,
        },
        responseBody: {
          received: true,
          loadQueuedInCarrierTMS: true,
        },
      };

      setApiLogs((prev) => [log, ...prev]);
      showToast('New Load Tender received via Flexport Webhook API!');
    } else if (type === 'dsv_rate_bump') {
      showToast('DSV Webhook: Approved rate revision +$250 on load LX-8925.');
    } else if (type === 'expeditors_customs') {
      showToast('Expeditors Webhook: US Customs 1C clearance approved for Phoenix CFS.');
    }
  };

  // Custom API Request tester
  const handleSendCustomApiRequest = (endpoint: string, payload: Record<string, unknown>) => {
    const newLog: ForwarderApiLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      forwarderId: 'fwd-custom',
      forwarderName: 'Target Forwarder',
      method: 'POST',
      endpoint,
      statusCode: 200,
      durationMs: Math.floor(45 + Math.random() * 30),
      type: 'status_milestone',
      direction: 'outbound',
      payloadSummary: `Transmitted custom REST payload to ${endpoint}`,
      rawPayload: payload,
      responseBody: {
        status: 'SUCCESS',
        forwarderReferenceAck: `ACK-${Date.now()}`,
        message: 'Milestone processed and relayed to shipper tracking portal',
      },
    };

    setApiLogs((prev) => [newLog, ...prev]);
    showToast(`API call transmitted to ${endpoint} (HTTP 200 OK, ${newLog.durationMs}ms)`);
  };

  // Poll all forwarders
  const handleTriggerForwarderSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setForwarders((prev) =>
        prev.map((f) => ({
          ...f,
          lastPingMs: Math.floor(35 + Math.random() * 40),
          lastSyncTime: 'Just now',
        }))
      );
      showToast('All 5 Freight Forwarder REST APIs synchronized.');
    }, 1200);
  };

  const handleAddLoad = (newLoad: Load) => {
    setLoads((prev) => [newLoad, ...prev]);
    showToast(`New load ${newLoad.loadNumber} added to dispatch board.`);
  };

  return (
    <div className={`min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors font-sans ${densityMode === 'compact' ? 'text-xs' : 'text-sm'}`}>
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewLoad={() => setIsNewLoadModalOpen(true)}
        onOpenUIDecisions={() => setIsUIDecisionsOpen(true)}
        forwarders={forwarders}
        isDark={isDark}
        toggleTheme={() => setIsDark((prev) => !prev)}
        connectedForwarderCount={forwarders.filter((f) => f.status === 'connected').length}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xl border border-neutral-700 dark:border-neutral-200 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage.text}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-2 text-neutral-400 hover:text-white dark:hover:text-neutral-900"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Container Viewport */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dispatch' && (
          <DispatchBoard
            loads={loads}
            forwarders={forwarders}
            drivers={drivers}
            onSelectLoad={(load) => setSelectedLoad(load)}
            onUpdateStatus={handleUpdateStatus}
            onAssignDriver={handleAssignDriver}
            onOpenNewLoad={() => setIsNewLoadModalOpen(true)}
            onTriggerForwarderSync={handleTriggerForwarderSync}
            isSyncing={isSyncing}
          />
        )}

        {activeTab === 'smart_match' && (
          <SmartMatchBoard
            onAssignRunToDriver={handleAssignRunToDriver}
          />
        )}

        {activeTab === 'map' && (
          <TelematicsMap
            loads={loads}
            drivers={drivers}
            equipment={equipment}
            onSelectLoad={(load) => setSelectedLoad(load)}
          />
        )}

        {activeTab === 'fleet' && (
          <FleetManagement
            drivers={drivers}
            equipment={equipment}
          />
        )}

        {activeTab === 'api_hub' && (
          <ForwarderApiHub
            forwarders={forwarders}
            apiLogs={apiLogs}
            onTriggerTestPing={handleTriggerTestPing}
            onSimulateWebhook={handleSimulateWebhook}
            onSendCustomApiRequest={handleSendCustomApiRequest}
          />
        )}

        {activeTab === 'rate_cons' && (
          <RateConfirmationsView
            loads={loads}
            forwarders={forwarders}
            onSelectLoad={(load) => setSelectedLoad(load)}
          />
        )}
      </main>

      {/* Detailed Load Dossier Modal */}
      <LoadDetailModal
        load={selectedLoad}
        onClose={() => setSelectedLoad(null)}
        onUpdateStatus={handleUpdateStatus}
        onAssignDriver={handleAssignDriver}
        onTransmitApiUpdate={handleTransmitApiUpdate}
        drivers={drivers}
        forwarders={forwarders}
      />

      {/* New Load Entry / API Tender Ingest Modal */}
      <NewLoadModal
        isOpen={isNewLoadModalOpen}
        onClose={() => setIsNewLoadModalOpen(false)}
        onAddLoad={handleAddLoad}
        forwarders={forwarders}
      />

      {/* UI Decisions & Architecture Slide-over Drawer */}
      <UIDecisionsDrawer
        isOpen={isUIDecisionsOpen}
        onClose={() => setIsUIDecisionsOpen(false)}
        densityMode={densityMode}
        setDensityMode={setDensityMode}
        protocolDisplay={protocolDisplay}
        setProtocolDisplay={setProtocolDisplay}
      />
    </div>
  );
}
