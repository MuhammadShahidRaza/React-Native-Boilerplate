import { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import {
  handleNotificationOpenedApp,
  messageHandler,
  onForegroundEvent,
  requestNotificationPermission,
} from 'utils/notifications';

interface RemoteMessageData {
  custom?: string;
}

const useFirebaseMessaging = () => {
  requestNotificationPermission();
  useEffect(() => {
    const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
      if (remoteMessage) {
        messageHandler(remoteMessage);
      }
    });

    const unsubscribeOnNotificationOpenedApp = messaging().onNotificationOpenedApp(
      remoteMessage => {
        if (remoteMessage) {
          const data: RemoteMessageData = JSON.parse(remoteMessage.data?.custom || '{}');
          handleNotificationOpenedApp(data);
        }
      },
    );

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          const data: RemoteMessageData = JSON.parse(remoteMessage.data?.custom || '{}');
          handleNotificationOpenedApp(data, 5000); // Adjust timeout as needed
        }
      });

    const unsubscribeForegroundEvent = onForegroundEvent();

    return () => {
      unsubscribeOnMessage();
      unsubscribeOnNotificationOpenedApp();
      unsubscribeForegroundEvent();
    };
  }, [messageHandler, handleNotificationOpenedApp, onForegroundEvent]);
};

export default useFirebaseMessaging;
