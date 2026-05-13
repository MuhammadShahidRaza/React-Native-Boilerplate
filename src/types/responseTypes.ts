
export interface SignUpResponse {
  data: {
    user: User;
  };
}

export interface MessageResponse {
  message: string;
  code: string;
}

/** User's default address object from API */
export interface UserAddress {
  id: number;
  user_id: number;
  street?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  label?: string | null;
  full_address?: string | null;
  latitude: string;
  longitude: string;
  is_default?: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ProviderAccount {
  id: number;
  user_id: number;
  stripe_connect_id: string | null;
  mcc: string | null;
  country_code: string | null;
  is_primary: number;
  onboarding_completed: number;
  onboarding_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface User {
  id: number;
  full_name: string;
  email: string;
  email_verified_at: string | null;

  // API response fields
  phone?: string | null;
  provider_id?: string | null;
  provider?: string | null;
  user_type?: 'user' | 'courier' | 'driver';
  user_role?: 'user' | 'courier' | 'driver';
  bio?: string | null;
  profile_image?: string | null | undefined;
  gender?: string | null;
  dob?: string | null;
  country?: string | null;
  city?: string | null;
  state?: string | null;
  address?: UserAddress | string | null;
  is_admin_verified?: number;
  terms_accepted_at?: string;
  balance?: string | number;
  customer_stripe_id?: string | null;
  is_notify?: number;
  is_freezed?: number;
  is_onboarded?: number;
  notification_unread_count?: number;
  status?: number | string;
  created_at?: string;
  updated_at?: string;
  is_stripe_onboarded?: boolean;
  stripe_connect_id?: string | null;
  mcc?: string | null;
  provider_account?: ProviderAccount | null;
  token?: string;
  token_type?: string;

  // Legacy / optional
  language_id?: number;
  first_name?: string;
  last_name?: string;
  country_code?: string;
  calling_code?: string;
  username?: string | null;
  notification_count?: number;
  about?: string | null;
  verification_code?: string;
  expired_at?: string;
  social_id?: string | null;
  experience?: string | number | null;
  is_email_verified?: string | boolean;
  longitude?: number | string | null;
  latitude?: number | string | null;
  phone_verification_code?: string;
  phone_verified_at?: string | null;
  forgot_password_code?: string | null;
  forgot_token?: string | null;
  is_active?: number;
  is_approved?: number;
  availabilty?: number;
  is_subscribed?: boolean;
  is_location_updated?: boolean;
  issue_date?: string | null;
  background_image?: string | null;
  upcoming_balance?: number;
  category?: string | null;
  createdAt?: string;
  invitation_code?: string | null;
  is_phone_verified?: boolean;
  language?: string | null;
  phone_number?: string | null;
  region?: string | null;
  updatedAt?: string;
  user_name?: string;
  zip_code?: string | null;
  website_url?: string | null;
  whatsapp_number?: string | null;
  deleted_at?: string | null;

  details?: {
    id: number;
    user_id: number;
    service_id: number;
    experience: string | number;
    radius: string | null;
    area: string | null;
    zip_code?: string | number | null;
    driving_license_number: string | null;
    social_security_number: string | null;
    driving_license_front: string | null;
    driving_license_back: string | null;
    business_license_front: string | null;
    business_license_back: string | null;
    insurance_document: string | null;
    created_at: string;
    updated_at: string;
    latitude: string | null;
    longitude: string | null;
    city: string | null;
    country: string | null;
    state: string | null;
    address?: string | null;
    service?: Service | null;
    user?: User;
  };
}

// export type BusinessFlowSlug =
//   | 'ticket_purchase'
//   | 'room_booking'
//   | 'service_inquiry'
//   | 'reservation_booking'
//   | 'grocery_order'
//   | 'fashion_order'
//   | 'health_order'
//   | 'property_inquiry'
//   | 'electronic_order'
//   | 'interior_order';

// ---------------- MEDIA ----------------
export interface BookingMedia {
  id: number;
  mediable_type: string;
  mediable_id: number;
  media_type: string | null;
  media_url: string;
  label: string | null;
  created_at: string;
  updated_at: string;
}

// ---------------- SERVICE ----------------
export interface Service {
  id: number;
  name: string;
  slug: string;
  abbreviation: string;
  type: 'tow-to-shop' | 'inhouse'; // flexible for future
  description: string;
  image: string;
  status: number;
  created_at: string | null;
  updated_at: string | null;
  types: ServiceType[];
}

// ---------------- SERVICE TYPE ----------------
export interface ServiceType {
  id: number;
  service_id: number;
  name: string;
  created_at: string | null;
  updated_at: string | null;
}

/** Media item within assignment attempt */
export interface AssignmentAttemptMedia {
  id: number;
  mediable_type: string;
  mediable_id: number;
  media_type: string | null;
  media_url: string;
  label: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/** Single assignment attempt (proof submission) */
export interface AssignmentAttempt {
  id: number;
  booking_assignment_id: number;
  attempt_number: number;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  media: AssignmentAttemptMedia[];
}

export interface BookingAssignment {
  id: number;
  booking_id: number;
  quotation_id: number;
  user_id: number;
  dentor_id: number;
  status: string;
  created_at: string;
  updated_at: string;
  assignment_attempts: AssignmentAttempt[];
  /** Dentor (service provider) - may be included by API */
  dentor?: User;
}

// ---------------- MAIN BOOKING ----------------
export interface Booking {
  id: number;
  user_id: number;
  service_id: number;
  service_type_id: number;

  sub_type: 'Quote Pending' | 'Bids Received' | 'Upcoming' | 'In-Progress' | 'Rejected' | string;
  vehicle_make: string;
  vehicle_year: string;
  additional_notes: string;

  date: string | null;
  time: string | null;

  pickup_address: string | null;
  pickup_latitude: string | null;
  pickup_longitude: string | null;

  drop_off_address: string | null;
  drop_off_latitude: string | null;
  drop_off_longitude: string | null;


  payment_status: string | null;
  payment_method: string | null;
  transaction_id: string | null;

  created_at: string;
  updated_at: string;

  quotations_count?: number;
  /** Price from accepted quotation (API may not send price key) */
  price?: number | string;
  /** Dentor's quotation id when they have placed a bid (for edit bid) */
  quotations: {
    id: number;
    booking_id: number;
    user_id: number;
    amount: number | string;
    message: string | null;
    status: string;
    created_at: string;
    updated_at: string;
    user?: User;
  }[];

  media?: BookingMedia[];
  service?: Service;
  service_type?: ServiceType;
  booking_assignments?: BookingAssignment[];
  /** Customer info (e.g. for dentor view) */
  user?: User;
  dentor?: User;
  /** Review when booking is completed */
  review?: Review;
}

/** Base pagination fields - shared by all paginated list responses */
export interface PaginationMeta {
  current_page: number;
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  links: { url: string | null; label: string; page: number | null; active: boolean }[];
  next_page_url?: string | null;
  path?: string;
  per_page?: number;
  prev_page_url?: string | null;
  to: number | null;
  total: number;
}

/** Paginated bookings list API response (user + dentor) */
export interface BookingsListData extends PaginationMeta {
  booking: Booking[];
}

export interface BookingsListResponse {
  code: number;
  messages?: string[];
  data: BookingsListData;
}

/** Single address from API */
export interface Address {
  id: number;
  user_id: number;
  street: string;
  city: string;
  full_address: string;
  state: string;
  postal_code: string;
  country: string;
  latitude: string;
  longitude: string;
  is_default: number; // 1 or 0 from API
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  /** Will be added by API - keep for future */
  label?: string;
}

/** Address create/update payload */
export interface AddressPayload {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  latitude: string;
  longitude: string;
  is_default: boolean;
  /** Will be added - keep for future */
  label?: string;
}

/** Paginated address list response (data object from API) */
export interface AddressListData extends PaginationMeta {
  addresses: Address[];
}

/** Single activity/notification from API */
export interface Activity {
  id: number;
  user_id: number;
  title: string;
  body: string;
  objectable_type: string;
  objectable_id: number;
  actor_id: number;
  type: string;
  viewed: number;
  status: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  user?: User;
  actor?: User;
}

/** Paginated notifications/activities response (data object from API) */
export interface NotificationsListData extends PaginationMeta {
  activities: Activity[];
}

/** Single quotation (bid) from API */
export interface Quotation {
  id: number;
  booking_id: number;
  user_id: number;
  amount: string;
  drop_off_address: string | null;
  drop_off_latitude: string | null;
  drop_off_longitude: string | null;
  message: string;
  status: string;
  created_at: string;
  updated_at: string;
  user?: User;
}

/** Paginated quotations list response (data object from API) */
export interface QuotationsListData extends PaginationMeta {
  quotation: Quotation[];
}

/** Single review from API */
export interface Review {
  id: number;
  booking_id: number;
  user_id: number;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/** Paginated reviews list response (data object from API) */
export interface ReviewsListData extends PaginationMeta {
  Reviews: Review[];
}
