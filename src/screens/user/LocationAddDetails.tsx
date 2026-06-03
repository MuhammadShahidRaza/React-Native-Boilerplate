import { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Button, Input, Typography, Wrapper, Icon } from 'components/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS } from 'utils/colors';
import { STYLES } from 'utils/commonStyles';
import { Map } from 'components/common/Map';
import { INITIAL_REGION } from 'constants/common';
import { useRoute } from '@react-navigation/native';
import { VARIABLES } from 'constants/common';
import { createAddress, updateAddress } from 'api/functions/app/address';
import { pop } from 'navigation/Navigators';
import { useAppDispatch } from 'types/reduxTypes';
import { addAddress, updateAddressInList, setAddressDefault } from 'store/slices/address';
import type { Address } from 'types/responseTypes';

const LABELS = [
  { id: 'home', label: 'Home', icon: 'home-outline' },
  { id: 'work', label: 'Work', icon: 'briefcase-outline' },
  { id: 'partner', label: 'Partner', icon: 'heart-outline' },
  { id: 'other', label: 'Other', icon: 'add' },
] as const;

const ensureFullAddress = (a: Address): Address => {
  if (a.full_address?.trim()) return a;
  const parts = [a.street, a.city, a.state, a.postal_code, a.country].filter(Boolean);
  return { ...a, full_address: parts.join(', ') || a.street || 'Address' };
};

export const LocationAddDetails = () => {
  const dispatch = useAppDispatch();
  const route = useRoute<any>();
  const address = route.params?.address ?? null;

  const [suburb, setSuburb] = useState('');
  const [floor, setFloor] = useState('');
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const region = address
    ? {
        latitude: address.latitude,
        longitude: address.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }
    : INITIAL_REGION;

  const handleSaveAndContinue = async () => {
    if (!address) return;
    setSaving(true);
    try {
      const baseStreet = address.street || address.fullAddress?.split(',')[0]?.trim() || '';
      const street =
        [baseStreet, suburb, floor].filter(Boolean).join(', ') || baseStreet || suburb || 'Address';
      const labelTitle =
        LABELS.find(l => l.id === selectedLabel)?.label ?? selectedLabel ?? 'Home';
      const payload = {
        title: labelTitle,
        street,
        city: address.city || '',
        state: address.state || '',
        postal_code: address.postalCode || '',
        country: address.country || '',
        latitude: String(address.latitude),
        longitude: String(address.longitude),
        is_default: true,
        ...(selectedLabel && { label: selectedLabel }),
      };

      const result = address.addressId
        ? await updateAddress(address.addressId, payload)
        : await createAddress(payload);

      if (result) {
        const addr = ensureFullAddress(result as Address);
        if (address.addressId) {
          dispatch(updateAddressInList(addr));
          if (addr.is_default === 1) dispatch(setAddressDefault(addr.id));
        } else {
          dispatch(addAddress({ ...addr, is_default: 1 }));
          dispatch(setAddressDefault(addr.id)); // new address is always set as default
        }
        // Location → MapPicker → AddDetails: pop both picker + details in one step
        pop(2);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to save address. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!address) {
    return null;
  }

  return (
    <Wrapper headerTitle='Add Address Details'>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps='handled'
          showsVerticalScrollIndicator={false}
        >
          {/* Map preview */}
          <View style={styles.mapContainer}>
            <Map
              region={region}
              scrollEnabled={false}
              showCenterMarker={true}
              showCurrentLocationButton={false}
              style={styles.map}
            />
          </View>

          {/* Selected address */}
          <View style={styles.addressRow}>
            <Icon
              componentName={VARIABLES.MaterialCommunityIcons}
              iconName='map-marker'
              size={FontSize.Medium}
              color={COLORS.TEXT_SECONDARY}
            />
            <Typography style={styles.addressText} numberOfLines={2}>
              {address.fullAddress}
            </Typography>
            <TouchableOpacity hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Icon
                componentName={VARIABLES.MaterialCommunityIcons}
                iconName='pencil-outline'
                size={FontSize.Medium}
                color={COLORS.TEXT_SECONDARY}
              />
            </TouchableOpacity>
          </View>

          {/* Suburb / Neighborhood */}
          <Typography style={styles.sectionTitle}>Suburb / Neighborhood</Typography>
          <Input
            name='suburb'
            value={suburb}
            onChangeText={setSuburb}
            placeholder='e.g. Brooklyn, Downtown'
            containerStyle={styles.input}
          />

          {/* Floor */}
          <Input
            name='floor'
            value={floor}
            onChangeText={setFloor}
            placeholder='Floor'
            containerStyle={styles.input}
          />

          {/* Add a label */}
          <Typography style={styles.sectionTitle}>Add a label</Typography>
          <View style={styles.labelRow}>
            {LABELS.map(item => (
              <TouchableOpacity
                key={item.id}
                style={[styles.labelChip, selectedLabel === item.id && styles.labelChipSelected]}
                onPress={() => setSelectedLabel(selectedLabel === item.id ? null : item.id)}
              >
                <Icon
                  componentName={VARIABLES.Ionicons}
                  iconName={item.icon}
                  size={FontSize.Large}
                  color={selectedLabel === item.id ? COLORS.PRIMARY : COLORS.TEXT_SECONDARY}
                />
                <Typography
                  style={[styles.labelText, selectedLabel === item.id && styles.labelTextSelected]}
                >
                  {item.label}
                </Typography>
              </TouchableOpacity>
            ))}
          </View>

          <Button
            title='Save and continue'
            onPress={handleSaveAndContinue}
            style={styles.saveButton}
            loading={saving}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  mapContainer: {
    height: 140,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    ...STYLES.SHADOW,
  },
  map: {
    flex: 1,
    borderRadius: 12,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 20,
  },
  addressText: {
    flex: 1,
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.Medium,
    color: COLORS.TEXT,
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.Medium,
    color: COLORS.TEXT,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: FontSize.Small,
    color: COLORS.TEXT_SECONDARY,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  input: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  textAreaInput: {
    marginHorizontal: 16,
    marginBottom: 4,
  },
  charCount: {
    fontSize: FontSize.Small,
    color: COLORS.TEXT_SECONDARY,
    alignSelf: 'flex-end',
    marginRight: 16,
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  labelChip: {
    width: 72,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  labelChipSelected: {
    borderColor: COLORS.PRIMARY,
    backgroundColor: `${COLORS.PRIMARY}15`,
  },
  labelText: {
    fontSize: FontSize.Small,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 4,
  },
  labelTextSelected: {
    color: COLORS.PRIMARY,
    fontWeight: FontWeight.Medium,
  },
  saveButton: {
    marginHorizontal: 16,
    backgroundColor: COLORS.PRIMARY,
  },
});
