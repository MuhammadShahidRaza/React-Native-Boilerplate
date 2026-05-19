import type { RefObject } from 'react';
import { StyleSheet, View } from 'react-native';
import type MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { Icon, Map } from 'components/index';
import { ENV_CONSTANTS, VARIABLES } from 'constants/common';
import { COLORS, fitMapToDirectionCoordinates } from 'utils/index';
import type { MapCoord } from 'utils/coordinateAlongPolyline';

export interface WorkerJobRouteMapProps {
  origin: MapCoord;
  destination: MapCoord;
  mapRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  mapRef: RefObject<MapView | null>;
  vehicleCoord: MapCoord | null;
  onDirectionsReady: (result: {
    coordinates: MapCoord[];
    distance: number;
    duration: number;
    legs?: { steps?: { html_instructions?: string; distance?: { text?: string } }[] }[];
  }) => void;
}

export const WorkerJobRouteMap = ({
  origin,
  destination,
  mapRegion,
  mapRef,
  vehicleCoord,
  onDirectionsReady,
}: WorkerJobRouteMapProps) => (
  <View style={styles.wrap}>
    <Map
      key={`worker-job-${origin.latitude}-${destination.latitude}`}
      mapRef={mapRef}
      region={mapRegion}
      regionTracking='initialOnly'
      scrollEnabled={false}
      showsUserLocationDot={false}
      showCurrentLocation={false}
      showCurrentLocationButton={false}
      mapStyle='light'
      minZoomLevel={0}
      style={styles.map}
    >
      <MapViewDirections
        origin={origin}
        destination={destination}
        apikey={ENV_CONSTANTS.MAP_API_KEY}
        mode='DRIVING'
        precision='high'
        strokeColor='#374151'
        strokeWidth={5}
        lineCap='round'
        lineJoin='round'
        onReady={result => {
          fitMapToDirectionCoordinates(mapRef, result.coordinates, { animated: true });
          onDirectionsReady(result);
        }}
      />
      <Marker coordinate={origin} anchor={{ x: 0.5, y: 0.5 }}>
        <View style={styles.pickupDot} />
      </Marker>
      <Marker coordinate={destination} anchor={{ x: 0.5, y: 1 }}>
        <Icon
          componentName={VARIABLES.MaterialCommunityIcons}
          iconName='map-marker'
          size={32}
          color={COLORS.APP_SECONDARY}
        />
      </Marker>
      {vehicleCoord ? (
        <Marker coordinate={vehicleCoord} anchor={{ x: 0.5, y: 0.5 }} flat>
          <View style={styles.vehicle}>
            <Icon
              componentName={VARIABLES.MaterialCommunityIcons}
              iconName='car-side'
              size={28}
              color={COLORS.APP_SECONDARY}
            />
          </View>
        </Marker>
      ) : null}
    </Map>
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  pickupDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.APP_PRIMARY,
    borderWidth: 3,
    borderColor: COLORS.WHITE,
  },
  vehicle: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 20,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});
