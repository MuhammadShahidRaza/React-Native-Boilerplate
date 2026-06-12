import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { Typography, Wrapper, WorkerRequestCard } from 'components/index';
import { FontSize } from 'types/fontTypes';
import { navigate } from 'navigation/index';
import { SCREENS } from 'constants/routes';
import type { WorkerRequestRecord } from 'components/common/worker/workerMockData';
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

  useEffect(() => {
    dispatch(setLookingForDeliveries(true));
    return () => {
      dispatch(setLookingForDeliveries(false));
    };
  }, [dispatch]);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listBookings({ scope: 'available' }, role);
      const bookings = extractBookingsList(res);
      setRequests(bookings.map(mapBookingToWorkerRequest));
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
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
        <View style={styles.centered}>
          <ActivityIndicator size='large' color={COLORS.PRIMARY} />
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={item => item.id}
          contentContainerStyle={requests.length === 0 ? styles.emptyList : styles.list}
          showsVerticalScrollIndicator={false}
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
