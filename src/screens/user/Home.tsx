import { StyleSheet, View } from 'react-native';
import {
  Button,
  FlatListComponent,
  HomeHeader,
  InfoBoxSkeleton,
  Photo,
  RowComponent,
  Typography,
  Wrapper,
} from 'components/index';
import { COLORS, formatTitle, screenHeight, screenWidth, STYLES } from 'utils/index';
import { COMMON_TEXT } from 'constants/screens';
import { BookingInfoBox } from 'components/appComponents/BookingInfoBox';
import { JobActivityBanner } from 'components/appComponents/JobActivityBanner';
import { FontSize } from 'types/fontTypes';
import { navigate } from 'navigation/index';
import { SCREENS } from 'constants/routes';
import { useAppDispatch, useAppSelector } from 'types/reduxTypes';
import { JobInfoBox } from 'components/appComponents/JobInfoBox';
import { ActivityStatus } from './Activities';
import { JobStatus } from './MyJobs';
import { useBookings } from 'hooks/useBookings';
import { Booking } from 'types/responseTypes';
import { APP_CONFIG } from 'config/app';
import { IMAGES } from 'constants/assets';
import { resetNewInquiriesUnreadCount } from 'store/slices/notification';

/** User: all active jobs. Dentor: jobs after bid placed (excludes pending/new inquiries). */
const ACTIVE_STATUSES_USER = ['pending', 'bidding', 'upcoming', 'in_progress', 'completed'];
const ACTIVE_STATUSES_DENTOR = ['bidding', 'upcoming', 'in_progress', 'completed'];

