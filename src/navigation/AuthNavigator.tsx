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
  // Language,
} from 'screens/auth';
import { screenOptions } from './Navigators';

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
      options: { headerShown: true, headerTitle: t(COMMON_TEXT.FORGOT_PASSWORD) },
    },
    [SCREENS.RESET_PASSWORD]: {
      component: ResetPassword,
      options: { headerShown: true, headerTitle: t(COMMON_TEXT.RESET_PASSWORD) },
    },
    [SCREENS.VERIFICATION]: {
      component: Verification,
      options: { headerShown: true },
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
