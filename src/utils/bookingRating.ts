import { ENV_CONSTANTS } from 'constants/common';
import { setAlphaBookingRating } from 'constants/alphaBookingMocks';
import { createBookingRating } from 'api/functions/snlift/ratings';
import type { SnliftBooking } from 'types/snliftApi';

function resolveRatingScore(raw: unknown): number | null {
  if (raw == null || raw === '') return null;
  const n = typeof raw === 'number' ? raw : parseInt(String(raw), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function extractBookingCustomerRating(
  booking: SnliftBooking | null | undefined,
): number | null {
  if (!booking) return null;

  const ratingObj = booking.rating;
  const fromBookingRating =
    ratingObj && typeof ratingObj === 'object' ? ratingObj.rating : null;

  return (
    resolveRatingScore(booking.customer_rating) ??
    resolveRatingScore(booking.review?.rating) ??
    resolveRatingScore(fromBookingRating)
  );
}

export function extractBookingReviewComment(
  booking: SnliftBooking | null | undefined,
): string | null {
  if (!booking) return null;
  const comment =
    booking.review_comment ??
    booking.review?.comment ??
    booking.rating?.review ??
    null;
  const trimmed = typeof comment === 'string' ? comment.trim() : '';
  return trimmed || null;
}

export async function submitBookingRating(params: {
  bookingId: number;
  module: SnliftBooking['booking_type'];
  rating: number;
  comment?: string;
}): Promise<boolean> {
  const { bookingId, rating, comment } = params;
  if (rating < 1 || rating > 5) return false;

  if (ENV_CONSTANTS.IS_ALPHA_PHASE) {
    setAlphaBookingRating(bookingId, rating, comment);
    return true;
  }

  const res = await createBookingRating({
    booking_id: bookingId,
    rating,
    ...(comment?.trim() ? { review: comment.trim() } : {}),
  });
  return Boolean(res);
}