export const Home = () => {
  const role = useAppSelector(state => state?.user?.role);
  const newInquiriesUnreadCount = useAppSelector(
    state => state?.notification?.newInquiriesUnreadCount ?? 0,
  );
  const isDentor = role === APP_CONFIG.PROVIDER_ROLE;
  const { items, loading, loadingMore, loadMore, hasMore, refetch } = useBookings({
    isDentor,
    status: 'upcoming',
  });
  const { items: allItems, refetch: refetchActivity } = useBookings({
    isDentor,
  });
  const activeStatuses = isDentor ? ACTIVE_STATUSES_DENTOR : ACTIVE_STATUSES_USER;
  const activityItems = allItems
    .filter((b: Booking) => activeStatuses.includes((b?.status ?? '').toString().toLowerCase()))
    .slice(0, 1);

  // Helper functions for cleaner code
  const getTitle = () => {
    const title = isDentor
      ? 'Explore New Jobs And Get Paid'
      : 'Explore Technicians With Your Requests';
    return formatTitle(title);
  };
  const getButtonTitle = () => (isDentor ? 'View New Inquiries' : 'Book Service Provider');
  const getSectionTitle = () => (isDentor ? 'Recent Jobs' : 'Recent Bookings');

  const getButtonPress = () =>
    isDentor
      ? () =>
          navigate(SCREENS.MY_JOBS, {
            selectedTab: JobStatus.NewInquiries,
          })
      : () => navigate(SCREENS.SERVICE_TYPE);

  const renderListItem = ({ item }: { item: Booking }) => {
    return isDentor ? (
      <JobInfoBox item={{ ...item, status: JobStatus.Confirmed, sub_type: 'Upcoming' }} /> //'In-Progress'
    ) : (
      <BookingInfoBox item={{ ...item, status: ActivityStatus.Confirmed, sub_type: 'Upcoming' }} /> //'In-Progress'
    );
  };

  const listHeader = (
    <>
      {activityItems.length > 0 && (
        <>
          {activityItems.map((item: Booking) => (
            <JobActivityBanner
              key={item?.id}
              item={item}
              isDentor={isDentor}
              onPress={() => navigate(SCREENS.JOB_DETAIL, { jobId: item?.id })}
            />
          ))}
        </>
      )}
      <RowComponent style={{ marginTop: 16, marginBottom: 8 }}>
        <Typography style={{ fontWeight: 'bold', fontSize: FontSize.Large }}>
          {getSectionTitle()}
        </Typography>
        {items.length > 0 && (
          <Typography
            onPress={() => {
              if (isDentor) {
                navigate(SCREENS.MY_JOBS, {
                  selectedTab: JobStatus.Confirmed,
                });
              } else {
                navigate(SCREENS.ACTIVITIES, {
                  selectedTab: ActivityStatus.Confirmed,
                });
              }
            }}
            style={{ color: COLORS.PRIMARY }}
          >
            {COMMON_TEXT.SEE_ALL}
          </Typography>
        )}
      </RowComponent>
    </>
  );

  const EmptyHomeCard = ({ isDentor }: { isDentor: boolean }) => {
    return (
      <Photo
        onPress={isDentor ? () => navigate(SCREENS.MY_JOBS) : () => navigate(SCREENS.SERVICE_TYPE)}
        source={isDentor ? IMAGES.NO_JOBS : IMAGES.NO_BOOKINGS}
        imageStyle={{
          width: screenWidth(100),
          height: screenHeight(activityItems?.length > 0 ? 35 : 50),
          resizeMode: 'cover',
        }}
      />
    );
  };

  return (
    <Wrapper
      backgroundColor={COLORS.LIGHT_ORANGE}
      useSafeArea={false}
      darkMode={false}
      wantPaddingBottom={false}
      showBackButton={false}
    >
      <HomeHeader />

      <View style={styles.container}>
        <RowComponent>
          <Typography
            numberOfLines={2}
            style={{ fontWeight: 'bold', fontSize: FontSize.Large, flex: 1 }}
          >
            {getTitle()}
          </Typography>
        </RowComponent>
        <View style={styles.newInquiriesButtonWrap}>
          <Button
            style={{
              marginVertical: 15,
              marginHorizontal: 20,
              backgroundColor: COLORS.BOTTOM_NAVIGATION_BAR,
            }}
            title={getButtonTitle()}
            onPress={getButtonPress()}
          />
          {isDentor && newInquiriesUnreadCount > 0 ? (
            <View style={styles.newInquiriesBadge}>
              <Typography style={styles.newInquiriesBadgeText}>
                {newInquiriesUnreadCount > 99 ? '99+' : String(newInquiriesUnreadCount)}
              </Typography>
            </View>
          ) : null}
        </View>
        {loading && items.length === 0 ? (
          <View style={styles.shimmerContainer}>
            <InfoBoxSkeleton count={2} />
          </View>
        ) : (
          <FlatListComponent
            data={items?.slice(0, 3) ?? []}
            scrollEnabled={true}
            renderItem={renderListItem}
            keyExtractor={item => item?.id?.toString() ?? ''}
            onRefresh={() => {
              refetch();
              refetchActivity();
            }}
            refreshing={loading}
            onEndReached={hasMore && !loadingMore ? loadMore : undefined}
            onEndReachedThreshold={0.3}
            noItemProps={{
              containerHeight: screenHeight(25),
              message: 'No upcoming results found',
            }}
            EmptyComponent={
              items.length === 0 && activityItems.length === 0 && !loading
                ? () => <EmptyHomeCard isDentor={isDentor} />
                : undefined
            }
            ListHeaderComponent={listHeader}
            ListFooterComponent={
              loadingMore ? (
                <Typography style={{ padding: 12, textAlign: 'center' }}>Loading more…</Typography>
              ) : null
            }
          />
        )}
      </View>
    </Wrapper>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...STYLES.CONTAINER,
    marginBottom: 5,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: FontSize.Large,
    marginBottom: 4,
  },
  shimmerContainer: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  newInquiriesButtonWrap: {
    position: 'relative',
  },
  newInquiriesBadge: {
    position: 'absolute',
    right: 28,
    top: 6,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.RED,
    borderWidth: 1,
    borderColor: COLORS.WHITE,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  newInquiriesBadgeText: {
    color: COLORS.WHITE,
    fontSize: FontSize.Small,
    fontWeight: '700',
    lineHeight: FontSize.Small + 1,
  },
  emptyAction: {
    marginTop: 14,
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: 16,
    padding: 20,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },

  emptyTitle: {
    fontWeight: 'bold',
    color: COLORS.TEXT_SECONDARY,
    fontSize: 18,
  },

  emptyDesc: {
    marginTop: 6,
    color: '#666',
    lineHeight: 20,
  },
  emptyEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
});
