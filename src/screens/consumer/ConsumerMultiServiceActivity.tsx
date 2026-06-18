import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import type { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Image, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import {
  AppGradient,
  GRADIENT_END,
  GRADIENT_START,
  Icon,
  Typography,
  Wrapper,
} from 'components/index';
import { IMAGES } from 'constants/assets';
import { SkeletonWrapper } from 'components/common';
import { VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import { APP_GRADIENT_HORIZONTAL, COLORS, screenWidth } from 'utils/index';
import { ENV_CONSTANTS } from 'constants/common';
import { getAlphaConsumerBookings } from 'constants/consumerBookingMock';
import { getAlphaSessionBookings } from 'constants/alphaBookingMocks';
import { extractBookingsList, listBookings } from 'api/functions/snlift/bookings';
import {
  isActiveBookingStatus,
  mapBookingToActivityItem,
  type ConsumerActivityItem,
} from 'api/mappers/snliftBooking';
import { pushRootScreen } from 'navigation/Navigators';
import { SCREENS } from 'constants/routes';

type ServiceCat = 'All' | 'Rides' | 'Food' | 'Parcel';

type ActivityItem = ConsumerActivityItem;

const CAT_FILTER: Record<ServiceCat, ((s: ActivityItem) => boolean) | null> = {
  All: null,
  Rides: s => s.serviceLabel === 'Ride',
  Food: s => s.serviceLabel === 'Food',
  Parcel: s => s.serviceLabel === 'Parcel',
};

const ICON_FOR: Record<ActivityItem['serviceLabel'], string> = {
  Ride: 'car-sport-outline',
  Food: 'restaurant-outline',
  Parcel: 'cube-outline',
};

const formatDateTimeLine = (raw: string) => {
  const d = new Date(raw);
  const datePart = d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const timePart = d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  return `${datePart} at ${timePart}`;
};

function ActivityPillTabBar({ state, navigation }: MaterialTopTabBarProps) {
  return (
    <View style={styles.pillWrap}>
      <View style={styles.pillTrack}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const label = route.name;
          return (
            <Pressable
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              style={styles.pillHalf}
            >
              {focused ? (
                <AppGradient
                  colors={[...APP_GRADIENT_HORIZONTAL]}
                  start={GRADIENT_START}
                  end={GRADIENT_END}
                  fill
                  style={styles.pillGradient}
                  pointerEvents='none'
                />
              ) : null}
              <Typography
                translate={false}
                style={[focused ? styles.pillTxtOn : styles.pillTxtOff, styles.pillLabel]}
              >
                {label}
              </Typography>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const activitySkeletonItem = () => (
  <View style={styles.skCard}>
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
      <SkeletonPlaceholder.Item width={44} height={44} borderRadius={12} />
      <View style={{ flex: 1 }}>
        <SkeletonPlaceholder.Item
          width={screenWidth(70)}
          height={16}
          borderRadius={6}
          marginBottom={10}
        />
        <SkeletonPlaceholder.Item
          width={screenWidth(54)}
          height={12}
          borderRadius={6}
          marginBottom={14}
        />
        <SkeletonPlaceholder.Item
          width={screenWidth(36)}
          height={12}
          borderRadius={6}
          marginBottom={16}
        />
        <SkeletonPlaceholder.Item width='100%' height={1} borderRadius={2} marginBottom={12} />
        <SkeletonPlaceholder.Item width='34%' height={12} borderRadius={6} marginBottom={8} />
        <SkeletonPlaceholder.Item
          width={screenWidth(70)}
          height={12}
          borderRadius={6}
          marginBottom={14}
        />
        <SkeletonPlaceholder.Item
          width={screenWidth(32)}
          height={12}
          borderRadius={6}
          marginBottom={8}
        />
        <SkeletonPlaceholder.Item width={screenWidth(70)} height={12} borderRadius={6} />
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <SkeletonPlaceholder.Item width={56} height={16} borderRadius={6} marginBottom={12} />
        <SkeletonPlaceholder.Item width={64} height={14} borderRadius={6} />
      </View>
    </View>
  </View>
);

const CategoryTabs = ({
  value,
  onChange,
}: {
  value: ServiceCat;
  onChange: (c: ServiceCat) => void;
}) => (
  <View style={styles.catTabsRow}>
    {(['All', 'Rides', 'Food', 'Parcel'] as ServiceCat[]).map(c => {
      const sel = value === c;
      return (
        <Pressable key={c} style={styles.catTab} onPress={() => onChange(c)}>
          <Typography
            translate={false}
            style={[styles.catTabLbl, sel ? styles.catTabLblOn : styles.catTabLblOff]}
          >
            {c}
          </Typography>
          {sel ? <View style={styles.catUnderline} /> : <View style={styles.catUnderlineSpacer} />}
        </Pressable>
      );
    })}
  </View>
);

const ActivityCard = ({ item, onPress }: { item: ActivityItem; onPress?: () => void }) => (
  <Pressable style={styles.card} onPress={onPress}>
    <AppGradient variant='primary' style={styles.typeIcon}>
      {item.serviceLabel === 'Parcel' ? (
        <Image source={IMAGES.PARCEL_BOX} style={styles.parcelIconImg} resizeMode='contain' />
      ) : (
        <Icon
          componentName={VARIABLES.Ionicons}
          iconName={ICON_FOR[item.serviceLabel]}
          size={22}
          color={COLORS.WHITE}
        />
      )}
    </AppGradient>

    <View style={styles.cardMid}>
      <Typography style={styles.cardService}>{item.serviceLabel}</Typography>
      <Typography style={styles.cardDate}>{formatDateTimeLine(item.isoDate)}</Typography>
      <View style={styles.divider} />
      <View style={styles.routeRow}>
        <View style={styles.rail}>
          <View style={styles.originDot} />
          <View style={styles.vline} />
          <Icon
            componentName={VARIABLES.MaterialCommunityIcons}
            iconName='map-marker'
            size={14}
            color={COLORS.APP_SECONDARY}
          />
        </View>
        <View style={styles.routeTxt}>
          <Typography style={styles.placeTitle}>{item.pickupTitle}</Typography>
          <Typography style={styles.placeAddr}>{item.pickupAddr}</Typography>
          <Typography style={[styles.placeTitle, styles.placeTitle2]}>{item.dropTitle}</Typography>
          <Typography style={styles.placeAddr}>{item.dropAddr}</Typography>
        </View>
      </View>
    </View>

    <View style={styles.cardRight}>
      <Typography style={styles.price}>{item.price}</Typography>
      <Typography style={styles.status}>{item.status}</Typography>
    </View>
  </Pressable>
);

function ActivityPane({
  source,
  loading,
  emptyMessage,
  onRefresh,
  refreshing = false,
}: {
  source: ActivityItem[];
  loading: boolean;
  emptyMessage: string;
  onRefresh?: () => void;
  refreshing?: boolean;
}) {
  const [cat, setCat] = useState<ServiceCat>('All');

  const filtered = useMemo(() => {
    const fn = CAT_FILTER[cat];
    return fn ? source.filter(fn) : source;
  }, [cat, source]);

  return (
    <View style={styles.pane}>
      <CategoryTabs value={cat} onChange={setCat} />

      <SkeletonWrapper
        isLoading={loading && !refreshing}
        count={4}
        renderItem={activitySkeletonItem}
      >
        {filtered.length === 0 && !loading ? (
          <ScrollView
            contentContainerStyle={styles.emptyScroll}
            refreshControl={
              onRefresh ? (
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              ) : undefined
            }
          >
            <View style={styles.emptyWrap}>
              <Icon
                componentName={VARIABLES.Feather}
                iconName='inbox'
                size={40}
                color={COLORS.APP_TEXT_MUTED}
              />
              <Typography style={styles.emptyText}>{emptyMessage}</Typography>
            </View>
          </ScrollView>
        ) : (
          <ScrollView
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={
              onRefresh ? (
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              ) : undefined
            }
          >
            {filtered.map(it => (
              <ActivityCard
                key={it.id}
                item={it}
                onPress={() => {
                  const id = Number(it.id);
                  if (!Number.isNaN(id)) {
                    pushRootScreen(SCREENS.CONSUMER_BOOKING_DETAIL, { bookingId: id });
                  }
                }}
              />
            ))}
          </ScrollView>
        )}
      </SkeletonWrapper>
    </View>
  );
}

function ActivePane() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadItems = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      if (ENV_CONSTANTS.IS_ALPHA_PHASE) {
        const all = [...getAlphaSessionBookings(), ...getAlphaConsumerBookings()];
        const active = all.filter(b => isActiveBookingStatus(b.status));
        setItems(active.map(mapBookingToActivityItem));
        return;
      }
      const res = await listBookings(undefined, 'user', { showLoader: false });
      const active = extractBookingsList(res).filter(b => isActiveBookingStatus(b.status));
      setItems(active.map(mapBookingToActivityItem));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadItems(false);
    }, [loadItems]),
  );

  return (
    <ActivityPane
      source={items}
      loading={loading}
      refreshing={refreshing}
      onRefresh={() => loadItems(true)}
      emptyMessage='No active bookings yet.'
    />
  );
}

function HistoryPane() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadItems = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      if (ENV_CONSTANTS.IS_ALPHA_PHASE) {
        const all = [...getAlphaSessionBookings(), ...getAlphaConsumerBookings()];
        const history = all.filter(b => !isActiveBookingStatus(b.status));
        setItems(history.map(mapBookingToActivityItem));
        return;
      }
      const res = await listBookings(undefined, 'user', { showLoader: false });
      const history = extractBookingsList(res).filter(b => !isActiveBookingStatus(b.status));
      setItems(history.map(mapBookingToActivityItem));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadItems(false);
    }, [loadItems]),
  );

  return (
    <ActivityPane
      source={items}
      loading={loading}
      refreshing={refreshing}
      onRefresh={() => loadItems(true)}
      emptyMessage='No booking history yet.'
    />
  );
}

