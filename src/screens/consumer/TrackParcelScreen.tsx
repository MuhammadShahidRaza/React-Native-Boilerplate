import { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type MapView from 'react-native-maps';
import { RouteProp, useRoute } from '@react-navigation/native';
import {
  Button,
  BookingRatingStars,
  Icon,
  LiveVehicleMapMarker,
  ParcelCourierCard,
  ParcelRouteMap,
  ParcelTrackingBadge,
  RideAnimatedStatusBlock,
  RideProgressSegments,
  RideVehicleStatsRow,
  SkeletonWrapper,
  Typography,
  WorkerRequestTimer,
  Wrapper,
} from 'components/index';
import { ENV_CONSTANTS, INITIAL_REGION, VARIABLES } from 'constants/common';
import { IMAGES } from 'constants/assets';
import { FontSize, FontWeight } from 'types/fontTypes';
import type { ParcelTrackPhase } from 'types/parcelTrip';
import { COLORS, openPhoneNumber } from 'utils/index';
import type { MapCoord } from 'utils/parcelTripCoords';
import type { RootStackParamList } from 'navigation/index';
import { reset } from 'navigation/index';
import { SCREENS } from 'constants/routes';
import { CancelReasonModal } from './CancelReasonModal';
import { cancelSniftBooking } from 'utils/snliftBookingActions';
import { useParcelTripDisplay } from 'hooks/useParcelTripDisplay';
import { useConsumerBookingTrack } from 'hooks/useConsumerBookingTrack';
import { useBookingRating } from 'hooks/useBookingRating';
import { useThrottledMapCoord } from 'hooks/useThrottledMapCoord';
import { useAlphaBookingStatusCycle } from 'hooks/useAlphaBookingStatusCycle';
import { mapParcelTrackPhase } from 'utils/bookingTrackPhases';
import { resolveParcelDirectionsLeg } from 'utils/trackingDirections';
import { resolveVehicleMapBearing } from 'utils/vehicleMapBearing';
import { navigateToBookingFirebaseChat } from 'utils/bookingFirebaseChat';
import { showToast } from 'utils/toast';

const IS_ALPHA = ENV_CONSTANTS.IS_ALPHA_PHASE;

const PROGRESS_PHASE_INDEX: Record<ParcelTrackPhase, number> = {
  accepted: 0,
  arrived: 0,
  ready_for_pickup: 1,
  picked_up: 2,
  in_transit: 2,
  delivered: 2,
};

function fallbackCoord(lat?: number, lng?: number, latOff = 0.008, lngOff = 0): MapCoord {
  return {
    latitude: lat ?? INITIAL_REGION.latitude + latOff,
    longitude: lng ?? INITIAL_REGION.longitude + lngOff,
  };
}

export const TrackParcelScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, typeof SCREENS.TRACK_PARCEL>>();
  const { bookingId, pickupLat, pickupLng, dropoffLat, dropoffLng } = route.params ?? {};

  const alphaCycle = useAlphaBookingStatusCycle(bookingId);

  const { trip, loading: tripLoading } = useParcelTripDisplay(bookingId);
  const track = useConsumerBookingTrack(
    bookingId,
    { pickupLat, pickupLng, dropoffLat, dropoffLng },
    'bike',
    {
      alphaStatusOverride: IS_ALPHA ? alphaCycle.status ?? undefined : undefined,
    },
  );

  const [cancelOpen, setCancelOpen] = useState(false);
  const [routeCoords, setRouteCoords] = useState<MapCoord[]>([]);
  const {
    rating,
    setRating,
    hasRated,
    submitting: ratingSubmitting,
    submit: submitRating,
  } = useBookingRating(bookingId, track.booking?.booking_type ?? 'parcel');
  const mapRef = useRef<MapView>(null);

  const pickup = track.pickup ?? fallbackCoord(pickupLat, pickupLng);
  const dropoff = track.dropoff ?? fallbackCoord(dropoffLat, dropoffLng, -0.004, 0.005);
  const mapRegion = track.mapRegion ?? {
    latitude: (pickup.latitude + dropoff.latitude) / 2,
    longitude: (pickup.longitude + dropoff.longitude) / 2,
    latitudeDelta: Math.abs(pickup.latitude - dropoff.latitude) * 2 + 0.02,
    longitudeDelta: Math.abs(pickup.longitude - dropoff.longitude) * 2 + 0.02,
  };

  const effectiveStatus =
    IS_ALPHA && alphaCycle.status ? alphaCycle.status : track.status;

  const phase = useMemo((): ParcelTrackPhase => {
    return mapParcelTrackPhase(effectiveStatus);
  }, [effectiveStatus]);

  const directionsOrigin = useThrottledMapCoord(track.providerCoord, 8000, 0.05);

  const directionsLeg = useMemo(
    () => resolveParcelDirectionsLeg(phase, pickup, dropoff, directionsOrigin),
    [phase, pickup, dropoff, directionsOrigin],
  );

  const vehicleBearing = useMemo(
    () => resolveVehicleMapBearing(track.providerCoord, routeCoords, track.providerBearing, 'bike'),
    [routeCoords, track.providerCoord, track.providerBearing],
  );

  const onDirectionsReady = useCallback((coordinates: MapCoord[]) => {
    setRouteCoords(coordinates);
  }, []);

  const status = useMemo(() => {
    switch (phase) {
      case 'accepted':
        return {
          animationKey: 'accepted',
          iconProps: {
            componentName: VARIABLES.Feather,
            iconName: 'user-check',
            size: 36,
            color: COLORS.WHITE,
          },
          title: 'Courier Assigned',
          subtitle: 'Courier has accepted your delivery',
        } as const;
      case 'arrived':
        return {
          animationKey: 'arrived',
          iconProps: {
            componentName: VARIABLES.Feather,
            iconName: 'map-pin',
            size: 36,
            color: COLORS.WHITE,
          },
          title: 'Courier Arrived',
          subtitle: 'Courier has arrived at the pickup location',
        } as const;
      case 'ready_for_pickup':
        return {
          animationKey: 'ready',
          iconProps: {
            componentName: VARIABLES.Feather,
            iconName: 'package',
            size: 36,
            color: COLORS.WHITE,
          },
          title: 'Ready for Pickup',
          subtitle: 'Parcel is ready to be collected',
        } as const;
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
          imageSource: IMAGES.DELIVERY_BIKE,
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
  const showCourier = !isDelivered && Boolean(track.providerCoord);

  return (
    <Wrapper
      headerTitle='Track Parcel'
      showBackButton
      useScrollView
      backgroundColor={COLORS.WHITE}
      darkMode={false}
    >
      <ParcelRouteMap
        pickup={pickup}
        dropoff={dropoff}
        mapRegion={mapRegion}
        mapRef={mapRef}
        directionsLeg={directionsLeg}
        extraRecenterPoints={[track.providerCoord]}
        onDirectionsReady={onDirectionsReady}
      >
        {showCourier && track.providerCoord ? (
          <LiveVehicleMapMarker
            coordinate={track.providerCoord}
            bearing={vehicleBearing}
            kind='bike'
          />
        ) : null}
      </ParcelRouteMap>

      <View style={styles.content}>
        <RideProgressSegments stepCount={3} activeSegmentIndex={PROGRESS_PHASE_INDEX[phase]} />

        <ParcelTrackingBadge trackingId={trip?.trackingId ?? (bookingId ? `SN-${bookingId}` : '—')} />

        <RideAnimatedStatusBlock
          animationKey={status.animationKey}
          iconProps={'iconProps' in status ? status.iconProps : undefined}
          imageSource={'imageSource' in status ? status.imageSource : undefined}
          title={status.title}
          subtitle={status.subtitle}
        />

        

        <ParcelCourierCard
          courierName={trip?.courierName ?? '—'}
          phone={trip?.phone ?? ''}
          avatarSource={trip?.avatar ?? IMAGES.USER}
          onPhonePress={() => {
            if (trip?.phone) {
              openPhoneNumber(trip.phone);
              return;
            }
            showToast({ message: 'Courier phone number is not available.' });
          }}
          onMessagePress={() =>
            navigateToBookingFirebaseChat({
              otherUser: {
                id: trip?.providerId,
                full_name: trip?.courierName,
              },
              bookingId,
            })
          }
        />

        {!isDelivered ? (
          <SkeletonWrapper isLoading={tripLoading && !IS_ALPHA} height={72} count={1}>
            <RideVehicleStatsRow
              items={trip?.vehicleStats ?? []}
              showVerticalDividers
              elevated
              marginHorizontal={0}
            />
          </SkeletonWrapper>
        ) : (
          <>
            <View style={styles.rateWrap}>
              <BookingRatingStars
                title={hasRated ? 'Your rating' : 'Rate your experience'}
                value={rating}
                onChange={hasRated ? undefined : setRating}
                readonly={hasRated}
                size={50}
              />
            </View>
            <Button
              title={hasRated ? 'Done' : ratingSubmitting ? 'Submitting…' : 'Done'}
              disabled={ratingSubmitting}
              onPress={async () => {
                if (!hasRated && rating >= 1) {
                  const ok = await submitRating();
                  if (!ok) return;
                }
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
        onContinue={reason => cancelSniftBooking(bookingId, reason)}
      />
    </Wrapper>
  );
};

const styles = StyleSheet.create({
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
