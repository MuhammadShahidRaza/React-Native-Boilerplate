import { useEffect, useMemo } from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import {
  Button,
  GradientIcon,
  RideVehicleStatsRow,
  SkeletonWrapper,
  Typography,
  WorkerRequestTimer,
  Wrapper,
} from 'components/index';
import { ENV_CONSTANTS, VARIABLES } from 'constants/common';
import { IMAGES, isSengoBrand } from 'constants/assets';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS, formatMoney, isIOS } from 'utils/index';
import { replace } from 'navigation/index';
import { SCREENS } from 'constants/routes';
import type { RootStackParamList } from 'navigation/Navigators';
import { useParcelTripDisplay } from 'hooks/useParcelTripDisplay';
import { useConsumerBookingTrack } from 'hooks/useConsumerBookingTrack';
import { ALPHA_PHASE_DURATION_MS } from 'utils/alphaStatusCycle';

const IS_ALPHA = ENV_CONSTANTS.IS_ALPHA_PHASE;

export const CourierMatchedScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, typeof SCREENS.COURIER_MATCHED>>();
  const { bookingId, pickupLat, pickupLng, dropoffLat, dropoffLng } = route.params ?? {};
  const { trip, loading } = useParcelTripDisplay(bookingId);
  const track = useConsumerBookingTrack(
    bookingId,
    { pickupLat, pickupLng, dropoffLat, dropoffLng },
    'bike',
  );

  const trackParams = useMemo(
    () => ({
      bookingId,
      pickupLat: track.pickup?.latitude ?? pickupLat,
      pickupLng: track.pickup?.longitude ?? pickupLng,
      dropoffLat: track.dropoff?.latitude ?? dropoffLat,
      dropoffLng: track.dropoff?.longitude ?? dropoffLng,
      phase: 'picked_up' as const,
    }),
    [bookingId, track.pickup, track.dropoff, pickupLat, pickupLng, dropoffLat, dropoffLng],
  );

  const deliveryFee = track.booking?.total_amount ?? track.booking?.estimated_amount;

  useEffect(() => {
    if (!IS_ALPHA || !bookingId) return;
    const timeoutId = setTimeout(() => {
      replace(SCREENS.TRACK_PARCEL, trackParams);
    }, ALPHA_PHASE_DURATION_MS);
    return () => clearTimeout(timeoutId);
  }, [bookingId, trackParams]);

  return (
    <Wrapper
      headerTitle='Courier Matched'
      showBackButton
      useScrollView
      backgroundColor={COLORS.WHITE}
      darkMode={false}
    >
      <View style={styles.body}>
        <GradientIcon
          componentName={VARIABLES.Feather}
          iconName='check'
          size={40}
          color={COLORS.WHITE}
          containerStyle={styles.check}
        />
        <Typography style={styles.headline}>Courier Found!</Typography>

        <SkeletonWrapper isLoading={loading && !ENV_CONSTANTS.IS_ALPHA_PHASE} height={220} count={1}>
          <View style={styles.card}>
            <Image source={trip?.avatar ?? IMAGES.USER} style={styles.avatar} />
            <Typography style={styles.name}>{trip?.courierName ?? '—'}</Typography>
            <View style={styles.feeBlock}>
              <Typography style={styles.feeLabel}>Delivery Fee</Typography>
              <Typography style={styles.feeAmt}>
                {deliveryFee != null ? formatMoney(deliveryFee) : '—'}
              </Typography>
              <Typography style={styles.cash}>
                {isSengoBrand() ? 'Card Payment' : 'Cash Payment'}
              </Typography>
            </View>
            <RideVehicleStatsRow
              items={trip?.vehicleStats ?? []}
              showVerticalDividers
              marginHorizontal={0}
            />
          </View>
        </SkeletonWrapper>


        <Button
          title='Track Delivery'
          onPress={() => replace(SCREENS.TRACK_PARCEL, trackParams)}
          style={styles.cta}
          textStyle={styles.ctaText}
        />
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 32,
    alignItems: 'center',
  },
  check: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  headline: {
    fontSize: FontSize.XL,
    fontWeight: FontWeight.SemiBold,
    color: COLORS.APP_TEXT,
    marginBottom: 20,
  },
  card: {
    width: isIOS() ? '90%' : '80%',
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.APP_LINE,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 28,
  },
  name: {
    fontWeight: FontWeight.SemiBold,
    fontSize: FontSize.ExtraLarge,
    color: COLORS.APP_TEXT,
    marginTop: 3,
  },
  feeBlock: {
    borderColor: COLORS.APP_LINE,
    paddingTop: 12,
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
  },
  feeLabel: {
    color: COLORS.APP_TEXT_SMALL,
    fontSize: FontSize.Small,
  },
  feeAmt: {
    fontSize: FontSize.XXL,
    fontWeight: FontWeight.SemiBold,
    color: COLORS.APP_TEXT,
  },
  cash: {
    color: COLORS.APP_PRIMARY,
  },
  cta: {
    width: '90%',
    marginTop: 100,
    backgroundColor: COLORS.APP_SECONDARY,
  },
  ctaText: {
    color: COLORS.WHITE,
    fontWeight: FontWeight.Bold,
  },
});
