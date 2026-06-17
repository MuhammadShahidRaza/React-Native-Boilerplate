/**
 * @format
 */
import 'react-native-get-random-values';
import './src/i18n';
import { AppRegistry } from 'react-native';
import notifee from '@notifee/react-native';
import App from './App';
import { name as appName } from './app.json';
import { runWorkerTrackingForegroundTask } from './src/services/location/workerActiveJobTracking';

try {
  notifee.registerForegroundService(() => runWorkerTrackingForegroundTask());
} catch (error) {
  console.warn('Notifee foreground service registration failed:', error);
}

AppRegistry.registerComponent(appName, () => App);
