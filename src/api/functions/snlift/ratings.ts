import { API_ROUTES } from 'api/routes';
import { handlePostApiRequest } from '../app';

export type CreateRatingPayload = {
  module: 'ride' | 'food' | 'parcel' | string;
  module_id: number;
  rating: number;
  review?: string;
};

export async function createRating(data: CreateRatingPayload) {
  const primary = await handlePostApiRequest<{ message?: string }, CreateRatingPayload>({
    url: API_ROUTES.RATINGS_CREATE,
    data,
    showError: false,
  });
  if (primary) return primary;
  return handlePostApiRequest<{ message?: string }, CreateRatingPayload>({
    url: API_ROUTES.SNLIFT_REVIEW_CREATE,
    data,
  });
}
