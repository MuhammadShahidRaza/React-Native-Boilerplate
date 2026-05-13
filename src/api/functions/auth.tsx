import { API_ROUTES } from 'api/routes';
import { ENV_CONSTANTS, VARIABLES } from 'constants/common';
import { SCREENS } from 'constants/routes';
import { COMMON_TEXT } from 'constants/screens';
import i18n from 'i18n/index';
import { navigate, reset } from 'navigation/Navigators';
import { setIsUserLoggedIn } from 'store/slices/appSettings';
import { setUserDetails } from 'store/slices/user';
import store from 'store/store';
import { Login_SignUp, SocialLogin, VerifyOtp, type USER_TYPE } from 'types/auth';
import { MessageResponse, User } from 'types/responseTypes';
import { post, postWithSingleFile } from 'utils/axios';
import { saveUserDetailsForRole, setKeychainItem } from 'utils/storage';
import { showToast } from 'utils/toast';
import { DUMMY_USER } from './app/user';
import { isWorkerRole } from 'config/app';

// R type for Return
// A type for Accept

const handleApiRequest = async <R extends object, A extends object>({
  url,
  data,
  wantToken,
  showLoader,
}: {
  url: string;
  data: A;
  wantToken?: boolean;
  showLoader?: boolean;
}): Promise<R | undefined> => {
  try {
    const response = await post({
      url,
      data,
      includeToken: wantToken ? true : false,
      showLoader,
    });
    return (
      response?.data ?? {
        message: response?.messages?.[0],
        code: response?.code,
      }
    );
  } catch (error) {
    const errorMessage =
      (error instanceof Error && error.message) || i18n.t(COMMON_TEXT.SOMETHING_WENT_WRONG);
    showToast({
      message: errorMessage,
    });
  }
  return;
};
const handleApiRequestFormData = async <R extends object, A extends object>({
  url,
  data,
  wantToken,
  showLoader,
}: {
  url: string;
  data: A;
  wantToken?: boolean;
  showLoader?: boolean;
}): Promise<R | undefined> => {
  try {
    const response = await postWithSingleFile({
      url,
      data,
      includeToken: wantToken ? true : false,
      showLoader,
    });
    return (
      response?.data ?? {
        message: response?.messages?.[0],
        code: response?.code,
      }
    );
  } catch (error) {
    const errorMessage =
      (error instanceof Error && error.message) || i18n.t(COMMON_TEXT.SOMETHING_WENT_WRONG);
    showToast({
      message: errorMessage,
    });
  }
  return;
};

const loginUserThroughSocial = async <R extends User, A extends SocialLogin>({
  data,
}: {
  data: A;
}) => {
  if (ENV_CONSTANTS.IS_ALPHA_PHASE) {
    const userData = { ...DUMMY_USER, user_type: data?.user_type || 'user' };
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
    if (!user?.email_verified_at && user?.email) {
      resendEmailCode({ data: { email: user.email } });
      navigate(SCREENS.VERIFICATION, { email: user.email });
      return;
    }
    await setKeychainItem(VARIABLES.USER_TOKEN, user?.token ?? '');
    store.dispatch(setUserDetails(user));
    if (isWorkerRole(user?.user_type) && (!user?.is_onboarded || !user?.is_admin_verified)) {
      navigate(SCREENS.COMPLETE_PROFILE);
      return;
    }
    store.dispatch(setIsUserLoggedIn(true));
  }
};

