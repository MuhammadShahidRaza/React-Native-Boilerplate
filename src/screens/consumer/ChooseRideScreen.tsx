import { useState } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Icon, Wrapper, AppGradient, Button, Typography, Input } from 'components/index';
import { INITIAL_REGION, VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS } from 'utils/index';
import { navigate } from 'navigation/index';
import { SCREENS } from 'constants/routes';
import { useRoute, RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from 'navigation/Navigators';

const BACK_ICON_STYLE = { backgroundColor: COLORS.APP_PRIMARY, borderRadius: 12 };

const RIDE_TYPES = [
  {
    id: 'basic',
    label: 'Basic',
    desc: 'Affordable Everyday Rides',
    price: 'CFA 330',
    eta: '5-8 min',
    colors: [COLORS.APP_SECONDARY, '#003B99'] as string[],
  },
  {
    id: 'ac_comfort',
    label: 'AC Comfort',
    desc: 'Cool & Comfortable Rides',
    price: 'CFA 330',
    eta: '5-8 min',
    colors: [COLORS.APP_PRIMARY, COLORS.APP_PRIMARY_LIGHT] as string[],
  },
  {
    id: 'premium',
    label: 'Premium',
    desc: 'Luxury',
    price: 'CFA 330',
    eta: '5-8 min',
    colors: ['#4B5563', '#1F2937'] as string[],
  },
];

const PICKUP = { latitude: INITIAL_REGION.latitude + 0.008, longitude: INITIAL_REGION.longitude };
const DROPOFF = {
  latitude: INITIAL_REGION.latitude - 0.004,
  longitude: INITIAL_REGION.longitude + 0.005,
};
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

export const ChooseRideScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, typeof SCREENS.CHOOSE_RIDE>>();
  const [selected, setSelected] = useState('basic');
  const [promo, setPromo] = useState('');

  return (
    <Wrapper
      headerTitle='Book a Ride'
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
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={false}
          userInterfaceStyle='light'
        >
          <Polyline coordinates={ROUTE_COORDS} strokeColor='#374151' strokeWidth={3} />
          <Marker coordinate={PICKUP} anchor={{ x: 0.5, y: 1 }}>
            <Icon
              componentName={VARIABLES.MaterialCommunityIcons}
              iconName='map-marker'
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
        <Typography style={styles.sectionTitle}>Choose Ride Type</Typography>
        <Typography translate={false} style={styles.distanceTxt}>Estimated Distance: 12 km</Typography>

        {RIDE_TYPES.map(ride => {
          const isSel = selected === ride.id;
          return (
            <Pressable
              key={ride.id}
              style={[styles.rideCard, isSel && { borderColor: ride.colors[0], borderWidth: 1.5 }]}
              onPress={() => setSelected(ride.id)}
            >
              <AppGradient colors={ride.colors} style={styles.rideIcon}>
                <Icon
                  componentName={VARIABLES.MaterialCommunityIcons}
                  iconName='car'
                  size={28}
                  color={COLORS.WHITE}
                />
              </AppGradient>
              <View style={styles.rideInfo}>
                <Typography style={styles.rideName}>{ride.label}</Typography>
                <Typography style={styles.rideDesc}>{ride.desc}</Typography>
              </View>
              <View style={styles.rideRight}>
                <Typography style={styles.ridePrice}>{ride.price}</Typography>
                <Typography style={styles.rideEta}>{ride.eta}</Typography>
              </View>
            </Pressable>
          );
        })}

        <Typography style={styles.sectionTitle}>Promo Code</Typography>
        <View style={styles.promoRow}>
          <View style={styles.promoInput}>
            <Input name='promo' placeholder='Enter Code' value={promo} onChangeText={setPromo} />
          </View>
          <Button title='Apply' style={styles.promoBtn} onPress={() => {}} />
        </View>

        <View style={styles.fareCard}>
          <View style={styles.fareRow}>
            <Typography style={styles.fareLabel}>Base Fare</Typography>
            <Typography style={styles.fareValue}>CFA 330</Typography>
          </View>
          <View style={styles.fareDivider} />
          <View style={styles.fareRow}>
            <Typography style={styles.fareTotalLabel}>Total (Cash)</Typography>
            <Typography style={styles.fareTotalValue}>CFA 330</Typography>
          </View>
        </View>

        <Button
          title='Find Driver'
          style={styles.ctaBtn}
          onPress={() =>
            navigate(SCREENS.FINDING_DRIVER, {
              rideType: selected,
              pickupAddress: route.params?.pickupAddress,
              dropoffAddress: route.params?.dropoffAddress,
            })
          }
        />
      </View>
    </Wrapper>
  );
};

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
    gap: 3,
  },
  sectionTitle: {
    fontSize: FontSize.Large,
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
  },
  distanceTxt: {
    fontSize: FontSize.Small,
    color: COLORS.APP_TEXT_MUTED,
    marginTop: -4,
    marginBottom: 14,
  },
  rideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.APP_LINE,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  rideIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rideInfo: { flex: 1 },
  rideName: {
    fontSize: FontSize.MediumSmall,
    fontWeight: FontWeight.SemiBold,
    color: COLORS.APP_TEXT,
  },
  rideDesc: {
    fontSize: FontSize.Small,
    color: COLORS.APP_TEXT_MUTED,
    marginTop: 2,
  },
  rideRight: { alignItems: 'flex-end' },
  ridePrice: {
    fontSize: FontSize.MediumSmall,
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
  },
  rideEta: {
    fontSize: FontSize.Small,
    color: COLORS.APP_TEXT_MUTED,
    marginTop: 2,
  },
  promoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  promoInput: { flex: 1 },
  promoBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    minWidth: 90,
  },
  fareCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 14,
    padding: 14,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: COLORS.APP_LINE,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  fareLabel: {
    fontSize: FontSize.Small,
    color: COLORS.APP_TEXT_MUTED,
  },
  fareValue: {
    fontSize: FontSize.MediumSmall,
    fontWeight: FontWeight.SemiBold,
    color: COLORS.APP_TEXT,
  },
  fareDivider: {
    height: 1,
    backgroundColor: COLORS.APP_LINE,
    marginVertical: 4,
  },
  fareTotalLabel: {
    fontSize: FontSize.MediumSmall,
    fontWeight: FontWeight.SemiBold,
    color: COLORS.APP_TEXT,
  },
  fareTotalValue: {
    fontSize: FontSize.MediumSmall,
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_PRIMARY,
  },
  ctaBtn: { marginTop: 20 },
});
