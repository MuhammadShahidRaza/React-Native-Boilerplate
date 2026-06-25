import { useRef, useEffect, useCallback } from 'react';
import {
  AddressDetails,
  getCurrentLocation,
  placeDetailToAddressDetails,
  reverseGeocode,
} from 'utils/location';
import { RowComponent } from './Row';
import { COLORS, INPUT_THEME } from 'utils/index';
import {
  GooglePlacesAutocomplete,
  GooglePlacesAutocompleteRef,
} from 'react-native-google-places-autocomplete';
import { COMMON_TEXT } from 'constants/screens';
import { ENV_CONSTANTS, VARIABLES } from 'constants/common';
import { isSengoBrand } from 'constants/assets/brandLogo';
import { Icon, IconComponentProps } from './Icon';
import { Typography } from './Typography';
import { StyleSheet, TextStyle, View, ViewStyle } from 'react-native';
import { useTranslation } from 'hooks/useTranslation';
import { logger } from 'utils/logger';

interface AutocompleteProps {
  title?: string;
  placeholder?: string;
  titleStyle?: TextStyle;
  containerStyle?: ViewStyle;
  lineAfterIcon?: boolean;
  startIcon?: IconComponentProps;
  setReverseGeocodedAddress: (address: AddressDetails | null) => void;
  showCurrentLocationButton?: boolean;
  touched?: boolean;
  disabled?: boolean;
  isTitleInLine?: boolean;
  error?: string;
  endIcon?: IconComponentProps;
  value?: string;
  listViewDisplayed?: boolean;
  keyboardShouldPersistTaps?: "never" | "always" | "handled";
  keepResultsAfterBlur?: boolean;
}

export const Autocomplete = ({
  title,
  titleStyle,
  containerStyle,
  lineAfterIcon = false,
  placeholder = COMMON_TEXT.ENTER_YOUR_LOCATION,
  startIcon,
  setReverseGeocodedAddress,
  showCurrentLocationButton = true,
  touched,
  endIcon,
  isTitleInLine = false,
  error,
  disabled,
  value,
  listViewDisplayed,
  keyboardShouldPersistTaps,
  keepResultsAfterBlur = true,
}: AutocompleteProps) => {
  const isErrorShown = touched && error;

  const { t } = useTranslation();
  const inputRef = useRef<GooglePlacesAutocompleteRef>(null);

  // Sync value to input when pre-filled (e.g. from form/booking)
  useEffect(() => {
    if (!value?.trim()) return;
    const setText = () => inputRef.current?.setAddressText?.(value);
    setText();
  }, [value]);

  const getUserCurrentLocation = useCallback(async () => {
    if (disabled) return;
    try {
      const position = await getCurrentLocation();
      if (!position) return;
      const { latitude, longitude } = position.coords;
      const response = await reverseGeocode({ latitude, longitude });
      if (response?.fullAddress) {
        inputRef.current?.setAddressText?.(response.fullAddress);
        setReverseGeocodedAddress(response);
      }
    } catch (err) {
      logger.error('Error getting user current location:', err);
    }
  }, [disabled, setReverseGeocodedAddress]);

  const handlePlaceSelect = useCallback(
    (
      _: unknown,
      details: {
        formatted_address?: string;
        geometry?: { location?: { lat: number; lng: number } };
        address_components?: { long_name: string; types: string[] }[];
      } | null,
    ) => {
      logger.log(details);
      const address = placeDetailToAddressDetails(details);
      if (address?.fullAddress) {
        setReverseGeocodedAddress(address);
      }
    },
    [setReverseGeocodedAddress],
  );

  return (
    <>
      {title && (
        <Typography
          style={[
            {
              marginBottom: INPUT_THEME.title.marginBottom,
              marginLeft: isTitleInLine ? 10 : 0,
            },
            styles.title,
            titleStyle,
          ]}
        >
          {title}
        </Typography>
      )}
      <RowComponent
        style={[
          {
            // height: 42,
            // alignItems: 'flex-start',
            borderRadius: 10,
            paddingHorizontal: isTitleInLine ? 0 : 8,
            backgroundColor: COLORS.BACKGROUND,
            marginBottom: 10,
            borderColor: isErrorShown ? COLORS.RED : COLORS.BORDER,
            borderWidth: 1,
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
          onFail={e => logger.log(e)}
          // enableHighAccuracyLocation={true}
          debounce={1000}
          isRowScrollable={true}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          keepResultsAfterBlur={keepResultsAfterBlur}
          listViewDisplayed={listViewDisplayed}
          onPress={handlePlaceSelect}
          textInputProps={{
            placeholderTextColor: disabled ? COLORS.TEXT_SECONDARY : COLORS.PLACEHOLDER,
            returnKeyType: 'search',
            allowFontScaling: false,
            editable: !disabled,
          }}
          query={{
            key: ENV_CONSTANTS.MAP_API_KEY,
            language: 'en',
            // Ivory Coast only — SN Lift operates exclusively there; Sengo is unrestricted.
            ...(isSengoBrand() ? {} : { components: 'country:ci' }),
          }}
          styles={{
            textInput: {
              fontSize: INPUT_THEME.value.fontSize,
              top: 2,
              height: isTitleInLine
                ? INPUT_THEME.autocomplete.height - 20
                : INPUT_THEME.autocomplete.height,
              borderRadius: INPUT_THEME.input.borderRadius,
              overflow: 'hidden',
              backgroundColor: COLORS.TRANSPARENT,
              color: COLORS.TEXT,
            },
            row: {
              backgroundColor: COLORS.BACKGROUND,
            },
            separator: {
              backgroundColor: COLORS.BORDER,
            },
            description: {
              color: COLORS.TEXT,
            },
            predefinedPlacesDescription: {
              color: COLORS.TEXT_SECONDARY,
            },
            poweredContainer: {
              display: 'none',
            },
          }}
        />
        {showCurrentLocationButton && (
          <Icon
            componentName={VARIABLES.MaterialIcons}
            iconName={'my-location'}
            size={25}
            onPress={getUserCurrentLocation}
            iconStyle={[styles.iconStyle, styles.trailingIconStyle]}
          />
        )}
        {endIcon && <Icon {...endIcon} iconStyle={[styles.endIconStyle, styles.trailingIconStyle]} />}
      </RowComponent>
      {isErrorShown && <Typography style={styles.error}>{error}</Typography>}
    </>
  );
};

const styles = StyleSheet.create({
  title: {
    color: COLORS.ICONS,
    fontSize: INPUT_THEME.title.fontSize,
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
  // Pins icons that sit after the autocomplete input to the top of the row,
  // so they don't drift down as the suggestions list grows the row's height.
  trailingIconStyle: {
    alignSelf: 'flex-start',
  },
  endIconStyle: {
    marginHorizontal: 10,
    marginVertical: 10,
  },
  error: {
    paddingHorizontal: 10,
    textAlign: 'right',
    color: COLORS.ERROR,
    fontSize: INPUT_THEME.error.fontSize,
  },
});
