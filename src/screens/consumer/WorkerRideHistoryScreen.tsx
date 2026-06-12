import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography, WorkerStatPills, WorkerTripCard } from 'components/index';
import type { WorkerTripRecord } from 'components/common/worker/workerMockData';
import { extractBookingsList, listBookings } from 'api/functions/snlift/bookings';
import { mapBookingToWorkerTrip } from 'api/mappers/snliftBooking';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS, formatMoney, parseMoneyAmount } from 'utils/index';
import { useAppSelector } from 'types/reduxTypes';
import { getWorkerRoleCopy } from 'utils/workerRoleCopy';

function sumTripEarnings(trips: WorkerTripRecord[]): string {
  let total = 0;
  for (const trip of trips) {
    const n = parseMoneyAmount(trip.earned);
    if (n != null) total += n;
  }
  return formatMoney(total);
}

export const WorkerRideHistoryScreen = () => {
  const role = useAppSelector(state => state.user?.role);
  const copy = getWorkerRoleCopy(role);
  const [trips, setTrips] = useState<WorkerTripRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listBookings({ status: 'completed' }, role);
      const bookings = extractBookingsList(res).filter(
        b => (b.status ?? '').toLowerCase() === 'completed',
      );
      setTrips(bookings.map(mapBookingToWorkerTrip));
    } catch {
      setTrips([]);
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const historyStats = [
    { value: String(trips.length).padStart(2, '0'), label: copy.tripsStatLabel },
    { value: sumTripEarnings(trips), label: 'Earned' },
    { value: '—', label: 'Avg Rating' },
  ];

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.safeTop}>
        <Typography style={styles.header}>{copy.historyTitle}</Typography>
      </SafeAreaView>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size='large' color={COLORS.PRIMARY} />
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={trips.length === 0 ? styles.emptyList : styles.list}
          ListHeaderComponent={<WorkerStatPills stats={historyStats} />}
          ListEmptyComponent={
            <Typography style={styles.emptyText}>No completed jobs yet.</Typography>
          }
          renderItem={({ item }) => <WorkerTripCard trip={item} />}
        />
      )}
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
  emptyList: {
    flexGrow: 1,
    paddingBottom: 120,
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
    paddingHorizontal: 24,
  },
});
