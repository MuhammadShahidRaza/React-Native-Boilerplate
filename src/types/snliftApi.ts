/** SNLift unified booking API — response shapes (app keys preserved via normalizers/mappers). */

export type SnliftBookingType = 'ride' | 'food' | 'parcel';

export type SnliftBookingStatus =
  | 'pending'
  | 'accepted'
  | 'in_transit'
  | 'completed'
  | 'cancelled'
  | string;

export interface SnliftPaginated<T> {
  current_page: number;
  data?: T;
  bookings?: SnliftBooking[];
  activities?: unknown[];
  first_page_url?: string;
  last_page?: number;
  per_page?: number;
  total?: number;
}

/** GET /bookings — paginated list or `{ bookings: [] }`. */
export type SnliftBookingsListResponse =
  | SnliftPaginated<SnliftBooking>
  | { bookings: SnliftBooking[] };

export interface SnliftBooking {
  id: number;
  booking_type: SnliftBookingType;
  customer_id?: number;
  provider_id?: number | null;
  provider_role?: string;
  ride_category?: string;
  pickup_address?: string | null;
  dropoff_address?: string | null;
  delivery_address?: string | null;
  pickup_latitude?: number | string | null;
  pickup_longitude?: number | string | null;
  dropoff_latitude?: number | string | null;
  dropoff_longitude?: number | string | null;
  distance_km?: number | string;
  sub_total?: number | string;
  estimated_amount?: number | string;
  delivery_fee?: number | string;
  discount_amount?: number | string;
  total_amount?: number | string;
  fare?: number | string;
  amount?: number | string;
  price?: number | string;
  commission_amount?: number | string;
  status?: SnliftBookingStatus;
  cancellation_reason?: string | null;
  completed_at?: string | null;
  items?: { menu_item_id?: number; quantity?: number }[];
  restaurant_id?: number | null;
  restaurant?: {
    id?: number;
    name?: string;
    image?: string | null;
    logo?: string | null;
  };
  customer?: {
    id?: number;
    full_name?: string;
    phone?: string;
    profile_image?: string | null;
  };
  provider?: {
    id?: number;
    full_name?: string;
    phone?: string;
    profile_image?: string | null;
    vehicle_model?: string;
    vehicle_license_plate?: string;
    vehicle_color?: string;
    vehicle_type?: string;
  };
}

export interface SnliftRestaurant {
  id: number;
  name?: string;
  cuisine?: string;
  description?: string;
  delivery_time?: string;
  delivery_fee?: number | string;
  image?: string | null;
  logo?: string | null;
  is_featured?: number | boolean;
  is_active?: number | boolean;
  is_approved?: number | boolean;
  rating?: number | string;
  tags?: string[] | string;
  location?: string;
}

export interface SnliftWalletSummary {
  balance?: number | string;
  total_earnings?: number | string;
  today_earnings?: number | string;
  week_earnings?: number | string;
  month_earnings?: number | string;
  total_cfa_balance?: number | string;
  /** App-expected aliases (filled by normalizer when API omits them) */
  wallet_balance?: number | string;
}

export interface SnliftWalletTransaction {
  id: number | string;
  name?: string;
  title?: string;
  label?: string;
  description?: string;
  type?: string;
  booking_type?: string;
  module?: string;
  amount?: number | string;
  value?: number | string;
  total?: number | string;
  commission?: number | string;
  created_at?: string;
}
