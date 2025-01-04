import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SCREENS} from 'constants/index';
import {useUserLoginStatus} from 'hooks/index';
import {useBackHandler} from 'hooks/index';
import {
  Login,
  SignUp,
  Verification,
  OnBoarding,
  ResetPassword,
  ForgotPassword,
  Language,
} from 'screens/auth';

export const AuthNavigator = () => {
  useBackHandler();
  const {isUserVisitedApp, appLanguage} = useUserLoginStatus();
  const Stack = createNativeStackNavigator();

  const screens = {
    ...(isUserVisitedApp ? {} : {[SCREENS.ONBOARDING]: OnBoarding}),
    ...(appLanguage ? {} : {[SCREENS.LANGUAGE]: Language}),
    [SCREENS.LOGIN]: Login,
    [SCREENS.SIGN_UP]: SignUp,
    [SCREENS.FORGOT_PASSWORD]: ForgotPassword,
    [SCREENS.RESET_PASSWORD]: ResetPassword,
    [SCREENS.VERIFICATION]: Verification,
  };

  return (
    <Stack.Navigator screenOptions={{headerShown: false, animation: 'fade'}}>
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
