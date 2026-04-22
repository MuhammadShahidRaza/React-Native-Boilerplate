import { navigationRef } from 'navigation/Navigators';
import { useEffect } from 'react';
import { Alert, BackHandler } from 'react-native';

export const useBackHandler = () => {
  useEffect(() => {
    const onBackPress = () => {
      if (navigationRef.current?.canGoBack()) {
        navigationRef.current.goBack();
        return true;
      } else {
        Alert.alert(
          'Exit App',
          'Are you sure you want to exit?',
          [
            { text: 'Cancel', onPress: () => {}, style: 'cancel' },
            { text: 'Exit', onPress: () => BackHandler.exitApp() },
          ],
          { cancelable: false },
        );
        return true;
      }
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backHandler.remove();
  }, []);
};
