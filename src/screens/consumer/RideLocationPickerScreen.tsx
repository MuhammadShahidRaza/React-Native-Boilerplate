import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { Region } from 'react-native-maps';
import type MapView from 'react-native-maps';
import { Map } from 'components/common/Map';
import { Autocomplete, Button, GradientIcon, Icon, Typography, Wrapper } from 'components/index';
import { INITIAL_REGION, VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS, screenHeight } from 'utils/index';
import { reverseGeocode, getLocationPermission, type AddressDetails } from 'utils/location';
import { SCREENS } from 'constants/routes';
import type { RootStackParamList } from 'navigation/Navigators';
import { logger } from 'utils/logger';
import { setPickerResult } from 'utils/pickerStore';

// ── Saved quick-picks ─────────────────────────────────────────────────────────

const SAVED = [
  {
    id: 'home',
    label: 'Home',
    address: '67 Murray Street, NY',
    icon: 'home',
    lat: INITIAL_REGION.latitude + 0.005,
    lng: INITIAL_REGION.longitude - 0.003,
  },
  {
    id: 'work',
    label: 'Work',
    address: '67 Murray Street, NY',
    icon: 'briefcase',
    lat: INITIAL_REGION.latitude - 0.008,
    lng: INITIAL_REGION.longitude + 0.006,
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export const RideLocationPickerScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, typeof SCREENS.RIDE_LOCATION_PICKER>>();
  const navigation = useNavigation();
  const field = route.params?.field ?? 'dropoff';

  useEffect(() => {
    void getLocationPermission();
  }, []);

  const mapRef = useRef<MapView>(null);
  const [address, setAddress] = useState<AddressDetails | null>(null);
  const [loading, setLoading] = useState(false);

  // Called when user stops dragging the map — reverse-geocode the center pin
  const handleRegionChangeComplete = useCallback(async (region: Region) => {
    setLoading(true);
    try {
      const result = await reverseGeocode({
        latitude: region.latitude,
        longitude: region.longitude,
      });
      if (result) setAddress(result);
    } finally {
      setLoading(false);
    }
  }, []);

  // Called when user picks from Autocomplete suggestions
  const handleAutocomplete = useCallback((result: AddressDetails | null) => {
    logger.log('Autocomplete result:', result);
    if (!result) return;
    setAddress(result);
    mapRef.current?.animateToRegion(
      {
        latitude: result.latitude,
        longitude: result.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.008,
      },
      600,
    );
  }, []);

  // Called when user taps a saved location
  const handleSaved = (item: (typeof SAVED)[number]) => {
    const addr: AddressDetails = {
      fullAddress: item.address,
      postalCode: '',
      street: item.address,
      city: '',
      state: '',
      country: '',
      latitude: item.lat,
      longitude: item.lng,
    };
    setAddress(addr);
    mapRef.current?.animateToRegion(
      { latitude: item.lat, longitude: item.lng, latitudeDelta: 0.01, longitudeDelta: 0.008 },
      600,
    );
  };

  const handleConfirm = () => {
    if (!address) return;
    setPickerResult({ address, field });
    navigation.goBack();
  };

  const title = field === 'pickup' ? 'Set Pickup Location' : 'Set Drop-Off Location';

  return (
    <Wrapper
      headerTitle={title}
      showBackButton
      backIconStyle={styles.backIcon}
      useScrollView={false}
      darkMode={false}
    >
      {/* ── Autocomplete (floats over the map) ──────────────────────────── */}
      <View style={styles.autocompleteWrap}>
        <Autocomplete
          placeholder={field === 'pickup' ? 'Search pickup location' : 'Search drop-off location'}
          value={address?.fullAddress ?? ''}
          setReverseGeocodedAddress={handleAutocomplete}
          // showCurrentLocationButton={false}
          containerStyle={styles.autocompleteContainer}
          keepResultsAfterBlur={false}
          keyboardShouldPersistTaps='handled'
        />
      </View>

      {/* ── Map with draggable center pin ────────────────────────────────── */}
      <View style={styles.mapWrap}>
        <Map
          mapRef={mapRef}
          showCenterMarker
          showCurrentLocation
          showCurrentLocationButton
          scrollEnabled
          mapStyle='light'
          minZoomLevel={0}
          style={styles.map}
          onRegionChangeComplete={handleRegionChangeComplete}
          currentLocationButtonStyle={styles.locBtn}
        />
        {/* {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size='small' color={COLORS.APP_PRIMARY} />
          </View>
        )} */}
      </View>

      {/* ── Bottom sheet ─────────────────────────────────────────────────── */}
      <View style={styles.sheet}>
        {/* Selected address display */}
        <View style={styles.addressRow}>
          <Icon
            componentName={VARIABLES.MaterialCommunityIcons}
            iconName={field === 'pickup' ? 'crosshairs-gps' : 'map-marker'}
            size={22}
            color={field === 'pickup' ? COLORS.APP_PRIMARY : COLORS.APP_SECONDARY}
          />
          <View style={styles.addressTextWrap}>
            {/* {loading ? (
              <Typography style={styles.addressLoading}>Locating address...</Typography>
            ) : ( */}
            <Typography style={styles.addressText} numberOfLines={2}>
              {loading
                ? 'Locating address...'
                : (address?.fullAddress ?? 'Move the map to select a location')}
            </Typography>
            {/* // )} */}
          </View>
        </View>

        {/* Saved locations */}
        <Typography style={styles.savedTitle}>Saved Places</Typography>
        <View style={styles.savedRow}>
          {SAVED.map(item => (
            <View key={item.id} style={styles.savedItem}>
              <View style={styles.savedBtn}>
                <GradientIcon
                  componentName={VARIABLES.Feather}
                  iconName={item.icon}
                  size={FontSize.Medium}
                  color={COLORS.WHITE}
                  containerSize={44}
                  borderRadius={12}
                  onPress={() => handleSaved(item)}
                />
              </View>
              <Typography style={styles.savedLabel}>{item.label}</Typography>
            </View>
          ))}
        </View>

        {/* Confirm CTA */}
        <Button
          title={field === 'pickup' ? 'Set Pickup' : 'Set Drop-Off'}
          onPress={handleConfirm}
          disabled={!address}
          style={styles.ctaBtn}
        />
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  backIcon: { backgroundColor: COLORS.APP_PRIMARY, borderRadius: 12 },
  autocompleteWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  autocompleteContainer: {
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  mapWrap: {
    height: screenHeight(48),
    position: 'relative',
  },
  map: { flex: 1 },
  locBtn: { bottom: 16, right: 12 },
  loadingOverlay: {
    // ...StyleSheet.absoluteFill,
    // alignItems: 'center',
    // justifyContent: 'center',
    // backgroundColor: 'rgba(255,255,255,0.4)',
  },
  sheet: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    // borderTopLeftRadius: 24,
    // borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 10,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  addressTextWrap: {
    flex: 1,
    height: 70,
    backgroundColor: COLORS.INPUT_BACKGROUND,
    padding: 10,
    borderRadius: 14,
  },
  addressText: {
    fontSize: FontSize.MediumSmall,
    color: COLORS.APP_TEXT,
    lineHeight: 20,
  },
  addressLoading: {
    fontSize: FontSize.Small,
    color: COLORS.APP_TEXT_MUTED,
  },
  savedTitle: {
    fontSize: FontSize.Small,
    fontWeight: FontWeight.SemiBold,
    color: COLORS.APP_TEXT_MUTED,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  savedRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  savedItem: {
    alignItems: 'center',
    gap: 6,
  },
  savedBtn: {},
  savedLabel: {
    fontSize: FontSize.ExtraSmall,
    color: COLORS.APP_TEXT_MUTED,
  },
  ctaBtn: {},
});
