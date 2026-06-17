import { useEffect, useRef, useState } from 'react';
import { doc, getFirestore, onSnapshot } from '@react-native-firebase/firestore';
import {
  bearingBetweenCoords,
  mapCoordDistanceApprox,
  type MapCoord,
} from 'utils/coordinateAlongPolyline';
import { getVehicleMarkerHeading } from 'hooks/useWorkerGpsNavigation';
import { logger } from 'utils/logger';

const WORKERS_COLLECTION = __DEV__ ? 'workers_dev' : 'workers';
const MIN_MOVE_FOR_BEARING = 0.000012;

/** Real-time worker position from Firestore (written by workerActiveJobTracking). */
export function useProviderFirestoreLocation(
  providerId: number | string | null | undefined,
  enabled = true,
  vehicleKind: 'car' | 'bike' = 'car',
) {
  const [coord, setCoord] = useState<MapCoord | null>(null);
  const [bearing, setBearing] = useState(0);
  const prevRef = useRef<MapCoord | null>(null);

  useEffect(() => {
    if (!enabled || providerId == null || providerId === '') {
      setCoord(null);
      prevRef.current = null;
      return undefined;
    }

    const workerRef = doc(getFirestore(), WORKERS_COLLECTION, String(providerId));
    const unsub = onSnapshot(
      workerRef,
      snap => {
        const data = snap.data();
        if (!data) return;

        const lat =
          typeof data.latitude === 'number'
            ? data.latitude
            : parseFloat(String(data.latitude ?? ''));
        const lng =
          typeof data.longitude === 'number'
            ? data.longitude
            : parseFloat(String(data.longitude ?? ''));

        if (Number.isNaN(lat) || Number.isNaN(lng)) return;

        const next: MapCoord = { latitude: lat, longitude: lng };
        const prev = prevRef.current;

        if (prev && mapCoordDistanceApprox(prev, next) > MIN_MOVE_FOR_BEARING) {
          setBearing(getVehicleMarkerHeading(bearingBetweenCoords(prev, next), vehicleKind));
        }

        prevRef.current = next;
        setCoord(next);
      },
      err => logger.error('useProviderFirestoreLocation', err),
    );

    return unsub;
  }, [providerId, enabled, vehicleKind]);

  return { coord, bearing };
}
