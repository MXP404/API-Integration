import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Sparkles, 
  Truck, 
  DollarSign, 
  MapPin, 
  Building, 
  Clock, 
  FileText 
} from 'lucide-react';
import { EquipmentType, ForwarderIntegration, Load } from '../types/dispatch';

interface NewLoadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLoad: (newLoad: Load) => void;
  forwarders: ForwarderIntegration[];
}

export const NewLoadModal: React.FC<NewLoadModalProps> = ({
  isOpen,
  onClose,
  onAddLoad,
  forwarders,
}) => {
  if (!isOpen) return null;

  const [forwarderId, setForwarderId] = useState(forwarders[0]?.id || 'fwd-flexport');
  const [forwarderReference, setForwarderReference] = useState('FLX-TNDR-' + Math.floor(100000 + Math.random() * 900000));
  const [equipmentType, setEquipmentType] = useState<EquipmentType>('53_DRY_VAN');
  const [commodity, setCommodity] = useState('Consumer Packaged Goods');
  const [weightLbs, setWeightLbs] = useState(36000);
  const [palletCount, setPalletCount] = useState(20);
  
  // Origin
  const [originFacility, setOriginFacility] = useState('Prologis Logistics Park Hub');
  const [originAddress, setOriginAddress] = useState('1200 Distribution Way');
  const [originCity, setOriginCity] = useState('Indianapolis');
  const [originState, setOriginState] = useState('IN');
  const [originZip, setOriginZip] = useState('46201');
  const [originAppt, setOriginAppt] = useState('2026-11-08 08:00 EST');

  // Destination
  const [destFacility, setDestFacility] = useState('Amazon Fulfillment MDW2');
  const [destAddress, setDestAddress] = useState('250 Emerald Ave');
  const [destCity, setDestCity] = useState('Joliet');
  const [destState, setDestState] = useState('IL');
  const [destZip, setDestZip] = useState('60431');
  const [destAppt, setDestAppt] = useState('2026-11-08 17:00 CST');

  // Financials
  const [linehaulRate, setLinehaulRate] = useState(1650);
  const [fuelSurcharge, setFuelSurcharge] = useState(220);
  const [driverPayRate, setDriverPayRate] = useState(1200);
  const [distanceMiles, setDistanceMiles] = useState(210);

  const totalRate = linehaulRate + fuelSurcharge;
  const marginPercent = totalRate > 0 ? (((totalRate - driverPayRate) / totalRate) * 100) : 0;

  const handleQuickImportFromApi = () => {
    setForwarderId('fwd-flexport');
    setForwarderReference('FLX-API-ORD-' + Math.floor(1000 + Math.random() * 9000));
    setCommodity('Precision Semiconductor Wafers (Temp Controlled)');
    setEquipmentType('53_REEFER');
    setWeightLbs(28400);
    setPalletCount(18);
    setOriginFacility('Flexport Air Cargo Gateway O’Hare');
    setOriginAddress('550 Cargo Court, Bay 7');
    setOriginCity('Chicago');
    setOriginState('IL');
    setOriginZip('60666');
    setOriginAppt('2026-11-09 09:30 CST');

    setDestFacility('Intel Silicon Fab 52 Hub');
    setDestAddress('4500 S Dobson Rd');
    setDestCity('Chandler');
    setDestState('AZ');
    setDestZip('85248');
    setDestAppt('2026-11-11 14:00 MST');

    setDistanceMiles(1750);
    setLinehaulRate(4800);
    setFuelSurcharge(750);
    setDriverPayRate(3600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newLoad: Load = {
      id: `load-${Date.now()}`,
      loadNumber: `LX-${Math.floor(8930 + Math.random() * 500)}`,
      forwarderReference,
      forwarderId,
      status: 'tendered',
      commodity,
      weightLbs,
      palletCount,
      equipmentType,
      temperatureRequirement: equipmentType === '53_REEFER' ? '34°F to 36°F Continuous' : undefined,
      origin: {
        facilityName: originFacility,
        address: originAddress,
        city: originCity,
        state: originState,
        zip: originZip,
        lat: 39.7684,
        lng: -86.1581,
        appointmentTime: originAppt,
        appointmentType: 'Strict',
        contactName: 'Logistics Supervisor',
        contactPhone: '+1 (800) 555-0100',
      },
      destination: {
        facilityName: destFacility,
        address: destAddress,
        city: destCity,
        state: destState,
        zip: destZip,
        lat: 41.5250,
        lng: -88.0817,
        appointmentTime: destAppt,
        appointmentType: 'Window',
        contactName: 'Inbound Receiving',
        contactPhone: '+1 (800) 555-0101',
      },
      distanceMiles,
      deadheadMiles: 20,
      linehaulRate,
      fuelSurcharge,
      accessorials: 0,
      totalRate,
      driverPayRate,
      projectedMargin: marginPercent,
      rateConNumber: `RC-${forwarderReference.substring(0, 8)}`,
      bolNumber: `BOL-${Math.floor(10000 + Math.random() * 90000)}`,
      specialInstructions: 'Standard freight forwarder compliance. Notify carrier dispatch upon gate check-in.',
      apiSyncState: 'pending_ack',
      lastApiTransmission: 'Just created (Pending Tender Acceptance)',
      milestones: [],
    };

    onAddLoad(newLoad);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-950">
          <div>
            <h3 className="font-bold text-base text-neutral-900 dark:text-white">
              Create New Load / Ingest Forwarder Tender
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Enter shipment specs or ingest directly via freight forwarder API
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleQuickImportFromApi}
              className="px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900 rounded-md hover:bg-indigo-100 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Simulate API Tender Ingest</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Forwarder & Equipment Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Freight Forwarder API
              </label>
              <select
                value={forwarderId}
                onChange={(e) => setForwarderId(e.target.value)}
                className="w-full text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-md px-3 py-2 text-neutral-900 dark:text-neutral-100"
              >
                {forwarders.map((f) => (
                  <option key={f.id} value={f.id}>{f.name} ({f.protocol})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Forwarder Ref / Booking #
              </label>
              <input
                type="text"
                value={forwarderReference}
                onChange={(e) => setForwarderReference(e.target.value)}
                required
                className="w-full text-xs font-mono bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-md px-3 py-2 text-neutral-900 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Equipment Type
              </label>
              <select
                value={equipmentType}
                onChange={(e) => setEquipmentType(e.target.value as EquipmentType)}
                className="w-full text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-md px-3 py-2 text-neutral-900 dark:text-neutral-100"
              >
                <option value="53_DRY_VAN">53' Dry Van</option>
                <option value="53_REEFER">53' Reefer (Temp Controlled)</option>
                <option value="48_FLATBED">48' Flatbed</option>
                <option value="STEP_DECK">Step Deck Heavy Haul</option>
              </select>
            </div>
          </div>

          {/* Commodity & Weight */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Commodity
              </label>
              <input
                type="text"
                value={commodity}
                onChange={(e) => setCommodity(e.target.value)}
                required
                className="w-full text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-md px-3 py-2 text-neutral-900 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Gross Weight (lbs)
              </label>
              <input
                type="number"
                value={weightLbs}
                onChange={(e) => setWeightLbs(Number(e.target.value))}
                required
                className="w-full text-xs font-mono bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-md px-3 py-2 text-neutral-900 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Pallet Count
              </label>
              <input
                type="number"
                value={palletCount}
                onChange={(e) => setPalletCount(Number(e.target.value))}
                required
                className="w-full text-xs font-mono bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-md px-3 py-2 text-neutral-900 dark:text-neutral-100"
              />
            </div>
          </div>

          {/* Origin Details */}
          <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-3">
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5 uppercase tracking-wider">
              <Building className="w-3.5 h-3.5 text-indigo-500" />
              Origin Pick-Up Location
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Facility Name (e.g. O’Hare Air Cargo Hub)"
                value={originFacility}
                onChange={(e) => setOriginFacility(e.target.value)}
                required
                className="text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md px-3 py-2 text-neutral-900 dark:text-neutral-100"
              />
              <input
                type="text"
                placeholder="Street Address"
                value={originAddress}
                onChange={(e) => setOriginAddress(e.target.value)}
                required
                className="text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md px-3 py-2 text-neutral-900 dark:text-neutral-100"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="City"
                value={originCity}
                onChange={(e) => setOriginCity(e.target.value)}
                required
                className="text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md px-3 py-2 text-neutral-900 dark:text-neutral-100"
              />
              <input
                type="text"
                placeholder="State (e.g. IN)"
                value={originState}
                onChange={(e) => setOriginState(e.target.value)}
                required
                className="text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md px-3 py-2 text-neutral-900 dark:text-neutral-100"
              />
              <input
                type="text"
                placeholder="Zip Code"
                value={originZip}
                onChange={(e) => setOriginZip(e.target.value)}
                required
                className="text-xs font-mono bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md px-3 py-2 text-neutral-900 dark:text-neutral-100"
              />
            </div>
          </div>

          {/* Destination Details */}
          <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-3">
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5 uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 text-emerald-500" />
              Destination Delivery Location
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Facility Name (e.g. Amazon MDW2 Fulfillment)"
                value={destFacility}
                onChange={(e) => setDestFacility(e.target.value)}
                required
                className="text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md px-3 py-2 text-neutral-900 dark:text-neutral-100"
              />
              <input
                type="text"
                placeholder="Street Address"
                value={destAddress}
                onChange={(e) => setDestAddress(e.target.value)}
                required
                className="text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md px-3 py-2 text-neutral-900 dark:text-neutral-100"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="City"
                value={destCity}
                onChange={(e) => setDestCity(e.target.value)}
                required
                className="text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md px-3 py-2 text-neutral-900 dark:text-neutral-100"
              />
              <input
                type="text"
                placeholder="State (e.g. IL)"
                value={destState}
                onChange={(e) => setDestState(e.target.value)}
                required
                className="text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md px-3 py-2 text-neutral-900 dark:text-neutral-100"
              />
              <input
                type="text"
                placeholder="Zip Code"
                value={destZip}
                onChange={(e) => setDestZip(e.target.value)}
                required
                className="text-xs font-mono bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md px-3 py-2 text-neutral-900 dark:text-neutral-100"
              />
            </div>
          </div>

          {/* Rates & Financial Margin */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Linehaul Rate ($)
              </label>
              <input
                type="number"
                value={linehaulRate}
                onChange={(e) => setLinehaulRate(Number(e.target.value))}
                required
                className="w-full text-xs font-mono bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md px-3 py-2 text-neutral-900 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Fuel Surcharge ($)
              </label>
              <input
                type="number"
                value={fuelSurcharge}
                onChange={(e) => setFuelSurcharge(Number(e.target.value))}
                required
                className="w-full text-xs font-mono bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md px-3 py-2 text-neutral-900 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Carrier Driver Pay ($)
              </label>
              <input
                type="number"
                value={driverPayRate}
                onChange={(e) => setDriverPayRate(Number(e.target.value))}
                required
                className="w-full text-xs font-mono bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md px-3 py-2 text-neutral-900 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Target Margin
              </label>
              <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 py-2">
                {marginPercent.toFixed(1)}% (${(totalRate - driverPayRate).toFixed(0)})
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create & Post to Board</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
