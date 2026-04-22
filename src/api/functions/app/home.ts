import { API_ROUTES } from 'api/routes';
import {
  handleFormDataPatchRequest,
  handleFormDataPostRequest,
  handleGetApiRequest,
  handlePostApiRequest,
} from '.';
import { get } from 'utils/axios';
import { showToast } from 'utils/toast';
import { setServices } from 'store/slices/services';
import store from 'store/store';
import { Booking, BookingsListResponse, MessageResponse, Service } from 'types/responseTypes';
import { SelectedMedia } from 'hooks/useMediaPicker';

export type BookingStatusParam =
  | 'pending'
  | 'bidding'
  | 'assigned'
  | 'upcoming'
  | 'in_progress'
  | 'completed'
  | 'cancelled';
// //TODO:CHECK ON BACKEND
// | 'rejected'
// | 'applied'
// | 'new';

export type BookingsSortOrder = 'asc' | 'desc';

export type BookingsFetchParams = {
  page: number;
  status?: BookingStatusParam;
  limit?: number;
  /** Sort field (e.g. 'date', 'created_at') */
  sort?: string;
  /** Sort order: asc or desc */
  order?: BookingsSortOrder;
  /** Date range filter: from (YYYY-MM-DD or MM/DD/YYYY) */
  date_from?: string;
  /** Date range filter: to (YYYY-MM-DD or MM/DD/YYYY) */
  date_to?: string;
};

const DEFAULT_LIMIT = 5;

const buildParams = (params: BookingsFetchParams) => {
  const { page, status, limit = DEFAULT_LIMIT, sort, order, date_from, date_to } = params;
  return {
    page,
    limit,
    ...(status && { status }),
    ...(sort && { sort: order }),
    // ...(order && { order }),
    ...(date_from && { date_from }),
    ...(date_to && { date_to }),
  };
};

/** Paginated: pass page, optional status, limit, sort, order, date_from, date_to. */
const fetchUserBookingsPage = async (
  params: BookingsFetchParams,
): Promise<BookingsListResponse | null> => {
  const response = await handleGetApiRequest<BookingsListResponse>({
    url: API_ROUTES.GET_USER_BOOKINGS_LIST,
    params: buildParams(params),
  });
  return response ?? null;
};

/** Paginated: pass page, optional status, limit, sort, order, date_from, date_to. */
const fetchDentorBookingsPage = async (
  params: BookingsFetchParams,
): Promise<BookingsListResponse | null> => {
  const response = await handleGetApiRequest<BookingsListResponse>({
    url: API_ROUTES.GET_DENTOR_BOOKINGS_LIST,
    params: buildParams(params),
  });
  return response ?? null;
};

const getBookingDetailsById = async ({ id, isDentor }: { id: string; isDentor: boolean }) => {
  const response = await handleGetApiRequest<Booking>({
    url: isDentor
      ? API_ROUTES.GET_DENTOR_BOOKINGS_LIST + `/${id}`
      : API_ROUTES.GET_USER_BOOKINGS_LIST + `/${id}`,
  });
  return response ?? null;
};
const getServices = async () => {
  const response = await handleGetApiRequest<Service[]>({ url: API_ROUTES.GET_SERVICES_LIST });
  if (response) {
    store.dispatch(setServices(response));
  }
};
const bookServiceProvider = async ({
  data,
  onUploadProgress,
}: {
  data: Record<string, any>;
  onUploadProgress?: (percent: number) => void;
}) => {
  const response = await handleFormDataPostRequest<Booking, any>({
    url: API_ROUTES.BOOK_SERVICE_PROVIDER,
    data,
    showLoader: false,
    onUploadProgress,
  });
  return response;
};
const requestWithdrawAmount = async ({ amount }: { amount: number }) => {
  const response = await handleFormDataPostRequest<MessageResponse, any>({
    url: API_ROUTES.REQUEST_WITHDRAW_AMOUNT,
    data: { amount },
  });
  return response;
};

const getStripeConnectLink = async (): Promise<string | null> => {
  const response = await handleGetApiRequest<{ onboarding_url: string }>({
    url: API_ROUTES.STRIPE_CONNECT_LINK,
  });
  return response?.onboarding_url ?? null;
};

