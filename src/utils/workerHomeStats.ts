type WorkerHomeStatsListener = () => void;

const listeners = new Set<WorkerHomeStatsListener>();

/** Subscribe to home stats refresh (re-fetch user profile after job complete). */
export function subscribeWorkerHomeStatsRefresh(listener: WorkerHomeStatsListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Refresh worker home stats — call after job complete or app bootstrap. */
export function refreshWorkerHomeStats(): void {
  listeners.forEach(listener => {
    try {
      listener();
    } catch {
      // Ignore listener errors so one bad subscriber does not block others.
    }
  });
}