const Tab = createMaterialTopTabNavigator();

const ActivityNavigator = () => (
  <Tab.Navigator
    tabBar={(p: MaterialTopTabBarProps) => <ActivityPillTabBar {...p} />}
    screenOptions={{
      lazy: true,
      swipeEnabled: true,
      sceneStyle: { backgroundColor: COLORS.WHITE },
      tabBarStyle: { height: 0, overflow: 'hidden' },
    }}
    initialLayout={{ width: screenWidth(100) }}
  >
    <Tab.Screen name='Active' component={ActivePane} options={{ title: 'Active' }} />
    <Tab.Screen name='History' component={HistoryPane} options={{ title: 'History' }} />
  </Tab.Navigator>
);

export const ConsumerMultiServiceActivity = () => (
  <Wrapper
    headerTitle='Activity'
    showBackButton={false}
    safeAreaEdges={['top', 'bottom']}
    wantPaddingBottom={false}
    backgroundColor={COLORS.WHITE}
    darkMode={false}
  >
    <ActivityNavigator />
  </Wrapper>
);

const styles = StyleSheet.create({
  pillWrap: {
    width: '70%',
    alignSelf: 'center',
    paddingBottom: 8,
    paddingTop: 4,
  },
  pillTrack: {
    flexDirection: 'row',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.APP_LINE,
    padding: 4,
    backgroundColor: COLORS.WHITE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  pillHalf: {
    flex: 1,
    borderRadius: 999,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 44,
    position: 'relative',
  },
  pillGradient: {
    ...StyleSheet.absoluteFill,
    borderRadius: 999,
  },
  pillLabel: {
    zIndex: 1,
  },
  pillTxtOn: {
    fontWeight: FontWeight.Bold,
    fontSize: FontSize.MediumSmall,
    color: COLORS.WHITE,
    paddingVertical: 10,
    zIndex: 1,
  },
  pillTxtOff: {
    fontWeight: FontWeight.SemiBold,
    fontSize: FontSize.MediumSmall,
    color: COLORS.APP_TEXT_MUTED,
    textAlign: 'center',
    paddingVertical: 10,
    zIndex: 1,
  },
  pane: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  catTabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: screenWidth(4),
    paddingTop: 10,
    paddingBottom: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.APP_LINE,
    backgroundColor: COLORS.WHITE,
  },
  catTab: {
    alignItems: 'center',
    minWidth: screenWidth(18),
  },
  catTabLbl: {
    fontSize: FontSize.Small,
    paddingBottom: 6,
  },
  catTabLblOn: {
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
  },
  catTabLblOff: {
    fontWeight: FontWeight.Medium,
    color: COLORS.APP_TEXT_MUTED,
  },
  catUnderline: {
    width: 26,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.APP_PRIMARY,
  },
  catUnderlineSpacer: { height: 3 },
  list: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 110,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 48,
    paddingBottom: 110,
    gap: 12,
  },
  emptyScroll: {
    flexGrow: 1,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.APP_TEXT_MUTED,
    fontSize: FontSize.Medium,
  },
  skCard: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    marginHorizontal: 20,
    borderColor: COLORS.APP_LINE,
    backgroundColor: COLORS.WHITE,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    gap: 12,
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.APP_LINE,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  typeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  parcelIconImg: {
    width: 26,
    height: 26,
    tintColor: COLORS.WHITE,
  },
  cardMid: {
    flex: 1,
    minWidth: 0,
  },
  cardService: {
    fontWeight: FontWeight.Bold,
    fontSize: FontSize.Medium,
    color: COLORS.APP_TEXT,
  },
  cardDate: {
    fontSize: FontSize.ExtraSmall,
    color: COLORS.APP_TEXT_MUTED,
    marginTop: 4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.APP_LINE,
    marginVertical: 12,
  },
  routeRow: { flexDirection: 'row', gap: 12 },
  rail: { alignItems: 'center', width: 16, paddingTop: 2 },
  originDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: COLORS.APP_PRIMARY,
    backgroundColor: COLORS.WHITE,
  },
  vline: {
    width: 2,
    height: 26,
    backgroundColor: COLORS.APP_LINE,
    marginVertical: 2,
  },
  routeTxt: { flex: 1 },
  placeTitle: {
    fontWeight: FontWeight.Bold,
    fontSize: FontSize.Small,
    color: COLORS.APP_TEXT,
  },
  placeTitle2: { marginTop: 12 },
  placeAddr: { fontSize: FontSize.Small, color: COLORS.APP_TEXT_MUTED, marginTop: 4 },
  cardRight: { alignItems: 'flex-end' },
  price: {
    fontWeight: FontWeight.Bold,
    fontSize: FontSize.Medium,
    color: COLORS.APP_TEXT,
  },
  status: {
    marginTop: 8,
    fontWeight: FontWeight.SemiBold,
    fontSize: FontSize.Small,
    color: COLORS.APP_PRIMARY,
  },
});
