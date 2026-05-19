import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Input, Button, Wrapper, Dropdown, GradientIcon } from 'components/index';
import { VehicleDetailRow } from 'components/common/VehicleDetailRow';
import { safeString, STYLES, COLORS } from 'utils/index';
import { useFormikForm, FocusProvider, useAsyncButton } from 'hooks/index';
import { vehicleDetailsValidationSchema } from 'utils/validations';
import { AppScreenProps } from 'types/navigation';
import { SCREENS, VARIABLES } from 'constants/index';
import { completeProfile } from 'api/functions/app/settings';
import { useAppSelector } from 'types/reduxTypes';
import type { DropdownItemProps } from 'components/common/Dropdown';

const VEHICLE_TYPES: DropdownItemProps[] = [
  { name: 'Standard', id: 1 },
  { name: 'Premium', id: 2 },
  { name: 'XL', id: 3 },
  { name: 'Bike', id: 4 },
];

export interface VehicleDetailsFormValues {
  vehicle_brand: string;
  vehicle_model: string;
  vehicle_license_plate: string;
  vehicle_year: string;
  vehicle_color: string;
  vehicle_type: string;
}

const consumerBackIcon = {
  backgroundColor: COLORS.APP_PRIMARY,
  borderRadius: 12,
};

export const VehicleDetails = ({
  route,
}: AppScreenProps<typeof SCREENS.VEHICLE_DETAILS>) => {
  const isFromSettings = Boolean(route.params?.isFromSettings);
  const [isEditing, setIsEditing] = useState(!isFromSettings);
  const user = useAppSelector(state => state.user.userDetails?.details);
  const userRoot = useAppSelector(state => state.user.userDetails);

  const initialValues: VehicleDetailsFormValues = {
    vehicle_brand: safeString((user as { vehicle_brand?: string })?.vehicle_brand) || 'Toyota',
    vehicle_model:
      safeString((user as { vehicle_model?: string })?.vehicle_model) ||
      safeString(userRoot?.category) ||
      'Corolla',
    vehicle_license_plate:
      safeString((user as { vehicle_license_plate?: string })?.vehicle_license_plate) ||
      'AB20 CDE',
    vehicle_year: safeString((user as { vehicle_year?: string })?.vehicle_year) || '2020',
    vehicle_color: safeString((user as { vehicle_color?: string })?.vehicle_color) || 'Silver',
    vehicle_type: safeString((user as { vehicle_type?: string })?.vehicle_type) || 'Standard',
  };

  const handleSubmit = async (values: VehicleDetailsFormValues) => {
    await completeProfile({
      data: {
        vehicle_brand: values.vehicle_brand,
        vehicle_model: values.vehicle_model,
        vehicle_license_plate: values.vehicle_license_plate,
        vehicle_year: values.vehicle_year,
        vehicle_color: values.vehicle_color,
        vehicle_type: values.vehicle_type,
        vehicle_make: values.vehicle_brand,
      },
    });
    if (isFromSettings) {
      setIsEditing(false);
    }
  };

  const formik = useFormikForm({
    initialValues,
    enableReinitialize: true,
    validationSchema: vehicleDetailsValidationSchema,
    onSubmit: handleSubmit,
  });

  const { loading, onPress } = useAsyncButton(formik);

  const showForm = isEditing || !isFromSettings;

  return (
    <Wrapper
      useScrollView
      headerTitle='Vehicle Details'
      showBackButton
      backIconStyle={consumerBackIcon}
      headerEndIcon={() =>
        isFromSettings && !isEditing ? (
          <Pressable onPress={() => setIsEditing(true)} hitSlop={8}>
            <GradientIcon
              componentName={VARIABLES.MaterialCommunityIcons}
              iconName='account-edit-outline'
              size={22}
              color={COLORS.WHITE}
              borderRadius={12}
              containerSize={44}
              containerStyle={consumerBackIcon}
            />
          </Pressable>
        ) : null
      }
    >
      <View style={styles.container}>
        {showForm ? (
          <FocusProvider>
            <Input
              name='vehicle_brand'
              title='Vehicle Brand'
              value={formik.values.vehicle_brand}
              onChangeText={formik.handleChange('vehicle_brand')}
              placeholder='Toyota'
              error={formik.errors.vehicle_brand}
              touched={Boolean(formik.touched.vehicle_brand && formik.submitCount)}
            />
            <Input
              name='vehicle_model'
              title='Vehicle Model'
              value={formik.values.vehicle_model}
              onChangeText={formik.handleChange('vehicle_model')}
              placeholder='Corolla'
              error={formik.errors.vehicle_model}
              touched={Boolean(formik.touched.vehicle_model && formik.submitCount)}
            />
            <Input
              name='vehicle_license_plate'
              title='Vehicle License Plate'
              value={formik.values.vehicle_license_plate}
              onChangeText={formik.handleChange('vehicle_license_plate')}
              placeholder='AB20 CDE'
              autoCapitalize='characters'
              error={formik.errors.vehicle_license_plate}
              touched={Boolean(formik.touched.vehicle_license_plate && formik.submitCount)}
            />
            <Input
              name='vehicle_year'
              title='Vehicle Make'
              value={formik.values.vehicle_year}
              onChangeText={formik.handleChange('vehicle_year')}
              placeholder='2020'
              keyboardType='number-pad'
              maxLength={4}
              error={formik.errors.vehicle_year}
              touched={Boolean(formik.touched.vehicle_year && formik.submitCount)}
            />
            <Input
              name='vehicle_color'
              title='Vehicle Color'
              value={formik.values.vehicle_color}
              onChangeText={formik.handleChange('vehicle_color')}
              placeholder='Silver'
              error={formik.errors.vehicle_color}
              touched={Boolean(formik.touched.vehicle_color && formik.submitCount)}
            />
            <Dropdown
              title='Vehicle Type'
              options={VEHICLE_TYPES}
              selectedValue={formik.values.vehicle_type}
              onSelect={value => {
                formik.setFieldValue('vehicle_type', value);
                formik.setFieldTouched('vehicle_type', true);
              }}
              error={formik.errors.vehicle_type}
              touched={Boolean(formik.touched.vehicle_type && formik.submitCount)}
            />
            <Button
              title={isFromSettings ? 'Update' : 'Save'}
              loading={loading}
              onPress={onPress}
              style={styles.submitButton}
            />
          </FocusProvider>
        ) : (
          <View style={styles.viewCard}>
            <VehicleDetailRow label='Vehicle Brand' value={formik.values.vehicle_brand} />
            <VehicleDetailRow label='Vehicle Model' value={formik.values.vehicle_model} />
            <VehicleDetailRow
              label='Vehicle License Plate'
              value={formik.values.vehicle_license_plate}
            />
            <VehicleDetailRow label='Vehicle Make' value={formik.values.vehicle_year} />
            <VehicleDetailRow label='Vehicle Color' value={formik.values.vehicle_color} />
            <VehicleDetailRow
              label='Vehicle Type'
              value={formik.values.vehicle_type}
              isLast
            />
          </View>
        )}
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    ...STYLES.CONTAINER,
    paddingVertical: 20,
  },
  viewCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.APP_LINE,
    paddingHorizontal: 16,
    marginTop: 4,
  },
  submitButton: {
    marginTop: 28,
    backgroundColor: COLORS.SECONDARY,
  },
});
