import {
  getInitialNotification,
  getMessaging,
  onMessage,
  onNotificationOpenedApp,
} from '@react-native-firebase/messaging';
import { useEffect } from 'react';
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
    const unsubscribeOnMessage = onMessage(getMessaging(), async remoteMessage => {
      if (remoteMessage) {
        messageHandler(remoteMessage);
      }
    });

    const unsubscribeOnNotificationOpenedApp = onNotificationOpenedApp(
      getMessaging(),
      remoteMessage => {
        if (remoteMessage) {
          const customData =
            typeof remoteMessage.data?.custom === 'string'
              ? remoteMessage.data.custom
              : JSON.stringify(remoteMessage.data?.custom || {});
          const data: RemoteMessageData = JSON.parse(customData);
          handleNotificationOpenedApp(data);
        }
      },
    );

    getInitialNotification(getMessaging()).then(remoteMessage => {
      if (remoteMessage) {
        const customData =
          typeof remoteMessage.data?.custom === 'string'
            ? remoteMessage.data.custom
            : JSON.stringify(remoteMessage.data?.custom || {});
        const data: RemoteMessageData = JSON.parse(customData);
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

// import { useEffect } from 'react';
// import messaging from '@react-native-firebase/messaging';
// import {
//   handleNotificationOpenedApp,
//   messageHandler,
//   onForegroundEvent,
//   requestNotificationPermission,
// } from 'utils/notifications';

// interface RemoteMessageData {
//   custom?: string;
// }

// const useFirebaseMessaging = () => {
//   requestNotificationPermission();
//   useEffect(() => {
//     const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
//       if (remoteMessage) {
//         messageHandler(remoteMessage);
//       }
//     });

//     const unsubscribeOnNotificationOpenedApp = messaging().onNotificationOpenedApp(
//       remoteMessage => {
//         if (remoteMessage) {
//           const data: RemoteMessageData = JSON.parse(remoteMessage.data?.custom || '{}');
//           handleNotificationOpenedApp(data);
//         }
//       },
//     );

//     messaging()
//       .getInitialNotification()
//       .then(remoteMessage => {
//         if (remoteMessage) {
//           const data: RemoteMessageData = JSON.parse(remoteMessage.data?.custom || '{}');
//           handleNotificationOpenedApp(data, 5000); // Adjust timeout as needed
//         }
//       });

//     const unsubscribeForegroundEvent = onForegroundEvent();

//     return () => {
//       unsubscribeOnMessage();
//       unsubscribeOnNotificationOpenedApp();
//       unsubscribeForegroundEvent();
//     };
//   }, [messageHandler, handleNotificationOpenedApp, onForegroundEvent]);
// };

// export default useFirebaseMessaging;

// // import { useEffect } from 'react';
// // import messaging from '@react-native-firebase/messaging';
// // import {
// //   handleNotificationOpenedApp,
// //   messageHandler,
// //   onForegroundEvent,
// //   requestNotificationPermission,
// // } from 'utils/notifications';

// // interface RemoteMessageData {
// //   custom?: string;
// // }

// // const useFirebaseMessaging = () => {
// //   requestNotificationPermission();
// //   useEffect(() => {
// //     const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
// //       if (remoteMessage) {
// //         messageHandler(remoteMessage);
// //       }
// //     });

// //     const unsubscribeOnNotificationOpenedApp = messaging().onNotificationOpenedApp(
// //       remoteMessage => {
// //         if (remoteMessage) {
// //           const data: RemoteMessageData = JSON.parse(remoteMessage.data?.custom || '{}');
// //           handleNotificationOpenedApp(data);
// //         }
// //       },
// //     );

// //     messaging()
// //       .getInitialNotification()
// //       .then(remoteMessage => {
// //         if (remoteMessage) {
// //           const data: RemoteMessageData = JSON.parse(remoteMessage.data?.custom || '{}');
// //           handleNotificationOpenedApp(data, 5000); // Adjust timeout as needed
// //         }
// //       });

// //     const unsubscribeForegroundEvent = onForegroundEvent();

// //     return () => {
// //       unsubscribeOnMessage();
// //       unsubscribeOnNotificationOpenedApp();
// //       unsubscribeForegroundEvent();
// //     };
// //   }, [messageHandler, handleNotificationOpenedApp, onForegroundEvent]);
// // };

// // export default useFirebaseMessaging;
