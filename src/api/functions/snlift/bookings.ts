import { API_ROUTES } from 'api/routes';
import { extractApiList, normalizeSniftBooking } from 'api/normalizers/snlift';
import {
  handleDeleteApiRequest,
  handleGetApiRequest,
  handlePostApiRequest,
  handlePatchApiRequest,
} from '../app';
import type { SnliftBooking, SnliftBookingsListResponse } from 'types/snliftApi';
import { extractEstimateDistanceKm, resolveBookingDistanceKm } from 'utils/distance';

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
  base_fare?: number | string;
  promo_code?: string;
  [key: string]: unknown;
};

function pickEstimateNumber(raw: unknown): number | null {
  if (raw == null || raw === '') return null;
  const n = typeof raw === 'number' ? raw : parseFloat(String(raw).replace(/[^0-9.-]/g, ''));
  return Number.isNaN(n) ? null : n;
}

/** Parcel estimate — prefers API `base_fare`, then estimated/sub/total amounts. */
export function resolveParcelEstimateBaseFare(
  result: EstimateBookingResult | null | undefined,
): number | null {
  if (!result) return null;
  const cat = result.categories?.[0];
  const value =
    cat?.base_fare ??
    result.base_fare ??
    cat?.estimated_amount ??
    result.sub_total ??
    result.estimated_amount ??
    cat?.total_amount ??
    result.total_amount;
  return pickEstimateNumber(value);
}

/** Flatten nested estimate + normalize distance_km from all API aliases. */
export function normalizeEstimateBookingResult(
  raw: EstimateBookingResult | null | undefined,
): EstimateBookingResult | null {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as EstimateBookingResult & Record<string, unknown>;
  const nested =
    record.estimate && typeof record.estimate === 'object'
      ? (record.estimate as Record<string, unknown>)
      : null;
  const merged = nested ? { ...record, ...nested } : record;
  const distance_km = extractEstimateDistanceKm(merged) ?? merged.distance_km;
  return { ...merged, distance_km };
}

export async function estimateBooking(data: EstimateBookingPayload) {
  const result = await handlePostApiRequest<EstimateBookingResult, EstimateBookingPayload>({
    url: API_ROUTES.USER_BOOKINGS_ESTIMATE,
    data,
    showLoader: false,
  });
  return normalizeEstimateBookingResult(result) ?? undefined;
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
  item_description: string;
  sender_name: string;
  sender_phone: string;
  receiver_name: string;
  receiver_phone: string;
  base_fare?: number;
  estimated_amount?: number;
  sub_total?: number;
  total_amount?: number;
  promo_code?: string;
};

export function buildParcelBookingPayload(input: {
  pickupAddress: string;
  dropoffAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;
  dropoffLatitude: number;
  dropoffLongitude: number;
  distanceKm: number;
  itemDescription: string;
  senderName: string;
  senderPhone: string;
  receiverName: string;
  receiverPhone: string;
  estimate?: EstimateBookingResult | null;
  promoCode?: string;
}): CreateParcelBookingPayload {
  const cat = input.estimate?.categories?.[0];
  const payload: CreateParcelBookingPayload = {
    booking_type: 'parcel',
    pickup_address: input.pickupAddress,
    dropoff_address: input.dropoffAddress,
    pickup_latitude: input.pickupLatitude,
    pickup_longitude: input.pickupLongitude,
    dropoff_latitude: input.dropoffLatitude,
    dropoff_longitude: input.dropoffLongitude,
    distance_km: resolveBookingDistanceKm(input.estimate, input.distanceKm),
    item_description: input.itemDescription.trim(),
    sender_name: input.senderName.trim(),
    sender_phone: input.senderPhone.trim(),
    receiver_name: input.receiverName.trim(),
    receiver_phone: input.receiverPhone.trim(),
  };

  const baseFare = resolveParcelEstimateBaseFare(input.estimate);
  const estimatedAmount = pickEstimateNumber(
    cat?.estimated_amount ?? input.estimate?.estimated_amount,
  );
  const subTotal = pickEstimateNumber(cat?.estimated_amount ?? input.estimate?.sub_total);
  const totalAmount = pickEstimateNumber(
    cat?.total_amount ?? input.estimate?.total_amount,
  );

  if (baseFare != null) payload.base_fare = baseFare;
  if (estimatedAmount != null) payload.estimated_amount = estimatedAmount;
  if (subTotal != null) payload.sub_total = subTotal;
  if (totalAmount != null) payload.total_amount = totalAmount;

  const promo = input.promoCode?.trim();
  if (promo) payload.promo_code = promo;

  return payload;
}

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
  options?: BookingRequestOptions,
) {
  return handleGetApiRequest<SnliftBookingsListResponse>({
    url: bookingUrls(role).list,
    params: params as Record<string, string | number> | undefined,
    addToPending: options?.addToPending ?? true,
    showLoader: options?.showLoader ?? true,
    showError: options?.showError ?? true,
    silentErrors: options?.silentErrors ?? false,
  });
}

