import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';
import { RouteProp, useRoute } from '@react-navigation/native';
import {
  Button,
  Icon,
  LiveTrackingMapDirections,
  LiveVehicleMapMarker,
  Map,
  RideAnimatedStatusBlock,
  RideDriverCard,
  RideFareSummary,
  RideProgressSegments,
  RideVehicleStatsRow,
  SkeletonWrapper,
  Typography,
  Wrapper,
} from 'components/index';
import { ENV_CONSTANTS, INITIAL_REGION, VARIABLES } from 'constants/common';
import { IMAGES } from 'constants/assets';
import { FontSize, FontWeight } from 'types/fontTypes';
import type { RideTrackPhase } from 'types/rideTracking';
import { COLORS, fitMapToDirectionCoordinates, openPhoneNumber, screenHeight } from 'utils/index';
import { navigateToBookingFirebaseChat } from 'utils/bookingFirebaseChat';
import { showToast } from 'utils/toast';
import { navigate, reset, type RootStackParamList } from 'navigation/index';
import { SCREENS } from 'constants/routes';
import { CancelReasonModal } from './CancelReasonModal';
import { cancelSniftBooking } from 'utils/snliftBookingActions';
import { mapBookingToRideTrip } from 'hooks/useRideTripDisplay';
import { MOCK_RIDE_TRIP } from 'components/common/ride/rideMockTrip';
import { useConsumerBookingTrack } from 'hooks/useConsumerBookingTrack';
import { useThrottledMapCoord } from 'hooks/useThrottledMapCoord';
import { mapRideTrackPhase } from 'utils/bookingTrackPhases';
import { resolveRideDirectionsLeg, rideStatusLabel } from 'utils/rideTrackMap';
import { resolveVehicleMapBearing } from 'utils/vehicleMapBearing';
import type { MapCoord } from 'utils/coordinateAlongPolyline';

const IS_ALPHA = ENV_CONSTANTS.IS_ALPHA_PHASE;

const PROGRESS_PHASE_INDEX: Record<RideTrackPhase, number> = {
  arriving: 0,
  arrived: 1,
  in_progress: 2,
  completed: 3,
};

const ROUTE_STROKE = '#374151';
const ROUTE_STROKE_WIDTH = 5;

function fallbackCoord(
  lat: number | undefined,
  lng: number | undefined,
  latOffset: number,
  lngOffset: number,
): MapCoord {
  return {
    latitude: lat ?? INITIAL_REGION.latitude + latOffset,
    longitude: lng ?? INITIAL_REGION.longitude + lngOffset,
  };
}

