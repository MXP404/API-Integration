import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Download, 
  CheckCircle2, 
  DollarSign, 
  ArrowRight,
  ShieldCheck,
  Printer
} from 'lucide-react';
import { ForwarderIntegration, Load } from '../types/dispatch';
import { formatCurrency, formatEquipment, formatWeight } from '../utils/formatters';

interface RateConfirmationsViewProps {
  loads: Load[];
  forwarders: ForwarderIntegration[];
  onSelectLoad: (load: Load) => void;
}

export const RateConfirmationsView: React.FC<RateConfirmationsViewProps> = ({
  loads,
  forwarders,
  onSelectLoad,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadSuccessId, setDownloadSuccessId] = useState<string | null>(null);

  const filteredLoads = loads.filter((load) =>
    load.rateConNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    load.forwarderReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
    load.loadNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    load.origin.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    load.destination.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalVaultValue = filteredLoads.reduce((sum, l) => sum + l.totalRate, 0);

  const handleDownloadPdf = (load: Load) => {
    setDownloadSuccessId(load.id);
    setTimeout(() => setDownloadSuccessId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-500" />
            Rate Confirmation Vault & Forwarder Agreements
          </h2>
          <div className="text-xs text-neutral-500 mt-0.5">
            Binding digital rate agreements, fuel surcharges, and electronic signature logs
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-neutral-500">Total Confirmed Value</div>
            <div className="text-lg font-bold font-mono text-neutral-900 dark:text-white">
              {formatCurrency(totalVaultValue)}
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by RateCon #, Forwarder Ref, Load #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* RateCon List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredLoads.map((load) => {
          const forwarder = forwarders.find((f) => f.id === load.forwarderId);

          return (
            <div
              key={load.id}
              className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <div>
                  <div className="font-mono font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                    <span>{load.rateConNumber}</span>
                    <span className="text-xs text-neutral-400">·</span>
                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{load.loadNumber}</span>
                  </div>
                  <div className="text-xs text-neutral-500 mt-0.5">
                    Broker / Forwarder: <span className="font-semibold text-neutral-700 dark:text-neutral-300">{forwarder?.name}</span> ({load.forwarderReference})
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-bold font-mono text-neutral-900 dark:text-white">
                    {formatCurrency(load.totalRate)}
                  </div>
                  <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                    +{load.projectedMargin.toFixed(1)}% Margin
                  </div>
                </div>
              </div>

              {/* Route */}
              <div className="text-xs space-y-1">
                <div className="flex items-center gap-2 text-neutral-900 dark:text-neutral-200 font-medium">
                  <span>{load.origin.city}, {load.origin.state}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{load.destination.city}, {load.destination.state}</span>
                </div>
                <div className="text-[11px] text-neutral-500">
                  {load.distanceMiles} miles · {formatEquipment(load.equipmentType)} · {formatWeight(load.weightLbs)}
                </div>
              </div>

              {/* Rate Line Items Breakdown */}
              <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800/80 text-xs space-y-1 font-mono">
                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>Linehaul Rate:</span>
                  <span>{formatCurrency(load.linehaulRate)}</span>
                </div>
                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>Fuel Surcharge (FSC):</span>
                  <span>{formatCurrency(load.fuelSurcharge)}</span>
                </div>
                {load.accessorials > 0 && (
                  <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                    <span>Approved Accessorials:</span>
                    <span>{formatCurrency(load.accessorials)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-neutral-900 dark:text-white pt-1 border-t border-neutral-200 dark:border-neutral-800">
                  <span>Carrier Net Billing:</span>
                  <span>{formatCurrency(load.totalRate)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => onSelectLoad(load)}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  View Full Agreement Dossier
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadPdf(load)}
                    className="px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md transition-colors flex items-center gap-1.5"
                  >
                    {downloadSuccessId === load.id ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-500 font-semibold">Downloaded</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>PDF RateCon</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
