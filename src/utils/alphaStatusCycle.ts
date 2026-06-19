import type { SnliftBooking } from 'types/snliftApi';
import { BOOKING_STATUS } from 'utils/bookingStatuses';

export const ALPHA_PHASE_DURATION_MS = 3000;

/** Consumer ride tracking — all UI phases on TrackRideScreen. */
export const ALPHA_RIDE_STATUS_SEQUENCE = [
  BOOKING_STATUS.ACCEPTED,
  BOOKING_STATUS.ARRIVED,
  BOOKING_STATUS.IN_TRANSIT,
  BOOKING_STATUS.COMPLETED,
] as const;

/** Consumer parcel tracking — all UI phases on TrackParcelScreen. */
export const ALPHA_PARCEL_STATUS_SEQUENCE = [
  BOOKING_STATUS.ACCEPTED,
  BOOKING_STATUS.ARRIVED,
  BOOKING_STATUS.READY_FOR_PICKUP,
  BOOKING_STATUS.PICKED_UP,
  BOOKING_STATUS.IN_TRANSIT,
  BOOKING_STATUS.COMPLETED,
] as const;

/** Consumer food tracking — all UI phases on TrackFoodOrderScreen. */
export const ALPHA_FOOD_STATUS_SEQUENCE = [
  BOOKING_STATUS.PLACING_ORDER,
  BOOKING_STATUS.ORDER_PLACED,
  BOOKING_STATUS.ACCEPTED,
  BOOKING_STATUS.PREPARING,
  BOOKING_STATUS.READY_FOR_PICKUP,
  BOOKING_STATUS.PICKED_UP,
  BOOKING_STATUS.IN_TRANSIT,
  BOOKING_STATUS.COMPLETED,
] as const;

export type AlphaStatusSequence = readonly string[];

export function resolveAlphaStatusSequence(
  bookingType?: SnliftBooking['booking_type'] | string,
): AlphaStatusSequence {
  if (bookingType === 'food') return ALPHA_FOOD_STATUS_SEQUENCE;
  if (bookingType === 'parcel') return ALPHA_PARCEL_STATUS_SEQUENCE;
  return ALPHA_RIDE_STATUS_SEQUENCE;
}
