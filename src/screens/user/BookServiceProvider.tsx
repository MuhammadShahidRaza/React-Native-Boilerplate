import { useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  Input,
  Button,
  Dropdown,
  Wrapper,
  MultipleImageUpload,
  ModalComponent,
  Icon,
  Typography,
} from 'components/index';
import {
  COLORS,
  STYLES,
  screenHeight,
  formatDateMonthDayYear,
  safeString,
  showToast,
} from 'utils/index';
import { ENV_CONSTANTS, VARIABLES } from 'constants/common';
import { FocusProvider, useFormikForm, useAsyncButton } from 'hooks/index';
import { useCurrentLocation } from 'hooks/useCurrentLocation';
import { useAppSelector } from 'types/reduxTypes';
import { bookServiceProviderValidationSchema } from 'utils/validations';
import { SCREENS } from 'constants/index';
import { AppScreenProps } from 'types/navigation';
import { Calendar } from 'react-native-calendars';
import { FontSize } from 'types/fontTypes';
import { navigate, replace } from 'navigation/index';
import { DropdownItemProps } from 'components/common/Dropdown';
import { bookServiceProvider } from 'api/functions/app/home';
import { SelectedMedia } from 'hooks/useMediaPicker';
import type { Address } from 'types/responseTypes';
import { logger } from 'utils/logger';

const getAddressString = (addr: Address | undefined) => {
  if (!addr) return null;
  if (addr.full_address?.trim()) return addr.full_address;
  const parts = [addr.street, addr.city, addr.state, addr.postal_code, addr.country].filter(
    Boolean,
  );
  return parts.join(', ') || addr.street || null;
};

// Generate vehicle years from current year backwards (e.g., 2025, 2024, 2023, ... 1990)
const generateVehicleYears = (): DropdownItemProps[] => {
  const currentYear = new Date().getFullYear();
  const startYear = 1970; // Start from 1970
  const years: DropdownItemProps[] = [];
  for (let year = currentYear; year >= startYear; year--) {
    years.push({ name: year.toString() });
  }
  return years;
};

const vehicleYears = generateVehicleYears();

