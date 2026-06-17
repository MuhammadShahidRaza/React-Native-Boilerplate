import { API_ROUTES } from 'api/routes';
import { ENV_CONSTANTS, VARIABLES } from 'constants/common';
import { SCREENS } from 'constants/routes';
import { navigate } from 'navigation/Navigators';
import { setIsUserLoggedIn } from 'store/slices/appSettings';
import { resetWorkerAvailability } from 'store/slices/worker';
import { setUserDetails } from 'store/slices/user';
import store from 'store/store';
import { Login_SignUp, SocialLogin, VerifyOtp, type USER_TYPE } from 'types/auth';
import { MessageResponse, User } from 'types/responseTypes';
import { post, postWithSingleFile } from 'utils/axios';
import { saveUserDetailsForRole, setKeychainItem } from 'utils/storage';
import { showToast } from 'utils/toast';
import { DUMMY_USER, getAlphaDummyUser } from './app/user';
import { isWorkerRole } from 'config/app';
import { resetToAuthEntry } from 'config/authFlow';
import { normalizeSniftUser } from 'api/normalizers/snlift';
import { syncWorkerOnboardingFlags, syncWorkerOnlineFromUser } from 'utils/workerOnboarding';
import { normalizePhoneNumber } from 'utils/helpers/functions';
import { handleApiError, parseApiResponse } from './app';
import { logger } from 'utils/logger';
/** E.164-ish phone for `resend-otp` / `verify-otp` (API expects `phone`, not email). */
function phoneForOtpApi(data: {
  phone?: string;
  phone_number?: string;
  calling_code?: string;
}): string {
  if (data.phone?.trim()) return data.phone.trim();
  return normalizePhoneNumber(data.phone_number ?? '', data.calling_code);
}

function applySessionUser(normalized: User) {
  store.dispatch(setUserDetails(normalized));
  if (isWorkerRole(normalized?.user_type ?? normalized?.user_role)) {
    syncWorkerOnboardingFlags(normalized);
    syncWorkerOnlineFromUser(normalized);
  }
}

// R type for Return
// A type for Accept

const handleApiRequest = async <R extends object, A extends object>({
  url,
  data,
  wantToken,
  showLoader,
  showError = true,
}: {
  url: string;
  data: A;
  wantToken?: boolean;
  showLoader?: boolean;
  showError?: boolean;
}): Promise<R | undefined> => {
  try {
    const response = await post({
      url,
      data,
      includeToken: wantToken ? true : false,
      showLoader,
    });
    return parseApiResponse<R>(response);
  } catch (error) {
    if (showError) handleApiError(error);
  }
  return;
};
const handleApiRequestFormData = async <R extends object, A extends object>({
  url,
  data,
  wantToken,
  showLoader,
  showError = true,
}: {
  url: string;
  data: A;
  wantToken?: boolean;
  showLoader?: boolean;
  showError?: boolean;
}): Promise<R | undefined> => {
  try {
    const response = await postWithSingleFile({
      url,
      data,
      includeToken: wantToken ? true : false,
      showLoader,
    });
    return parseApiResponse<R>(response);
  } catch (error) {
    if (showError) handleApiError(error);
  }
  return;
};

const loginUserThroughSocial = async <R extends User, A extends SocialLogin>({
  data,
}: {
  data: A;
}) => {
  if (ENV_CONSTANTS.IS_ALPHA_PHASE) {
    const userData = getAlphaDummyUser(data?.user_type || 'user');
    store.dispatch(setIsUserLoggedIn(true));
    store.dispatch(setUserDetails(userData));
    await setKeychainItem(VARIABLES.USER_TOKEN, 'temp_token');
    return;
  }
  const user: R | undefined = await handleApiRequest<R, A>({
    url: API_ROUTES.SOCIAL_LOGIN,
    data,
  });
  if (user) {
    if (!user?.email_verified_at) {
      const phone = phoneForOtpApi({
        phone: user.phone ?? undefined,
        phone_number: user.phone_number ?? undefined,
        calling_code: user.calling_code ?? undefined,
      });
      if (phone) {
        await resendSignupOtp({
          data: {
            phone_number: user.phone_number ?? user.phone ?? undefined,
            calling_code: user.calling_code ?? undefined,
          },
        });
        navigate(SCREENS.VERIFICATION, {
          phone_number: user.phone_number ?? user.phone ?? undefined,
          calling_code: user.calling_code ?? undefined,
          country_code: user.country_code ?? undefined,
        });
      }
      return;
    }
    const normalized = normalizeSniftUser(user as Partial<User> & Record<string, unknown>);
    await setKeychainItem(VARIABLES.USER_TOKEN, normalized?.token ?? '');
    applySessionUser(normalized);
    if (
      isWorkerRole(normalized?.user_type) &&
      (!normalized?.is_onboarded || !normalized?.is_admin_verified)
    ) {
      navigate(SCREENS.COMPLETE_PROFILE);
      return;
    }
    store.dispatch(setIsUserLoggedIn(true));
  }
};

