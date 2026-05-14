import { StyleSheet, View, Image, Pressable } from 'react-native';
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Icon, Wrapper, GradientIcon, AppGradient, Button, Typography } from 'components/index';
import { INITIAL_REGION, VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS } from 'utils/index';
import { IMAGES } from 'constants/assets';
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

export const DriverFoundScreen = () => {
  const [cancelVisible, setCancelVisible] = useState(false);

  return (
    <Wrapper
      headerTitle="Book a Ride"
      showBackButton
      backIconStyle={BACK_ICON_STYLE}
      useScrollView
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

      <View style={styles.content}>
        {/* Check icon */}
        <View style={styles.iconWrap}>
          <GradientIcon
            componentName={VARIABLES.Feather}
            iconName="check"
            size={40}
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
                  iconName="star"
                  size={FontSize.Small}
                  color={COLORS.APP_STAR}
                />
                <Typography style={styles.rating}>4.9</Typography>
              </View>
            </View>
            <AppGradient variant="primaryLight" style={styles.contactCircle}>
              <Icon componentName={VARIABLES.Feather} iconName="phone" size={16} color={COLORS.WHITE} />
            </AppGradient>
            <View style={[styles.contactCircle, { backgroundColor: COLORS.APP_SECONDARY, marginLeft: 8 }]}>
              <Icon componentName={VARIABLES.Feather} iconName="mail" size={16} color={COLORS.WHITE} />
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
          <StatItem icon="car" label="Vehicle Type" value="Toyota" />
          <View style={styles.statDivider} />
          <StatItem icon="card-text-outline" label="License Plate" value="AA-001-AA" />
          <View style={styles.statDivider} />
          <StatItem icon="water" label="Color" value="Black" />
        </View>

        <Button
          title="Track Ride"
          style={styles.ctaBtn}
          onPress={() => navigate(SCREENS.TRACK_RIDE, { phase: 'in_progress' })}
        />
      </View>

      <CancelReasonModal
        visible={cancelVisible}
        onClose={() => setCancelVisible(false)}
        onContinue={() => { setCancelVisible(false); navigate(SCREENS.BOOK_RIDE); }}
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
    height: 200,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 4,
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
    backgroundColor: COLORS.WHITE,
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
    fontSize: FontSize.MediumSmall,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardDivider: {
    height: 1,
    backgroundColor: COLORS.APP_LINE,
    marginVertical: 12,
  },
  carRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  carModel: {
    fontSize: FontSize.Small,
    fontWeight: FontWeight.SemiBold,
    color: COLORS.APP_TEXT,
  },
  carPlate: {
    fontSize: FontSize.Small,
    color: COLORS.APP_TEXT_MUTED,
    marginTop: 2,
  },
  inlineCancelBtn: {
    backgroundColor: COLORS.APP_DANGER_BG,
    paddingHorizontal: 18,
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
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: FontSize.Small,
    fontWeight: FontWeight.SemiBold,
    color: COLORS.APP_TEXT,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: FontSize.XsSmall,
    color: COLORS.APP_TEXT_MUTED,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: COLORS.APP_LINE,
    marginHorizontal: 4,
  },
  ctaBtn: { marginTop: 4 },
});
