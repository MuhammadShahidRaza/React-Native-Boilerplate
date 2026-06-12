import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Pressable, ActivityIndicator } from 'react-native';
import { Marker } from 'react-native-maps';
import type MapView from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { Icon, Wrapper, Button, Typography, Input, SvgComponent, Map } from 'components/index';
import { ENV_CONSTANTS, INITIAL_REGION, VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import {
  COLORS,
  getCurrentLocation,
  screenHeight,
  fitMapToDirectionCoordinates,
  extractEstimateDistanceKm,
  formatMoney,
  formatDistanceKm,
  haversineDistanceKm,
  resolveBookingDistanceKm,
} from 'utils/index';
import { resetToHomeAndScreen } from 'navigation/index';
import { createRideBooking, estimateBooking, extractBookingFromResponse } from 'api/functions/snlift/bookings';
import { getJobDisplayTimerSeconds } from 'api/functions/snlift/settings';
import type { EstimateCategoryResult } from 'api/functions/snlift/bookings';
import { showToast } from 'utils/toast';
import { SCREENS } from 'constants/routes';
import { useRoute, RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from 'navigation/Navigators';
import { SVG } from 'constants/assets/svg';
import { logger } from 'utils/logger';

 
const RIDE_TYPES = [
  {
    id: 'standard',
    label: 'Standard',
    desc: 'Affordable Everyday Rides',
    colors: '#004AADB3',
    background: 'rgba(0, 74, 173, 0.2)',
  },
  {
    id: 'comfort',
    label: 'Comfort',
    desc: 'Cool & Comfortable Rides',
    colors: '#00B76CB3',
    background: 'rgba(0, 183, 108, 0.2)',
  },
  {
    id: 'business',
    label: 'Business',
    desc: 'Luxury',
    colors: '#1E1E1EB3',
    background: 'rgba(30, 30, 30, 0.2)',
  },
];

const fmtPrice = (cat: EstimateCategoryResult | null | undefined): string | null => {
  if (!cat) return null;
  return formatMoney(cat.total_amount);
};

export const ChooseRideScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, typeof SCREENS.CHOOSE_RIDE>>();
  const [selected, setSelected] = useState('standard');
  const [promo, setPromo] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [estimates, setEstimates] = useState<Record<string, EstimateCategoryResult>>({});
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [estimateLoading, setEstimateLoading] = useState(false);
  const [findDriverLoading, setFindDriverLoading] = useState(false);
  const [currentLocationFallback, setCurrentLocationFallback] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const mapRef = useRef<MapView>(null);

  const { pickupLat, pickupLng, dropoffLat, dropoffLng } = route.params ?? {};

  useEffect(() => {
    const shouldUseCurrentLocation =
      pickupLat == null || pickupLng == null || dropoffLat == null || dropoffLng == null;
    if (!shouldUseCurrentLocation) return;

    const loadCurrentLocation = async () => {
      try {
        const pos = await getCurrentLocation();
        if (!pos) return;
        setCurrentLocationFallback({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      } catch (error) {
        logger.error('Failed to get current location for ChooseRideScreen:', error);
      }
    };

    loadCurrentLocation();
  }, [pickupLat, pickupLng, dropoffLat, dropoffLng]);

  const baseLatitude = currentLocationFallback?.latitude ?? INITIAL_REGION.latitude;
  const baseLongitude = currentLocationFallback?.longitude ?? INITIAL_REGION.longitude;

  const pickupCoord = {
    latitude: pickupLat ?? baseLatitude + 0.008,
    longitude: pickupLng ?? baseLongitude,
  };
  const dropoffCoord = {
    latitude: dropoffLat ?? baseLatitude - 0.004,
    longitude: dropoffLng ?? baseLongitude + 0.005,
  };

  const mapRegion = {
    latitude: (pickupCoord.latitude + dropoffCoord.latitude) / 2,
    longitude: (pickupCoord.longitude + dropoffCoord.longitude) / 2,
    latitudeDelta: Math.abs(pickupCoord.latitude - dropoffCoord.latitude) * 2 + 0.02,
    longitudeDelta: Math.abs(pickupCoord.longitude - dropoffCoord.longitude) * 2 + 0.02,
  };

  const fallbackDistanceKm = haversineDistanceKm(
    pickupCoord.latitude,
    pickupCoord.longitude,
    dropoffCoord.latitude,
    dropoffCoord.longitude,
  );
  const resolvedDistanceKm = resolveBookingDistanceKm(distanceKm, fallbackDistanceKm);

  const fetchEstimates = async (promoCode?: string) => {
    setEstimateLoading(true);
    try {
      const result = await estimateBooking({
        booking_type: 'ride',
        pickup_latitude: pickupCoord.latitude,
        pickup_longitude: pickupCoord.longitude,
        dropoff_latitude: dropoffCoord.latitude,
        dropoff_longitude: dropoffCoord.longitude,
        ...(promoCode ? { promo_code: promoCode } : {}),
      });
      const apiDistance = extractEstimateDistanceKm(result);
      if (apiDistance != null) {
        setDistanceKm(apiDistance);
      }
      if (result?.categories?.length) {
        const map: Record<string, EstimateCategoryResult> = {};
        result.categories.forEach(cat => { map[cat.ride_category] = cat; });
        setEstimates(map);
      }
    } catch (e) {
      logger.error('estimateBooking failed', e);
    } finally {
      setEstimateLoading(false);
    }
  };

  useEffect(() => {
    fetchEstimates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickupCoord.latitude, pickupCoord.longitude, dropoffCoord.latitude, dropoffCoord.longitude]);

  const handleApplyPromo = async () => {
    const promoTrimmed = promo.trim();
    if (!promoTrimmed) return;
    setPromoLoading(true);
    try {
      await fetchEstimates(promoTrimmed);
    } finally {
      setPromoLoading(false);
    }
  };

  const handleFindDriver = async () => {
    if (findDriverLoading) return;
    const promoTrimmed = promo.trim();
    const payload = {
      booking_type: 'ride' as const,
      ride_category: selected,
      pickup_address: route.params?.pickupAddress ?? 'Pickup',
      dropoff_address: route.params?.dropoffAddress ?? 'Drop-off',
      pickup_latitude: pickupCoord.latitude,
      pickup_longitude: pickupCoord.longitude,
      dropoff_latitude: dropoffCoord.latitude,
      dropoff_longitude: dropoffCoord.longitude,
      distance_km: resolvedDistanceKm,
      ...(promoTrimmed ? { promo_code: promoTrimmed } : {}),
    };
    setFindDriverLoading(true);
    try {
      const res = await createRideBooking(payload, { showLoader: false });
      const booking = extractBookingFromResponse(res);
      if (!booking?.id) {
        showToast({ message: 'Could not create ride booking. Try again.' });
        return;
      }
      const timerDurationSeconds = await getJobDisplayTimerSeconds();
      resetToHomeAndScreen(SCREENS.FINDING_DRIVER, {
        rideType: selected,
        pickupAddress: payload.pickup_address,
        dropoffAddress: payload.dropoff_address,
        pickupLat: pickupCoord.latitude,
        pickupLng: pickupCoord.longitude,
        dropoffLat: dropoffCoord.latitude,
        dropoffLng: dropoffCoord.longitude,
        bookingId: booking.id,
        timerDurationSeconds,
        startTimerOnMount: true,
      });
    } finally {
      setFindDriverLoading(false);
    }
  };

  return (
    <Wrapper
      headerTitle='Book a Ride'
      showBackButton
       
      useScrollView
      backgroundColor={COLORS.WHITE}
      darkMode={false}
    >
      {/* Map */}
      <View style={styles.mapContainer}>
        <Map
          key={`choose-${pickupCoord.latitude}-${pickupCoord.longitude}-${dropoffCoord.latitude}-${dropoffCoord.longitude}`}
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
            coordinate={pickupCoord}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.pickupMapDot} />
          </Marker>
          <Marker
            coordinate={dropoffCoord}
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
        <Typography style={styles.sectionTitle}>Choose Ride Type</Typography>
        <Typography translate={false} style={styles.distanceTxt}>
          {estimateLoading
            ? 'Calculating distance...'
            : `Estimated Distance: ${formatDistanceKm(resolvedDistanceKm)}`}
        </Typography>

        {RIDE_TYPES.map(ride => {
          const isSel = selected === ride.id;
          const cat = estimates[ride.id];
          return (
            <Pressable
              key={ride.id}
              style={[styles.rideCard,  { borderColor: ride.colors, borderWidth: 1 , backgroundColor: isSel ? ride.background : COLORS.BACKGROUND }]}
              onPress={() => setSelected(ride.id)}
            >
              <View style={[{ backgroundColor: ride.colors, borderRadius: 14 }, styles.rideIcon]}>
                <SvgComponent Svg={SVG.CAR} svgWidth={25} svgHeight={25} />
              </View>
              <View style={styles.rideInfo}>
                <Typography style={styles.rideName}>{ride.label}</Typography>
                <Typography style={styles.rideDesc}>{ride.desc}</Typography>
              </View>
              <View style={styles.rideRight}>
                {estimateLoading
                  ? <ActivityIndicator size='small' color={ride.colors} />
                  : <Typography style={styles.ridePrice}>{fmtPrice(cat) ?? '—'}</Typography>}
                {cat?.promo_applied && (
                  <Typography style={[styles.rideEta, styles.discountText]}>
                    {formatMoney(-cat.discount_amount)}
                  </Typography>
                )}
              </View>
            </Pressable>
          );
        })}

        <Typography style={styles.sectionTitle}>Promo Code</Typography>
        <View style={styles.promoRow}>
          <View style={styles.promoInput}>
            <Input containerStyle={styles.promoInput} name='promo' placeholder='Enter Code' value={promo} onChangeText={setPromo} />
          </View>
          <Button title='Apply' style={styles.promoBtn} loading={promoLoading} onPress={handleApplyPromo} />
        </View>

        {(() => {
          const cat = estimates[selected];
          const baseFare = cat ? formatMoney(cat.estimated_amount) : '—';
          const discount = cat?.discount_amount ?? 0;
          const total = cat ? formatMoney(cat.total_amount) : '—';
          return (
            <View style={styles.fareCard}>
              <View style={styles.fareRow}>
                <Typography style={styles.fareLabel}>Estimated Fare</Typography>
                <Typography style={styles.fareValue}>
                  {estimateLoading ? '...' : baseFare}
                </Typography>
              </View>
              {discount > 0 && (
                <>
                  <View style={styles.fareDivider} />
                  <View style={styles.fareRow}>
                    <Typography style={styles.fareLabel}>Discount</Typography>
                    <Typography style={[styles.fareValue, styles.discountText]}>
                      {formatMoney(-discount)}
                    </Typography>
                  </View>
                </>
              )}
              <View style={styles.fareDivider} />
              <View style={styles.fareRow}>
                <Typography style={styles.fareTotalLabel}>Total (Cash)</Typography>
                <Typography style={styles.fareTotalValue}>
                  {estimateLoading ? '...' : total}
                </Typography>
              </View>
            </View>
          );
        })()}

        <Button
          title='Find Driver'
          style={styles.ctaBtn}
          loading={findDriverLoading}
          loadingText='Finding driver...'
          onPress={handleFindDriver}
        />
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
  pickupMapDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.APP_PRIMARY,
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
    fontWeight: FontWeight.SemiBold,
    color: COLORS.APP_TEXT,
  },
  distanceTxt: {
    fontSize: FontSize.Small,
    color: COLORS.APP_TEXT_SMALL,
    marginTop: -4,
    marginBottom: 14,
  },
  rideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: COLORS.WHITE,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    // borderWidth: 1,
    // borderColor: COLORS.APP_LINE,
    // shadowColor: '#000',
    // shadowOpacity: 0.05,
    // shadowRadius: 8,
    // elevation: 2,
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
    fontSize: FontSize.MediumLarge,
    fontWeight: FontWeight.SemiBold,
    color: COLORS.APP_TEXT,
  },
  rideDesc: {
    fontSize: FontSize.MediumSmall,
    color: COLORS.APP_TEXT_SMALL,
  },
  rideRight: { alignItems: 'flex-end' },
  ridePrice: {
    fontSize: FontSize.MediumSmall,
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
  },
  rideEta: {
    fontSize: FontSize.Small,
    color: COLORS.APP_TEXT_SMALL,
  },
  promoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  promoInput: { flex: 1, marginBottom: 0 },
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
  discountText: { color: '#22a06b' },
});
