import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import type MapView from 'react-native-maps';
import { useRoute, RouteProp } from '@react-navigation/native';
import { GradientIcon, ParcelRouteMap, Typography, Wrapper } from 'components/index';
import { VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS, parcelCoordsNavParams, resolveParcelTripCoords } from 'utils/index';
import { replace } from 'navigation/index';
import { SCREENS } from 'constants/routes';
import type { RootStackParamList } from 'navigation/Navigators';
import { CancelReasonModal } from './CancelReasonModal';

const BACK_ICON_STYLE = { backgroundColor: COLORS.APP_PRIMARY, borderRadius: 12 };

export const SendParcelFindingScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, typeof SCREENS.SEND_PARCEL_FINDING>>();
  const [cancelVisible, setCancelVisible] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(1)).current;
  const mapRef = useRef<MapView>(null);

  const { pickup, dropoff, mapRegion } = useMemo(
    () => resolveParcelTripCoords(route.params),
    [route.params],
  );

  const navCoords = useMemo(
    () => parcelCoordsNavParams(pickup, dropoff),
    [pickup, dropoff],
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
      backIconStyle={BACK_ICON_STYLE}
      useScrollView={false}
      backgroundColor={COLORS.WHITE}
      darkMode={false}
    >
      {/* <ParcelRouteMap
        pickup={pickup}
        dropoff={dropoff}
        mapRegion={mapRegion}
        mapRef={mapRef}
      /> */}

      <View style={styles.center}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }], opacity: pulseOpacity }}>
          <GradientIcon
            componentName={VARIABLES.FontAwesome}
            iconName='bicycle'
            size={52}
            color={COLORS.WHITE}
            containerSize={120}
            borderRadius={60}
          />
        </Animated.View>
        <Typography style={styles.title}>Finding a Courier...</Typography>
        <Typography style={styles.sub}>Please wait while we match you</Typography>
      </View>

      <CancelReasonModal
        visible={cancelVisible}
        onClose={() => setCancelVisible(false)}
        onContinue={() => setCancelVisible(false)}
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
