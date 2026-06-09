import { useEffect, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { Wrapper, WorkerRequestCard } from 'components/index';
import { navigate } from 'navigation/index';
import { SCREENS } from 'constants/routes';
import {
  WORKER_MOCK_REQUESTS,
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
  const [requests, setRequests] = useState<WorkerRequestRecord[]>(WORKER_MOCK_REQUESTS);

  useEffect(() => {
    dispatch(setLookingForDeliveries(true));
    return () => {
      dispatch(setLookingForDeliveries(false));
    };
  }, [dispatch]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await listBookings({ scope: 'available' }, role);
      const bookings = extractBookingsList(res);
      if (!cancelled && bookings.length > 0) {
        setRequests(bookings.map(mapBookingToWorkerRequest));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Wrapper
      headerTitle={copy.requestsTitle}
      showBackButton
      useScrollView={false}
      backgroundColor={COLORS.BACKGROUND}
      darkMode={false}
    >
      <FlatList
        data={requests}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
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
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
});
