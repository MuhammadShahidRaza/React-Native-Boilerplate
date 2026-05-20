import { useMemo } from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import {
  Button,
  GradientIcon,
  Icon,
  MOCK_PARCEL_COURIER,
  RideVehicleStatsRow,
  Typography,
  Wrapper,
} from 'components/index';
import { VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS, isIOS, parcelCoordsNavParams, resolveParcelTripCoords } from 'utils/index';
import { navigate } from 'navigation/index';
import { SCREENS } from 'constants/routes';
import type { RootStackParamList } from 'navigation/Navigators';

const BACK_ICON_STYLE = { backgroundColor: COLORS.APP_PRIMARY, borderRadius: 12 };

export const CourierMatchedScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, typeof SCREENS.COURIER_MATCHED>>();
  const { pickup, dropoff } = useMemo(() => resolveParcelTripCoords(route.params), [route.params]);
  const navCoords = useMemo(() => parcelCoordsNavParams(pickup, dropoff), [pickup, dropoff]);

  return (
    <Wrapper
      headerTitle='Courier Matched'
      showBackButton
      backIconStyle={BACK_ICON_STYLE}
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

        <View style={styles.card}>
          <Image source={MOCK_PARCEL_COURIER.avatar} style={styles.avatar} />
          <Typography style={styles.name}>{MOCK_PARCEL_COURIER.courierName}</Typography>
          <View style={styles.ratingRow}>
            <Icon
              componentName={VARIABLES.Ionicons}
              iconName='star'
              size={FontSize.Small}
              color={COLORS.APP_STAR}
            />
            <Typography style={styles.rating}>{MOCK_PARCEL_COURIER.rating}</Typography>
          </View>
          <View style={styles.feeBlock}>
            <Typography style={styles.feeLabel}>Delivery Fee</Typography>
            <Typography style={styles.feeAmt}>{MOCK_PARCEL_COURIER.deliveryFee}</Typography>
            <Typography
              style={styles.cash}
            >{`${MOCK_PARCEL_COURIER.paymentMethod} Payment`}</Typography>
          </View>
          <RideVehicleStatsRow
            items={[...MOCK_PARCEL_COURIER.vehicleStats]}
            showVerticalDividers
            marginHorizontal={0}
          />
        </View>

        <Button
          title='Track Delivery'
          onPress={() => navigate(SCREENS.TRACK_PARCEL, { ...navCoords, phase: 'picked_up' })}
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
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
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
  rating: {
    color: COLORS.APP_TEXT,
    marginBottom: -4,
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