/** Withdrawal request - payment_requests array */
export type PaymentRequest = {
  id: number;
  user_id: number;
  amount: string;
  status: 'pending' | 'completed' | 'failed';
  payment_method: string | null;
  transaction_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

/** Wallet ledger entry - data.wallet array (credits) */
export type WalletTransaction = {
  id: number;
  user_id: number;
  objectable_type: string;
  objectable_id: number;
  type: 'credit' | 'debit';
  transaction_type: string;
  amount: string;
  description: string;
  transaction_id: string | null;
  payment_method: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
};

export type WalletResponse = {
  payment_requests?: PaymentRequest[];
  data?: {
    current_page: number;
    wallet: WalletTransaction[];
    last_page: number;
    total: number;
  };
};

/** Wallet API returns { payment_requests, data } - parseApiResponse only returns data, so we use get() directly */
const getWallet = async (params?: { page?: number }): Promise<WalletResponse | null> => {
  try {
    const response = await get({
      url: API_ROUTES.GET_WALLET,
      ...(params?.page ? { config: { params: { page: params.page } } } : {}),
    });
    if (!response) return null;
    return {
      payment_requests: response.payment_requests ?? [],
      data: response.data ?? { current_page: 1, wallet: [], last_page: 1, total: 0 },
    };
  } catch (error) {
    showToast({ message: (error as Error)?.message ?? 'Failed to load wallet', isError: true });
    return null;
  }
};

// ---------- Dentor: Bidding & Quotation ----------
/** Place bid: POST dentorbooking/quotation */
const createQuotation = async ({
  booking_id,
  amount,
  drop_off_address,
  drop_off_latitude,
  drop_off_longitude,
}: {
  booking_id: number;
  amount: number;
  drop_off_address?: string;
  drop_off_latitude?: number;
  drop_off_longitude?: number;
}) => {
  const data: Record<string, string | number> = { booking_id, amount };
  if (drop_off_address) data.drop_off_address = drop_off_address;
  if (drop_off_latitude != null) data.drop_off_latitude = drop_off_latitude;
  if (drop_off_longitude != null) data.drop_off_longitude = drop_off_longitude;
  const response = await handleFormDataPostRequest<Booking, typeof data>({
    url: API_ROUTES.DENTOR_CREATE_QUOTATION,
    data,
  });
  return response ?? null;
};

/** Update bid: PATCH dentorbooking/quotation/{id} */
const updateQuotation = async ({
  quotation_id,
  booking_id,
  amount,
  drop_off_address,
  drop_off_latitude,
  drop_off_longitude,
}: {
  quotation_id: number;
  booking_id: number;
  amount: number;
  drop_off_address?: string;
  drop_off_latitude?: number;
  drop_off_longitude?: number;
}) => {
  const data: Record<string, string | number> = { booking_id, amount };
  if (drop_off_address) data.drop_off_address = drop_off_address;
  if (drop_off_latitude != null) data.drop_off_latitude = drop_off_latitude;
  if (drop_off_longitude != null) data.drop_off_longitude = drop_off_longitude;
  const response = await handleFormDataPatchRequest<Booking, typeof data>({
    url: API_ROUTES.DENTOR_UPDATE_QUOTATION(quotation_id),
    data,
  });
  return response ?? null;
};

/** Update dentor booking status: PATCH dentorbooking/{id}/status (upcoming | in_progress | cancelled) */
const updateDentorBookingStatus = async ({
  booking_id,
  status,
}: {
  booking_id: number;
  status: 'upcoming' | 'in_progress' | 'cancelled' | 'decline';
}) => {
  const response = await handleFormDataPatchRequest<Booking, { status: string }>({
    url: API_ROUTES.DENTOR_UPDATE_BOOKING_STATUS(booking_id),
    data: { status },
  });
  return response ?? null;
};

/** Submit proof of verification: POST dentorbooking/{id}/submit-proof (FormData) */
const submitProofOfVerification = async ({
  booking_id,
  proof_of_work,
}: {
  booking_id: number;
  proof_of_work: Array<{ label: string; media: SelectedMedia }>;
}) => {
  const data: Record<string, unknown> = {};
  proof_of_work.forEach((item, index) => {
    data[`proof_of_work[${index}][label]`] = item?.label;
    data[`proof_of_work[${index}][media]`] = item?.media;
  });
  const response = await handleFormDataPostRequest<Booking, Record<string, unknown>>({
    url: API_ROUTES.DENTOR_SUBMIT_PROOF(booking_id),
    data,
  });
  return response ?? null;
};

// ---------- User: Quotation & Booking ----------
/** Get PaymentIntent for quotation - POST userbooking/stripe/payment-intent */
const getQuotationPaymentIntent = async ({
  booking_id,
  quotation_id,
  payment_method_id,
}: {
  booking_id: number;
  quotation_id: number;
  payment_method_id?: string;
}): Promise<{ client_secret: string } | null> => {
  const response = await handlePostApiRequest<
    { client_secret: string },
    { booking_id: number; quotation_id: number; payment_method_id?: string }
  >({
    url: API_ROUTES.USER_STRIPE_PAYMENT_INTENT,
    data: { booking_id, quotation_id, ...(payment_method_id && { payment_method_id }) },
  });
  return response ?? null;
};

/** Create SetupIntent for saving cards - POST payment/create-setup-intent */
const getSetupIntent = async (): Promise<{
  ephemeralKey: string;
  customer: string;
  setup_intent: string;
} | null> => {
  const response = await handleGetApiRequest<{
    ephemeralKey: string;
    customer: string;
    setup_intent: string;
  }>({
    url: API_ROUTES.PAYMENT_GET_SETUP_INTENT,
  });
  return response ?? null;
};

/** Accept or reject quotation: PATCH userbooking/quotation/{id} */
const acceptRejectQuotation = async ({
  quotation_id,
  status,
}: {
  quotation_id: number;
  status: 'accepted' | 'rejected';
}) => {
  const response = await handleFormDataPatchRequest<Booking, { status: string }>({
    url: API_ROUTES.USER_ACCEPT_REJECT_QUOTATION(quotation_id),
    data: { status },
  });
  return response ?? null;
};

/** Cancel user booking: POST userbooking/{id}/cancel */
const cancelUserBooking = async ({ booking_id }: { booking_id: number }) => {
  const response = await handleFormDataPatchRequest<Booking, Record<string, never>>({
    url: API_ROUTES.USER_CANCEL_BOOKING(booking_id),
    data: {},
  });
  return response ?? null;
};

/** Give tip to dentor: POST userbooking/stripe/tip/payment */
const giveTipToDentor = async ({
  booking_id,
  payment_method_id,
  amount,
}: {
  booking_id: number;
  payment_method_id: string;
  amount: number;
}) => {
  const response = await handleFormDataPostRequest<
    { message?: string },
    { booking_id: number; payment_method_id: string; amount: number }
  >({
    url: API_ROUTES.USER_STRIPE_TIP_PAYMENT,
    data: { booking_id, payment_method_id, amount },
  });
  return response ?? null;
};

/** Approve work: PATCH userbooking/{id}/approve-work (accepted | rejected | completed) */
const approveWork = async ({
  booking_id,
  status,
}: {
  booking_id: number;
  status: 'accepted' | 'rejected' | 'completed';
}) => {
  const response = await handleFormDataPatchRequest<Booking, { status: string }>({
    url: API_ROUTES.USER_APPROVE_WORK(booking_id),
    data: { status },
  });
  return response ?? null;
};

export {
  bookServiceProvider,
  requestWithdrawAmount,
  getStripeConnectLink,
  getWallet,
  fetchDentorBookingsPage,
  fetchUserBookingsPage,
  getServices,
  getBookingDetailsById,
  createQuotation,
  updateQuotation,
  updateDentorBookingStatus,
  submitProofOfVerification,
  getQuotationPaymentIntent,
  getSetupIntent,
  acceptRejectQuotation,
  cancelUserBooking,
  approveWork,
  giveTipToDentor,
};
