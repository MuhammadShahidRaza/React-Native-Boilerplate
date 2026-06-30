import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import type MapView from 'react-native-maps';
import { RouteProp, useRoute } from '@react-navigation/native';
import {
  GradientButton,
  GradientIcon,
  BookingRatingStars,
  LiveVehicleMapMarker,
  type IconComponentProps,
  FoodPreparingAnimation,
  ParcelCourierCard,
  ParcelRouteMap,
  PaymentSuccessModal,
  RideAnimatedStatusBlock,
  RideProgressSegments,
  RideVehicleStatsRow,
  Typography,
  Wrapper,
  WorkerRequestTimer,
} from 'components/index';
import { ENV_CONSTANTS, VARIABLES } from 'constants/common';
import { IMAGES, isSengoBrand } from 'constants/assets';
import { FontSize, FontWeight } from 'types/fontTypes';
import type { FoodOrderPhase } from 'types/foodOrderTracking';
import { FOOD_ORDER_PHASE_INDEX } from 'types/foodOrderTracking';
import type { RootStackParamList } from 'navigation/index';
import { navigate, onBack, replace, reset } from 'navigation/index';
import { SCREENS } from 'constants/routes';
import { COLORS, openPhoneNumber, screenHeight } from 'utils/index';
import type { MapCoord } from 'utils/coordinateAlongPolyline';
import { CancelReasonModal } from './CancelReasonModal';
import { JobTimerExpiredModal } from './JobTimerExpiredModal';
import { cancelSniftBooking, deleteSniftBooking } from 'utils/snliftBookingActions';
import { extractBookingFromResponse, getBookingById } from 'api/functions/snlift/bookings';
import { useJobDisplayTimer } from 'hooks/useJobDisplayTimer';
import { useBookingAcceptPoll } from 'hooks/useBookingAcceptPoll';
import { isFreshJobTimer, resolveJobTimerAnchor } from 'utils/resolveJobTimerAnchor';
import { useFoodOrderDisplay } from 'hooks/useFoodOrderDisplay';
import { useConsumerBookingTrack } from 'hooks/useConsumerBookingTrack';
import { useBookingRating } from 'hooks/useBookingRating';
import { useThrottledMapCoord } from 'hooks/useThrottledMapCoord';
import { useAlphaBookingStatusCycle } from 'hooks/useAlphaBookingStatusCycle';
import { mapFoodOrderPhase } from 'utils/bookingTrackPhases';
import { resolveCourierToDropoffLeg } from 'utils/trackingDirections';
import { resolveVehicleMapBearing } from 'utils/vehicleMapBearing';
import { navigateToBookingFirebaseChat } from 'utils/bookingFirebaseChat';
import { resolveFoodOrderLines, resolveFoodOrderSummary } from 'api/mappers/snliftBooking';
import { FoodOrderSummaryCard } from 'components/common/food/FoodOrderSummary';
import { showToast } from 'utils/toast';

const IS_ALPHA = ENV_CONSTANTS.IS_ALPHA_PHASE;

const OVERLAY_PHASES: FoodOrderPhase[] = ['placing_order', 'order_placed', 'order_accepted'];

type PhaseStatus = {
  key: string;
  overlayHeading?: string;
  icon: Pick<IconComponentProps, 'componentName' | 'iconName' | 'size'>;
  title: string;
  subtitle: string;
};

