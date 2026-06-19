import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';
import { RouteProp, useRoute } from '@react-navigation/native';
import {
  Button,
  GradientIcon,
  Icon,
  LiveTrackingMapDirections,
  LiveVehicleMapMarker,
  Map,
  RideDriverCard,
  RideVehicleStatsRow,
  SkeletonWrapper,
  WorkerRequestTimer,
  Wrapper,
} from 'components/index';
import { ENV_CONSTANTS, VARIABLES } from 'constants/common';
import { IMAGES } from 'constants/assets';
import { COLORS, fitMapToDirectionCoordinates, openPhoneNumber, screenHeight } from 'utils/index';
import { navigateToBookingFirebaseChat } from 'utils/bookingFirebaseChat';
import { showToast } from 'utils/toast';
import { replace, type RootStackParamList } from 'navigation/index';
import { SCREENS } from 'constants/routes';
import { CancelReasonModal } from './CancelReasonModal';
import { cancelSniftBooking } from 'utils/snliftBookingActions';
import { useRideTripDisplay } from 'hooks/useRideTripDisplay';
import { useConsumerBookingTrack } from 'hooks/useConsumerBookingTrack';
import { useThrottledMapCoord } from 'hooks/useThrottledMapCoord';
import { resolveRideDirectionsLeg } from 'utils/rideTrackMap';
import { resolveVehicleMapBearing } from 'utils/vehicleMapBearing';
import type { MapCoord } from 'utils/coordinateAlongPolyline';
import { ALPHA_PHASE_DURATION_MS } from 'utils/alphaStatusCycle';

const IS_ALPHA = ENV_CONSTANTS.IS_ALPHA_PHASE;

export const DriverFoundScreen = () => {
  const [cancelVisible, setCancelVisible] = useState(false);
  const [routeCoords, setRouteCoords] = useState<MapCoord[]>([]);
  const route = useRoute<RouteProp<RootStackParamList, typeof SCREENS.DRIVER_FOUND>>();
  const mapRef = useRef<MapView>(null);
  const fittedLegRef = useRef(false);

  const { pickupLat, pickupLng, dropoffLat, dropoffLng, bookingId } = route.params ?? {};
  const { trip, loading: tripLoading } = useRideTripDisplay(bookingId);
  const track = useConsumerBookingTrack(
    bookingId,
    { pickupLat, pickupLng, dropoffLat, dropoffLng },
    'car',
  );
  const directionsOrigin = useThrottledMapCoord(track.providerCoord, 8000, 0.05);

  const pickupCoord = track.pickup ?? {
    latitude: pickupLat ?? 0,
    longitude: pickupLng ?? 0,
  };
  const dropoffCoord = track.dropoff ?? {
    latitude: dropoffLat ?? 0,
    longitude: dropoffLng ?? 0,
  };

  const directionsLeg = useMemo(
    () => resolveRideDirectionsLeg('arriving', pickupCoord, dropoffCoord, directionsOrigin),
    [pickupCoord, dropoffCoord, directionsOrigin],
  );

  const onDirectionsReady = useCallback(
    (result: { coordinates: MapCoord[] }) => {
      setRouteCoords(result.coordinates);
      if (!fittedLegRef.current) {
        fittedLegRef.current = true;
        fitMapToDirectionCoordinates(mapRef, result.coordinates, { animated: true });
      }
    },
    [],
  );

  const mapRegion = track.mapRegion ?? {
    latitude: (pickupCoord.latitude + dropoffCoord.latitude) / 2,
    longitude: (pickupCoord.longitude + dropoffCoord.longitude) / 2,
    latitudeDelta: Math.abs(pickupCoord.latitude - dropoffCoord.latitude) * 2 + 0.02,
    longitudeDelta: Math.abs(pickupCoord.longitude - dropoffCoord.longitude) * 2 + 0.02,
  };

  const vehicleBearing = useMemo(
    () => resolveVehicleMapBearing(track.providerCoord, routeCoords, track.providerBearing, 'car'),
    [routeCoords, track.providerCoord, track.providerBearing],
  );

  const recenterPoints = useMemo(() => {
    const points: MapCoord[] = [...routeCoords, pickupCoord, dropoffCoord];
    if (track.providerCoord) points.push(track.providerCoord);
    return points;
  }, [routeCoords, pickupCoord, dropoffCoord, track.providerCoord]);

  const trackRideParams = useMemo(
    () => ({
      pickupLat: pickupCoord.latitude,
      pickupLng: pickupCoord.longitude,
      dropoffLat: dropoffCoord.latitude,
      dropoffLng: dropoffCoord.longitude,
      bookingId,
    }),
    [pickupCoord, dropoffCoord, bookingId],
  );

  useEffect(() => {
    if (!IS_ALPHA || !bookingId) return;
    const timeoutId = setTimeout(() => {
      replace(SCREENS.TRACK_RIDE, trackRideParams);
    }, ALPHA_PHASE_DURATION_MS);
    return () => clearTimeout(timeoutId);
  }, [bookingId, trackRideParams]);

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
          key={`driver-found-${bookingId ?? 'local'}`}
          mapRef={mapRef}
          region={mapRegion}
          regionTracking='initialOnly'
          scrollEnabled
          showsTraffic
          showRecenterButton
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
            strokeColor='#374151'
            strokeWidth={5}
            onReady={onDirectionsReady}
          />
          <Marker coordinate={pickupCoord} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.pickupMapDot} />
          </Marker>
          <Marker coordinate={dropoffCoord} anchor={{ x: 0.5, y: 1 }}>
            <Icon
              componentName={VARIABLES.MaterialCommunityIcons}
              iconName='map-marker'
              size={30}
              color={COLORS.APP_SECONDARY}
            />
          </Marker>
          {track.providerCoord ? (
            <LiveVehicleMapMarker
              coordinate={track.providerCoord}
              bearing={vehicleBearing}
              kind='car'
            />
          ) : null}
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
          driverName={trip?.driverName ?? '—'}
          rating={trip?.rating ?? '—'}
          avatarSource={trip?.avatar ?? IMAGES.USER}
          onPhonePress={() => {
            if (trip?.providerPhone) {
              openPhoneNumber(trip.providerPhone);
              return;
            }
            showToast({ message: 'Driver phone number is not available.' });
          }}
          onMessagePress={() =>
            navigateToBookingFirebaseChat({
              otherUser: {
                id: trip?.providerId,
                full_name: trip?.driverName,
              },
              bookingId,
            })
          }
          vehicleModel={trip?.vehicleModel ?? '—'}
          vehiclePlate={trip?.vehiclePlate ?? '—'}
          showVehicleSection={Boolean(trip)}
          variant='elevatedMuted'
          onCancelPress={() => setCancelVisible(true)}
        />

        <SkeletonWrapper isLoading={tripLoading && !IS_ALPHA} height={72} count={1}>
          <RideVehicleStatsRow items={trip ? [...trip.vehicleStats] : []} marginHorizontal={20} />
        </SkeletonWrapper>

        {IS_ALPHA ? (
          <WorkerRequestTimer seconds={3} active />
        ) : null}

        <Button
          title='Track Ride'
          style={styles.ctaBtn}
          onPress={() => replace(SCREENS.TRACK_RIDE, trackRideParams)}
        />
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
