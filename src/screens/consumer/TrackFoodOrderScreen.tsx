import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';
import { RouteProp, useRoute } from '@react-navigation/native';
import {
  GradientIcon,
  Icon,
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

const BACK_ICON = { backgroundColor: COLORS.APP_PRIMARY, borderRadius: 12 };

const PHASE_MS: Partial<Record<FoodOrderPhase, number>> = {
  placing_order: 1800,
  order_placed: 2200,
  order_accepted: 2200,
  preparing: 4000,
  picked_up: 5500,
  on_the_way: 6500,
};

export const TrackFoodOrderScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, typeof SCREENS.TRACK_FOOD_ORDER>>();
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
  const activeSegment = Math.max(0, FOOD_ORDER_PHASE_INDEX[phase]);

  useEffect(() => {
    if (phase === 'delivered') return undefined;
    const ms = PHASE_MS[phase] ?? 3000;
    const tid = setTimeout(() => {
      setPhase(curr => {
        const order: FoodOrderPhase[] = [
          'placing_order',
          'order_placed',
          'order_accepted',
          'preparing',
          'picked_up',
          'on_the_way',
          'delivered',
        ];
        const idx = order.indexOf(curr);
        return order[Math.min(idx + 1, order.length - 1)];
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

  const status = useMemo(() => {
    switch (phase) {
      case 'placing_order':
        return {
          key: 'placing',
          overlayTitle: 'Placing Order',
          icon: { componentName: VARIABLES.MaterialCommunityIcons, iconName: 'bike', size: 36 },
          title: 'Placing Order',
          subtitle: 'Please wait…',
        };
      case 'order_placed':
        return {
          key: 'placed',
          overlayTitle: 'Placing Order',
          icon: { componentName: VARIABLES.MaterialCommunityIcons, iconName: 'bike', size: 36 },
          title: 'Order Placed!',
          subtitle: 'Your order has been placed',
        };
      case 'order_accepted':
        return {
          key: 'accepted',
          overlayTitle: 'Order Accepted',
          icon: { componentName: VARIABLES.MaterialCommunityIcons, iconName: 'bike', size: 36 },
          title: 'Order Accepted',
          subtitle: 'Order has been accepted by the restaurant.',
        };
      case 'preparing':
        return {
          key: 'prep',
          overlayTitle: '',
          icon: { componentName: VARIABLES.MaterialCommunityIcons, iconName: 'room-service', size: 36 },
          title: 'Preparing Order',
          subtitle: 'Your order is being prepared. It takes upto 2 - 3 minutes to prepare the order.',
        };
      case 'picked_up':
        return {
          key: 'picked',
          overlayTitle: '',
          icon: { componentName: VARIABLES.MaterialCommunityIcons, iconName: 'package-variant', size: 36 },
          title: 'Picked Up',
          subtitle: 'Your order has been picked up',
        };
      case 'on_the_way':
        return {
          key: 'way',
          overlayTitle: '',
          icon: { componentName: VARIABLES.MaterialCommunityIcons, iconName: 'bike', size: 36 },
          title: 'On the way',
          subtitle: "Your order is on it's way",
        };
      default:
        return {
          key: 'done',
          overlayTitle: '',
          icon: { componentName: VARIABLES.Entypo, iconName: 'check', size: 40 },
          title: 'Delivered',
          subtitle: 'Parcel has been delivered',
        };
    }
  }, [phase]);

  const isDelivered = phase === 'delivered';
  const showOverlayCard =
    phase === 'placing_order' || phase === 'order_placed' || phase === 'order_accepted';

  return (
    <Wrapper
      headerTitle='Food Delivery'
      showBackButton
      backIconStyle={BACK_ICON}
      useScrollView={false}
      backgroundColor={COLORS.WHITE}
      darkMode={false}
    >
      {showMap ? (
        <View style={styles.mapWrap}>
          <ParcelRouteMap
            pickup={pickup}
            dropoff={dropoff}
            mapRegion={mapRegion}
            mapRef={mapRef}
            onDirectionsReady={onDirectionsReady}
          >
            {courierCoord && phase !== 'delivered' ? (
              <Marker coordinate={courierCoord} anchor={{ x: 0.5, y: 0.5 }}>
                <Icon
                  componentName={VARIABLES.MaterialCommunityIcons}
                  iconName='motorbike'
                  size={28}
                  color={COLORS.APP_SECONDARY}
                />
              </Marker>
            ) : null}
          </ParcelRouteMap>
        </View>
      ) : (
        <View style={styles.heroPlaceholder} />
      )}

      <View style={styles.body}>
        {phase !== 'placing_order' && phase !== 'order_placed' && phase !== 'order_accepted' ? (
          <>
            <RideProgressSegments stepCount={4} activeSegmentIndex={activeSegment} />
            <View style={styles.etaPill}>
              <Typography style={styles.etaTxt}>
                {`Estimated delivery: ${MOCK_FOOD_ORDER.etaLabel}`}
              </Typography>
            </View>
          </>
        ) : null}

        {!showOverlayCard ? (
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
                      size={28}
                      color={COLORS.APP_STAR}
                    />
                  </Pressable>
                ))}
              </View>
            </View>
          </>
        ) : null}
      </View>

      <View style={styles.footer}>
        {isDelivered ? (
          <Pressable style={styles.doneBtn} onPress={() => reset(SCREENS.BOTTOM_STACK)}>
            <Typography style={styles.doneTxt}>Done</Typography>
          </Pressable>
        ) : (
          <Pressable style={styles.cancelSoft} onPress={() => setCancelOpen(true)}>
            <Typography style={styles.cancelSoftTxt}>Cancel Delivery</Typography>
          </Pressable>
        )}
      </View>

      {showOverlayCard ? (
        <View style={styles.overlay} pointerEvents='none'>
          <View style={styles.overlayCard}>
            {status.overlayTitle ? (
              <Typography style={styles.overlayHeading}>{status.overlayTitle}</Typography>
            ) : null}
            <GradientIcon
              {...status.icon}
              color={COLORS.WHITE}
              containerSize={72}
              borderRadius={36}
            />
            <Typography style={styles.overlayTitle}>{status.title}</Typography>
            <Typography style={styles.overlaySubtitle}>{status.subtitle}</Typography>
          </View>
        </View>
      ) : null}

      <CancelReasonModal visible={cancelOpen} onClose={() => setCancelOpen(false)} />
    </Wrapper>
  );
};

const styles = StyleSheet.create({
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
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
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
  },
  rateTitle: {
    fontWeight: FontWeight.Bold,
    fontSize: FontSize.Medium,
    marginBottom: 12,
  },
  stars: {
    flexDirection: 'row',
    gap: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
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
  },
  overlayHeading: {
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.SemiBold,
    color: COLORS.APP_TEXT_MUTED,
    marginBottom: 4,
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
  },
});
