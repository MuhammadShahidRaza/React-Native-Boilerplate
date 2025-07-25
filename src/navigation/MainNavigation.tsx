import { theme } from 'theme/index';
import { AppNavigator, AuthNavigator, navigationRef } from './index';
import { useUserLoginStatus } from 'hooks/index';
import { NavigationContainer } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { Splash } from 'screens/index';

const MainNavigation = () => {
  const { isUserLoggedIn, isLoading } = useUserLoginStatus();
  if (isLoading) {
    return <Splash />;
  }

  return (
    <NavigationContainer theme={theme} ref={navigationRef}>
      {isUserLoggedIn ? <AppNavigator /> : <AuthNavigator />}
      <Toast />
    </NavigationContainer>
  );
};

export default MainNavigation;
