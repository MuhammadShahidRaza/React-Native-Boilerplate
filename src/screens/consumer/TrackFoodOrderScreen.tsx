import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import type MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';
import { RouteProp, useRoute } from '@react-navigation/native';
import {
  GradientIcon,
  Icon,
  MapVehicleMarker,
  type IconComponentProps,
  FoodPreparingAnimation,
  MOCK_FOOD_ORDER,
  ParcelCourierCard,
  ParcelRouteMap,
  RideAnimatedStatusBlock,
  RideProgressSegments,
  RideVehicleStatsRow,
  Typography,
  Wrapper,
} from 'components/index';
import { VARIABLES } from 'constants/common';
import { IMAGES } from 'constants/assets';
import { FontSize, FontWeight } from 'types/fontTypes';
import type { FoodOrderPhase } from 'types/foodOrderTracking';
import { FOOD_ORDER_PHASE_INDEX } from 'types/foodOrderTracking';
import type { RootStackParamList } from 'navigation/index';
import { reset } from 'navigation/index';
import { SCREENS } from 'constants/routes';
import { COLORS, coordinateAlongPolyline, openPhoneNumber, screenHeight } from 'utils/index';
import type { MapCoord } from 'utils/coordinateAlongPolyline';
import { CancelReasonModal } from './CancelReasonModal';
import { cancelSniftBooking } from 'utils/snliftBookingActions';

const PHASE_ORDER: FoodOrderPhase[] = [
  'placing_order',
  'order_placed',
  'order_accepted',
  'preparing',
  'picked_up',
  'on_the_way',
  'delivered',
];

const PHASE_MS: Partial<Record<FoodOrderPhase, number>> = {
  placing_order: 1800,
  order_placed: 2200,
  order_accepted: 2200,
  preparing: 4000,
  picked_up: 5500,
  on_the_way: 6500,
};

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
}: {
  visible: boolean;
  heading?: string;
  title: string;
  subtitle: string;
  icon: PhaseStatus['icon'];
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade'
      statusBarTranslucent
      presentationStyle='overFullScreen'
    >
      <View style={styles.phaseModalScrim}>
        <View style={styles.overlayCard}>
          {heading ? (
            <Typography style={styles.overlayHeading}>{heading}</Typography>
          ) : null}
          <GradientIcon
            {...icon}
            color={COLORS.WHITE}
            containerSize={72}
            borderRadius={36}
          />
          <Typography style={styles.overlayTitle}>{title}</Typography>
          <Typography style={styles.overlaySubtitle}>{subtitle}</Typography>
        </View>
      </View>
    </Modal>
  );
}

