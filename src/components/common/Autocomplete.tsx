import {useRef} from 'react';
import {
  AddressDetails,
  getCurrentLocation,
  reverseGeocode,
} from 'utils/location';
import {RowComponent} from './Row';
import {COLORS} from 'utils/colors';
import {
  GooglePlacesAutocomplete,
  GooglePlacesAutocompleteRef,
} from 'react-native-google-places-autocomplete';
import {COMMON_TEXT} from 'constants/screens';
import {MAP_API_KEY, VARIABLES} from 'constants/common';
import {FontSize} from 'types/fontTypes';
import {Icon} from './Icon';
import {Typography} from './Typography';
import {StyleSheet, TextStyle, ViewStyle} from 'react-native';
import {SetStateType} from 'types/common';
import i18n from 'i18n/index';

interface AutoCompleteProps {
  title?: string;
  titleStyle?: TextStyle;
  containerStyle?: ViewStyle;
  setReverseGeocodedAddress: SetStateType<AddressDetails | null>;
}

// interface LatLng {
//   latitude?: number;
//   longitude?: number;
// }

export const Autocomplete = ({
  title,
  titleStyle,
  containerStyle,
  setReverseGeocodedAddress,
}: AutoCompleteProps) => {
  const inputRef = useRef<GooglePlacesAutocompleteRef>(null);

  // const [reverseGeocodedAddress, setReverseGeocodedAddress] =
  //   useState<LatLng | null>(null);

  // const [userLocation, setUserLocation] = useState<LatLng>({
  //   latitude: INITIAL_LAT_LNG.lat,
  //   longitude: INITIAL_LAT_LNG.lng,
  // });

  const getUserCurrentLocation = async () => {
    try {
      const position = await getCurrentLocation();
      if (position) {
        const {latitude, longitude} = position.coords;
        console.log(position);

        const response = await reverseGeocode({latitude, longitude});
        console.log(response);
        inputRef?.current?.setAddressText(response?.fullAddress);
        setReverseGeocodedAddress(response);
        // setUserLocation({latitude, longitude});
      }
    } catch (error) {
      console.error('Error getting user current location:', error);
    }
  };
  return (
    <>
      {title && (
        <Typography style={[styles.title, titleStyle]}>{title}</Typography>
      )}
      <RowComponent
        style={[
          {
            // height: 42,
            alignItems: 'flex-start',
            borderWidth: 1,
            borderRadius: 10,
            backgroundColor: COLORS.WHITE,
            marginBottom: 10,
            borderColor: COLORS.BORDER,
          },
          containerStyle,
        ]}>
        <GooglePlacesAutocomplete
          ref={inputRef}
          placeholder={i18n.t(COMMON_TEXT.ENTER_YOUR_LOCATION)}
          fetchDetails={true}
          onFail={e => console.log(e)}
          enableHighAccuracyLocation={true}
          isRowScrollable={true}
          onPress={async (_, details) => {
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
            key: MAP_API_KEY,
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
          iconStyle={{
            marginHorizontal: 10,
            marginVertical: 10,
            color: COLORS.MUD_TEXT,
          }}
        />
      </RowComponent>
    </>
  );
};

const styles = StyleSheet.create({
  title: {
    marginBottom: 8,
  },
});