const resetUserPassword = async <
  R extends MessageResponse,
  A extends {
    password: string;
    phone?: string;
    phone_number?: string;
    calling_code?: string;
    otp_code?: string;
  },
>({
  data,
}: {
  data: A;
}) => {
  if (ENV_CONSTANTS.IS_ALPHA_PHASE) {
    resetToAuthEntry();
    return;
  }
  const phone = phoneForOtpApi(data);
  const payload = {
    phone,
    otp_code: data.otp_code ?? '',
    password: data.password,
  };
  const response: R | undefined = await handleApiRequest<R, typeof payload>({
    url: API_ROUTES.RESET_PASSWORD,
    data: payload,
  });
  if (response) {
    // console.log(response);
    // showToast({ message: response?.message, isError: false });
    // reset(SCREENS.LOGIN);
    // await removeKeychainItem(VARIABLES.USER_TOKEN);
    return response;
  }
  return;
};

const forgotPassword = async <
  R extends MessageResponse,
  A extends {
    phone?: string;
    phone_number?: string;
    calling_code?: string;
  },
>({
  data,
}: {
  data: A;
}) => {
  const phone = phoneForOtpApi(data);
  if (!phone) {
    showToast({ message: 'Phone number is required' });
    return;
  }
  if (ENV_CONSTANTS.IS_ALPHA_PHASE) {
    navigate(SCREENS.VERIFICATION, {
      isFromForgot: true,
      phone_number: phone,
      calling_code: data?.calling_code,
    });
    return;
  }
  const response: R | undefined = await handleApiRequest<R, { phone: string }>({
    url: API_ROUTES.FORGOT_PASSWORD,
    data: { phone },
  });
  if (response) {
    showToast({ message: response?.message, isError: false });
    navigate(SCREENS.VERIFICATION, {
      isFromForgot: true,
      phone_number: phone,
      calling_code: data?.calling_code,
    });
  }
};
/** Signup / email verification — `POST /verify-otp` (phone + otp_code only). */
const verifySignupOtp = async <
  R extends User,
  A extends {
    otp_code?: string;
    otp?: string;
    user_type: USER_TYPE | 'dentor';
    phone?: string;
    phone_number?: string;
    calling_code?: string;
  },
>({
  data,
}: {
  data: A;
}) => {
  if (ENV_CONSTANTS.IS_ALPHA_PHASE) {
    const isWorker = isWorkerRole(data?.user_type);
    const userData = {
      ...getAlphaDummyUser(data?.user_type ?? 'user'),
      email_verified_at: new Date().toISOString(),
      ...(isWorker ? { is_onboarded: 0, is_admin_verified: 0, is_approved: 0 } : {}),
    };
    store.dispatch(setUserDetails(userData));
    await setKeychainItem(VARIABLES.USER_TOKEN, 'temp_token');
    if (isWorker) {
      store.dispatch(resetWorkerAvailability());
      navigate(SCREENS.COMPLETE_PROFILE);
      return;
    }
    store.dispatch(setIsUserLoggedIn(true));
    return;
  }
  const phone = phoneForOtpApi(data);
  if (!phone) {
    showToast({ message: 'Phone number is required for verification' });
    return;
  }
  const payload = {
    otp_code: data.otp_code ?? data.otp ?? '',
    user_type: data.user_type,
    phone,
  };
  const user: R | undefined = await handleApiRequest<R, typeof payload>({
    url: API_ROUTES.VERIFY_EMAIL,
    data: payload,
  });
  if (user) {
    const normalized = normalizeSniftUser(user as Partial<User> & Record<string, unknown>);
    await setKeychainItem(VARIABLES.USER_TOKEN, normalized?.token ?? '');
    applySessionUser(normalized);
    if (isWorkerRole(normalized?.user_type)) {
      store.dispatch(resetWorkerAvailability());
      syncWorkerOnboardingFlags(normalized);
      navigate(SCREENS.COMPLETE_PROFILE);
    } else {
      store.dispatch(setIsUserLoggedIn(true));
    }
  }
};
/** Signup OTP resend — `POST /resend-otp` (phone only). */
const resendSignupOtp = async <
  R extends MessageResponse,
  A extends { phone?: string; phone_number?: string; calling_code?: string },