function FoodOrderPhaseModal({
  visible,
  heading,
  title,
  subtitle,
  icon,
  timerElement,
  showCancel,
  onCancelPress,
}: {
  visible: boolean;
  heading?: string;
  title: string;
  subtitle: string;
  icon: PhaseStatus['icon'];
  timerElement?: React.ReactNode;
  showCancel?: boolean;
  onCancelPress?: () => void;
}) {
  if (!visible) return null;

  return (
    <View style={styles.phaseModalScrim} pointerEvents='box-none'>
      <View style={styles.overlayCard} pointerEvents='auto'>
        {heading ? <Typography style={styles.overlayHeading}>{heading}</Typography> : null}
        <GradientIcon {...icon} color={COLORS.WHITE} containerSize={72} borderRadius={36} />
        <Typography style={styles.overlayTitle}>{title}</Typography>
        <Typography style={styles.overlaySubtitle}>{subtitle}</Typography>
        {timerElement ?? null}
        {showCancel && onCancelPress ? (
          <Pressable style={styles.overlayCancelBtn} onPress={onCancelPress}>
            <Typography style={styles.overlayCancelTxt}>Cancel Order</Typography>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export const TrackFoodOrderScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, typeof SCREENS.TRACK_FOOD_ORDER>>();
  const bookingId = route.params?.bookingId;
  const timerDurationSeconds = route.params?.timerDurationSeconds;
  const alphaCycle = useAlphaBookingStatusCycle(bookingId);
  const { order } = useFoodOrderDisplay(bookingId);
  const track = useConsumerBookingTrack(bookingId, undefined, 'bike', {
    alphaStatusOverride: IS_ALPHA ? alphaCycle.status ?? undefined : undefined,
  });

  const effectiveStatus =
    IS_ALPHA && alphaCycle.status ? alphaCycle.status : track.status;

  const phase = useMemo((): FoodOrderPhase => {
    if (IS_ALPHA && effectiveStatus) return mapFoodOrderPhase(effectiveStatus);
    if (track.status) return mapFoodOrderPhase(track.status);
    return route.params?.phase ?? 'order_placed';
  }, [effectiveStatus, route.params?.phase, track.status]);

  const [cancelOpen, setCancelOpen] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [expiredVisible, setExpiredVisible] = useState(false);
  const [routeCoords, setRouteCoords] = useState<MapCoord[]>([]);
  const {
    rating,
    setRating,
    hasRated,
    submitting: ratingSubmitting,
    submit: submitRating,
  } = useBookingRating(bookingId, track.booking?.booking_type ?? 'food');
  const mapRef = useRef<MapView>(null);
  const freshTimerRef = useRef(isFreshJobTimer(route.params));
  const timerHandledRef = useRef(false);
  const [timerCreatedAt, setTimerCreatedAt] = useState<string | undefined>(() =>
    resolveJobTimerAnchor(route.params),
  );

  const { expiresAt, ready } = useJobDisplayTimer(timerCreatedAt, timerDurationSeconds);

  useEffect(() => {
    if (freshTimerRef.current || !bookingId || timerCreatedAt) return;
    let cancelled = false;
    (async () => {
      const res = await getBookingById(bookingId, 'user', {
        showLoader: false,
        showError: false,
        silentErrors: true,
      });
      const booking = extractBookingFromResponse(res);
      if (!cancelled && booking?.created_at) {
        setTimerCreatedAt(booking.created_at.trim());
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bookingId, timerCreatedAt]);

  const handleBookingAccepted = useCallback(() => {
    timerHandledRef.current = true;
  }, []);

  const pickup = track.pickup ?? order?.pickup ?? { latitude: 0, longitude: 0 };
  const dropoff = track.dropoff ?? order?.dropoff ?? { latitude: 0, longitude: 0 };

  useBookingAcceptPoll(
    IS_ALPHA ? undefined : phase === 'order_placed' ? bookingId : undefined,
    handleBookingAccepted,
  );

  const handleTimerExpire = () => {
    if (timerHandledRef.current) return;
    timerHandledRef.current = true;
    setExpiredVisible(true);
  };

  const handlePlaceNewOrder = async () => {
    setExpiredVisible(false);
    const ok = await deleteSniftBooking(bookingId);
    if (ok) navigate(SCREENS.ORDER_FOOD);
  };

  const handleBackPress = () => {
    onBack();
  };

  const mapRegion = track.mapRegion ?? {
    latitude: (pickup.latitude + dropoff.latitude) / 2,
    longitude: (pickup.longitude + dropoff.longitude) / 2,
    latitudeDelta: 0.04,
    longitudeDelta: 0.04,
  };

  const showMap = phase === 'in_transit';
  const directionsOrigin = useThrottledMapCoord(showMap ? track.providerCoord : null, 8000, 0.05);
  const directionsLeg = useMemo(
    () => (showMap ? resolveCourierToDropoffLeg(dropoff, directionsOrigin) : null),
    [showMap, dropoff, directionsOrigin],
  );
  const vehicleBearing = useMemo(
    () => resolveVehicleMapBearing(track.providerCoord, routeCoords, track.providerBearing, 'bike'),
    [routeCoords, track.providerCoord, track.providerBearing],
  );
  const showPreparingHero = phase === 'preparing';
  const showOverlayCard = IS_ALPHA ? OVERLAY_PHASES.includes(phase) : phase === 'order_placed';
  const showTrackingUi = !showOverlayCard;
  const activeSegment = Math.max(0, FOOD_ORDER_PHASE_INDEX[phase]);
  const isDelivered = phase === 'delivered';
  const canCancel = phase !== 'in_transit' && phase !== 'delivered' && phase !== 'picked_up';

  const onDirectionsReady = useCallback((coordinates: MapCoord[]) => {
    setRouteCoords(coordinates);
  }, []);

  const foodOrderSummary = useMemo(
    () => (track.booking ? resolveFoodOrderSummary(track.booking) : null),
    [track.booking],
  );

  const foodOrderLines = useMemo(
    () => (track.booking ? resolveFoodOrderLines(track.booking) : []),
    [track.booking],
  );

  const status = useMemo((): PhaseStatus => {
    const preparingSubtitle = order?.etaLabel
      ? `Your order is being prepared. It takes up to ${order.etaLabel} to prepare the order.`
      : IS_ALPHA
        ? 'Your order is being prepared. It takes upto 20 - 30 minutes to prepare the order.'
        : 'Your order is being prepared.';

    switch (phase) {
      case 'placing_order':
        return {
          key: 'placing',
          overlayHeading: 'Placing Order',
          icon: { componentName: VARIABLES.MaterialCommunityIcons, iconName: 'bike', size: 36 },
          title: 'Placing Order',
          subtitle: 'Please wait…',
        };
      case 'order_placed':
        return {
          key: 'placed',
          overlayHeading: 'Order Placed',
          icon: { componentName: VARIABLES.MaterialCommunityIcons, iconName: 'bike', size: 36 },
          title: 'Order Placed!',
          subtitle: 'Your order has been placed',
        };
      case 'order_accepted':
        return {
          key: 'accepted',
          overlayHeading: 'Order Accepted',
          icon: { componentName: VARIABLES.MaterialCommunityIcons, iconName: 'bike', size: 36 },
          title: 'Order Accepted',
          subtitle: 'Order has been accepted by the restaurant.',
        };
      case 'preparing':
        return {
          key: 'prep',
          icon: {
            componentName: VARIABLES.MaterialCommunityIcons,
            iconName: 'room-service',
            size: 36,
          },
          title: 'Preparing Order',
          subtitle: preparingSubtitle,
        };
      case 'ready_for_pickup':
        return {
          key: 'ready',
          icon: {
            componentName: VARIABLES.MaterialCommunityIcons,
            iconName: 'clock-check',
            size: 36,
          },
          title: 'Ready for Pickup',
          subtitle: 'Your order is ready. A courier will pick it up shortly.',
        };
      case 'picked_up':
        return {
          key: 'picked',
          icon: {
            componentName: VARIABLES.MaterialCommunityIcons,
            iconName: 'package-variant',
            size: 36,
          },
          title: 'Picked Up',
          subtitle: 'Your order has been picked up',
        };
      case 'in_transit':
        return {
          key: 'way',
          icon: { componentName: VARIABLES.MaterialCommunityIcons, iconName: 'bike', size: 36 },
          title: 'On the way',
          subtitle: "Your order is on it's way",
        };
      default:
        return {
          key: 'done',
          icon: { componentName: VARIABLES.Entypo, iconName: 'check', size: 40 },
          title: 'Delivered',
          subtitle: 'Parcel has been delivered',
        };
    }
  }, [phase, order?.etaLabel]);

  return (
    <Wrapper
      headerTitle='Food Delivery'
      showBackButton
      onPressBack={handleBackPress}
      useScrollView={false}
      backgroundColor={COLORS.WHITE}
      darkMode={false}
    >
      <View style={styles.screenRoot}>
        <View style={styles.screen}>
          {showMap ? (
            <View style={styles.mapWrap}>
              <ParcelRouteMap
                pickup={pickup}
                dropoff={dropoff}
                mapRegion={mapRegion}
                mapRef={mapRef}
                directionsLeg={directionsLeg}
                extraRecenterPoints={[track.providerCoord]}
                onDirectionsReady={onDirectionsReady}
              >
                {track.providerCoord && !isDelivered ? (
                  <LiveVehicleMapMarker
                    coordinate={track.providerCoord}
                    bearing={vehicleBearing}
                    kind='bike'
                  />
                ) : null}
              </ParcelRouteMap>
            </View>
          ) : showPreparingHero ? (
            <FoodPreparingAnimation />
          ) : (
            // <View style={styles.heroPlaceholder} />
            <View />
          )}

          <ScrollView
            style={styles.bodyScroll}
            contentContainerStyle={styles.bodyScrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {showTrackingUi ? (
              <>
                <RideProgressSegments stepCount={4} activeSegmentIndex={activeSegment} />
                <View style={styles.etaPill}>
                  <Typography style={styles.etaTxt}>
                    {order?.etaLabel
                      ? `Estimated delivery: ${order.etaLabel}`
                      : IS_ALPHA
                        ? 'Estimated delivery: 30 minutes'
                        : 'Estimated delivery: —'}
                  </Typography>
                </View>
              </>
            ) : null}

            {showTrackingUi && !isDelivered ? (
                <RideAnimatedStatusBlock
                  animationKey={status.key}
                  iconProps={status.icon}
                  title={status.title}
                  subtitle={status.subtitle}
                />
            ) : null}

            {showMap && !isDelivered && order ? (
              <ParcelCourierCard
                courierName={order.courierName}
                phone={order.courierPhone}
                avatarSource={IMAGES.USER}
                onPhonePress={() => {
                  if (order.courierPhone) {
                    openPhoneNumber(order.courierPhone);
                    return;
                  }
                  showToast({ message: 'Courier phone number is not available.' });
                }}
                onMessagePress={() =>
                  navigateToBookingFirebaseChat({
                    otherUser: {
                      id: order.providerId,
                      full_name: order.courierName,
                    },
                    bookingId,
                  })
                }
              />
            ) : null}

            {showMap && !isDelivered && order ? (
              <RideVehicleStatsRow
                items={[
                  { icon: 'motorbike', label: 'Vehicle Type', value: order.vehicleType },
                  { icon: 'card-text', label: 'License Plate', value: order.licensePlate },
                  { icon: 'water', label: 'Color', value: order.vehicleColor },
                ]}
                marginHorizontal={0}
              />
            ) : null}

            {isDelivered ? (
              <>
                <RideAnimatedStatusBlock
                  animationKey={status.key}
                  iconProps={status.icon}
                  title={status.title}
                  subtitle={status.subtitle}
                />
                {foodOrderLines.length > 0 ? (
                  <View style={styles.itemsCard}>
                    <Typography style={styles.itemsTitle}>Ordered items</Typography>
                    {foodOrderLines.map(line => (
                      <View key={line.key} style={styles.itemRow}>
                        <View style={styles.itemMeta}>
                          <Typography style={styles.itemName}>{line.label}</Typography>
                          <Typography style={styles.itemQty}>
                            {line.unitPrice
                              ? `${line.unitPrice} × ${line.quantity}`
                              : `Qty: ${line.quantity}`}
                          </Typography>
                        </View>
                        {line.lineTotal ? (
                          <Typography style={styles.itemPrice}>{line.lineTotal}</Typography>
                        ) : null}
                      </View>
                    ))}
                  </View>
                ) : null}
                {foodOrderSummary ? (
                  <FoodOrderSummaryCard summary={foodOrderSummary} />
                ) : null}
                {(!isSengoBrand() || hasPaid) ? (
                  <View style={styles.rateBlock}>
                    <BookingRatingStars
                      title={hasRated ? 'Your rating' : 'Rate your order'}
                      value={rating}
                      onChange={hasRated ? undefined : setRating}
                      readonly={hasRated}
                      size={55}
                    />
                  </View>
                ) : null}
              </>
            ) : null}
          </ScrollView>

          <View style={styles.footer}>
            {isDelivered ? (
              isSengoBrand() && !hasPaid ? (
                <GradientButton
                  title='Pay'
                  onPress={() => setShowPaymentModal(true)}
                  style={{ alignSelf: 'stretch' }}
                />
              ) : (
                <Pressable
                  style={styles.doneBtn}
                  disabled={ratingSubmitting}
                  onPress={async () => {
                    if (!hasRated && rating >= 1) {
                      const ok = await submitRating();
                      if (!ok) return;
                    }
                    reset(SCREENS.BOTTOM_STACK);
                  }}
                >
                  <Typography style={styles.doneTxt}>
                    {ratingSubmitting ? 'Submitting…' : 'Done'}
                  </Typography>
                </Pressable>
              )
            ) : canCancel ? (
              <Pressable style={styles.cancelSoft} onPress={() => setCancelOpen(true)}>
                <Typography style={styles.cancelSoftTxt}>Cancel Delivery</Typography>
              </Pressable>
            ) : null}
          </View>
        </View>

        <FoodOrderPhaseModal
          visible={showOverlayCard && !expiredVisible}
          heading={status.overlayHeading}
          title={status.title}
          subtitle={status.subtitle}
          icon={status.icon}
          showCancel={phase === 'order_placed'}
          onCancelPress={() => setCancelOpen(true)}
          timerElement={
            phase === 'order_placed' && ready && expiresAt ? (
              <WorkerRequestTimer
                expiresAt={expiresAt}
                onExpire={handleTimerExpire}
                active={!expiredVisible}
              />
            ) : null
          }
        />
      </View>

      <JobTimerExpiredModal
        visible={expiredVisible}
        title='Order Not Accepted'
        description='The restaurant did not accept your order in time. Place a new order or delete this one.'
        primaryButtonTitle='Place New Order'
        secondaryButtonTitle='Delete Order'
        onSearchAgain={handlePlaceNewOrder}
        onCancel={async () => {
          setExpiredVisible(false);
          const ok = await deleteSniftBooking(bookingId);
          if (ok) replace(SCREENS.BOTTOM_STACK);
        }}
      />

      <PaymentSuccessModal
        visible={showPaymentModal}
        onContinue={() => {
          setShowPaymentModal(false);
          setHasPaid(true);
        }}
      />
      <CancelReasonModal
        visible={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onContinue={async reason => {
          const ok = await cancelSniftBooking(bookingId, reason);
          if (ok) {
            timerHandledRef.current = true;
            replace(SCREENS.BOTTOM_STACK);
          }
          return ok;
        }}
      />
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
    position: 'relative',
  },
  screen: {
    flex: 1,
  },
  mapWrap: {
    height: screenHeight(34),
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
  },
  heroPlaceholder: {
    height: screenHeight(22),
    backgroundColor: COLORS.APP_MAP_BG,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  bodyScroll: {
    flex: 1,
  },
  bodyScrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  etaPill: {
    alignSelf: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  etaTxt: {
    color: COLORS.APP_PRIMARY_DARK,
    fontWeight: FontWeight.SemiBold,
    fontSize: FontSize.Small,
  },
  rateBlock: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  rateTitle: {
    fontWeight: FontWeight.SemiBold,
    fontSize: FontSize.ExtraLarge,
    marginBottom: 12,
  },
  stars: {
    flexDirection: 'row',
    gap: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 8,
    backgroundColor: COLORS.WHITE,
  },
  cancelSoft: {
    backgroundColor: '#FFEDD5',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelSoftTxt: {
    color: COLORS.APP_DANGER_TEXT,
    fontWeight: FontWeight.SemiBold,
  },
  doneBtn: {
    backgroundColor: COLORS.SECONDARY,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  doneTxt: {
    color: COLORS.WHITE,
    fontWeight: FontWeight.Bold,
    fontSize: FontSize.Medium,
  },
  phaseModalScrim: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 50,
  },
  overlayCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 22,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  overlayHeading: {
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.SemiBold,
    color: COLORS.APP_TEXT_MUTED,
    marginBottom: 4,
    textAlign: 'center',
  },
  overlayTitle: {
    fontSize: FontSize.Large,
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
    textAlign: 'center',
  },
  overlaySubtitle: {
    fontSize: FontSize.Small,
    color: COLORS.APP_TEXT_MUTED,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 4,
  },
  overlayCancelBtn: {
    marginTop: 8,
    backgroundColor: '#FFEDD5',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  overlayCancelTxt: {
    color: COLORS.APP_DANGER_TEXT,
    fontWeight: FontWeight.SemiBold,
    fontSize: FontSize.Medium,
  },
  itemsCard: {
    backgroundColor: COLORS.APP_SURFACE,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.APP_LINE,
    gap: 8,
    marginBottom: 4,
  },
  itemsTitle: {
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.SemiBold,
    color: COLORS.APP_TEXT,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.APP_LINE,
  },
  itemMeta: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    fontSize: FontSize.Small,
    fontWeight: FontWeight.SemiBold,
    color: COLORS.APP_TEXT,
  },
  itemQty: {
    fontSize: FontSize.Small,
    color: COLORS.APP_TEXT_MUTED,
  },
  itemPrice: {
    fontSize: FontSize.Small,
    fontWeight: FontWeight.SemiBold,
    color: COLORS.APP_TEXT,
  },
});
