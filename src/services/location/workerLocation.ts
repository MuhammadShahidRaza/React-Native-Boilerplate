import { getFirestore, doc, setDoc, serverTimestamp } from '@react-native-firebase/firestore';
import { logger } from 'utils/logger';

const WORKERS_COLLECTION = __DEV__ ? `workers_dev` : 'workers';

/**
 * Write / merge worker location into Firestore at workers/{userId}.
 * Used for real-time tracking by the admin / user tracking screen.
 */
export async function updateWorkerFirestoreLocation(
  userId: number | string,
  latitude: number,
  longitude: number,
  role: string,
): Promise<void> {
  try {
    const db = getFirestore();
    const ref = doc(db, WORKERS_COLLECTION, String(userId));
    await setDoc(
      ref,
      {
        latitude,
        longitude,
        role,
        updated_at: serverTimestamp(),
        user_id: String(userId),
      },
      { merge: true },
    );
  } catch (error) {
    logger.error('updateWorkerFirestoreLocation error:', error);
  }
}
