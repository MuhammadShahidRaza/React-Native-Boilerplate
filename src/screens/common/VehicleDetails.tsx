import { useState } from 'react';
import { onBack } from 'navigation/index';
import { Pressable, StyleSheet, View } from 'react-native';
import { Input, Button, Wrapper, Dropdown, GradientIcon } from 'components/index';
import { VehicleDetailRow } from 'components/common/VehicleDetailRow';
import { STYLES, COLORS } from 'utils/index';
import { buildVehicleDetailsUploadPayload } from 'utils/workerOnboarding';
import { vehicleDetailsValidationSchema } from 'utils/validations';
import { useFormikForm, FocusProvider, useAsyncButton } from 'hooks/index';
import { sanitizeVehicleYear, pickFromUserDetails } from 'api/normalizers/snlift';
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

export const VehicleDetails = ({
  route,
}: AppScreenProps<typeof SCREENS.VEHICLE_DETAILS>) => {
  const isFromSettings = Boolean(route.params?.isFromSettings);
  const [isEditing, setIsEditing] = useState(!isFromSettings);
  const userRoot = useAppSelector(state => state.user.userDetails);

  const initialValues: VehicleDetailsFormValues = {
    vehicle_brand: pickFromUserDetails(userRoot, ['vehicle_brand', 'vehicle_make']),
    vehicle_model: pickFromUserDetails(userRoot, ['vehicle_model', 'category']),
    vehicle_license_plate: pickFromUserDetails(userRoot, ['vehicle_license_plate', 'license_plate']),
    vehicle_year: sanitizeVehicleYear(
      pickFromUserDetails(userRoot, ['vehicle_year', 'year']),
      pickFromUserDetails(userRoot, ['vehicle_brand', 'vehicle_make']),
    ),
    vehicle_color: pickFromUserDetails(userRoot, ['vehicle_color', 'color']),
    vehicle_type: pickFromUserDetails(userRoot, ['vehicle_type', 'type']),
  };

  const handleSubmit = async (values: VehicleDetailsFormValues) => {
    const user = await completeProfile({
      data: buildVehicleDetailsUploadPayload(values),
    });
    if (!user) return;

    if (isFromSettings) {
      setIsEditing(false);
    } else {
      onBack();
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
              title='Vehicle Year'
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
            <VehicleDetailRow label='Vehicle Year' value={formik.values.vehicle_year} />
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
