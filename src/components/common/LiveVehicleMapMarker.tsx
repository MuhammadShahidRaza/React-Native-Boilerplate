import { useEffect, useRef, useState } from 'react';
import { Platform, View } from 'react-native';
import { AnimatedRegion, Marker, MarkerAnimated } from 'react-native-maps';
import type { MapMarker } from 'react-native-maps';
import { IMAGES } from 'constants/assets';
import { mapCoordDistanceApprox, type MapCoord } from 'utils/coordinateAlongPolyline';
import { MapVehicleMarker, type MapVehicleMarkerKind } from './MapVehicleMarker';

type LiveVehicleMapMarkerProps = {
  coordinate: MapCoord;
  bearing?: number;
  kind: MapVehicleMarkerKind;
};

const MARKER_IMAGE: Record<MapVehicleMarkerKind, number> = {
  car: IMAGES.MAP_DRIVER_CAR,
  bike: IMAGES.MAP_COURIER_BIKE,
};

const MIN_ANIM_MS = 600;
const MAX_ANIM_MS = 2200;

function moveDurationMs(from: MapCoord | null, to: MapCoord): number {
  if (!from) return 0;
  const dist = mapCoordDistanceApprox(from, to);
  return Math.min(MAX_ANIM_MS, Math.max(MIN_ANIM_MS, dist * 900000));
}

function shortestBearingDelta(from: number, to: number): number {
  let delta = ((to - from + 540) % 360) - 180;
  return from + delta;
}

/** Smoothly animated vehicle marker — Android uses native glide; iOS uses AnimatedRegion. */
export const LiveVehicleMapMarker = ({
  coordinate,
  bearing = 0,
  kind,
}: LiveVehicleMapMarkerProps) => {
  const markerRef = useRef<MapMarker | null>(null);
  const prevCoordRef = useRef<MapCoord>(coordinate);
  const prevBearingRef = useRef(bearing);
  const [androidCoord, setAndroidCoord] = useState(coordinate);
  const [displayBearing, setDisplayBearing] = useState(bearing);
  const coordAnim = useRef(
    new AnimatedRegion({
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      latitudeDelta: 0,
      longitudeDelta: 0,
    }),
  ).current;

  useEffect(() => {
    const prev = prevCoordRef.current;
    const duration = moveDurationMs(prev, coordinate);

    if (Platform.OS === 'android') {
      if (duration > 0 && markerRef.current?.animateMarkerToCoordinate) {
        markerRef.current.animateMarkerToCoordinate(coordinate, duration);
      } else {
        setAndroidCoord(coordinate);
      }
    } else if (duration > 0) {
      coordAnim
        .timing({
          latitude: coordinate.latitude,
          longitude: coordinate.longitude,
          duration,
          useNativeDriver: false,
        })
        .start();
    } else {
      coordAnim.setValue({
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        latitudeDelta: 0,
        longitudeDelta: 0,
      });
    }

    prevCoordRef.current = coordinate;
  }, [coordinate.latitude, coordinate.longitude, coordAnim]);

  useEffect(() => {
    const from = prevBearingRef.current;
    const to = shortestBearingDelta(from, bearing);
    prevBearingRef.current = to;

    const start = Date.now();
    const duration = 350;
    let frameId = 0;

    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / duration);
      const eased = t * (2 - t);
      setDisplayBearing(from + (to - from) * eased);
      if (t < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [bearing]);

  if (Platform.OS === 'android') {
    return (
      <Marker
        ref={markerRef}
        coordinate={androidCoord}
        anchor={{ x: 0.5, y: 0.5 }}
        rotation={displayBearing}
        flat
        image={MARKER_IMAGE[kind]}
      />
    );
  }

  return (
    <MarkerAnimated coordinate={coordAnim} anchor={{ x: 0.5, y: 0.5 }} flat>
      <View style={{ transform: [{ rotate: `${displayBearing}deg` }] }}>
        <MapVehicleMarker kind={kind} />
      </View>
    </MarkerAnimated>
  );
};
