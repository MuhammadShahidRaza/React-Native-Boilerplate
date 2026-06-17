import { useState, useEffect } from 'react';
import { ENV_CONSTANTS, VARIABLES } from 'constants/common';
import { resetSessionState } from 'store/resetSessionState';
import { ensurePlatformSettingsLoaded } from 'services/platformSettings';
import { RootState, useAppDispatch, useAppSelector } from 'types/reduxTypes';
import { useTranslation } from './useTranslation';
import { requestNotificationPermission } from 'utils/notifications';
import { getUserDetails } from 'api/functions/app/user';
import { getCrashlytics, log } from '@react-native-firebase/crashlytics';
import { getKeychainItem } from 'utils/storage';
import { logger } from 'utils/logger';

interface UserLoginStatus {
  isUserLoggedIn: boolean;
  isLoading: boolean;
  isUserVisitedApp: boolean;
  appLanguage: string;
}

export const useUserLoginStatus = (): UserLoginStatus => {
  const dispatch = useAppDispatch();
  const { changeLanguage } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const { isUserLoggedIn, isUserVisitedApp, appLanguage } = useAppSelector(
    (state: RootState) => state.app,
  );
  const crashlyticsInstance = getCrashlytics();

  useEffect(() => {
    const checkUserIsLogin = async () => {
      try {
        log(crashlyticsInstance, 'App mounted.');
        // Redux-persist will automatically restore isUserVisitedApp and appLanguage
        // We just need to apply the language if it exists
        if (appLanguage) {
          changeLanguage(appLanguage);
        }

        // Check secure storage for auth token (will be null on fresh install)
        const authToken = await getKeychainItem(VARIABLES.USER_TOKEN);

        if (authToken && isUserLoggedIn) {
          // Token exists and user was logged in - verify and fetch user details
          // But if it does, we need to fetch user details
          if (!ENV_CONSTANTS.IS_ALPHA_PHASE) {
            await getUserDetails();
            await ensurePlatformSettingsLoaded(dispatch);
          }

          requestNotificationPermission();
          // // Wait for app to be fully ready before requesting permissions
          // // This ensures the Activity is attached on Android
          // InteractionManager.runAfterInteractions(() => {
          //   // Additional delay to ensure Activity is fully ready
          //   setTimeout(() => {
          //     requestNotificationPermission().catch(error => {
          //       console.warn('Notification permission request failed:', error);
          //       // Don't throw - permission can be requested later
          //     });
          //   }, 1000);
          // });
        } else if (!authToken && isUserLoggedIn) {
          // Token missing but state says logged in - logout user
          resetSessionState(dispatch);
        }
      } catch (error) {
        logger.error('Error checking user login status:', error);
        // On error, logout user to be safe
        resetSessionState(dispatch);
      } finally {
        // Match the splash video duration (3 seconds)
        setTimeout(() => {
          setIsLoading(false);
        }, 3000);
      }
    };
    checkUserIsLogin();
  }, []);

  return {
    isUserLoggedIn: isUserLoggedIn,
    isLoading: isLoading,
    isUserVisitedApp: isUserVisitedApp,
    appLanguage: appLanguage,
  };
};
