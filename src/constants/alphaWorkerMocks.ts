import { INITIAL_REGION } from 'constants/common';
import {
  getAlphaBookingById,
  getAlphaSessionBookings,
  registerAlphaSessionBooking,
} from 'constants/alphaBookingMocks';
import {
  WORKER_MOCK_REQUESTS,
  WORKER_REQUEST_DETAILS,
  type WorkerRequestDetail,
  type WorkerServiceType,
} from 'components/common/worker/workerMockData';
import type { SnliftBooking } from 'types/snliftApi';
import type { BookingRole } from 'api/functions/snlift/bookings';
import { parseMoneyAmount } from 'utils/currency';
import {
  BOOKING_STATUS,
  isWorkerRequestPending,
  normalizeBookingStatus,
} from 'utils/bookingStatuses';
import { APP_CONFIG } from 'config/app';

const LAT = INITIAL_REGION.latitude;
const LNG = INITIAL_REGION.longitude;

function initialWorkerBookingStatus(serviceType: WorkerServiceType): string {
  return serviceType === 'food' ? BOOKING_STATUS.READY_FOR_PICKUP : BOOKING_STATUS.PENDING;
}

function workerDetailToBooking(detail: WorkerRequestDetail): SnliftBooking {
  const id = Number(detail.id);
  const total =
    parseMoneyAmount(detail.baseFare) ??
    parseMoneyAmount(detail.fare) ??
    parseMoneyAmount(detail.earned) ??
    550;

  const booking: SnliftBooking = {
    id,
    booking_type: detail.serviceType,
    status: initialWorkerBookingStatus(detail.serviceType),
    created_at: new Date().toISOString(),
    pickup_address: detail.pickupAddress,
    dropoff_address: detail.dropoffAddress,
    delivery_address: detail.serviceType === 'food' ? detail.dropoffAddress : undefined,
    pickup_latitude: detail.pickupLat || LAT + 0.005,
    pickup_longitude: detail.pickupLng || LNG - 0.003,
    dropoff_latitude: detail.dropoffLat || LAT - 0.008,
    dropoff_longitude: detail.dropoffLng || LNG + 0.006,
    distance_km: 6.8,
    total_amount: total,
    estimated_amount: total,
    customer_id: detail.customerId,
    customer: {
      id: detail.customerId ?? 1,
      full_name: detail.customerName,
      phone: detail.customerPhone,
      profile_image: detail.customerAvatar ?? null,
    },
    wallet_prev_balance: parseMoneyAmount(detail.previousWallet) ?? 500,
    wallet_new_balance: parseMoneyAmount(detail.newWallet) ?? 418,
  };

  if (detail.serviceType === 'food') {
    booking.restaurant_id = 1;
    booking.restaurant = { id: 1, name: detail.pickupShortName || 'Restaurant' };
  }

  if (detail.serviceType === 'ride') {
    booking.ride_category = 'standard';
  }

  return booking;
}

let workerMocksSeeded = false;

export function resetAlphaWorkerMockSeed(): void {
  workerMocksSeeded = false;
}

export function seedAlphaWorkerMockBookings(): void {
  if (workerMocksSeeded) return;
  workerMocksSeeded = true;

  for (const record of WORKER_MOCK_REQUESTS) {
    const detail = WORKER_REQUEST_DETAILS[record.id];
    if (!detail || getAlphaBookingById(detail.id)) continue;
    registerAlphaSessionBooking(workerDetailToBooking(detail));
  }
}

export function ensureAlphaWorkerBooking(id: number | string): SnliftBooking | null {
  seedAlphaWorkerMockBookings();
  const existing = getAlphaBookingById(id);
  if (existing) return existing;

  const detail = WORKER_REQUEST_DETAILS[String(id)];
  if (!detail) return null;
  return registerAlphaSessionBooking(workerDetailToBooking(detail));
}

function matchesWorkerRole(
  booking: SnliftBooking,
  role: BookingRole | string | null | undefined,
): boolean {
  const type = booking.booking_type ?? 'parcel';
  if (role === APP_CONFIG.DRIVER_ROLE) return type === 'ride';
  if (role === APP_CONFIG.COURIER_ROLE) return type === 'parcel' || type === 'food';
  return true;
}

function isAvailableForWorker(booking: SnliftBooking): boolean {
  const status = normalizeBookingStatus(booking.status);
  if (status === BOOKING_STATUS.CANCELLED) return false;
  if (booking.provider_id) return false;
  return isWorkerRequestPending(status, booking.booking_type);
}

/** Pending / ready jobs shown on the worker requests list. */
export function getAlphaWorkerAvailableBookings(
  role?: BookingRole | string | null,
): SnliftBooking[] {
  seedAlphaWorkerMockBookings();

  const merged = new Map<number, SnliftBooking>();
  for (const booking of getAlphaSessionBookings()) {
    merged.set(booking.id, booking);
  }
  for (const record of WORKER_MOCK_REQUESTS) {
    const booking = getAlphaBookingById(record.id);
    if (booking) merged.set(booking.id, booking);
  }

  return Array.from(merged.values())
    .filter(b => matchesWorkerRole(b, role))
    .filter(isAvailableForWorker)
    .sort((a, b) => {
      const aTime = Date.parse(a.created_at ?? '') || 0;
      const bTime = Date.parse(b.created_at ?? '') || 0;
      return bTime - aTime;
    });
}

/** Completed / cancelled worker jobs for history tab. */
export function getAlphaWorkerHistoryBookings(
  role?: BookingRole | string | null,
): SnliftBooking[] {
  seedAlphaWorkerMockBookings();

  return getAlphaSessionBookings()
    .filter(b => matchesWorkerRole(b, role))
    .filter(b => {
      const s = normalizeBookingStatus(b.status);
      return s === BOOKING_STATUS.COMPLETED || s === BOOKING_STATUS.CANCELLED;
    })
    .sort((a, b) => {
      const aTime = Date.parse(a.completed_at ?? a.created_at ?? '') || 0;
      const bTime = Date.parse(b.completed_at ?? b.created_at ?? '') || 0;
      return bTime - aTime;
    });
}
