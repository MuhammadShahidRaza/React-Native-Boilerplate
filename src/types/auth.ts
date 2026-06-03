export type USER_TYPE = 'user' | 'courier' | 'driver';
export type SOCIAL_LOGIN_PROVIDER = 'google' | 'facebook' | 'apple';

export interface Login_SignUp {
  first_name?: string;
  last_name?: string;
  user_name?: string;
  full_name?: string;
  country_code?: string;
  calling_code?: string;
  email?: string;
  user_type: USER_TYPE;
  phone_number?: string;
  phone?: string;
  profile_image?: object | null;
  password: string;
  country?: string;
  picture?: string | null;
  device_type?: string;
  device_token: string;
  udid: string;
  device_brand?: string;
  device_os: string;
  app_version?: string;
}

/** Payload for social-login endpoint. Only include fields that are available. */
export interface SocialLogin {
  provider_id: string;
  provider: SOCIAL_LOGIN_PROVIDER;
  user_type: USER_TYPE;
  email?: string;
  full_name?: string;
  picture?: string | null;
  udid?: string;
  device_type?: string;
  device_brand?: string;
  device_os?: string;
  app_version?: string;
  device_token?: string;
}

/** Forgot-password flow — `POST /verify-code` (phone + otp_code only). */
export interface VerifyOtp {
  phone?: string;
  phone_number?: string;
  calling_code?: string;
  otp_code: string;
}

/** `POST /reset-password` — phone, otp_code, password (Postman). */
export interface ResetPassword {
  phone?: string;
  phone_number?: string;
  calling_code?: string;
  otp_code?: string;
  password: string;
  password_confirmation?: string;
}
