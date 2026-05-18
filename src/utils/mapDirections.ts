import type { RefObject } from 'react';
import type MapView from 'react-native-maps';

/** Padding when fitting the map to a directions polyline */
export const MAP_DIRECTIONS_EDGE_PADDING = {
  top: 72,
  right: 28,
  bottom: 96,
  left: 28,
};

export function fitMapToDirectionCoordinates(
  mapRef: RefObject<MapView | null>,
  coordinates: { latitude: number; longitude: number }[] | undefined,
  options?: { animated?: boolean },
) {
  if (!coordinates?.length || !mapRef.current) return;
  try {
    mapRef.current.fitToCoordinates(coordinates, {
      edgePadding: MAP_DIRECTIONS_EDGE_PADDING,
      animated: options?.animated ?? false,
    });
  } catch {
    // fitToCoordinates can fail if map not laid out yet
  }
}
