import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import type { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { StyleSheet, View, Pressable, ScrollView } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import { Icon, Typography, Wrapper } from 'components/index';
import { SkeletonWrapper } from 'components/common';
import { VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS, APP_GRADIENT_PRIMARY, screenWidth, STYLES, APP_GRADIENT_PRIMARY_LIGHT } from 'utils/index';

// ─── Mock model (bookings removed — static demo cards) ───────────────────────

type ServiceCat = 'All' | 'Rides' | 'Food' | 'Parcel';

type MockActivityItem = {
  id: string;
  serviceLabel: 'Ride' | 'Food' | 'Parcel';
  isoDate: string;
  price: string;
  status: string;
  pickupTitle: string;
  pickupAddr: string;
  dropTitle: string;
  dropAddr: string;
};

const ADDR = {
  home: '67 Murray Street, NY',
  park: '85 W Broadway, NY',
  cafe: '200 Varick Street, NY',
};

const MOCK_ACTIVE_BASE: Omit<MockActivityItem, 'id' | 'isoDate' | 'status'>[] = [
  {
    serviceLabel: 'Ride',
    price: '610',
    pickupTitle: 'Home',
    pickupAddr: ADDR.home,
    dropTitle: 'Little Park',
    dropAddr: ADDR.park,
  },
  {
    serviceLabel: 'Ride',
    price: '585',
    pickupTitle: 'Home',
    pickupAddr: ADDR.home,
    dropTitle: 'Downtown Hub',
    dropAddr: ADDR.cafe,
  },
  {
    serviceLabel: 'Ride',
    price: '642',
    pickupTitle: 'Midtown West',
    pickupAddr: ADDR.cafe,
    dropTitle: 'Little Park',
    dropAddr: ADDR.park,
  },
  {
    serviceLabel: 'Food',
    price: '980',
    pickupTitle: 'Kitchen A',
    pickupAddr: ADDR.home,
    dropTitle: 'You',
    dropAddr: ADDR.park,
  },
  {
    serviceLabel: 'Food',
    price: '720',
    pickupTitle: 'Kitchen B',
    pickupAddr: ADDR.cafe,
    dropTitle: 'You',
    dropAddr: ADDR.home,
  },
  {
    serviceLabel: 'Food',
    price: '810',
    pickupTitle: 'Sushi Spot',
    pickupAddr: ADDR.park,
    dropTitle: 'You',
    dropAddr: ADDR.home,
  },
  {
    serviceLabel: 'Parcel',
    price: '450',
    pickupTitle: 'Sender',
    pickupAddr: ADDR.home,
    dropTitle: 'Receiver',
    dropAddr: ADDR.park,
  },
  {
    serviceLabel: 'Parcel',
    price: '520',
    pickupTitle: 'Sender',
    pickupAddr: ADDR.cafe,
    dropTitle: 'Receiver',
    dropAddr: ADDR.home,
  },
  {
    serviceLabel: 'Parcel',
    price: '390',
    pickupTitle: 'Sender',
    pickupAddr: ADDR.park,
    dropTitle: 'Receiver',
    dropAddr: ADDR.cafe,
  },
  // fourth group of three (Ride / Food / Parcel again)
  {
    serviceLabel: 'Ride',
    price: '600',
    pickupTitle: 'Uptown',
    pickupAddr: ADDR.park,
    dropTitle: 'Soho',
    dropAddr: ADDR.home,
  },
  {
    serviceLabel: 'Food',
    price: '695',
    pickupTitle: 'Burger Lab',
    pickupAddr: ADDR.home,
    dropTitle: 'You',
    dropAddr: ADDR.cafe,
  },
  {
    serviceLabel: 'Parcel',
    price: '478',
    pickupTitle: 'Sender',
    pickupAddr: ADDR.home,
    dropTitle: 'Receiver',
    dropAddr: ADDR.park,
  },
];

const MOCK_HISTORY_BASE: Omit<MockActivityItem, 'id' | 'isoDate' | 'status'>[] =
  MOCK_ACTIVE_BASE.map((row, i) => ({
    ...row,
    price: String(Number(row.price) + 40 + i),
  }));

const buildMockList = (
  seed: Omit<MockActivityItem, 'id' | 'isoDate' | 'status'>[],
  dates: string[],
  statuses: string[],
): MockActivityItem[] =>
  seed.map((row, i) => ({
    ...row,
    id: `mock-${dates[0]?.slice(0, 10)}-${i}`,
    isoDate: dates[i % dates.length] ?? dates[0],
    status: statuses[i % statuses.length] ?? statuses[0],
  }));

const MOCK_ACTIVE = buildMockList(
  MOCK_ACTIVE_BASE,
  [
    '2026-04-09T20:09:00',
    '2026-04-10T09:22:00',
    '2026-04-10T11:08:00',
    '2026-04-10T13:41:00',
    '2026-04-11T07:55:00',
    '2026-04-11T16:02:00',
    '2026-04-12T10:12:00',
    '2026-04-12T14:30:00',
    '2026-04-13T09:09:00',
    '2026-04-13T18:20:00',
    '2026-04-14T12:00:00',
    '2026-04-14T15:45:00',
  ],
  ['Arriving', 'In Progress', 'Prepared', 'Picked Up', 'On The Way'],
);

const MOCK_HISTORY = buildMockList(
  MOCK_HISTORY_BASE,
  [
    '2026-02-03T08:41:00',
    '2026-02-07T21:06:00',
    '2026-02-09T09:52:00',
    '2026-02-14T17:09:00',
    '2026-02-21T06:58:00',
    '2026-03-03T21:51:00',
    '2026-03-06T06:54:00',
    '2026-03-06T07:53:00',
    '2026-03-06T07:53:00',
    '2026-03-06T07:53:00',
    '2026-03-06T07:53:00',
    '2026-03-06T07:53:00',
  ],
  ['Delivered', 'Completed', 'Completed', 'Cancelled'],
);

const CAT_FILTER: Record<ServiceCat, ((s: MockActivityItem) => boolean) | null> = {
  All: null,
  Rides: s => s.serviceLabel === 'Ride',
  Food: s => s.serviceLabel === 'Food',
  Parcel: s => s.serviceLabel === 'Parcel',
};

const ICON_FOR: Record<MockActivityItem['serviceLabel'], string> = {
  Ride: 'car-sport-outline',
  Food: 'restaurant-outline',
  Parcel: 'cube-outline',
};

// ─── Formatting ───────────────────────────────────────────────────────────────

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

// ─── Top pill tab bar (Active / History) ─────────────────────────────────────

function ActivityPillTabBar({ state, navigation }: MaterialTopTabBarProps) {
  return (
    <View style={styles.pillWrap}>
      <View style={styles.pillTrack}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const label = route.name;
          const onPress = () => {
            navigation.navigate(route.name);
          };
          return (
            <Pressable key={route.key} onPress={onPress} style={styles.pillHalf}>
              {focused ? (
                <LinearGradient
                  colors={[...APP_GRADIENT_PRIMARY_LIGHT]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.pillGradient}
                >
                  <Typography translate={false} style={styles.pillTxtOn}>
                    {label}
                  </Typography>
                </LinearGradient>
              ) : (
                <Typography translate={false} style={styles.pillTxtOff}>
                  {label}
                </Typography>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ─── Skeleton (activity card silhouette) ───────────────────────────────────────

const activitySkeletonItem = () => (
  <View style={styles.skCard}>
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
      <SkeletonPlaceholder.Item width={44} height={44} borderRadius={12} />
      <View style={{ flex: 1 }}>
        <SkeletonPlaceholder.Item
          width={screenWidth(76)}
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
          width={screenWidth(88)}
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
        <SkeletonPlaceholder.Item width={screenWidth(86)} height={12} borderRadius={6} />
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <SkeletonPlaceholder.Item width={56} height={16} borderRadius={6} marginBottom={12} />
        <SkeletonPlaceholder.Item width={64} height={14} borderRadius={6} />
      </View>
    </View>
  </View>
);

// ─── Cards & category tabs ─────────────────────────────────────────────────────

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

const ActivityCard = ({ item }: { item: MockActivityItem }) => (
  <View style={styles.card}>
    <LinearGradient colors={[...APP_GRADIENT_PRIMARY]} style={styles.typeIcon}>
      <Icon
        componentName={VARIABLES.Ionicons}
        iconName={ICON_FOR[item.serviceLabel]}
        size={22}
        color={COLORS.WHITE}
      />
    </LinearGradient>

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
      <Typography style={styles.price}>{`CFA ${item.price}`}</Typography>
      <Typography style={styles.status}>{item.status}</Typography>
    </View>
  </View>
);

// ─── List pane ─────────────────────────────────────────────────────────────────

function ActivityPane({ source }: { source: MockActivityItem[] }) {
  const [cat, setCat] = useState<ServiceCat>('All');
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      const t = setTimeout(() => setLoading(false), 620);
      return () => clearTimeout(t);
    }, []),
  );

  const filtered = useMemo(() => {
    const fn = CAT_FILTER[cat];
    return fn ? source.filter(fn) : source;
  }, [cat, source]);

  return (
    <View style={styles.pane}>
      <CategoryTabs value={cat} onChange={setCat} />

      <SkeletonWrapper isLoading={loading} count={4} renderItem={activitySkeletonItem}>
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {filtered.map(it => (
            <ActivityCard key={it.id} item={it} />
          ))}
        </ScrollView>
      </SkeletonWrapper>
    </View>
  );
}

function ActivePane() {
  return <ActivityPane source={MOCK_ACTIVE} />;
}

function HistoryPane() {
  return <ActivityPane source={MOCK_HISTORY} />;
}

// ─── Navigator ───────────────────────────────────────────────────────────────

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

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  pillWrap: {
    width: '70%',
    alignSelf: 'center',
    paddingBottom: 4,
  },
  pillTrack: {
    flexDirection: 'row',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.APP_LINE,
    padding: 4,
    backgroundColor: COLORS.WHITE,
  },
  pillHalf: {
    flex: 1,
    borderRadius: 999,
    overflow: 'hidden',
    justifyContent: 'center',
    minHeight: 44,
  },
  pillGradient: {
    minHeight: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  pillTxtOn: {
    fontWeight: FontWeight.Bold,
    fontSize: FontSize.MediumSmall,
    color: COLORS.WHITE,
  },
  pillTxtOff: {
    fontWeight: FontWeight.SemiBold,
    fontSize: FontSize.MediumSmall,
    color: COLORS.APP_TEXT_MUTED,
    textAlign: 'center',
    paddingVertical: 10,
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
    paddingBottom: 32,
  },
  skCard: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
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
