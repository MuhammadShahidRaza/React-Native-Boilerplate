import { API_ROUTES } from 'api/routes';
import {
  handleDeleteApiRequest,
  handleFormDataPatchRequest,
  handleGetApiRequest,
  handlePostApiRequest,
} from '.';
import { ContactUsFormValues } from 'screens/user';
import { onBack } from 'navigation/index';
import { showToast } from 'utils/index';
import { CompleteProfileFormValues, StaticPage, StaticPageType } from 'screens/common';
import { COMMON_TEXT } from 'constants/screens';
import { MessageResponse, User } from 'types/responseTypes';
import { ENV_CONSTANTS } from 'constants/common';
import store from 'store/store';
import { logger } from 'utils/logger';
import { setUserDetails } from 'store/slices/user';

const logout = async (data: { udid: string }) => {
  const response = await handlePostApiRequest({
    url: API_ROUTES.LOGOUT,
    data,
    showLoader: false,
  });
  if (response) {
    logger.log(response);
  }
};
const deleteAccount = async (data: {}) => {
  const response = await handleDeleteApiRequest<MessageResponse, {}>({
    url: API_ROUTES.DELETE_ACCOUNT,
    data,
    showLoader: false,
  });
  if (response) {
    showToast({ message: response?.message, isError: false });
  }
};
const contactUs = async (data: ContactUsFormValues) => {
  if (ENV_CONSTANTS.IS_ALPHA_PHASE) {
    onBack();
    return;
  }
  const response = await handlePostApiRequest<MessageResponse, ContactUsFormValues>({
    url: API_ROUTES.CONTACT_US,
    data,
  });
  if (response) {
    showToast({ message: 'Request Submitted Successfully', isError: false });
    onBack();
  }
};

const completeProfile = async ({ data }: { data: CompleteProfileFormValues }) => {
  if (ENV_CONSTANTS.IS_ALPHA_PHASE) {
    onBack();
    return;
  }
  const user: User | undefined = await handleFormDataPatchRequest<User, CompleteProfileFormValues>({
    url: API_ROUTES.COMPLETE_PROFILE,
    data,
  });

  if (user) {
    store.dispatch(setUserDetails(user));
    onBack();
  }
};

// const toggleNotification = async () => {
//   const response = await handlePostApiRequest({ url: API_ROUTES. });
//  if (response) {
//  console.log(response);
// }
// };

const getStaticPage = async (pageType: StaticPageType): Promise<StaticPage | undefined> => {
  let url: string;
  switch (pageType) {
    case COMMON_TEXT.PRIVACY_POLICY:
      url = API_ROUTES.GET_PRIVACY_POLICY;
      break;
    case COMMON_TEXT.TERMS_AND_CONDITIONS:
      url = API_ROUTES.GET_TERMS_AND_CONDITIONS;
      break;
    case COMMON_TEXT.ABOUT_US:
      url = API_ROUTES.GET_ABOUT_US;
      break;
    case 'Cancellation Policy':
      url = API_ROUTES.GET_CANCELLATION_POLICY;
      break;
    default:
      return;
  }
  const response = await handleGetApiRequest<StaticPage>({ url });
  return response;
};

export { getStaticPage, contactUs, logout, deleteAccount, completeProfile };
