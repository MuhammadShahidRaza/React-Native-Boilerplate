import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';
import { RouteProp, useRoute } from '@react-navigation/native';
import MapViewDirections from 'react-native-maps-directions';
import {
  Button,
  Icon,
  Map,
  MapVehicleMarker,
  MOCK_RIDE_TRIP,
  RideAnimatedStatusBlock,
  RideDriverCard,
  RideFareSummary,
  RideProgressSegments,
  RideVehicleStatsRow,
  Typography,
  Wrapper,
} from 'components/index';
import { ENV_CONSTANTS, INITIAL_REGION, VARIABLES } from 'constants/common';
import { IMAGES } from 'constants/assets';
import { FontSize, FontWeight } from 'types/fontTypes';
import type { RideTrackPhase } from 'types/rideTracking';
import {
  COLORS,
  coordinateAlongPolyline,
  extrapolatePastEnd,
  fitMapToDirectionCoordinates,
  interpolateMapCoord,
  mapCoordDistanceApprox,
  openPhoneNumber,
  screenHeight,
} from 'utils/index';
import type { RootStackParamList } from 'navigation/index';
import { navigate, reset } from 'navigation/index';
import { SCREENS } from 'constants/routes';
import { CancelReasonModal } from './CancelReasonModal';
import { cancelSniftBooking } from 'utils/snliftBookingActions';

 
const PROGRESS_PHASE_INDEX: Record<RideTrackPhase, number> = {
  arriving: 0,
  arrived: 1,
  in_progress: 2,
  completed: 3,
};

type MapCoord = { latitude: number; longitude: number };

/** Road-facing route line (Directions API polyline); matches ride mock grey path */
const ROUTE_STROKE = '#374151';
const ROUTE_STROKE_WIDTH = 5;

const PHASE_AUTO_MS: Record<Exclude<RideTrackPhase, 'completed'>, number> = {
  arriving: 5500,
  arrived: 4000,
  in_progress: 9500,
};

