import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  FlatListComponent,
  Wrapper,
  RowComponent,
  Typography,
  DateRangeFilterProvider,
  DateRangeFilterBar,
  useDateRangeFilter,
} from 'components/index';
import { STYLES, COLORS, screenWidth } from 'utils/index';
import { FontSize, FontWeight } from 'types/fontTypes';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { JobInfoBox } from 'components/appComponents/JobInfoBox';
import { InfoBoxSkeleton } from 'components/appComponents/InfoBoxSkeleton';
import { AppScreenProps } from 'types/navigation';
import { SCREENS } from 'constants/routes';
import { navigate } from 'navigation/index';
import { useBookings } from 'hooks/useBookings';
import type { BookingStatusParam } from 'api/functions/app/home';
import { Booking } from 'types/responseTypes';
import { resetNewInquiriesUnreadCount } from 'store/slices/notification';
import { useAppDispatch } from 'types/index';

type SubTab = 'Upcoming' | 'In-Progress';
// | 'Rejected';

export enum JobStatus {
  NewInquiries = 'New Inquiries',
  BidPlaced = 'Bid Placed',
  Confirmed = 'Confirmed',
  Completed = 'Completed',
}

// //TODO:CHECK ON BACKEND
// /** Map UI tabs/sub-tabs to backend status param (dentor) */
// const JOB_TAB_TO_STATUS: Record<string, BookingStatusParam> = {
//   'New Inquiries': 'new',
//   'Bid Placed': 'applied',
//   'Upcoming': 'upcoming',
//   'In-Progress': 'assigned',
//   'Rejected': 'rejected',
//   'Completed': 'completed',
// };
/** Map UI tabs/sub-tabs to backend status param (dentor) */
const JOB_TAB_TO_STATUS: Record<string, BookingStatusParam> = {
  'New Inquiries': 'pending',
  'Bid Placed': 'bidding',
  Upcoming: 'upcoming',
  'In-Progress': 'in_progress',
  // 'Rejected': 'rejected',
  Completed: 'completed',
};

const Tab = createMaterialTopTabNavigator();

// Reusable Job List Component
interface JobsListProps {
  data: Booking[];
  showDateSection?: boolean;
  showBiddingSection?: boolean;
  isLoading?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
  onEndReached?: () => void;
  onBidSuccess?: () => void;
  onProofSuccess?: () => void;
  tab?: JobStatus;
  selectedSubTab?: SubTab;
}

const JobsList: React.FC<JobsListProps> = ({
  data,
  showDateSection,
  showBiddingSection,
  isLoading = false,
  onRefresh,
  tab,
  selectedSubTab,
  refreshing = false,
  onEndReached,
  onBidSuccess,
  onProofSuccess,
}) => {
  if (isLoading) {
    return (
      <View style={styles.listContent}>
        <InfoBoxSkeleton showBiddingSection={showBiddingSection} count={5} />
      </View>
    );
  }

  const renderItem = useCallback(
    ({ item }: { item: Booking }) => (
      <JobInfoBox
        item={{ ...item, sub_type: selectedSubTab ?? '', status: tab ?? JobStatus.NewInquiries }}
        showDateSection={showDateSection}
        showBiddingSection={showBiddingSection}
        onBidSuccess={onBidSuccess ?? onRefresh}
        onProofSuccess={onProofSuccess ?? onRefresh}
      />
    ),
    [
      tab,
      selectedSubTab,
      showDateSection,
      showBiddingSection,
      onBidSuccess,
      onProofSuccess,
      onRefresh,
    ],
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
  const status = JOB_TAB_TO_STATUS[selectedSubTab];
  const { dateFrom, dateTo, sortOrder } = useDateRangeFilter();
  const { items, loading, refetch, loadMore, hasMore } = useBookings({
    isDentor: true,
    status,
    sort: 'date',
    order: sortOrder,
    date_from: dateFrom ?? undefined,
    date_to: dateTo ?? undefined,
  });

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
      />
      <JobsList
        data={items}
        showDateSection={showDateSection}
        isLoading={loading}
        onRefresh={refetch}
        selectedSubTab={selectedSubTab}
        tab={JobStatus.Confirmed}
        refreshing={loading}
        onEndReached={hasMore ? loadMore : undefined}
        onBidSuccess={refetch}
        onProofSuccess={refetch}
      />
    </View>
  );
};

