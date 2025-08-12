import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { COLORS, isIOS } from './index';
import store from 'store/store';
import { PermissionsAndroid } from 'react-native';
import { setIsNotificationAllowed } from 'store/slices/notification';
import { VARIABLES } from 'constants/common';
import messaging from '@react-native-firebase/messaging';
async function displayNotification({
  notificationData,
  iosSetting,
  androidSetting,
  customButtons,
}) {
  const notification = JSON.parse(notificationData?.data?.custom);
  try {
    // Request permissions (required for iOS)
    await notifee.requestPermission({
      sound: true,
      announcement: true,
      // inAppNotificationSettings: true,
      alert: true,
    });
    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: notification?.type,
      name: notification?.type,
      importance: AndroidImportance.HIGH,
      badge: true,
      sound: 'default',
      vibration: true,
    });
    // Display a notification
    await notifee.displayNotification({
      title: notification?.title || '',
      body: notification?.body || '',
      data: notification,
      ios: {
        sound: 'default',
        // categoryId: 'your-ios-category-id', // Specify your iOS category ID for custom actions
        // Other iOS-specific settings go here
        ...iosSetting,
      },
      android: {
        channelId,
        showTimestamp: true,
        color: COLORS.YELLOW,
        smallIcon: 'drawable/ic_launcher',
        importance: AndroidImportance.HIGH,
        actions: customButtons,
        ...androidSetting,
      },
    });
  } catch (error) {
    console.log('Notifee error:', error);
  }
}

const handleNotificationOpenedApp = (detail, isWait = 0) => {
  const notificationData = detail;
  setTimeout(() => {
    switch (
      notificationData?.type
      // case "new_comment":
      //   // navigate(SCREENS.HOME, { postId: notificationData });
      //   break;
      // case "reply":
      //   // navigate(SCREENS.PROFILE, { postId: notificationData });
      //   break;
      // case "new_follower":
      //   // navigate(SCREENS.OTHER_PROFILE, { postId: notificationData });
      //   break;
      // case "new_order":
      //   navigate(SCREENS.LOGIN);
      //   break;
      // case "react":
      //   // navigate(SCREENS.HOME, { postId: notificationData });
      //   break;
      // default:
      //   console.log("Unknown type:", notificationData?.type);
      //   break;
    ) {
    }
  }, isWait);
};

const messageHandler = async remoteMessage => {
  displayNotification({ notificationData: remoteMessage });
};

const onForegroundEvent = () => {
  return notifee.onForegroundEvent(({ type, detail }) => {
    if (type === EventType.PRESS) {
      handleNotificationOpenedApp(detail?.notification?.data);
    }
  });
};

async function requestNotificationPermission() {
  if (isIOS()) {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if (enabled) {
      store.dispatch(setIsNotificationAllowed(true));
    }
  } else {
    const response = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    if (response === VARIABLES.GRANTED) {
      store.dispatch(setIsNotificationAllowed(true));
    }
  }
}

export const getFCMToken = async () => {
  try {
    const token = await messaging().getToken();
    return token;
  } catch (e) {
    console.log(e);
    return '';
  }
};

export {
  displayNotification,
  handleNotificationOpenedApp,
  messageHandler,
  requestNotificationPermission,
  onForegroundEvent,
};

// EXAMPLE ( ACTION ):

// {
//     title: 'Mark as Read',
//     pressAction: {
//         id: 'read',
//     },
//     input: true,
// },
