import { useEffect, useState } from 'react';
import { getJobDisplayTimerSeconds } from 'api/functions/snlift/settings';
import { getJobExpiresAt } from 'utils/jobDisplayTimer';

type JobDisplayTimerState = {
  expiresAt: number | null;
  durationSeconds: number | null;
  ready: boolean;
};

function buildTimerState(
  createdAt: string | undefined,
  durationSeconds: number,
): JobDisplayTimerState {
  const expiresAt = createdAt
    ? getJobExpiresAt(createdAt, durationSeconds)
    : Date.now() + durationSeconds * 1000;
  return { expiresAt, durationSeconds, ready: true };
}

export function useJobDisplayTimer(
  createdAt: string | undefined,
  durationSeconds?: number,
): JobDisplayTimerState {
  const [state, setState] = useState<JobDisplayTimerState>(() => {
    if (durationSeconds != null && durationSeconds > 0) {
      return buildTimerState(createdAt, durationSeconds);
    }
    return { expiresAt: null, durationSeconds: null, ready: false };
  });

  useEffect(() => {
    let cancelled = false;

    if (durationSeconds != null && durationSeconds > 0) {
      setState(buildTimerState(createdAt, durationSeconds));
      return;
    }

    (async () => {
      const resolvedDuration = await getJobDisplayTimerSeconds();
      if (cancelled) return;
      setState(buildTimerState(createdAt, resolvedDuration));
    })();

    return () => {
      cancelled = true;
    };
  }, [createdAt, durationSeconds]);

  return state;
}
