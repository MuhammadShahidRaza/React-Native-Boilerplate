import { API_ROUTES } from 'api/routes';
import { extractApiList, normalizeSniftBooking } from 'api/normalizers/snlift';
import {
  handleDeleteApiRequest,
  handleGetApiRequest,
  handlePostApiRequest,
  handlePatchApiRequest,
} from '../app';
import type { SnliftBooking, SnliftBookingsListResponse } from 'types/snliftApi';

export type CreateRideBookingPayload = {
  booking_type: 'ride';
  ride_category: string;
  pickup_address: string;
  dropoff_address: string;
  pickup_latitude: number;
  pickup_longitude: number;
  dropoff_latitude: number;
  dropoff_longitude: number;
  distance_km: number;
  promo_code?: string;
};

export type CreateFoodBookingPayload = {
  booking_type: 'food';
  restaurant_id: number;
  delivery_address: string;
  distance_km: number;
  items: { menu_item_id: number; quantity: number }[];
  promo_code?: string;
};

export type CreateParcelBookingPayload = {
  booking_type: 'parcel';
  pickup_address: string;
  dropoff_address: string;
  pickup_latitude: number;
  pickup_longitude: number;
  dropoff_latitude: number;
  dropoff_longitude: number;
  distance_km: number;
  promo_code?: string;
};

export function extractBookingFromResponse(
  res: { booking: SnliftBooking } | SnliftBooking | null | undefined,
): SnliftBooking | null {
  if (!res) return null;
  if ('booking' in res && res.booking) {
    return normalizeSniftBooking(res.booking as SnliftBooking & Record<string, unknown>);
  }
  if ('id' in res) {
    return normalizeSniftBooking(res as SnliftBooking & Record<string, unknown>);
  }
  return null;
}

export async function listBookings(params?: {
  scope?: string;
  booking_type?: string;
  status?: string;
  page?: number;
}) {
  return handleGetApiRequest<SnliftBookingsListResponse>({
    url: API_ROUTES.BOOKINGS,
    params: params as Record<string, string | number> | undefined,
    addToPending: true,
  });
}

export async function getBookingById(id: number | string) {
  return handleGetApiRequest<{ booking: SnliftBooking } | SnliftBooking>({
    url: API_ROUTES.BOOKING_BY_ID(id),
  });
}

export type SnliftBookingTracking = {
  booking_id: number;
  booking_type: string;
  status: string;
  provider_id: number | null;
  provider_role: string;
  pickup: { address: string; latitude: number; longitude: number };
  dropoff: { address: string; latitude: number; longitude: number };
  provider: SnliftBooking['provider'];
  provider_location: { latitude: number; longitude: number } | null;
  tracking_mode: string;
  poll_after_seconds: number;
};

export async function getBookingTracking(id: number | string) {
  const raw = await handleGetApiRequest<{ tracking: SnliftBookingTracking } | SnliftBookingTracking>({
    url: API_ROUTES.BOOKING_TRACKING(id),
  });
  if (!raw) return null;
  if ('tracking' in raw && raw.tracking) return raw.tracking;
  return raw as SnliftBookingTracking;
}

export async function createRideBooking(data: CreateRideBookingPayload) {
  return handlePostApiRequest<{ booking: SnliftBooking }, CreateRideBookingPayload>({
    url: API_ROUTES.BOOKINGS,
    data,
    showLoader: true,
  });
}

export async function createFoodBooking(data: CreateFoodBookingPayload) {
  return handlePostApiRequest<{ booking: SnliftBooking }, CreateFoodBookingPayload>({
    url: API_ROUTES.BOOKINGS,
    data,
    showLoader: true,
  });
}

export async function createParcelBooking(data: CreateParcelBookingPayload) {
  return handlePostApiRequest<{ booking: SnliftBooking }, CreateParcelBookingPayload>({
    url: API_ROUTES.BOOKINGS,
    data,
    showLoader: true,
  });
}

export async function acceptBooking(id: number | string) {
  return handlePostApiRequest<{ booking: SnliftBooking }, Record<string, never>>({
    url: API_ROUTES.BOOKING_ACCEPT(id),
    data: {},
  });
}

export async function updateBookingStatus(id: number | string, status: string) {
  return handlePatchApiRequest<{ booking: SnliftBooking }, { status: string }>({
    url: API_ROUTES.BOOKING_STATUS(id),
    data: { status },
  });
}

export async function cancelBooking(id: number | string, cancellation_reason: string) {
  return handlePostApiRequest<{ booking: SnliftBooking }, { cancellation_reason: string }>({
    url: API_ROUTES.BOOKING_CANCEL(id),
    data: { cancellation_reason },
  });
}

export async function deleteBooking(id: number | string) {
  return handleDeleteApiRequest<{ message?: string }, Record<string, never>>({
    url: API_ROUTES.BOOKING_BY_ID(id),
    data: {},
  });
}

export function extractBookingsList(res: SnliftBookingsListResponse | undefined): SnliftBooking[] {
  const list = extractApiList<SnliftBooking>(res, ['bookings', 'data', 'items']);
  return list.map(b =>
    normalizeSniftBooking(b as SnliftBooking & Record<string, unknown>),
  );
}
