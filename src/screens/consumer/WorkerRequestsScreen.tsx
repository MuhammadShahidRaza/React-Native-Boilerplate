import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { Typography, Wrapper, WorkerRequestCard } from 'components/index';
import { FontSize } from 'types/fontTypes';
import { navigate } from 'navigation/index';
import { SCREENS } from 'constants/routes';
import {
  type WorkerRequestRecord,
} from 'components/common/worker/workerMockData';
import { useAppDispatch, useAppSelector } from 'types/reduxTypes';
import { getWorkerRoleCopy } from 'utils/workerRoleCopy';
import { COLORS } from 'utils/index';
import { setLookingForDeliveries } from 'store/slices/worker';
import { extractBookingsList, listBookings } from 'api/functions/snlift/bookings';
import { mapBookingToWorkerRequest } from 'api/mappers/snliftBooking';

export const WorkerRequestsScreen = () => {
  const dispatch = useAppDispatch();
  const role = useAppSelector(state => state.user?.role);
  const copy = getWorkerRoleCopy(role);
  const [requests, setRequests] = useState<WorkerRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(setLookingForDeliveries(true));
    return () => {
      dispatch(setLookingForDeliveries(false));
    };
  }, [dispatch]);

  const loadRequests = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const res = await listBookings(
        { scope: 'available' },
        role,
        { showLoader: false, showError: false, silentErrors: true },
      );
      const bookings = extractBookingsList(res);
      setRequests(bookings.map(mapBookingToWorkerRequest));
    } catch {
      if (!isRefresh) setRequests([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [role]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  return (
    <Wrapper
      headerTitle={copy.requestsTitle}
      showBackButton
      useScrollView={false}
      backgroundColor={COLORS.BACKGROUND}
      darkMode={false}
    >
      {loading ? (
        <View style={styles.list}>
          <WorkerRequestsSkeleton />
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={item => item.id}
          contentContainerStyle={requests.length === 0 ? styles.emptyList : styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadRequests(true)}
              colors={[COLORS.PRIMARY]}
              tintColor={COLORS.PRIMARY}
            />
          }
          ListEmptyComponent={
            <Typography style={styles.emptyText}>No available requests right now.</Typography>
          }
          renderItem={({ item }) => (
            <WorkerRequestCard
              request={item}
              fareLabel={copy.fareLabel}
              onPress={() =>
                navigate(SCREENS.WORKER_REQUEST_DETAIL, { requestId: item.id })
              }
            />
          )}
        />
      )}
    </Wrapper>
  );
};

const WorkerRequestsSkeleton = () => (
  <SkeletonPlaceholder
    backgroundColor={COLORS.SKELETON_BACKGROUND}
    highlightColor={COLORS.SKELETON_HIGHLIGHT}
  >
    {[0, 1, 2].map(index => (
      <SkeletonPlaceholder.Item
        key={index}
        height={96}
        borderRadius={16}
        marginBottom={12}
      />
    ))}
  </SkeletonPlaceholder>
);

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  emptyList: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.APP_TEXT,
    fontSize: FontSize.Medium,
    marginTop: 24,
  },
});
