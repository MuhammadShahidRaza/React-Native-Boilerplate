import { useEffect, useState } from 'react';
import store from 'store/store';
import { getJobDisplayTimerSeconds } from 'api/functions/snlift/settings';
import { getJobExpiresAt, parseJobDisplayTimer } from 'utils/jobDisplayTimer';

type JobDisplayTimerState = {
  expiresAt: number | null;
  durationSeconds: number | null;
  ready: boolean;
};

function normalizeDurationSeconds(value: unknown): number | null {
  if (value == null || value === '') return null;
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return Math.round(value);
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (trimmed.includes(':') || !Number.isFinite(Number(trimmed))) {
      const parsed = parseJobDisplayTimer(trimmed);
      return parsed > 0 ? parsed : null;
    }
    const n = Number(trimmed);
    if (Number.isFinite(n) && n > 0) return Math.round(n);
  }
  return null;
}

function buildTimerState(
  createdAt: string | undefined,
  durationSeconds: number,
): JobDisplayTimerState {
  if (!createdAt) {
    return { expiresAt: null, durationSeconds, ready: false };
  }
  const expiresAt = getJobExpiresAt(createdAt, durationSeconds);
  return { expiresAt, durationSeconds, ready: true };
}

export function useJobDisplayTimer(
  createdAt: string | undefined,
  durationSeconds?: number,
): JobDisplayTimerState {
  const normalizedDuration = normalizeDurationSeconds(durationSeconds);

  const [state, setState] = useState<JobDisplayTimerState>(() => {
    if (normalizedDuration != null) {
      return buildTimerState(createdAt, normalizedDuration);
    }
    return { expiresAt: null, durationSeconds: null, ready: false };
  });

  useEffect(() => {
    let cancelled = false;

    if (normalizedDuration != null) {
      setState(buildTimerState(createdAt, normalizedDuration));
      return;
    }

    (async () => {
      const cached = store.getState().platformSettings.jobDisplayTimerSeconds;
      const resolvedDuration =
        cached != null && store.getState().platformSettings.loaded
          ? cached
          : await getJobDisplayTimerSeconds();
      if (cancelled) return;
      setState(buildTimerState(createdAt, resolvedDuration));
    })();

    return () => {
      cancelled = true;
    };
  }, [createdAt, normalizedDuration]);

  return state;
}
