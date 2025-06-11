import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { IMAGES, SCREENS, VARIABLES } from 'constants/index';
import { COLORS } from 'utils/colors';
import { Icon, Typography } from 'components/common';
import { View, StyleSheet, Image } from 'react-native';
import { FontSize, FontWeight } from 'types/fontTypes';
import { isIOS, screenHeight } from 'utils/index';
import { Bookings, Chat, Home, Profile } from 'screens/user';
import { useTranslation } from 'hooks/useTranslation';

const screens = {
  [SCREENS.HOME]: Home,
  [SCREENS.BOOKING]: Bookings,
  [SCREENS.CHAT]: Chat,
  [SCREENS.PROFILE]: Profile,


};

const getIconConfig = (routeName: string) => {
  switch (routeName) {
    case SCREENS.HOME:
      return { iconName: 'HOME', componentName: "Home" };
    case SCREENS.BOOKING:
      return { iconName: 'BOOKINGS', componentName: "Bookings" };
    case SCREENS.CHAT:
      return { iconName: 'CHAT', componentName: "Chat" };
    case SCREENS.PROFILE:
      return { iconName: 'PROFILE', componentName: "Profile" };
  }
};

export const BottomNavigator = () => {
  const { isLangRTL } = useTranslation();
  const Bottom = createBottomTabNavigator();

  const renderedPages = isLangRTL
    ? // ? Object.entries(screens).reverse()
    Object.entries(screens)
    : Object.entries(screens);

  return (
    <Bottom.Navigator
      screenOptions={({ route }) => {
        const { iconName, componentName, iconStyle } = getIconConfig(route.name);
        return {
          headerShown: false,
          tabBarStyle: {
            backgroundColor: COLORS.WHITE,
            height: screenHeight(isIOS() ? 9 : 6.5),
            paddingTop: 20,
          },
          tabBarLabel: '',
          tabBarHideOnKeyboard: true,
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <Image style={[styles.imageIconStyle, { tintColor: focused ? COLORS.PRIMARY : COLORS.BLACK }]} source={IMAGES[iconName]} />
              <Typography style={[styles.componentName, { color: focused ? COLORS.PRIMARY : COLORS.BLACK }]}>{componentName}</Typography>
            </View>
          ),
        };
      }}>
      {renderedPages.map(([screenName, component]) => (
        <Bottom.Screen
          key={screenName}
          name={screenName}
          component={component}
        />
      ))}
    </Bottom.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',

  },
  indicator: {
    height: 10,
    width: 10,
    marginTop: 10,
    borderRadius: 10,
  },
  imageIconStyle: {
    height: 20,
    width: 20
  },
  componentName: {
    fontSize: FontSize.Small,
    fontWeight: FontWeight.Medium,
    color: COLORS.BLACK,
    minWidth: 80,
    textAlign: 'center',
    marginTop: 4
  }
});
