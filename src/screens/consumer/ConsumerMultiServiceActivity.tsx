import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { StyleSheet, View, Pressable, ScrollView } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import LinearGradient from 'react-native-linear-gradient';
import { Icon, Typography, Wrapper } from 'components/index';
import { VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS, APP_GRADIENT_PRIMARY, screenWidth } from 'utils/index';
import { useBookings } from 'hooks/useBookings';
import { Booking } from 'types/responseTypes';
import { InfoBoxSkeleton } from 'components/appComponents/InfoBoxSkeleton';

// ─── Types ────────────────────────────────────────────────────────────────────

type ServiceCat = 'All' | 'Rides' | 'Food' | 'Parcel';

const CAT_KEYWORDS: Record<ServiceCat, string | null> = {
  All: null,
  Rides: 'ride',
  Food: 'food',
  Parcel: 'parcel',
};

const SERVICE_ICON: Record<ServiceCat, string> = {
  All: 'grid-outline',
  Rides: 'car-sport-outline',
  Food: 'restaurant-outline',
  Parcel: 'cube-outline',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const filterByCat = (items: Booking[], cat: ServiceCat): Booking[] => {
  const kw = CAT_KEYWORDS[cat];
  if (!kw) return items;
  return items.filter(b =>
    (b.service_type?.name ?? '').toLowerCase().includes(kw),
  );
};

const guessIcon = (item: Booking): string => {
  const name = (item.service_type?.name ?? '').toLowerCase();
  if (name.includes('ride')) return SERVICE_ICON.Rides;
  if (name.includes('food')) return SERVICE_ICON.Food;
  if (name.includes('parcel')) return SERVICE_ICON.Parcel;
  return SERVICE_ICON.All;
};

const formatDate = (raw: string | null) => {
  if (!raw) return '';
  const d = new Date(raw);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// ─── Activity Card ────────────────────────────────────────────────────────────

const ActivityCard = ({ item }: { item: Booking }) => {
  const price = String(item.price ?? item.quotations?.[0]?.amount ?? '');

  return (
    <View style={[styles.card, { backgroundColor: COLORS.SURFACE, borderColor: COLORS.BORDER }]}>
      <LinearGradient colors={[...APP_GRADIENT_PRIMARY]} style={styles.typeIcon}>
        <Icon
          componentName={VARIABLES.Ionicons}
          iconName={guessIcon(item)}
          size={22}
          color={COLORS.WHITE}
        />
      </LinearGradient>

      <View style={{ flex: 1 }}>
        <View style={styles.cardTop}>
          <Typography style={[styles.cardTitle, { color: COLORS.TEXT }]}>
            {item.service_type?.name ?? 'Service'}
          </Typography>
          {!!price && (
            <Typography style={[styles.price, { color: COLORS.TEXT }]}>
              {`CFA ${price}`}
            </Typography>
          )}
        </View>

        <Typography style={[styles.date, { color: COLORS.TEXT_SECONDARY }]}>
          {formatDate(item.created_at)}
        </Typography>

        <Typography style={[styles.status, { color: COLORS.APP_PRIMARY }]}>
          {String(item.status ?? '')}
        </Typography>

        {(item.pickup_address || item.drop_off_address) && (
          <View style={styles.routeRow}>
            <View style={styles.routeRail}>
              <View style={styles.routeDot} />
              <View style={[styles.routeLine, { backgroundColor: COLORS.BORDER }]} />
              <View style={[styles.routeDot, { backgroundColor: COLORS.APP_SECONDARY }]} />
            </View>
            <View style={{ flex: 1 }}>
              <Typography style={[styles.addrLabel, { color: COLORS.TEXT }]}>Pickup</Typography>
              <Typography
                style={[styles.addr, { color: COLORS.TEXT_SECONDARY }]}
                numberOfLines={1}
              >
                {item.pickup_address ?? '—'}
              </Typography>
              <Typography style={[styles.addrLabel, { color: COLORS.TEXT, marginTop: 10 }]}>
                Drop-off
              </Typography>
              <Typography
                style={[styles.addr, { color: COLORS.TEXT_SECONDARY }]}
                numberOfLines={1}
              >
                {item.drop_off_address ?? '—'}
              </Typography>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

// ─── Category chip strip ──────────────────────────────────────────────────────

const CatStrip = ({
  value,
  onChange,
}: {
  value: ServiceCat;
  onChange: (c: ServiceCat) => void;
}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    style={styles.catScroll}
    contentContainerStyle={styles.catContent}
  >
    {(['All', 'Rides', 'Food', 'Parcel'] as ServiceCat[]).map(c => (
      <Pressable
        key={c}
        onPress={() => onChange(c)}
        style={[
          styles.chip,
          {
            backgroundColor: value === c ? COLORS.APP_PRIMARY : COLORS.SURFACE,
            borderColor: value === c ? COLORS.APP_PRIMARY : COLORS.BORDER,
          },
        ]}
      >
        <Typography
          style={[
            styles.chipText,
            { color: value === c ? COLORS.WHITE : COLORS.TEXT_SECONDARY },
          ]}
        >
          {c}
        </Typography>
      </Pressable>
    ))}
  </ScrollView>
);

// ─── Tab content ──────────────────────────────────────────────────────────────

type StatusParam = 'upcoming' | 'in_progress' | 'completed' | 'cancelled';

const ActivityList = ({ status }: { status: StatusParam }) => {
  const [cat, setCat] = useState<ServiceCat>('All');
  const { items, loading, refetch, loadMore, hasMore } = useBookings({
    isDentor: false,
    status,
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const filtered = filterByCat(items, cat);

  return (
    <View style={[styles.tabPage, { backgroundColor: COLORS.BACKGROUND }]}>
      <CatStrip value={cat} onChange={setCat} />

      {loading && items.length === 0 ? (
        <View style={styles.shimmer}>
          <InfoBoxSkeleton count={4} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onScrollEndDrag={() => {
            if (hasMore) loadMore();
          }}
        >
          {filtered.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Icon
                componentName={VARIABLES.Ionicons}
                iconName="file-tray-outline"
                size={48}
                color={COLORS.APP_TEXT_MUTED}
              />
              <Typography style={[styles.emptyText, { color: COLORS.TEXT_SECONDARY }]}>
                No activities found
              </Typography>
            </View>
          ) : (
            filtered.map(item => <ActivityCard key={item.id} item={item} />)
          )}
        </ScrollView>
      )}
    </View>
  );
};

// Screen components for the tab navigator
const ActiveTab  = () => <ActivityList status="upcoming" />;
const HistoryTab = () => <ActivityList status="completed" />;

// ─── Navigator ────────────────────────────────────────────────────────────────

const Tab = createMaterialTopTabNavigator();

const ActivityTabs = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: COLORS.APP_PRIMARY,
      tabBarInactiveTintColor: COLORS.TEXT_SECONDARY,
      tabBarLabelStyle: {
        fontWeight: FontWeight.Bold,
        fontSize: FontSize.Small,
        textTransform: 'capitalize',
      },
      tabBarIndicatorStyle: {
        backgroundColor: COLORS.APP_PRIMARY,
        height: 3,
      },
      tabBarStyle: {
        backgroundColor: COLORS.SURFACE,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.BORDER,
      },
      tabBarItemStyle: { paddingVertical: 6 },
      swipeEnabled: true,
      lazy: true,
    }}
    initialLayout={{ width: screenWidth(100) }}
  >
    <Tab.Screen name="Active"  component={ActiveTab} />
    <Tab.Screen name="History" component={HistoryTab} />
  </Tab.Navigator>
);

// ─── Root screen ──────────────────────────────────────────────────────────────

export const ConsumerMultiServiceActivity = () => (
  <Wrapper
    headerTitle="Activity"
    showBackButton={false}
    safeAreaEdges={['top', 'bottom']}
    wantPaddingBottom={false}
  >
    <ActivityTabs />
  </Wrapper>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  tabPage: {
    flex: 1,
  },
  catScroll: {
    flexGrow: 0,
  },
  catContent: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: {
    fontWeight: FontWeight.Bold,
    fontSize: FontSize.Small,
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  shimmer: {
    flex: 1,
    paddingVertical: 20,
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: FontSize.Medium,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    gap: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  typeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontWeight: FontWeight.Bold,
    fontSize: FontSize.Medium,
  },
  price: {
    fontWeight: FontWeight.Bold,
  },
  date: {
    fontSize: FontSize.ExtraSmall,
    marginTop: 2,
  },
  status: {
    fontWeight: FontWeight.Bold,
    fontSize: FontSize.Small,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  routeRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },
  routeRail: {
    alignItems: 'center',
    width: 12,
    paddingTop: 4,
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.APP_PRIMARY,
  },
  routeLine: {
    width: 2,
    height: 28,
    marginVertical: 2,
  },
  addrLabel: {
    fontWeight: FontWeight.Bold,
    fontSize: FontSize.Small,
  },
  addr: {
    fontSize: FontSize.Small,
  },
});
