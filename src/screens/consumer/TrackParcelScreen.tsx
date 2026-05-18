import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';
import { RouteProp, useRoute } from '@react-navigation/native';
import {
  Button,
  Icon,
  MOCK_PARCEL_COURIER,
  ParcelCourierCard,
  ParcelRouteMap,
  ParcelTrackingBadge,
  RideAnimatedStatusBlock,
  RideProgressSegments,
  RideVehicleStatsRow,
  Typography,
  Wrapper,
} from 'components/index';
import { VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import type { ParcelTrackPhase } from 'types/parcelTrip';
import {
  COLORS,
  coordinateAlongPolyline,
  openPhoneNumber,
  resolveParcelTripCoords,
} from 'utils/index';
import type { MapCoord } from 'utils/parcelTripCoords';
import type { RootStackParamList } from 'navigation/index';
import { navigate, reset } from 'navigation/index';
import { SCREENS } from 'constants/routes';
import { CancelReasonModal } from './CancelReasonModal';

const BACK_ICON_STYLE = { backgroundColor: COLORS.APP_PRIMARY, borderRadius: 12 };

const PROGRESS_PHASE_INDEX: Record<ParcelTrackPhase, number> = {
  picked_up: 0,
  in_transit: 1,
  delivered: 2,
};

const PHASE_AUTO_MS: Record<Exclude<ParcelTrackPhase, 'delivered'>, number> = {
  picked_up: 4500,
  in_transit: 9000,
};

export const TrackParcelScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, typeof SCREENS.TRACK_PARCEL>>();
  const phaseParam = route.params?.phase;
  const initialPhase: ParcelTrackPhase =
    phaseParam === 'delivered'
      ? 'delivered'
      : phaseParam === 'picked_up'
        ? 'picked_up'
        : 'picked_up';

  const { pickup, dropoff, mapRegion } = useMemo(
    () => resolveParcelTripCoords(route.params),
    [route.params],
  );

  const [phase, setPhase] = useState<ParcelTrackPhase>(initialPhase);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [routeCoords, setRouteCoords] = useState<MapCoord[]>([]);
  const [courierCoord, setCourierCoord] = useState<MapCoord | null>(null);
  const mapRef = useRef<MapView>(null);

  const onDirectionsReady = useCallback((coordinates: MapCoord[]) => {
    setRouteCoords(coordinates);
  }, []);

  useEffect(() => {
    if (phase === 'delivered') return undefined;
    const ms = PHASE_AUTO_MS[phase];
    const tid = setTimeout(() => {
      setPhase(curr => {
        if (curr === 'picked_up') return 'in_transit';
        if (curr === 'in_transit') return 'delivered';
        return curr;
      });
    }, ms);
    return () => clearTimeout(tid);
  }, [phase]);

  useEffect(() => {
    if (phase === 'delivered') {
      setCourierCoord(null);
      return undefined;
    }
    let raf = 0;

    const loop = () => {
      const t = Date.now() / 1000;
      const wave = (Math.sin(t * Math.PI * 2 * 0.22) + 1) / 2;

      if (phase === 'picked_up') {
        setCourierCoord(pickup);
      } else if (phase === 'in_transit' && routeCoords.length >= 2) {
        setCourierCoord(coordinateAlongPolyline(routeCoords, 0.08 + wave * 0.84));
      }

      raf = requestAnimationFrame(loop);
    };

    loop();
    return () => cancelAnimationFrame(raf);
  }, [phase, pickup, routeCoords]);

  const status = useMemo(() => {
    switch (phase) {
      case 'picked_up':
        return {
          animationKey: 'picked',
          iconProps: {
            componentName: VARIABLES.Feather,
            iconName: 'package',
            size: 36,
            color: COLORS.WHITE,
          },
          title: 'Parcel Picked Up',
          subtitle: 'Courier has collected your parcel',
        } as const;
      case 'in_transit':
        return {
          animationKey: 'transit',
          iconProps: {
            componentName: VARIABLES.FontAwesome,
            iconName: 'bicycle',
            size: 36,
            color: COLORS.WHITE,
          },
          title: 'On the Way',
          subtitle: 'Your parcel is heading to the destination',
        } as const;
      default:
        return {
          animationKey: 'delivered',
          iconProps: {
            componentName: VARIABLES.Feather,
            iconName: 'check',
            size: 40,
            color: COLORS.WHITE,
          },
          title: 'Delivered',
          subtitle: 'Parcel has been delivered',
        } as const;
    }
  }, [phase]);

  const isDelivered = phase === 'delivered';

  return (
    <Wrapper
      headerTitle='Track Parcel'
      showBackButton
      backIconStyle={BACK_ICON_STYLE}
      useScrollView
      backgroundColor={COLORS.WHITE}
      darkMode={false}
    >
      <ParcelRouteMap
        pickup={pickup}
        dropoff={dropoff}
        mapRegion={mapRegion}
        mapRef={mapRef}
        onDirectionsReady={onDirectionsReady}
      >
        {courierCoord ? (
          <Marker coordinate={courierCoord} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.courierMarker}>
              <Icon
                componentName={VARIABLES.MaterialCommunityIcons}
                iconName='bicycle'
                size={14}
                color={COLORS.APP_TEXT}
              />
            </View>
          </Marker>
        ) : null}
      </ParcelRouteMap>

      <View style={styles.content}>
        <RideProgressSegments stepCount={3} activeSegmentIndex={PROGRESS_PHASE_INDEX[phase]} />

        <ParcelTrackingBadge trackingId={MOCK_PARCEL_COURIER.trackingId} />

        <RideAnimatedStatusBlock
          animationKey={status.animationKey}
          iconProps={status.iconProps}
          title={status.title}
          subtitle={status.subtitle}
        />

        <ParcelCourierCard
          courierName={MOCK_PARCEL_COURIER.courierName}
          phone={MOCK_PARCEL_COURIER.phone}
          avatarSource={MOCK_PARCEL_COURIER.avatar}
          onPhonePress={() => openPhoneNumber(MOCK_PARCEL_COURIER.phone)}
          onMessagePress={() => navigate(SCREENS.MESSAGES_SOCKET)}
        />

        {!isDelivered ? (
          <RideVehicleStatsRow
            items={[...MOCK_PARCEL_COURIER.vehicleStats]}
            showVerticalDividers
            elevated
            marginHorizontal={0}
          />
        ) : (
          <>
            <View style={styles.rateWrap}>
              <Typography style={styles.rateTitle}>Rate your experience</Typography>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map(step => (
                  <Pressable key={step} onPress={() => setRating(step)} hitSlop={8}>
                    <Icon
                      componentName={VARIABLES.Ionicons}
                      iconName={step <= rating ? 'star' : 'star-outline'}
                      size={50}
                      color={step <= rating ? COLORS.APP_STAR : COLORS.APP_LINE}
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
        )}

        {!isDelivered ? (
          <Pressable style={styles.cancelSoft} onPress={() => setCancelOpen(true)}>
            <Typography style={styles.cancelSoftTxt}>Cancel Delivery</Typography>
          </Pressable>
        ) : null}
      </View>

      <CancelReasonModal
        visible={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onContinue={() => setCancelOpen(false)}
      />
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  courierMarker: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 6,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.APP_LINE,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
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
    fontWeight: FontWeight.SemiBold,
    color: COLORS.APP_TEXT,
    marginBottom: 5,
    fontSize: FontSize.ExtraLarge,
  },
  stars: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },

  cancelSoft: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 28,
    backgroundColor: COLORS.APP_DANGER_BG,
    alignItems: 'center',
  },
  cancelSoftTxt: {
    color: COLORS.APP_DANGER_TEXT,
    fontSize: FontSize.MediumSmall,
    fontWeight: FontWeight.SemiBold,
  },
  doneBtn: {
    marginTop: 16,
  },
});
