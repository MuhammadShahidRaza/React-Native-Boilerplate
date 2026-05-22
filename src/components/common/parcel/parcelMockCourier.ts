import { IMAGES } from 'constants/assets';
import type { RideVehicleStatItem } from '../ride/RideVehicleStatsRow';

/** Shown under Vehicle Type on Courier Matched / Track Parcel. */
export const PARCEL_VEHICLE_TYPE_LABEL = 'Bike';

/** Maps legacy/API labels (Cycle, Bicycle, etc.) to the product copy. */
export function formatParcelVehicleTypeLabel(value: string): string {
  const normalized = value.trim().toLowerCase();
  if (
    normalized === 'cycle' ||
    normalized === 'bicycle' ||
    normalized === 'motorbike' ||
    normalized === 'motorcycle'
  ) {
    return PARCEL_VEHICLE_TYPE_LABEL;
  }
  return value.trim() || PARCEL_VEHICLE_TYPE_LABEL;
}

/** Mock courier data for send-parcel flow until API wiring. */
export const MOCK_PARCEL_COURIER = {
  courierName: 'John Doe',
  rating: '4.9',
  phone: '+01 000 0000 00',
  avatar: IMAGES.USER,
  trackingId: 'SN-PKL-2847',
  deliveryFee: 'CFA 100',
  paymentMethod: 'Cash',
  vehicleStats: [
    { icon: 'bike', label: 'Vehicle Type', value: PARCEL_VEHICLE_TYPE_LABEL },
    { icon: 'card-text-outline', label: 'License Plate', value: 'AA-001-AA' },
    { icon: 'water', label: 'Color', value: 'Black' },
  ] satisfies RideVehicleStatItem[],
};

/** Vehicle stats with Bike label — use on Courier Matched & Track Parcel. */
export const PARCEL_COURIER_VEHICLE_STATS: RideVehicleStatItem[] =
  MOCK_PARCEL_COURIER.vehicleStats.map(item =>
    item.label === 'Vehicle Type'
      ? { ...item, value: formatParcelVehicleTypeLabel(item.value) }
      : item,
  );
