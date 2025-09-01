export interface SignUpResponse {
  data: {
    user: User;
  };
}

export interface MessageResponse {
  message: string;
  code: string;
}

export interface User {
  id: number;
  language_id: number;
  first_name?: string;
  last_name?: string;
  full_name: string;
  country_code: string;
  calling_code: string;
  username: string | null;
  email: string;
  notification_count: number;
  about: string | null;
  verification_code: string;
  expired_at: string;
  email_verified_at: string | null;
  social_id: string | null;
  provider: string | null;
  experience: string | null;
  country: string | null;
  city: string | null;
  state: string | null;
  is_email_verified: string | boolean;
  address: string | null;
  longitude: number | null;
  latitude: number | null;
  phone_verification_code: string;
  phone_verified_at: string | null;
  forgot_password_code: string | null;
  forgot_token: string | null;
  gender: string | null;
  dob: string | null;
  profile_image: string | null | undefined;
  customer_stripe_id: string | null;
  is_onbording_complete: number;
  status: number;
  is_active: number;
  is_approved: number;
  availabilty: number;
  is_notify: number;
  user_type: string;
  user_role: string;
  updated_at: string;
  is_subscribed: boolean;
  is_location_updated: boolean;
  token: string;
  token_type: string;
  issue_date: string | null;
  background_image?: string | null;
  balance?: number;
  bio?: string | null;
  category?: string | null;
  createdAt?: string;
  invitation_code?: string | null;
  is_phone_verified?: boolean;
  language?: string | null;
  phone_number?: string | null;
  region?: string | null;
  updatedAt?: string;
  user_name?: string;
  website_url?: string | null;
  whatsapp_number?: string | null;
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
