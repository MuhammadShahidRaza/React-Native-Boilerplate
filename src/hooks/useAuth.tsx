import { useState, useEffect } from 'react';
import { getItem } from 'utils/index';
import { VARIABLES } from 'constants/common';
import { setAppLanguage, setIsUserLoggedIn, setIsUserVisitedApp } from 'store/slices/appSettings';
import { RootState, useAppDispatch, useAppSelector } from 'types/reduxTypes';
import { useTranslation } from './useTranslation';

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

  useEffect(() => {
    const checkUserIsLogin = async () => {
      try {
        const hasUserVisitedTheApp = await getItem(VARIABLES.IS_USER_VISITED_THE_APP);
        const userSelectedLanguage = await getItem(VARIABLES.LANGUAGE);
        if (hasUserVisitedTheApp) {
          dispatch(setIsUserVisitedApp(true));
        }
        if (userSelectedLanguage) {
          changeLanguage(userSelectedLanguage);
          dispatch(setAppLanguage(userSelectedLanguage));
        }
        const isUserLoggedInApp = await getItem(VARIABLES.IS_USER_LOGGED_IN);
        if (isUserLoggedInApp) {
          dispatch(setIsUserLoggedIn(true));
          // await requestNotificationPermission();
          // await getUserDetails();
        }
      } catch (error) {
        console.error('Error checking user login status:', error);
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 4000);
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