const resetUserPassword = async <R extends MessageResponse, A extends { password: string }>({
  data,
}: {
  data: A;
}) => {
  if (ENV_CONSTANTS.IS_ALPHA_PHASE) {
    reset(SCREENS.GET_STARTED);
    return;
  }
  const response: R | undefined = await handleApiRequest<R, A>({
    url: API_ROUTES.RESET_PASSWORD,
    data,
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
    email?: string;
    phone_number?: string;
    country_code?: string;
    calling_code?: string;
  },
>({
  data,
}: {
  data: A;
}) => {
  if (ENV_CONSTANTS.IS_ALPHA_PHASE) {
    navigate(SCREENS.VERIFICATION, {
      isFromForgot: true,
      email: data?.email,
      phone_number: data?.phone_number,
      country_code: data?.country_code,
      calling_code: data?.calling_code,
    });
    return;
  }
  const response: R | undefined = await handleApiRequest<R, A>({
    url: API_ROUTES.FORGOT_PASSWORD,
    data,
  });
  if (response) {
    showToast({ message: response?.message, isError: false });
    navigate(SCREENS.VERIFICATION, {
      isFromForgot: true,
      email: data?.email,
      phone_number: data?.phone_number,
      country_code: data?.country_code,
      calling_code: data?.calling_code,
    });
  }
};
const verifyEmailCode = async <
  R extends User,
  A extends { otp: string; user_type: USER_TYPE | 'dentor' },
>({
  data,
}: {
  data: A;
}) => {
  if (ENV_CONSTANTS.IS_ALPHA_PHASE) {
    const userData = { ...DUMMY_USER, user_type: data?.user_type };
    store.dispatch(setIsUserLoggedIn(true));
    store.dispatch(setUserDetails(userData));
    await setKeychainItem(VARIABLES.USER_TOKEN, 'temp_token');
  }
  const user: R | undefined = await handleApiRequest<R, A>({
    url: API_ROUTES.VERIFY_EMAIL,
    data,
  });
  if (user) {
    await setKeychainItem(VARIABLES.USER_TOKEN, user?.token ?? '');
    store.dispatch(setUserDetails(user));
    if (isWorkerRole(user?.user_type)) {
      navigate(SCREENS.COMPLETE_PROFILE);
    } else {
      store.dispatch(setIsUserLoggedIn(true));
    }
  }
};
const resendEmailCode = async <R extends MessageResponse, A extends { email: string }>({
  data,
}: {
  data: A;
}) => {
  if (ENV_CONSTANTS.IS_ALPHA_PHASE) {
    return;
  }
  const response: R | undefined = await handleApiRequest<R, A>({
    url: API_ROUTES.RESEND_VERFICATION,
    data,
    showLoader: false,
  });
  if (response) {
    showToast({ message: response?.message, isError: false });
  }
};

const verifyOtpCode = async <R extends User, A extends VerifyOtp>({ data }: { data: A }) => {
  if (ENV_CONSTANTS.IS_ALPHA_PHASE) {
    navigate(SCREENS.RESET_PASSWORD);
    return;
  }
  const response: R | undefined = await handleApiRequest<R, A>({
    url: API_ROUTES.VERIFY_OTP,
    data,
  });
  if (response) {
    navigate(SCREENS.RESET_PASSWORD, {
      data: data,
    });
  }
};

const signUpUser = async <R extends User, A extends Login_SignUp>({ data }: { data: A }) => {
  if (ENV_CONSTANTS.IS_ALPHA_PHASE) {
    navigate(SCREENS.VERIFICATION, {
      email: data?.email,
    });
    return;
  }
  const user: R | undefined = await handleApiRequestFormData<R, A>({
    url: API_ROUTES.REGISTER,
    data,
  });
  if (user) {
    navigate(SCREENS.VERIFICATION, {
      email: data?.email,
    });
  }
};

const loginUser = async <R extends User, A extends Login_SignUp>({
  data,
  rememberMe,
}: {
  data: A;
  rememberMe: boolean;
}) => {
  if (ENV_CONSTANTS.IS_ALPHA_PHASE) {
    const userData = { ...DUMMY_USER, user_type: data?.user_type || 'user' };
    store.dispatch(setIsUserLoggedIn(true));
    store.dispatch(setUserDetails(userData));
    await setKeychainItem(VARIABLES.USER_TOKEN, 'temp_token');
    return;
  }
  const user: R | undefined = await handleApiRequest<R, A>({ url: API_ROUTES.LOGIN, data });
  if (user) {
    if (!user?.email_verified_at) {
      if (data?.email) {
        resendEmailCode({ data: { email: data?.email } });
      }
      navigate(SCREENS.VERIFICATION, {
        email: data?.email,
        phone_number: data?.phone_number,
        country_code: data?.country_code,
        calling_code: data?.calling_code,
      });
      return;
    }
    await setKeychainItem(VARIABLES.USER_TOKEN, user?.token ?? '');
    store.dispatch(setUserDetails(user));

    if (isWorkerRole(user?.user_type) && (!user?.is_onboarded || !user?.is_admin_verified)) {
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

export {
  signUpUser,
  loginUser,
  verifyEmailCode,
  verifyOtpCode,
  forgotPassword,
  resendEmailCode,
  loginUserThroughSocial,
  resetUserPassword,
};
