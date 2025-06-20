import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { COMMON_TEXT, SCREENS } from 'constants/index';
import {
  Chat,
  Filter,
  Messages,
  Notification,
  Search,
  Reviews,
  AddReview,
  NotificationListing,
  Profile,
  EditProfile,
  Language,
  ContactUs,
  AboutUs,
  Settings,
  Help,
  Location,
  Home,
  SubCategoryItems,
  Details,
} from 'screens/user';
import { BottomNavigator } from './BottomNavigator';
import { useBackHandler, useTranslation } from 'hooks/index';
import { ViewAll } from 'screens/user/ViewAll';
import { screenOptions } from '.';

export const AppNavigator = () => {
  useBackHandler();
  const Stack = createNativeStackNavigator();
  const { t } = useTranslation();

  const screens = {
    [SCREENS.BOTTOM_STACK]: {
      component: BottomNavigator,
      options: { headerShown: false },
    },
    [SCREENS.HOME]: {
      component: Home,
      options: { headerShown: false },
    },
    [SCREENS.NOTIFICATION_LISTING]: {
      component: NotificationListing,
      options: { headerShown: false },
    },
    [SCREENS.ABOUT]: {
      component: AboutUs,
      options: { headerShown: false },
    },
    [SCREENS.ADD_REVIEW]: {
      component: AddReview,
      options: { headerShown: true, headerTitle: t(COMMON_TEXT.REVIEW) },
    },
    [SCREENS.LOCATION]: {
      component: Location,
      options: { headerShown: false },
    },
    [SCREENS.CHAT]: {
      component: Chat,
      options: { headerShown: false },
    },
    [SCREENS.PROFILE]: {
      component: Profile,
      options: { headerShown: false },
    },
    [SCREENS.EDIT_PROFILE]: {
      component: EditProfile,
      options: { headerShown: false },
    },
    [SCREENS.SUB_CATEGORY_ITEMS]: {
      component: SubCategoryItems,
      options: { headerShown: true },
    },
    [SCREENS.SEARCH]: {
      component: Search,
      options: { headerShown: false },
    },
    [SCREENS.NOTIFICATIONS]: {
      component: Notification,
      options: { headerShown: false },
    },
    [SCREENS.FILTER]: {
      component: Filter,
      options: { headerShown: false },
    },
    [SCREENS.VIEW_ALL]: {
      component: ViewAll,
      options: { headerShown: true, headerTitle: t(COMMON_TEXT.VIEW_ALL) },
    },
    [SCREENS.MESSAGES]: {
      component: Messages,
      options: { headerShown: false },
    },
    [SCREENS.SETTINGS]: {
      component: Settings,
      options: { headerShown: false },
    },
    [SCREENS.LANGUAGE]: {
      component: Language,
      options: { headerShown: false },
    },
    [SCREENS.HELP]: {
      component: Help,
      options: { headerShown: false },
    },
    [SCREENS.CONTACT_US]: {
      component: ContactUs,
      options: { headerShown: false },
    },
    [SCREENS.REVIEWS]: {
      component: Reviews,
      options: { headerShown: false },
    },
    [SCREENS.DETAILS]: {
      component: Details,
      options: { headerShown: true },
    },
  };
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {Object.entries(screens).map(
        ([name, { component, options }]: [string, { component: any; options: any }]) => (
          <Stack.Screen
            key={name}
            name={name}
            component={component}
            options={{
              headerBackButtonDisplayMode: 'minimal',
              ...options,
            }}
          />
        ),
      )}
    </Stack.Navigator>
  );
};