export const TrackRideScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, typeof SCREENS.TRACK_RIDE>>();
  const { pickupLat, pickupLng, dropoffLat, dropoffLng, phase: phaseParam, bookingId } =
    route.params ?? {};
  const tripKey = `${pickupLat}-${pickupLng}-${dropoffLat}-${dropoffLng}`;
  const tripKeyRef = useRef(tripKey);

  const [phase, setPhase] = useState<RideTrackPhase>(() => phaseParam ?? 'arriving');

  const mapRef = useRef<MapView>(null);
  const [cancelVisible, setCancelVisible] = useState(false);
  const [rideRating, setRideRating] = useState(0);
  const [routeCoords, setRouteCoords] = useState<MapCoord[]>([]);
  const [carCoord, setCarCoord] = useState<MapCoord | null>(null);

  const pickupCoord = useMemo(
    () =>
      ({
        latitude: pickupLat ?? INITIAL_REGION.latitude + 0.008,
        longitude: pickupLng ?? INITIAL_REGION.longitude,
      }) satisfies MapCoord,
    [pickupLat, pickupLng],
  );

  const dropoffCoord = useMemo(
    () =>
      ({
        latitude: dropoffLat ?? INITIAL_REGION.latitude - 0.004,
        longitude: dropoffLng ?? INITIAL_REGION.longitude + 0.005,
      }) satisfies MapCoord,
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

  const onDirectionsReady = useCallback((result: { coordinates: MapCoord[] }) => {
    setRouteCoords(result.coordinates);
    fitMapToDirectionCoordinates(mapRef, result.coordinates, { animated: true });
  }, []);

  useEffect(() => {
    if (tripKeyRef.current !== tripKey) {
      tripKeyRef.current = tripKey;
      setPhase(phaseParam ?? 'arriving');
      setRouteCoords([]);
      setRideRating(0);
    }
  }, [tripKey, phaseParam]);

  useEffect(() => {
    if (phase === 'completed') return undefined;
    const ms = PHASE_AUTO_MS[phase];
    const tid = setTimeout(() => {
      setPhase(curr => {
        if (curr === 'arriving') return 'arrived';
        if (curr === 'arrived') return 'in_progress';
        if (curr === 'in_progress') return 'completed';
        return curr;
      });
    }, ms);
    return () => clearTimeout(tid);
  }, [phase]);

  useEffect(() => {
    if (phase === 'completed') {
      setCarCoord(null);
      return undefined;
    }
    let raf = 0;

    const loop = () => {
      const t = Date.now() / 1000;

      if (phase === 'arrived') {
        setCarCoord(pickupCoord);
      } else if (routeCoords.length >= 2) {
        const wave = (Math.sin(t * Math.PI * 2 * 0.22) + 1) / 2;

        if (phase === 'arriving') {
          const pickupOnPath = routeCoords[0];
          const inward = routeCoords[1];
          const approachFrom = extrapolatePastEnd(
            inward,
            pickupOnPath,
            mapCoordDistanceApprox(inward, pickupOnPath) * 1.35,
          );
          const along = interpolateMapCoord(approachFrom, pickupOnPath, 0.12 + wave * 0.86);
          setCarCoord(along);
        } else if (phase === 'in_progress') {
          const alongRoute = coordinateAlongPolyline(routeCoords, 0.08 + wave * 0.84);
          setCarCoord(alongRoute);
        }
      } else {
        const fallbackWave = (Math.sin(t * Math.PI * 2 * 0.22) + 1) / 2;
        if (phase === 'arriving') {
          setCarCoord(interpolateMapCoord(pickupCoord, dropoffCoord, 0.04 + fallbackWave * 0.1));
        } else if (phase === 'in_progress') {
          setCarCoord(interpolateMapCoord(pickupCoord, dropoffCoord, 0.1 + fallbackWave * 0.75));
        }
      }

      raf = requestAnimationFrame(loop);
    };

    loop();
    return () => cancelAnimationFrame(raf);
  }, [phase, pickupCoord, dropoffCoord, routeCoords]);

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
          title: 'Driver is arriving',
          subtitle: 'Estimated arrival in 3 min',
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
          title: 'Driver has arrived',
          subtitle: 'The driver is waiting',
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
          title: 'Ride in progress',
          subtitle: 'Enjoy your ride!',
        } as const;
      default:
        return {
          animationKey: 'done',
          imageSource: IMAGES.RIDE_CHECK,
          title: 'Ride Completed',
          subtitle: 'Thank you for riding with us',
        } as const;
    }
  }, [phase]);

  const isCompleted = phase === 'completed';

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
          key={`track-ride-${pickupCoord.latitude}-${pickupCoord.longitude}-${dropoffCoord.latitude}-${dropoffCoord.longitude}`}
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
            key={`dir-${tripKey}`}
            origin={pickupCoord}
            destination={dropoffCoord}
            apikey={ENV_CONSTANTS.MAP_API_KEY}
            mode='DRIVING'
            precision='high'
            timePrecision='none'
            resetOnChange
            language='en'
            strokeWidth={ROUTE_STROKE_WIDTH}
            strokeColor={ROUTE_STROKE}
            lineCap='round'
            lineJoin='round'
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
          {carCoord ? (
            <Marker coordinate={carCoord} anchor={{ x: 0.5, y: 0.5 }}>
              <MapVehicleMarker kind='car' />
            </Marker>
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
          driverName={MOCK_RIDE_TRIP.driverName}
          rating={MOCK_RIDE_TRIP.rating}
          avatarSource={MOCK_RIDE_TRIP.avatar}
          onPhonePress={() => openPhoneNumber('+237 6 99 99 99 99')}
          onMessagePress={() => navigate(SCREENS.MESSAGES_SOCKET)}
          vehicleModel={MOCK_RIDE_TRIP.vehicleModel}
          vehiclePlate={MOCK_RIDE_TRIP.vehiclePlate}
          showVehicleSection={!isCompleted}
          variant='elevatedMuted'
          onCancelPress={isCompleted ? undefined : () => setCancelVisible(true)}
        />

        <RideVehicleStatsRow items={[...MOCK_RIDE_TRIP.vehicleStats]} marginHorizontal={20} />

        <View>
          <RideFareSummary
            fareValue={MOCK_RIDE_TRIP.estimateFare}
            paymentValue={MOCK_RIDE_TRIP.paymentMethod}
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
              onPress={() => {
                reset(SCREENS.BOTTOM_STACK);
              }}
              style={styles.doneBtn}
            />
          </>
        ) : null}
      </View>

      <CancelReasonModal
        visible={cancelVisible}
        onClose={() => setCancelVisible(false)}
        onContinue={async reason => {
          setCancelVisible(false);
          const ok = await cancelSniftBooking(bookingId, reason);
          if (ok) navigate(SCREENS.BOOK_RIDE);
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
