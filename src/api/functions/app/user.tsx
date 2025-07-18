import { API_ROUTES } from 'api/routes';
import { handleGetApiRequest } from '.';
import store from 'store/store';
import { User } from 'types/response';
import { setUserDetails } from 'store/slices/user';
// import crashlytics from '@react-native-firebase/crashlytics';

const getUserDetails = async <R extends { user: User }>() => {
  const user = await handleGetApiRequest<R>(API_ROUTES.GET_PROFILE);
  if (user) {
    // crashlytics().setUserId(String(user.user.id)), store.dispatch(setUserDetails(user?.user));
    // store.dispatch(
    //   setUserDetails({
    //     id: 19,
    //     language_id: 1,
    //     first_name: 'test first name',
    //     last_name: 'test last name',
    //     user_name: null,
    //     email: 'shahid@mailinator.com',
    //     about: null,
    //     verification_code: '56992',
    //     expired_at: '2024-12-19 16:41:32',
    //     email_verified_at: null,
    //     social_id: null,
    //     provider: null,
    //     experience: null,
    //     country: 'null',
    //     city: 'null',
    //     state: null,
    //     address: null,
    //     longitude: null,
    //     latitude: null,
    //     phone: '12345678912',
    //     phone_verification_code: '29922',
    //     phone_verified_at: null,
    //     forgot_password_code: null,
    //     forgot_token: null,
    //     gender: null,
    //     dob: null,
    //     profile_image: null,
    //     customer_stripe_id: null,
    //     is_onbording_complete: 0,
    //     status: 1,
    //     is_active: 1,
    //     is_approved: 0,
    //     availabilty: 1,
    //     is_notify: 1,
    //     user_type: 'user',
    //     user_role: 'user',
    //     created_at: '2024-12-19T15:41:32.000000Z',
    //     updated_at: '2024-12-24T12:22:41.000000Z',
    //     is_subscribed: false,
    //     is_location_updated: false,
    //     token: '91|yCWrwapV8sgSq2xCXB4ToM7eDXNvh3QSFI0jlBfQ5eece8e1',
    //     permissions: null,
    //     token_type: 'bearer',
    //     issue_date: null,
    //   }),
    // );
  }
};

export { getUserDetails };
