import { useEffect } from 'react';
import { resumeWorkerActiveJobTrackingIfNeeded } from 'services/location/workerActiveJobTracking';
import { isWorkerRole } from 'config/app';
import { useAppSelector } from 'types/reduxTypes';

/** Restore background location → Firestore tracking after app relaunch. */
export function useWorkerActiveJobTrackingBootstrap(): void {
  const isLoggedIn = useAppSelector(state => state.app?.isUserLoggedIn);
  const role = useAppSelector(state => state.user?.role);

  useEffect(() => {
    if (!isLoggedIn || !isWorkerRole(role)) return;
    void resumeWorkerActiveJobTrackingIfNeeded();
  }, [isLoggedIn, role]);
}
