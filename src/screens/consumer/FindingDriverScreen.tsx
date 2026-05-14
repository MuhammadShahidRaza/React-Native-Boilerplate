import { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Pressable } from 'react-native';
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Icon, Wrapper, GradientIcon, Typography } from 'components/index';
import { INITIAL_REGION, VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS } from 'utils/index';
import { navigate } from 'navigation/index';
import { SCREENS } from 'constants/routes';
import { useState } from 'react';
import { CancelReasonModal } from './CancelReasonModal';

const BACK_ICON_STYLE = { backgroundColor: COLORS.APP_PRIMARY, borderRadius: 12 };

const PICKUP = { latitude: INITIAL_REGION.latitude + 0.008, longitude: INITIAL_REGION.longitude };
const DROPOFF = { latitude: INITIAL_REGION.latitude - 0.004, longitude: INITIAL_REGION.longitude + 0.005 };
const ROUTE_COORDS = [
  PICKUP,
  { latitude: INITIAL_REGION.latitude + 0.003, longitude: INITIAL_REGION.longitude + 0.002 },
  DROPOFF,
];
const MAP_REGION = {
  latitude: INITIAL_REGION.latitude + 0.002,
  longitude: INITIAL_REGION.longitude + 0.002,
  latitudeDelta: 0.028,
  longitudeDelta: 0.018,
};

export const FindingDriverScreen = () => {
  const [cancelVisible, setCancelVisible] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(1)).current;

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
      navigate(SCREENS.DRIVER_FOUND);
    }, 2800);
    return () => {
      pulse.stop();
      clearTimeout(timer);
    };
  }, [pulseAnim, pulseOpacity]);

  return (
    <Wrapper
      headerTitle="Book a Ride"
      showBackButton
      backIconStyle={BACK_ICON_STYLE}
      useScrollView={false}
      darkMode={false}
    >
      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={StyleSheet.absoluteFill}
          initialRegion={MAP_REGION}
          scrollEnabled={false}
          showsUserLocation
          showsMyLocationButton={false}
          showsCompass={false}
          userInterfaceStyle="light"
        >
          <Polyline coordinates={ROUTE_COORDS} strokeColor="#374151" strokeWidth={3} />
          <Marker coordinate={PICKUP} anchor={{ x: 0.5, y: 1 }}>
            <Icon
              componentName={VARIABLES.MaterialCommunityIcons}
              iconName="map-marker"
              size={34}
              color={COLORS.APP_PRIMARY}
            />
          </Marker>
          <Marker coordinate={DROPOFF} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.dropoffDot} />
          </Marker>
        </MapView>
      </View>

      {/* Finding content */}
      <View style={styles.center}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }], opacity: pulseOpacity }}>
          <GradientIcon
            componentName={VARIABLES.MaterialCommunityIcons}
            iconName="car"
            size={52}
            color={COLORS.WHITE}
            containerSize={120}
            borderRadius={60}
          />
        </Animated.View>
        <Typography style={styles.title}>Finding Your Driver...</Typography>
        <Typography style={styles.sub}>This Usually Takes 30 Seconds</Typography>
        <Pressable style={styles.cancelBtn} onPress={() => setCancelVisible(true)}>
          <Typography style={styles.cancelTxt}>Cancel</Typography>
        </Pressable>
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
  mapContainer: {
    height: 220,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  dropoffDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.APP_SECONDARY,
    borderWidth: 2,
    borderColor: COLORS.WHITE,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 24,
  },
  title: {
    fontSize: FontSize.ExtraLarge,
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
    textAlign: 'center',
    marginTop: 28,
  },
  sub: {
    fontSize: FontSize.MediumSmall,
    color: COLORS.APP_TEXT_MUTED,
    textAlign: 'center',
    marginTop: 8,
  },
  cancelBtn: {
    marginTop: 32,
    backgroundColor: COLORS.APP_DANGER_BG,
    paddingHorizontal: 44,
    paddingVertical: 14,
    borderRadius: 28,
  },
  cancelTxt: {
    color: COLORS.APP_DANGER_TEXT,
    fontSize: FontSize.MediumSmall,
    fontWeight: FontWeight.SemiBold,
  },
});
