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
  username: string | null;
  email: string;
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
  address: string | null;
  longitude: number | null;
  latitude: number | null;
  phone: string;
  phone_verification_code: string;
  phone_verified_at: string | null;
  forgot_password_code: string | null;
  forgot_token: string | null;
  gender: string | null;
  dob: string | null;
  profile_image: string | null;
  customer_stripe_id: string | null;
  is_onbording_complete: number;
  status: number;
  is_active: number;
  is_approved: number;
  availabilty: number;
  is_notify: number;
  user_type: string;
  user_role: string;
  created_at: string;
  updated_at: string;
  is_subscribed: boolean;
  is_location_updated: boolean;
  token: string;
  permissions: any; // Adjust based on actual type
  token_type: string;
  issue_date: string | null;
}
