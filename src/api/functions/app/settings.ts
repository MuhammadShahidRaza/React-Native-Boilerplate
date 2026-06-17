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
import { normalizeSniftUser, unwrapApiUser } from 'api/normalizers/snlift';
import { syncWorkerOnboardingFlags } from 'utils/workerOnboarding';
import { isWorkerRole } from 'config/app';
import { getContentBySlug } from 'api/functions/snlift/content';

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
    return store.getState().user.userDetails as User;
  }
  const response = await handleFormDataPatchRequest<
    User | { user: User },
    CompleteProfileFormValues
  >({
    url: API_ROUTES.COMPLETE_PROFILE,
    data,
  });

  if (!response) return;

  const rawUser = unwrapApiUser(response);
  const normalized = normalizeSniftUser(rawUser);
  store.dispatch(setUserDetails(normalized));
  if (isWorkerRole(normalized.user_type ?? normalized.user_role)) {
    syncWorkerOnboardingFlags(normalized);
  }
  return normalized;
};

// const toggleNotification = async () => {
//   const response = await handlePostApiRequest({ url: API_ROUTES. });
//  if (response) {
//  console.log(response);
// }
// };

const CONTENT_SLUG_BY_PAGE: Partial<Record<StaticPageType, string>> = {
  [COMMON_TEXT.PRIVACY_POLICY]: 'privacy-policy',
  [COMMON_TEXT.TERMS_AND_CONDITIONS]: 'terms-and-conditions',
  [COMMON_TEXT.ABOUT_US]: 'about-us',
  'Cancellation Policy': 'cancellation-policy',
};

const getStaticPage = async (pageType: StaticPageType): Promise<StaticPage | undefined> => {
  if (!ENV_CONSTANTS.IS_ALPHA_PHASE) {
    const slug = CONTENT_SLUG_BY_PAGE[pageType];
    if (slug) {
      const page = await getContentBySlug(slug);
      if (page?.description) {
        return {
          id: page.id ?? 0,
          name: page.name,
          slug: page.slug,
          description: page.description,
          createdAt: '',
          updatedAt: '',
        };
      }
    }
  }

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
