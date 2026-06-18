import type { MapVehicleMarkerKind } from 'components/common/MapVehicleMarker';
import { getVehicleMarkerHeading } from 'hooks/useWorkerGpsNavigation';
import { bearingAlongPolyline, type MapCoord } from 'utils/coordinateAlongPolyline';

/** Road-aligned marker rotation — prefers route polyline bearing over raw GPS heading. */
export function resolveVehicleMapBearing(
  coord: MapCoord | null | undefined,
  routeCoords: MapCoord[],
  gpsBearing: number,
  kind: MapVehicleMarkerKind = 'car',
): number {
  if (coord && routeCoords.length >= 2) {
    const routeBearing = bearingAlongPolyline(routeCoords, coord);
    if (routeBearing != null) {
      return getVehicleMarkerHeading(routeBearing, kind);
    }
  }
  return gpsBearing;
}
