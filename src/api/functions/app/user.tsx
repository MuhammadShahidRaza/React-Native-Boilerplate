import { API_ROUTES } from 'api/routes';
import { handleFormDataPatchRequest, handleGetApiRequest, handlePatchApiRequest, handlePostApiRequest } from '.';
import store from 'store/store';
import { MessageResponse, User } from 'types/responseTypes';
import { setUserDetails } from 'store/slices/user';
import { ChangePasswordFormTypes, EditProfileFormTypes } from 'types/screenTypes';
import { onBack } from 'navigation/index';
import { showToast } from 'utils/toast';
import { ENV_CONSTANTS } from 'constants/common';
import { normalizeSniftUser } from 'api/normalizers/snlift';
// import crashlytics from '@react-native-firebase/crashlytics';

/** Dummy user for alpha/dev phase only. Used when IS_ALPHA_PHASE=true in .env. Remove or set IS_ALPHA_PHASE=false for production. */
export const DUMMY_USER: User = {
  id: 1,
  language_id: 1,
  first_name: 'John',
  last_name: 'Doe',
  full_name: 'John Doe',
  country_code: 'US',
  calling_code: '+1',
  username: 'johndoe',
  email: 'johndoe@example.com',
  notification_count: 0,
  about: 'This is a dummy user for alpha phase.',
  verification_code: '123456',
  expired_at: '',
  email_verified_at: null,
  social_id: null,
  provider: null,
  experience: '5 years',
  country: 'USA',
  city: 'New York',
  state: 'NY',
  is_admin_verified: 1,
  is_email_verified: true,
  upcoming_balance: 0,
  zip_code: '10001',
  address: '123 Main St',
  is_notify: 1,
  longitude: -74.006,
  latitude: 40.7128,
  phone_verification_code: '654321',
  phone_verified_at: null,
  is_freezed: 0,
  forgot_password_code: null,
  forgot_token: null,
  gender: 'male',
  dob: '1990-01-01',
  profile_image: null,
  customer_stripe_id: null,
  is_onboarded: 1,
  status: 1,
  is_active: 1,
  is_approved: 1,
  availabilty: 1,
  user_type: 'user',
  updated_at: '',
  is_subscribed: true,
  is_location_updated: true,
  token: 'dummy-token',
  token_type: 'Bearer',
  issue_date: null,
  background_image: null,
  balance: 100,
  bio: 'Sample bio',
  category: 'general',
  createdAt: '2024-01-01T00:00:00Z',
  invitation_code: 'INVITE123',
  is_phone_verified: true,
  language: 'en',
  phone_number: '234567890',
  phone: '234567890',
  region: 'NY',
  updatedAt: '2024-01-01T00:00:00Z',
  user_name: 'johndoe',
  website_url: 'https://example.com',
  whatsapp_number: '234567890',
};

const getUserDetails = async <R extends { user: User }>() => {
  if (ENV_CONSTANTS.IS_ALPHA_PHASE) {
    // In alpha phase, don't overwrite persisted user data
    // The user data should already be persisted from login
    return;
  }

  const user = await handleGetApiRequest<R>({ url: API_ROUTES.GET_PROFILE, addToPending: true });
  if (user?.user) {
    store.dispatch(
      setUserDetails(
        normalizeSniftUser(user.user as Partial<User> & Record<string, unknown>),
      ),
    );
    // crashlytics().setUserId(String(user.user.id)),
  }
};

const updatePassword = async <R extends MessageResponse>(data: ChangePasswordFormTypes) => {
  if (ENV_CONSTANTS.IS_ALPHA_PHASE) {
    showToast({ message: 'Password updated successfully', isError: false });
    onBack();
    return;
  }
  const response = await handlePostApiRequest<R, ChangePasswordFormTypes>({
    url: API_ROUTES.CHANGE_PASSWORD,
    data,
  });
  if (response) {
    showToast({ message: response?.message, isError: false });
    onBack();
  }
};
const updateUserDetails = async <R extends { user: User }>(
  data: Partial<EditProfileFormTypes>,
  wantBack?: boolean,
) => {
  if (ENV_CONSTANTS.IS_ALPHA_PHASE) {
    store.dispatch(setUserDetails({ ...DUMMY_USER, ...data }));
    if (wantBack ?? true) {
      onBack();
    }
    return;
  }
  const user = await handleFormDataPatchRequest<R, Partial<EditProfileFormTypes>>({
    url: API_ROUTES.UPDATE_PROFILE,
    data,
  });
  if (user?.user) {
    store.dispatch(
      setUserDetails(
        normalizeSniftUser(user.user as Partial<User> & Record<string, unknown>),
      ),
    );
    if (wantBack ?? true) {
      onBack();
    }
  }
};

/** Get user details by ID (for chat, profile preview, etc.) */
const getUserById = async (userId: number): Promise<User | null> => {
  if (ENV_CONSTANTS.IS_ALPHA_PHASE) return null;
  try {
    const res = await handleGetApiRequest<{ user: User }>({
      url: API_ROUTES.GET_USER_BY_ID(userId),
    });
    return res?.user ?? null;
  } catch {
    return null;
  }
};

/** Silent location-only PATCH — no toast, no navigation, no Redux update. */
const updateUserLocation = async (latitude: number, longitude: number): Promise<void> => {
  if (ENV_CONSTANTS.IS_ALPHA_PHASE) return;
  await handlePatchApiRequest<{ user: User }, { latitude: string; longitude: string }>({
    url: API_ROUTES.UPDATE_USER_LOCATION,
    data: { latitude: String(latitude), longitude: String(longitude) },
  });
};

export { getUserDetails, updateUserDetails, updatePassword, getUserById, updateUserLocation };
