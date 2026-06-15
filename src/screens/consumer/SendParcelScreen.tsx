import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import {
  Autocomplete,
  Button,
  GradientIcon,
  Icon,
  Input,
  Typography,
  Wrapper,
} from 'components/index';
import { FocusProvider } from 'hooks/useFocus';
import { useFormikForm } from 'hooks/useFormik';
import { VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import { resetToHomeAndScreen } from 'navigation/index';
import type { RootStackParamList } from 'navigation/Navigators';
import { SCREENS } from 'constants/routes';
import {
  COLORS,
  screenHeight,
  formatMoneyOrDash,
  extractEstimateDistanceKm,
  formatDistanceKm,
  haversineDistanceKm,
} from 'utils/index';
import {
  buildParcelBookingPayload,
  createParcelBooking,
  estimateBooking,
  extractBookingFromResponse,
  resolveParcelEstimateBaseFare,
  type EstimateBookingResult,
} from 'api/functions/snlift/bookings';
import { logger } from 'utils/logger';
import { getJobDisplayTimerSeconds } from 'api/functions/snlift/settings';
import { showToast } from 'utils/toast';
import type { AddressDetails } from 'utils/location';
import { sendParcelValidationSchema } from 'utils/validations';

 
export type ParcelFormValues = {
  pickup: AddressDetails | null;
  dropoff: AddressDetails | null;
  senderName: string;
  senderPhone: string;
  receiverName: string;
  receiverPhone: string;
  pkg: string;
};

const initialValues: ParcelFormValues = {
  pickup: null,
  dropoff: null,
  senderName: '',
  senderPhone: '',
  receiverName: '',
  receiverPhone: '',
  pkg: '',
};

const emptyAddressFields = {
  postalCode: '',
  street: '',
  city: '',
  state: '',
  country: '',
};

const addressFromRoute = (
  lat: number,
  lng: number,
  fullAddress: string,
): AddressDetails => ({
  latitude: lat,
  longitude: lng,
  fullAddress,
  ...emptyAddressFields,
});

const buildInitialValues = (
  params?: RootStackParamList[typeof SCREENS.SEND_PARCEL],
): ParcelFormValues => {
  const pickup =
    params?.pickupLat != null && params?.pickupLng != null
      ? addressFromRoute(
          params.pickupLat,
          params.pickupLng,
          params.pickupAddress?.trim() || 'Pickup',
        )
      : null;
  const dropoff =
    params?.dropoffLat != null && params?.dropoffLng != null
      ? addressFromRoute(
          params.dropoffLat,
          params.dropoffLng,
          params.dropoffAddress?.trim() || 'Drop-off',
        )
      : null;

  return {
    ...initialValues,
    pickup,
    dropoff,
    senderName: params?.senderName ?? '',
    senderPhone: params?.senderPhone ?? '',
    receiverName: params?.receiverName ?? '',
    receiverPhone: params?.receiverPhone ?? '',
    pkg: params?.pkg ?? '',
  };
};

export const SendParcelScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, typeof SCREENS.SEND_PARCEL>>();
  const formInitialValues = useMemo(() => buildInitialValues(route.params), [route.params]);
  const [baseFare, setBaseFare] = useState<number | null>(null);
  const [parcelEstimate, setParcelEstimate] = useState<EstimateBookingResult | null>(null);
  const [estimateLoading, setEstimateLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [timerDurationSeconds, setTimerDurationSeconds] = useState<number | undefined>();
  const parcelEstimateRef = useRef<EstimateBookingResult | null>(null);

  useEffect(() => {
    parcelEstimateRef.current = parcelEstimate;
  }, [parcelEstimate]);

  useEffect(() => {
    getJobDisplayTimerSeconds().then(seconds => {
      if (seconds > 0) setTimerDurationSeconds(seconds);
    });
  }, []);

  const formik = useFormikForm<ParcelFormValues>({
    initialValues: formInitialValues,
    enableReinitialize: true,
    validationSchema: sendParcelValidationSchema,
    onSubmit: async values => {
      if (submitting) return;
      setSubmitting(true);
      try {
        const fallbackDistanceKm = haversineDistanceKm(
          values.pickup!.latitude,
          values.pickup!.longitude,
          values.dropoff!.latitude,
          values.dropoff!.longitude,
        );
        const estimate = parcelEstimateRef.current;
        const res = await createParcelBooking(
          buildParcelBookingPayload({
            pickupAddress: values.pickup!.fullAddress ?? 'Pickup',
            dropoffAddress: values.dropoff!.fullAddress ?? 'Drop-off',
            pickupLatitude: values.pickup!.latitude,
            pickupLongitude: values.pickup!.longitude,
            dropoffLatitude: values.dropoff!.latitude,
            dropoffLongitude: values.dropoff!.longitude,
            distanceKm: fallbackDistanceKm,
            itemDescription: values.pkg,
            senderName: values.senderName,
            senderPhone: values.senderPhone,
            receiverName: values.receiverName,
            receiverPhone: values.receiverPhone,
            estimate,
          }),
          { showLoader: false },
        );
        const booking = extractBookingFromResponse(res);
        if (!booking?.id) {
          showToast({ message: 'Could not create parcel booking. Try again.' });
          return;
        }
        const durationSeconds =
          timerDurationSeconds ?? (await getJobDisplayTimerSeconds());
        resetToHomeAndScreen(SCREENS.SEND_PARCEL_FINDING, {
          pickupAddress: values.pickup!.fullAddress ?? 'Pickup',
          dropoffAddress: values.dropoff!.fullAddress ?? 'Drop-off',
          pickupLat: values.pickup!.latitude,
          pickupLng: values.pickup!.longitude,
          dropoffLat: values.dropoff!.latitude,
          dropoffLng: values.dropoff!.longitude,
          bookingId: booking.id,
          timerDurationSeconds: durationSeconds,
          startTimerOnMount: true,
          senderName: values.senderName,
          senderPhone: values.senderPhone,
          receiverName: values.receiverName,
          receiverPhone: values.receiverPhone,
          pkg: values.pkg,
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  const showFieldError = (field: keyof ParcelFormValues) =>
    Boolean(formik.touched[field] && formik.submitCount > 0 && formik.errors[field]);

  const pickup = formik.values.pickup;
  const dropoff = formik.values.dropoff;

  const displayDistanceKm = useMemo(() => {
    const fromApi = extractEstimateDistanceKm(parcelEstimate);
    if (fromApi != null) return fromApi;
    if (
      pickup?.latitude != null &&
      pickup?.longitude != null &&
      dropoff?.latitude != null &&
      dropoff?.longitude != null
    ) {
      return haversineDistanceKm(
        pickup.latitude,
        pickup.longitude,
        dropoff.latitude,
        dropoff.longitude,
      );
    }
    return null;
  }, [parcelEstimate, pickup, dropoff]);

  useEffect(() => {
    if (
      pickup?.latitude == null ||
      pickup?.longitude == null ||
      dropoff?.latitude == null ||
      dropoff?.longitude == null
    ) {
      setBaseFare(null);
      setParcelEstimate(null);
      return;
    }

    let cancelled = false;
    const fetchParcelEstimate = async () => {
      setEstimateLoading(true);
      try {
        const result = await estimateBooking({
          booking_type: 'parcel',
          pickup_latitude: pickup.latitude,
          pickup_longitude: pickup.longitude,
          dropoff_latitude: dropoff.latitude,
          dropoff_longitude: dropoff.longitude,
        });
        if (!cancelled) {
          setParcelEstimate(result ?? null);
          setBaseFare(resolveParcelEstimateBaseFare(result));
        }
      } catch (error) {
        logger.error('parcel estimateBooking failed', error);
        if (!cancelled) {
          setBaseFare(null);
          setParcelEstimate(null);
        }
      } finally {
        if (!cancelled) setEstimateLoading(false);
      }
    };

    fetchParcelEstimate();
    return () => {
      cancelled = true;
    };
  }, [
    pickup?.latitude,
    pickup?.longitude,
    dropoff?.latitude,
    dropoff?.longitude,
  ]);

  return (
    <Wrapper
      headerTitle='Send Parcel'
      showBackButton
       
      useScrollView
      backgroundColor={COLORS.WHITE}
      darkMode={false}
    >
      <View style={styles.content}>
        <FocusProvider>
          <Typography style={styles.sectionTitle}>Pickup & Drop-Off</Typography>
          <View style={styles.locationCard}>
            <View style={styles.connectLine} />

            <View style={[styles.locationRow, styles.pickupRow]}>
              <View style={styles.pickupDot} />
              <View style={styles.inputWrap}>
                <Autocomplete
                  placeholder='Pickup Location'
                  value={formik.values.pickup?.fullAddress ?? ''}
                  setReverseGeocodedAddress={addr => {
                    formik.setFieldValue('pickup', addr);
                    formik.setFieldTouched('pickup', true, false);
                  }}
                  showCurrentLocationButton
                  touched={showFieldError('pickup')}
                  error={
                    typeof formik.errors.pickup === 'string' ? formik.errors.pickup : undefined
                  }
                />
              </View>
            </View>

            <View style={styles.locationRow}>
              <Icon
                componentName={VARIABLES.MaterialCommunityIcons}
                iconName='map-marker'
                size={22}
                color={COLORS.APP_SECONDARY}
                iconStyle={styles.mapMarkerIcon}
              />
              <View style={styles.inputWrap}>
                <Autocomplete
                  placeholder='Drop-Off Location'
                  value={formik.values.dropoff?.fullAddress ?? ''}
                  setReverseGeocodedAddress={addr => {
                    formik.setFieldValue('dropoff', addr);
                    formik.setFieldTouched('dropoff', true, false);
                  }}
                  showCurrentLocationButton={false}
                  touched={showFieldError('dropoff')}
                  error={
                    typeof formik.errors.dropoff === 'string' ? formik.errors.dropoff : undefined
                  }
                />
              </View>
            </View>
          </View>

          <Typography style={styles.sectionTitle}>Pricing</Typography>
          <View style={styles.priceBox}>
            <View style={styles.priceRow}>
              <GradientIcon
                componentName={VARIABLES.MaterialCommunityIcons}
                iconName='package-variant'
                size={20}
                color={COLORS.WHITE}
                containerSize={40}
                borderRadius={10}
              />
              <View style={styles.priceInfo}>
                <Typography style={styles.priceLabel}>Base Fare</Typography>
                <Typography style={styles.priceSub}>
                  {displayDistanceKm != null
                    ? formatDistanceKm(displayDistanceKm)
                    : 'Standard delivery'}
                </Typography>
              </View>
              {estimateLoading ? (
                <ActivityIndicator size='small' color={COLORS.APP_SECONDARY} />
              ) : (
                <Typography style={styles.priceAmount}>{formatMoneyOrDash(baseFare)}</Typography>
              )}
            </View>
          </View>

          <Typography style={styles.sectionTitle}>Sender Details</Typography>
          <Input
            name='senderName'
            placeholder='Sender Name'
            value={formik.values.senderName}
            onChangeText={formik.handleChange('senderName')}
            onBlur={formik.handleBlur('senderName')}
            error={formik.errors.senderName}
            touched={Boolean(formik.touched.senderName && formik.submitCount > 0)}
            startIcon={{
              componentName: VARIABLES.Feather,
              iconName: 'user',
              size: FontSize.Medium,
              color: COLORS.APP_TEXT_MUTED,
            }}
          />
          <Input
            name='senderPhone'
            placeholder='Sender Phone'
            value={formik.values.senderPhone}
            onChangeText={formik.handleChange('senderPhone')}
            onBlur={formik.handleBlur('senderPhone')}
            error={formik.errors.senderPhone}
            touched={Boolean(formik.touched.senderPhone && formik.submitCount > 0)}
            keyboardType='phone-pad'
            startIcon={{
              componentName: VARIABLES.Feather,
              iconName: 'phone',
              size: FontSize.Medium,
              color: COLORS.APP_TEXT_MUTED,
            }}
          />

          <Typography style={styles.sectionTitle}>Receiver Details</Typography>
          <Input
            name='receiverName'
            placeholder='Receiver Name'
            value={formik.values.receiverName}
            onChangeText={formik.handleChange('receiverName')}
            onBlur={formik.handleBlur('receiverName')}
            error={formik.errors.receiverName}
            touched={Boolean(formik.touched.receiverName && formik.submitCount > 0)}
            startIcon={{
              componentName: VARIABLES.Feather,
              iconName: 'user',
              size: FontSize.Medium,
              color: COLORS.APP_TEXT_MUTED,
            }}
          />
          <Input
            name='receiverPhone'
            placeholder='Receiver Phone'
            value={formik.values.receiverPhone}
            onChangeText={formik.handleChange('receiverPhone')}
            onBlur={formik.handleBlur('receiverPhone')}
            error={formik.errors.receiverPhone}
            touched={Boolean(formik.touched.receiverPhone && formik.submitCount > 0)}
            keyboardType='phone-pad'
            startIcon={{
              componentName: VARIABLES.Feather,
              iconName: 'phone',
              size: FontSize.Medium,
              color: COLORS.APP_TEXT_MUTED,
            }}
          />

          <Typography style={styles.sectionTitle}>Package Description</Typography>
          <Input
            name='pkg'
            placeholder='What are you sending?'
            value={formik.values.pkg}
            onChangeText={formik.handleChange('pkg')}
            onBlur={formik.handleBlur('pkg')}
            error={formik.errors.pkg}
            touched={Boolean(formik.touched.pkg && formik.submitCount > 0)}
            multiline
            textAlignVertical='top'
            style={{ height: screenHeight(20) }}
            secondContainerStyle={{ padding: 10, borderRadius: 20 }}
            maxLines={10}
            // startIcon={{
            //   componentName: VARIABLES.Feather,
            //   iconName: 'package',
            //   size: FontSize.Medium,
            //   color: COLORS.APP_TEXT_MUTED,
            // }}
          />

          <Button
            title='Request Courier'
            onPress={() => formik.handleSubmit()}
            style={styles.ctaBtn}
            loading={submitting}
            disabled={submitting}
          />
        </FocusProvider>
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  mapMarkerIcon: {},
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
    overflow: 'visible',
  },
  connectLine: {
    position: 'absolute',
    left: 26,
    top: 46,
    width: 2,
    height: 56,
    backgroundColor: COLORS.APP_LINE,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    overflow: 'visible',
  },
  pickupRow: {
    zIndex: 30,
  },
  pickupDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: COLORS.APP_PRIMARY,
    backgroundColor: COLORS.WHITE,
    marginRight: 5,
    marginLeft: 4,
    marginTop: 14,
  },
  inputWrap: {
    flex: 1,
    overflow: 'visible',
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
