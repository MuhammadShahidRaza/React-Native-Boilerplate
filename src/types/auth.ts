export type USER_TYPE = 'user' | 'dentor';
export type SOCIAL_LOGIN_PROVIDER = 'google' | 'facebook' | 'apple';

export interface Login_SignUp {
  first_name?: string;
  last_name?: string;
  user_name?: string;
  full_name?: string;
  country_code?: string;
  calling_code?: string;
  email: string;
  user_type: USER_TYPE;
  phone_number?: string;
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

export interface VerifyOtp {
  email: string;
  otp_code: string;
}

export interface ResetPassword {
  password: string;
  password_confirmation: string;
}