// Tab Screen Components
const NewInquiresTab = () => {
  const { dateFrom, dateTo, sortOrder } = useDateRangeFilter();
  const { items, loading, refetch, loadMore, hasMore } = useBookings({
    isDentor: true,
    status: 'pending',
    sort: 'date',
    order: sortOrder,
    date_from: dateFrom ?? undefined,
    date_to: dateTo ?? undefined,
  });
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );
  return (
    <JobsList
      data={items}
      showDateSection={true}
      showBiddingSection={true}
      isLoading={loading}
      onRefresh={refetch}
      refreshing={loading}
      selectedSubTab={undefined}
      tab={JobStatus.NewInquiries}
      onEndReached={hasMore ? loadMore : undefined}
      onBidSuccess={refetch}
      onProofSuccess={refetch}
    />
  );
};

const BidPlacedJobsTab = () => {
  const { dateFrom, dateTo, sortOrder } = useDateRangeFilter();
  const { items, loading, refetch, loadMore, hasMore } = useBookings({
    isDentor: true,
    status: 'bidding',
    sort: 'date',
    order: sortOrder,
    date_from: dateFrom ?? undefined,
    date_to: dateTo ?? undefined,
  });
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );
  return (
    <JobsList
      data={items}
      showDateSection={true}
      isLoading={loading}
      onRefresh={refetch}
      refreshing={loading}
      selectedSubTab={undefined}
      tab={JobStatus.BidPlaced}
      onEndReached={hasMore ? loadMore : undefined}
      onBidSuccess={refetch}
      onProofSuccess={refetch}
    />
  );
};

const CompletedJobsTab = () => {
  const { dateFrom, dateTo, sortOrder } = useDateRangeFilter();
  const { items, loading, refetch, loadMore, hasMore } = useBookings({
    isDentor: true,
    status: 'completed',
    sort: 'date',
    order: sortOrder,
    date_from: dateFrom ?? undefined,
    date_to: dateTo ?? undefined,
  });
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );
  return (
    <JobsList
      data={items}
      showDateSection={true}
      isLoading={loading}
      onRefresh={refetch}
      refreshing={loading}
      selectedSubTab={undefined}
      tab={JobStatus.Completed}
      onEndReached={hasMore ? loadMore : undefined}
      onBidSuccess={refetch}
      onProofSuccess={refetch}
    />
  );
};

// Reusable Sub-Tabs Selector Component
interface SubTabsSelectorProps {
  subTabs: SubTab[];
  selectedSubTab: SubTab;
  onSubTabChange: (subTab: SubTab) => void;
}

const SubTabsSelector: React.FC<SubTabsSelectorProps> = ({
  subTabs,
  selectedSubTab,
  onSubTabChange,
}) => {
  return (
    <RowComponent style={styles.subTabsContainer}>
      {subTabs.map(subTab => {
        const isActive = selectedSubTab === subTab;
        const count = 0;
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

const ConfirmedJobsTab = () => (
  <TabContentWithSubTabs
    subTabs={['Upcoming', 'In-Progress']}
    initialSubTab='Upcoming'
    showDateSection={true}
  />
);

const getMyJobsMainTabBadge = (name: string) => {
  let count = 0;
  if (name === 'New Inquiries') count = 0;
  else if (name === 'Bid Placed') count = 0;
  else if (name === 'Confirmed') count = 0;
  else if (name === 'Completed') count = 0;
  if (count <= 0) return null;
  return (
    <View style={styles.mainTabBadge}>
      <Typography style={styles.mainTabBadgeText}>{count > 99 ? '99+' : String(count)}</Typography>
    </View>
  );
};

const MyJobsTabs: React.FC = () => (
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
          {getMyJobsMainTabBadge(tabRoute.name)}
        </View>
      ),
    })}
    initialLayout={{ width: screenWidth(100) }}
  >
    <Tab.Screen name='New Inquiries' component={NewInquiresTab} />
    <Tab.Screen name='Bid Placed' component={BidPlacedJobsTab} />
    <Tab.Screen name='Confirmed' component={ConfirmedJobsTab} />
    <Tab.Screen name='Completed' component={CompletedJobsTab} />
  </Tab.Navigator>
);

export const MyJobs = ({ route }: AppScreenProps<typeof SCREENS.MY_JOBS>) => {
  const initialTab = route.params?.selectedTab;
  const dispatch = useAppDispatch();
  if (initialTab) {
    navigate(initialTab as any);
  }

  useFocusEffect(
    useCallback(() => {
      dispatch(resetNewInquiriesUnreadCount());
    }, []),
  );
  return (
    <Wrapper wantPaddingBottom={false} showBackButton={false} headerTitle='My Jobs'>
      <DateRangeFilterProvider>
        <MyJobsContent />
      </DateRangeFilterProvider>
    </Wrapper>
  );
};

const MyJobsContent = () => {
  return (
    <View style={styles.container}>
      <DateRangeFilterBar />
      <MyJobsTabs />
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
});
