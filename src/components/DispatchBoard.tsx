import React, { useState } from 'react';
import { 
  Search, 
  LayoutGrid, 
  List, 
  ArrowRight, 
  Truck, 
  Clock, 
  DollarSign, 
  AlertCircle, 
  RefreshCw
} from 'lucide-react';
import { Driver, ForwarderIntegration, Load, LoadStatus } from '../types/dispatch';
import { DispatchGrid } from './DispatchGrid';
import { formatCurrency, formatEquipment, formatWeight } from '../utils/formatters';

interface DispatchBoardProps {
  loads: Load[];
  forwarders: ForwarderIntegration[];
  drivers: Driver[];
  onSelectLoad: (load: Load) => void;
  onUpdateStatus: (loadId: string, newStatus: Load['status'], milestoneLabel?: string) => void;
  onAssignDriver: (loadId: string, driverId: string) => void;
  onOpenNewLoad: () => void;
  onTriggerForwarderSync: () => void;
  isSyncing: boolean;
}

export const DispatchBoard: React.FC<DispatchBoardProps> = ({
  loads,
  forwarders,
  drivers,
  onSelectLoad,
  onUpdateStatus,
  onAssignDriver,
  onOpenNewLoad,
  onTriggerForwarderSync,
  isSyncing,
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'grid'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedForwarderFilter, setSelectedForwarderFilter] = useState('ALL');
  const [selectedEquipmentFilter, setSelectedEquipmentFilter] = useState('ALL');

  // Filter loads
  const filteredLoads = loads.filter((load) => {
    const matchesSearch = 
      load.loadNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      load.forwarderReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      load.commodity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      load.origin.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      load.destination.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesForwarder = 
      selectedForwarderFilter === 'ALL' || load.forwarderId === selectedForwarderFilter;

    const matchesEquipment = 
      selectedEquipmentFilter === 'ALL' || load.equipmentType === selectedEquipmentFilter;

    return matchesSearch && matchesForwarder && matchesEquipment;
  });

  // Calculate high-level KPIs
  const totalRevenue = loads.reduce((acc, l) => acc + l.totalRate, 0);
  const activeInTransitCount = loads.filter((l) => l.status === 'in_transit' || l.status === 'dispatched').length;
  const pendingTendersCount = loads.filter((l) => l.status === 'tendered').length;
  const exceptionCount = loads.filter((l) => l.status === 'exception').length;

  const kanbanColumns: { id: LoadStatus; title: string; count: number }[] = [
    { id: 'tendered', title: 'Tenders Offered (API Inbound)', count: filteredLoads.filter((l) => l.status === 'tendered').length },
    { id: 'booked', title: 'Booked / Confirmed', count: filteredLoads.filter((l) => l.status === 'booked').length },
    { id: 'dispatched', title: 'Dispatched to Shipper', count: filteredLoads.filter((l) => l.status === 'dispatched').length },
    { id: 'in_transit', title: 'Rolling In-Transit', count: filteredLoads.filter((l) => l.status === 'in_transit').length },
    { id: 'at_delivery', title: 'At Consignee / Delivery', count: filteredLoads.filter((l) => l.status === 'at_delivery').length },
    { id: 'delivered', title: 'Delivered (POD Verified)', count: filteredLoads.filter((l) => l.status === 'delivered').length },
  ];

  const handleQuickAdvance = (loadId: string) => {
    const load = loads.find((l) => l.id === loadId);
    if (!load) return;

    if (load.status === 'tendered') {
      onUpdateStatus(loadId, 'booked', 'Accepted via Forwarder REST API POST /v1/tenders/accept');
    } else if (load.status === 'booked') {
      onUpdateStatus(loadId, 'dispatched', 'Dispatched to Shipper Dock');
    } else if (load.status === 'dispatched') {
      onUpdateStatus(loadId, 'in_transit', 'Loaded & En Route (POST /v1/milestones)');
    } else if (load.status === 'in_transit') {
      onUpdateStatus(loadId, 'at_delivery', 'Arrived at Destination Consignee');
    } else if (load.status === 'at_delivery') {
      onUpdateStatus(loadId, 'delivered', 'Unloaded & Electronic POD Uploaded via API');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top 4-Column KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Total Active Freight Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="mt-1 text-xs text-neutral-500 flex items-center gap-1.5">
            <span>{loads.length} Managed Shipments</span>
            <span>·</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono">Avg 33.6% Margin</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Active In-Transit Units</span>
            <Truck className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100">
            {activeInTransitCount} <span className="text-sm font-normal text-neutral-400">rolling</span>
          </div>
          <div className="mt-1 text-xs text-neutral-500 flex items-center gap-1.5">
            <span>Real-time GPS telematics synced via API</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Forwarder API Tenders to Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
            {pendingTendersCount} <span className="text-sm font-normal text-neutral-400">pending</span>
          </div>
          <div className="mt-1 text-xs text-neutral-500">
            Auto-acceptance threshold: <span className="font-mono text-neutral-800 dark:text-neutral-200">$2.75+/mi</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Exceptions & Holds</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
            {exceptionCount} <span className="text-sm font-normal text-neutral-400">alert</span>
          </div>
          <div className="mt-1 text-xs text-neutral-500">
            Automated forwarder REST webhook alert sent
          </div>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Filter by Load #, Forwarder Ref, City, Commodity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedForwarderFilter}
              onChange={(e) => setSelectedForwarderFilter(e.target.value)}
              className="text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg px-2.5 py-2 text-neutral-900 dark:text-neutral-100"
            >
              <option value="ALL">All Forwarder APIs</option>
              {forwarders.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>

            <select
              value={selectedEquipmentFilter}
              onChange={(e) => setSelectedEquipmentFilter(e.target.value)}
              className="text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg px-2.5 py-2 text-neutral-900 dark:text-neutral-100"
            >
              <option value="ALL">All Equipment</option>
              <option value="53_DRY_VAN">53' Dry Van</option>
              <option value="53_REEFER">53' Reefer</option>
              <option value="48_FLATBED">48' Flatbed</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onTriggerForwarderSync}
            disabled={isSyncing}
            className="px-3 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-500' : 'text-neutral-400'}`} />
            <span>{isSyncing ? 'Syncing APIs...' : 'Poll Forwarder APIs'}</span>
          </button>

          <div className="flex items-center bg-neutral-100 dark:bg-neutral-950 p-1 rounded-lg border border-neutral-200 dark:border-neutral-800">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
              }`}
              title="Kanban Board View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
              }`}
              title="High-Density Grid View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Viewport Content */}
      {viewMode === 'grid' ? (
        <DispatchGrid
          loads={filteredLoads}
          forwarders={forwarders}
          drivers={drivers}
          onSelectLoad={onSelectLoad}
          onAssignDriver={onAssignDriver}
          onQuickAdvance={handleQuickAdvance}
        />
      ) : (
        /* Kanban Pipeline Lanes */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start">
          {kanbanColumns.map((col) => {
            const laneLoads = filteredLoads.filter((l) => l.status === col.id);

            return (
              <div 
                key={col.id}
                className="bg-neutral-50/70 dark:bg-neutral-950/70 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 space-y-3 min-h-[500px]"
              >
                {/* Lane Header */}
                <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800">
                  <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 truncate">
                    {col.title}
                  </span>
                  <span className="text-xs font-mono font-medium text-neutral-500 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-2 py-0.5 rounded-md">
                    {laneLoads.length}
                  </span>
                </div>

                {/* Cards in Lane */}
                <div className="space-y-3">
                  {laneLoads.length === 0 ? (
                    <div className="p-4 text-center text-xs text-neutral-400 italic">
                      No active shipments
                    </div>
                  ) : (
                    laneLoads.map((load) => {
                      const forwarder = forwarders.find((f) => f.id === load.forwarderId);
                      const driver = drivers.find((d) => d.id === load.assignedDriverId);

                      return (
                        <div
                          key={load.id}
                          onClick={() => onSelectLoad(load)}
                          className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:shadow-sm cursor-pointer transition-all space-y-2.5"
                        >
                          {/* Top Card Info */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono font-bold text-xs text-neutral-900 dark:text-neutral-100">
                              {load.loadNumber}
                            </span>
                            <span className="text-[11px] font-mono text-neutral-500 truncate max-w-[100px]">
                              {load.forwarderReference}
                            </span>
                          </div>

                          {/* Route Origin -> Dest */}
                          <div className="text-xs space-y-1">
                            <div className="flex items-center gap-1.5 text-neutral-900 dark:text-neutral-200 font-semibold truncate">
                              <span>{load.origin.city}, {load.origin.state}</span>
                              <ArrowRight className="w-3 h-3 text-neutral-400 shrink-0" />
                              <span>{load.destination.city}, {load.destination.state}</span>
                            </div>
                            <div className="text-[11px] text-neutral-500">
                              {load.distanceMiles} mi · {formatEquipment(load.equipmentType).split(' ')[0]}
                            </div>
                          </div>

                          {/* Cargo & Weight */}
                          <div className="text-[11px] text-neutral-600 dark:text-neutral-400 truncate">
                            {load.commodity} ({formatWeight(load.weightLbs)})
                          </div>

                          {/* Rate & Driver Info */}
                          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
                            <div>
                              <div className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
                                {formatCurrency(load.totalRate)}
                              </div>
                              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                                +{load.projectedMargin.toFixed(0)}% Margin
                              </div>
                            </div>

                            <div className="text-right">
                              {driver ? (
                                <div className="text-[11px] font-medium text-neutral-900 dark:text-neutral-200">
                                  {driver.name.split(' ')[0]}
                                </div>
                              ) : (
                                <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                                  Unassigned
                                </div>
                              )}
                              <div className="text-[10px] text-neutral-400 font-mono">
                                {forwarder?.code || 'FWD'} API
                              </div>
                            </div>
                          </div>

                          {/* 1-Click Action Button */}
                          <div className="pt-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuickAdvance(load.id);
                              }}
                              className="w-full py-1 text-[11px] font-medium text-center bg-neutral-100 dark:bg-neutral-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 text-neutral-700 dark:text-neutral-300 rounded transition-colors"
                            >
                              {load.status === 'tendered' ? 'Accept (REST POST)' : 'Advance Milestone'}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
