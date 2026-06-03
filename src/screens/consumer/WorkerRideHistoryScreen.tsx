import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography, WorkerStatPills, WorkerTripCard } from 'components/index';
import {
  WORKER_HISTORY_STATS,
  WORKER_HISTORY_TRIPS,
  type WorkerTripRecord,
} from 'components/common/worker/workerMockData';
import { extractBookingsList, listBookings } from 'api/functions/snlift/bookings';
import { mapBookingToWorkerTrip } from 'api/mappers/snliftBooking';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS } from 'utils/index';

export const WorkerRideHistoryScreen = () => {
  const [trips, setTrips] = useState<WorkerTripRecord[]>(WORKER_HISTORY_TRIPS);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await listBookings({ status: 'completed' });
      const bookings = extractBookingsList(res).filter(
        b => (b.status ?? '').toLowerCase() === 'completed',
      );
      if (!cancelled && bookings.length > 0) {
        setTrips(bookings.map(mapBookingToWorkerTrip));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const historyStats = [
    { value: String(trips.length).padStart(2, '0'), label: 'Trips' },
    { value: WORKER_HISTORY_STATS.earned, label: 'Earned' },
    { value: WORKER_HISTORY_STATS.rating, label: 'Avg Rating' },
  ];

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.safeTop}>
        <Typography style={styles.header}>Ride History</Typography>
      </SafeAreaView>

      <FlatList
        data={trips}
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
  },
});
