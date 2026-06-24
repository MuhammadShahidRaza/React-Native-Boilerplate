import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import MapView from 'react-native-maps';
import { Button, Typography, Wrapper, Icon, Autocomplete, ModalComponent } from 'components/common';
import {
  reverseGeocode,
  getCurrentLocation,
  getLocationPermission,
  AddressDetails,
} from 'utils/location';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS } from 'utils/colors';
import { STYLES } from 'utils/commonStyles';
import { CustomBackIcon, navigate } from 'navigation/Navigators';
import { SCREENS } from 'constants/routes';
import { Map } from 'components/common/Map';
import { INITIAL_REGION } from 'constants/common';
import type { Region } from 'react-native-maps';
import { VARIABLES } from 'constants/common';
import { useRoute } from '@react-navigation/native';
import { screenHeight } from 'utils/helpers';
import { COMMON_TEXT } from 'constants/screens';
import { Address } from 'types/responseTypes';
import { isServiceAreaRestricted, isWithinIvoryCoast } from 'utils/serviceArea';
import { showToast } from 'utils/toast';

export const LocationMapPicker = () => {
  const route = useRoute<any>();
  const editAddress = route.params?.editAddress as Address | undefined;
  const addNewAddress = route.params?.addNewAddress;
  const mapRef = useRef<MapView>(null);
  const [address, setAddress] = useState<AddressDetails | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [initialRegion, setInitialRegion] = useState<Region>(INITIAL_REGION);
  const [regionReady, setRegionReady] = useState(false);
  const [showAddressSheet, setShowAddressSheet] = useState(addNewAddress ? true : false);
  const [outOfServiceArea, setOutOfServiceArea] = useState(false);

  // Rejects any address outside Ivory Coast — SN Lift only; no-op restriction for Sengo.
  const applyAddressIfInServiceArea = useCallback((details: AddressDetails | null) => {
    if (!details) {
      setAddress(null);
      return;
    }
    if (isServiceAreaRestricted() && !isWithinIvoryCoast(details.latitude, details.longitude)) {
      setAddress(null);
      setOutOfServiceArea(true);
      showToast({
        message: 'SN Lift is currently only available in Ivory Coast.',
        type: 'error',
      });
      return;
    }
    setOutOfServiceArea(false);
    setAddress(details);
  }, []);

  const fetchAddress = useCallback(
    async (region: Region) => {
      setLoadingAddress(true);
      try {
        const result = await reverseGeocode({
          latitude: region.latitude,
          longitude: region.longitude,
        });
        applyAddressIfInServiceArea(result);
      } catch {
        setAddress(null);
      } finally {
        setLoadingAddress(false);
      }
    },
    [applyAddressIfInServiceArea],
  );

  const handleRegionChangeComplete = useCallback(
    (region: Region) => fetchAddress(region),
    [fetchAddress],
  );

  useEffect(() => {
    const setupRegion = async () => {
      if (editAddress) {
        const lat = parseFloat(editAddress.latitude);
        const lng = parseFloat(editAddress.longitude);
        const region: Region = {
          ...INITIAL_REGION,
          latitude: isNaN(lat) ? INITIAL_REGION.latitude : lat,
          longitude: isNaN(lng) ? INITIAL_REGION.longitude : lng,
        };
        setInitialRegion(region);
        setRegionReady(true);
        // Pre-populate from existing address for edit flow
        setAddress({
          fullAddress:
            [
              editAddress.street,
              editAddress.city,
              editAddress.state,
              editAddress.postal_code,
              editAddress.country,
            ]
              .filter(Boolean)
              .join(', ') || editAddress.street,
          street: editAddress.street,
          city: editAddress.city,
          state: editAddress.state,
          postalCode: editAddress.postal_code,
          country: editAddress.country,
          latitude: isNaN(lat) ? INITIAL_REGION.latitude : lat,
          longitude: isNaN(lng) ? INITIAL_REGION.longitude : lng,
        });
        // Don't overwrite with reverse geocode when editing - keep existing address data
      } else {
        const hasPermission = await getLocationPermission();
        if (hasPermission) {
          const position = await getCurrentLocation();
          if (position) {
            const region: Region = {
              ...INITIAL_REGION,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            setInitialRegion(region);
            fetchAddress(region);
          } else {
            fetchAddress(INITIAL_REGION);
          }
        } else {
          fetchAddress(INITIAL_REGION);
        }
        setRegionReady(true);
      }
    };
    setupRegion();
  }, [editAddress, fetchAddress]);

  const handleAddressSelectedFromSheet = useCallback(
    (newAddress: AddressDetails | null) => {
      if (newAddress) {
        applyAddressIfInServiceArea(newAddress);
        setShowAddressSheet(false);
        const newRegion: Region = {
          ...INITIAL_REGION,
          latitude: newAddress.latitude,
          longitude: newAddress.longitude,
        };
        setInitialRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion, 500);
      }
    },
    [applyAddressIfInServiceArea],
  );

  const handleAddAddressDetails = () => {
    if (address) {
      navigate(SCREENS.LOCATION_ADD_DETAILS, {
        address: {
          fullAddress: address.fullAddress,
          street: address.street,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
          latitude: address.latitude,
          longitude: address.longitude,
          ...(editAddress?.id && { addressId: editAddress.id }),
        },
      });
    }
  };

  if (!regionReady) {
    return (
      <Wrapper headerTitle='Select Location'>
        <View style={[styles.container, styles.centered]}>
          <ActivityIndicator size='large' color={COLORS.PRIMARY} />
        </View>
      </Wrapper>
    );
  }

  return (
    <Wrapper headerTitle='Select Location'>
      <View style={styles.container}>
        <View style={styles.mapWrapper}>
          <Map
            mapRef={mapRef}
            region={initialRegion}
            scrollEnabled={true}
            showCenterMarker={true}
            showCurrentLocationButton={!editAddress}
            currentLocationButtonStyle={{
              bottom: screenHeight(8),
            }}
            onRegionChangeComplete={handleRegionChangeComplete}
            style={styles.map}
          />
        </View>

        {/* Bottom sheet */}
        <View style={styles.bottomSheet}>
          <View style={styles.dragHandle} />
          <View style={styles.addressRow}>
            <Icon
              componentName={VARIABLES.MaterialCommunityIcons}
              iconName='map-marker'
              size={FontSize.Large}
              color={COLORS.TEXT_SECONDARY}
            />
            <View style={styles.addressContent}>
              {loadingAddress ? (
                <ActivityIndicator size='small' color={COLORS.PRIMARY} />
              ) : (
                <Typography
                  style={[styles.addressText, outOfServiceArea && styles.addressErrorText]}
                  numberOfLines={3}
                >
                  {outOfServiceArea
                    ? 'SN Lift is only available in Ivory Coast. Move the map within Ivory Coast.'
                    : address?.fullAddress || 'Move map to select address'}
                </Typography>
              )}
            </View>
            <TouchableOpacity
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              onPress={() => setShowAddressSheet(true)}
            >
              <Icon
                componentName={VARIABLES.MaterialCommunityIcons}
                iconName='pencil-outline'
                size={FontSize.MediumLarge}
                color={COLORS.TEXT_SECONDARY}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.infoBanner}>
            <Icon
              componentName={VARIABLES.MaterialCommunityIcons}
              iconName='information-outline'
              size={FontSize.Medium}
              color={COLORS.WHITE}
            />
            <Typography style={styles.infoText}>
              Your order will be delivered to the pinned location. You can edit your written address
              on the next page.
            </Typography>
          </View>

          <Button
            title='Add address details'
            onPress={handleAddAddressDetails}
            style={styles.addButton}
            disabled={!address}
          />
        </View>
      </View>

      {/* Address search sheet - opens on pencil tap */}
      <ModalComponent
        modalVisible={showAddressSheet}
        setModalVisible={setShowAddressSheet}
        position='bottom'
        wantToCloseOnBack
        wantToCloseOnTop
        modalSecondaryContainerStyle={styles.addressSheet}
      >
        <TouchableOpacity
          style={{
            alignSelf: 'flex-start',
          }}
          onPress={() => setShowAddressSheet(false)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <CustomBackIcon />
        </TouchableOpacity>
        <View style={styles.addressSheetHeader}>
          <View style={styles.addressSheetInputWrapper}>
            <Autocomplete
              placeholder={COMMON_TEXT.ENTER_YOUR_LOCATION}
              setReverseGeocodedAddress={handleAddressSelectedFromSheet}
              value={addNewAddress ? '' : address?.fullAddress}
              showCurrentLocationButton={true}
              containerStyle={styles.addressSheetAutocomplete}
            />
          </View>
        </View>
        <Typography style={styles.addressSheetHint}>Enter an address to select location</Typography>
      </ModalComponent>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapWrapper: {
    height: screenHeight(60),
  },
  map: {
    flex: 1,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    paddingBottom: 40,
    ...STYLES.SHADOW,
    backgroundColor: COLORS.SURFACE,
  },
  addressSheet: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    minHeight: screenHeight(40),
    marginHorizontal: 0,
    borderRadius: 0,
    gap: 20,
  },
  addressSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 12,
  },
  addressSheetInputWrapper: {
    flex: 1,
  },
  addressSheetAutocomplete: {
    marginBottom: 0,
  },
  addressSheetHint: {
    fontSize: FontSize.Small,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 20,
  },
  useCurrentLocationRow: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  useCurrentLocationText: {
    fontSize: FontSize.Medium,
    color: COLORS.TEXT,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.TEXT_SECONDARY,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 15,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  addressContent: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
    minHeight: 24,
  },
  addressText: {
    fontSize: FontSize.MediumLarge,
    fontWeight: FontWeight.Medium,
    color: COLORS.TEXT,
  },
  addressErrorText: {
    color: COLORS.RED,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.SECONDARY,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: FontSize.Small,
    color: COLORS.WHITE,
    marginLeft: 8,
  },
  addButton: {
    backgroundColor: COLORS.PRIMARY,
  },
});