>({
  data,
}: {
  data: A;
}) => {
  if (ENV_CONSTANTS.IS_ALPHA_PHASE) {
    return;
  }
  const phone = phoneForOtpApi(data);
  if (!phone) {
    showToast({ message: 'Phone number is required to resend code' });
    return;
  }
  const response: R | undefined = await handleApiRequest<R, { phone: string }>({
    url: API_ROUTES.RESEND_VERFICATION,
    data: { phone },
    showLoader: false,
  });
  if (response) {
    showToast({ message: response?.message, isError: false });
  }
};

const verifyOtpCode = async <R extends MessageResponse, A extends VerifyOtp>({
  data,
}: {
  data: A;
}) => {
  if (ENV_CONSTANTS.IS_ALPHA_PHASE) {
    navigate(SCREENS.RESET_PASSWORD, { data });
    return;
  }
  const phone = phoneForOtpApi(data);
  if (!phone) {
    showToast({ message: 'Phone number is required for verification' });
    return;
  }
  const payload = { phone, otp_code: data.otp_code };
  const response: R | undefined = await handleApiRequest<R, typeof payload>({
    url: API_ROUTES.VERIFY_OTP,
    data: payload,
  });
  if (response) {
    navigate(SCREENS.RESET_PASSWORD, {
      data: { phone, otp_code: data.otp_code },
    });
  }
};

const signUpUser = async <R extends User, A extends Login_SignUp>({ data }: { data: A }) => {
  if (ENV_CONSTANTS.IS_ALPHA_PHASE) {
    navigate(SCREENS.VERIFICATION, {
      phone_number: data?.phone_number ?? data?.phone,
      calling_code: data?.calling_code,
      country_code: data?.country_code,
    });
    return;
  }
  const user: R | undefined = await handleApiRequestFormData<R, A>({
    url: API_ROUTES.REGISTER,
    data,
  });
  if (!user || typeof user !== 'object' || !('id' in user) || !user.id) {
    return;
  }

  const normalized = normalizeSniftUser(user as Partial<User> & Record<string, unknown>);
  if (normalized?.token) {
    await setKeychainItem(VARIABLES.USER_TOKEN, normalized.token);
  }
  navigate(SCREENS.VERIFICATION, {
    phone_number: data?.phone_number ?? data?.phone,
    calling_code: data?.calling_code,
    country_code: data?.country_code,
  });
};

const loginUser = async <R extends User, A extends Login_SignUp>({
  data,
  rememberMe,
}: {
  data: A;
  rememberMe: boolean;
}) => {
  if (ENV_CONSTANTS.IS_ALPHA_PHASE) {
    const userData = getAlphaDummyUser(data?.user_type || 'user');
    store.dispatch(setIsUserLoggedIn(true));
    store.dispatch(setUserDetails(userData));
    await setKeychainItem(VARIABLES.USER_TOKEN, 'temp_token');
    return;
  }
  const user: R | undefined = await handleApiRequest<R, A>({ url: API_ROUTES.LOGIN, data });
  if (user) {
    const normalized = normalizeSniftUser(user as Partial<User> & Record<string, unknown>);
    if (!normalized?.email_verified_at) {
      if (data?.phone_number || data?.phone) {
        await resendSignupOtp({ data });
      }
      navigate(SCREENS.VERIFICATION, {
        phone_number: data?.phone_number ?? data?.phone,
        country_code: data?.country_code,
        calling_code: data?.calling_code,
      });
      return;
    }
    await setKeychainItem(VARIABLES.USER_TOKEN, normalized?.token ?? '');
    applySessionUser(normalized);

    if (
      isWorkerRole(normalized?.user_type) &&
      (!normalized?.is_onboarded || !normalized?.is_admin_verified)
    ) {
      navigate(SCREENS.COMPLETE_PROFILE);
      return;
    }

    store.dispatch(setIsUserLoggedIn(true));
    if (rememberMe) {
      try {
        await saveUserDetailsForRole(data.user_type, {
          email: data.email,
          password: data.password,
          user_type: data.user_type,
        });
      } catch {
        // Don't fail login if keychain save fails
      }
    }
  }
};

/** @deprecated Use resendSignupOtp — signup OTP is phone-only. */
const resendEmailCode = resendSignupOtp;
/** @deprecated Use verifySignupOtp — signup OTP is phone-only. */
const verifyEmailCode = verifySignupOtp;

export {
  signUpUser,
  loginUser,
  verifySignupOtp,
  verifyEmailCode,
  verifyOtpCode,
  forgotPassword,
  resendSignupOtp,
  resendEmailCode,
  loginUserThroughSocial,
  resetUserPassword,
  phoneForOtpApi,
};
