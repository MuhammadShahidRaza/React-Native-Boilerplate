import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Animated,
  Image,
  Pressable,
  Dimensions,
} from 'react-native';
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import {
  Icon,
  Wrapper,
  GradientIcon,
  AppGradient,
  Button,
  Typography,
  Autocomplete,
  Input,
} from 'components/index';
import { INITIAL_REGION, VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS } from 'utils/index';
import { IMAGES } from 'constants/assets';
import type { AddressDetails } from 'utils/location';
import { CancelReasonModal } from './CancelReasonModal';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const BACK_ICON_STYLE = {
  backgroundColor: COLORS.APP_PRIMARY,
  borderRadius: 12,
};

const SAVED_LOCATIONS = [
  { id: 'home', label: 'Home', address: '67 Murray Street, NY', icon: 'home' },
  { id: 'work', label: 'Work', address: '67 Murray Street, NY', icon: 'briefcase' },
];

const RIDE_TYPES = [
  {
    id: 'basic',
    label: 'Basic',
    desc: 'Affordable Everyday Rides',
    price: 'CFA 330',
    eta: '5-8 min',
    bgColors: [COLORS.APP_SECONDARY, '#003B99'] as string[],
  },
  {
    id: 'ac_comfort',
    label: 'AC Comfort',
    desc: 'Cool & Comfortable Rides',
    price: 'CFA 330',
    eta: '5-8 min',
    bgColors: [COLORS.APP_PRIMARY, COLORS.APP_PRIMARY_LIGHT] as string[],
  },
  {
    id: 'premium',
    label: 'Premium',
    desc: 'Luxury',
    price: 'CFA 330',
    eta: '5-8 min',
    bgColors: ['#4B5563', '#1F2937'] as string[],
  },
];

const PICKUP_COORD = { latitude: INITIAL_REGION.latitude + 0.008, longitude: INITIAL_REGION.longitude };
const DROPOFF_COORD = { latitude: INITIAL_REGION.latitude - 0.004, longitude: INITIAL_REGION.longitude + 0.005 };
const DRIVER_COORDS = [
  { latitude: INITIAL_REGION.latitude + 0.012, longitude: INITIAL_REGION.longitude - 0.006 },
  { latitude: INITIAL_REGION.latitude + 0.005, longitude: INITIAL_REGION.longitude + 0.009 },
  { latitude: INITIAL_REGION.latitude - 0.002, longitude: INITIAL_REGION.longitude - 0.008 },
];
const ROUTE_COORDS = [
  PICKUP_COORD,
  { latitude: INITIAL_REGION.latitude + 0.003, longitude: INITIAL_REGION.longitude + 0.002 },
  DROPOFF_COORD,
];
const MAP_REGION = {
  latitude: INITIAL_REGION.latitude + 0.002,
  longitude: INITIAL_REGION.longitude + 0.002,
  latitudeDelta: 0.03,
  longitudeDelta: 0.02,
};

type Phase = 'where_to' | 'choose_ride' | 'finding' | 'driver_found' | 'in_progress' | 'completed';

