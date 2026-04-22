import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import {
  FlatListComponent,
  Wrapper,
  Typography,
  RowComponent,
  DateRangeFilterProvider,
  DateRangeFilterBar,
  useDateRangeFilter,
} from 'components/index';
import { STYLES, COLORS, screenWidth } from 'utils/index';
import { FontSize, FontWeight } from 'types/fontTypes';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { BookingInfoBox } from 'components/appComponents/BookingInfoBox';
import { InfoBoxSkeleton } from 'components/appComponents/InfoBoxSkeleton';
import { AppScreenProps } from 'types/navigation';
import { SCREENS } from 'constants/routes';
import { navigate } from 'navigation/index';
import { Booking } from 'types/responseTypes';
import { useBookings } from 'hooks/useBookings';
import type { BookingStatusParam } from 'api/functions/app/home';

type SubTab = 'Quote Pending' | 'Bids Received' | 'Upcoming' | 'In-Progress';
// | 'Rejected';

export enum ActivityStatus {
  Requested = 'Requested',
  Confirmed = 'Confirmed',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
}

/** @deprecated Use Booking from types/responseTypes. Kept for BookingInfoBox import. */
export type BookingItem = Booking;

/** Map UI sub-tabs to backend status param */
const SUBTAB_TO_STATUS: Record<SubTab, BookingStatusParam> = {
  'Quote Pending': 'pending',
  'Bids Received': 'bidding',
  Upcoming: 'upcoming',
  'In-Progress': 'in_progress',
  // 'Rejected': 'rejected',
};

const Tab = createMaterialTopTabNavigator();

// Reusable Sub-Tabs Selector Component
interface SubTabsSelectorProps {
  subTabs: SubTab[];
  selectedSubTab: SubTab;
  onSubTabChange: (subTab: SubTab) => void;
  subTabCounts?: Record<SubTab, number>;
}

