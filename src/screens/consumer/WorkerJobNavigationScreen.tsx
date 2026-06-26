import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type MapView from 'react-native-maps';
import {
  AppGradient,
  AppStatusModal,
  Button,
  GRADIENT_END,
  GRADIENT_START,
  GradientIcon,
  RideDriverCard,
  Typography,
  WorkerJobRouteMap,
  WorkerNavInstructionCard,
  Wrapper,
} from 'components/index';
import { FontSize, FontWeight } from 'types/fontTypes';
import { IMAGES } from 'constants/assets';
import { ENV_CONSTANTS, VARIABLES } from 'constants/common';
import type { RootStackParamList } from 'navigation/Navigators';
import { CustomBackIcon, navigate, reset, resetToHomeAndScreen } from 'navigation/index';
import { SCREENS } from 'constants/routes';
import {
  APP_GRADIENT_HORIZONTAL,
  COLORS,
  fitMapToDirectionCoordinates,
  openPhoneNumber,
  screenHeight,
} from 'utils/index';
import { useAppSelector } from 'types/reduxTypes';
import { getWorkerRoleCopy } from 'utils/workerRoleCopy';
import { useWorkerRequestDetail } from 'hooks/useWorkerRequestDetail';
import { useWorkerGpsNavigation } from 'hooks/useWorkerGpsNavigation';
import { useMapDriveFollow } from 'hooks/useMapDriveFollow';
import { useThrottledMapCoord } from 'hooks/useThrottledMapCoord';
import type { MapCoord } from 'utils/coordinateAlongPolyline';
import { isValidMapCoord } from 'utils/coordinateAlongPolyline';
import { resolveWorkerDirectionsLeg } from 'utils/trackingDirections';
import { resolveVehicleMapBearing } from 'utils/vehicleMapBearing';
import {
  getWorkerPickupStatusAdvance,
  isWorkerTerminalBookingStatus,
  normalizeBookingStatus,
  resolveWorkerPickupStep,
  type WorkerPickupStep,
  type WorkerServiceType,
} from 'utils/bookingStatuses';
import {
  isWorkerNearCoord,
  parseDirectionSteps,
  workerProximityBlockedMessage,
  type NavStep,
  type WorkerRouteMetrics,
} from 'utils/workerNavigation';
import { navigateToBookingFirebaseChat } from 'utils/bookingFirebaseChat';
import { showToast } from 'utils/toast';
import {
  updateBookingStatus,
  extractBookingFromResponse,
  getBookingById,
} from 'api/functions/snlift/bookings';
import { isCompletedBookingStatus } from 'api/mappers/snliftBooking';
import {
  ensureWorkerActiveJobTracking,
  stopWorkerActiveJobTracking,
} from 'services/location/workerActiveJobTracking';
import { refreshWorkerHomeStats } from 'utils/workerHomeStats';
import { subscribeBookingUpdate } from 'utils/bookingUpdateSignal';

type JobPhase = 'pickup' | 'dropoff';

