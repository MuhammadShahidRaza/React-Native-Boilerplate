import { API_ROUTES } from 'api/routes';
import { handleGetApiRequest, handlePostApiRequest } from '.';
import { ContactUsFormValues, Region } from 'screens/user';
import { onBack } from 'navigation/index';
import { clearAllStorageItems, showToast } from 'utils/index';
import { StaticPage, StaticPageType } from 'screens/common';
import { COMMON_TEXT } from 'constants/screens';
import store from 'store/store';
import { setIsUserLoggedIn } from 'store/slices/appSettings';
import { setUserDetails } from 'store/slices/user';

const logout = async (data: { device_udid: string }) => {
  store.dispatch(setIsUserLoggedIn(false));
  store.dispatch(setUserDetails(null));
  await clearAllStorageItems();
  await handlePostApiRequest({
    url: API_ROUTES.LOGOUT,
    data,
  });
};
const deleteAccount = async (data: {}) => {
  const response = await handlePostApiRequest({
    url: API_ROUTES.DELETE_ACCOUNT,
    data,
  });
  if (response) {
    store.dispatch(setIsUserLoggedIn(false));
    store.dispatch(setUserDetails(null));
    await clearAllStorageItems();
  }
};
const contactUs = async (data: ContactUsFormValues) => {
  const response = await handlePostApiRequest<{ message: string }, ContactUsFormValues>({
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

const getRegionList = async (): Promise<Region[] | undefined> => {
  const response = await handleGetApiRequest<{ regions: Region[] }>({
    url: API_ROUTES.GET_REGIONS_LIST,
  });
  return response?.regions ?? [];
};

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

export { getStaticPage, contactUs, getRegionList, logout, deleteAccount };
