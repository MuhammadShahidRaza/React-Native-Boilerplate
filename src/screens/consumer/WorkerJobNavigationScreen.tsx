import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import type MapView from 'react-native-maps';
import {
  AppGradient,
  Button,
  RideDriverCard,
  Typography,
  WorkerJobRouteMap,
  WorkerNavInstructionCard,
  Wrapper,
} from 'components/index';
import { FontSize, FontWeight } from 'types/fontTypes';
import { IMAGES } from 'constants/assets';
import { INITIAL_REGION } from 'constants/common';
import type { RootStackParamList } from 'navigation/Navigators';
import { navigate } from 'navigation/index';
import { SCREENS } from 'constants/routes';
import { BRAND_PRIMARY, BRAND_SECONDARY, COLORS, openMessage, openPhoneNumber, screenHeight } from 'utils/index';
import { useAppSelector } from 'types/reduxTypes';
import { getWorkerRoleCopy } from 'utils/workerRoleCopy';
import { getWorkerRequestDetail } from 'components/common/worker/workerMockData';
import {
  getActiveNavStep,
  parseDirectionSteps,
  useWorkerLiveNavigation,
  type NavStep,
} from 'hooks/useWorkerLiveNavigation';
import type { MapCoord } from 'utils/coordinateAlongPolyline';
import { extrapolatePastEnd, mapCoordDistanceApprox } from 'utils/coordinateAlongPolyline';

type JobPhase = 'pickup' | 'dropoff';

