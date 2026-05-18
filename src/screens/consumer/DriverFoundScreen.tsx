import { StyleSheet, View, Image, Pressable } from 'react-native';
import type MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';
import {
  Icon,
  Wrapper,
  GradientIcon,
  AppGradient,
  Button,
  Typography,
  Map,
} from 'components/index';
import { ENV_CONSTANTS, INITIAL_REGION, VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS, fitMapToDirectionCoordinates, openPhoneNumber, screenHeight } from 'utils/index';
import { IMAGES } from 'constants/assets';
import { navigate, replace, type RootStackParamList } from 'navigation/index';
import { SCREENS } from 'constants/routes';
import { useMemo, useRef, useState } from 'react';
import { CancelReasonModal } from './CancelReasonModal';
import MapViewDirections from 'react-native-maps-directions';
import { RouteProp, useRoute } from '@react-navigation/native';

const BACK_ICON_STYLE = { backgroundColor: COLORS.APP_PRIMARY, borderRadius: 12 };

export const DriverFoundScreen = () => {
  const [cancelVisible, setCancelVisible] = useState(false);

  const route = useRoute<RouteProp<RootStackParamList, typeof SCREENS.DRIVER_FOUND>>();
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

  return (
    <Wrapper
      headerTitle='Book a Ride'
      showBackButton
      backIconStyle={BACK_ICON_STYLE}
      useScrollView
      backgroundColor={COLORS.WHITE}
      darkMode={false}
    >
      <View style={styles.mapContainer}>
        <Map
          key={`driver-found-${pickupCoord.latitude}-${pickupCoord.longitude}-${dropoffCoord.latitude}-${dropoffCoord.longitude}`}
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

      <View style={styles.content}>
        {/* Check icon */}
        <View style={styles.iconWrap}>
          <GradientIcon
            componentName={VARIABLES.Entypo}
            iconName='check'
            size={50}
            color={COLORS.WHITE}
            containerSize={88}
            borderRadius={44}
          />
        </View>

        {/* Driver card */}
        <View style={styles.card}>
          <View style={styles.driverRow}>
            <Image source={IMAGES.USER} style={styles.avatar} />
            <View style={styles.driverInfo}>
              <Typography style={styles.driverName}>John Doe</Typography>
              <View style={styles.ratingRow}>
                <Icon
                  componentName={VARIABLES.Ionicons}
                  iconName='star'
                  size={FontSize.Small}
                  color={COLORS.APP_STAR}
                />
                <Typography style={styles.rating}>4.9</Typography>
              </View>
            </View>
            <AppGradient variant='primaryLight' style={styles.contactCircle}>
              <Icon
                componentName={VARIABLES.Feather}
                iconName='phone'
                size={16}
                color={COLORS.WHITE}
                onPress={() => openPhoneNumber('+237 6 99 99 99 99')}
              />
            </AppGradient>
            <View
              style={[
                styles.contactCircle,
                { backgroundColor: COLORS.APP_SECONDARY, marginLeft: 8 },
              ]}
            >
              <Icon
                componentName={VARIABLES.Feather}
                iconName='mail'
                size={16}
                color={COLORS.WHITE}
                onPress={() => navigate(SCREENS.MESSAGES_SOCKET)}
              />
            </View>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.carRow}>
            <View>
              <Typography style={styles.carModel}>Toyota Corolla</Typography>
              <Typography style={styles.carPlate}>ABC-1234</Typography>
            </View>
            <Pressable style={styles.inlineCancelBtn} onPress={() => setCancelVisible(true)}>
              <Typography style={styles.inlineCancelTxt}>Cancel</Typography>
            </Pressable>
          </View>
        </View>

        {/* Vehicle stats */}
        <View style={styles.statsRow}>
          <StatItem icon='car' label='Vehicle Type' value='Toyota' />
          {/* <View style={styles.statDivider} /> */}
          <StatItem icon='card-text-outline' label='License Plate' value='AA-001-AA' />
          {/* <View style={styles.statDivider} /> */}
          <StatItem icon='water' label='Color' value='Black' />
        </View>

        <Button
          title='Track Ride'
          style={styles.ctaBtn}
          onPress={() => replace(SCREENS.TRACK_RIDE, { phase: 'in_progress' })}
        />
      </View>

      <CancelReasonModal
        visible={cancelVisible}
        onClose={() => setCancelVisible(false)}
        onContinue={() => {
          setCancelVisible(false);
          replace(SCREENS.BOOK_RIDE);
        }}
      />
    </Wrapper>
  );
};

const StatItem = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
  <View style={styles.statItem}>
    <Icon
      componentName={VARIABLES.MaterialCommunityIcons}
      iconName={icon}
      size={22}
      color={COLORS.APP_PRIMARY}
    />
    <Typography style={styles.statValue}>{value}</Typography>
    <Typography style={styles.statLabel}>{label}</Typography>
  </View>
);

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

  dropoffDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.APP_SECONDARY,
    borderWidth: 2,
    borderColor: COLORS.WHITE,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  iconWrap: {
    alignItems: 'center',
    marginBottom: 16,
  },
  card: {
    backgroundColor: COLORS.SEARCH_BAR,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 10,
  },
  driverInfo: { flex: 1 },
  driverName: {
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  rating: {
    fontSize: FontSize.Small,
    color: COLORS.APP_TEXT_MUTED,
  },
  contactCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    opacity: 0.7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardDivider: {
    // height: 1,
    backgroundColor: COLORS.APP_LINE,
    marginVertical: 7,
  },
  carRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  carModel: {
    fontSize: FontSize.MediumSmall,
    fontWeight: FontWeight.SemiBold,
    color: COLORS.APP_TEXT,
  },
  carPlate: {
    fontSize: FontSize.Small,
    color: COLORS.APP_TEXT_SMALL,
  },
  inlineCancelBtn: {
    backgroundColor: COLORS.APP_DANGER_BG,
    paddingHorizontal: 25,
    paddingVertical: 8,
    borderRadius: 20,
  },
  inlineCancelTxt: {
    color: COLORS.APP_DANGER_TEXT,
    fontSize: FontSize.Small,
    fontWeight: FontWeight.SemiBold,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.WHITE,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    marginHorizontal: 20,
    // shadowColor: '#000',
    // shadowOpacity: 0.05,
    // shadowRadius: 8,
    // elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 1,
  },
  statValue: {
    fontSize: FontSize.MediumSmall,
    fontWeight: FontWeight.SemiBold,
    color: COLORS.APP_TEXT,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: FontSize.Small,
    color: COLORS.APP_TEXT_SMALL,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: COLORS.APP_LINE,
    marginHorizontal: 4,
  },
  ctaBtn: { marginTop: 4, marginHorizontal: 30 },
});