export const BookServiceProvider = ({
  route,
}: AppScreenProps<typeof SCREENS.BOOK_SERVICE_PROVIDER>) => {
  const service = route?.params?.service;
  const isTowToShop = service?.type !== 'inhouse';

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const addressList = useAppSelector(state => state.address.addressList);
  const { currentAddress, loadCurrentLocation } = useCurrentLocation();

  const getTowToShopAddress = () => {
    const defaultAddr = addressList.find(a => a.is_default == 1) ?? addressList[0];
    const addrStr = getAddressString(defaultAddr) ?? currentAddress?.fullAddress ?? null;
    if (defaultAddr && addrStr)
      return {
        address: addrStr,
        lat: parseFloat(defaultAddr.latitude),
        lng: parseFloat(defaultAddr.longitude),
      };
    if (currentAddress?.fullAddress)
      return {
        address: currentAddress.fullAddress,
        lat: currentAddress.latitude,
        lng: currentAddress.longitude,
      };
    return null;
  };

  const handleSubmit = async (values: any) => {
    logger.log('handleSubmit', values);
    if (ENV_CONSTANTS.IS_ALPHA_PHASE) {
      replace(SCREENS.BOTTOM_STACK);
      return;
    }
    const towAddr = isTowToShop ? getTowToShopAddress() : null;
    if (isTowToShop && !towAddr) {
      showToast({
        message: 'Please add an address from Location or enable location access',
        isError: true,
      });
      return;
    }
    const payload: Record<string, any> = {
      service_id: service?.id,
      service_type_id: values?.damage_type?.id,
      vehicle_make: values?.vehicle_model,
      vehicle_year: values?.vehicle_year,
      additional_notes: values?.additional_notes,
    };

    // Pickup
    if (towAddr?.address) payload.pickup_address = towAddr.address;
    if (towAddr?.lat !== undefined) payload.pickup_latitude = towAddr.lat;
    if (towAddr?.lng !== undefined) payload.pickup_longitude = towAddr.lng;

    // Drop Off (only if tow to shop)
    if (isTowToShop) {
      if (towAddr?.address) payload.drop_off_address = towAddr.address;
      if (towAddr?.lat !== undefined) payload.drop_off_latitude = towAddr.lat;
      if (towAddr?.lng !== undefined) payload.drop_off_longitude = towAddr.lng;
    }

    // Date (only for inhouse)
    if (service?.type === 'inhouse') {
      payload.date = values?.pickup_date;
    }
    values?.images?.forEach((image: SelectedMedia, index: number) => {
      payload[`media[${index}]`] = image;
    });
    if (values?.images?.length > 0) setUploadProgress(0);
    try {
      const response = await bookServiceProvider({
        data: payload,
        onUploadProgress: p => setUploadProgress(p),
      });
      if (response) {
        replace(SCREENS.JOB_DETAIL, { jobId: response?.id });
      }
    } finally {
      setUploadProgress(null);
    }
  };

  const formik = useFormikForm({
    initialValues: {
      images: [],
      vehicle_model: '',
      vehicle_year: '',
      damage_type: null as DropdownItemProps | null,
      pickup_date: '',
      dropoff_location: '',
      dropoff_latitude: null,
      dropoff_longitude: null,
      additional_notes: '',
    },
    validationSchema: bookServiceProviderValidationSchema({ type: service?.type }),
    onSubmit: handleSubmit,
  });

  // 🎯 Super simple! Just pass formik - it automatically detects and uses submitForm()
  const { loading, onPress } = useAsyncButton(formik);

  const handleDateSelect = (day: { dateString: string }) => {
    const selectedDate = day.dateString;
    formik.setFieldValue('pickup_date', selectedDate);
    setShowDatePicker(false);
  };

  /** Only load current location when no address - for fallback display. No address API call - Redux updates when default changes in Location */
  useFocusEffect(
    useCallback(() => {
      if (!isTowToShop) return;
      if (addressList.length === 0) loadCurrentLocation();
    }, [isTowToShop, addressList.length, loadCurrentLocation]),
  );

  return (
    <Wrapper useScrollView={true} headerTitle={service?.name ?? ''}>
      <View style={[STYLES.CONTAINER, styles.container]}>
        <FocusProvider>
          {/* Multiple Image Upload Component */}
          <View>
            <MultipleImageUpload
              selectedImages={formik.values.images}
              onImagesChange={images => {
                formik.setFieldValue('images', images);
                formik.setFieldTouched('images', true);
              }}
              maxImages={5}
              mainUploadLabel='Upload Vehicle Pictures'
            />
            {formik.touched.images && formik.submitCount > 0 && formik.errors.images && (
              <Typography style={styles.errorText}>
                {safeString(typeof formik.errors.images === 'string' ? formik.errors.images : '')}
              </Typography>
            )}
          </View>

          {/* Vehicle Make & Model */}
          <Input
            name={'vehicle_model'}
            title={'Vehicle Make & Model*'}
            onChangeText={formik.handleChange('vehicle_model')}
            onBlur={formik.handleBlur('vehicle_model')}
            value={formik.values.vehicle_model}
            maxLength={30}
            placeholder={'Enter Vehicle Make & Model*'}
            error={formik.errors.vehicle_model}
            touched={Boolean(formik.touched.vehicle_model && formik.submitCount)}
          />

          {/* Vehicle Year */}
          <Dropdown
            title='Vehicle Year*'
            options={vehicleYears}
            selectedValue={formik.values.vehicle_year}
            onSelect={value => {
              formik.setFieldValue('vehicle_year', value);
              formik.setFieldTouched('vehicle_year', true);
            }}
            containerStyle={styles.dropdown}
            error={formik.errors.vehicle_year}
            touched={Boolean(formik.touched.vehicle_year && formik.submitCount)}
          />

          {/* Damage Type */}
          <Dropdown
            title='Damage Type*'
            options={service?.types ?? []}
            textStyle={{
              textTransform: 'capitalize',
            }}
            selectedValue={formik.values.damage_type?.name ?? ''}
            onSelect={(_, item) => {
              formik.setFieldValue('damage_type', item);
              formik.setFieldTouched('damage_type', true);
            }}
            containerStyle={styles.dropdown}
            error={formik.errors.damage_type}
            touched={Boolean(formik.touched.damage_type && formik.submitCount)}
          />

          {/* Address for tow-to-shop: just display, send from addressList/currentAddress in API */}
          {isTowToShop && (
            <Input
              name='dropoff_location'
              title='Address*'
              value={getTowToShopAddress()?.address ?? ''}
              onChangeText={() => {}}
              placeholder='Default address or current location'
              editable={false}
              endIcon={{
                componentName: VARIABLES.MaterialIcons,
                iconName: 'add-location',
                color: COLORS.PRIMARY,
                size: FontSize.MediumLarge,
              }}
              onPress={() => navigate(SCREENS.LOCATION)}
              error={formik.errors.dropoff_location}
              touched={Boolean(formik.submitCount > 0 && formik.errors.dropoff_location)}
            />
          )}
          {service?.type == 'inhouse' && (
            <>
              {/* Drop-off Location for inhouse */}
              {/* <Autocomplete
                title='Drop-off Location*'
                placeholder='Enter drop-off location'
                setReverseGeocodedAddress={address => {
                  if (address?.fullAddress) {
                    formik.setFieldValue('dropoff_location', address.fullAddress);
                    formik.setFieldValue('dropoff_latitude', address.latitude);
                    formik.setFieldValue('dropoff_longitude', address.longitude);
                    formik.setFieldTouched('dropoff_location', true);
                  }
                }}
                error={formik.errors.dropoff_location}
                touched={Boolean(formik.touched.dropoff_location && formik.submitCount)}
              /> */}

              {/* Pick-up Date */}
              <Input
                name='pickup_date'
                title='Preferred Pick-up Date*'
                value={formatDateMonthDayYear(formik.values.pickup_date)}
                onChangeText={() => {}} // Read-only, handled by date picker
                placeholder='Select pick-up date'
                editable={false}
                endIcon={{
                  componentName: VARIABLES.MaterialIcons,
                  iconName: 'calendar-today',
                  color: COLORS.BORDER,
                  size: FontSize.MediumLarge,
                  iconStyle: {
                    marginRight: 3,
                    // marginVertical: 10,
                  },
                }}
                onPress={() => {
                  setShowDatePicker(true);
                }}
                error={formik.errors.pickup_date}
                touched={Boolean(formik.touched.pickup_date && formik.submitCount)}
              />
            </>
          )}
          {/* Pick-Up Location
          <Autocomplete
            title='Pick-Up Location*'
            placeholder='Enter pick-up location'
            setReverseGeocodedAddress={(address) => {
              if (address?.fullAddress) {
                formik.setFieldValue('pickup_location', address.fullAddress);
                formik.setFieldTouched('pickup_location', true);
              }
            }}
            error={formik.errors.pickup_location}
            touched={Boolean(formik.touched.pickup_location && formik.submitCount)}
          /> */}

          {/* Additional Notes */}
          <Input
            name='additional_notes'
            title='Additional Notes*'
            onChangeText={formik.handleChange('additional_notes')}
            onBlur={formik.handleBlur('additional_notes')}
            value={formik.values.additional_notes}
            placeholder='Enter additional notes'
            maxLines={15}
            style={{ height: screenHeight(15), paddingVertical: 12 }}
            textAlignVertical='top'
            error={formik.errors.additional_notes}
            touched={Boolean(formik.touched.additional_notes && formik.submitCount)}
          />

          {/* Book a Provider Button */}
          <Button
            title='Book a Provider'
            loading={loading}
            loadingText={uploadProgress != null ? `Uploading ${uploadProgress}%` : undefined}
            onPress={onPress}
            style={styles.submitButton}
          />
        </FocusProvider>
      </View>

      {/* Date Picker Modal */}
      <ModalComponent
        position='center'
        modalVisible={showDatePicker}
        setModalVisible={setShowDatePicker}
        modalSecondaryContainerStyle={styles.datePickerModal}
      >
        <View style={styles.datePickerHeader}>
          <Typography style={styles.datePickerTitle}>Select Pick-up Date</Typography>
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
          markedDates={{
            [formik.values.pickup_date]: {
              selected: true,
              selectedColor: COLORS.PRIMARY,
            },
          }}
          minDate={new Date().toISOString().split('T')[0]} // Prevent selecting past dates
          theme={{
            backgroundColor: COLORS.BACKGROUND,
            calendarBackground: COLORS.BACKGROUND,
            textSectionTitleColor: COLORS.TEXT,
            selectedDayBackgroundColor: COLORS.PRIMARY,
            selectedDayTextColor: COLORS.WHITE,
            todayTextColor: COLORS.PRIMARY,
            dayTextColor: COLORS.TEXT,
            textDisabledColor: COLORS.HEADER,
            dotColor: COLORS.PRIMARY,
            selectedDotColor: COLORS.WHITE,
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
        <Button
          title='Done'
          onPress={() => setShowDatePicker(false)}
          style={styles.datePickerButton}
        />
      </ModalComponent>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 25,
  },
  dropdown: {},
  submitButton: {
    marginTop: 30,
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
    // backgroundColor: COLORS.SURFACE,
  },
  datePickerButton: {
    marginTop: 10,
  },
  errorText: {
    color: COLORS.RED,
    fontSize: FontSize.Small,
    marginTop: -15,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});
