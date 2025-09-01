import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import appleAuth, { appleAuthAndroid } from '@invertase/react-native-apple-authentication';
// import * as Zendesk from 'react-native-zendesk-messaging';
import { decode as atob } from 'base-64';
import { ENV_CONSTANTS } from 'constants/common';
import { isIOS } from './functions';
import { showToast } from 'utils/toast';
const userData = {
  social_id: '',
  name: '',
  first_name: 'null',
  last_name: '',
  email: '',
  username: '',
  picture: null,
};

export const GoogleSignIn = async () => {
  try {
    GoogleSignin.configure({
      webClientId: ENV_CONSTANTS.GOOGLE_ANDROID_CLIENT_ID,
      iosClientId: ENV_CONSTANTS.GOOGLE_IOS_CLIENT_ID,
      offlineAccess: ENV_CONSTANTS.GOOGLE_ANDROID_CLIENT_ID ? true : false,
    });
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    const user = userInfo?.data?.user;
    if (user) {
      Object.assign(userData, {
        social_id: user?.id,
        name: user?.name ?? user?.givenName + ' ' + user?.familyName,
        first_name: user?.givenName,
        last_name: user?.familyName,
        email: user?.email,
        username:
          user?.givenName != null ? user?.givenName + new Date().getUTCMilliseconds() : user?.id,
        picture: user?.photo,
      });
      return userData;
    }
    return userData;
  } catch (error: any) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      // user cancelled the login flow
    } else if (error.code === statusCodes.IN_PROGRESS) {
      // operation (f.e. sign in) is in progress already
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      // play services not available or outdated
    } else {
      showToast({ message: error?.message });
    }
    return userData;
  } finally {
    signOutGoogle();
  }
};

// export const AppleSignIn = async () => {

//   try {

//     const userData = {
//       id: null,
//       name: null,
//       email: null,
//       username: null,
//       picture: null,
//     };
//     if (isIOS()) {
//       const appleAuthRequestResponse = await appleAuth.performRequest({
//         requestedOperation: appleAuth.Operation.LOGIN,
//         requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
//       });
//       const credentialState = await appleAuth.getCredentialStateForUser(
//         appleAuthRequestResponse.user,
//       );
//       if (credentialState === appleAuth.State.AUTHORIZED) {
//         Object.assign(userData, {
//           id: appleAuthRequestResponse?.user,
//           name: appleAuthRequestResponse?.fullName?.givenName
//             ? appleAuthRequestResponse?.fullName?.givenName +
//               ' ' +
//               appleAuthRequestResponse?.fullName?.familyName
//             : null,
//           email: appleAuthRequestResponse?.email,
//         });
//         return userData;
//       }
//       return userData;
//     } else {
//       appleAuthAndroid.configure({
//         clientId: ENV_CONSTANTS.APPLE_CLIENT_ID_FOR_ANDROID,
//         redirectUri: ENV_CONSTANTS.APPLE_REDIRECT_URL,
//         responseType: appleAuthAndroid.ResponseType.ALL,
//         scope: appleAuthAndroid.Scope.ALL,
//       });
//       const response = await appleAuthAndroid.signIn();
//       const decodedIdToken = JSON.parse(
//         atob(response?.id_token?.split('.')[1] ?? ''),
//       );
//       const appleId = decodedIdToken.sub;
//       const appleEmail = decodedIdToken.email;
//       Object.assign(userData, {
//         id: appleId,
//         email: appleEmail,
//       });
//       return userData;
//     }

//     if (userData.id) {

//       const data = user?.email
//         ? {
//             name: user?.name ?? user?.email?.split('@')[0],
//             email: user?.email,
//             username: user?.name
//               ? user?.name + new Date().getUTCMilliseconds()
//               : user?.email?.split('@')[0] + new Date().getUTCMilliseconds(),
//             social_id: user?.id,
//             fcm_token: token,
//             device_type: deviceType(),
//             udid: await deviceUDID(),
//             picture: user?.picture,
//           }
//         : {
//             social_id: user?.id,
//             fcm_token: token,
//             device_type: deviceType(),
//             udid: await deviceUDID(),
//           };
//   } catch (error) {

//   }}

// };

export const signOutGoogle = async () => {
  try {
    await GoogleSignin.signOut();
  } catch (error) {
    console.error(error);
  }
};

export const signOutApple = () => {
  try {
    appleAuth.Operation.LOGOUT;
  } catch (error) {
    console.error(error);
  }
};

// export const openZendeskChat = () => {
//   Zendesk.initialize({channelKey: isIOS() ? ZENDESK_IOS : ZENDESK_ANDROID})
//     .then(() => {
//       Zendesk.openMessagingView();
//     })
//     .catch(error => {});
// };
