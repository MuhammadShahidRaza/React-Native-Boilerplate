import { API_ROUTES } from 'api/routes';
import { handleDeleteApiRequest, handleGetApiRequest, handlePostApiRequest } from '.';
import { ContactUsFormValues } from 'screens/user';
import { onBack } from 'navigation/index';
import { showToast } from 'utils/index';
import { StaticPage, StaticPageType } from 'screens/common';
import { COMMON_TEXT } from 'constants/screens';
import { MessageResponse } from 'types/responseTypes';

const logout = async (data: { device_udid: string }) => {
  const response = await handlePostApiRequest({
    url: API_ROUTES.LOGOUT,
    data,
    showLoader: false,
  });
  if (response) {
    console.log(response);
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
  const response = await handlePostApiRequest<MessageResponse, ContactUsFormValues>({
    url: API_ROUTES.CONTACT_US,
    data,
  });
  if (response) {
    showToast({ message: response?.message, isError: false });
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
    default:
      return;
  }
  const response = await handleGetApiRequest<StaticPage>({ url });
  return response;
};

export { getStaticPage, contactUs, logout, deleteAccount };