export const WorkerJobNavigationScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProp<RootStackParamList, typeof SCREENS.WORKER_JOB_NAVIGATION>>();
  const role = useAppSelector(state => state.user?.role);
  const userDetails = useAppSelector(state => state.user?.userDetails);
  const copy = getWorkerRoleCopy(role);
  const requestId = route.params?.requestId ?? '1';
  const { detail, loading, bookingStatus, setBookingStatus } = useWorkerRequestDetail(
    requestId,
    role,
  );
  const serviceType = (detail?.serviceType ?? 'ride') as WorkerServiceType;
  const [phase, setPhase] = useState<JobPhase>(route.params?.phase ?? 'pickup');
  const [pickupStep, setPickupStep] = useState<WorkerPickupStep>('en_route');
  const [cancelledByCustomer, setCancelledByCustomer] = useState(false);
  const mapRef = useRef<MapView>(null);
  const fittedLegRef = useRef<string | null>(null);
  const [routeCoords, setRouteCoords] = useState<MapCoord[]>([]);
  const [navSteps, setNavSteps] = useState<NavStep[]>([]);
  const [routeMetrics, setRouteMetrics] = useState<WorkerRouteMetrics>({
    distanceKm: 0,
    durationMin: 5,
  });

  // Customer cancelled this same job from their side — re-pull status the moment the push arrives.
  useEffect(() => {
    if (!detail?.id) return undefined;
    const unsubscribe = subscribeBookingUpdate(updatedBookingId => {
      if (String(updatedBookingId) !== String(detail.id)) return;
      (async () => {
        const res = await getBookingById(requestId, role, {
          showLoader: false,
          showError: false,
          silentErrors: true,
        });
        const booking = extractBookingFromResponse(res);
        if (booking) setBookingStatus(normalizeBookingStatus(booking.status));
      })();
    });
    return unsubscribe;
  }, [detail?.id, requestId, role, setBookingStatus]);

  // Status flipped to a terminal-but-not-completed state (cancelled) — tell the worker and back out.
  useEffect(() => {
    if (isWorkerTerminalBookingStatus(bookingStatus) && !isCompletedBookingStatus(bookingStatus)) {
      setCancelledByCustomer(true);
    }
  }, [bookingStatus]);

  const handleCancelledAcknowledge = useCallback(() => {
    void stopWorkerActiveJobTracking();
    reset(SCREENS.BOTTOM_STACK);
  }, []);

  useEffect(() => {
    setPickupStep(resolveWorkerPickupStep(serviceType, bookingStatus));
  }, [serviceType, bookingStatus]);

  const pickupCoord = useMemo(
    () => ({
      latitude: detail?.pickupLat ?? 0,
      longitude: detail?.pickupLng ?? 0,
    }),
    [detail?.pickupLat, detail?.pickupLng],
  );

  const dropoffCoord = useMemo(
    () => ({
      latitude: detail?.dropoffLat ?? 0,
      longitude: detail?.dropoffLng ?? 0,
    }),
    [detail?.dropoffLat, detail?.dropoffLng],
  );

  const hasBookingCoords = useMemo(
    () =>
      isValidMapCoord(pickupCoord.latitude, pickupCoord.longitude) &&
      isValidMapCoord(dropoffCoord.latitude, dropoffCoord.longitude),
    [pickupCoord, dropoffCoord],
  );

  const directionsDestination = phase === 'pickup' ? pickupCoord : dropoffCoord;
  const vehicleMarkerKind = copy.jobKind === 'delivery' ? 'bike' : 'car';

  const live = useWorkerGpsNavigation({
    routeCoords,
    destinationCoord: directionsDestination,
    routeMetrics,
    navSteps,
    enabled: hasBookingCoords,
    vehicleKind: vehicleMarkerKind,
  });

  const directionsOrigin = useThrottledMapCoord(live.vehicleCoord, 8000, 0.05);

  const directionsLeg = useMemo(
    () => resolveWorkerDirectionsLeg(phase, directionsDestination, directionsOrigin),
    [phase, directionsDestination, directionsOrigin],
  );

  const vehicleBearing = useMemo(
    () =>
      resolveVehicleMapBearing(
        live.vehicleCoord,
        routeCoords,
        live.vehicleBearing,
        vehicleMarkerKind,
      ),
    [live.vehicleCoord, routeCoords, live.vehicleBearing, vehicleMarkerKind],
  );

  const isNearTarget = useMemo(
    () => isWorkerNearCoord(live.vehicleCoord, directionsDestination),
    [live.vehicleCoord, directionsDestination],
  );

  const proximityRequired = !ENV_CONSTANTS.IS_ALPHA_PHASE;
  // const proximityBlocked =
  //   proximityRequired && (!live.vehicleCoord || !isNearTarget);
  const proximityBlocked = false;

  const { onMapUserInteraction, resumeFollow } = useMapDriveFollow(
    mapRef,
    live.vehicleCoord,
    vehicleBearing,
    live.isMoving,
  );

  const recenterPoints = useMemo(() => {
    const points: MapCoord[] = [...routeCoords, pickupCoord, dropoffCoord];
    if (live.vehicleCoord) points.push(live.vehicleCoord);
    return points;
  }, [routeCoords, pickupCoord, dropoffCoord, live.vehicleCoord]);

  useEffect(() => {
    if (!detail?.id || !userDetails?.id) return;
    void ensureWorkerActiveJobTracking({
      userId: String(userDetails.id),
      role: role ?? 'driver',
      bookingId: detail.id,
    });
  }, [detail?.id, userDetails?.id, role]);

  useEffect(() => {
    fittedLegRef.current = null;
    setRouteCoords([]);
    setNavSteps([]);
  }, [phase]);

  const mapRegion = useMemo(() => {
    const points = [pickupCoord, dropoffCoord, directionsDestination];
    if (live.vehicleCoord) points.push(live.vehicleCoord);
    const lats = points.map(p => p.latitude);
    const lngs = points.map(p => p.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max((maxLat - minLat) * 2.4, 0.018),
      longitudeDelta: Math.max((maxLng - minLng) * 2.4, 0.018),
    };
  }, [pickupCoord, dropoffCoord, directionsDestination, live.vehicleCoord]);

  const distanceCaption = phase === 'pickup' ? 'Distance to pickup' : 'Distance to drop off';
  const headingDestination =
    phase === 'pickup' ? detail?.pickupShortName : detail?.dropoffShortName;

  const customerAvatar = useMemo(() => {
    if (detail?.customerAvatar) return { uri: detail.customerAvatar };
    return IMAGES.USER;
  }, [detail?.customerAvatar]);

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigate(SCREENS.BOTTOM_STACK);
  }, [navigation]);

  const onDirectionsReady = useCallback(
    (result: {
      coordinates: MapCoord[];
      distance: number;
      duration: number;
      legs?: { steps?: { html_instructions?: string; distance?: { text?: string } }[] }[];
    }) => {
      setRouteCoords(result.coordinates);
      setRouteMetrics({
        distanceKm: Math.max(0.1, result.distance),
        durationMin: Math.max(1, Math.round(result.duration)),
      });
      setNavSteps(parseDirectionSteps(result.legs));
      const legKey = directionsLeg?.legKey ?? '';
      if (fittedLegRef.current !== legKey) {
        fittedLegRef.current = legKey;
        fitMapToDirectionCoordinates(mapRef, result.coordinates, { animated: true });
      }
    },
    [directionsLeg?.legKey],
  );

  const primaryCta =
    phase === 'pickup'
      ? pickupStep === 'en_route'
        ? copy.arrivedAtPickup
        : pickupStep === 'arrived' && serviceType === 'parcel'
          ? 'Ready for Pickup'
          : copy.startJob
      : copy.completeJob;

  const onPrimaryPress = async () => {
    if (!detail) return;

    if (proximityRequired) {
      if (!live.vehicleCoord) {
        showToast({ message: 'Waiting for GPS location…' });
        return;
      }
    }

    if (phase === 'pickup') {
      const advance = getWorkerPickupStatusAdvance(serviceType, pickupStep);
      if (!advance) return;

      await updateBookingStatus(detail.id, advance.nextStatus, role);
      if (advance.startDropoff && advance.followUpStatus) {
        await updateBookingStatus(detail.id, advance.followUpStatus, role);
      }

      if (advance.nextStep) {
        setPickupStep(advance.nextStep);
        return;
      }

      if (advance.startDropoff) {
        setPickupStep('en_route');
        setPhase('dropoff');
      }
      return;
    }

    const res = await updateBookingStatus(detail.id, 'completed', role);
    const completedBooking = extractBookingFromResponse(res);
    await stopWorkerActiveJobTracking();
    refreshWorkerHomeStats();
    resetToHomeAndScreen(SCREENS.WORKER_JOB_COMPLETED, {
      requestId: detail.id,
      completedBooking: completedBooking ?? undefined,
    });
  };

  const onPhonePress = () => {
    if (detail?.customerPhone) {
      openPhoneNumber(detail.customerPhone);
      return;
    }
    showToast({ message: 'Customer phone number is not available.' });
  };

  const onReceiverPhonePress = () => {
    if (detail?.receiverPhone) {
      openPhoneNumber(detail.receiverPhone);
      return;
    }
    showToast({ message: 'Receiver phone number is not available.' });
  };

  const onMessagePress = () => {
    navigateToBookingFirebaseChat({
      otherUser: {
        id: detail?.customerId,
        full_name: detail?.customerName,
        profile_image: detail?.customerAvatar,
      },
      bookingId: detail?.id,
    });
  };

  if (loading || !detail) {
    return (
      <Wrapper
        showBackButton={false}
        useScrollView={false}
        backgroundColor={COLORS.BACKGROUND}
        darkMode={false}
      >
        <View style={styles.loadingWrap}>
          <ActivityIndicator size='large' color={COLORS.PRIMARY} />
        </View>
      </Wrapper>
    );
  }

  if (!hasBookingCoords) {
    return (
      <Wrapper
        showBackButton={false}
        useScrollView={false}
        backgroundColor={COLORS.BACKGROUND}
        darkMode={false}
      >
        <View style={styles.loadingWrap}>
          <Typography style={styles.errorText}>
            Booking location data is missing. Please go back and try again.
          </Typography>
          <Button title='Back' onPress={handleBack} style={styles.backBtnFallback} />
        </View>
      </Wrapper>
    );
  }

  const awaitingGpsForDirections = !directionsOrigin;

  return (
    <Wrapper
      showBackButton={false}
      useScrollView={false}
      backgroundColor={COLORS.TRANSPARENT}
      darkMode={false}
    >
      <View
        style={{
          left: 20,
          top: 5,
          position: 'absolute',
          zIndex: 20,
        }}
      >
        <CustomBackIcon />
      </View>
      <View style={styles.root}>
        <View style={styles.mapSection}>
          {awaitingGpsForDirections ? (
            <View style={styles.gpsWait}>
              <ActivityIndicator size='large' color={COLORS.PRIMARY} />
              <Typography style={styles.gpsWaitText}>
                Getting your location for directions…
              </Typography>
            </View>
          ) : directionsLeg ? (
            <WorkerJobRouteMap
              directionsLeg={directionsLeg}
              pickupCoord={pickupCoord}
              dropoffCoord={dropoffCoord}
              phase={phase}
              mapRegion={mapRegion}
              mapRef={mapRef}
              vehicleCoord={live.vehicleCoord}
              vehicleBearing={vehicleBearing}
              vehicleMarkerKind={vehicleMarkerKind}
              recenterPoints={recenterPoints}
              onMapUserInteraction={onMapUserInteraction}
              onRecenterPress={resumeFollow}
              onDirectionsReady={onDirectionsReady}
            />
          ) : null}
          {/* <Pressable
            onPress={handleBack}
            hitSlop={12}
            style={[styles.backBtn, { top: insets.top + 8 }]}
          >
            <Typography style={styles.backTxt}>Back</Typography>
          </Pressable> */}
          {!awaitingGpsForDirections ? (
            <View style={styles.navOverlay} pointerEvents='box-none'>
              <WorkerNavInstructionCard
                distanceCaption={distanceCaption}
                distanceLabel={live.distanceLabel}
                etaLabel={live.etaLabel}
                step={live.activeStep}
              />
            </View>
          ) : null}
        </View>

        <View style={styles.bottom}>
          {serviceType === 'parcel' ? (
            <>
              <RideDriverCard
                roleLabel='Sender'
                driverName={detail.senderName || detail.customerName}
                avatarSource={customerAvatar}
                onPhonePress={onPhonePress}
                onMessagePress={onMessagePress}
                showVehicleSection={false}
                variant='elevatedWhite'
              />
              <RideDriverCard
                roleLabel='Receiver'
                driverName={detail.receiverName || 'Receiver'}
                avatarSource={IMAGES.USER}
                onPhonePress={onReceiverPhonePress}
                showVehicleSection={false}
                variant='elevatedWhite'
              />
            </>
          ) : (
            <RideDriverCard
              driverName={detail.customerName}
              avatarSource={customerAvatar}
              onPhonePress={onPhonePress}
              onMessagePress={onMessagePress}
              showVehicleSection={false}
              variant='elevatedWhite'
            />
          )}

          {headingDestination ? (
            <AppGradient
              colors={[...APP_GRADIENT_HORIZONTAL]}
              start={GRADIENT_START}
              end={GRADIENT_END}
              fill
              style={styles.headingPill}
            >
              <Typography style={styles.headingLabel}>
                {phase === 'pickup' ? 'Heading to pickup' : 'Heading to'}
              </Typography>
              <Typography style={styles.headingDestination} numberOfLines={2}>
                {headingDestination}
              </Typography>
            </AppGradient>
          ) : null}

          <Button
            title={primaryCta}
            onPress={onPrimaryPress}
            disabled={proximityBlocked}
            style={[styles.cta, proximityBlocked && styles.ctaDisabled]}
          />
          {proximityBlocked ? (
            <Typography style={styles.proximityHint}>
              {workerProximityBlockedMessage(phase)}
            </Typography>
          ) : null}
        </View>
      </View>

      <AppStatusModal
        visible={cancelledByCustomer}
        onClose={handleCancelledAcknowledge}
        onPrimaryPress={handleCancelledAcknowledge}
        title='Job Cancelled'
        description="The customer has cancelled this job. You'll be taken back to the home screen."
        primaryButtonText='OK'
        iconProps={{
          componentName: VARIABLES.MaterialCommunityIcons,
          iconName: 'close-circle',
          size: 32,
        }}
      />
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  gpsWait: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
  },
  gpsWaitText: {
    textAlign: 'center',
    color: COLORS.APP_TEXT_MUTED,
    fontSize: FontSize.Medium,
  },
  errorText: {
    textAlign: 'center',
    color: COLORS.APP_TEXT_MUTED,
    fontSize: FontSize.Medium,
  },
  backBtnFallback: {
    minWidth: 120,
  },
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
  backBtn: {
    position: 'absolute',
    left: 16,
    zIndex: 20,
    elevation: 20,
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  backTxt: {
    color: COLORS.APP_PRIMARY,
    fontWeight: FontWeight.SemiBold,
    fontSize: FontSize.Medium,
  },
  navOverlay: {
    position: 'absolute',
    top: 52,
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
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    gap: 2,
  },
  headingLabel: {
    color: COLORS.WHITE,
    fontWeight: FontWeight.Medium,
    fontSize: FontSize.Small,
    textAlign: 'center',
    opacity: 0.95,
  },
  headingDestination: {
    color: COLORS.WHITE,
    fontWeight: FontWeight.Bold,
    fontSize: FontSize.ExtraLarge,
    textAlign: 'center',
    lineHeight: 28,
  },
  cta: {
    marginHorizontal: 20,
    backgroundColor: '#21409A',
  },
  ctaDisabled: {
    opacity: 0.55,
  },
  proximityHint: {
    marginHorizontal: 24,
    textAlign: 'center',
    color: COLORS.APP_TEXT_MUTED,
    fontSize: FontSize.Small,
  },
});
