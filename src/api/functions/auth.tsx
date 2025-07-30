import { API_ROUTES } from 'api/routes';
import { ENV_CONSTANTS, VARIABLES } from 'constants/common';
import { SCREENS } from 'constants/routes';
import { COMMON_TEXT } from 'constants/screens';
import i18n from 'i18n/index';
import { navigate, reset } from 'navigation/Navigators';
import { setIsUserLoggedIn } from 'store/slices/appSettings';
import { setUserDetails } from 'store/slices/user';
import store from 'store/store';
import { MessageResponse, User } from 'types/responseTypes';
import { post } from 'utils/axios';
import { setItem } from 'utils/storage';
import { showToast } from 'utils/toast';

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

const loginUserThroughSocial = async <R extends User, A extends SocialLogin>({
  data,
}: {
  data: A;
}) => {
  const user: R | undefined = await handleApiRequest<R, A>({ url: API_ROUTES.SOCIAL_LOGIN, data });
  if (user) {
    setItem(VARIABLES.USER_TOKEN, user?.token);
    store.dispatch(setIsUserLoggedIn(true));
  }
};

const resetUserPassword = async <R extends MessageResponse, A extends { password: string }>({
  data,
}: {
  data: A;
}) => {
  const response: R | undefined = await handleApiRequest<R, A>({
    url: API_ROUTES.RESET_PASSWORD,
    data,
    wantToken: true,
  });
  if (response) {
    showToast({ message: response?.message, isError: false });
    reset(SCREENS.LOGIN);
    setItem(VARIABLES.USER_TOKEN, null);
  }
};

const forgotPassword = async <R extends MessageResponse, A extends { email: string }>({
  data,
}: {
  data: A;
}) => {
  if (ENV_CONSTANTS.IS_ALPHA_PHASE) {
    navigate(SCREENS.VERIFICATION, {
      isFromForgot: true,
      email: data?.email,
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
    });
  }
};
const verifyEmailCode = async <R extends MessageResponse, A extends { token: string }>({
  data,
}: {
  data: A;
}) => {
  if (ENV_CONSTANTS.IS_ALPHA_PHASE) {
    setItem(VARIABLES.IS_USER_LOGGED_IN, VARIABLES.IS_USER_LOGGED_IN);
    store.dispatch(setIsUserLoggedIn(true));
    return;
  }
  const response: R | undefined = await handleApiRequest<R, A>({
    url: API_ROUTES.VERIFY_EMAIL,
    data,
    wantToken: true,
  });
  if (response) {
    showToast({ message: response?.message, isError: false });
    setItem(VARIABLES.IS_USER_LOGGED_IN, VARIABLES.IS_USER_LOGGED_IN);
    store.dispatch(setIsUserLoggedIn(true));
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
    wantToken: true,
    showLoader: false,
  });
  if (response) {
    showToast({ message: response?.message, isError: false });
  }
};

const verifyOtpCode = async <R extends User, A extends VerifyOtp>({ data }: { data: A }) => {
  const user: R | undefined = await handleApiRequest<R, A>({ url: API_ROUTES.VERIFY_OTP, data });
  if (user) {
    setItem(VARIABLES.USER_TOKEN, user?.token);
    navigate(SCREENS.RESET_PASSWORD);
  }
};

const signUpUser = async <R extends User, A extends Login_SignUp>({ data }: { data: A }) => {
  if (ENV_CONSTANTS.IS_ALPHA_PHASE) {
    navigate(SCREENS.VERIFICATION, {
      email: data?.email,
    });
    return;
  }
  const user: R | undefined = await handleApiRequest<R, A>({ url: API_ROUTES.REGISTER, data });
  if (user) {
    setItem(VARIABLES.USER_TOKEN, user?.token);
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
    setItem(VARIABLES.IS_USER_LOGGED_IN, VARIABLES.IS_USER_LOGGED_IN);
    store.dispatch(setIsUserLoggedIn(true));
    return;
  }
  const user: R | undefined = await handleApiRequest<R, A>({ url: API_ROUTES.LOGIN, data });
  if (user) {
    setItem(VARIABLES.USER_TOKEN, user?.token);
    if (!user?.is_email_verified) {
      resendEmailCode({ data: { email: data?.email } });
      navigate(SCREENS.VERIFICATION, {
        email: data?.email,
      });
      return;
    }
    store.dispatch(setIsUserLoggedIn(true));
    store.dispatch(setUserDetails(user));
    if (rememberMe) {
      setItem(VARIABLES.IS_USER_LOGGED_IN, VARIABLES.IS_USER_LOGGED_IN);
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
