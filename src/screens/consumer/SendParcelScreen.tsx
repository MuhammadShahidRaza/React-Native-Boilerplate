import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Autocomplete, Button, GradientIcon, Icon, Input, Typography, Wrapper } from 'components/index';
import { INITIAL_REGION, VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import { navigate } from 'navigation/index';
import { SCREENS } from 'constants/routes';
import { COLORS } from 'utils/index';
import type { AddressDetails } from 'utils/location';

const BACK_ICON_STYLE = { backgroundColor: COLORS.APP_PRIMARY, borderRadius: 12 };

const PICKUP = { latitude: INITIAL_REGION.latitude + 0.008, longitude: INITIAL_REGION.longitude };
const DROPOFF = { latitude: INITIAL_REGION.latitude - 0.004, longitude: INITIAL_REGION.longitude + 0.005 };
const ROUTE_COORDS = [PICKUP, DROPOFF];
const MAP_REGION = {
  latitude: INITIAL_REGION.latitude + 0.002,
  longitude: INITIAL_REGION.longitude + 0.002,
  latitudeDelta: 0.03,
  longitudeDelta: 0.02,
};

export const SendParcelScreen = () => {
  const [pickupAddress, setPickupAddress] = useState<AddressDetails | null>(null);
  const [dropoffAddress, setDropoffAddress] = useState<AddressDetails | null>(null);
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [pkg, setPkg] = useState('');

  return (
    <Wrapper
      headerTitle="Send Parcel"
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
          {pickupAddress && dropoffAddress && (
            <>
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
            </>
          )}
        </MapView>
      </View>

      <View style={styles.content}>
        {/* Pickup & Drop-off */}
        <Typography style={styles.sectionTitle}>Pickup & Drop-Off</Typography>
        <View style={styles.locationCard}>
          <View style={styles.connectLine} />

          <View style={styles.locationRow}>
            <View style={styles.pickupDot} />
            <View style={styles.inputWrap}>
              <Autocomplete
                placeholder="Pickup Location"
                value={pickupAddress?.fullAddress ?? ''}
                setReverseGeocodedAddress={setPickupAddress}
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
            <View style={styles.inputWrap}>
              <Autocomplete
                placeholder="Drop-Off Location"
                value={dropoffAddress?.fullAddress ?? ''}
                setReverseGeocodedAddress={setDropoffAddress}
                showCurrentLocationButton={false}
                containerStyle={styles.autocompleteContainer}
                keepResultsAfterBlur
                keyboardShouldPersistTaps="handled"
              />
            </View>
          </View>
        </View>

        {/* Pricing */}
        <Typography style={styles.sectionTitle}>Pricing</Typography>
        <View style={styles.priceBox}>
          <View style={styles.priceRow}>
            <GradientIcon
              componentName={VARIABLES.MaterialCommunityIcons}
              iconName="package-variant"
              size={20}
              color={COLORS.WHITE}
              containerSize={40}
              borderRadius={10}
            />
            <View style={styles.priceInfo}>
              <Typography style={styles.priceLabel}>Base Fare</Typography>
              <Typography style={styles.priceSub}>Standard delivery</Typography>
            </View>
            <Typography style={styles.priceAmount}>CFA 550</Typography>
          </View>
        </View>

        {/* Sender Details */}
        <Typography style={styles.sectionTitle}>Sender Details</Typography>
        <Input
          name="senderName"
          placeholder="Sender Name"
          value={senderName}
          onChangeText={setSenderName}
          startIcon={{
            componentName: VARIABLES.Feather,
            iconName: 'user',
            size: FontSize.Medium,
            color: COLORS.APP_TEXT_MUTED,
          }}
        />
        <Input
          name="senderPhone"
          placeholder="Sender Phone"
          value={senderPhone}
          onChangeText={setSenderPhone}
          keyboardType="phone-pad"
          startIcon={{
            componentName: VARIABLES.Feather,
            iconName: 'phone',
            size: FontSize.Medium,
            color: COLORS.APP_TEXT_MUTED,
          }}
        />

        {/* Receiver Details */}
        <Typography style={styles.sectionTitle}>Receiver Details</Typography>
        <Input
          name="receiverName"
          placeholder="Receiver Name"
          value={receiverName}
          onChangeText={setReceiverName}
          startIcon={{
            componentName: VARIABLES.Feather,
            iconName: 'user',
            size: FontSize.Medium,
            color: COLORS.APP_TEXT_MUTED,
          }}
        />
        <Input
          name="receiverPhone"
          placeholder="Receiver Phone"
          value={receiverPhone}
          onChangeText={setReceiverPhone}
          keyboardType="phone-pad"
          startIcon={{
            componentName: VARIABLES.Feather,
            iconName: 'phone',
            size: FontSize.Medium,
            color: COLORS.APP_TEXT_MUTED,
          }}
        />

        {/* Package Description */}
        <Typography style={styles.sectionTitle}>Package Description</Typography>
        <Input
          name="pkg"
          placeholder="What are you sending?"
          value={pkg}
          onChangeText={setPkg}
          multiline
          maxLines={4}
          startIcon={{
            componentName: VARIABLES.Feather,
            iconName: 'package',
            size: FontSize.Medium,
            color: COLORS.APP_TEXT_MUTED,
          }}
        />

        <Button
          title="Request Courier"
          onPress={() => navigate(SCREENS.SEND_PARCEL_FINDING)}
          style={styles.ctaBtn}
          disabled={!pickupAddress || !dropoffAddress || !senderName || !receiverName}
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
  },
  sectionTitle: {
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
    marginBottom: 10,
    marginTop: 8,
  },
  locationCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
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
    height: 48,
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
  inputWrap: { flex: 1 },
  autocompleteContainer: {
    borderWidth: 0,
    backgroundColor: COLORS.APP_SURFACE,
    borderRadius: 10,
    marginBottom: 0,
  },
  priceBox: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.APP_LINE,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceInfo: { flex: 1 },
  priceLabel: {
    fontSize: FontSize.MediumSmall,
    fontWeight: FontWeight.SemiBold,
    color: COLORS.APP_TEXT,
  },
  priceSub: {
    fontSize: FontSize.Small,
    color: COLORS.APP_TEXT_MUTED,
    marginTop: 2,
  },
  priceAmount: {
    fontSize: FontSize.Large,
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_SECONDARY,
  },
  ctaBtn: { marginTop: 20 },
});
