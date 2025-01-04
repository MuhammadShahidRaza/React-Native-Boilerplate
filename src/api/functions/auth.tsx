import {API_ROUTES} from 'api/routes';
import {VARIABLES} from 'constants/common';
import {SCREENS} from 'constants/routes';
import {COMMON_TEXT} from 'constants/screens';
import i18n from 'i18n/index';
import {navigate} from 'navigation/Navigators';
import {setIsUserLoggedIn} from 'store/slices/appSettings';
import {setUserDetails} from 'store/slices/user';
import store from 'store/store';
import {MessageResponse, User} from 'types/response';
import {post} from 'utils/axios';
import {setItem} from 'utils/storage';
import {showToast} from 'utils/toast';

// R type for Return
// A type for Accept

const handleApiRequest = async <R extends object, A extends object>(
  url: string,
  data: A,
  token?: boolean,
): Promise<R | undefined> => {
  try {
    const response = await post({
      url,
      data,
      includeToken: token ? true : false,
    });
    return (
      response?.data.user ?? {
        message: response?.messages?.[0],
        code: response?.code,
      }
    );
  } catch (error) {
    const errorMessage =
      (error instanceof Error && error.message) ||
      i18n.t(COMMON_TEXT.SOMETHING_WENT_WRONG);
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
  const user: R | undefined = await handleApiRequest<R, A>(
    API_ROUTES.SOCIAL_LOGIN,
    data,
  );
  if (user) {
    setItem(VARIABLES.USER_TOKEN, user?.token);
    store.dispatch(setIsUserLoggedIn(true));
    store.dispatch(setUserDetails(user));
  }
};

const resetUserPassword = async <
  R extends MessageResponse,
  A extends ResetPassword,
>({
  data,
}: {
  data: A;
}) => {
  const response: R | undefined = await handleApiRequest<R, A>(
    API_ROUTES.RESET_PASSWORD,
    data,
    true,
  );
  if (response) {
    showToast({message: response?.message, isError: false});
    navigate(SCREENS.LOGIN);
  }
};

const sendOtpToEmail = async <
  R extends MessageResponse,
  A extends {email: string},
>({
  data,
}: {
  data: A;
}) => {
  const response: R | undefined = await handleApiRequest<R, A>(
    API_ROUTES.VERIFY_EMAIL,
    data,
  );
  if (response) {
    const body = {
      email: data?.email,
      code: '9999',
    };
    verifyOtpCode({data: body});
  }
};
const verifyOtpCode = async <R extends User, A extends VerifyOtp>({
  data,
}: {
  data: A;
}) => {
  const user: R | undefined = await handleApiRequest<R, A>(
    API_ROUTES.VERIFY_OTP,
    data,
  );
  if (user) {
    setItem(VARIABLES.USER_TOKEN, user?.token);
    navigate(SCREENS.RESET_PASSWORD);
  }
};

const signUpUser = async <R extends User, A extends Login_SignUp>({
  data,
}: {
  data: A;
}) => {
  const user: R | undefined = await handleApiRequest<R, A>(
    API_ROUTES.REGISTER,
    data,
  );
  if (user) {
    setItem(VARIABLES.USER_TOKEN, user?.token);
    store.dispatch(setIsUserLoggedIn(true));
    setItem(VARIABLES.IS_USER_LOGGED_IN, VARIABLES.IS_USER_LOGGED_IN);
    store.dispatch(setUserDetails(user));
  }
};

const loginUser = async <R extends User, A extends Login_SignUp>({
  data,
  rememberMe,
}: {
  data: A;
  rememberMe: boolean;
}) => {
  const user: R | undefined = await handleApiRequest<R, A>(
    API_ROUTES.LOGIN,
    data,
  );
  if (user) {
    setItem(VARIABLES.USER_TOKEN, user?.token);
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
  sendOtpToEmail,
  verifyOtpCode,
  loginUserThroughSocial,
  resetUserPassword,
};
