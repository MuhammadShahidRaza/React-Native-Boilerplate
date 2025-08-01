import { useRef } from 'react';
import { AddressDetails, getCurrentLocation, reverseGeocode } from 'utils/location';
import { RowComponent } from './Row';
import { COLORS } from 'utils/colors';
import {
  GooglePlacesAutocomplete,
  GooglePlacesAutocompleteRef,
} from 'react-native-google-places-autocomplete';
import { COMMON_TEXT } from 'constants/screens';
import { ENV_CONSTANTS, VARIABLES } from 'constants/common';
import { FontSize } from 'types/fontTypes';
import { Icon, IconComponentProps } from './Icon';
import { Typography } from './Typography';
import { StyleSheet, TextStyle, View, ViewStyle } from 'react-native';
import { SetStateType } from 'types/common';
import { useTranslation } from 'hooks/useTranslation';

interface AutoCompleteProps {
  title?: string;
  placeholder?: string;
  titleStyle?: TextStyle;
  containerStyle?: ViewStyle;
  lineAfterIcon?: boolean;
  startIcon?: IconComponentProps;
  setReverseGeocodedAddress: SetStateType<AddressDetails | null>;
}

export const Autocomplete = ({
  title,
  titleStyle,
  containerStyle,
  lineAfterIcon = true,
  placeholder = COMMON_TEXT.ENTER_YOUR_LOCATION,
  startIcon,
  setReverseGeocodedAddress,
}: AutoCompleteProps) => {
  const { t } = useTranslation();
  const inputRef = useRef<GooglePlacesAutocompleteRef>(null);

  const getUserCurrentLocation = async () => {
    try {
      const position = await getCurrentLocation();
      if (position) {
        const { latitude, longitude } = position.coords;
        const response = await reverseGeocode({ latitude, longitude });
        inputRef?.current?.setAddressText(response?.fullAddress);
        setReverseGeocodedAddress(response);
      }
    } catch (error) {
      console.error('Error getting user current location:', error);
    }
  };
  return (
    <>
      {title && <Typography style={[styles.title, titleStyle]}>{title}</Typography>}
      <RowComponent
        style={[
          {
            // height: 42,
            alignItems: 'flex-start',
            borderWidth: 0.5,
            borderRadius: 10,
            paddingHorizontal: 8,
            backgroundColor: COLORS.WHITE,
            marginBottom: 10,
            borderColor: COLORS.BORDER,
          },
          containerStyle,
        ]}
      >
        {startIcon && <Icon {...startIcon} iconStyle={styles.iconStyle} />}
        {lineAfterIcon && <View style={styles.lineStyle} />}
        <GooglePlacesAutocomplete
          ref={inputRef}
          placeholder={t(placeholder)}
          fetchDetails={true}
          onFail={e => console.log(e)}
          enableHighAccuracyLocation={true}
          isRowScrollable={true}
          predefinedPlaces={[]}
          onPress={async (_, details) => {
            console.log(details);
            const lat = details?.geometry?.location?.lat;
            const lng = details?.geometry?.location?.lng;
            if (lat && lng) {
              const response = await reverseGeocode({
                latitude: lat,
                longitude: lng,
              });
              setReverseGeocodedAddress(response);
              // setUserLocation({latitude: lat, longitude: lng});
            }
          }}
          textInputProps={{
            placeholderTextColor: COLORS.BORDER,
            returnKeyType: 'search',
          }}
          query={{
            key: ENV_CONSTANTS.MAP_API_KEY,
            language: 'en',
          }}
          styles={{
            textInput: {
              fontSize: FontSize.Medium,
              top: 2,
              height: 40,
              borderRadius: 10,
              overflow: 'hidden',
              color: COLORS.BLACK,
            },
            description: {
              color: COLORS.BLACK,
            },
            poweredContainer: {
              display: 'none',
            },
          }}
        />
        <Icon
          componentName={VARIABLES.MaterialIcons}
          iconName={'my-location'}
          size={25}
          onPress={() => getUserCurrentLocation()}
          iconStyle={styles.iconStyle}
        />
      </RowComponent>
    </>
  );
};

const styles = StyleSheet.create({
  title: {
    marginBottom: 8,
  },
  lineStyle: {
    backgroundColor: COLORS.BORDER,
    width: 1,
    marginHorizontal: 10,
    height: '100%',
  },
  iconStyle: {
    marginHorizontal: 10,
    marginVertical: 10,
    color: COLORS.PRIMARY,
  },
});
