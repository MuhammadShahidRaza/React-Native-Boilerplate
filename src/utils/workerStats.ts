import { formatProviderRating } from 'api/normalizers/snlift';
import { APP_CONFIG } from 'config/app';
import { ENV_CONSTANTS } from 'constants/common';
import {
  WORKER_EARNINGS_SUMMARY,
  WORKER_HISTORY_STATS,
} from 'components/common/worker/workerMockData';
import type { User } from 'types/responseTypes';
import { formatMoney } from 'utils/currency';
import { parseMoneyAmount } from 'utils/index';

type WorkerTripLike = { earned?: string };

function readUserStat(user: User | null | undefined, keys: string[]): number | null {
  if (!user) return null;
  const root = user as unknown as Record<string, unknown>;
  const details = (user.details ?? {}) as Record<string, unknown>;
  for (const key of keys) {
    const raw = root[key] ?? details[key];
    if (raw === undefined || raw === null || raw === '') continue;
    const n = typeof raw === 'number' ? raw : parseFloat(String(raw).replace(/[^0-9.-]/g, ''));
    if (!Number.isNaN(n)) return n;
  }
  return null;
}

export function getWorkerTripCountFromUser(
  user: User | null | undefined,
  role: string | null | undefined,
  fallback = 0,
): number {
  const serviceSummary = (user as { service_summary?: { counts?: Record<string, number> } } | null)
    ?.service_summary?.counts;
  const totalRides = readUserStat(user, [
    'total_rides',
    'rides',
    'rides_count',
    'completed_rides',
    'ride_count',
  ]);

  if (totalRides != null) return totalRides;

  if (serviceSummary) {
    if (role === APP_CONFIG.COURIER_ROLE) {
      return serviceSummary.parcel ?? serviceSummary.food ?? serviceSummary.total ?? fallback;
    }
    return serviceSummary.ride ?? serviceSummary.total ?? fallback;
  }

  return fallback;
}

export function getWorkerHomeStatsFromUser(
  user: User | null | undefined,
  role: string | null | undefined,
) {
  if (ENV_CONSTANTS.IS_ALPHA_PHASE) {
    return {
      totalEarnings: WORKER_EARNINGS_SUMMARY.total,
      tripCount: WORKER_HISTORY_STATS.trips,
      rating: WORKER_HISTORY_STATS.rating,
    };
  }

  const totalEarnings = readUserStat(user, ['total_earnings', 'earnings_total']);

  return {
    totalEarnings: formatMoney(totalEarnings ?? 0),
    tripCount: String(getWorkerTripCountFromUser(user, role, 0)),
    rating: formatProviderRating(user as unknown as Record<string, unknown>),
  };
}

export function getWorkerHistoryStats(
  user: User | null | undefined,
  trips: WorkerTripLike[],
  role: string | null | undefined,
) {
  if (ENV_CONSTANTS.IS_ALPHA_PHASE) {
    return {
      tripsCount: WORKER_HISTORY_STATS.trips,
      earned: WORKER_HISTORY_STATS.earned,
      avgRating: WORKER_HISTORY_STATS.rating,
    };
  }

  const tripCount = getWorkerTripCountFromUser(user, role, trips.length);
  const totalEarnings = readUserStat(user, ['total_earnings', 'earnings_total', 'upcoming_balance']);

  let earnedFallback = 0;
  for (const trip of trips) {
    const n = parseMoneyAmount(trip.earned ?? '');
    if (n != null) earnedFallback += n;
  }

  return {
    tripsCount: String(tripCount).padStart(2, '0'),
    earned: totalEarnings != null ? formatMoney(totalEarnings) : formatMoney(earnedFallback),
    avgRating: formatProviderRating(user as unknown as Record<string, unknown>),
  };
}
