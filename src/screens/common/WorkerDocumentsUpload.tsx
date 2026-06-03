import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Input, Button, Wrapper } from 'components/index';
import { SuccessFailureModal } from 'components/common/SuccessFailureModal';
import { VARIABLES } from 'constants/common';
import { COMMON_TEXT } from 'constants/index';
import { setIsUserLoggedIn } from 'store/slices/appSettings';
import { resetWorkerAvailability, setDocumentsComplete } from 'store/slices/worker';
import store from 'store/store';
import { useAppDispatch } from 'types/reduxTypes';
import { onBack } from 'navigation/index';
import { getAuthStackLoginIndex, getAuthStackRoutes } from 'config/authFlow';
import { STYLES, hasUri, screenHeight, COLORS, removeKeychainItem } from 'utils/index';
import { useFormikForm, FocusProvider, useAsyncButton } from 'hooks/index';
import { ImageUpload } from 'components/common/ImageUpload';
import { workerDocumentsValidationSchema } from 'utils/validations';
import { AppScreenProps } from 'types/navigation';
import { SCREENS } from 'constants/index';
import { completeProfile } from 'api/functions/app/settings';
import { SelectedMedia } from 'hooks/useMediaPicker';
import { useAppSelector } from 'types/reduxTypes';
import { safeString } from 'utils/index';

export interface WorkerDocumentsFormValues {
  driver_license_validity_date: string;
  driver_license_front?: SelectedMedia | null | string;
  driver_license_back?: SelectedMedia | null | string;
  mot_picture?: SelectedMedia | null | string;
}

export const WorkerDocumentsUpload = (
  props: AppScreenProps<typeof SCREENS.DOCUMENTATION_UPLOAD>,
) => {
  const dispatch = useAppDispatch();
  const isFromSettings = Boolean(props.route.params?.isFromSettings);
  const [submittedModalVisible, setSubmittedModalVisible] = useState(false);
  const user = useAppSelector(state => state.user.userDetails?.details);
  const userRoot = useAppSelector(state => state.user.userDetails);

  const returnToLoginAfterSignup = async () => {
    setSubmittedModalVisible(false);
    store.dispatch(setIsUserLoggedIn(false));
    dispatch(resetWorkerAvailability());
    await removeKeychainItem(VARIABLES.USER_TOKEN);
    props.navigation.reset({
      index: getAuthStackLoginIndex(),
      routes: getAuthStackRoutes(),
    });
  };

  const handleSubmit = async (values: WorkerDocumentsFormValues) => {
    const data = {
      issue_date: values.driver_license_validity_date,
      ...(hasUri(values.driver_license_front) && {
        driving_license_front: values.driver_license_front,
      }),
      ...(hasUri(values.driver_license_back) && {
        driving_license_back: values.driver_license_back,
      }),
      ...(hasUri(values.mot_picture) && {
        business_license_front: values.mot_picture,
      }),
    };
    const user = await completeProfile({ data });
    if (!user) return;

    dispatch(setDocumentsComplete(true));
    if (!isFromSettings) {
      setSubmittedModalVisible(true);
    } else {
      onBack();
    }
  };

  const getImageDisplayUri = (val: SelectedMedia | null | string | undefined) =>
    val ? (typeof val === 'string' ? val : val.uri) : null;

  const formik = useFormikForm({
    initialValues: {
      driver_license_validity_date:
        safeString(userRoot?.issue_date) ||
        safeString((user as { driver_license_validity_date?: string })?.driver_license_validity_date) ||
        '03/05/2029',
      driver_license_front: user?.driving_license_front ?? null,
      driver_license_back: user?.driving_license_back ?? null,
      mot_picture: user?.business_license_front ?? null,
    },
    enableReinitialize: true,
    validationSchema: workerDocumentsValidationSchema,
    onSubmit: handleSubmit,
  });

  const { loading, onPress } = useAsyncButton(formik);

  const handleImageChange = (image: SelectedMedia | null, name: string) => {
    formik.setFieldValue(name, image || null);
    formik.setFieldTouched(name, true);
  };

  return (
    <Wrapper useScrollView headerTitle='Documents'>
      <View style={styles.container}>
        <FocusProvider>
          <Input
            name='driver_license_validity_date'
            title='Driver License validity date'
            value={formik.values.driver_license_validity_date}
            onChangeText={formik.handleChange('driver_license_validity_date')}
            placeholder='DD/MM/YYYY'
            error={formik.errors.driver_license_validity_date}
            touched={Boolean(
              formik.touched.driver_license_validity_date && formik.submitCount,
            )}
          />

          <View style={styles.uploadSection}>
            <ImageUpload
              title='Driver License Picture'
              label='Upload Driver License (Front)'
              onImageSelected={image => handleImageChange(image, 'driver_license_front')}
              selectedImage={getImageDisplayUri(formik.values.driver_license_front)}
              height={screenHeight(20)}
              error={formik.errors.driver_license_front}
              touched={Boolean(formik.touched.driver_license_front && formik.submitCount)}
            />
            <ImageUpload
              title='Driver License Picture'
              label='Upload Driver License (Back)'
              onImageSelected={image => handleImageChange(image, 'driver_license_back')}
              selectedImage={getImageDisplayUri(formik.values.driver_license_back)}
              height={screenHeight(20)}
              error={formik.errors.driver_license_back}
              touched={Boolean(formik.touched.driver_license_back && formik.submitCount)}
            />
            <ImageUpload
              title='Upload MOT Picture'
              label='Upload MOT Picture'
              onImageSelected={image => handleImageChange(image, 'mot_picture')}
              selectedImage={getImageDisplayUri(formik.values.mot_picture)}
              height={screenHeight(20)}
              error={formik.errors.mot_picture}
              touched={Boolean(formik.touched.mot_picture && formik.submitCount)}
            />
          </View>

          <Button
            title='Complete'
            loading={loading}
            onPress={onPress}
            style={styles.submitButton}
          />
        </FocusProvider>
      </View>

      <SuccessFailureModal
        isVisible={submittedModalVisible}
        setIsVisible={setSubmittedModalVisible}
        onConfirm={returnToLoginAfterSignup}
        title={COMMON_TEXT.REQUEST_SUBMITTED_SUCCESSFULLY}
        description={
          COMMON_TEXT.YOUR_REQUEST_HAS_BEEN_SUBMITTED_TO_THE_ADMIN_YOU_WILL_BE_INFORMED_ONCE_APPROVED
        }
        primaryButtonText={COMMON_TEXT.BACK_TO_LOGIN}
        wantTwoButtons={false}
        iconStyle={{ componentName: VARIABLES.Entypo, iconName: 'check', color: COLORS.BACKGROUND }}
      />
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    ...STYLES.CONTAINER,
    paddingVertical: 20,
  },
  uploadSection: {
    marginTop: 8,
    gap: 4,
  },
  submitButton: {
    marginTop: 28,
    backgroundColor: COLORS.SECONDARY,
  },
});
