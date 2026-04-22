import { API_ROUTES } from 'api/routes';
import { handleGetApiRequest } from '.';
import { QuotationsListData } from 'types/responseTypes';

/** Get paginated quotations (bids) for a booking - userbooking/{bookingId}/quotations */
export const getQuotationsByBookingId = async (
  bookingId: number,
  page = 1,
): Promise<QuotationsListData | null> => {
  const response = await handleGetApiRequest<QuotationsListData>({
    url: API_ROUTES.USER_QUOTATIONS_LIST(bookingId),
    params: { page },
  });
  return response ?? null;
};
