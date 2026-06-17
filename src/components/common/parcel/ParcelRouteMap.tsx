import { useMemo, useState, type ReactNode, type RefObject } from 'react';
import { StyleSheet, View } from 'react-native';
import type MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';
import { Icon } from '../Icon';
import { LiveTrackingMapDirections } from '../LiveTrackingMapDirections';
import { Map } from '../Map';
import { VARIABLES } from 'constants/common';
import { COLORS, fitMapToDirectionCoordinates, screenHeight } from 'utils/index';
import type { TrackingDirectionsLeg } from 'utils/trackingDirections';
import type { MapCoord } from 'utils/parcelTripCoords';

export interface ParcelRouteMapProps {
  pickup: MapCoord;
  dropoff: MapCoord;
  mapRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  mapRef?: RefObject<MapView | null>;
  scrollEnabled?: boolean;
  showsTraffic?: boolean;
  showRecenterButton?: boolean;
  /** Live route from courier/driver GPS — when null, no line until location is available. */
  directionsLeg?: TrackingDirectionsLeg | null;
  /** Live courier/driver position — included when recentering. */
  extraRecenterPoints?: (MapCoord | null | undefined)[];
  onDirectionsReady?: (coordinates: MapCoord[]) => void;
  children?: ReactNode;
}

/** Book-a-ride style route map: curved directions, pickup dot, dropoff pin. */
export const ParcelRouteMap = ({
  pickup,
  dropoff,
  mapRegion,
  mapRef,
  scrollEnabled = true,
  showsTraffic = true,
  showRecenterButton = true,
  directionsLeg = null,
  extraRecenterPoints = [],
  onDirectionsReady,
  children,
}: ParcelRouteMapProps) => {
  const [routeCoords, setRouteCoords] = useState<MapCoord[]>([]);

  const recenterPoints = useMemo(() => {
    const extras = extraRecenterPoints.filter(
      (c): c is MapCoord => c != null && Number.isFinite(c.latitude) && Number.isFinite(c.longitude),
    );
    return [...routeCoords, pickup, dropoff, ...extras];
  }, [routeCoords, pickup, dropoff, extraRecenterPoints]);

  return (
    <View style={styles.mapContainer}>
      <Map
        key={`parcel-route-${pickup.latitude}-${pickup.longitude}-${dropoff.latitude}-${dropoff.longitude}`}
        mapRef={mapRef}
        region={mapRegion}
        regionTracking='initialOnly'
        scrollEnabled={scrollEnabled}
        showsTraffic={showsTraffic}
        showRecenterButton={showRecenterButton}
        recenterPoints={recenterPoints}
        recenterIncludeUserLocation
        showsUserLocationDot={false}
        showCurrentLocation={false}
        showCurrentLocationButton={false}
        mapStyle='light'
        minZoomLevel={0}
      >
        <LiveTrackingMapDirections
          leg={directionsLeg}
          strokeColor={COLORS.APP_PRIMARY}
          strokeWidth={4}
          onReady={result => {
            setRouteCoords(result.coordinates);
            if (mapRef) {
              fitMapToDirectionCoordinates(mapRef, result.coordinates, { animated: true });
            }
            onDirectionsReady?.(result.coordinates);
          }}
        />
        <Marker coordinate={pickup} anchor={{ x: 0.5, y: 0.5 }}>
          <View style={styles.pickupMapDot} />
        </Marker>
        <Marker coordinate={dropoff} anchor={{ x: 0.5, y: 1 }}>
          <Icon
            componentName={VARIABLES.MaterialCommunityIcons}
            iconName='map-marker'
            size={30}
            color={COLORS.APP_SECONDARY}
          />
        </Marker>
        {children}
      </Map>
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    height: screenHeight(40),
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    overflow: 'hidden',
    marginBottom: 4,
  },
  pickupMapDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.APP_PRIMARY,
    borderWidth: 2,
    borderColor: COLORS.WHITE,
  },
});
