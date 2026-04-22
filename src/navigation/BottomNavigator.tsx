import { useMemo, useCallback } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SCREENS, VARIABLES } from 'constants/index';
import { COLORS } from 'utils/colors';
import { Icon, Typography } from 'components/common';
import type { IconComponentProps } from 'components/common/Icon';
import { FontSize, FontWeight } from 'types/fontTypes';
import { screenHeight } from 'utils/index';
import { Home, MyAccount, Activities, ChatFirebase } from 'screens/user';
import { useTranslation } from 'hooks/useTranslation';
import { MyJobs } from 'screens/user/MyJobs';
import { useAppSelector } from 'types/reduxTypes';
import { APP_CONFIG } from 'config/app';
import { useConversations } from 'hooks/useConversations';

// Create navigator outside component to avoid recreation on each render
const Tab = createBottomTabNavigator();

// Screen configuration with type safety
type ScreenConfig = {
  component: React.ComponentType<any>;
  iconName: string;
  componentName: IconComponentProps['componentName'];
  label: string;
};

// Function to get screen config based on role
const getScreenConfig = (role: string): Record<string, ScreenConfig> => ({
  [SCREENS.HOME]: {
    component: Home,
    iconName: 'home',
    componentName: VARIABLES.Feather,
    label: SCREENS.HOME,
  },
  ...(role === APP_CONFIG.PROVIDER_ROLE
    ? {
        [SCREENS.MY_JOBS]: {
          component: MyJobs,
          iconName: 'briefcase',
          componentName: VARIABLES.Feather,
          label: SCREENS.MY_JOBS,
        },
      }
    : {}),
  ...(role === APP_CONFIG.USER_ROLE
    ? {
        [SCREENS.ACTIVITIES]: {
          component: Activities,
          iconName: 'newspaper-outline',
          componentName: VARIABLES.Ionicons,
          label: SCREENS.ACTIVITIES,
        },
      }
    : {}),
  [SCREENS.CHAT_FIREBASE]: {
    component: ChatFirebase,
    iconName: 'chatbubble-ellipses-outline',
    componentName: VARIABLES.Ionicons,
    label: SCREENS.CHAT,
  },
  [SCREENS.MY_ACCOUNT]: {
    component: MyAccount,
    iconName: 'user-o',
    componentName: VARIABLES.FontAwesome,
    label: SCREENS.PROFILE,
  },
});

// Screen order - can be easily reordered
export const BottomNavigator = () => {
  const insets = useSafeAreaInsets();
  const { isLangRTL } = useTranslation();
  const role = useAppSelector(state => state?.user?.role);
  const { totalUnreadCount } = useConversations();

  // Memoize screen config based on role
  const screenConfig = useMemo(() => getScreenConfig(role), [role]);

  const screenOrder = useMemo(() => {
    if (role === APP_CONFIG.PROVIDER_ROLE) {
      return [SCREENS.HOME, SCREENS.MY_JOBS, SCREENS.CHAT_FIREBASE, SCREENS.MY_ACCOUNT];
    } else {
      return [SCREENS.HOME, SCREENS.ACTIVITIES, SCREENS.CHAT_FIREBASE, SCREENS.MY_ACCOUNT];
    }
  }, [role]);

  // Memoize screen order based on RTL
  const orderedScreens = useMemo(() => {
    return isLangRTL ? [...screenOrder].reverse() : screenOrder;
  }, [isLangRTL, screenOrder]);

  // Memoize tab bar style to avoid recreation
  const tabBarStyle = useMemo(
    () => ({
      backgroundColor: COLORS.BOTTOM_NAVIGATION_BAR,
      height: screenHeight(7),
      marginBottom: insets.bottom + 5,
      borderRadius: 50,
      marginHorizontal: 20,
      paddingTop: 5,
      paddingBottom: 0,
    }),
    [insets.bottom],
  );

  // Memoize screen options
  const screenOptions = useCallback(
    ({ route }: { route: { name: string } }): BottomTabNavigationOptions => {
      const config = screenConfig[route.name];

      if (!config) {
        return { headerShown: false };
      }

      return {
        headerShown: false,
        tabBarStyle,
        tabBarIcon: ({ focused }) => (
          <View style={styles.iconContainer}>
            <Icon
              iconName={config.iconName}
              componentName={config.componentName}
              size={FontSize.ExtraLarge}
              color={focused ? COLORS.WHITE : COLORS.BORDER}
            />
            {route.name === SCREENS.CHAT_FIREBASE && totalUnreadCount > 0 && (
              <View style={styles.chatBadge} />
            )}
          </View>
        ),
        tabBarLabel: ({ focused }) =>
          focused ? (
            <View style={styles.labelContainer}>
              <Typography style={styles.label}>{config.label}</Typography>
              <View style={[styles.indicator, { backgroundColor: COLORS.WHITE }]} />
            </View>
          ) : null,
        tabBarHideOnKeyboard: true,
      };
    },
    [tabBarStyle, screenConfig, totalUnreadCount],
  );

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      {orderedScreens.map((screenName: string) => {
        const config = screenConfig[screenName];
        if (!config) return null;

        return <Tab.Screen key={screenName} name={screenName} component={config.component} />;
      })}
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#FB344F',
    borderWidth: 1.5,
    borderColor: COLORS.BOTTOM_NAVIGATION_BAR,
  },
  labelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  indicator: {
    height: 3,
    width: 15,
    marginTop: 6,
    borderRadius: 10,
    alignSelf: 'center',
  },
  label: {
    color: COLORS.WHITE,
    fontSize: FontSize.ExtraSmall,
    fontWeight: FontWeight.Bold,
  },
});