export const WorkerJobNavigationScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, typeof SCREENS.WORKER_JOB_NAVIGATION>>();
  const role = useAppSelector(state => state.user?.role);
  const copy = getWorkerRoleCopy(role);
  const detail = useMemo(
    () => getWorkerRequestDetail(route.params?.requestId ?? '1'),
    [route.params?.requestId],
  );
  const [phase, setPhase] = useState<JobPhase>(route.params?.phase ?? 'pickup');
  const [pickupConfirmed, setPickupConfirmed] = useState(false);
  const mapRef = useRef<MapView>(null);
  const [routeCoords, setRouteCoords] = useState<MapCoord[]>([]);
  const [navSteps, setNavSteps] = useState<NavStep[]>([]);
  const [routeDurationMin, setRouteDurationMin] = useState(5);

  const pickupCoord = useMemo(
    () => ({
      latitude: detail.pickupLat ?? INITIAL_REGION.latitude + 0.008,
      longitude: detail.pickupLng ?? INITIAL_REGION.longitude,
    }),
    [detail.pickupLat, detail.pickupLng],
  );

  const dropoffCoord = useMemo(
    () => ({
      latitude: detail.dropoffLat ?? INITIAL_REGION.latitude - 0.004,
      longitude: detail.dropoffLng ?? INITIAL_REGION.longitude + 0.005,
    }),
    [detail.dropoffLat, detail.dropoffLng],
  );

  const routeOrigin = useMemo(() => {
    if (phase === 'dropoff') return pickupCoord;
    const approach = extrapolatePastEnd(
      dropoffCoord,
      pickupCoord,
      mapCoordDistanceApprox(dropoffCoord, pickupCoord) * 0.12,
    );
    return approach;
  }, [phase, pickupCoord, dropoffCoord]);

  const routeDestination = phase === 'pickup' ? pickupCoord : dropoffCoord;

  const mapRegion = useMemo(
    () => ({
      latitude: (routeOrigin.latitude + routeDestination.latitude) / 2,
      longitude: (routeOrigin.longitude + routeDestination.longitude) / 2,
      latitudeDelta:
        Math.abs(routeOrigin.latitude - routeDestination.latitude) * 2.4 + 0.018,
      longitudeDelta:
        Math.abs(routeOrigin.longitude - routeDestination.longitude) * 2.4 + 0.018,
    }),
    [routeOrigin, routeDestination],
  );

  const live = useWorkerLiveNavigation({
    routeCoords,
    durationMinutes: routeDurationMin,
    enabled: routeCoords.length >= 2,
  });

  const activeStep = useMemo(
    () => getActiveNavStep(navSteps, live.progress),
    [navSteps, live.progress],
  );

  const distanceCaption =
    phase === 'pickup' ? 'Distance to pickup' : 'Distance to drop off';

  const lastCameraAt = useRef(0);
  useEffect(() => {
    if (!live.vehicleCoord || !mapRef.current) return;
    const now = Date.now();
    if (now - lastCameraAt.current < 1800) return;
    lastCameraAt.current = now;
    mapRef.current.animateToRegion(
      {
        ...live.vehicleCoord,
        latitudeDelta: 0.018,
        longitudeDelta: 0.018,
      },
      700,
    );
  }, [live.vehicleCoord]);

  const onDirectionsReady = useCallback(
    (result: {
      coordinates: MapCoord[];
      distance: number;
      duration: number;
      legs?: { steps?: { html_instructions?: string; distance?: { text?: string } }[] }[];
    }) => {
      setRouteCoords(result.coordinates);
      setRouteDurationMin(Math.max(1, Math.round(result.duration)));
      setNavSteps(parseDirectionSteps(result.legs));
    },
    [],
  );

  const primaryCta =
    phase === 'pickup'
      ? pickupConfirmed
        ? copy.startJob
        : copy.arrivedAtPickup
      : copy.completeJob;

  const onPrimaryPress = () => {
    if (phase === 'pickup') {
      if (!pickupConfirmed) {
        setPickupConfirmed(true);
        return;
      }
      setRouteCoords([]);
      setNavSteps([]);
      setPickupConfirmed(false);
      setPhase('dropoff');
      return;
    }
    navigate(SCREENS.WORKER_JOB_COMPLETED, { requestId: detail.id });
  };

  return (
    <Wrapper
    showBackButton={false}
    useScrollView={false}
    backgroundColor={COLORS.TRANSPARENT}
    darkMode={false}
    >
      
    <View style={styles.root}>
      <View style={styles.mapSection}>
        <WorkerJobRouteMap
          origin={routeOrigin}
          destination={routeDestination}
          mapRegion={mapRegion}
          mapRef={mapRef}
          
          vehicleCoord={live.vehicleCoord}
          onDirectionsReady={onDirectionsReady}
        />
        <View style={styles.navOverlay} pointerEvents='box-none'>
          <WorkerNavInstructionCard
            distanceCaption={distanceCaption}
            distanceLabel={live.distanceLabel}
            etaLabel={live.etaLabel}
            step={activeStep}
          />
        </View>
      </View>

      <View style={styles.bottom}>
        <RideDriverCard
          driverName={detail.customerName}
          rating='5.0'
          avatarSource={IMAGES.USER}
          onPhonePress={() => openPhoneNumber('+237 6 99 99 99 99')}
          onMessagePress={() => openMessage('+237 6 99 99 99 99')}
          showVehicleSection={false}
          variant='elevatedWhite'
        />

        {phase === 'dropoff' ? (
          <AppGradient
          colors={[BRAND_SECONDARY, BRAND_PRIMARY]}
          start={{ x: -1, y: -1 }}
          end={{ x: 1, y: -1 }}
          style={styles.headingPill}>
            <Typography style={styles.headingTxt}>
              {copy.headingToDestination(detail.dropoffShortName)}
            </Typography>
          </AppGradient>
        ) : null}

        <Button title={primaryCta} onPress={onPrimaryPress} style={styles.cta} />
      </View>
    </View>
    </Wrapper>

  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  mapSection: {
    height: screenHeight(68),
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  navOverlay: {
    position: 'absolute',
    top: 12,
    left: 16,
    right: 16,
  },
  bottom: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
    justifyContent: 'flex-end',
    paddingBottom: 34,
  },
  headingPill: {
    borderRadius: 50,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginHorizontal: 50,
    alignItems: 'center',
  },
  headingTxt: {
    color: COLORS.WHITE,
    fontWeight: FontWeight.Medium,
    fontSize: FontSize.MediumLarge,
  },
  cta: {
    marginHorizontal: 20,
    backgroundColor: '#21409A',
  },
});
