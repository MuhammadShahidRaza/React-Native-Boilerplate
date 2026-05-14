import { useEffect, useState } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Icon, Wrapper, GradientIcon, Button, Typography, Map } from 'components/index';
import { INITIAL_REGION, VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS, screenHeight } from 'utils/index';
import { navigate } from 'navigation/index';
import { SCREENS } from 'constants/routes';
import type { AddressDetails } from 'utils/location';
import type { RootStackParamList } from 'navigation/Navigators';

// ── constants ─────────────────────────────────────────────────────────────────

const BACK_ICON_STYLE = { backgroundColor: COLORS.APP_PRIMARY, borderRadius: 12 };

const SAVED_LOCATIONS = [
  { id: 'home', label: 'Home', address: '67 Murray Street, NY', icon: 'home' },
  { id: 'work', label: 'Work', address: '67 Murray Street, NY', icon: 'briefcase' },
];

export const BookRideScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, typeof SCREENS.BOOK_RIDE>>();

  const [pickup, setPickup] = useState<AddressDetails | null>(null);
  const [dropoff, setDropoff] = useState<AddressDetails | null>(null);
  // const [bikeCoord, setBikeCoord] = useState(ANIM_START);
  // const frameRef = useRef(0);

  // Pick up address returned from RideLocationPickerScreen
  useEffect(() => {
    const params = route.params;
    if (params?.pickedAddress && params?.pickerField) {
      const addr: AddressDetails = { ...params.pickedAddress };
      if (params.pickerField === 'pickup') setPickup(addr);
      else setDropoff(addr);
    }
  }, [route.params]);

  // // Bike marker: loop A → B over 3 seconds (30 fps)
  // useEffect(() => {
  //   const TOTAL = 90;
  //   const timer = setInterval(() => {
  //     frameRef.current = (frameRef.current + 1) % TOTAL;
  //     const t = frameRef.current / TOTAL;
  //     setBikeCoord({
  //       latitude: ANIM_START.latitude + (ANIM_END.latitude - ANIM_START.latitude) * t,
  //       longitude: ANIM_START.longitude + (ANIM_END.longitude - ANIM_START.longitude) * t,
  //     });
  //   }, 33);
  //   return () => clearInterval(timer);
  // }, []);

  const handleSavedLocation = (address: string) => {
    setDropoff({
      fullAddress: address,
      postalCode: '',
      street: '',
      city: '',
      state: '',
      country: '',
      latitude: INITIAL_REGION.latitude,
      longitude: INITIAL_REGION.longitude,
    });
  };

  const handleLetsGo = () => {
    navigate(SCREENS.CHOOSE_RIDE, {
      pickupAddress: pickup?.fullAddress,
      dropoffAddress: dropoff?.fullAddress,
      pickupLat: pickup?.latitude,
      pickupLng: pickup?.longitude,
      dropoffLat: dropoff?.latitude,
      dropoffLng: dropoff?.longitude,
    });
  };

  return (
    <Wrapper
      headerTitle='Book a Ride'
      showBackButton
      backIconStyle={BACK_ICON_STYLE}
      useScrollView
      darkMode={false}
    >
      {/* ── Live map ──────────────────────────────────────────────────────── */}
      <View style={styles.mapContainer}>
        <Map showCurrentLocation showCurrentLocationButton={false} scrollEnabled={false} />
      </View>

      <View style={styles.content}>
        <Typography style={styles.sectionTitle}>Where To?</Typography>

        {/* ── Location inputs (tapping opens picker screen) ─────────────── */}
        <View style={styles.locationCard}>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ alignItems: 'center', marginVertical: 20 }}>
              <View style={styles.pickupDot} />
              <View style={styles.connectLine} />
              <Icon
                componentName={VARIABLES.MaterialCommunityIcons}
                iconName='map-marker'
                size={22}
                color={COLORS.APP_SECONDARY}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              {/* Pickup row */}
              <Pressable
                style={styles.locationRow}
                onPress={() => navigate(SCREENS.RIDE_LOCATION_PICKER, { field: 'pickup' })}
              >
                <View style={styles.inputFakeWrap}>
                  <Typography
                    style={[styles.inputFakeTxt, !pickup && styles.inputPlaceholder]}
                    numberOfLines={1}
                  >
                    {pickup?.fullAddress ?? 'Pickup Location'}
                  </Typography>
                </View>
              </Pressable>

              {/* Drop-off row */}
              <Pressable
                style={styles.locationRow}
                onPress={() => navigate(SCREENS.RIDE_LOCATION_PICKER, { field: 'dropoff' })}
              >
                <View style={styles.inputFakeWrap}>
                  <Typography
                    style={[styles.inputFakeTxt, !dropoff && styles.inputPlaceholder]}
                    numberOfLines={1}
                  >
                    {dropoff?.fullAddress ?? 'Drop-Off Location'}
                  </Typography>
                </View>
              </Pressable>
            </View>
          </View>
        </View>

        <Button title="Let's Go" style={styles.ctaBtn} onPress={handleLetsGo} disabled={!dropoff} />
      </View>
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
  carMarker: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 6,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.APP_LINE,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  bikeMarker: {
    backgroundColor: COLORS.APP_PRIMARY,
    borderRadius: 10,
    padding: 6,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: FontSize.Large,
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
    marginBottom: 12,
  },
  locationCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  connectLine: {
    // position: 'absolute',
    // left: 5,
    // top: 54,
    width: 2,
    height: 38,
    backgroundColor: COLORS.INPUT_BACKGROUND,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    gap: 10,
  },
  dividerLine: {
    height: 1,
    backgroundColor: COLORS.INPUT_BACKGROUND,
    marginLeft: 32,
  },
  pickupDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: COLORS.APP_PRIMARY,
    backgroundColor: COLORS.WHITE,
  },
  inputFakeWrap: {
    flex: 1,
    backgroundColor: COLORS.INPUT_BACKGROUND,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 15,
  },
  inputFakeTxt: {
    fontSize: FontSize.MediumSmall,
    color: COLORS.APP_TEXT,
  },
  inputPlaceholder: {
    color: COLORS.APP_TEXT_MUTED,
  },
  savedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  savedInfo: { marginLeft: 12 },
  savedLabel: {
    fontSize: FontSize.MediumSmall,
    fontWeight: FontWeight.SemiBold,
    color: COLORS.APP_TEXT,
  },
  savedAddress: {
    fontSize: FontSize.Small,
    color: COLORS.APP_TEXT_MUTED,
    marginTop: 2,
  },
  ctaBtn: { marginTop: 80, },
});

