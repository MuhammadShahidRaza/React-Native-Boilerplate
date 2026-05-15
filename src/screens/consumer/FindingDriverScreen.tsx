import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, Animated, Pressable } from 'react-native';
import { Marker } from 'react-native-maps';
import type MapView from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Icon, Wrapper, GradientIcon, Typography, Map } from 'components/index';
import { ENV_CONSTANTS, INITIAL_REGION, VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS, screenHeight } from 'utils/index';
import { navigate } from 'navigation/index';
import { SCREENS } from 'constants/routes';
import type { RootStackParamList } from 'navigation/Navigators';
import { CancelReasonModal } from './CancelReasonModal';

const BACK_ICON_STYLE = { backgroundColor: COLORS.APP_PRIMARY, borderRadius: 12 };

export const FindingDriverScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, typeof SCREENS.FINDING_DRIVER>>();
  const [cancelVisible, setCancelVisible] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(1)).current;
  const mapRef = useRef<MapView>(null);

  const { pickupLat, pickupLng, dropoffLat, dropoffLng } = route.params ?? {};

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
      headerTitle='Book a Ride'
      showBackButton
      backIconStyle={BACK_ICON_STYLE}
      useScrollView={false}
      backgroundColor={COLORS.WHITE}
      darkMode={false}
    >
      <View style={styles.mapContainer}>
        <Map
          mapRef={mapRef}
          region={mapRegion}
          scrollEnabled={false}
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
        <Animated.View style={{ transform: [{ scale: pulseAnim }], opacity: pulseOpacity }}>
          <GradientIcon
            componentName={VARIABLES.MaterialCommunityIcons}
            iconName='car'
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