const SubTabsSelector: React.FC<SubTabsSelectorProps> = ({
  subTabs,
  selectedSubTab,
  onSubTabChange,
  subTabCounts = {},
}) => {
  return (
    <RowComponent style={styles.subTabsContainer}>
      {subTabs.map(subTab => {
        const isActive = selectedSubTab === subTab;
        const count = subTabCounts[subTab] ?? 0; // <-- use API count here

        return (
          <TouchableOpacity
            key={subTab}
            style={[
              styles.subTab,
              {
                backgroundColor: isActive ? COLORS.PRIMARY : COLORS.TRANSPARENT,
                borderColor: isActive ? COLORS.PRIMARY : COLORS.TRANSPARENT,
              },
            ]}
            onPress={() => onSubTabChange(subTab)}
            activeOpacity={0.7}
          >
            <View style={styles.subTabInner}>
              <Typography style={[styles.subTabText, isActive && styles.subTabTextActive]}>
                {subTab}
              </Typography>
              {count > 0 && (
                <View style={styles.badge}>
                  <Typography style={styles.badgeText}>
                    {count > 99 ? '99+' : String(count)}
                  </Typography>
                </View>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </RowComponent>
  );
};

// Reusable Activities List Component
interface ActivitiesListProps {
  data: Booking[];
  showDateSection?: boolean;
  showBiddingSection?: boolean;
  selectedSubTab?: SubTab;
  tab: ActivityStatus;
  isLoading?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
  onEndReached?: () => void;
}

const ActivitiesList: React.FC<ActivitiesListProps> = ({
  data,
  showDateSection,
  showBiddingSection,
  isLoading = false,
  selectedSubTab,
  tab,
  onRefresh,
  refreshing = false,
  onEndReached,
}) => {
  if (isLoading) {
    return (
      <View style={styles.shimmerContainer}>
        <InfoBoxSkeleton showBiddingSection={showBiddingSection} count={5} />
      </View>
    );
  }

  const renderItem = useCallback(
    ({ item }: { item: Booking }) => (
      <BookingInfoBox
        item={{ ...item, status: tab, sub_type: selectedSubTab ?? '' }}
        showDateSection={showDateSection}
        showBiddingSection={showBiddingSection}
      />
    ),
    [tab, selectedSubTab, showDateSection, showBiddingSection],
  );

  return (
    <FlatListComponent
      data={data}
      scrollEnabled={true}
      style={styles.list}
      onRefresh={onRefresh}
      refreshing={refreshing}
      onEndReached={onEndReached}
      contentContainerStyle={styles.listContent}
      nestedScrollEnabled={true}
      keyExtractor={item => item?.id?.toString() ?? ''}
      renderItem={renderItem}
    />
  );
};

// Reusable Tab Content with Sub-Tabs Component (fetches by status from API)
interface TabContentWithSubTabsProps {
  subTabs: SubTab[];
  initialSubTab: SubTab;
  showDateSection?: boolean;
}

const TabContentWithSubTabs: React.FC<TabContentWithSubTabsProps> = ({
  subTabs,
  initialSubTab,
  showDateSection = true,
}) => {
  const [selectedSubTab, setSelectedSubTab] = useState<SubTab>(initialSubTab);
  const status = SUBTAB_TO_STATUS[selectedSubTab];
  const { dateFrom, dateTo, sortOrder } = useDateRangeFilter();
  const { items, loading, refetch, loadMore, hasMore, allNewQuotationReceivedUnreadCount } =
    useBookings({
      isDentor: false,
      status,
      sort: 'date',
      order: sortOrder,
      date_from: dateFrom ?? undefined,
      date_to: dateTo ?? undefined,
    });
  console.log('allNewQuotationReceivedUnreadCount', allNewQuotationReceivedUnreadCount);
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  return (
    <View style={styles.subTabContainer}>
      <SubTabsSelector
        subTabs={subTabs}
        selectedSubTab={selectedSubTab}
        onSubTabChange={setSelectedSubTab}
        subTabCounts={{
          'Quote Pending': 0,
          'Bids Received': allNewQuotationReceivedUnreadCount ?? 0,
          Upcoming: 0,
          'In-Progress': 0,
        }}
      />
      <ActivitiesList
        data={items}
        showDateSection={showDateSection}
        showBiddingSection={selectedSubTab === 'Bids Received'}
        isLoading={loading}
        selectedSubTab={selectedSubTab}
        tab={
          selectedSubTab === 'Quote Pending' || selectedSubTab === 'Bids Received'
            ? ActivityStatus.Requested
            : ActivityStatus.Confirmed
        }
        onRefresh={refetch}
        refreshing={loading}
        onEndReached={hasMore ? loadMore : undefined}
      />
    </View>
  );
};

// Tab Screen Components
const JobRequestsSubTabs = () => (
  <TabContentWithSubTabs
    subTabs={['Quote Pending', 'Bids Received']}
    initialSubTab='Quote Pending'
    showDateSection={true}
  />
);

const ConfirmedSubTabs = () => (
  <TabContentWithSubTabs
    // subTabs={['Upcoming', 'In-Progress', 'Rejected']}
    subTabs={['Upcoming', 'In-Progress']}
    initialSubTab='Upcoming'
    showDateSection={true}
  />
);

const CompletedActivitiesList = () => {
  const { dateFrom, dateTo, sortOrder } = useDateRangeFilter();
  const { items, loading, refetch, loadMore, hasMore } = useBookings({
    isDentor: false,
    status: 'completed',
    sort: 'date',
    order: sortOrder,
    date_from: dateFrom ?? undefined,
    date_to: dateTo ?? undefined,
  });

  return (
    <ActivitiesList
      data={items}
      showDateSection={true}
      isLoading={loading}
      tab={ActivityStatus.Completed}
      selectedSubTab={undefined}
      onRefresh={refetch}
      refreshing={loading}
      onEndReached={hasMore ? loadMore : undefined}
    />
  );
};

const CancelledActivitiesList = () => {
  const { dateFrom, dateTo, sortOrder } = useDateRangeFilter();
  const { items, loading, refetch, loadMore, hasMore } = useBookings({
    isDentor: false,
    status: 'cancelled',
    sort: 'date',
    order: sortOrder,
    date_from: dateFrom ?? undefined,
    date_to: dateTo ?? undefined,
  });

  return (
    <ActivitiesList
      data={items}
      showDateSection={true}
      isLoading={loading}
      tab={ActivityStatus.Cancelled}
      selectedSubTab={undefined}
      onRefresh={refetch}
      refreshing={loading}
      onEndReached={hasMore ? loadMore : undefined}
    />
  );
};

const getActivitiesMainTabBadge = (name: string) => {
  let count = 0;
  if (name === 'Job Requests') count = 0;
  else if (name === 'Confirmed') count = 0;
  else if (name === 'Completed') count = 0;
  else if (name === 'Cancelled') count = 0;
  if (count <= 0) return null;
  return (
    <View style={styles.mainTabBadge}>
      <Typography style={styles.mainTabBadgeText}>{count > 99 ? '99+' : String(count)}</Typography>
    </View>
  );
};

const ActivitiesTabs = () => (
  <Tab.Navigator
    screenOptions={({ route: tabRoute }) => ({
      tabBarActiveTintColor: COLORS.PRIMARY,
      tabBarInactiveTintColor: COLORS.TEXT,
      tabBarLabelStyle: {
        fontWeight: FontWeight.Bold,
        fontSize: FontSize.Small,
        textTransform: 'capitalize',
      },
      tabBarIndicatorStyle: {
        backgroundColor: COLORS.PRIMARY,
        height: 3,
      },
      tabBarStyle: {
        backgroundColor: 'transparent',
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
      },
      tabBarItemStyle: {
        paddingVertical: 10,
        paddingHorizontal: 0,
      },
      tabBarContentContainerStyle: {},
      swipeEnabled: true,
      lazy: true,
      tabBarLabel: ({ focused }) => (
        <View style={styles.mainTabLabelWrap}>
          <Typography
            style={[styles.mainTabLabel, { color: focused ? COLORS.PRIMARY : COLORS.TEXT }]}
          >
            {tabRoute.name}
          </Typography>
          {getActivitiesMainTabBadge(tabRoute.name)}
        </View>
      ),
    })}
    initialLayout={{ width: screenWidth(100) }}
  >
    <Tab.Screen name='Job Requests' component={JobRequestsSubTabs} />
    <Tab.Screen name='Confirmed' component={ConfirmedSubTabs} />
    <Tab.Screen name='Completed' component={CompletedActivitiesList} />
    <Tab.Screen name='Cancelled' component={CancelledActivitiesList} />
  </Tab.Navigator>
);

export const Activities = ({ route }: AppScreenProps<typeof SCREENS.ACTIVITIES>) => {
  const initialTab = route.params?.selectedTab;

  if (initialTab) {
    navigate(initialTab as any);
  }

  return (
    <Wrapper wantPaddingBottom={false} headerTitle={'My Activities'} showBackButton={false}>
      <DateRangeFilterProvider>
        <ActivitiesContent />
      </DateRangeFilterProvider>
    </Wrapper>
  );
};

const ActivitiesContent = () => {
  return (
    <View style={styles.container}>
      <DateRangeFilterBar />
      <ActivitiesTabs />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...STYLES.CONTAINER,
  },
  subTabContainer: {
    flex: 1,
    marginTop: 15,
  },
  subTabsContainer: {
    alignSelf: 'center',
    padding: 5,
    justifyContent: 'center',
    gap: 10,
    ...STYLES.SHADOW,
    borderRadius: 50,
    backgroundColor: COLORS.SURFACE,
  },
  subTab: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  subTabText: {
    fontSize: FontSize.Small,
    fontWeight: FontWeight.Medium,
    color: COLORS.TEXT_SECONDARY,
  },
  subTabTextActive: {
    fontSize: FontSize.Small,
    fontWeight: FontWeight.Medium,
    color: COLORS.WHITE,
  },
  subTabInner: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -14,
    right: -15,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.RED,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: COLORS.WHITE,
    fontSize: 11,
    fontWeight: FontWeight.Bold,
  },
  mainTabLabelWrap: {
    position: 'relative',
  },
  mainTabLabel: {
    fontWeight: FontWeight.Bold,
    fontSize: FontSize.Small,
  },
  mainTabBadge: {
    position: 'absolute',
    top: -14,
    right: -15,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.RED,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  mainTabBadgeText: {
    color: COLORS.WHITE,
    fontSize: 10,
    fontWeight: FontWeight.Bold,
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  shimmerContainer: {
    flexGrow: 1,
    paddingVertical: 20,
  },
});