{
  /* ── Saved locations ─────────────────────────────────────────────── */
}
{
  /* <Typography style={styles.sectionTitle}>Saved Locations</Typography>
        {SAVED_LOCATIONS.map(loc => (
          <Pressable
            key={loc.id}
            style={styles.savedRow}
            onPress={() => handleSavedLocation(loc.address)}
          >
            <GradientIcon
              componentName={VARIABLES.Feather}
              iconName={loc.icon}
              size={FontSize.Medium}
              color={COLORS.WHITE}
              containerSize={44}
              borderRadius={12}
            />
            <View style={styles.savedInfo}>
              <Typography style={styles.savedLabel}>{loc.label}</Typography>
              <Typography style={styles.savedAddress}>{loc.address}</Typography>
            </View>
          </Pressable>
        ))} */
}

// const DRIVER_COORDS = [
//   { latitude: INITIAL_REGION.latitude + 0.012, longitude: INITIAL_REGION.longitude - 0.006 },
//   { latitude: INITIAL_REGION.latitude + 0.005, longitude: INITIAL_REGION.longitude + 0.009 },
//   { latitude: INITIAL_REGION.latitude - 0.002, longitude: INITIAL_REGION.longitude - 0.008 },
// ];

// /** Start & end for the animated bike marker (navigation preview) */
// const ANIM_START = {
//   latitude: INITIAL_REGION.latitude + 0.018,
//   longitude: INITIAL_REGION.longitude - 0.012,
// };
// const ANIM_END = {
//   latitude: INITIAL_REGION.latitude - 0.005,
//   longitude: INITIAL_REGION.longitude + 0.01,
// };

// const MAP_REGION = {
//   latitude: INITIAL_REGION.latitude,
//   longitude: INITIAL_REGION.longitude,
//   latitudeDelta: 0.04,
//   longitudeDelta: 0.025,
// };

// // ── component ─────────────────────────────────────────────────────────────────

// {
//   /* Static car markers (nearby drivers) */
// }
// {
//   /* {DRIVER_COORDS.map((coord, i) => (
//           <Marker key={`driver-${i}`} coordinate={coord} anchor={{ x: 0.5, y: 0.5 }}>
//             <View style={styles.carMarker}>
//               <Icon
//                 componentName={VARIABLES.MaterialCommunityIcons}
//                 iconName='car'
//                 size={14}
//                 color={COLORS.APP_TEXT}
//               />
//             </View>
//           </Marker>
//         ))} */
// }

// {
//   /* Animated bike marker — moves A→B every 3 s
//           <Marker coordinate={bikeCoord} anchor={{ x: 0.5, y: 0.5 }}>
//             <View style={styles.bikeMarker}>
//               <Icon
//                 componentName={VARIABLES.MaterialCommunityIcons}
//                 iconName='motorbike'
//                 size={16}
//                 color={COLORS.WHITE}
//               />
//             </View>
//           </Marker> */
// }
