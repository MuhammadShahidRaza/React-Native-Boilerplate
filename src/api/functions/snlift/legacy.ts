import { API_ROUTES } from 'api/routes';
import { extractBookingsList, listBookings } from './bookings';
import { handleGetApiRequest } from '../app';
import type { SnliftBookingsListResponse } from 'types/snliftApi';

/** Legacy GET /userbooking/list — maps to unified bookings when possible. */
export async function listLegacyUserBookings(params?: { page?: number }) {
  const legacy = await handleGetApiRequest<SnliftBookingsListResponse>({
    url: API_ROUTES.LEGACY_USER_BOOKING_LIST,
    params: params as Record<string, number> | undefined,
    showError: false,
  });
  if (legacy) {
    const list = extractBookingsList(legacy);
    if (list.length > 0) return list;
  }
  const unified = await listBookings({ page: params?.page });
  return extractBookingsList(unified);
}

/** Legacy GET /dentorbooking/list — provider/worker bookings fallback. */
export async function listLegacyProviderBookings(params?: {
  page?: number;
  scope?: string;
}) {
  const legacy = await handleGetApiRequest<SnliftBookingsListResponse>({
    url: API_ROUTES.LEGACY_DENTOR_BOOKING_LIST,
    params: params as Record<string, string | number> | undefined,
    showError: false,
  });
  if (legacy) {
    const list = extractBookingsList(legacy);
    if (list.length > 0) return list;
  }
  return extractBookingsList(
    await listBookings({
      page: params?.page,
      scope: params?.scope ?? 'available',
    }),
  );
}

export async function listLegacyConversations() {
  return handleGetApiRequest<Record<string, unknown>>({
    url: API_ROUTES.LEGACY_CONVERSATION_LIST,
    showError: false,
  });
}

export async function listLegacyMessages() {
  return handleGetApiRequest<Record<string, unknown>>({
    url: API_ROUTES.LEGACY_MESSAGE_LIST,
    showError: false,
  });
}
