import React, { useState } from 'react';
import { 
  Truck, 
  MapPin, 
  Navigation, 
  Thermometer, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight,
  Maximize2,
  Radio
} from 'lucide-react';
import { Driver, Equipment, Load } from '../types/dispatch';
import { formatHosTime, getStatusDetails } from '../utils/formatters';
import { CHICAGOLAND_HUBS, HubGeofence } from '../data/moscosoSeedData';

interface TelematicsMapProps {
  loads: Load[];
  drivers: Driver[];
  equipment: Equipment[];
  onSelectLoad: (load: Load) => void;
}

export const TelematicsMap: React.FC<TelematicsMapProps> = ({
  loads,
  drivers,
  equipment,
  onSelectLoad,
}) => {
  const [selectedLoadId, setSelectedLoadId] = useState<string>(loads[0]?.id || '');
  const [activeLayer, setActiveLayer] = useState<'all' | 'reefer' | 'alerts'>('all');

  const selectedLoad = loads.find((l) => l.id === selectedLoadId) || loads[0];
  const assignedDriver = drivers.find((d) => d.id === selectedLoad?.assignedDriverId);
  const assignedEquipment = equipment.find((e) => e.id === selectedLoad?.assignedTruckId);

  // Filter plotted trucks
  const activeRollingLoads = loads.filter((l) => l.status === 'in_transit' || l.status === 'dispatched' || l.status === 'exception');

  // Normalized US Map coordinates projection (approximate US bounds: lat 25 to 50, lng -125 to -65)
  // Map dimensions 900x520
  const projectCoords = (lat: number, lng: number) => {
    const x = ((lng - (-124)) / ((-68) - (-124))) * 820 + 40;
    const y = ((50 - lat) / (50 - 24)) * 440 + 40;
    return { x: Math.max(20, Math.min(880, x)), y: Math.max(20, Math.min(480, y)) };
  };

  return (
    <div className="space-y-6">
      {/* Map Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
            Live Telematics & Freight Corridor Tracking
          </h2>
          <div className="text-xs text-neutral-500 mt-0.5">
            Real-time ELD telematic telemetry streamed to forwarder tracking portals
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveLayer('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeLayer === 'all'
                ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            All Corridors ({activeRollingLoads.length})
          </button>
          <button
            onClick={() => setActiveLayer('reefer')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeLayer === 'reefer'
                ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            Reefer Temp Telematics
          </button>
          <button
            onClick={() => setActiveLayer('alerts')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeLayer === 'alerts'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            Exceptions & Holds
          </button>
        </div>
      </div>

      {/* Map Viewport Area */}
      <div className="relative rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-950 overflow-hidden shadow-inner min-h-[500px]">
        {/* Subtle grid pattern background */}
        <div 
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `radial-gradient(#4f46e5 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* Vector SVG Map Container */}
        <svg 
          viewBox="0 0 900 520" 
          className="w-full h-full min-h-[500px] select-none"
        >
          {/* US Continental Outline / Interstate Corridors */}
          <g stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" fill="none">
            {/* Major Corridors: I-80, I-70, I-10, I-90 */}
            <path d="M 60,140 Q 250,180 500,200 T 840,190" strokeDasharray="4 4" />
            <path d="M 80,240 Q 300,260 550,250 T 820,230" strokeDasharray="4 4" />
            <path d="M 120,410 Q 360,420 620,400 T 800,380" strokeDasharray="4 4" />
            <path d="M 780,120 L 790,440" strokeDasharray="4 4" /> {/* I-95 */}
            <path d="M 520,130 L 530,420" strokeDasharray="4 4" /> {/* I-65/I-55 */}
          </g>

          {/* Plotted Route Lines for active loads */}
          {activeRollingLoads.map((load) => {
            const orig = projectCoords(load.origin.lat, load.origin.lng);
            const dest = projectCoords(load.destination.lat, load.destination.lng);
            const isSelected = selectedLoad?.id === load.id;
            const isException = load.status === 'exception';

            return (
              <g key={`route-${load.id}`}>
                {/* Arc line between origin and dest */}
                <path
                  d={`M ${orig.x},${orig.y} Q ${(orig.x + dest.x) / 2},${(orig.y + dest.y) / 2 - 25} ${dest.x},${dest.y}`}
                  fill="none"
                  stroke={isException ? '#f43f5e' : isSelected ? '#6366f1' : '#38bdf8'}
                  strokeWidth={isSelected ? 3 : 1.5}
                  strokeOpacity={isSelected ? 0.9 : 0.4}
                  strokeDasharray={isSelected ? 'none' : '4 3'}
                />

                {/* Origin Marker */}
                <circle
                  cx={orig.x}
                  cy={orig.y}
                  r={3.5}
                  fill="#38bdf8"
                  opacity={0.8}
                />

                {/* Destination Marker */}
                <circle
                  cx={dest.x}
                  cy={dest.y}
                  r={3.5}
                  fill="#10b981"
                  opacity={0.8}
                />
              </g>
            );
          })}

          {/* Chicagoland Freight Hubs & Customs Geofences */}
          {CHICAGOLAND_HUBS.map((hub) => {
            const hPos = projectCoords(hub.lat, hub.lng);
            return (
              <g key={`hub-${hub.id}`} transform={`translate(${hPos.x}, ${hPos.y})`}>
                <circle r={5} fill="#4f46e5" opacity={0.3} />
                <circle r={2.5} fill="#818cf8" />
                <text
                  x={7}
                  y={3}
                  fill="#94a3b8"
                  fontSize={8}
                  fontFamily="JetBrains Mono"
                  opacity={0.7}
                >
                  {hub.shortLabel}
                </text>
              </g>
            );
          })}

          {/* Active Truck Pins */}
          {activeRollingLoads.map((load) => {
            const driver = drivers.find((d) => d.id === load.assignedDriverId);
            if (!driver) return null;

            const pos = projectCoords(driver.lat, driver.lng);
            const isSelected = selectedLoad?.id === load.id;
            const isException = load.status === 'exception';

            return (
              <g 
                key={`truck-${load.id}`}
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={() => setSelectedLoadId(load.id)}
                className="cursor-pointer group"
              >
                {/* Pulse ring for selected truck */}
                {isSelected && (
                  <circle
                    r={18}
                    fill="none"
                    stroke={isException ? '#f43f5e' : '#6366f1'}
                    strokeWidth={2}
                    opacity={0.6}
                    className="animate-ping"
                  />
                )}

                {/* Vehicle Pin Circle */}
                <circle
                  r={10}
                  fill={isException ? '#e11d48' : isSelected ? '#4f46e5' : '#0284c7'}
                  stroke="#ffffff"
                  strokeWidth={2}
                />

                {/* Truck icon inside */}
                <foreignObject x={-6} y={-6} width={12} height={12}>
                  <Truck className="w-3 h-3 text-white" />
                </foreignObject>

                {/* Hover / Active Label */}
                <g transform="translate(14, -10)">
                  <rect
                    rx={4}
                    ry={4}
                    x={0}
                    y={0}
                    width={110}
                    height={22}
                    fill="rgba(15, 23, 42, 0.9)"
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth={0.5}
                  />
                  <text
                    x={6}
                    y={14}
                    fill="#ffffff"
                    fontSize={10}
                    fontFamily="JetBrains Mono"
                    fontWeight="bold"
                  >
                    {load.loadNumber} · {driver.currentSpeedMph}mph
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* Floating Telematics Info Card for Selected Unit */}
        {selectedLoad && (
          <div className="absolute bottom-4 left-4 right-4 md:left-6 md:right-auto md:w-96 bg-neutral-900/95 backdrop-blur-md border border-neutral-700/80 rounded-xl p-4 text-white shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-white">
                  {selectedLoad.loadNumber}
                </span>
                <span className="text-xs text-neutral-400">·</span>
                <span className="text-xs font-mono text-neutral-400">
                  {selectedLoad.forwarderReference}
                </span>
              </div>
              <button
                onClick={() => onSelectLoad(selectedLoad)}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
              >
                <span>Full Dossier</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Route */}
            <div className="text-xs space-y-1">
              <div className="flex items-center justify-between text-neutral-300 font-medium">
                <span>{selectedLoad.origin.city}, {selectedLoad.origin.state}</span>
                <ArrowRight className="w-3 h-3 text-neutral-500" />
                <span>{selectedLoad.destination.city}, {selectedLoad.destination.state}</span>
              </div>
              <div className="text-[11px] text-neutral-400">
                {selectedLoad.distanceMiles} Miles · {selectedLoad.commodity}
              </div>
            </div>

            {/* Driver & Telematics Strip */}
            {assignedDriver && (
              <div className="pt-2 border-t border-neutral-800/80 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-1.5 rounded bg-neutral-800/60 font-mono">
                  <div className="text-[10px] text-neutral-400">Speed</div>
                  <div className="font-bold text-white">{assignedDriver.currentSpeedMph} mph</div>
                </div>
                <div className="p-1.5 rounded bg-neutral-800/60 font-mono">
                  <div className="text-[10px] text-neutral-400">HOS Drive</div>
                  <div className="font-bold text-emerald-400">
                    {formatHosTime(assignedDriver.hosDrivingMinutesRemaining).text}
                  </div>
                </div>
                <div className="p-1.5 rounded bg-neutral-800/60 font-mono">
                  <div className="text-[10px] text-neutral-400">Cargo Temp</div>
                  <div className="font-bold text-sky-400">
                    {selectedLoad.equipmentType === '53_REEFER' ? '34.2°F' : 'Ambient'}
                  </div>
                </div>
              </div>
            )}

            {/* Live GPS Ping Ticker */}
            <div className="text-[11px] text-neutral-400 flex items-center justify-between pt-1 font-mono">
              <span>GPS: {assignedDriver ? `${assignedDriver.lat.toFixed(4)}, ${assignedDriver.lng.toFixed(4)}` : 'Terminal'}</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                ELD Compliant
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