export const BookRideScreen = () => {
  const [phase, setPhase] = useState<Phase>('where_to');
  const [pickup, setPickup] = useState<AddressDetails | null>(null);
  const [dropoff, setDropoff] = useState<AddressDetails | null>(null);
  const [selectedRide, setSelectedRide] = useState('basic');
  const [promoCode, setPromoCode] = useState('');
  const [cancelVisible, setCancelVisible] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (phase !== 'finding') return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseAnim, { toValue: 1.18, duration: 750, useNativeDriver: true }),
          Animated.timing(pulseOpacity, { toValue: 0.65, duration: 750, useNativeDriver: true }),
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
      pulseAnim.setValue(1);
      pulseOpacity.setValue(1);
      setPhase('driver_found');
    }, 2600);
    return () => { pulse.stop(); clearTimeout(timer); };
  }, [phase, pulseAnim, pulseOpacity]);

  const progressStep = phase === 'in_progress' ? 1 : phase === 'completed' ? 2 : -1;

  /* ─── Map ─── */
  const renderMap = () => {
    const mapHeight = phase === 'finding' ? SCREEN_HEIGHT * 0.46 : SCREEN_HEIGHT * 0.36;
    const showRoute = phase !== 'where_to';
    return (
      <View style={{ height: mapHeight }}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={StyleSheet.absoluteFill}
          initialRegion={MAP_REGION}
          showsUserLocation
          showsMyLocationButton={false}
          showsCompass={false}
          userInterfaceStyle="light"
          scrollEnabled={phase === 'where_to'}
        >
          {DRIVER_COORDS.map((coord, i) => (
            <Marker key={`car-${i}`} coordinate={coord} anchor={{ x: 0.5, y: 0.5 }}>
              <View style={styles.carMarker}>
                <Icon
                  componentName={VARIABLES.MaterialCommunityIcons}
                  iconName="car"
                  size={14}
                  color={COLORS.APP_TEXT}
                />
              </View>
            </Marker>
          ))}
          {showRoute && (
            <>
              <Polyline coordinates={ROUTE_COORDS} strokeColor="#374151" strokeWidth={3} />
              <Marker coordinate={PICKUP_COORD} anchor={{ x: 0.5, y: 1 }}>
                <Icon
                  componentName={VARIABLES.MaterialCommunityIcons}
                  iconName="map-marker"
                  size={34}
                  color={COLORS.APP_PRIMARY}
                />
              </Marker>
              <Marker coordinate={DROPOFF_COORD} anchor={{ x: 0.5, y: 0.5 }}>
                <View style={styles.dropoffDot} />
              </Marker>
            </>
          )}
        </MapView>
      </View>
    );
  };

  /* ─── Phase: where_to ─── */
  const renderWhereTo = () => (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Typography style={styles.sectionTitle}>Where To?</Typography>

      <View style={styles.locationCard}>
        {/* connecting line */}
        <View style={styles.connectLine} />

        <View style={styles.locationRow}>
          <View style={styles.pickupDot} />
          <View style={styles.locationInputWrap}>
            <Autocomplete
              placeholder="Pickup Location"
              value={pickup?.fullAddress ?? ''}
              setReverseGeocodedAddress={setPickup}
              showCurrentLocationButton
              containerStyle={styles.autocompleteContainer}
              keepResultsAfterBlur
              keyboardShouldPersistTaps="handled"
            />
          </View>
        </View>

        <View style={styles.locationRow}>
          <Icon
            componentName={VARIABLES.MaterialCommunityIcons}
            iconName="map-marker"
            size={22}
            color={COLORS.APP_SECONDARY}
          />
          <View style={styles.locationInputWrap}>
            <Autocomplete
              placeholder="Drop-Off Location"
              value={dropoff?.fullAddress ?? ''}
              setReverseGeocodedAddress={setDropoff}
              showCurrentLocationButton={false}
              containerStyle={styles.autocompleteContainer}
              keepResultsAfterBlur
              keyboardShouldPersistTaps="handled"
            />
          </View>
        </View>
      </View>

      <Typography style={styles.sectionTitle}>Save Location</Typography>
      {SAVED_LOCATIONS.map(loc => (
        <Pressable
          key={loc.id}
          style={styles.savedRow}
          onPress={() => {
            const mock: AddressDetails = {
              fullAddress: loc.address,
              postalCode: '',
              street: '',
              city: '',
              state: '',
              country: '',
              latitude: INITIAL_REGION.latitude,
              longitude: INITIAL_REGION.longitude,
            };
            setDropoff(mock);
          }}
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
      ))}

      <Button
        title="Let's Go"
        style={styles.ctaBtn}
        onPress={() => setPhase('choose_ride')}
        disabled={!dropoff}
      />
    </ScrollView>
  );

  /* ─── Phase: choose_ride ─── */
  const renderChooseRide = () => (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Typography style={styles.sectionTitle}>Choose Ride Type</Typography>
      <Typography style={styles.distanceText}>Estimated Distance: 12 km</Typography>

      {RIDE_TYPES.map(ride => {
        const isSelected = selectedRide === ride.id;
        return (
          <Pressable
            key={ride.id}
            style={[styles.rideCard, isSelected && { borderColor: ride.bgColors[0], borderWidth: 1.5 }]}
            onPress={() => setSelectedRide(ride.id)}
          >
            <AppGradient
              colors={ride.bgColors}
              style={styles.rideIconWrap}
            >
              <Icon
                componentName={VARIABLES.MaterialCommunityIcons}
                iconName="car"
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
        <View style={styles.promoInputWrap}>
          <Input
            name="promo"
            placeholder="Enter Code"
            value={promoCode}
            onChangeText={setPromoCode}
          />
        </View>
        <Button
          title="Apply"
          style={styles.promoBtn}
          onPress={() => {}}
        />
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
        title="Find Driver"
        style={styles.ctaBtn}
        onPress={() => setPhase('finding')}
      />
    </ScrollView>
  );

  /* ─── Phase: finding ─── */
  const renderFinding = () => (
    <View style={styles.findingContainer}>
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
      <Typography style={styles.findingTitle}>Finding Your Driver...</Typography>
      <Typography style={styles.findingSub}>This Usually Takes 30 Seconds</Typography>
      <Pressable style={styles.cancelBtn} onPress={() => setCancelVisible(true)}>
        <Typography style={styles.cancelBtnText}>Cancel</Typography>
      </Pressable>
      <CancelReasonModal
        visible={cancelVisible}
        onClose={() => setCancelVisible(false)}
        onContinue={() => { setCancelVisible(false); setPhase('where_to'); }}
      />
    </View>
  );

  /* ─── Shared: driver card + vehicle stats ─── */
  const renderDriverCard = (showCancel: boolean) => (
    <View style={styles.driverCard}>
      <View style={styles.driverTopRow}>
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
            <Typography style={styles.ratingText}>4.9</Typography>
          </View>
        </View>
        <Pressable style={styles.contactBtn}>
          <AppGradient variant="primaryLight" style={styles.contactCircle}>
            <Icon componentName={VARIABLES.Feather} iconName="phone" size={16} color={COLORS.WHITE} />
          </AppGradient>
        </Pressable>
        <Pressable style={[styles.contactBtn, { marginLeft: 8 }]}>
          <View style={[styles.contactCircle, { backgroundColor: COLORS.APP_SECONDARY }]}>
            <Icon componentName={VARIABLES.Feather} iconName="mail" size={16} color={COLORS.WHITE} />
          </View>
        </Pressable>
      </View>
      {showCancel && (
        <View style={styles.driverBottomRow}>
          <View>
            <Typography style={styles.carModel}>Toyota Corolla</Typography>
            <Typography style={styles.carPlate}>ABC-1234</Typography>
          </View>
          <Pressable style={styles.inlineCancelBtn} onPress={() => setCancelVisible(true)}>
            <Typography style={styles.inlineCancelText}>Cancel</Typography>
          </Pressable>
        </View>
      )}
    </View>
  );

  const renderVehicleStats = () => (
    <View style={styles.statsRow}>
      <View style={styles.statItem}>
        <Icon componentName={VARIABLES.MaterialCommunityIcons} iconName="car" size={24} color={COLORS.APP_PRIMARY} />
        <Typography style={styles.statValue}>Toyota</Typography>
        <Typography style={styles.statLabel}>Vehicle Type</Typography>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Icon componentName={VARIABLES.MaterialCommunityIcons} iconName="card-text-outline" size={24} color={COLORS.APP_PRIMARY} />
        <Typography style={styles.statValue}>AA-001-AA</Typography>
        <Typography style={styles.statLabel}>License Plate</Typography>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Icon componentName={VARIABLES.MaterialCommunityIcons} iconName="water" size={24} color={COLORS.APP_PRIMARY} />
        <Typography style={styles.statValue}>Black</Typography>
        <Typography style={styles.statLabel}>Color</Typography>
      </View>
    </View>
  );

  /* ─── Phase: driver_found ─── */
  const renderDriverFound = () => (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.statusIconWrap}>
        <GradientIcon
          componentName={VARIABLES.Feather}
          iconName="check"
          size={40}
          color={COLORS.WHITE}
          containerSize={88}
          borderRadius={44}
        />
      </View>
      {renderDriverCard(true)}
      {renderVehicleStats()}
      <Button
        title="Track Ride"
        style={styles.ctaBtn}
        onPress={() => setPhase('in_progress')}
      />
      <CancelReasonModal
        visible={cancelVisible}
        onClose={() => setCancelVisible(false)}
        onContinue={() => { setCancelVisible(false); setPhase('where_to'); }}
      />
    </ScrollView>
  );

  /* ─── Shared: progress steps ─── */
  const renderProgress = () => (
    <View style={styles.progressRow}>
      {[0, 1, 2].map(i => (
        <View key={i} style={styles.progressSegWrap}>
          <View
            style={[
              styles.progressSeg,
              i <= progressStep ? styles.progressSegActive : styles.progressSegInactive,
            ]}
          />
          {i === progressStep && <View style={styles.progressDot} />}
        </View>
      ))}
    </View>
  );

  /* ─── Phase: in_progress ─── */
  const renderInProgress = () => (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {renderProgress()}
      <View style={styles.statusIconWrap}>
        <GradientIcon
          componentName={VARIABLES.Feather}
          iconName="send"
          size={36}
          color={COLORS.WHITE}
          containerSize={88}
          borderRadius={44}
        />
      </View>
      <Typography style={styles.statusTitle}>Ride Is Progress</Typography>
      <Typography style={styles.statusSub}>Enjoy your ride!</Typography>
      {renderDriverCard(true)}
      {renderVehicleStats()}
      <View style={styles.fareCard}>
        <View style={styles.fareRow}>
          <Typography style={styles.fareLabel}>Estimate Fare</Typography>
          <Typography style={styles.fareValue}>CFA 330</Typography>
        </View>
        <View style={styles.fareDivider} />
        <View style={styles.fareRow}>
          <Typography style={styles.fareTotalLabel}>Payment</Typography>
          <Typography style={styles.fareTotalValue}>Cash</Typography>
        </View>
      </View>
      <CancelReasonModal
        visible={cancelVisible}
        onClose={() => setCancelVisible(false)}
        onContinue={() => { setCancelVisible(false); setPhase('where_to'); }}
      />
    </ScrollView>
  );

  /* ─── Phase: completed ─── */
  const renderCompleted = () => (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {renderProgress()}
      <View style={styles.statusIconWrap}>
        <GradientIcon
          componentName={VARIABLES.Feather}
          iconName="check"
          size={40}
          color={COLORS.WHITE}
          containerSize={88}
          borderRadius={44}
        />
      </View>
      <Typography style={styles.statusTitle}>Ride Completed</Typography>
      <Typography style={styles.statusSub}>Thank you for riding with us</Typography>
      {renderDriverCard(false)}
      {renderVehicleStats()}
      <View style={styles.fareCard}>
        <View style={styles.fareRow}>
          <Typography style={styles.fareLabel}>Estimate Fare</Typography>
          <Typography style={styles.fareValue}>CFA 330</Typography>
        </View>
        <View style={styles.fareDivider} />
        <View style={styles.fareRow}>
          <Typography style={styles.fareTotalLabel}>Payment</Typography>
          <Typography style={styles.fareTotalValue}>Cash</Typography>
        </View>
      </View>
    </ScrollView>
  );

  const renderContent = () => {
    switch (phase) {
      case 'where_to': return renderWhereTo();
      case 'choose_ride': return renderChooseRide();
      case 'finding': return renderFinding();
      case 'driver_found': return renderDriverFound();
      case 'in_progress': return renderInProgress();
      case 'completed': return renderCompleted();
    }
  };

  return (
    <Wrapper
      headerTitle="Book a Ride"
      showBackButton
      backIconStyle={BACK_ICON_STYLE}
      useScrollView={false}
      darkMode={false}
    >
      {renderMap()}
      {renderContent()}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  /* ── map car marker ── */
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
  dropoffDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.APP_SECONDARY,
    borderWidth: 2,
    borderColor: COLORS.WHITE,
  },

  /* ── scroll content ── */
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },

  /* ── section title ── */
  sectionTitle: {
    fontSize: FontSize.Large,
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
    marginBottom: 12,
    marginTop: 4,
  },

  /* ── where_to ── */
  locationCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  connectLine: {
    position: 'absolute',
    left: 27,
    top: 46,
    width: 2,
    height: 44,
    backgroundColor: COLORS.APP_LINE,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  pickupDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: COLORS.APP_PRIMARY,
    backgroundColor: COLORS.WHITE,
    marginRight: 10,
  },
  locationInputWrap: {
    flex: 1,
  },
  autocompleteContainer: {
    borderWidth: 0,
    backgroundColor: COLORS.APP_SURFACE,
    borderRadius: 10,
    marginBottom: 0,
  },
  savedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  savedInfo: {
    marginLeft: 12,
  },
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
  ctaBtn: {
    marginTop: 20,
  },

  /* ── choose_ride ── */
  distanceText: {
    fontSize: FontSize.Small,
    color: COLORS.APP_TEXT_MUTED,
    marginTop: -8,
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
  rideIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rideInfo: {
    flex: 1,
  },
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
  rideRight: {
    alignItems: 'flex-end',
  },
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
    marginBottom: 12,
    gap: 10,
  },
  promoInputWrap: {
    flex: 1,
  },
  promoBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    minWidth: 88,
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
    color: COLORS.APP_TEXT,
    fontWeight: FontWeight.SemiBold,
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

  /* ── finding ── */
  findingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 24,
  },
  findingTitle: {
    fontSize: FontSize.ExtraLarge,
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
    textAlign: 'center',
    marginTop: 28,
  },
  findingSub: {
    fontSize: FontSize.MediumSmall,
    color: COLORS.APP_TEXT_MUTED,
    textAlign: 'center',
    marginTop: 8,
  },
  cancelBtn: {
    marginTop: 32,
    backgroundColor: COLORS.APP_DANGER_BG,
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 28,
  },
  cancelBtnText: {
    color: COLORS.APP_DANGER_TEXT,
    fontSize: FontSize.MediumSmall,
    fontWeight: FontWeight.SemiBold,
  },

  /* ── driver card ── */
  statusIconWrap: {
    alignItems: 'center',
    marginBottom: 12,
  },
  driverCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  driverTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 10,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: FontSize.MediumSmall,
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  ratingText: {
    fontSize: FontSize.Small,
    color: COLORS.APP_TEXT_MUTED,
  },
  contactBtn: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.APP_LINE,
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
  inlineCancelText: {
    color: COLORS.APP_DANGER_TEXT,
    fontSize: FontSize.Small,
    fontWeight: FontWeight.SemiBold,
  },

  /* ── vehicle stats ── */
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

  /* ── progress steps ── */
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
    gap: 4,
  },
  progressSegWrap: {
    flex: 1,
    height: 6,
    position: 'relative',
  },
  progressSeg: {
    height: 5,
    borderRadius: 4,
  },
  progressSegActive: {
    backgroundColor: COLORS.APP_PRIMARY,
  },
  progressSegInactive: {
    backgroundColor: COLORS.APP_LINE,
  },
  progressDot: {
    position: 'absolute',
    right: -6,
    top: -3,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.APP_PRIMARY,
    borderWidth: 2,
    borderColor: COLORS.WHITE,
  },

  /* ── status text ── */
  statusTitle: {
    fontSize: FontSize.ExtraLarge,
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
    textAlign: 'center',
    marginBottom: 4,
  },
  statusSub: {
    fontSize: FontSize.Small,
    color: COLORS.APP_TEXT_MUTED,
    textAlign: 'center',
    marginBottom: 16,
  },
});
