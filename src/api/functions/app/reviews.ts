import { API_ROUTES } from 'api/routes';
import { handleFormDataPostRequest, handleGetApiRequest } from '.';
import { Review, ReviewsListData } from 'types/responseTypes';

/** Get paginated reviews for a user - review?user_id={userId} */
export const getReviewsByUserId = async (
  userId: number,
  page = 1,
): Promise<ReviewsListData | null> => {
  const response = await handleGetApiRequest<ReviewsListData>({
    url: API_ROUTES.GET_REVIEWS,
    params: { user_id: userId, page },
  });
  return response ?? null;
};

/** Create review - POST review/create */
export const createReview = async (data: {
  booking_id: number;
  rating: number;
  comment: string;
}) => {
  const response = await handleFormDataPostRequest<
    Review,
    { booking_id: number; rating: number; comment: string }
  >({
    url: API_ROUTES.CREATE_REVIEW,
    data,
  });
  return response ?? null;
};
