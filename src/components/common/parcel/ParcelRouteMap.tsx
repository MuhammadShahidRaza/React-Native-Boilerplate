import type { ReactNode, RefObject } from 'react';
import { StyleSheet, View } from 'react-native';
import type MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { Icon } from '../Icon';
import { Map } from '../Map';
import { ENV_CONSTANTS, VARIABLES } from 'constants/common';
import { COLORS, fitMapToDirectionCoordinates, screenHeight } from 'utils/index';
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
  onDirectionsReady?: (coordinates: MapCoord[]) => void;
  children?: ReactNode;
}

/** Book-a-ride style route map: curved directions, pickup dot, dropoff pin. */
export const ParcelRouteMap = ({
  pickup,
  dropoff,
  mapRegion,
  mapRef,
  scrollEnabled = false,
  onDirectionsReady,
  children,
}: ParcelRouteMapProps) => (
  <View style={styles.mapContainer}>
    <Map
      key={`parcel-route-${pickup.latitude}-${pickup.longitude}-${dropoff.latitude}-${dropoff.longitude}`}
      mapRef={mapRef}
      region={mapRegion}
      regionTracking='initialOnly'
      scrollEnabled={scrollEnabled}
      showsUserLocationDot={false}
      showCurrentLocation={false}
      showCurrentLocationButton={false}
      mapStyle='light'
      minZoomLevel={0}
    >
      <MapViewDirections
        origin={pickup}
        destination={dropoff}
        apikey={ENV_CONSTANTS.MAP_API_KEY}
        mode='DRIVING'
        precision='high'
        strokeColor={COLORS.APP_PRIMARY}
        strokeWidth={4}
        lineCap='round'
        lineJoin='round'
        onReady={result => {
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
