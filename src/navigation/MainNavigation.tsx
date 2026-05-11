import { View, StyleSheet } from 'react-native';
import { AppNavigator, AuthNavigator, navigationRef } from './index';
import { useUserLoginStatus } from 'hooks/index';
import { NavigationContainer } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { Splash } from 'screens/index';
import { OfflineBanner } from 'components/index';
import { useTheme } from 'hooks/useTheme';
import { toastConfig } from 'components/common/ToastConfig';

const MainNavigation = () => {
  const { isUserLoggedIn, isLoading } = useUserLoginStatus();
  const { theme, themeVersion } = useTheme();
  if (isLoading) {
    return <Splash />;
  }

  return (
    <View style={styles.shell}>
      <NavigationContainer theme={theme} ref={navigationRef} key={`nav-${themeVersion}`}>
        {isUserLoggedIn ? <AppNavigator /> : <AuthNavigator />}
      </NavigationContainer>
      <Toast config={toastConfig} visibilityTime={4000} />
      <OfflineBanner />
    </View>
  );
};

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
});

export default MainNavigation;
