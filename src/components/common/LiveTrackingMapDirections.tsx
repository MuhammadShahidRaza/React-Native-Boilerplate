import MapViewDirections from 'react-native-maps-directions';
import { ENV_CONSTANTS } from 'constants/common';
import type { TrackingDirectionsLeg } from 'utils/trackingDirections';
import type { MapCoord } from 'utils/coordinateAlongPolyline';

type LiveTrackingMapDirectionsProps = {
  leg: TrackingDirectionsLeg | null;
  strokeColor?: string;
  strokeWidth?: number;
  onReady?: (result: { coordinates: MapCoord[]; distance: number; duration: number }) => void;
};

/** Directions from live provider position — clears previous polyline when origin moves. */
export const LiveTrackingMapDirections = ({
  leg,
  strokeColor = '#374151',
  strokeWidth = 5,
  onReady,
}: LiveTrackingMapDirectionsProps) => {
  if (!leg) return null;

  return (
    <MapViewDirections
      key={leg.legKey}
      origin={leg.origin}
      destination={leg.destination}
      apikey={ENV_CONSTANTS.MAP_API_KEY}
      mode='DRIVING'
      precision='high'
      timePrecision='none'
      resetOnChange
      language='en'
      strokeWidth={strokeWidth}
      strokeColor={strokeColor}
      lineCap='round'
      lineJoin='round'
      onReady={onReady}
    />
  );
};
