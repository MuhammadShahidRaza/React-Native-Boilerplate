import type { RefObject } from 'react';
import { StyleSheet, View } from 'react-native';
import type MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { Icon, LiveVehicleMapMarker, Map, type MapVehicleMarkerKind } from 'components/index';
import { ENV_CONSTANTS, VARIABLES } from 'constants/common';
import { COLORS, fitMapToDirectionCoordinates } from 'utils/index';
import type { MapCoord } from 'utils/coordinateAlongPolyline';

export interface WorkerJobRouteMapProps {
  /** Google Directions API origin — stable per leg (not live GPS). */
  directionsOrigin: MapCoord;
  directionsDestination: MapCoord;
  /** Remount directions when leg changes (`pickup` → `dropoff`). */
  routeLegKey: string;
  pickupCoord: MapCoord;
  dropoffCoord: MapCoord;
  phase: 'pickup' | 'dropoff';
  mapRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  mapRef: RefObject<MapView | null>;
  vehicleCoord: MapCoord | null;
  vehicleBearing?: number;
  vehicleMarkerKind?: MapVehicleMarkerKind;
  scrollEnabled?: boolean;
  showsTraffic?: boolean;
  showRecenterButton?: boolean;
  recenterPoints?: MapCoord[];
  onMapUserInteraction?: () => void;
  onRecenterPress?: () => void;
  onDirectionsReady: (result: {
    coordinates: MapCoord[];
    distance: number;
    duration: number;
    legs?: { steps?: { html_instructions?: string; distance?: { text?: string } }[] }[];
  }) => void;
}

export const WorkerJobRouteMap = ({
  directionsOrigin,
  directionsDestination,
  routeLegKey,
  pickupCoord,
  dropoffCoord,
  phase,
  mapRegion,
  mapRef,
  vehicleCoord,
  vehicleBearing = 0,
  vehicleMarkerKind = 'car',
  scrollEnabled = true,
  showsTraffic = true,
  showRecenterButton = true,
  recenterPoints = [],
  onMapUserInteraction,
  onRecenterPress,
  onDirectionsReady,
}: WorkerJobRouteMapProps) => (
  <View style={styles.wrap}>
    <Map
      key={`worker-job-${routeLegKey}`}
      mapRef={mapRef}
      region={mapRegion}
      regionTracking='initialOnly'
      scrollEnabled={scrollEnabled}
      showsTraffic={showsTraffic}
      showRecenterButton={showRecenterButton}
      recenterPoints={recenterPoints}
      recenterIncludeUserLocation
      onRecenterPress={onRecenterPress}
      onMapUserInteraction={onMapUserInteraction}
      showsUserLocationDot={false}
      showCurrentLocation={false}
      showCurrentLocationButton={false}
      mapStyle='light'
      minZoomLevel={0}
      style={styles.map}
    >
      <MapViewDirections
        origin={directionsOrigin}
        destination={directionsDestination}
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
      <Marker coordinate={pickupCoord} anchor={{ x: 0.5, y: 0.5 }}>
        <View style={styles.pickupDot} />
      </Marker>
      {phase === 'dropoff' ? (
        <Marker coordinate={dropoffCoord} anchor={{ x: 0.5, y: 1 }}>
          <Icon
            componentName={VARIABLES.MaterialCommunityIcons}
            iconName='map-marker'
            size={32}
            color={COLORS.APP_SECONDARY}
          />
        </Marker>
      ) : null}
      {vehicleCoord ? (
        <LiveVehicleMapMarker
          coordinate={vehicleCoord}
          bearing={vehicleBearing}
          kind={vehicleMarkerKind}
        />
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
});
