import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography, WorkerStatPills, WorkerTripCard } from 'components/index';
import { useAppSelector } from 'types/reduxTypes';
import { getWorkerRoleCopy } from 'utils/workerRoleCopy';
import {
  WORKER_HISTORY_STATS,
  WORKER_HISTORY_TRIPS,
} from 'components/common/worker/workerMockData';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS } from 'utils/index';

export const WorkerRideHistoryScreen = () => {
  const role = useAppSelector(state => state.user?.role);
  const copy = getWorkerRoleCopy(role);
  const historyStats = [
    { value: WORKER_HISTORY_STATS.trips, label: 'Trips' },
    { value: WORKER_HISTORY_STATS.earned, label: 'Earned' },
    { value: WORKER_HISTORY_STATS.rating, label: 'Avg Rating' },
  ];

  return (
  <View style={styles.root}>
    <SafeAreaView edges={['top']} style={styles.safeTop}>
      <Typography style={styles.header}>Ride History</Typography>
    </SafeAreaView>

    <FlatList
      data={WORKER_HISTORY_TRIPS}
      keyExtractor={item => item.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.list}
      ListHeaderComponent={<WorkerStatPills stats={historyStats} />}
      renderItem={({ item }) => <WorkerTripCard trip={item} />}
    />
  </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  safeTop: {
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    fontSize: FontSize.Large,
    fontWeight: FontWeight.Bold,
    textAlign: 'center',
    paddingVertical: 16,
    color: COLORS.TEXT,
  },
  list: {
    paddingBottom: 120,
    marginHorizontal: 16,
  },
});
