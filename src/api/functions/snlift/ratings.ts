import { API_ROUTES } from 'api/routes';
import { handlePostApiRequest } from '../app';

export type CreateBookingRatingPayload = {
  booking_id: number;
  rating: number;
  review?: string;
};

export async function createBookingRating(data: CreateBookingRatingPayload) {
  return handlePostApiRequest<{ message?: string }, CreateBookingRatingPayload>({
    url: API_ROUTES.RATINGS_CREATE,
    data,
    showError: true,
  });
}

/** @deprecated Use createBookingRating — kept for any legacy callers. */
export type CreateRatingPayload = CreateBookingRatingPayload;

export async function createRating(data: CreateBookingRatingPayload) {
  return createBookingRating(data);
}
