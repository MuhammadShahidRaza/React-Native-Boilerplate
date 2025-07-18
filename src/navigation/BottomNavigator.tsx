import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SCREENS, VARIABLES } from 'constants/index';
import { COLORS } from 'utils/colors';
import { Icon, Typography } from 'components/common';
import { View, StyleSheet } from 'react-native';
import { FontSize, FontWeight } from 'types/fontTypes';
import { isIOS, screenHeight } from 'utils/index';
import { Home, MyAccount, Favorites, Orders } from 'screens/user';
import { useTranslation } from 'hooks/useTranslation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const screens = {
  [SCREENS.HOME]: Home,
  [SCREENS.FAVORITES]: Favorites,
  [SCREENS.ORDERS]: Orders,
  [SCREENS.MY_ACCOUNT]: MyAccount,
};

const getIconConfig = (routeName: string) => {
  switch (routeName) {
    case SCREENS.HOME:
      return { iconName: 'home', componentName: VARIABLES.Entypo };
    case SCREENS.FAVORITES:
      return { iconName: 'heart', componentName: VARIABLES.Feather };
    case SCREENS.ORDERS:
      return {
        iconName: 'book-outline',
        componentName: VARIABLES.Ionicons,
      };
    case SCREENS.MY_ACCOUNT:
      return { iconName: 'person-outline', componentName: VARIABLES.Ionicons };
    default:
      return { iconName: 'calendar-alt', componentName: VARIABLES.FontAwesome5 };
  }
};

export const BottomNavigator = () => {
  const insets = useSafeAreaInsets();
  const { isLangRTL } = useTranslation();
  const Bottom = createBottomTabNavigator();

  const renderedPages = isLangRTL ? Object.entries(screens).reverse() : Object.entries(screens);

  return (
    <Bottom.Navigator
      screenOptions={({ route }) => {
        const { iconName, componentName } = getIconConfig(route.name);
        return {
          headerShown: false,
          tabBarStyle: {
            backgroundColor: COLORS.PRIMARY,
            height: screenHeight(isIOS() ? 10 : 8.5) + insets.bottom,
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
            paddingTop: 5,
          },
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <Icon
                iconName={iconName}
                componentName={componentName}
                size={FontSize.Large}
                color={focused ? COLORS.WHITE : COLORS.BORDER}
              />
            </View>
          ),
          tabBarLabel: ({ focused }) =>
            focused && (
              <>
                <Typography style={styles.label}>
                  {route.name === SCREENS.MY_ACCOUNT ? 'My Account' : route.name}
                </Typography>
                <View
                  style={[
                    styles.indicator,
                    { backgroundColor: focused ? COLORS.WHITE : COLORS.TRANSPARENT },
                  ]}
                />
              </>
            ),
          tabBarHideOnKeyboard: true,
        };
      }}
    >
      {renderedPages.map(([screenName, component]) => (
        <Bottom.Screen key={screenName} name={screenName} component={component} />
      ))}
    </Bottom.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
  },
  indicator: {
    height: 4,
    width: 15,
    marginTop: 5,
    borderRadius: 10,
  },
  label: {
    color: COLORS.WHITE,
    fontSize: FontSize.ExtraSmall,
    fontWeight: FontWeight.SemiBold,
  },
});
