type WalletUpdateListener = () => void;

const listeners = new Set<WalletUpdateListener>();

/** Subscribe to wallet-update pushes (e.g. admin top-up) so the UI can refresh without polling. */
export function subscribeWalletUpdate(listener: WalletUpdateListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Call when a wallet-related push notification arrives. */
export function notifyWalletUpdated(): void {
  listeners.forEach(listener => {
    try {
      listener();
    } catch {
      // Ignore listener errors so one bad subscriber does not block others.
    }
  });
}