export const TrackRideScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, typeof SCREENS.TRACK_RIDE>>();
  const { pickupLat, pickupLng, dropoffLat, dropoffLng, bookingId } = route.params ?? {};

  const track = useConsumerBookingTrack(
    bookingId,
    { pickupLat, pickupLng, dropoffLat, dropoffLng },
    'car',
  );

  const trip = useMemo(() => {
    if (IS_ALPHA) return MOCK_RIDE_TRIP;
    return track.booking ? mapBookingToRideTrip(track.booking) : null;
  }, [track.booking]);
  const tripLoading = IS_ALPHA ? false : track.bookingLoading;

  const mapRef = useRef<MapView>(null);
  const fittedLegRef = useRef<string | null>(null);
  const [cancelVisible, setCancelVisible] = useState(false);
  const [rideRating, setRideRating] = useState(0);
  const [routeCoords, setRouteCoords] = useState<MapCoord[]>([]);
  const directionsOrigin = useThrottledMapCoord(track.providerCoord, 8000, 0.05);

  const pickupCoord = track.pickup ?? fallbackCoord(pickupLat, pickupLng, 0.008, 0);
  const dropoffCoord = track.dropoff ?? fallbackCoord(dropoffLat, dropoffLng, -0.004, 0.005);

  const phase = useMemo((): RideTrackPhase => {
    if (IS_ALPHA) return 'arriving';
    return mapRideTrackPhase(track.status, track.providerCoord, pickupCoord);
  }, [track.status, track.providerCoord, pickupCoord]);

  const directionsLeg = useMemo(
    () => resolveRideDirectionsLeg(phase, pickupCoord, dropoffCoord, directionsOrigin),
    [phase, pickupCoord, dropoffCoord, directionsOrigin],
  );

  useEffect(() => {
    if (!directionsLeg) {
      setRouteCoords([]);
      fittedLegRef.current = null;
    }
  }, [directionsLeg?.legKey]);

  const mapRegion = track.mapRegion ?? {
    latitude: (pickupCoord.latitude + dropoffCoord.latitude) / 2,
    longitude: (pickupCoord.longitude + dropoffCoord.longitude) / 2,
    latitudeDelta: Math.abs(pickupCoord.latitude - dropoffCoord.latitude) * 2 + 0.02,
    longitudeDelta: Math.abs(pickupCoord.longitude - dropoffCoord.longitude) * 2 + 0.02,
  };

  const onDirectionsReady = useCallback(
    (result: { coordinates: MapCoord[] }) => {
      setRouteCoords(result.coordinates);
      const legKey = directionsLeg?.legKey ?? '';
      if (fittedLegRef.current !== legKey) {
        fittedLegRef.current = legKey;
        fitMapToDirectionCoordinates(mapRef, result.coordinates, { animated: true });
      }
    },
    [directionsLeg?.legKey],
  );

  const vehicleBearing = useMemo(
    () => resolveVehicleMapBearing(track.providerCoord, routeCoords, track.providerBearing, 'car'),
    [routeCoords, track.providerCoord, track.providerBearing],
  );

  const recenterPoints = useMemo(() => {
    const points: MapCoord[] = [...routeCoords, pickupCoord, dropoffCoord];
    if (track.providerCoord) points.push(track.providerCoord);
    return points;
  }, [routeCoords, pickupCoord, dropoffCoord, track.providerCoord]);

  const statusCopy = rideStatusLabel(phase, track.status);
  const isCompleted = phase === 'completed';
  const showCar = !isCompleted && Boolean(track.providerCoord);
  const showDropoffPin = phase === 'in_progress' || phase === 'completed';

  const status = useMemo(() => {
    switch (phase) {
      case 'arriving':
        return {
          animationKey: 'arriving',
          iconProps: {
            componentName: VARIABLES.MaterialCommunityIcons,
            iconName: 'car-side',
            size: 38,
            color: COLORS.WHITE,
          },
          title: statusCopy.title,
          subtitle: statusCopy.subtitle,
        } as const;
      case 'arrived':
        return {
          animationKey: 'arrived',
          iconProps: {
            componentName: VARIABLES.MaterialCommunityIcons,
            iconName: 'car-outline',
            size: 38,
            color: COLORS.WHITE,
          },
          title: statusCopy.title,
          subtitle: statusCopy.subtitle,
        } as const;
      case 'in_progress':
        return {
          animationKey: 'trip',
          iconProps: {
            componentName: VARIABLES.Feather,
            iconName: 'send',
            size: 38,
            color: COLORS.WHITE,
          },
          title: statusCopy.title,
          subtitle: statusCopy.subtitle,
        } as const;
      default:
        return {
          animationKey: 'done',
          imageSource: IMAGES.RIDE_CHECK,
          title: statusCopy.title,
          subtitle: statusCopy.subtitle,
        } as const;
    }
  }, [phase, statusCopy]);

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
          key={`track-ride-${bookingId ?? 'local'}-${phase}`}
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
            strokeWidth={ROUTE_STROKE_WIDTH}
            strokeColor={ROUTE_STROKE}
            onReady={onDirectionsReady}
          />
          <Marker coordinate={pickupCoord} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.pickupMapDot} />
          </Marker>
          {showDropoffPin ? (
            <Marker coordinate={dropoffCoord} anchor={{ x: 0.5, y: 1 }}>
              <Icon
                componentName={VARIABLES.MaterialCommunityIcons}
                iconName='map-marker'
                size={30}
                color={COLORS.APP_SECONDARY}
              />
            </Marker>
          ) : null}
          {showCar && track.providerCoord ? (
            <LiveVehicleMapMarker
              coordinate={track.providerCoord}
              bearing={vehicleBearing}
              kind='car'
            />
          ) : null}
        </Map>
      </View>

      <View style={styles.content}>
        <RideProgressSegments stepCount={4} activeSegmentIndex={PROGRESS_PHASE_INDEX[phase]} />

        <RideAnimatedStatusBlock
          animationKey={status.animationKey}
          iconProps={'iconProps' in status ? status.iconProps : undefined}
          imageSource={'imageSource' in status ? status.imageSource : undefined}
          title={status.title}
          subtitle={status.subtitle}
        />

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
          showVehicleSection={!isCompleted && Boolean(trip)}
          variant='elevatedMuted'
          onCancelPress={isCompleted ? undefined : () => setCancelVisible(true)}
        />

        <SkeletonWrapper isLoading={tripLoading && !IS_ALPHA} height={72} count={1}>
          <RideVehicleStatsRow items={trip ? [...trip.vehicleStats] : []} marginHorizontal={20} />
        </SkeletonWrapper>

        <View>
          <RideFareSummary
            fareValue={trip?.estimateFare ?? '—'}
            paymentValue={trip?.paymentMethod ?? 'Cash'}
          />
        </View>

        {isCompleted ? (
          <>
            <View style={styles.rateWrap}>
              <Typography style={styles.rateTitle}>Rate your ride</Typography>
              <View style={styles.rateStars}>
                {[1, 2, 3, 4, 5].map(step => (
                  <Pressable key={step} onPress={() => setRideRating(step)} hitSlop={8}>
                    <Icon
                      componentName={VARIABLES.Ionicons}
                      iconName={step <= rideRating ? 'star' : 'star-outline'}
                      size={50}
                      color={step <= rideRating ? COLORS.APP_STAR : COLORS.APP_LINE}
                    />
                  </Pressable>
                ))}
              </View>
            </View>
            <Button
              title='Done'
              onPress={() => reset(SCREENS.BOTTOM_STACK)}
              style={styles.doneBtn}
            />
          </>
        ) : null}
      </View>

      <CancelReasonModal
        visible={cancelVisible}
        onClose={() => setCancelVisible(false)}
        onContinue={async reason => {
          const ok = await cancelSniftBooking(bookingId, reason);
          if (ok) navigate(SCREENS.BOOK_RIDE);
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
  rateWrap: {
    alignItems: 'center',
    marginBottom: 16,
  },
  rateTitle: {
    marginBottom: 5,
    fontSize: FontSize.ExtraLarge,
    fontWeight: FontWeight.SemiBold,
    color: COLORS.APP_TEXT,
  },
  rateStars: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  doneBtn: {
    marginTop: 16,
  },
});
