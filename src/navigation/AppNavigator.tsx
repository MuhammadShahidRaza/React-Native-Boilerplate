import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SCREENS } from 'constants/index';
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
  Categories,
} from 'screens/user';
import { BottomNavigator } from './BottomNavigator';
import { useBackHandler } from 'hooks/index';
import { ChangePassword } from 'screens/user/ChangePassword';
import { ChangeLanguage } from 'screens/user/ChangeLanguage';
import { ContactSupport } from 'screens/user/ContactSupport';
import { PaymentInformation } from 'screens/user/PaymentInformation';

const screens = {
  [SCREENS.BOTTOM_STACK]: BottomNavigator,
  [SCREENS.CATEGORIES]: Categories,
  [SCREENS.NOTIFICATION_LISTING]: NotificationListing,
  [SCREENS.ABOUT]: AboutUs,
  [SCREENS.ADD_REVIEW]: AddReview,
  [SCREENS.LOCATION]: Location,
  [SCREENS.CHAT]: Chat,
  [SCREENS.PROFILE]: Profile,
  [SCREENS.EDIT_PROFILE]: EditProfile,
  [SCREENS.SEARCH]: Search,
  [SCREENS.NOTIFICATIONS]: Notification,
  [SCREENS.FILTER]: Filter,
  [SCREENS.CHANGE_LANGUAGE]:ChangeLanguage,
  [SCREENS.CHANGE_PASSWORD]:ChangePassword,
  [SCREENS.CHAT]: Chat,
  [SCREENS.MESSAGES]: Messages,
  [SCREENS.SETTINGS]: Settings,
  [SCREENS.LANGUAGE]: Language,
  [SCREENS.HELP]: Help,
  [SCREENS.CONTACT_US]: ContactUs,
  [SCREENS.REVIEWS]: Reviews,
  [SCREENS.CONTACT_SUPPORT]:ContactSupport,
  [SCREENS.PAYMENTINFORMATION]:PaymentInformation
};

export const AppNavigator = () => {
  useBackHandler();
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}>
      {Object.entries(screens).map(([screenName, component]) => (
        <Stack.Screen
          key={screenName}
          name={screenName}
          component={component}
        />
      ))}
    </Stack.Navigator>
  );
};
