interface Login_SignUp {
  first_name?: string;
  last_name?: string;
  user_name?: string;
  full_name?: string;
  email: string;
  phone?: string;
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

interface SocialLogin {
  first_name?: string;
  last_name?: string;
  username?: string;
  full_name?: string;
  picture?: string | null;
  email: string;
  phone?: string;
  device_type?: string;
  device_token: string;
  udid: string;
  device_brand?: string;
  device_os: string;
  app_version?: string;
  social_id: string;
  provider: 'google' | 'facebook' | 'apple';
}

interface VerifyOtp {
  email: string;
  code: string;
}

interface ResetPassword {
  password: string;
  password_confirmation: string;
}
