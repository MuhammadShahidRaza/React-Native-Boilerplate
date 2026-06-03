import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import {
  AppGradient,
  GRADIENT_END,
  GRADIENT_START,
  Typography,
  Wrapper,
} from 'components/index';
import { IMAGES } from 'constants/assets';
import { FontSize, FontWeight } from 'types/fontTypes';
import { BRAND_PRIMARY, BRAND_SECONDARY, COLORS, parcelCoordsNavParams, resolveParcelTripCoords } from 'utils/index';
import { onBack, replace } from 'navigation/index';
import { cancelSniftBooking } from 'utils/snliftBookingActions';
import { SCREENS } from 'constants/routes';
import type { RootStackParamList } from 'navigation/Navigators';
import { CancelReasonModal } from './CancelReasonModal';

 
export const SendParcelFindingScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, typeof SCREENS.SEND_PARCEL_FINDING>>();
  const [cancelVisible, setCancelVisible] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(1)).current;

  const { pickup, dropoff } = useMemo(
    () => resolveParcelTripCoords(route.params),
    [route.params],
  );

  const bookingId = route.params?.bookingId;

  const navCoords = useMemo(
    () => parcelCoordsNavParams(pickup, dropoff, bookingId),
    [pickup, dropoff, bookingId],
  );

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseAnim, { toValue: 1.18, duration: 750, useNativeDriver: true }),
          Animated.timing(pulseOpacity, { toValue: 0.6, duration: 750, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(pulseAnim, { toValue: 1, duration: 750, useNativeDriver: true }),
          Animated.timing(pulseOpacity, { toValue: 1, duration: 750, useNativeDriver: true }),
        ]),
      ]),
    );
    pulse.start();
    const timer = setTimeout(() => {
      pulse.stop();
      replace(SCREENS.COURIER_MATCHED, navCoords);
    }, 2800);
    return () => {
      pulse.stop();
      clearTimeout(timer);
    };
  }, [pulseAnim, pulseOpacity, navCoords]);

  return (
    <Wrapper
      headerTitle='Send Parcel'
      showBackButton
       
      useScrollView={false}
      backgroundColor={COLORS.WHITE}
      darkMode={false}
    >
      <View style={styles.center}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }], opacity: pulseOpacity }}>
          <AppGradient
            colors={[BRAND_SECONDARY, BRAND_PRIMARY]}
            start={GRADIENT_START}
            end={GRADIENT_END}
            fill
            style={styles.iconCircle}
          >
            <Image source={IMAGES.DELIVERY_BIKE} style={styles.bikeIcon} resizeMode='contain' />
          </AppGradient>
        </Animated.View>
        <Typography style={styles.title}>Finding a Courier...</Typography>
        <Typography style={styles.sub}>Please wait while we match you</Typography>
      </View>

      <CancelReasonModal
        visible={cancelVisible}
        onClose={() => setCancelVisible(false)}
        onContinue={async reason => {
          setCancelVisible(false);
          const ok = await cancelSniftBooking(bookingId, reason);
          if (ok) onBack();
        }}
      />
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 24,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bikeIcon: {
    width: 56,
    height: 56,
    tintColor: COLORS.WHITE,
  },
  title: {
    fontSize: FontSize.XL,
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
    textAlign: 'center',
    marginTop: 28,
  },
  sub: {
    color: COLORS.APP_TEXT_SMALL,
    textAlign: 'center',
    marginTop: 4,
  },
});
