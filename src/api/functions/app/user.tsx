import { API_ROUTES } from 'api/routes';
import { handleFormDataPutRequest, handleGetApiRequest, handlePostApiRequest } from '.';
import store from 'store/store';
import { MessageResponse, User } from 'types/responseTypes';
import { setUserDetails } from 'store/slices/user';
import { ChangePasswordFormTypes, EditProfileFormTypes } from 'types/screenTypes';
import { onBack } from 'navigation/index';
import { showToast } from 'utils/toast';
// import crashlytics from '@react-native-firebase/crashlytics';

const getUserDetails = async <R extends { user: User }>() => {
  const user = await handleGetApiRequest<R>({ url: API_ROUTES.GET_PROFILE });
  if (user) {
    store.dispatch(setUserDetails(user?.user));
    // crashlytics().setUserId(String(user.user.id)),
  }
};

const updatePassword = async <R extends MessageResponse>(data: ChangePasswordFormTypes) => {
  const response = await handlePostApiRequest<R, ChangePasswordFormTypes>({
    url: API_ROUTES.CHANGE_PASSWORD,
    data,
  });
  if (response) {
    showToast({ message: response?.message, isError: false });
    onBack();
  }
};
const updateUserDetails = async <R extends { user: User }>(data: EditProfileFormTypes) => {
  const user = await handleFormDataPutRequest<R, EditProfileFormTypes>({
    url: API_ROUTES.UPDATE_PROFILE,
    data,
  });

  if (user) {
    store.dispatch(setUserDetails(user.user));
    onBack();
  }
};

export { getUserDetails, updateUserDetails, updatePassword };
