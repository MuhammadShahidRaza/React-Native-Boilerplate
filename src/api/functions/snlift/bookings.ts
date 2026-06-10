import { API_ROUTES } from 'api/routes';
import { extractApiList, normalizeSniftBooking } from 'api/normalizers/snlift';
import {
  handleDeleteApiRequest,
  handleGetApiRequest,
  handlePostApiRequest,
  handlePatchApiRequest,
} from '../app';
import type { SnliftBooking, SnliftBookingsListResponse } from 'types/snliftApi';

export type BookingRole = 'driver' | 'courier' | 'user' | string | null | undefined;

function bookingUrls(role: BookingRole) {
  if (role === 'courier') {
    return {
      list: API_ROUTES.COURIER_BOOKINGS,
      byId: API_ROUTES.COURIER_BOOKING_BY_ID,
      accept: API_ROUTES.COURIER_BOOKING_ACCEPT,
      status: API_ROUTES.COURIER_BOOKING_STATUS,
      cancel: API_ROUTES.COURIER_BOOKING_CANCEL,
      tracking: API_ROUTES.COURIER_BOOKING_TRACKING,
    };
  }
  if (role === 'driver') {
    return {
      list: API_ROUTES.DRIVER_BOOKINGS,
      byId: API_ROUTES.DRIVER_BOOKING_BY_ID,
      accept: API_ROUTES.DRIVER_BOOKING_ACCEPT,
      status: API_ROUTES.DRIVER_BOOKING_STATUS,
      cancel: API_ROUTES.DRIVER_BOOKING_CANCEL,
      tracking: API_ROUTES.DRIVER_BOOKING_TRACKING,
    };
  }
  return {
    list: API_ROUTES.USER_BOOKINGS,
    byId: API_ROUTES.USER_BOOKING_BY_ID,
    accept: null as null,
    status: null as null,
    cancel: API_ROUTES.USER_BOOKING_CANCEL,
    tracking: API_ROUTES.USER_BOOKING_TRACKING,
  };
}

export type EstimateBookingPayload = {
  booking_type: 'ride' | 'parcel' | 'food';
  ride_category?: string;
  pickup_latitude?: number;
  pickup_longitude?: number;
  dropoff_latitude?: number;
  dropoff_longitude?: number;
  restaurant_id?: number;
  delivery_latitude?: number;
  delivery_longitude?: number;
  items?: { menu_item_id: number; quantity: number }[];
  promo_code?: string;
};

export type EstimateCategoryResult = {
  ride_category: string;
  base_fare: number;
  price_per_km: number;
  estimated_amount: number;
  discount_amount: number;
  total_amount: number;
  promo_code: string | null;
  promo_valid: boolean | null;
  promo_applied: boolean;
};

export type EstimateBookingResult = {
  booking_type?: string;
  distance_km?: number | string;
  categories?: EstimateCategoryResult[];
  // For food/parcel estimates (no categories):
  sub_total?: number | string;
  delivery_fee?: number | string;
  discount_amount?: number | string;
  total_amount?: number | string;
  estimated_amount?: number | string;
  promo_code?: string;
  [key: string]: unknown;
};

export async function estimateBooking(data: EstimateBookingPayload) {
  return handlePostApiRequest<EstimateBookingResult, EstimateBookingPayload>({
    url: API_ROUTES.USER_BOOKINGS_ESTIMATE,
    data,
    showLoader: false,
  });
}

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
  delivery_latitude?: number;
  delivery_longitude?: number;
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
  item_description?: string;
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

export async function listBookings(
  params?: { scope?: string; booking_type?: string; status?: string; page?: number },
  role?: BookingRole,
) {
  return handleGetApiRequest<SnliftBookingsListResponse>({
    url: bookingUrls(role).list,
    params: params as Record<string, string | number> | undefined,
    addToPending: true,
  });
}

type BookingRequestOptions = {
  showLoader?: boolean;
  showError?: boolean;
  addToPending?: boolean;
};

export async function getBookingById(
  id: number | string,
  role?: BookingRole,
  options?: BookingRequestOptions,
) {
  return handleGetApiRequest<{ booking: SnliftBooking } | SnliftBooking>({
    url: bookingUrls(role).byId(id),
    showLoader: options?.showLoader ?? true,
    showError: options?.showError ?? true,
    addToPending: options?.addToPending ?? false,
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

export async function getBookingTracking(
  id: number | string,
  role?: BookingRole,
  options?: BookingRequestOptions,
) {
  const raw = await handleGetApiRequest<
    { tracking: SnliftBookingTracking } | SnliftBookingTracking
  >({
    url: bookingUrls(role).tracking(id),
    showLoader: options?.showLoader ?? true,
    showError: options?.showError ?? true,
    addToPending: options?.addToPending ?? false,
  });
  if (!raw) return null;
  if ('tracking' in raw && raw.tracking) return raw.tracking;
  return raw as SnliftBookingTracking;
}

export async function createRideBooking(data: CreateRideBookingPayload) {
  return handlePostApiRequest<{ booking: SnliftBooking }, CreateRideBookingPayload>({
    url: API_ROUTES.USER_BOOKINGS,
    data,
    showLoader: true,
  });
}

export async function createFoodBooking(data: CreateFoodBookingPayload) {
  return handlePostApiRequest<{ booking: SnliftBooking }, CreateFoodBookingPayload>({
    url: API_ROUTES.USER_BOOKINGS,
    data,
    showLoader: true,
  });
}

export async function createParcelBooking(data: CreateParcelBookingPayload) {
  return handlePostApiRequest<{ booking: SnliftBooking }, CreateParcelBookingPayload>({
    url: API_ROUTES.USER_BOOKINGS,
    data,
    showLoader: true,
  });
}

export async function acceptBooking(id: number | string, role: BookingRole) {
  const urls = bookingUrls(role);
  if (!urls.accept) return null;
  return handlePostApiRequest<{ booking: SnliftBooking }, Record<string, never>>({
    url: urls.accept(id),
    data: {},
  });
}

export async function updateBookingStatus(
  id: number | string,
  status: string,
  role: BookingRole,
) {
  const urls = bookingUrls(role);
  if (!urls.status) return null;
  return handlePatchApiRequest<{ booking: SnliftBooking }, { status: string }>({
    url: urls.status(id),
    data: { status },
  });
}

export async function cancelBooking(
  id: number | string,
  cancellation_reason: string,
  role?: BookingRole,
) {
  return handlePostApiRequest<{ booking: SnliftBooking }, { cancellation_reason: string }>({
    url: bookingUrls(role).cancel(id),
    data: { cancellation_reason },
  });
}

export async function deleteBooking(id: number | string) {
  return handleDeleteApiRequest<{ message?: string }, Record<string, never>>({
    url: API_ROUTES.USER_BOOKING_BY_ID(id),
    data: {},
  });
}

export function extractBookingsList(res: SnliftBookingsListResponse | undefined): SnliftBooking[] {
  const list = extractApiList<SnliftBooking>(res, ['bookings', 'data', 'items']);
  return list.map(b => normalizeSniftBooking(b as SnliftBooking & Record<string, unknown>));
}
