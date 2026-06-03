import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SCREENS } from 'constants/index';
import { useBackHandler, useUserLoginStatus } from 'hooks/index';
import { VARIANT } from 'config/variant';
import {
  Login,
  SignUp,
  Verification,
  ResetPassword,
  ForgotPassword,
  OnBoarding,
  GetStarted,
} from 'screens/auth';
import { screenOptions } from './Navigators';
import { PrivacyPolicy } from 'screens/common';
import { renderCommonScreens } from './CommonNavigator';

export const AuthNavigator = () => {
  useBackHandler();
  const { isUserVisitedApp } = useUserLoginStatus();

  const Stack = createNativeStackNavigator();

  const screens: Record<string, React.ComponentType<any>> = {
    ...(isUserVisitedApp || !VARIANT.features.showOnboarding
      ? {}
      : {
          [SCREENS.ONBOARDING]: OnBoarding,
        }),
    ...(VARIANT.features.showGetStarted
      ? { [SCREENS.GET_STARTED]: GetStarted }
      : {}),
    [SCREENS.LOGIN]: Login,
    [SCREENS.SIGN_UP]: SignUp,
    [SCREENS.FORGOT_PASSWORD]: ForgotPassword,
    [SCREENS.RESET_PASSWORD]: ResetPassword,
    [SCREENS.VERIFICATION]: Verification,
    [SCREENS.PRIVACY_POLICY]: PrivacyPolicy,
  };

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {Object.entries(screens).map(([name, component]) => (
        <Stack.Screen key={name} name={name} component={component} />
      ))}
      {renderCommonScreens(Stack)}
    </Stack.Navigator>
  );
};
