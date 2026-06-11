import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { Marker } from 'react-native-maps';
import type MapView from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { useRoute, RouteProp } from '@react-navigation/native';
import {
  Icon,
  Wrapper,
  Typography,
  Map,
  Button,
  SvgComponent,
  AppGradient,
  WorkerRequestTimer,
} from 'components/index';
import { ENV_CONSTANTS, INITIAL_REGION, VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS, screenHeight, fitMapToDirectionCoordinates } from 'utils/index';
import { navigate, onBack, replace } from 'navigation/index';
import { cancelSniftBooking, deleteSniftBooking } from 'utils/snliftBookingActions';
import { SCREENS } from 'constants/routes';
import type { RootStackParamList } from 'navigation/Navigators';
import { CancelReasonModal } from './CancelReasonModal';
import { JobTimerExpiredModal } from './JobTimerExpiredModal';
import { SVG } from 'constants/assets/svg';
import { useJobDisplayTimer } from 'hooks/useJobDisplayTimer';
import { useBookingAcceptPoll } from 'hooks/useBookingAcceptPoll';

export const FindingDriverScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, typeof SCREENS.FINDING_DRIVER>>();
  const [cancelVisible, setCancelVisible] = useState(false);
  const [expiredVisible, setExpiredVisible] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(1)).current;
  const mapRef = useRef<MapView>(null);
  const timerHandledRef = useRef(false);
  const { pickupLat, pickupLng, dropoffLat, dropoffLng, bookingId } = route.params ?? {};
  const createdAt = useMemo(
    () => route.params?.createdAt ?? new Date().toISOString(),
    [route.params?.createdAt],
  );
  const timerDurationSeconds = route.params?.timerDurationSeconds;
  const { expiresAt, ready } = useJobDisplayTimer(createdAt, timerDurationSeconds);

  const pickupCoord = useMemo(
    () => ({
      latitude: pickupLat ?? INITIAL_REGION.latitude + 0.008,
      longitude: pickupLng ?? INITIAL_REGION.longitude,
    }),
    [pickupLat, pickupLng],
  );

  const dropoffCoord = useMemo(
    () => ({
      latitude: dropoffLat ?? INITIAL_REGION.latitude - 0.004,
      longitude: dropoffLng ?? INITIAL_REGION.longitude + 0.005,
    }),
    [dropoffLat, dropoffLng],
  );

  const mapRegion = useMemo(
    () => ({
      latitude: (pickupCoord.latitude + dropoffCoord.latitude) / 2,
      longitude: (pickupCoord.longitude + dropoffCoord.longitude) / 2,
      latitudeDelta: Math.abs(pickupCoord.latitude - dropoffCoord.latitude) * 2 + 0.02,
      longitudeDelta: Math.abs(pickupCoord.longitude - dropoffCoord.longitude) * 2 + 0.02,
    }),
    [pickupCoord, dropoffCoord],
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

  const goToDriverFound = useCallback(() => {
    replace(SCREENS.DRIVER_FOUND, {
      pickupLat: pickupCoord.latitude,
      pickupLng: pickupCoord.longitude,
      dropoffLat: dropoffCoord.latitude,
      dropoffLng: dropoffCoord.longitude,
      bookingId,
    });
  }, [pickupCoord, dropoffCoord, bookingId]);

  useBookingAcceptPoll(bookingId, goToDriverFound);

  const handleTimerExpire = () => {
    if (timerHandledRef.current) return;
    timerHandledRef.current = true;
    setExpiredVisible(true);
  };

  const handleSearchAgain = async () => {
    setExpiredVisible(false);
    const ok = await deleteSniftBooking(bookingId);
    if (ok) {
      // await cancelSniftBooking(bookingId, 'Driver search timeout — searching again');
      navigate(SCREENS.CHOOSE_RIDE, {
        pickupAddress: route.params?.pickupAddress,
        dropoffAddress: route.params?.dropoffAddress,
        pickupLat,
        pickupLng,
        dropoffLat,
        dropoffLng,
      });
    }
  };

  const timerSubtitle =
    ready && expiresAt ? 'Time remaining is shown above' : 'Please wait while we match you';

  return (
    <Wrapper
      headerTitle='Book a Ride'
      showBackButton
      useScrollView={false}
      backgroundColor={COLORS.WHITE}
      darkMode={false}
    >
      <View style={styles.mapContainer}>
        <Map
          key={`finding-${pickupCoord.latitude}-${pickupCoord.longitude}-${dropoffCoord.latitude}-${dropoffCoord.longitude}`}
          mapRef={mapRef}
          region={mapRegion}
          regionTracking='initialOnly'
          scrollEnabled={false}
          showsUserLocationDot={false}
          showCurrentLocation={false}
          showCurrentLocationButton={false}
          mapStyle='light'
          minZoomLevel={0}
        >
          <MapViewDirections
            origin={pickupCoord}
            destination={dropoffCoord}
            apikey={ENV_CONSTANTS.MAP_API_KEY}
            strokeColor={COLORS.APP_PRIMARY}
            strokeWidth={4}
            onReady={result => fitMapToDirectionCoordinates(mapRef, result.coordinates)}
          />
          <Marker
            coordinate={{ latitude: pickupCoord.latitude, longitude: pickupCoord.longitude }}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.pickupMapDot} />
          </Marker>
          <Marker
            coordinate={{ latitude: dropoffCoord.latitude, longitude: dropoffCoord.longitude }}
            anchor={{ x: 0.5, y: 1 }}
          >
            <Icon
              componentName={VARIABLES.MaterialCommunityIcons}
              iconName='map-marker'
              size={30}
              color={COLORS.APP_SECONDARY}
            />
          </Marker>
        </Map>
      </View>

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
        <AppGradient
          variant='icon'
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Animated.View style={{ transform: [{ scale: pulseAnim }], opacity: pulseOpacity }}>
            <SvgComponent Svg={SVG.CAR} svgWidth={52} svgHeight={52} />
          </Animated.View>
        </AppGradient>
        <Typography style={styles.title}>Finding Your Driver...</Typography>
        <Typography style={styles.sub}>{timerSubtitle}</Typography>
      </View>
      <Button
        style={styles.cancelBtn}
        textStyle={styles.cancelTxt}
        title='Cancel'
        onPress={() => setCancelVisible(true)}
      />

      <JobTimerExpiredModal
        visible={expiredVisible}
        title='No Driver Found'
        description='We could not find a driver in time. Search again or cancel this booking.'
        onSearchAgain={handleSearchAgain}
        onCancel={async () => {
          setExpiredVisible(false);
          const ok = await deleteSniftBooking(bookingId);
          if (ok) replace(SCREENS.BOTTOM_STACK);
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
  mapContainer: {
    height: screenHeight(40),
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    overflow: 'hidden',
    marginBottom: 4,
  },
  pickupMapDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.APP_PRIMARY,
    borderWidth: 2,
    borderColor: COLORS.WHITE,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 50,
  },
  timerWrap: {
    bottom: 50,
  },
  title: {
    fontSize: FontSize.ExtraExtraLarge,
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
  cancelBtn: {
    marginBottom: 32,
    backgroundColor: COLORS.APP_DANGER_BG,
    marginHorizontal: 20,
    borderRadius: 28,
  },
  cancelTxt: {
    color: COLORS.RED,
  },
});
