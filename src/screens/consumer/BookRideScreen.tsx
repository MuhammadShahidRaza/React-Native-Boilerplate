import { useCallback, useRef, useState } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { useFocusEffect, useRoute, RouteProp } from '@react-navigation/native';
import { Marker } from 'react-native-maps';
import type MapView from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { Icon, Wrapper, Button, Typography, Map } from 'components/index';
import { ENV_CONSTANTS, VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS, screenHeight, fitMapToDirectionCoordinates } from 'utils/index';
import { navigate } from 'navigation/index';
import { SCREENS } from 'constants/routes';
import type { AddressDetails } from 'utils/location';
import type { RootStackParamList } from 'navigation/Navigators';
import { getAndClearPickerResult } from 'utils/pickerStore';

// ── constants ─────────────────────────────────────────────────────────────────

 
export const BookRideScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, typeof SCREENS.BOOK_RIDE>>();

  // Initialize from stored params so values survive screen remounts
  const [pickup, setPickup] = useState<AddressDetails | null>(route.params?.storedPickup ?? null);
  const [dropoff, setDropoff] = useState<AddressDetails | null>(
    route.params?.storedDropoff ?? null,
  );
  const mapRef = useRef<MapView>(null);

  const routeFitRegion =
    pickup && dropoff
      ? {
          latitude: (pickup.latitude + dropoff.latitude) / 2,
          longitude: (pickup.longitude + dropoff.longitude) / 2,
          latitudeDelta: Math.abs(pickup.latitude - dropoff.latitude) * 2 + 0.02,
          longitudeDelta: Math.abs(pickup.longitude - dropoff.longitude) * 2 + 0.02,
        }
      : undefined;

  // Receive picker result when this screen regains focus.
  useFocusEffect(
    useCallback(() => {
      const result = getAndClearPickerResult();
      if (!result) return;
      if (result.field === 'pickup') {
        setPickup(result.address);
      } else {
        setDropoff(result.address);
      }
    }, []),
  );

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

  const showDirections = !!(pickup?.latitude && dropoff?.latitude);
  return (
    <Wrapper
      headerTitle='Book a Ride'
       
      useScrollView
      backgroundColor={COLORS.WHITE}
      darkMode={false}
    >
      {/* ── Live map ──────────────────────────────────────────────────────── */}
      <View style={styles.mapContainer}>
        <Map
          key={
            showDirections && pickup && dropoff
              ? `book-${pickup.latitude}-${pickup.longitude}-${dropoff.latitude}-${dropoff.longitude}`
              : 'book-map'
          }
          mapRef={mapRef}
          {...(routeFitRegion ? { region: routeFitRegion } : {})}
          regionTracking={showDirections ? 'initialOnly' : 'live'}
          showsUserLocationDot={!showDirections}
          showCurrentLocation={showDirections ? false : true}
          scrollEnabled={!!showDirections}
          showCurrentLocationButton={false}
          mapStyle='light'
          minZoomLevel={0}
        >
          {showDirections && pickup && dropoff ? (
            <>
              <MapViewDirections
                origin={{ latitude: pickup.latitude, longitude: pickup.longitude }}
                destination={{ latitude: dropoff.latitude, longitude: dropoff.longitude }}
                apikey={ENV_CONSTANTS.MAP_API_KEY}
                strokeColor={COLORS.APP_PRIMARY}
                strokeWidth={4}
                onReady={result => fitMapToDirectionCoordinates(mapRef, result.coordinates)}
              />
              <Marker
                coordinate={{ latitude: pickup.latitude, longitude: pickup.longitude }}
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <View style={styles.pickupMapDot} />
              </Marker>
              <Marker
                coordinate={{ latitude: dropoff.latitude, longitude: dropoff.longitude }}
                anchor={{ x: 0.5, y: 1 }}
              >
                <Icon
                  componentName={VARIABLES.MaterialCommunityIcons}
                  iconName='map-marker'
                  size={30}
                  color={COLORS.APP_SECONDARY}
                />
              </Marker>
            </>
          ) : null}
        </Map>
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
                onPress={() =>
                  navigate(SCREENS.RIDE_LOCATION_PICKER, {
                    field: 'pickup',
                    storedPickup: pickup ?? undefined,
                    storedDropoff: dropoff ?? undefined,
                  })
                }
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
                onPress={() =>
                  navigate(SCREENS.RIDE_LOCATION_PICKER, {
                    field: 'dropoff',
                    storedPickup: pickup ?? undefined,
                    storedDropoff: dropoff ?? undefined,
                  })
                }
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
  pickupMapDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.APP_PRIMARY,
    borderWidth: 2,
    borderColor: COLORS.WHITE,
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
  ctaBtn: { marginTop: 80 },
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
