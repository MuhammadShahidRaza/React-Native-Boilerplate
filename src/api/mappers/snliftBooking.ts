import { normalizeSniftBooking } from 'api/normalizers/snlift';
import type {
  WorkerRequestDetail,
  WorkerRequestRecord,
  WorkerServiceType,
  WorkerTripRecord,
} from 'components/common/worker/workerMockData';
import type { SnliftBooking, SnliftBookingStatus } from 'types/snliftApi';

export type ConsumerActivityItem = {
  id: string;
  serviceLabel: 'Ride' | 'Food' | 'Parcel';
  isoDate: string;
  price: string;
  status: string;
  pickupTitle: string;
  pickupAddr: string;
  dropTitle: string;
  dropAddr: string;
};

function formatCfa(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === '') return 'CFA 0';
  const n = typeof amount === 'number' ? amount : parseFloat(String(amount));
  if (Number.isNaN(n)) return 'CFA 0';
  return `CFA ${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function bookingTypeToService(type: string | undefined): WorkerServiceType {
  if (type === 'food') return 'food';
  if (type === 'ride') return 'ride';
  return 'parcel';
}

export function mapBookingToWorkerRequest(booking: SnliftBooking): WorkerRequestRecord {
  const b = normalizeSniftBooking(booking as SnliftBooking & Record<string, unknown>);
  return {
    id: String(b.id),
    customerName: b.customer?.full_name ?? 'Customer',
    fare: formatCfa(b.total_amount ?? b.estimated_amount),
    serviceType: bookingTypeToService(b.booking_type),
  };
}

function statusLabel(status: SnliftBookingStatus | undefined): string {
  const map: Record<string, string> = {
    pending: 'Pending',
    accepted: 'In Progress',
    in_transit: 'On The Way',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  return map[status ?? ''] ?? (status ?? 'Pending');
}

function parseAmount(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === '') return '0';
  const n = typeof amount === 'number' ? amount : parseFloat(String(amount));
  return Number.isNaN(n) ? '0' : String(Math.round(n));
}

function formatDate(d: string | null | undefined): string {
  if (!d) return new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString('en-GB').replace(/\//g, '-');
}

export function mapBookingToActivityItem(booking: SnliftBooking): ConsumerActivityItem {
  const b = normalizeSniftBooking(booking as SnliftBooking & Record<string, unknown>);
  const serviceLabel =
    b.booking_type === 'food' ? 'Food' : b.booking_type === 'parcel' ? 'Parcel' : 'Ride';
  const pickupAddr = b.pickup_address ?? b.restaurant?.name ?? 'Pickup';
  const dropAddr = b.dropoff_address ?? b.delivery_address ?? 'Drop-off';
  return {
    id: String(b.id),
    serviceLabel,
    isoDate: b.completed_at ?? new Date().toISOString(),
    price: parseAmount(b.total_amount ?? b.estimated_amount ?? b.fare),
    status: statusLabel(b.status),
    pickupTitle: serviceLabel === 'Food' ? (b.restaurant?.name ?? 'Restaurant') : 'Pickup',
    pickupAddr,
    dropTitle: 'Destination',
    dropAddr,
  };
}

export function mapBookingToWorkerTrip(booking: SnliftBooking): WorkerTripRecord {
  const b = normalizeSniftBooking(booking as SnliftBooking & Record<string, unknown>);
  const pickup = b.pickup_address ?? 'Pickup';
  const drop = b.dropoff_address ?? b.delivery_address ?? 'Destination';
  const km = b.distance_km != null ? `${b.distance_km} km` : '—';
  return {
    id: String(b.id),
    date: formatDate(b.completed_at),
    earned: formatCfa(b.total_amount ?? b.estimated_amount),
    pickupLabel: `Pickup: ${pickup.slice(0, 28)}`,
    pickupAddress: pickup,
    destinationLabel: `Destination: ${drop.slice(0, 28)}`,
    destinationAddress: drop,
    distance: km,
    rating: '5.0',
    payment: 'Cash',
  };
}

export function mapBookingToWorkerRequestDetail(booking: SnliftBooking): WorkerRequestDetail {
  const base = mapBookingToWorkerRequest(booking);
  const b = normalizeSniftBooking(booking as SnliftBooking & Record<string, unknown>);
  const pickup = b.pickup_address ?? 'Pickup';
  const drop = b.dropoff_address ?? b.delivery_address ?? 'Drop-off';
  const lat = (v: number | string | null | undefined, fallback: number) => {
    const n = typeof v === 'number' ? v : parseFloat(String(v ?? ''));
    return Number.isNaN(n) ? fallback : n;
  };
  return {
    ...base,
    pickupAddress: pickup,
    dropoffAddress: drop,
    dropoffShortName: drop.split(',')[0] ?? drop,
    distance: b.distance_km != null ? `${b.distance_km} km` : '—',
    eta: '12 min',
    payment: 'Cash',
    baseFare: formatCfa(b.sub_total ?? b.estimated_amount),
    commission: formatCfa(b.commission_amount ? -Number(b.commission_amount) : 0),
    earned: formatCfa(b.total_amount ?? b.estimated_amount),
    previousWallet: 'CFA 0',
    newWallet: 'CFA 0',
    pickupLat: lat(b.pickup_latitude, 40.7128),
    pickupLng: lat(b.pickup_longitude, -74.006),
    dropoffLat: lat(b.dropoff_latitude, 40.708),
    dropoffLng: lat(b.dropoff_longitude, -74.001),
  };
}

export function isActiveBookingStatus(status: SnliftBookingStatus | undefined): boolean {
  const s = (status ?? '').toLowerCase();
  return s !== 'completed' && s !== 'cancelled';
}
