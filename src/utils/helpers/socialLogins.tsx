import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import appleAuth, { appleAuthAndroid } from '@invertase/react-native-apple-authentication';
// import * as Zendesk from 'react-native-zendesk-messaging';
import { decode as atob } from 'base-64';
import { ENV_CONSTANTS } from 'constants/common';
import { isIOS } from './functions';
import { deviceDetails } from './functions';
import { showToast } from 'utils/toast';
import { logger } from 'utils/logger';

/** Extract display name from email when full_name is empty (e.g. john.doe@x.com -> John Doe) */
const extractNameFromEmail = (email: string): string => {
  const beforeAt = email.split('@')[0]?.trim() || 'User';
  return (
    beforeAt
      .split(/[._-]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ')
      .trim() || 'User'
  );
};

/** Decode JWT payload (middle part) and return parsed object */
const decodeJwtPayload = (token: string): Record<string, unknown> => {
  try {
    const payload = token.split('.')[1];
    return payload ? JSON.parse(atob(payload)) : {};
  } catch {
    return {};
  }
};

/** Payload for social-login endpoint. Only send fields that are available. */
export type SocialLoginPayload = {
  provider_id: string;
  provider: 'google' | 'apple';
  user_type: 'user' | 'dentor';
  email?: string;
  full_name?: string;
  picture?: string | null;
  udid?: string;
  device_type?: string;
  device_brand?: string;
  device_os?: string;
  app_version?: string;
  device_token?: string;
};

export const GoogleSignIn = async (
  user_type: 'user' | 'dentor',
): Promise<SocialLoginPayload | null> => {
  try {
    GoogleSignin.configure({
      webClientId: ENV_CONSTANTS.GOOGLE_ANDROID_CLIENT_ID,
      iosClientId: ENV_CONSTANTS.GOOGLE_IOS_CLIENT_ID,
      offlineAccess: ENV_CONSTANTS.GOOGLE_ANDROID_CLIENT_ID ? true : false,
    });
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    const user = userInfo?.data?.user;
    if (!user?.id) return null;

    const device = await deviceDetails();
    let fullName =
      user?.name ?? [user?.givenName, user?.familyName].filter(Boolean).join(' ').trim();
    if (!fullName && user?.email) fullName = extractNameFromEmail(user.email);

    const payload: SocialLoginPayload = {
      provider_id: user.id,
      provider: 'google',
      user_type,
      ...device,
    };
    if (user?.email) payload.email = user.email;
    if (fullName) payload.full_name = fullName;
    if (user?.photo) payload.picture = user.photo;

    return payload;
  } catch (error: any) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      // user cancelled
    } else if (error.code === statusCodes.IN_PROGRESS) {
      // already in progress
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      showToast({ message: 'Play services not available' });
    } else {
      showToast({ message: error?.message });
    }
    return null;
  } finally {
    signOutGoogle();
  }
};

export const AppleSignIn = async (
  user_type: 'user' | 'dentor',
): Promise<SocialLoginPayload | null> => {
  try {
    const device = await deviceDetails();

    if (isIOS()) {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
      });
      const credentialState = await appleAuth.getCredentialStateForUser(
        appleAuthRequestResponse.user,
      );
      if (credentialState !== appleAuth.State.AUTHORIZED) return null;

      let fullName =
        appleAuthRequestResponse?.fullName?.givenName ||
        appleAuthRequestResponse?.fullName?.familyName
          ? [
              appleAuthRequestResponse?.fullName?.givenName,
              appleAuthRequestResponse?.fullName?.familyName,
            ]
              .filter(Boolean)
              .join(' ')
              .trim()
          : undefined;

      // Extract email from response or from identity_token JWT (Apple only sends email on first sign-in)
      const emailFromToken =
        appleAuthRequestResponse?.identityToken &&
        (decodeJwtPayload(appleAuthRequestResponse.identityToken).email as string | undefined);
      const email = appleAuthRequestResponse?.email ?? emailFromToken;
      // if (!fullName && email) fullName = extractNameFromEmail(email);

      const payload: SocialLoginPayload = {
        provider_id: appleAuthRequestResponse.user,
        provider: 'apple',
        user_type,
        ...device,
      };
      if (email) payload.email = email;
      if (fullName) payload.full_name = fullName;

      return payload;
    } else {
      appleAuthAndroid.configure({
        clientId: ENV_CONSTANTS.APPLE_CLIENT_ID_FOR_ANDROID,
        redirectUri: ENV_CONSTANTS.APPLE_REDIRECT_URL,
        responseType: appleAuthAndroid.ResponseType.ALL,
        scope: appleAuthAndroid.Scope.ALL,
      });
      const response = await appleAuthAndroid.signIn();
      const decodedIdToken = JSON.parse(atob(response?.id_token?.split('.')[1] ?? '{}')) as {
        sub?: string;
        email?: string;
      };
      const appleId = decodedIdToken.sub;
      const appleEmail = decodedIdToken.email;

      if (!appleId) return null;

      const fullName = appleEmail ? extractNameFromEmail(appleEmail) : undefined;
      const payload: SocialLoginPayload = {
        provider_id: appleId,
        provider: 'apple',
        user_type,
        ...device,
      };
      if (appleEmail) payload.email = appleEmail;
      if (fullName) payload.full_name = fullName;
      logger.log(fullName);
      logger.log(appleEmail);

      return payload;
    }
  } catch (error) {
    const err = error as Error & { code?: number };
    const msg = err?.message ?? '';
    const isUserCancelled =
      err?.code === 1001 || msg.includes('1001') || msg.includes('E_SIGNIN_CANCELLED_ERROR'); // 1001 = ASAuthorizationErrorCanceled
    if (!isUserCancelled) showToast({ message: msg || 'Apple Sign In failed' });
    return null;
  } finally {
    signOutApple();
  }
};

export const signOutGoogle = async () => {
  try {
    await GoogleSignin.signOut();
  } catch (error) {
    logger.error(error);
  }
};

export const signOutApple = () => {
  try {
    appleAuth.Operation.LOGOUT;
  } catch (error) {
    logger.error(error);
  }
};
// export const openZendeskChat = () => {
//   Zendesk.initialize({channelKey: isIOS() ? ZENDESK_IOS : ZENDESK_ANDROID})
//     .then(() => {
//       Zendesk.openMessagingView();
//     })
//     .catch(error => {});
// };
