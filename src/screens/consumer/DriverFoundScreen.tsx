import { StyleSheet, View } from 'react-native';
import type MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';
import {
  Button,
  GradientIcon,
  Icon,
  Map,
  MOCK_RIDE_TRIP,
  RideDriverCard,
  RideVehicleStatsRow,
  Wrapper,
} from 'components/index';
import { ENV_CONSTANTS, INITIAL_REGION, VARIABLES } from 'constants/common';
import { COLORS, fitMapToDirectionCoordinates, openPhoneNumber, screenHeight } from 'utils/index';
import { navigate, replace, type RootStackParamList } from 'navigation/index';
import { SCREENS } from 'constants/routes';
import { useMemo, useRef, useState } from 'react';
import { CancelReasonModal } from './CancelReasonModal';
import { cancelSniftBooking } from 'utils/snliftBookingActions';
import MapViewDirections from 'react-native-maps-directions';
import { RouteProp, useRoute } from '@react-navigation/native';

 
export const DriverFoundScreen = () => {
  const [cancelVisible, setCancelVisible] = useState(false);

  const route = useRoute<RouteProp<RootStackParamList, typeof SCREENS.DRIVER_FOUND>>();
  const mapRef = useRef<MapView>(null);

  const { pickupLat, pickupLng, dropoffLat, dropoffLng, bookingId } = route.params ?? {};

  const pickupCoord = useMemo(
    () => ({
      latitude: pickupLat ?? INITIAL_REGION.latitude + 0.008,
      longitude: pickupLng ?? INITIAL_REGION.longitude,
    }),
    [pickupLat, pickupLng],
  );

  const dropoffCoord = useMemo(
    () => ({
      latitude: dropoffLat ?? INITIAL_REGION.latitude - 0.004,
      longitude: dropoffLng ?? INITIAL_REGION.longitude + 0.005,
    }),
    [dropoffLat, dropoffLng],
  );

  const mapRegion = useMemo(
    () => ({
      latitude: (pickupCoord.latitude + dropoffCoord.latitude) / 2,
      longitude: (pickupCoord.longitude + dropoffCoord.longitude) / 2,
      latitudeDelta: Math.abs(pickupCoord.latitude - dropoffCoord.latitude) * 2 + 0.02,
      longitudeDelta: Math.abs(pickupCoord.longitude - dropoffCoord.longitude) * 2 + 0.02,
    }),
    [pickupCoord, dropoffCoord],
  );

  const trackRideParams = useMemo(
    () =>
      ({
        phase: 'arriving' as const,
        pickupLat: pickupCoord.latitude,
        pickupLng: pickupCoord.longitude,
        dropoffLat: dropoffCoord.latitude,
        dropoffLng: dropoffCoord.longitude,
        bookingId,
      }),
    [pickupCoord, dropoffCoord, bookingId],
  );

  return (
    <Wrapper
      headerTitle='Book a Ride'
      showBackButton
       
      useScrollView
      backgroundColor={COLORS.WHITE}
      darkMode={false}
    >
      <View style={styles.mapContainer}>
        <Map
          key={`driver-found-${pickupCoord.latitude}-${pickupCoord.longitude}-${dropoffCoord.latitude}-${dropoffCoord.longitude}`}
          mapRef={mapRef}
          region={mapRegion}
          regionTracking='initialOnly'
          scrollEnabled={false}
          showsUserLocationDot={false}
          showCurrentLocation={false}
          showCurrentLocationButton={false}
          mapStyle='light'
          minZoomLevel={0}
        >
          <MapViewDirections
            key={`dir-${pickupCoord.latitude}-${pickupCoord.longitude}-${dropoffCoord.latitude}-${dropoffCoord.longitude}`}
            origin={pickupCoord}
            destination={dropoffCoord}
            apikey={ENV_CONSTANTS.MAP_API_KEY}
            mode='DRIVING'
            precision='high'
            timePrecision='none'
            resetOnChange
            language='en'
            strokeColor='#374151'
            strokeWidth={5}
            lineCap='round'
            lineJoin='round'
            onReady={result => fitMapToDirectionCoordinates(mapRef, result.coordinates)}
          />
          <Marker
            coordinate={{ latitude: pickupCoord.latitude, longitude: pickupCoord.longitude }}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.pickupMapDot} />
          </Marker>
          <Marker
            coordinate={{ latitude: dropoffCoord.latitude, longitude: dropoffCoord.longitude }}
            anchor={{ x: 0.5, y: 1 }}
          >
            <Icon
              componentName={VARIABLES.MaterialCommunityIcons}
              iconName='map-marker'
              size={30}
              color={COLORS.APP_SECONDARY}
            />
          </Marker>
        </Map>
      </View>

      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <GradientIcon
            componentName={VARIABLES.Entypo}
            iconName='check'
            size={50}
            color={COLORS.WHITE}
            containerSize={88}
            borderRadius={44}
          />
        </View>

        <RideDriverCard
          driverName={MOCK_RIDE_TRIP.driverName}
          rating={MOCK_RIDE_TRIP.rating}
          avatarSource={MOCK_RIDE_TRIP.avatar}
          onPhonePress={() => openPhoneNumber('+237 6 99 99 99 99')}
          onMessagePress={() => navigate(SCREENS.MESSAGES_SOCKET)}
          vehicleModel={MOCK_RIDE_TRIP.vehicleModel}
          vehiclePlate={MOCK_RIDE_TRIP.vehiclePlate}
          showVehicleSection
          variant='elevatedMuted'
          onCancelPress={() => setCancelVisible(true)}
        />

        <RideVehicleStatsRow items={[...MOCK_RIDE_TRIP.vehicleStats]} marginHorizontal={20} />

        <Button title='Track Ride' style={styles.ctaBtn} onPress={() => replace(SCREENS.TRACK_RIDE, trackRideParams)} />
      </View>

      <CancelReasonModal
        visible={cancelVisible}
        onClose={() => setCancelVisible(false)}
        onContinue={async reason => {
          const ok = await cancelSniftBooking(bookingId, reason);
          if (ok) replace(SCREENS.BOOK_RIDE);
          return ok;
        }}
      />
    </Wrapper>
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
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  iconWrap: {
    alignItems: 'center',
    marginBottom: 16,
  },
  ctaBtn: { marginTop: 4, marginHorizontal: 30 },
});
