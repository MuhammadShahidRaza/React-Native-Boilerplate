import { normalizeSniftBooking } from 'api/normalizers/snlift';
import type {
  WorkerRequestDetail,
  WorkerRequestRecord,
  WorkerServiceType,
  WorkerTripRecord,
} from 'components/common/worker/workerMockData';
import type { SnliftBooking, SnliftBookingStatus } from 'types/snliftApi';
import { formatMoney } from 'utils/currency';
import { formatDistanceKm } from 'utils/distance';
import { parseMapCoord } from 'utils/coordinateAlongPolyline';
import { COLORS } from 'utils/colors';

export type ConsumerActivityItem = {
  id: string;
  bookingType: SnliftBooking['booking_type'];
  rawStatus: string;
  serviceLabel: 'Ride' | 'Food' | 'Parcel';
  isoDate: string;
  price: string;
  status: string;
  pickupTitle: string;
  pickupAddr: string;
  dropTitle: string;
  dropAddr: string;
};

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
    fare: formatMoney(b.total_amount ?? b.estimated_amount),
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

function formatDate(d: string | null | undefined): string {
  if (!d) return new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString('en-GB').replace(/\//g, '-');
}

function shortPlaceName(address: string): string {
  const trimmed = address.trim();
  if (!trimmed) return 'Destination';
  return trimmed.split(',')[0]?.trim() || trimmed;
}

function formatCustomerRating(customer: SnliftBooking['customer']): string {
  const raw = customer as Record<string, unknown> | undefined;
  const value = raw?.average_rating ?? raw?.avg_rating ?? raw?.rating;
  if (value === undefined || value === null || value === '') return '—';
  const n = typeof value === 'number' ? value : parseFloat(String(value));
  return Number.isNaN(n) ? '—' : n.toFixed(1);
}

function estimateEtaMinutes(distanceKm: number | string | null | undefined): string {
  const n = typeof distanceKm === 'number' ? distanceKm : parseFloat(String(distanceKm ?? ''));
  if (Number.isNaN(n) || n <= 0) return '—';
  return `${Math.max(1, Math.ceil(n * 2.5))} min`;
}

export function getBookingStatusLabel(status: SnliftBookingStatus | undefined): string {
  return statusLabel(status);
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#F59E0B',
  accepted: COLORS.APP_PRIMARY,
  in_transit: COLORS.APP_SECONDARY,
  completed: '#16A34A',
  complete: '#16A34A',
  delivered: '#16A34A',
  finished: '#16A34A',
  cancelled: COLORS.RED,
};

export function getBookingStatusColor(status: SnliftBookingStatus | string | undefined): string {
  const s = (status ?? 'pending').toLowerCase();
  return STATUS_COLORS[s] ?? COLORS.APP_PRIMARY;
}

export function mapBookingToActivityItem(booking: SnliftBooking): ConsumerActivityItem {
  const b = normalizeSniftBooking(booking as SnliftBooking & Record<string, unknown>);
  const serviceLabel =
    b.booking_type === 'food' ? 'Food' : b.booking_type === 'parcel' ? 'Parcel' : 'Ride';
  const pickupAddr = b.pickup_address ?? b.restaurant?.name ?? 'Pickup';
  const dropAddr = b.dropoff_address ?? b.delivery_address ?? 'Drop-off';
  return {
    id: String(b.id),
    bookingType: b.booking_type ?? 'ride',
    rawStatus: (b.status ?? 'pending').toLowerCase(),
    serviceLabel,
    isoDate: b.created_at ?? b.completed_at ?? new Date().toISOString(),
    price: formatMoney(b.total_amount ?? b.estimated_amount ?? b.fare),
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
  const km = formatDistanceKm(b.distance_km);
  return {
    id: String(b.id),
    status: (b.status ?? 'pending').toLowerCase(),
    statusLabel: statusLabel(b.status),
    date: formatDate(b.completed_at ?? b.created_at),
    earned: formatMoney(b.total_amount ?? b.estimated_amount),
    pickupLabel: `Pickup: ${pickup.slice(0, 28)}`,
    pickupAddress: pickup,
    destinationLabel: `Destination: ${drop.slice(0, 28)}`,
    destinationAddress: drop,
    distance: km,
    rating: formatCustomerRating(b.customer),
    payment: 'Cash',
  };
}

export function mapBookingToWorkerRequestDetail(booking: SnliftBooking): WorkerRequestDetail {
  const base = mapBookingToWorkerRequest(booking);
  const b = normalizeSniftBooking(booking as SnliftBooking & Record<string, unknown>);
  const pickup = b.pickup_address ?? 'Pickup';
  const drop = b.dropoff_address ?? b.delivery_address ?? 'Drop-off';
  return {
    ...base,
    customerId: b.customer?.id ?? b.customer_id,
    customerPhone: b.customer?.phone ?? undefined,
    customerAvatar: b.customer?.profile_image ?? null,
    customerRating: formatCustomerRating(b.customer),
    pickupAddress: pickup,
    pickupShortName: shortPlaceName(pickup),
    dropoffAddress: drop,
    dropoffShortName: shortPlaceName(drop),
    distance: formatDistanceKm(b.distance_km),
    eta: estimateEtaMinutes(b.distance_km),
    payment: 'Cash',
    baseFare: formatMoney(b.sub_total ?? b.estimated_amount),
    commission: formatMoney(
      b.commission_amount ? -Number(b.commission_amount) : 0,
    ),
    earned: formatMoney(b.total_amount ?? b.estimated_amount),
    previousWallet: formatMoney(0),
    newWallet: formatMoney(0),
    pickupLat: parseMapCoord(b.pickup_latitude) ?? 0,
    pickupLng: parseMapCoord(b.pickup_longitude) ?? 0,
    dropoffLat: parseMapCoord(b.dropoff_latitude) ?? 0,
    dropoffLng: parseMapCoord(b.dropoff_longitude) ?? 0,
  };
}

export function isActiveBookingStatus(status: SnliftBookingStatus | undefined): boolean {
  const s = (status ?? '').toLowerCase();
  return s !== 'completed' && s !== 'cancelled' && s !== 'complete' && s !== 'delivered';
}

/** Worker ride history — completed/delivered jobs (API status aliases). */
export function isCompletedBookingStatus(status: SnliftBookingStatus | undefined): boolean {
  const s = (status ?? '').toLowerCase();
  return s === 'completed' || s === 'complete' || s === 'delivered' || s === 'finished';
}
