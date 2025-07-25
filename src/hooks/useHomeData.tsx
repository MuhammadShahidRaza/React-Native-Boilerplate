import { useState, useEffect } from 'react';
import { getItem } from 'utils/index';
import { VARIABLES } from 'constants/common';
import { setAppLanguage, setIsUserLoggedIn, setIsUserVisitedApp } from 'store/slices/appSettings';
import { RootState, useAppDispatch, useAppSelector } from 'types/reduxTypes';
import { useTranslation } from './useTranslation';
import crashlytics from '@react-native-firebase/crashlytics';
import { requestNotificationPermission } from 'utils/notifications';
import { getUserDetails } from 'api/functions/app/user';
import { getMainCategories } from 'api/functions/app/home';
import { Category, CategoryList } from 'types/responseTypes';

interface UserLoginStatus {
  isUserLoggedIn: boolean;
  isLoading: boolean;
  isUserVisitedApp: boolean;
  appLanguage: string;
}

export const useHomeData = ({ categoryID }: { categoryID: string }) => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        const categories: Category[] = getMainCategories();
      } catch (error) {
        console.error('Error checking user login status:', error);
      } finally {
      }
    };
    getData();
  }, []);

  return {
    // categories,
  };
};
