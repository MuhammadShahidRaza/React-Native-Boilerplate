import { useEffect, useRef, useState } from 'react';
import { Platform, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { IMAGES } from 'constants/assets';
import type { MapCoord } from 'utils/coordinateAlongPolyline';
import { MapVehicleMarker, type MapVehicleMarkerKind } from './MapVehicleMarker';

const MARKER_IMAGES = {
  car: IMAGES.MAP_DRIVER_CAR,
  bike: IMAGES.MAP_COURIER_BIKE,
} as const;

const MARKER_SIZE = {
  car: 36,
  bike: 40,
} as const;

type LiveVehicleMapMarkerProps = {
  coordinate: MapCoord;
  bearing?: number;
  kind: MapVehicleMarkerKind;
};

function shortestBearingDelta(from: number, to: number): number {
  const delta = ((to - from + 540) % 360) - 180;
  return from + delta;
}

/**
 * Live vehicle marker on map.
 * Android (New Architecture): native `image` + `rotation` — custom children fail to rasterize.
 * iOS: rotated custom view with explicit size and onLoad snapshot.
 */
export const LiveVehicleMapMarker = ({
  coordinate,
  bearing = 0,
  kind,
}: LiveVehicleMapMarkerProps) => {
  const prevBearingRef = useRef(bearing);
  const [displayBearing, setDisplayBearing] = useState(bearing);
  const [tracksViewChanges, setTracksViewChanges] = useState(true);

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

  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    setTracksViewChanges(true);
    const id = setTimeout(() => setTracksViewChanges(false), 500);
    return () => clearTimeout(id);
  }, [coordinate.latitude, coordinate.longitude, kind, Math.round(displayBearing)]);

  if (Platform.OS === 'android') {
    return (
      <Marker
        coordinate={coordinate}
        anchor={{ x: 0.5, y: 0.5 }}
        flat
        rotation={displayBearing}
        image={MARKER_IMAGES[kind]}
        zIndex={1000}
      />
    );
  }

  const size = MARKER_SIZE[kind];

  return (
    <Marker
      coordinate={coordinate}
      anchor={{ x: 0.5, y: 0.5 }}
      flat
      tracksViewChanges={tracksViewChanges}
      zIndex={1000}
    >
      <View
        collapsable={false}
        style={{
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ rotate: `${displayBearing}deg` }],
        }}
      >
        <MapVehicleMarker
          kind={kind}
          onLoad={() => setTracksViewChanges(false)}
        />
      </View>
    </Marker>
  );
};
