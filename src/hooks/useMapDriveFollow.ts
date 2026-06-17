import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import type MapView from 'react-native-maps';
import type { MapCoord } from 'utils/coordinateAlongPolyline';

const FOLLOW_ANIMATION_MS = 450;
const MIN_FOLLOW_INTERVAL_MS = 350;

/** Follow vehicle on map while moving; allow free pan when stopped or user drags. */
export function useMapDriveFollow(
  mapRef: RefObject<MapView | null>,
  vehicleCoord: MapCoord | null,
  vehicleBearing: number,
  isMoving: boolean,
) {
  const [followSuspended, setFollowSuspended] = useState(false);
  const lastFollowAt = useRef(0);

  const onMapUserInteraction = useCallback(() => {
    if (isMoving) {
      setFollowSuspended(true);
    }
  }, [isMoving]);

  useEffect(() => {
    if (!isMoving) {
      setFollowSuspended(false);
    }
  }, [isMoving]);

  useEffect(() => {
    if (!vehicleCoord || !mapRef.current || !isMoving || followSuspended) return;

    const now = Date.now();
    if (now - lastFollowAt.current < MIN_FOLLOW_INTERVAL_MS) return;
    lastFollowAt.current = now;

    mapRef.current.animateCamera(
      {
        center: vehicleCoord,
        heading: vehicleBearing,
        zoom: 17,
        pitch: 0,
      },
      { duration: FOLLOW_ANIMATION_MS },
    );
  }, [
    vehicleCoord?.latitude,
    vehicleCoord?.longitude,
    vehicleBearing,
    isMoving,
    followSuspended,
    mapRef,
  ]);

  const resumeFollow = useCallback(() => {
    setFollowSuspended(false);
  }, []);

  return {
    onMapUserInteraction,
    resumeFollow,
    isFollowing: isMoving && !followSuspended,
  };
}
