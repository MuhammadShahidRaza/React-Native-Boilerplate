import { SCREENS } from 'constants/routes';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Splash } from 'screens/common';

const screens = {
  [SCREENS.SPLASH]: Splash,
};

export const CommonNavigator = () => {
  const Common = createNativeStackNavigator();
  return (
    <Common.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      {Object.entries(screens).map(([screenName, component]) => (
        <Common.Screen key={screenName} name={screenName} component={component} />
      ))}
    </Common.Navigator>
  );
};
