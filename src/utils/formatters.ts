import { EquipmentType, LoadStatus } from '../types/dispatch';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatWeight(lbs: number): string {
  return `${lbs.toLocaleString('en-US')} lbs`;
}

export function formatEquipment(type: EquipmentType): string {
  switch (type) {
    case '53_DRY_VAN':
      return "53' Dry Van";
    case '53_REEFER':
      return "53' Reefer (Temp Controlled)";
    case '48_FLATBED':
      return "48' Flatbed";
    case 'STEP_DECK':
      return 'Step Deck Heavy Haul';
    case 'CONESTOGA':
      return '53’ Conestoga Curtain';
    default:
      return type;
  }
}

export function getStatusDetails(status: LoadStatus): {
  label: string;
  apiEndpointAction: string;
  colorClass: string;
} {
  switch (status) {
    case 'tendered':
      return {
        label: 'Tender Offered',
        apiEndpointAction: 'POST /v1/tenders/offer',
        colorClass: 'text-amber-600 dark:text-amber-400',
      };
    case 'booked':
      return {
        label: 'Booked / Confirmed',
        apiEndpointAction: 'POST /v1/tenders/accept',
        colorClass: 'text-sky-600 dark:text-sky-400',
      };
    case 'dispatched':
      return {
        label: 'Driver Dispatched',
        apiEndpointAction: 'POST /v1/milestones/dispatch',
        colorClass: 'text-indigo-600 dark:text-indigo-400',
      };
    case 'in_transit':
      return {
        label: 'In Transit',
        apiEndpointAction: 'POST /v1/tracking/telemetry',
        colorClass: 'text-emerald-600 dark:text-emerald-400',
      };
    case 'at_delivery':
      return {
        label: 'At Consignee',
        apiEndpointAction: 'POST /v1/milestones/arrived',
        colorClass: 'text-purple-600 dark:text-purple-400',
      };
    case 'delivered':
      return {
        label: 'Delivered / Completed',
        apiEndpointAction: 'POST /v1/documents/pod',
        colorClass: 'text-neutral-600 dark:text-neutral-400',
      };
    case 'exception':
      return {
        label: 'Transit Exception',
        apiEndpointAction: 'POST /v1/shipments/exception',
        colorClass: 'text-rose-600 dark:text-rose-400',
      };
    default:
      return {
        label: status,
        apiEndpointAction: 'POST /v1/status',
        colorClass: 'text-neutral-500',
      };
  }
}

export function formatHosTime(minutes: number): {
  text: string;
  isWarning: boolean;
  isCritical: boolean;
} {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const isWarning = minutes <= 180 && minutes > 60;
  const isCritical = minutes <= 60;

  return {
    text: `${hours}h ${mins.toString().padStart(2, '0')}m`,
    isWarning,
    isCritical,
  };
}
