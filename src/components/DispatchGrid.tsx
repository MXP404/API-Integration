import React from 'react';
import { 
  ChevronRight, 
  AlertCircle
} from 'lucide-react';
import { Driver, ForwarderIntegration, Load } from '../types/dispatch';
import { formatCurrency, formatEquipment, formatWeight, getStatusDetails } from '../utils/formatters';

interface DispatchGridProps {
  loads: Load[];
  forwarders: ForwarderIntegration[];
  drivers: Driver[];
  onSelectLoad: (load: Load) => void;
  onAssignDriver: (loadId: string, driverId: string) => void;
  onQuickAdvance: (loadId: string) => void;
}

export const DispatchGrid: React.FC<DispatchGridProps> = ({
  loads,
  forwarders,
  drivers,
  onSelectLoad,
  onAssignDriver,
  onQuickAdvance,
}) => {
  return (
    <div className="overflow-x-auto border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-900 shadow-xs">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-950/80 text-neutral-500 uppercase tracking-wider font-semibold">
            <th className="py-3 px-4">Load # / Forwarder API</th>
            <th className="py-3 px-4">Origin / Pick-Up</th>
            <th className="py-3 px-4">Destination / Delivery</th>
            <th className="py-3 px-4">Equipment & Cargo</th>
            <th className="py-3 px-4 text-right">Gross Pay</th>
            <th className="py-3 px-4 text-right">Margin</th>
            <th className="py-3 px-4">Driver / Unit</th>
            <th className="py-3 px-4">API Milestone Status</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 font-sans">
          {loads.length === 0 ? (
            <tr>
              <td colSpan={9} className="py-12 text-center text-neutral-500">
                No loads match the current filter criteria.
              </td>
            </tr>
          ) : (
            loads.map((load) => {
              const forwarder = forwarders.find((f) => f.id === load.forwarderId);
              const driver = drivers.find((d) => d.id === load.assignedDriverId);
              const statusDetails = getStatusDetails(load.status);

              return (
                <tr 
                  key={load.id}
                  onClick={() => onSelectLoad(load)}
                  className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer transition-colors group"
                >
                  {/* Load # & Forwarder */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-mono font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                      <span>{load.loadNumber}</span>
                      {load.status === 'exception' && (
                        <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      )}
                    </div>
                    <div className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5">
                      <span className="font-semibold text-neutral-700 dark:text-neutral-300">{forwarder?.code || 'FWD'}</span>
                      <span>·</span>
                      <span className="font-mono truncate max-w-[110px]">{load.forwarderReference}</span>
                    </div>
                  </td>

                  {/* Origin */}
                  <td className="py-3 px-4 max-w-[200px]">
                    <div className="font-semibold text-neutral-900 dark:text-neutral-200 truncate">
                      {load.origin.city}, {load.origin.state}
                    </div>
                    <div className="text-[11px] text-neutral-500 truncate mt-0.5">
                      {load.origin.appointmentTime}
                    </div>
                  </td>

                  {/* Destination */}
                  <td className="py-3 px-4 max-w-[200px]">
                    <div className="font-semibold text-neutral-900 dark:text-neutral-200 truncate">
                      {load.destination.city}, {load.destination.state}
                    </div>
                    <div className="text-[11px] text-neutral-500 truncate mt-0.5">
                      {load.destination.appointmentTime}
                    </div>
                  </td>

                  {/* Equipment & Commodity */}
                  <td className="py-3 px-4 max-w-[190px]">
                    <div className="text-neutral-900 dark:text-neutral-200 truncate font-medium">
                      {load.commodity}
                    </div>
                    <div className="text-[11px] text-neutral-500 mt-0.5 flex items-center gap-1">
                      <span>{formatEquipment(load.equipmentType).split(' ')[0]}</span>
                      <span>·</span>
                      <span className="font-mono">{formatWeight(load.weightLbs)}</span>
                    </div>
                  </td>

                  {/* Gross Pay */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
                      {formatCurrency(load.totalRate)}
                    </div>
                    <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
                      {load.distanceMiles} mi
                    </div>
                  </td>

                  {/* Margin */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      {load.projectedMargin.toFixed(1)}%
                    </div>
                    <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
                      Pay {formatCurrency(load.driverPayRate)}
                    </div>
                  </td>

                  {/* Driver Allocation */}
                  <td className="py-3 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    {driver ? (
                      <div>
                        <div className="font-medium text-neutral-900 dark:text-white flex items-center gap-1">
                          <span>{driver.name}</span>
                        </div>
                        <div className="text-[11px] text-neutral-500 font-mono">
                          {driver.assignedTruckId}
                        </div>
                      </div>
                    ) : (
                      <select
                        value=""
                        onChange={(e) => onAssignDriver(load.id, e.target.value)}
                        className="text-[11px] bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-2 py-1 text-neutral-700 dark:text-neutral-300"
                      >
                        <option value="">+ Assign Driver</option>
                        {drivers.map((d) => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    )}
                  </td>

                  {/* API Milestone */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className={`font-semibold ${statusDetails.colorClass}`}>
                      {statusDetails.label}
                    </div>
                    <div className="text-[11px] text-neutral-500 font-mono truncate max-w-[140px] mt-0.5">
                      {load.lastApiTransmission.split('(')[0] || 'REST Synced'}
                    </div>
                  </td>

                  {/* Quick Action */}
                  <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onQuickAdvance(load.id)}
                        title="Advance Status"
                        className="px-2 py-1 text-[11px] font-medium bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded border border-neutral-200 dark:border-neutral-700 transition-colors"
                      >
                        {load.status === 'tendered' ? 'Accept' : 'Advance'}
                      </button>
                      <button
                        onClick={() => onSelectLoad(load)}
                        className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
