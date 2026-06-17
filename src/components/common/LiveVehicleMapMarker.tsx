import { useEffect, useRef, useState } from 'react';
import { Platform, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { IMAGES } from 'constants/assets';
import type { MapCoord } from 'utils/coordinateAlongPolyline';
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

function shortestBearingDelta(from: number, to: number): number {
  const delta = ((to - from + 540) % 360) - 180;
  return from + delta;
}

/** Live vehicle marker — coordinate updates directly (avoids Android animateMarkerToCoordinate NPE). */
export const LiveVehicleMapMarker = ({
  coordinate,
  bearing = 0,
  kind,
}: LiveVehicleMapMarkerProps) => {
  const prevBearingRef = useRef(bearing);
  const [displayBearing, setDisplayBearing] = useState(bearing);

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
        coordinate={coordinate}
        anchor={{ x: 0.5, y: 0.5 }}
        rotation={displayBearing}
        flat
        image={MARKER_IMAGE[kind]}
        tracksViewChanges={false}
      />
    );
  }

  return (
    <Marker coordinate={coordinate} anchor={{ x: 0.5, y: 0.5 }} flat tracksViewChanges={false}>
      <View style={{ transform: [{ rotate: `${displayBearing}deg` }] }}>
        <MapVehicleMarker kind={kind} />
      </View>
    </Marker>
  );
};
