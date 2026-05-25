import { useMemo, useCallback } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SCREENS, VARIABLES } from 'constants/index';
import { COLORS } from 'utils/colors';
import { Icon, Typography } from 'components/common';
import type { IconComponentProps } from 'components/common/Icon';
import { FontSize, FontWeight } from 'types/fontTypes';
import { screenHeight } from 'utils/index';
import {
  Home,
  MyAccount,
  ConsumerMultiServiceActivity,
  WorkerWalletScreen,
  WorkerHomeScreen,
  WorkerRideHistoryScreen,
  WorkerEarningsScreen,
} from 'screens/user';
import { useTranslation } from 'hooks/useTranslation';
import { useAppSelector } from 'types/reduxTypes';
import { APP_CONFIG, isWorkerRole } from 'config/app';
import { useConversations } from 'hooks/useConversations';

const Tab = createBottomTabNavigator();

const WORKER_TAB_INACTIVE = '#052653';

/** Worker docked tab bar content height (excluding safe area). */
const WORKER_TAB_BAR_CONTENT_HEIGHT = 64;

type ScreenConfig = {
  component: React.ComponentType<any>;
  iconName: string;
  componentName: IconComponentProps['componentName'];
  label: string;
};

const getScreenConfig = (role: string): Record<string, ScreenConfig> => {
  const isWorker = isWorkerRole(role);
  const isConsumer = role === APP_CONFIG.USER_ROLE;

  return {
    [SCREENS.HOME]: {
      component: isConsumer ? Home : WorkerHomeScreen,
      iconName: 'home',
      componentName: VARIABLES.Feather,
      label: 'Home',
    },
    ...(isWorker
      ? {
          [SCREENS.WORKER_RIDE_HISTORY]: {
            component: WorkerRideHistoryScreen,
            iconName: 'history',
            componentName: VARIABLES.MaterialIcons,
            label: 'History',
          },
          [SCREENS.WORKER_EARNINGS]: {
            component: WorkerEarningsScreen,
            iconName: 'cash-multiple',
            componentName: VARIABLES.MaterialCommunityIcons,
            label: 'Earning',
          },
          [SCREENS.WALLET]: {
            component: WorkerWalletScreen,
            iconName: 'wallet-outline',
            componentName: VARIABLES.Ionicons,
            label: 'Wallet',
          },
        }
      : {}),
    ...(isConsumer
      ? {
          [SCREENS.ACTIVITIES]: {
            component: ConsumerMultiServiceActivity,
            iconName: 'briefcase',
            componentName: VARIABLES.Feather,
            label: 'Activity',
          },
        }
      : {}),
    [SCREENS.MY_ACCOUNT]: {
      component: MyAccount,
      iconName: 'user-o',
      componentName: VARIABLES.FontAwesome,
      label: 'Profile',
    },
  };
};

export const BottomNavigator = () => {
  const insets = useSafeAreaInsets();
  const { isLangRTL } = useTranslation();
  const role = useAppSelector(state => state?.user?.role);
  const isWorker = isWorkerRole(role);
  const { totalUnreadCount } = useConversations();

  const screenConfig = useMemo(() => getScreenConfig(role), [role]);

  const screenOrder = useMemo(() => {
    if (isWorker) {
      return [
        SCREENS.HOME,
        SCREENS.WORKER_RIDE_HISTORY,
        SCREENS.WORKER_EARNINGS,
        SCREENS.WALLET,
        SCREENS.MY_ACCOUNT,
      ];
    }
    return [SCREENS.HOME, SCREENS.ACTIVITIES, SCREENS.MY_ACCOUNT];
  }, [isWorker]);

  const orderedScreens = useMemo(() => {
    return isLangRTL ? [...screenOrder].reverse() : screenOrder;
  }, [isLangRTL, screenOrder]);

  const workerTabBarStyle = useMemo(
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
      marginHorizontal: 20,
      paddingTop: 5,
      paddingBottom: 0,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.16,
      shadowRadius: 12,
    }),
    [insets.bottom],
  );

  const consumerTabBarStyle = useMemo(
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

  const tabBarStyle = isWorker ? workerTabBarStyle : consumerTabBarStyle;

  const screenOptions = useCallback(
    ({ route }: { route: { name: string } }): BottomTabNavigationOptions => {
      const config = screenConfig[route.name];

      if (!config) {
        return { headerShown: false };
      }

      const inactiveColor = isWorker ? WORKER_TAB_INACTIVE : WORKER_TAB_INACTIVE;
      const activeColor = COLORS.WHITE;
      const iconSize = isWorker ? 26 : FontSize.ExtraLarge;

      return {
        headerShown: false,
        animation: 'fade',
        tabBarStyle,
        sceneStyle: isWorker
          ? {
              backgroundColor: COLORS.BACKGROUND,
              paddingBottom: WORKER_TAB_BAR_CONTENT_HEIGHT,
            }
          : undefined,
        tabBarItemStyle: isWorker ? styles.workerTabItem : undefined,
        tabBarIcon: ({ focused }) => (
          <View style={styles.iconContainer}>
            <Icon
              iconName={config.iconName}
              componentName={config.componentName}
              size={iconSize}
              color={focused ? activeColor : inactiveColor}
            />
            {route.name === SCREENS.CHAT_FIREBASE && totalUnreadCount > 0 && (
              <View style={styles.chatBadge} />
            )}
          </View>
        ),
        tabBarLabel: ({ focused }) => {
          if (!isWorker) {
            return focused ? (
              <View style={styles.labelContainer}>
                <Typography style={styles.label}>{config.label}</Typography>
                <View style={[styles.indicator, { backgroundColor: COLORS.WHITE }]} />
              </View>
            ) : null;
          }
          return focused ? (
            <Typography style={styles.workerActiveLabel}>{config.label}</Typography>
          ) : null;
        },
        tabBarHideOnKeyboard: true,
      };
    },
    [tabBarStyle, screenConfig, totalUnreadCount, isWorker],
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
  workerTabItem: {
    paddingTop: 2,
  },
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
  workerActiveLabel: {
    color: COLORS.WHITE,
    fontSize: FontSize.ExtraSmall,
    fontWeight: FontWeight.SemiBold,
    marginTop: 4,
    marginBottom: 0,
  },
});