export const TrackFoodOrderScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, typeof SCREENS.TRACK_FOOD_ORDER>>();
  const bookingId = route.params?.bookingId;
  const [phase, setPhase] = useState<FoodOrderPhase>(route.params?.phase ?? 'placing_order');
  const [cancelOpen, setCancelOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [routeCoords, setRouteCoords] = useState<MapCoord[]>([]);
  const [courierCoord, setCourierCoord] = useState<MapCoord | null>(null);
  const mapRef = useRef<MapView>(null);

  const { pickup, dropoff } = MOCK_FOOD_ORDER;
  const mapRegion = useMemo(
    () => ({
      latitude: (pickup.latitude + dropoff.latitude) / 2,
      longitude: (pickup.longitude + dropoff.longitude) / 2,
      latitudeDelta: 0.04,
      longitudeDelta: 0.04,
    }),
    [pickup, dropoff],
  );

  const showMap = phase === 'picked_up' || phase === 'on_the_way' || phase === 'delivered';
  const showPreparingHero = phase === 'preparing';
  const showOverlayCard = OVERLAY_PHASES.includes(phase);
  const showTrackingUi = !showOverlayCard;
  const activeSegment = Math.max(0, FOOD_ORDER_PHASE_INDEX[phase]);
  const isDelivered = phase === 'delivered';
  const canCancel =
    phase !== 'picked_up' && phase !== 'on_the_way' && phase !== 'delivered';

  useEffect(() => {
    if (phase === 'delivered') return undefined;
    const ms = PHASE_MS[phase] ?? 3000;
    const tid = setTimeout(() => {
      setPhase(curr => {
        const idx = PHASE_ORDER.indexOf(curr);
        return PHASE_ORDER[Math.min(idx + 1, PHASE_ORDER.length - 1)];
      });
    }, ms);
    return () => clearTimeout(tid);
  }, [phase]);

  useEffect(() => {
    if (!showMap || phase === 'delivered') {
      setCourierCoord(null);
      return undefined;
    }
    let raf = 0;
    const loop = () => {
      const wave = (Math.sin(Date.now() / 1000 * Math.PI * 2 * 0.2) + 1) / 2;
      if (routeCoords.length >= 2) {
        setCourierCoord(coordinateAlongPolyline(routeCoords, 0.1 + wave * 0.8));
      } else {
        setCourierCoord({
          latitude: pickup.latitude + (dropoff.latitude - pickup.latitude) * wave,
          longitude: pickup.longitude + (dropoff.longitude - pickup.longitude) * wave,
        });
      }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [showMap, phase, routeCoords, pickup, dropoff]);

  const onDirectionsReady = useCallback((coordinates: MapCoord[]) => {
    setRouteCoords(coordinates);
  }, []);

  const status = useMemo((): PhaseStatus => {
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
          icon: { componentName: VARIABLES.MaterialCommunityIcons, iconName: 'room-service', size: 36 },
          title: 'Preparing Order',
          subtitle:
            'Your order is being prepared. It takes upto 2 - 3 minutes to prepare the order.',
        };
      case 'picked_up':
        return {
          key: 'picked',
          icon: { componentName: VARIABLES.MaterialCommunityIcons, iconName: 'package-variant', size: 36 },
          title: 'Picked Up',
          subtitle: 'Your order has been picked up',
        };
      case 'on_the_way':
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
  }, [phase]);

  return (
    <Wrapper
      headerTitle='Food Delivery'
      showBackButton
      
      useScrollView={false}
      backgroundColor={COLORS.WHITE}
      darkMode={false}
    >
      <View style={styles.screen}>
        {showMap ? (
          <View style={styles.mapWrap}>
            <ParcelRouteMap
              pickup={pickup}
              dropoff={dropoff}
              mapRegion={mapRegion}
              mapRef={mapRef}
              onDirectionsReady={onDirectionsReady}
            >
              {courierCoord && !isDelivered ? (
                <Marker coordinate={courierCoord} anchor={{ x: 0.5, y: 0.5 }}>
                  <MapVehicleMarker kind='bike' />
                </Marker>
              ) : null}
            </ParcelRouteMap>
          </View>
        ) : showPreparingHero ? (
          <FoodPreparingAnimation />
        ) : (
          <View style={styles.heroPlaceholder} />
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
                  {`Estimated delivery: ${MOCK_FOOD_ORDER.etaLabel}`}
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

          {showMap && !isDelivered ? (
            <ParcelCourierCard
              courierName={MOCK_FOOD_ORDER.courierName}
              phone={MOCK_FOOD_ORDER.courierPhone}
              avatarSource={IMAGES.USER}
              onPhonePress={() => openPhoneNumber(MOCK_FOOD_ORDER.courierPhone)}
              onMessagePress={() => {}}
            />
          ) : null}

          {showMap && !isDelivered ? (
            <RideVehicleStatsRow
              items={[
                { icon: 'motorbike', label: 'Vehicle Type', value: MOCK_FOOD_ORDER.vehicleType },
                { icon: 'card-text', label: 'License Plate', value: MOCK_FOOD_ORDER.licensePlate },
                { icon: 'water', label: 'Color', value: MOCK_FOOD_ORDER.vehicleColor },
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
              <View style={styles.rateBlock}>
                <Typography style={styles.rateTitle}>Rate your ride</Typography>
                <View style={styles.stars}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <Pressable key={star} onPress={() => setRating(star)}>
                      <Icon
                        componentName={VARIABLES.Ionicons}
                        iconName={star <= rating ? 'star' : 'star-outline'}
                        size={55}
                        color={COLORS.APP_STAR}
                      />
                    </Pressable>
                  ))}
                </View>
              </View>
            </>
          ) : null}
        </ScrollView>

        <View style={styles.footer}>
          {isDelivered ? (
            <Pressable style={styles.doneBtn} onPress={() => reset(SCREENS.BOTTOM_STACK)}>
              <Typography style={styles.doneTxt}>Done</Typography>
            </Pressable>
          ) : canCancel ? (
            <Pressable style={styles.cancelSoft} onPress={() => setCancelOpen(true)}>
              <Typography style={styles.cancelSoftTxt}>Cancel Delivery</Typography>
            </Pressable>
          ) : null}
        </View>
      </View>

      <FoodOrderPhaseModal
        visible={showOverlayCard}
        heading={status.overlayHeading}
        title={status.title}
        subtitle={status.subtitle}
        icon={status.icon}
      />

      <CancelReasonModal
        visible={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onContinue={async reason => {
          setCancelOpen(false);
          await cancelSniftBooking(bookingId, reason);
        }}
      />
    </Wrapper>
  );
};

const styles = StyleSheet.create({
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
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
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
});
