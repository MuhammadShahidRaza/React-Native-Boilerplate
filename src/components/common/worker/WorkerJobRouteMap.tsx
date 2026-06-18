import type { RefObject } from 'react';
import { StyleSheet, View } from 'react-native';
import type MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';
import { Icon, LiveTrackingMapDirections, LiveVehicleMapMarker, Map, type MapVehicleMarkerKind } from 'components/index';
import { VARIABLES } from 'constants/common';
import { COLORS } from 'utils/index';
import type { TrackingDirectionsLeg } from 'utils/trackingDirections';
import type { MapCoord } from 'utils/coordinateAlongPolyline';

export interface WorkerJobRouteMapProps {
  directionsLeg: TrackingDirectionsLeg;
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
  directionsLeg,
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
      key={`worker-job-${directionsLeg.legKey}`}
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
      <LiveTrackingMapDirections
        leg={directionsLeg}
        strokeColor='#374151'
        strokeWidth={5}
        onReady={onDirectionsReady}
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
