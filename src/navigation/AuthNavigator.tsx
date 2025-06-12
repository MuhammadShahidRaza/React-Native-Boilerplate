import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { COMMON_TEXT, SCREENS } from 'constants/index';
// import { useUserLoginStatus } from 'hooks/index';
import { useBackHandler, useTranslation } from 'hooks/index';
import {
  Login,
  SignUp,
  Verification,
  // OnBoarding,
  ResetPassword,
  ForgotPassword,
  OnBoarding,
  // Language,
} from 'screens/auth';
import { screenOptions } from './Navigators';
import { Intro } from 'screens/common/intro';
import { RoleSelection } from 'screens/common/RoleSelection';
import MyBooking from 'screens/user/MyBooking';
import BookingDetailsScreen from 'screens/user/BookingDetailsScreen';

export const AuthNavigator = () => {
  useBackHandler();
  const { t } = useTranslation();

  // const { isUserVisitedApp, appLanguage } = useUserLoginStatus();

  const Stack = createNativeStackNavigator();

  const screens = {
    // ...(isUserVisitedApp
    //   ? {}
    //   : {
    //       [SCREENS.ONBOARDING]: {
    //         component: OnBoarding,
    //         options: { headerShown: false },
    //       },
    //     }),
    // ...(appLanguage
    //   ? {}
    //   : {
    //       [SCREENS.LANGUAGE]: {
    //         component: Language,
    //         options: { headerShown: false },
    //       },
    //     }),
    [SCREENS.MYBOOKING]: {
      component: MyBooking,
      options: { headerShown: false },
    },
    [SCREENS.BOOKINGDETAILSCREEN]: {
      component: BookingDetailsScreen,
      options: { headerShown: false },
    },
    [SCREENS.ONBOARDING]: {
      component: OnBoarding,
      options: { headerShown: false },
    },
    [SCREENS.ROLESELECTION]: {
      component: RoleSelection,
      options: { headerShown: false },
    },
    [SCREENS.INTRO]: {
      component: Intro,
      options: { headerShown: false },
    },
    [SCREENS.LOGIN]: {
      component: Login,
      options: { headerShown: false },
    },
    [SCREENS.SIGN_UP]: {
      component: SignUp,
      options: { headerShown: false },
    },
    [SCREENS.FORGOT_PASSWORD]: {
      component: ForgotPassword,
      options: { headerShown: false},
    },
    [SCREENS.RESET_PASSWORD]: {
      component: ResetPassword,
      options: { headerShown: false
       },
    },
    [SCREENS.VERIFICATION]: {
      component: Verification,
      options: { headerShown: false },
    },
  };

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {Object.entries(screens).map(([name, { component, options }]) => (
        <Stack.Screen
          key={name}
          name={name}
          component={component}
          options={{
            headerBackButtonDisplayMode: 'minimal',
            ...options,
          }}
        />
      ))}
    </Stack.Navigator>
  );
};
