import { useEffect } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { Wrapper, WorkerRequestCard } from 'components/index';
import { navigate } from 'navigation/index';
import { SCREENS } from 'constants/routes';
import { WORKER_MOCK_REQUESTS } from 'components/common/worker/workerMockData';
import { useAppDispatch, useAppSelector } from 'types/reduxTypes';
import { getWorkerRoleCopy } from 'utils/workerRoleCopy';
import { COLORS } from 'utils/index';
import { setLookingForDeliveries } from 'store/slices/worker';

export const WorkerRequestsScreen = () => {
  const dispatch = useAppDispatch();
  const role = useAppSelector(state => state.user?.role);
  const copy = getWorkerRoleCopy(role);

  useEffect(() => {
    dispatch(setLookingForDeliveries(true));
    return () => {
      dispatch(setLookingForDeliveries(false));
    };
  }, [dispatch]);

  return (
    <Wrapper
      headerTitle={copy.requestsTitle}
      showBackButton
      useScrollView={false}
      backgroundColor={COLORS.BACKGROUND}
      darkMode={false}
    >
      <FlatList
        data={WORKER_MOCK_REQUESTS}
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
