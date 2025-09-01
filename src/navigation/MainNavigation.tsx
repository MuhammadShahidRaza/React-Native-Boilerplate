import { theme } from 'theme/index';
import { AppNavigator, AuthNavigator, navigationRef } from './index';
import { useUserLoginStatus } from 'hooks/index';
import { NavigationContainer } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { Splash } from 'screens/index';
import { OfflineBanner } from 'components/index';

const MainNavigation = () => {
  const { isUserLoggedIn, isLoading } = useUserLoginStatus();
  if (isLoading) {
    return <Splash />;
  }

  return (
    <NavigationContainer theme={theme} ref={navigationRef}>
      {isUserLoggedIn ? <AppNavigator /> : <AuthNavigator />}
      <Toast />
      <OfflineBanner />
    </NavigationContainer>
  );
};

export default MainNavigation;
