import { View, StyleSheet } from 'react-native';
import { Input, Button, Wrapper } from 'components/index';
import { STYLES, hasUri, screenHeight } from 'utils/index';
import { useFormikForm, FocusProvider, useAsyncButton } from 'hooks/index';
import { ImageUpload } from 'components/common/ImageUpload';
import { documentationUploadValidationSchema, formatSSN } from 'utils/validations';
import { AppScreenProps } from 'types/navigation';
import { SCREENS } from 'constants/index';
import { completeProfile } from 'api/functions/app/settings';
import { SelectedMedia } from 'hooks/useMediaPicker';
import { useAppSelector } from 'types/reduxTypes';

export interface DocumentationUploadFormValues {
  driver_license_number?: string;
  social_security_number?: string;
  driver_license_front?: SelectedMedia | null | string;
  driver_license_back?: SelectedMedia | null | string;
  business_license?: SelectedMedia | null | string;
  insurance_document?: SelectedMedia | null | string;
}

export const LegacyDocumentationUpload = ({
  route,
}: AppScreenProps<typeof SCREENS.DOCUMENTATION_UPLOAD>) => {
  const disableSubmit = route.params?.isFromSettings ? false : false;
  const user = useAppSelector(state => state.user.userDetails?.details);
  const handleSubmit = async (values: DocumentationUploadFormValues) => {
    const data = {
      driving_license_number: values?.driver_license_number,
      social_security_number: (values?.social_security_number ?? '').replace(/\D/g, ''),
      ...(hasUri(values?.driver_license_front) && {
        driving_license_front: values.driver_license_front,
      }),
      ...(hasUri(values?.driver_license_back) && {
        driving_license_back: values.driver_license_back,
      }),
      ...(hasUri(values?.business_license) && { business_license_front: values.business_license }),
      ...(hasUri(values?.insurance_document) && { insurance_document: values.insurance_document }),
    };
    await completeProfile({ data });
  };

  const getImageDisplayUri = (val: SelectedMedia | null | string | undefined) =>
    val ? (typeof val === 'string' ? val : val.uri) : null;

  const formik = useFormikForm({
    initialValues: {
      driver_license_number: user?.driving_license_number ?? '',
      social_security_number: (user?.social_security_number ?? '').replace(/\D/g, ''),
      driver_license_front: user?.driving_license_front ?? null,
      driver_license_back: user?.driving_license_back ?? null,
      business_license: user?.business_license_front ?? null,
      insurance_document: user?.insurance_document ?? null,
    },
    enableReinitialize: true,
    validationSchema: documentationUploadValidationSchema,
    onSubmit: handleSubmit,
  });

  const { loading, onPress } = useAsyncButton(formik);

  const handleImageChange = (image: SelectedMedia | null, name: string) => {
    formik.setFieldValue(name, image || null);
    formik.setFieldTouched(name, true);
  };

  const handleSSNChange = (text: string) => {
    const cleaned = text.replace(/[^\d]/g, '').slice(0, 9);
    formik.setFieldValue('social_security_number', cleaned);
  };

  return (
    <Wrapper useScrollView headerTitle='Documentation Upload'>
      <View style={styles.container}>
        <FocusProvider>
          <Input
            name='driver_license_number'
            title='Driver License Number'
            value={formik.values.driver_license_number}
            onChangeText={formik.handleChange('driver_license_number')}
            editable={!disableSubmit}
            placeholder='Enter driver license number'
            error={formik.errors.driver_license_number}
            touched={Boolean(formik.touched.driver_license_number && formik.submitCount)}
            maxLength={14}
          />

          <Input
            name='social_security_number'
            title='Social Security Number'
            value={formatSSN(formik.values.social_security_number)}
            onChangeText={handleSSNChange}
            placeholder='XXX-XX-XXXX'
            editable={!disableSubmit}
            keyboardType='numeric'
            error={formik.errors.social_security_number}
            touched={Boolean(formik.touched.social_security_number && formik.submitCount)}
            maxLength={11}
          />

          <View style={styles.uploadSection}>
            <ImageUpload
              title='Driver License Picture'
              label='Upload Driver License (Front)'
              onImageSelected={image => handleImageChange(image, 'driver_license_front')}
              selectedImage={getImageDisplayUri(formik.values.driver_license_front)}
              height={screenHeight(22)}
              disabled={disableSubmit}
              error={formik.errors.driver_license_front}
              touched={Boolean(formik.touched.driver_license_front && formik.submitCount)}
            />
            <ImageUpload
              label='Upload Driver License (Back)'
              onImageSelected={image => handleImageChange(image, 'driver_license_back')}
              selectedImage={getImageDisplayUri(formik.values.driver_license_back)}
              height={screenHeight(22)}
              disabled={disableSubmit}
              error={formik.errors.driver_license_back}
              touched={Boolean(formik.touched.driver_license_back && formik.submitCount)}
            />
          </View>

          <View style={styles.uploadSection}>
            <ImageUpload
              title='Business License'
              label='Upload Business License'
              onImageSelected={image => handleImageChange(image, 'business_license')}
              selectedImage={getImageDisplayUri(formik.values.business_license)}
              height={screenHeight(22)}
              disabled={disableSubmit}
              error={formik.errors.business_license}
              touched={Boolean(formik.touched.business_license && formik.submitCount)}
            />
          </View>

          <View style={styles.uploadSection}>
            <ImageUpload
              title='Insurance Document (Optional)'
              label='Upload Insurance Document'
              disabled={disableSubmit}
              onImageSelected={image => handleImageChange(image, 'insurance_document')}
              selectedImage={getImageDisplayUri(formik.values.insurance_document)}
              height={screenHeight(22)}
            />
          </View>

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
  uploadSection: {
    marginTop: 10,
  },
  submitButton: {
    marginTop: 30,
  },
});
