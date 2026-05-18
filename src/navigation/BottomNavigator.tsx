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
import { screenHeight, screenWidth } from 'utils/index';
import {
  Home,
  MyAccount,
  ConsumerMultiServiceActivity,
  WorkerWalletScreen,
  WorkerHomeScreen,
} from 'screens/user';
import { useTranslation } from 'hooks/useTranslation';
import { MyJobs } from 'screens/user/MyJobs';
import { useAppSelector } from 'types/reduxTypes';
import { APP_CONFIG, isWorkerRole } from 'config/app';
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
const getScreenConfig = (role: string): Record<string, ScreenConfig> => {
  const isWorker = isWorkerRole(role);
  const isConsumer = role === APP_CONFIG.USER_ROLE;

  return {
    [SCREENS.HOME]: {
      component: isConsumer ? Home : WorkerHomeScreen,
      iconName: 'home',
      componentName: VARIABLES.Feather,
      label: SCREENS.HOME,
    },
    // Worker-only tabs
    ...(isWorker ? {
      [SCREENS.ACTIVITIES]: {
        component: ConsumerMultiServiceActivity,
        iconName: 'clock',
        componentName: VARIABLES.Feather,
        label: 'History',
      },
      [SCREENS.MY_JOBS]: {
        component: MyJobs,
        iconName: 'dollar-sign',
        componentName: VARIABLES.Feather,
        label: 'Earnings',
      },
      [SCREENS.WALLET]: {
        component: WorkerWalletScreen,
        iconName: 'credit-card',
        componentName: VARIABLES.Feather,
        label: 'Wallet',
      },
    } : {}),
    // Consumer-only tabs
    ...(isConsumer ? {
      [SCREENS.ACTIVITIES]: {
        component: ConsumerMultiServiceActivity,
        iconName: 'briefcase',
        componentName: VARIABLES.Feather,
        label: 'Activity',
      },
    } : {}),
    [SCREENS.MY_ACCOUNT]: {
      component: MyAccount,
      iconName: 'user-o',
      componentName: VARIABLES.FontAwesome,
      label: SCREENS.PROFILE,
    },
  };
};

// Screen order - can be easily reordered
export const BottomNavigator = () => {
  const insets = useSafeAreaInsets();
  const { isLangRTL } = useTranslation();
  const role = useAppSelector(state => state?.user?.role);
  const { totalUnreadCount } = useConversations();

  // Memoize screen config based on role
  const screenConfig = useMemo(() => getScreenConfig(role), [role]);

  const screenOrder = useMemo(() => {
    if (isWorkerRole(role)) {
      // Worker: Home, History, Earnings, Wallet, Profile (5 tabs)
      return [SCREENS.HOME, SCREENS.ACTIVITIES, SCREENS.MY_JOBS, SCREENS.WALLET, SCREENS.MY_ACCOUNT];
    } else {
      // Consumer: Home, History, Profile (3 tabs)
      return [SCREENS.HOME, SCREENS.ACTIVITIES, SCREENS.MY_ACCOUNT];
    }
  }, [role]);

  // Memoize screen order based on RTL
  const orderedScreens = useMemo(() => {
    return isLangRTL ? [...screenOrder].reverse() : screenOrder;
  }, [isLangRTL, screenOrder]);

  // Memoize tab bar style to avoid recreation
  const tabBarStyle = useMemo(
    () => ({
      backgroundColor: COLORS.SECONDARY,
      borderTopWidth: 0,
      elevation: 0,
      position: 'absolute' as const,
      bottom: 15 + insets.bottom,
      left: 0,
      right: 0,
      height: screenHeight(7),
      borderRadius: 50,
      marginHorizontal: 60,
      paddingTop: 5,
      paddingBottom: 0,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.16,
      shadowRadius: 12,
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
              color={focused ? COLORS.WHITE : COLORS.TRANSPARENT}
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
    borderColor: 'rgba(255,255,255,0.35)',
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
