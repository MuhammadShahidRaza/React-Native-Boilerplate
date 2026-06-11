import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import {
  AppGradient,
  GRADIENT_END,
  GRADIENT_START,
  Typography,
  Wrapper,
  WorkerRequestTimer,
} from 'components/index';
import { IMAGES } from 'constants/assets';
import { FontSize, FontWeight } from 'types/fontTypes';
import {
  APP_GRADIENT_HORIZONTAL,
  COLORS,
  parcelCoordsNavParams,
  resolveParcelTripCoords,
} from 'utils/index';
import { navigate, onBack, replace } from 'navigation/index';
import { cancelSniftBooking } from 'utils/snliftBookingActions';
import { SCREENS } from 'constants/routes';
import type { RootStackParamList } from 'navigation/Navigators';
import { CancelReasonModal } from './CancelReasonModal';
import { JobTimerExpiredModal } from './JobTimerExpiredModal';
import { useJobDisplayTimer } from 'hooks/useJobDisplayTimer';
import { useBookingAcceptPoll } from 'hooks/useBookingAcceptPoll';

export const SendParcelFindingScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, typeof SCREENS.SEND_PARCEL_FINDING>>();
  const [cancelVisible, setCancelVisible] = useState(false);
  const [expiredVisible, setExpiredVisible] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(1)).current;
  const timerHandledRef = useRef(false);

  const { pickup, dropoff } = useMemo(
    () => resolveParcelTripCoords(route.params),
    [route.params],
  );

  const bookingId = route.params?.bookingId;
  const createdAt = useMemo(
    () => route.params?.createdAt ?? new Date().toISOString(),
    [route.params?.createdAt],
  );
  const timerDurationSeconds = route.params?.timerDurationSeconds;
  const { expiresAt, ready } = useJobDisplayTimer(createdAt, timerDurationSeconds);

  const navCoords = useMemo(
    () => parcelCoordsNavParams(pickup, dropoff, bookingId, createdAt),
    [pickup, dropoff, bookingId, createdAt],
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
    return () => pulse.stop();
  }, [pulseAnim, pulseOpacity]);

  const goToCourierMatched = useCallback(() => {
    replace(SCREENS.COURIER_MATCHED, navCoords);
  }, [navCoords]);

  useBookingAcceptPoll(bookingId, goToCourierMatched);

  const handleTimerExpire = () => {
    if (timerHandledRef.current) return;
    timerHandledRef.current = true;
    setExpiredVisible(true);
  };

  const handleSearchAgain = async () => {
    setExpiredVisible(false);
    await cancelSniftBooking(bookingId, 'Courier search timeout — searching again');
    navigate(SCREENS.SEND_PARCEL);
  };

  const timerSubtitle = ready && expiresAt
    ? 'Time remaining is shown above'
    : 'Please wait while we match you';

  return (
    <Wrapper
      headerTitle='Send Parcel'
      showBackButton
      useScrollView={false}
      backgroundColor={COLORS.WHITE}
      darkMode={false}
    >
      <View style={styles.center}>
        {ready && expiresAt ? (
          <View style={styles.timerWrap}>
            <WorkerRequestTimer
              expiresAt={expiresAt}
              onExpire={handleTimerExpire}
              active={!expiredVisible}
            />
          </View>
        ) : null}
        <Animated.View style={{ transform: [{ scale: pulseAnim }], opacity: pulseOpacity }}>
          <AppGradient
            colors={[...APP_GRADIENT_HORIZONTAL]}
            start={GRADIENT_START}
            end={GRADIENT_END}
            fill
            style={styles.iconCircle}
          >
            <Image source={IMAGES.DELIVERY_BIKE} style={styles.bikeIcon} resizeMode='contain' />
          </AppGradient>
        </Animated.View>
        <Typography style={styles.title}>Finding a Courier...</Typography>
        <Typography style={styles.sub}>{timerSubtitle}</Typography>
      </View>

      <JobTimerExpiredModal
        visible={expiredVisible}
        title='No Courier Found'
        description='We could not find a courier in time. Search again or cancel this booking.'
        onSearchAgain={handleSearchAgain}
        onCancel={() => {
          setExpiredVisible(false);
          setCancelVisible(true);
        }}
      />

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
  timerWrap: {
    marginBottom: 16,
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
