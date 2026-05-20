import { View, StyleSheet } from 'react-native';
import { Input, Button, Wrapper, Autocomplete, Dropdown } from 'components/index';
import { safeString, STYLES } from 'utils/index';
import { useFormikForm, FocusProvider, useAsyncButton, useServices } from 'hooks/index';
import { professionalDetailsValidationSchema } from 'utils/validations';
import { AppScreenProps } from 'types/navigation';
import { SCREENS } from 'constants/index';
import { completeProfile } from 'api/functions/app/settings';
import { onBack } from 'navigation/index';
import { useAppSelector } from 'types/reduxTypes';

export interface ProfessionalDetailsFormValues {
  years_of_experience?: string;
  services_offered?: string;
  services_offered_id?: string;
  service_radius?: string;
  service_area?: string;
  zip_code?: string;
  state?: string;
  city?: string;
  latitude?: string;
  longitude?: string;
}

export const ProfessionalDetails = ({
  route,
}: AppScreenProps<typeof SCREENS.PROFESSIONAL_DETAILS>) => {
  const disableSubmit = route.params?.isFromSettings ? false : false;
  const user = useAppSelector(state => state.user.userDetails?.details);
  const { services: servicesOffered } = useServices();

  const handleSubmit = async (values: ProfessionalDetailsFormValues) => {
    const data = {
      state: values?.state,
      city: values?.city,
      zip_code: values?.zip_code,
      latitude: values?.latitude,
      longitude: values?.longitude,
      service_id: values?.services_offered_id,
      experience: values?.years_of_experience,
      radius: values?.service_radius,
      area: values?.service_area,
    };
    const user = await completeProfile({ data });
    if (user) {
      onBack();
    }
  };

  const formik = useFormikForm({
    initialValues: {
      years_of_experience: safeString(user?.experience),
      services_offered: safeString(user?.service?.name),
      service_radius: safeString(user?.radius),
      service_area: safeString(user?.area),
      zip_code: safeString(user?.zip_code),
      latitude: safeString(user?.latitude),
      services_offered_id: safeString(user?.service?.id?.toString()),
      longitude: safeString(user?.longitude),
      city: safeString(user?.city),
      country: safeString(user?.country),
      state: safeString(user?.state),
    },
    enableReinitialize: true,
    validationSchema: professionalDetailsValidationSchema,
    onSubmit: handleSubmit,
  });

  // 🎯 Super simple! Just pass formik - it automatically detects and uses submitForm()
  const { loading, onPress } = useAsyncButton(formik);

  return (
    <Wrapper useScrollView={true} headerTitle='Professional Details'>
      <View style={styles.container}>
        <FocusProvider>
          <Input
            name='years_of_experience'
            title='Years of Experience'
            value={formik.values.years_of_experience}
            onChangeText={formik.handleChange('years_of_experience')}
            keyboardType='number-pad'
            editable={!disableSubmit}
            placeholder='Enter years of experience'
            error={formik.errors.years_of_experience}
            touched={Boolean(formik.touched.years_of_experience && formik.submitCount)}
            maxLength={2}
          />

          <Dropdown
            title='Types of Services Offered'
            options={servicesOffered}
            disabled={disableSubmit}
            selectedValue={formik.values.services_offered}
            onSelect={(value, item) => {
              formik.setFieldValue('services_offered', value);
              formik.setFieldValue('services_offered_id', item?.id);
            }}
            error={formik.errors.services_offered}
            containerStyle={{
              marginBottom: 0,
            }}
            textStyle={{
              textTransform: 'capitalize',
            }}
            touched={Boolean(formik.touched.services_offered && formik.submitCount)}
          />

          <Input
            name='service_radius'
            title='Service Radius'
            value={formik.values.service_radius}
            onChangeText={formik.handleChange('service_radius')}
            placeholder='Enter service radius in miles'
            keyboardType='numeric'
            maxLength={3}
            editable={!disableSubmit}
            error={formik.errors.service_radius}
            touched={Boolean(formik.touched.service_radius && formik.submitCount)}
          />

          <Autocomplete
            title='Service Area'
            placeholder='Enter service area'
            setReverseGeocodedAddress={address => {
              formik.setFieldValue('service_area', address?.fullAddress || '');
              formik.setFieldValue('zip_code', address?.postalCode || '');
              formik.setFieldValue('latitude', address?.latitude || '');
              formik.setFieldValue('city', address?.city || '');
              formik.setFieldValue('country', address?.country || '');
              formik.setFieldValue('state', address?.country || ''); //TODO: change to state
              formik.setFieldValue('longitude', address?.longitude || '');
            }}
            value={formik.values.service_area}
            disabled={disableSubmit}
            error={formik.errors.service_area}
            touched={Boolean(formik.touched.service_area && formik.submitCount)}
          />

          <Input
            name='zip_code'
            title='Zip Code'
            value={formik.values.zip_code}
            onChangeText={formik.handleChange('zip_code')}
            keyboardType='numeric'
            editable={!disableSubmit}
            placeholder='Enter zip code'
            error={formik.errors.zip_code}
            touched={Boolean(formik.touched.zip_code && formik.submitCount)}
            maxLength={8}
          />

          {!disableSubmit && (
            <Button
              title='Submit'
              disabled={!formik.dirty}
              loading={loading}
              onPress={onPress}
              style={styles.submitButton}
            />
          )}
        </FocusProvider>
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    ...STYLES.CONTAINER,
    paddingVertical: 20,
  },
  submitButton: {
    marginTop: 30,
  },
});
