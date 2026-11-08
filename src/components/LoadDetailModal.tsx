import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  DollarSign, 
  Truck, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Code2, 
  Phone,
  Building,
  UserCheck,
  Globe
} from 'lucide-react';
import { Driver, ForwarderIntegration, Load } from '../types/dispatch';
import { formatCurrency, formatEquipment, formatHosTime, formatWeight, getStatusDetails } from '../utils/formatters';

interface LoadDetailModalProps {
  load: Load | null;
  onClose: () => void;
  onUpdateStatus: (loadId: string, newStatus: Load['status'], milestoneLabel?: string) => void;
  onAssignDriver: (loadId: string, driverId: string) => void;
  onTransmitApiUpdate: (loadId: string, milestoneCode: string, label: string, notes?: string) => void;
  drivers: Driver[];
  forwarders: ForwarderIntegration[];
}

export const LoadDetailModal: React.FC<LoadDetailModalProps> = ({
  load,
  onClose,
  onUpdateStatus,
  onAssignDriver,
  onTransmitApiUpdate,
  drivers,
  forwarders,
}) => {
  if (!load) return null;

  const [activeTab, setActiveTab] = useState<'overview' | 'api_payload' | 'rate_con'>('overview');
  const [selectedDriverId, setSelectedDriverId] = useState<string>(load.assignedDriverId || '');
  const [customMilestoneNote, setCustomMilestoneNote] = useState('');
  const [milestoneType, setMilestoneType] = useState<'STATUS_IN_TRANSIT' | 'STATUS_ARRIVED_CONSIGNEE' | 'STATUS_DELIVERED_POD'>('STATUS_IN_TRANSIT');

  const forwarder = forwarders.find((f) => f.id === load.forwarderId);
  const driver = drivers.find((d) => d.id === load.assignedDriverId);
  const statusInfo = getStatusDetails(load.status);
  const ratePerMile = load.distanceMiles > 0 ? (load.totalRate / load.distanceMiles).toFixed(2) : '0.00';

  const handleDriverChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDriverId = e.target.value;
    setSelectedDriverId(newDriverId);
    if (newDriverId) {
      onAssignDriver(load.id, newDriverId);
    }
  };

  const handlePushMilestone = () => {
    let label = 'Status Broadcast';
    if (milestoneType === 'STATUS_IN_TRANSIT') label = 'In-Transit GPS Milestone';
    if (milestoneType === 'STATUS_ARRIVED_CONSIGNEE') label = 'Arrived at Consignee Facility';
    if (milestoneType === 'STATUS_DELIVERED_POD') label = 'Delivered & POD Verified';

    onTransmitApiUpdate(load.id, milestoneType, label, customMilestoneNote || undefined);
    setCustomMilestoneNote('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-4 bg-neutral-50 dark:bg-neutral-950">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold font-mono tracking-tight text-neutral-900 dark:text-neutral-100">
              {load.loadNumber}
            </span>
            <span className="text-xs text-neutral-400">·</span>
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
              Ref: <span className="font-mono text-neutral-900 dark:text-white">{load.forwarderReference}</span>
            </span>
            <span className="text-xs text-neutral-400">·</span>
            <span className={`text-xs font-semibold ${statusInfo.colorClass}`}>
              {statusInfo.label} ({statusInfo.apiEndpointAction})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-neutral-200 dark:bg-neutral-800 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-medium'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('api_payload')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeTab === 'api_payload'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-medium'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                }`}
              >
                Forwarder API
              </button>
              <button
                onClick={() => setActiveTab('rate_con')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeTab === 'rate_con'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-medium'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                }`}
              >
                RateCon Agreement
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Banner depending on state */}
        <div className="px-6 py-2.5 bg-neutral-100 dark:bg-neutral-950/60 border-b border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
            <span className="font-semibold text-neutral-900 dark:text-neutral-200">Forwarder API:</span>
            <span>{forwarder?.name || 'Direct Broker'}</span>
            <span className="text-neutral-400">·</span>
            <span>Protocol: <code className="font-mono text-neutral-900 dark:text-neutral-200">{forwarder?.protocol}</code></span>
            <span className="text-neutral-400">·</span>
            <span>API State: <span className="font-medium text-emerald-600 dark:text-emerald-400">{load.lastApiTransmission}</span></span>
          </div>

          <div className="flex items-center gap-2">
            {load.status === 'tendered' && (
              <>
                <button
                  onClick={() => onUpdateStatus(load.id, 'booked', 'Accepted via Forwarder API POST /v1/tenders/accept')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-md shadow-xs transition-colors"
                >
                  Accept Tender (REST POST)
                </button>
                <button
                  onClick={() => onUpdateStatus(load.id, 'exception', 'Tender Rejected via API')}
                  className="px-3 py-1.5 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-medium rounded-md transition-colors"
                >
                  Decline
                </button>
              </>
            )}

            {load.status === 'booked' && (
              <button
                onClick={() => onUpdateStatus(load.id, 'dispatched', 'Driver Assigned & Dispatched via REST API')}
                disabled={!selectedDriverId}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-md shadow-xs transition-colors"
              >
                Dispatch Load
              </button>
            )}

            {load.status === 'dispatched' && (
              <button
                onClick={() => onUpdateStatus(load.id, 'in_transit', 'Loaded & En Route (POST /v1/milestones)')}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-md shadow-xs transition-colors"
              >
                Mark In-Transit
              </button>
            )}

            {load.status === 'in_transit' && (
              <button
                onClick={() => onUpdateStatus(load.id, 'at_delivery', 'Arrived at Consignee Dock')}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-md shadow-xs transition-colors"
              >
                Mark Arrived at Delivery
              </button>
            )}

            {load.status === 'at_delivery' && (
              <button
                onClick={() => onUpdateStatus(load.id, 'delivered', 'Unloaded & Electronic POD Transmitted via API')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-md shadow-xs transition-colors"
              >
                Complete Delivery & Transmit POD API
              </button>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {activeTab === 'overview' && (
            <>
              {/* Origin -> Destination Corridor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                {/* Shipper Origin */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    <Building className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Origin / Shipper Pick-Up</span>
                  </div>
                  <div className="font-semibold text-neutral-900 dark:text-white text-base">
                    {load.origin.facilityName}
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    {load.origin.address}
                  </div>
                  <div className="text-sm font-medium text-neutral-900 dark:text-neutral-200">
                    {load.origin.city}, {load.origin.state} {load.origin.zip}
                  </div>
                  <div className="pt-2 text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Appt: <strong className="text-neutral-900 dark:text-white font-mono">{load.origin.appointmentTime}</strong> ({load.origin.appointmentType})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Contact: {load.origin.contactName} · {load.origin.contactPhone}</span>
                    </div>
                  </div>
                </div>

                {/* Consignee Destination */}
                <div className="space-y-2 border-t md:border-t-0 md:border-l border-neutral-200 dark:border-neutral-800 pt-4 md:pt-0 md:pl-6">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    <Building className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Destination / Consignee Delivery</span>
                  </div>
                  <div className="font-semibold text-neutral-900 dark:text-white text-base">
                    {load.destination.facilityName}
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    {load.destination.address}
                  </div>
                  <div className="text-sm font-medium text-neutral-900 dark:text-neutral-200">
                    {load.destination.city}, {load.destination.state} {load.destination.zip}
                  </div>
                  <div className="pt-2 text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Appt: <strong className="text-neutral-900 dark:text-white font-mono">{load.destination.appointmentTime}</strong> ({load.destination.appointmentType})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Contact: {load.destination.contactName} · {load.destination.contactPhone}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metrics & Cargo Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                  <div className="text-xs text-neutral-500">Gross Freight Rate</div>
                  <div className="text-lg font-bold font-mono text-neutral-900 dark:text-white mt-0.5">
                    {formatCurrency(load.totalRate)}
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">
                    ${ratePerMile} / mi ({load.distanceMiles} mi)
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                  <div className="text-xs text-neutral-500">Carrier Margin</div>
                  <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {load.projectedMargin.toFixed(1)}%
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">
                    Driver Pay: {formatCurrency(load.driverPayRate)}
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                  <div className="text-xs text-neutral-500">Cargo & Weight</div>
                  <div className="text-sm font-semibold text-neutral-900 dark:text-white mt-0.5 truncate">
                    {formatWeight(load.weightLbs)}
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">
                    {load.palletCount} Pallets · {formatEquipment(load.equipmentType)}
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                  <div className="text-xs text-neutral-500">Special Requirements</div>
                  <div className="text-sm font-semibold text-neutral-900 dark:text-white mt-0.5 truncate">
                    {load.temperatureRequirement || 'Standard Dry Freight'}
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">
                    BOL: {load.bolNumber}
                  </div>
                </div>
              </div>

              {/* Driver & Unit Assignment */}
              <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-indigo-500" />
                    Assigned Driver & Unit Allocation
                  </span>
                  {driver && (
                    <span className="text-xs text-neutral-500 font-mono">
                      HOS Remaining: {formatHosTime(driver.hosDrivingMinutesRemaining).text} (Driving)
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-xs text-neutral-500 mb-1">Select Driver</label>
                    <select
                      value={selectedDriverId}
                      onChange={handleDriverChange}
                      className="w-full text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-md px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="">-- Unassigned --</option>
                      {drivers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.assignedTruckId} / {d.currentCity}, {d.currentState} - HOS: {Math.floor(d.hosDrivingMinutesRemaining / 60)}h)
                        </option>
                      ))}
                    </select>
                  </div>

                  {driver && (
                    <div className="flex items-center gap-3 pt-2 sm:pt-4">
                      {driver.avatarUrl && (
                        <img
                          src={driver.avatarUrl}
                          alt={driver.name}
                          className="w-10 h-10 rounded-full object-cover border border-neutral-200 dark:border-neutral-800"
                        />
                      )}
                      <div className="text-xs">
                        <div className="font-semibold text-neutral-900 dark:text-white">{driver.name}</div>
                        <div className="text-neutral-500 font-mono">{driver.assignedTruckId} · {driver.assignedTrailerId}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Live REST Milestone Tracker & API Broadcast Trigger */}
              <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                    <Send className="w-4 h-4 text-emerald-500" />
                    Transmit Real-Time Milestone to Forwarder REST API
                  </span>
                  <span className="text-xs text-neutral-500 font-mono">
                    POST {forwarder?.apiEndpoint}/milestones
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={milestoneType}
                    onChange={(e) => setMilestoneType(e.target.value as any)}
                    className="text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-md px-3 py-2 text-neutral-900 dark:text-neutral-100"
                  >
                    <option value="STATUS_IN_TRANSIT">POST /milestones: Rolling In-Transit (GPS)</option>
                    <option value="STATUS_ARRIVED_CONSIGNEE">POST /milestones: Arrived at Consignee</option>
                    <option value="STATUS_DELIVERED_POD">POST /milestones: Unloaded & Signed POD</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Optional milestone note (e.g. Mile Marker 42, weather clear)"
                    value={customMilestoneNote}
                    onChange={(e) => setCustomMilestoneNote(e.target.value)}
                    className="flex-1 text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-md px-3 py-2 text-neutral-900 dark:text-neutral-100"
                  />

                  <button
                    onClick={handlePushMilestone}
                    className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-white text-white dark:text-neutral-900 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Push API Update
                  </button>
                </div>

                {/* Milestone History */}
                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-2.5">
                  <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Transmitted API Milestone Trail
                  </div>
                  {load.milestones.length === 0 ? (
                    <div className="text-xs text-neutral-400 italic py-2">
                      No milestones broadcasted yet. Accept tender or dispatch to trigger API webhook push.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {load.milestones.map((m, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-neutral-900 dark:text-white">{m.label}</span>
                              <span className="text-neutral-400">·</span>
                              <span className="font-mono text-neutral-500">{m.timestamp}</span>
                              <span className="text-neutral-400">·</span>
                              <span className="text-neutral-500">{m.city}, {m.state}</span>
                            </div>
                            {m.notes && (
                              <div className="text-neutral-600 dark:text-neutral-400 mt-0.5">
                                {m.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Instructions */}
              {load.specialInstructions && (
                <div className="p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200">
                  <div className="font-semibold flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    Special Handling & Forwarder Compliance Instructions
                  </div>
                  {load.specialInstructions}
                </div>
              )}
            </>
          )}

          {activeTab === 'api_payload' && (
            <div className="space-y-4">
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                Live inspection of outbound REST JSON payload transmitted from LogixForward TMS to <strong className="text-neutral-900 dark:text-white">{forwarder?.name}</strong>.
              </div>

              <div className="p-4 rounded-lg bg-neutral-950 text-neutral-200 font-mono text-xs overflow-x-auto border border-neutral-800">
                <div className="text-neutral-500 pb-2 border-b border-neutral-800 mb-2 flex items-center justify-between">
                  <span>POST {forwarder?.apiEndpoint}/milestones</span>
                  <span className="text-emerald-400">200 OK (38ms)</span>
                </div>
                <pre>{JSON.stringify({
                  loadNumber: load.loadNumber,
                  forwarderReference: load.forwarderReference,
                  carrierScac: 'LXFW',
                  carrierDotNumber: '3819201',
                  status: load.status,
                  equipment: load.equipmentType,
                  driver: driver ? {
                    name: driver.name,
                    phone: driver.phone,
                    cdl: driver.cdlNumber,
                    truck: driver.assignedTruckId,
                    trailer: driver.assignedTrailerId,
                    currentCoords: { lat: driver.lat, lng: driver.lng },
                  } : null,
                  linehaul: load.linehaulRate,
                  fuelSurcharge: load.fuelSurcharge,
                  totalRate: load.totalRate,
                  latestMilestone: load.milestones[load.milestones.length - 1] || null,
                  electronicSignature: `CERT_${load.rateConNumber}`,
                }, null, 2)}</pre>
              </div>
            </div>
          )}

          {activeTab === 'rate_con' && (
            <div className="p-6 rounded-lg bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-4 font-sans text-neutral-900 dark:text-neutral-100">
              <div className="flex justify-between items-start border-b border-neutral-200 dark:border-neutral-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold">CARRIER LOAD CONFIRMATION & RATE AGREEMENT</h3>
                  <div className="text-xs text-neutral-500 font-mono mt-1">
                    CONFIRMATION #: {load.rateConNumber} · FWD REF: {load.forwarderReference}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{forwarder?.name}</div>
                  <div className="text-xs text-neutral-500">Carrier: LogixForward Transport LLC</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs py-2">
                <div>
                  <strong className="block text-neutral-500">PICKUP:</strong>
                  <div>{load.origin.facilityName}</div>
                  <div>{load.origin.address}, {load.origin.city}, {load.origin.state}</div>
                  <div className="font-mono text-neutral-600 dark:text-neutral-400 mt-1">APPT: {load.origin.appointmentTime}</div>
                </div>
                <div>
                  <strong className="block text-neutral-500">DELIVERY:</strong>
                  <div>{load.destination.facilityName}</div>
                  <div>{load.destination.address}, {load.destination.city}, {load.destination.state}</div>
                  <div className="font-mono text-neutral-600 dark:text-neutral-400 mt-1">APPT: {load.destination.appointmentTime}</div>
                </div>
              </div>

              <div className="border-t border-b border-neutral-200 dark:border-neutral-800 py-3 flex justify-between text-sm">
                <div>
                  <div className="text-xs text-neutral-500">Commodity & Weight</div>
                  <div className="font-medium">{load.commodity} ({formatWeight(load.weightLbs)})</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-neutral-500">Agreed Total Rate</div>
                  <div className="text-base font-bold font-mono text-indigo-600 dark:text-indigo-400">{formatCurrency(load.totalRate)}</div>
                </div>
              </div>

              <div className="text-[11px] text-neutral-500 leading-relaxed">
                Carrier agrees to provide clean, roadworthy equipment matching the specifications above. Driver must call in for dispatch, check-in at all stops, and verify piece count and temperature where applicable. Detention requires forwarder notification 1 hour prior to completion of free time (2 hours). Electronic POD required within 24 hours of delivery.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