type BookingRequestOptions = {
  showLoader?: boolean;
  showError?: boolean;
  addToPending?: boolean;
  silentErrors?: boolean;
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
    silentErrors: options?.silentErrors ?? false,
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
    silentErrors: options?.silentErrors ?? false,
  });
  if (!raw) return null;
  if ('tracking' in raw && raw.tracking) return raw.tracking;
  return raw as SnliftBookingTracking;
}

export type BookingAcceptPollResult = {
  status: string;
  pollAfterSeconds?: number;
};

/** Poll until driver/courier accepts — tracking API first, booking detail fallback. */
export async function pollBookingAcceptStatus(
  id: number | string,
  role?: BookingRole,
  options?: BookingRequestOptions,
): Promise<BookingAcceptPollResult | null> {
  const silent: BookingRequestOptions = {
    showLoader: false,
    showError: false,
    addToPending: true,
    silentErrors: true,
    ...options,
  };

  const tracking = await getBookingTracking(id, role, silent);
  if (tracking?.status) {
    return {
      status: tracking.status,
      pollAfterSeconds: tracking.poll_after_seconds,
    };
  }

  const res = await getBookingById(id, role, silent);
  const booking = extractBookingFromResponse(res);
  if (booking?.status) {
    return { status: booking.status };
  }

  return null;
}

export async function createRideBooking(
  data: CreateRideBookingPayload,
  options?: { showLoader?: boolean },
) {
  return handlePostApiRequest<{ booking: SnliftBooking }, CreateRideBookingPayload>({
    url: API_ROUTES.USER_BOOKINGS,
    data,
    showLoader: options?.showLoader ?? true,
  });
}

export async function createFoodBooking(data: CreateFoodBookingPayload) {
  return handlePostApiRequest<{ booking: SnliftBooking }, CreateFoodBookingPayload>({
    url: API_ROUTES.USER_BOOKINGS,
    data,
    showLoader: true,
  });
}

export async function createParcelBooking(
  data: CreateParcelBookingPayload,
  options?: { showLoader?: boolean },
) {
  return handlePostApiRequest<{ booking: SnliftBooking }, CreateParcelBookingPayload>({
    url: API_ROUTES.USER_BOOKINGS,
    data,
    showLoader: options?.showLoader ?? true,
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
  options?: { showLoader?: boolean },
) {
  return handlePostApiRequest<{ booking: SnliftBooking }, { cancellation_reason: string }>({
    url: bookingUrls(role).cancel(id),
    data: { cancellation_reason },
    showLoader: options?.showLoader ?? true,
  });
}

export async function deleteBooking(
  id: number | string,
  options?: { showLoader?: boolean },
) {
  return handleDeleteApiRequest<{ message?: string }, Record<string, never>>({
    url: API_ROUTES.USER_BOOKING_BY_ID(id),
    data: {},
    showLoader: options?.showLoader ?? true,
  });
}

export function extractBookingsList(res: SnliftBookingsListResponse | undefined): SnliftBooking[] {
  const list = extractApiList<SnliftBooking>(res, ['bookings', 'data', 'items']);
  return list.map(b => normalizeSniftBooking(b as SnliftBooking & Record<string, unknown>));
}
