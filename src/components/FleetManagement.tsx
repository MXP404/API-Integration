import React from 'react';
import { 
  Users, 
  Truck, 
  ShieldCheck, 
  Phone, 
  Clock, 
  MapPin, 
  AlertTriangle,
  BatteryCharging,
  Thermometer,
  Fuel
} from 'lucide-react';
import { Driver, Equipment } from '../types/dispatch';
import { formatEquipment, formatHosTime } from '../utils/formatters';

interface FleetManagementProps {
  drivers: Driver[];
  equipment: Equipment[];
}

export const FleetManagement: React.FC<FleetManagementProps> = ({
  drivers,
  equipment,
}) => {
  return (
    <div className="space-y-8">
      {/* Drivers Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-500" />
              Active Commercial Drivers & HOS Telematics
            </h2>
            <div className="text-xs text-neutral-500 mt-0.5">
              FMCSA ELD Hours of Service compliance & unit allocations
            </div>
          </div>
          <span className="text-xs font-mono text-neutral-500">
            {drivers.length} Certified Drivers Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drivers.map((driver) => {
            const driveHos = formatHosTime(driver.hosDrivingMinutesRemaining);
            const dutyHos = formatHosTime(driver.hosDutyMinutesRemaining);
            const cycleHos = formatHosTime(driver.hosCycleMinutesRemaining);

            return (
              <div
                key={driver.id}
                className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4"
              >
                {/* Driver Identity */}
                <div className="flex items-start gap-3">
                  {driver.avatarUrl ? (
                    <img
                      src={driver.avatarUrl}
                      alt={driver.name}
                      className="w-12 h-12 rounded-full object-cover border border-neutral-200 dark:border-neutral-800 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center font-bold text-neutral-700 dark:text-neutral-300">
                      {driver.name.substring(0, 2)}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="font-semibold text-sm text-neutral-900 dark:text-white truncate">
                        {driver.name}
                      </h3>
                      <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                        {driver.safetyScore}/100 Safe
                      </span>
                    </div>

                    <div className="text-xs text-neutral-500 truncate mt-0.5">
                      {driver.cdlNumber}
                    </div>

                    <div className="text-xs text-neutral-500 flex items-center gap-1.5 mt-1">
                      <Phone className="w-3 h-3 text-neutral-400" />
                      <span>{driver.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Duty & Assignment */}
                <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800/80 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Unit Allocation:</span>
                    <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-200">
                      {driver.assignedTruckId} / {driver.assignedTrailerId}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Location:</span>
                    <span className="font-medium text-neutral-800 dark:text-neutral-200">
                      {driver.currentCity}, {driver.currentState} ({driver.currentSpeedMph} mph)
                    </span>
                  </div>
                </div>

                {/* HOS Clocks (Hours of Service) */}
                <div className="space-y-2 pt-1 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider flex items-center justify-between">
                    <span>HOS Clocks</span>
                    <span className="text-[10px] font-normal lowercase font-mono">ELD Live</span>
                  </div>

                  {/* Driving Clock (11h) */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-neutral-500">Drive (11h limit):</span>
                      <span className={`font-mono font-bold ${driveHos.isCritical ? 'text-rose-600 dark:text-rose-400' : 'text-neutral-900 dark:text-neutral-100'}`}>
                        {driveHos.text}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${driveHos.isCritical ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(100, (driver.hosDrivingMinutesRemaining / 660) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* On-Duty Clock (14h) */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-neutral-500">Shift Duty (14h limit):</span>
                      <span className="font-mono font-semibold text-neutral-900 dark:text-neutral-100">
                        {dutyHos.text}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${Math.min(100, (driver.hosDutyMinutesRemaining / 840) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Cycle Clock (70h/8d) */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-neutral-500">70h / 8-Day Cycle:</span>
                      <span className="font-mono text-neutral-600 dark:text-neutral-400">
                        {cycleHos.text}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-neutral-400 dark:bg-neutral-600 rounded-full"
                        style={{ width: `${Math.min(100, (driver.hosCycleMinutesRemaining / 4200) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Equipment Inventory Section */}
      <div className="space-y-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-500" />
              Fleet Equipment & Trailer Telematics
            </h2>
            <div className="text-xs text-neutral-500 mt-0.5">
              Tractor health, Reefer temperatures, and maintenance readiness
            </div>
          </div>
          <span className="text-xs font-mono text-neutral-500">
            {equipment.length} Units Cataloged
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {equipment.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-mono font-bold text-xs text-neutral-900 dark:text-white">
                    {item.id}
                  </div>
                  <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mt-0.5">
                    {item.unitNumber}
                  </div>
                  <div className="text-xs text-neutral-500 font-mono">
                    Plate: {item.plate} · {formatEquipment(item.type)}
                  </div>
                </div>

                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                  item.status === 'in_use'
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40'
                    : 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
                }`}>
                  {item.status === 'in_use' ? 'Assigned' : 'Available'}
                </span>
              </div>

              {/* Reefer Details if reefer */}
              {item.type === '53_REEFER' && (
                <div className="p-2.5 rounded-lg bg-sky-50/50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/40 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-sky-700 dark:text-sky-300 font-medium">
                    <Thermometer className="w-4 h-4 text-sky-500" />
                    <span>Reefer Setpoint: {item.reeferTempSetPointF}°F</span>
                  </div>
                  <div className="font-mono font-bold text-sky-900 dark:text-sky-200">
                    Live: {item.reeferCurrentTempF}°F
                  </div>
                </div>
              )}

              {/* Location & Fuel */}
              <div className="text-xs space-y-1.5 text-neutral-600 dark:text-neutral-400">
                <div className="flex items-center justify-between">
                  <span>Current Yard/Corridor:</span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-200">{item.currentLocation}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Fuel className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Fuel Tank:</span>
                  </span>
                  <span className="font-mono font-semibold text-neutral-900 dark:text-neutral-200">{item.fuelPercent}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
