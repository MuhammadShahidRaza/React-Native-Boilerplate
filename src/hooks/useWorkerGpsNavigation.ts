import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MutableRefObject } from 'react';
import Geolocation, { type GeolocationResponse } from '@react-native-community/geolocation';
import {
  bearingBetweenCoords,
  mapCoordDistanceApprox,
  type MapCoord,
} from 'utils/coordinateAlongPolyline';
import { haversineDistanceKm } from 'utils/distance';
import { logger } from 'utils/logger';
import {
  computeRemainingEtaMinutes,
  getActiveNavStep,
  navProgressForPosition,
  type NavStep,
  type WorkerRouteMetrics,
} from 'utils/workerNavigation';

/** Top-down car asset faces east in PNG — adjust if icon still looks off. */
const CAR_MARKER_HEADING_OFFSET = -90;
const BIKE_MARKER_HEADING_OFFSET = 0;
const MIN_MOVE_FOR_BEARING = 0.000012;
const MOVING_SPEED_MPS = 0.8;
const STATIONARY_AFTER_MS = 7000;

function touchMoving(
  setIsMoving: (v: boolean) => void,
  timerRef: MutableRefObject<ReturnType<typeof setTimeout> | null>,
) {
  setIsMoving(true);
  if (timerRef.current) clearTimeout(timerRef.current);
  timerRef.current = setTimeout(() => setIsMoving(false), STATIONARY_AFTER_MS);
}

export function getVehicleMarkerHeading(
  bearing: number,
  kind: 'car' | 'bike' = 'car',
): number {
  const offset = kind === 'bike' ? BIKE_MARKER_HEADING_OFFSET : CAR_MARKER_HEADING_OFFSET;
  return (bearing + offset + 360) % 360;
}

function applyGpsUpdate(
  coord: MapCoord,
  position: GeolocationResponse,
  vehicleKind: 'car' | 'bike',
  prevCoordRef: MutableRefObject<MapCoord | null>,
  setVehicleCoord: (c: MapCoord) => void,
  setVehicleBearing: (b: number) => void,
) {
  setVehicleCoord(coord);

  const deviceHeading = position.coords.heading;
  const speed = position.coords.speed ?? 0;
  const prev = prevCoordRef.current;
  const moved = prev != null && mapCoordDistanceApprox(prev, coord) > MIN_MOVE_FOR_BEARING;

  if (deviceHeading != null && deviceHeading >= 0 && speed > 0.8) {
    setVehicleBearing(getVehicleMarkerHeading(deviceHeading, vehicleKind));
  } else if (moved && prev) {
    setVehicleBearing(getVehicleMarkerHeading(bearingBetweenCoords(prev, coord), vehicleKind));
  }

  if (moved || !prev) {
    prevCoordRef.current = coord;
  }
}

export function useWorkerGpsNavigation({
  routeCoords,
  destinationCoord,
  routeMetrics,
  navSteps,
  enabled,
  vehicleKind = 'car',
}: {
  routeCoords: MapCoord[];
  destinationCoord: MapCoord;
  routeMetrics: WorkerRouteMetrics;
  navSteps: NavStep[];
  enabled: boolean;
  vehicleKind?: 'car' | 'bike';
}) {
  const [vehicleCoord, setVehicleCoord] = useState<MapCoord | null>(null);
  const [vehicleBearing, setVehicleBearing] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const prevCoordRef = useRef<MapCoord | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const stationaryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePosition = useCallback(
    (position: GeolocationResponse) => {
      const coord = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      const prev = prevCoordRef.current;
      const moved = prev != null && mapCoordDistanceApprox(prev, coord) > MIN_MOVE_FOR_BEARING;
      const speed = position.coords.speed ?? 0;

      applyGpsUpdate(
        coord,
        position,
        vehicleKind,
        prevCoordRef,
        setVehicleCoord,
        setVehicleBearing,
      );

      if (speed > MOVING_SPEED_MPS || moved) {
        touchMoving(setIsMoving, stationaryTimerRef);
      }
    },
    [vehicleKind],
  );

  useEffect(() => {
    if (!enabled) return undefined;

    Geolocation.getCurrentPosition(
      position => {
        handlePosition(position);
      },
      error => logger.error('useWorkerGpsNavigation initial position error:', error),
      { timeout: 15000, maximumAge: 5000 },
    );

    watchIdRef.current = Geolocation.watchPosition(
      position => {
        handlePosition(position);
      },
      error => {
        logger.error('useWorkerGpsNavigation watch error:', error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 5,
        interval: 4000,
        fastestInterval: 2000,
        useSignificantChanges: false,
      },
    );

    return () => {
      if (watchIdRef.current != null) {
        Geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (stationaryTimerRef.current) {
        clearTimeout(stationaryTimerRef.current);
        stationaryTimerRef.current = null;
      }
    };
  }, [enabled, vehicleKind, handlePosition]);

  const progress = useMemo(
    () => navProgressForPosition(routeCoords, vehicleCoord),
    [vehicleCoord, routeCoords],
  );

  const distanceRemainingKm = useMemo(() => {
    if (vehicleCoord) {
      return haversineDistanceKm(
        vehicleCoord.latitude,
        vehicleCoord.longitude,
        destinationCoord.latitude,
        destinationCoord.longitude,
      );
    }
    return Math.max(0.1, routeMetrics.distanceKm);
  }, [vehicleCoord, destinationCoord, routeMetrics.distanceKm]);

  const etaMinutes = useMemo(
    () => computeRemainingEtaMinutes(routeMetrics, distanceRemainingKm),
    [routeMetrics, distanceRemainingKm],
  );

  const activeStep = useMemo(
    () => getActiveNavStep(navSteps, progress),
    [navSteps, progress],
  );

  return {
    progress,
    vehicleCoord,
    vehicleBearing,
    isMoving,
    distanceRemainingKm,
    etaMinutes,
    distanceLabel: `${distanceRemainingKm.toFixed(1)} km`,
    etaLabel: `${etaMinutes} min`,
    activeStep,
  };
}
