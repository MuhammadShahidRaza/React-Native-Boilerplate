import { useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Formik, type FormikProps } from 'formik';
import * as Yup from 'yup';
import { Marker } from 'react-native-maps';
import type MapView from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { Autocomplete, Button, GradientIcon, Icon, Input, Typography, Wrapper, Map } from 'components/index';
import { ENV_CONSTANTS, VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import { navigate } from 'navigation/index';
import { SCREENS } from 'constants/routes';
import { COLORS, screenHeight, fitMapToDirectionCoordinates } from 'utils/index';
import type { AddressDetails } from 'utils/location';

const BACK_ICON_STYLE = { backgroundColor: COLORS.APP_PRIMARY, borderRadius: 12 };

type ParcelFormValues = {
  pickup: AddressDetails | null;
  dropoff: AddressDetails | null;
  senderName: string;
  senderPhone: string;
  receiverName: string;
  receiverPhone: string;
  pkg: string;
};

const addressRequired = Yup.object({
  latitude: Yup.number().required(),
  longitude: Yup.number().required(),
})
  .nullable()
  .required('Pick a location on the map or from search');

const validationSchema = Yup.object({
  pickup: addressRequired,
  dropoff: addressRequired,
  senderName: Yup.string().trim().min(1, 'Required').required('Required'),
  senderPhone: Yup.string()
    .trim()
    .min(6, 'Enter phone')
    .matches(/^[0-9+\s-]+$/, 'Invalid phone')
    .required('Required'),
  receiverName: Yup.string().trim().min(1, 'Required').required('Required'),
  receiverPhone: Yup.string()
    .trim()
    .min(6, 'Enter phone')
    .matches(/^[0-9+\s-]+$/, 'Invalid phone')
    .required('Required'),
  pkg: Yup.string().trim().min(1, 'Describe package').required('Required'),
});

const initialValues: ParcelFormValues = {
  pickup: null,
  dropoff: null,
  senderName: '',
  senderPhone: '',
  receiverName: '',
  receiverPhone: '',
  pkg: '',
};

export const SendParcelScreen = () => {
  return (
    <Wrapper
      headerTitle='Send Parcel'
      showBackButton
      backIconStyle={BACK_ICON_STYLE}
      useScrollView
      backgroundColor={COLORS.WHITE}
      darkMode={false}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        validateOnMount
        validateOnChange
        validateOnBlur
        onSubmit={values => {
          navigate(SCREENS.SEND_PARCEL_FINDING, {
            pickupLat: values.pickup!.latitude,
            pickupLng: values.pickup!.longitude,
            dropoffLat: values.dropoff!.latitude,
            dropoffLng: values.dropoff!.longitude,
          });
        }}
      >
        {formik => <ParcelFormInner {...formik} />}
      </Formik>
    </Wrapper>
  );
};

type InnerProps = Pick<
  FormikProps<ParcelFormValues>,
  | 'values'
  | 'errors'
  | 'touched'
  | 'handleChange'
  | 'handleSubmit'
  | 'isValid'
  | 'setFieldValue'
  | 'setFieldTouched'
>;

function ParcelFormInner({
  values,
  setFieldValue,
  handleChange,
  setFieldTouched,
  errors,
  touched,
  handleSubmit,
  isValid,
}: InnerProps) {
  const mapRef = useRef<MapView>(null);

  const routeFitRegion = useMemo(() => {
    const { pickup, dropoff } = values;
    if (!pickup || !dropoff) return undefined;
    return {
      latitude: (pickup.latitude + dropoff.latitude) / 2,
      longitude: (pickup.longitude + dropoff.longitude) / 2,
      latitudeDelta: Math.abs(pickup.latitude - dropoff.latitude) * 2 + 0.02,
      longitudeDelta: Math.abs(pickup.longitude - dropoff.longitude) * 2 + 0.02,
    };
  }, [values.pickup, values.dropoff]);

  const showDirections = !!(values.pickup?.latitude && values.dropoff?.latitude);

  return (
    <>
      <View style={styles.mapContainer}>
        <Map
          key={
            showDirections && values.pickup && values.dropoff
              ? `parcel-${values.pickup.latitude}-${values.pickup.longitude}-${values.dropoff.latitude}-${values.dropoff.longitude}`
              : 'parcel-map'
          }
          mapRef={mapRef}
          {...(routeFitRegion ? { region: routeFitRegion } : {})}
          regionTracking={showDirections ? 'initialOnly' : 'live'}
          showsUserLocationDot={!showDirections}
          showCurrentLocation={!showDirections}
          scrollEnabled={showDirections}
          showCurrentLocationButton={false}
          mapStyle='light'
          minZoomLevel={0}
        >
          {showDirections && values.pickup && values.dropoff ? (
            <>
              <MapViewDirections
                origin={{
                  latitude: values.pickup.latitude,
                  longitude: values.pickup.longitude,
                }}
                destination={{
                  latitude: values.dropoff.latitude,
                  longitude: values.dropoff.longitude,
                }}
                apikey={ENV_CONSTANTS.MAP_API_KEY}
                strokeColor={COLORS.APP_PRIMARY}
                strokeWidth={4}
                onReady={result => fitMapToDirectionCoordinates(mapRef, result.coordinates)}
              />
              <Marker
                coordinate={{ latitude: values.pickup.latitude, longitude: values.pickup.longitude }}
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <View style={styles.pickupMapDot} />
              </Marker>
              <Marker
                coordinate={{ latitude: values.dropoff.latitude, longitude: values.dropoff.longitude }}
                anchor={{ x: 0.5, y: 1 }}
              >
                <Icon
                  componentName={VARIABLES.MaterialCommunityIcons}
                  iconName='map-marker'
                  size={30}
                  color={COLORS.APP_SECONDARY}
                />
              </Marker>
            </>
          ) : null}
        </Map>
      </View>

      <View style={styles.content}>
        <Typography style={styles.sectionTitle}>Pickup & Drop-Off</Typography>
        <View style={styles.locationCard}>
          <View style={styles.connectLine} />

          <View style={styles.locationRow}>
            <View style={styles.pickupDot} />
            <View style={styles.inputWrap}>
              <Autocomplete
                placeholder='Pickup Location'
                value={values.pickup?.fullAddress ?? ''}
                setReverseGeocodedAddress={addr => {
                  setFieldValue('pickup', addr);
                  setFieldTouched('pickup', true);
                }}
                showCurrentLocationButton
                containerStyle={styles.autocompleteContainer}
                keepResultsAfterBlur
                keyboardShouldPersistTaps='handled'
              />
              {touched.pickup && errors.pickup ? (
                <Typography translate={false} style={styles.fieldError}>
                  {typeof errors.pickup === 'string' ? errors.pickup : 'Pick a location'}
                </Typography>
              ) : null}
            </View>
          </View>

          <View style={styles.locationRow}>
            <Icon
              componentName={VARIABLES.MaterialCommunityIcons}
              iconName='map-marker'
              size={22}
              color={COLORS.APP_SECONDARY}
            />
            <View style={styles.inputWrap}>
              <Autocomplete
                placeholder='Drop-Off Location'
                value={values.dropoff?.fullAddress ?? ''}
                setReverseGeocodedAddress={addr => {
                  setFieldValue('dropoff', addr);
                  setFieldTouched('dropoff', true);
                }}
                showCurrentLocationButton={false}
                containerStyle={styles.autocompleteContainer}
                keepResultsAfterBlur
                keyboardShouldPersistTaps='handled'
              />
              {touched.dropoff && errors.dropoff ? (
                <Typography translate={false} style={styles.fieldError}>
                  {typeof errors.dropoff === 'string' ? errors.dropoff : 'Pick a location'}
                </Typography>
              ) : null}
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
              <Typography style={styles.priceSub}>Standard delivery</Typography>
            </View>
            <Typography style={styles.priceAmount}>CFA 550</Typography>
          </View>
        </View>

        <Typography style={styles.sectionTitle}>Sender Details</Typography>
        <Input
          name='senderName'
          placeholder='Sender Name'
          value={values.senderName}
          onChangeText={handleChange('senderName')}
          onBlur={() => setFieldTouched('senderName', true)}
          error={errors.senderName}
          touched={touched.senderName}
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
          value={values.senderPhone}
          onChangeText={handleChange('senderPhone')}
          onBlur={() => setFieldTouched('senderPhone', true)}
          error={errors.senderPhone}
          touched={touched.senderPhone}
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
          value={values.receiverName}
          onChangeText={handleChange('receiverName')}
          onBlur={() => setFieldTouched('receiverName', true)}
          error={errors.receiverName}
          touched={touched.receiverName}
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
          value={values.receiverPhone}
          onChangeText={handleChange('receiverPhone')}
          onBlur={() => setFieldTouched('receiverPhone', true)}
          error={errors.receiverPhone}
          touched={touched.receiverPhone}
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
          value={values.pkg}
          onChangeText={handleChange('pkg')}
          onBlur={() => setFieldTouched('pkg', true)}
          error={errors.pkg}
          touched={touched.pkg}
          multiline
          maxLines={4}
          startIcon={{
            componentName: VARIABLES.Feather,
            iconName: 'package',
            size: FontSize.Medium,
            color: COLORS.APP_TEXT_MUTED,
          }}
        />

        <Button
          title='Request Courier'
          onPress={() => handleSubmit()}
          style={styles.ctaBtn}
          disabled={!isValid}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    height: screenHeight(38),
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    overflow: 'hidden',
    marginBottom: 4,
  },
  pickupMapDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.APP_PRIMARY,
    borderWidth: 2,
    borderColor: COLORS.WHITE,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
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
  },
  connectLine: {
    position: 'absolute',
    left: 27,
    top: 46,
    width: 2,
    height: 48,
    backgroundColor: COLORS.APP_LINE,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  pickupDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: COLORS.APP_PRIMARY,
    backgroundColor: COLORS.WHITE,
    marginRight: 10,
  },
  inputWrap: { flex: 1 },
  fieldError: {
    fontSize: FontSize.Small,
    color: COLORS.APP_DANGER_TEXT,
    marginTop: 4,
    marginBottom: 4,
  },
  autocompleteContainer: {
    borderWidth: 0,
    backgroundColor: COLORS.APP_SURFACE,
    borderRadius: 10,
    marginBottom: 0,
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
