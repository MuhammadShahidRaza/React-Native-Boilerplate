import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Input, Button, Wrapper, ModalComponent, Icon, Typography } from 'components/index';
import { SuccessFailureModal } from 'components/common/SuccessFailureModal';
import { VARIABLES } from 'constants/common';
import { COMMON_TEXT } from 'constants/index';
import { setIsUserLoggedIn } from 'store/slices/appSettings';
import { resetWorkerAvailability } from 'store/slices/worker';
import { useAppDispatch } from 'types/reduxTypes';
import { onBack } from 'navigation/index';
import { getAuthStackLoginIndex, getAuthStackRoutes } from 'config/authFlow';
import { STYLES, screenHeight, COLORS, removeKeychainItem } from 'utils/index';
import { useFormikForm, FocusProvider, useAsyncButton } from 'hooks/index';
import { ImageUpload } from 'components/common/ImageUpload';
import { workerDocumentsValidationSchema } from 'utils/validations';
import { AppScreenProps } from 'types/navigation';
import { SCREENS } from 'constants/index';
import type { CompleteProfileFormValues } from './CompleteProfile';
import { completeProfile } from 'api/functions/app/settings';
import { SelectedMedia } from 'hooks/useMediaPicker';
import { useAppSelector } from 'types/reduxTypes';
import { pickFromUserDetails } from 'api/normalizers/snlift';
import { buildWorkerDocumentsUploadPayload } from 'utils/workerOnboarding';
import { Calendar } from 'react-native-calendars';
import { FontSize } from 'types/fontTypes';

function parseStoredDate(value: string | undefined): string {
  if (!value?.trim()) return '';
  const raw = value.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  const ddmmyyyy = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (ddmmyyyy) return `${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`;
  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return '';
}

function formatDisplayDate(isoDate: string): string {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('T')[0].split('-');
  if (!year || !month || !day) return isoDate;
  return `${day}/${month}/${year}`;
}

export interface WorkerDocumentsFormValues {
  driver_license_number: string;
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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const user = useAppSelector(state => state.user.userDetails?.details) as
    | Record<string, unknown>
    | undefined;
  const userRoot = useAppSelector(state => state.user.userDetails);

  const returnToLoginAfterSignup = async () => {
    setSubmittedModalVisible(false);
    dispatch(setIsUserLoggedIn(false));
    dispatch(resetWorkerAvailability());
    await removeKeychainItem(VARIABLES.USER_TOKEN);
    props.navigation.reset({
      index: getAuthStackLoginIndex(),
      routes: getAuthStackRoutes(),
    });
  };

  const handleSubmit = async (values: WorkerDocumentsFormValues) => {
    const data = buildWorkerDocumentsUploadPayload(values) as CompleteProfileFormValues;
    const user = await completeProfile({ data });
    if (!user) return;

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
      driver_license_number: pickFromUserDetails(userRoot, [
        'driver_license_number',
        'driving_license_number',
      ]),
      driver_license_validity_date: parseStoredDate(
        pickFromUserDetails(userRoot, ['driver_license_validity_date', 'issue_date']),
      ),
      driver_license_front:
        (user?.driving_license_front as string | null | undefined) ??
        (user?.driver_license_front as string | null | undefined) ??
        null,
      driver_license_back:
        (user?.driving_license_back as string | null | undefined) ??
        (user?.driver_license_back as string | null | undefined) ??
        null,
      mot_picture:
        (user?.mot_certificate as string | null | undefined) ??
        (user?.business_license_front as string | null | undefined) ??
        null,
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

  const handleDateSelect = (day: { dateString: string }) => {
    formik.setFieldValue('driver_license_validity_date', day.dateString);
    formik.setFieldTouched('driver_license_validity_date', true);
    setShowDatePicker(false);
  };

  const selectedDate = formik.values.driver_license_validity_date;
  const todayIso = new Date().toISOString().split('T')[0];

  return (
    <Wrapper useScrollView headerTitle='Documents'>
      <View style={styles.container}>
        <FocusProvider>
          <Input
            name='driver_license_number'
            title='Driver License Number'
            value={formik.values.driver_license_number}
            onChangeText={text =>
              formik.setFieldValue('driver_license_number', text.toUpperCase())
            }
            placeholder='Enter driver license number'
            autoCapitalize='characters'
            maxLength={14}
            error={formik.errors.driver_license_number}
            touched={Boolean(formik.touched.driver_license_number && formik.submitCount)}
          />

          <Input
            name='driver_license_validity_date'
            title='Driver License validity date'
            value={formatDisplayDate(selectedDate)}
            onChangeText={() => {}}
            placeholder='Select validity date'
            editable={false}
            endIcon={{
              componentName: VARIABLES.MaterialIcons,
              iconName: 'calendar-today',
              color: COLORS.BORDER,
              size: FontSize.MediumLarge,
              iconStyle: { marginRight: 3 },
            }}
            onPress={() => setShowDatePicker(true)}
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

      <ModalComponent
        position='center'
        modalVisible={showDatePicker}
        setModalVisible={setShowDatePicker}
        modalSecondaryContainerStyle={styles.datePickerModal}
      >
        <View style={styles.datePickerHeader}>
          <Typography style={styles.datePickerTitle}>License validity date</Typography>
          <Icon
            componentName={VARIABLES.Ionicons}
            iconName='close'
            size={FontSize.XXL}
            color={COLORS.PRIMARY}
            onPress={() => setShowDatePicker(false)}
          />
        </View>
        <Calendar
          onDayPress={handleDateSelect}
          style={styles.calendar}
          markedDates={
            selectedDate
              ? {
                  [selectedDate]: {
                    selected: true,
                    selectedColor: COLORS.PRIMARY,
                  },
                }
              : undefined
          }
          minDate={todayIso}
          theme={{
            backgroundColor: COLORS.BACKGROUND,
            calendarBackground: COLORS.BACKGROUND,
            textSectionTitleColor: COLORS.TEXT,
            selectedDayBackgroundColor: COLORS.PRIMARY,
            selectedDayTextColor: COLORS.WHITE,
            todayTextColor: COLORS.PRIMARY,
            dayTextColor: COLORS.TEXT,
            textDisabledColor: COLORS.HEADER,
            arrowColor: COLORS.PRIMARY,
            monthTextColor: COLORS.TEXT,
            textDayFontWeight: '500',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '600',
            textDayFontSize: FontSize.Medium,
            textMonthFontSize: FontSize.Large,
            textDayHeaderFontSize: FontSize.MediumSmall,
          }}
        />
        <Button title='Done' onPress={() => setShowDatePicker(false)} style={styles.datePickerButton} />
      </ModalComponent>

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
  datePickerModal: {
    gap: 20,
    padding: 20,
    backgroundColor: COLORS.SURFACE,
    borderRadius: 20,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  datePickerTitle: {
    fontSize: FontSize.Large,
    fontWeight: 'bold',
  },
  calendar: {
    borderRadius: 10,
    padding: 10,
  },
  datePickerButton: {
    marginTop: 4,
  },
});
