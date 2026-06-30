import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography, WorkerStatPills, WorkerTripCard } from 'components/index';
import {
  WORKER_HISTORY_TRIPS,
  type WorkerTripRecord,
} from 'components/common/worker/workerMockData';
import { listWorkerBookingHistory } from 'api/functions/snlift/bookings';
import { mapBookingToWorkerTrip } from 'api/mappers/snliftBooking';
import { ENV_CONSTANTS } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS } from 'utils/index';
import { getWorkerHistoryStats } from 'utils/workerStats';
import { useAppSelector } from 'types/reduxTypes';
import { getWorkerRoleCopy } from 'utils/workerRoleCopy';
import { navigateToWorkerBooking } from 'utils/workerBookingNavigation';

export const WorkerRideHistoryScreen = () => {
  const role = useAppSelector(state => state.user?.role);
  const userDetails = useAppSelector(state => state.user?.userDetails);
  const copy = getWorkerRoleCopy(role);
  const [trips, setTrips] = useState<WorkerTripRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = useCallback(async (isRefresh = false) => {
    if (ENV_CONSTANTS.IS_ALPHA_PHASE) {
      setTrips(WORKER_HISTORY_TRIPS);
      setLoading(false);
      setRefreshing(false);
      return;
    }
    if (!role) {
      setTrips([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const bookings = await listWorkerBookingHistory(role, {
        showLoader: false,
        showError: false,
        silentErrors: true,
      });
      const mapped: WorkerTripRecord[] = [];
      for (const booking of bookings) {
        try {
          mapped.push(mapBookingToWorkerTrip(booking));
        } catch {
          // Skip malformed rows instead of failing the whole list.
        }
      }
      setTrips(mapped.length > 0 ? mapped : []);
    } catch {
      if (!isRefresh) {
        setTrips([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [role]);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory]),
  );

  const historyStats = useMemo(
    () => {
      const stats = getWorkerHistoryStats(userDetails, trips, role);
      return [
        { value: stats.tripsCount, label: copy.tripsStatLabel },
        { value: stats.earned, label: 'Earned' },
        { value: stats.avgRating, label: 'Avg Rating' },
      ];
    },
    [userDetails, trips, role, copy.tripsStatLabel],
  );

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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadHistory(true)}
              colors={[COLORS.PRIMARY]}
              tintColor={COLORS.PRIMARY}
            />
          }
          ListHeaderComponent={<WorkerStatPills stats={historyStats} />}
          ListEmptyComponent={
            <Typography style={styles.emptyText}>No jobs yet.</Typography>
          }
          renderItem={({ item }) => (
            <WorkerTripCard
              trip={item}
              onPress={() => navigateToWorkerBooking(item.id, item.status)}
            />
          )}
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
