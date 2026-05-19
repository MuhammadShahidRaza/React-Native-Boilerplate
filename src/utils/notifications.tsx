import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { COLORS, isIOS } from './index';
import { logger } from 'utils/logger';
import store from 'store/store';
import { PermissionsAndroid } from 'react-native';
import {
  incrementNewInquiriesUnreadCount,
  setIsNotificationAllowed,
} from 'store/slices/notification';
import { VARIABLES } from 'constants/common';
import { navigate } from 'navigation/index';
import { SCREENS } from 'constants/routes';
import { JobStatus } from 'screens/user/MyJobs';
import { APP_CONFIG, isWorkerRole } from 'config/app';
import type { USER_TYPE } from 'types/auth';
import {
  AuthorizationStatus,
  getMessaging,
  getToken,
  requestPermission,
} from '@react-native-firebase/messaging';
import { setNotificationUnreadCount } from 'store/slices/user';

interface DisplayNotificationParams {
  notificationData: any;
  iosSetting?: any;
  androidSetting?: any;
  customButtons?: any;
}

async function displayNotification({
  notificationData,
  iosSetting,
  androidSetting,
  customButtons,
}: DisplayNotificationParams) {
  const notification = JSON.parse(notificationData?.data?.custom);

  console.log('NOTIFY+++=', notification);

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
        // smallIcon: 'drawable/ic_launcher',
        importance: AndroidImportance.HIGH,
        actions: customButtons,
        ...androidSetting,
      },
    });
  } catch (error) {
    logger.log('Notifee error:', error);
  }
}

/** Backend sends object_id / objectable_id for booking ID */
const getJobId = (data: any) => {
  const id =
    data?.booking_id ?? data?.jobId ?? data?.bookingId ?? data?.object_id ?? data?.objectable_id;
  return id != null ? Number(id) : undefined;
};

const getRole = (): USER_TYPE => {
  return store.getState()?.user?.role ?? APP_CONFIG.USER_ROLE;
};

/** Navigate to MyJobs (courier / driver - nested in BottomStack) or fallback for customer */
const navigateToJobsFallback = (params?: { selectedTab?: JobStatus }) => {
  const role = getRole();
  if (isWorkerRole(role)) {
    navigate(SCREENS.BOTTOM_STACK, {
      screen: SCREENS.WORKER_EARNINGS,
      params,
    });
  } else {
    navigate(SCREENS.HOME);
  }
};

/** Shared routing for notification tap – used by push handler and NotificationListing */
export const handleNotificationNavigation = (notificationData: any) => {
  const jobId = getJobId(notificationData);
  const role = getRole();
  // console.log('notificationData?.type', notificationData.actor_id);

  switch (notificationData?.type) {
    case 'payment-withdrawal-requested':
      navigate(SCREENS.MY_WALLET);
      break;
    case 'new-message':
      // navigate(SCREENS.CHAT_FIREBASE);
      if (notificationData?.actor_id) {
        navigate(SCREENS.MESSAGES_FIREBASE, {
          data: { otherUserId: notificationData?.actor_id, bookingId: notificationData?.object_id },
        });
      }
      break;

    case 'new-booking-available':
      if (!isWorkerRole(role)) return;
      if (jobId) {
        navigate(SCREENS.JOB_DETAIL, {
          jobId,
          status: JobStatus.NewInquiries,
        });
      } else {
        navigateToJobsFallback({ selectedTab: JobStatus.NewInquiries });
      }
      break;

    case 'new-quotation-accepted':
      if (!isWorkerRole(role)) return;
      if (jobId) {
        navigate(SCREENS.JOB_DETAIL, {
          jobId,
          status: JobStatus.Confirmed,
          subType: 'Upcoming',
        });
      } else {
        navigateToJobsFallback({ selectedTab: JobStatus.Confirmed });
      }
      break;

    case 'result-of-work-approved':
      if (role !== 'user') return;
      if (jobId) {
      
      } else {
        navigate(SCREENS.HOME);
      }
      break;

    case 'new-quotation-received':
    case 'updated-quotation-received':
      if (role !== 'user') return;
      jobId ? navigate(SCREENS.ALL_BIDS, { data: { jobId } }) : navigate(SCREENS.HOME);
      break;

    case 'booking-status-updated':
      if (role !== 'user') return;
      if (jobId) {
        navigate(SCREENS.JOB_DETAIL, {
          jobId,
          status: notificationData?.status,
          subType: notificationData?.sub_type,
        });
      } else {
        navigate(SCREENS.HOME);
      }
      break;

    case 'proof-of-work-submitted':
      if (role !== 'user') return;
      if (jobId) {
        // navigate(SCREENS.JOB_DETAIL, {
        //   jobId,
        //   status: ActivityStatus.Confirmed,
        //   subType: 'In-Progress',
        // });
      } else {
        navigate(SCREENS.PROOF_OF_VERIFICATION, { isEditable: false, bookingId: jobId });
      }
      break;

    default:
      if (notificationData?.type) {
        logger.log('Unknown notification type:', notificationData.type);
      }
      break;
  }
};

const handleNotificationOpenedApp = (detail: any, isWait = 0) => {
  setTimeout(() => handleNotificationNavigation(detail), isWait);
};

let isOnMessagesScreen = false;
export const setIsOnMessagesScreen = (value: boolean) => {
  isOnMessagesScreen = value;
};

const isMessageNotification = (data: any): boolean => {
  try {
    const custom = typeof data?.custom === 'string' ? JSON.parse(data.custom) : data?.custom;
    const type = custom?.type ?? '';
    return /new-message|chat/i.test(type);
  } catch {
    return false;
  }
};

const getCustomNotification = (data: any) => {
  try {
    if (typeof data?.custom === 'string') {
      return JSON.parse(data.custom);
    }

    return data?.custom ?? null;
  } catch {
    return null;
  }
};

const isNewInquiryNotification = (data: any): boolean => {
  const custom = getCustomNotification(data);
  return custom?.type === 'new-booking-available';
};

const messageHandler = async (remoteMessage: any) => {
  if (isOnMessagesScreen && isMessageNotification(remoteMessage?.data)) return;

  const currentUnreadCount = Number(
    store.getState()?.user?.userDetails?.notification_unread_count ?? 0,
  );
  store.dispatch(setNotificationUnreadCount(currentUnreadCount + 1));

  if (isNewInquiryNotification(remoteMessage?.data)) {
    store.dispatch(incrementNewInquiriesUnreadCount());
  }

  displayNotification({
    notificationData: remoteMessage,
  });
};

const onForegroundEvent = () => {
  return notifee.onForegroundEvent(({ type, detail }) => {
    if (type === EventType.PRESS) {
      handleNotificationOpenedApp(detail?.notification?.data);
    }
  });
};

async function requestNotificationPermission() {
  try {
    if (isIOS()) {
      const authStatus = await requestPermission(getMessaging());
      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;
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
  } catch (error) {
    // Silently handle permission errors - don't crash the app
    logger.warn('Failed to request notification permission:', error);
    // Permission request can fail if Activity is not ready, which is fine
    // We can retry later when the user actually needs notifications
  }
}

export const getFCMToken = async () => {
  try {
    const token = await getToken(getMessaging());
    return token;
  } catch (e) {
    logger.log(e);
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
