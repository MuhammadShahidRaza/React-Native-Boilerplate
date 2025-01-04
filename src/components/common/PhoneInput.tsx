import {useRef, useState} from 'react';
import {StyleProp} from 'react-native';
import {
  StyleSheet,
  TextInputProps,
  View,
  NativeSyntheticEvent,
  TextInputSubmitEditingEventData,
  TextStyle,
} from 'react-native';
import {CENTER, COLORS, isIOS, REGEX} from 'utils/index';
import {Typography} from './Typography';
import {FontSize, StyleType} from 'types/index';
import {useFocus} from 'hooks/useFocus';
import {Icon, IconComponentProps} from './Icon';
import {RowComponent} from './Row';
import i18n from 'i18n/index';
import PhoneInput, {PhoneInputProps} from 'react-native-phone-number-input';
import {VALIDATION_MESSAGES} from 'constants/validationMessages';

interface PhoneInputProp extends PhoneInputProps {
  label?: string;
  title?: string;
  value: string;
  placeholder: string;
  onChangeText: (text: string) => void;
  style?: StyleProp<TextStyle>;
  returnKeyType?: TextInputProps['returnKeyType'];
  onSubmitEditing?: (
    e: NativeSyntheticEvent<TextInputSubmitEditingEventData>,
  ) => void;
  autoFocus?: boolean;
  darkTheme?: boolean;
  editable?: boolean;
  blurOnSubmit?: boolean;
  allowSpacing?: boolean;
  touched?: boolean;
  name: string;
  error?: string;
  startIcon?: IconComponentProps;
  endIcon?: IconComponentProps;
  containerStyle?: StyleType;
  titleStyle?: StyleProp<TextStyle>;
}

export const PhoneInputComponent: React.FC<PhoneInputProp> = ({
  label,
  title,
  value,
  placeholder,
  error,
  onChangeText,
  style,
  touched,
  returnKeyType = 'next',
  onSubmitEditing,
  autoFocus,
  blurOnSubmit,
  defaultCode = 'AE',
  allowSpacing = true,
  name,
  startIcon,
  endIcon,
  darkTheme,
  titleStyle,
  editable = true,
  containerStyle,
  ...rest
}) => {
  const phoneRef = useRef<PhoneInput>(null);
  const {activeInput, setActiveInput} = useFocus();
  const [showError, setShowError] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const isErrorShown = touched && error;

  const handleTextChange = (text: string) => {
    onChangeText(!allowSpacing ? text.replace(REGEX.REMOVE_SPACES, '') : text);
  };

  const handleSubmitEditing = (
    e: NativeSyntheticEvent<TextInputSubmitEditingEventData>,
  ) => {
    if (onSubmitEditing) onSubmitEditing(e);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {title && (
        <Typography style={[styles.title, titleStyle]}>{title}</Typography>
      )}
      <RowComponent
        style={[
          styles.inputContainer,
          {
            borderColor:
              name === activeInput
                ? COLORS.PRIMARY
                : isErrorShown
                ? COLORS.RED
                : COLORS.BORDER,
            borderWidth: 1,
          },
        ]}>
        {startIcon && (
          <Icon
            {...startIcon}
            iconStyle={[styles.startIcon, startIcon.iconStyle]}
          />
        )}
        {label && <Typography style={styles.label}>{label}</Typography>}

        <PhoneInput
          ref={phoneRef}
          defaultValue={value}
          defaultCode={defaultCode}
          placeholder={i18n.t(placeholder)}
          containerStyle={styles.innerContainer}
          countryPickerButtonStyle={styles.countryPickerButtonStyle}
          textInputProps={{
            placeholderTextColor: COLORS.MEDIUM_GREY,
            editable: editable,
            returnKeyType: returnKeyType,
            maxLength: 17,
            blurOnSubmit: blurOnSubmit,
            onSubmitEditing: handleSubmitEditing,
            onBlur: () => setActiveInput(''),
            onFocus: () => setActiveInput(name),
          }}
          textInputStyle={styles.textInputStyle}
          codeTextStyle={styles.codeTextStyle}
          textContainerStyle={styles.textContainerStyle}
          onChangeCountry={country => {
            setCountryCode(country.callingCode?.[0]);
          }}
          onChangeFormattedText={(text: string) => {
            const isValid = phoneRef.current?.isValidNumber(text);
            const startsWithPlusZero = text.startsWith(`+${countryCode}0`);

            if ((touched && !isValid) || (touched && startsWithPlusZero)) {
              setShowError(i18n.t(VALIDATION_MESSAGES.WRONG_PHONE_NUMBER));
            } else {
              setShowError('');
            }

            handleTextChange(text);
          }}
          withDarkTheme={darkTheme}
          autoFocus={autoFocus}
          {...rest}
        />
        {endIcon && (
          <Icon {...endIcon} iconStyle={[styles.endIcon, endIcon.iconStyle]} />
        )}
      </RowComponent>
      {(isErrorShown || showError) && (
        <Typography style={styles.error}>{error || showError}</Typography>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  inputContainer: {
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 2,
    marginBottom: 5,
  },
  label: {
    backgroundColor: COLORS.WHITE,
    top: -9,
    left: 8,
    paddingHorizontal: 4,
    position: 'absolute',
  },
  startIcon: {
    padding: 10,
  },
  endIcon: {
    padding: 10,
  },
  title: {
    fontSize: FontSize.Medium,
    marginBottom: 8,
  },
  error: {
    paddingHorizontal: 10,
    textAlign: 'right',
    color: COLORS.ERROR,
  },
  innerContainer: {
    ...CENTER,
    borderRadius: 10,
    height: 42,
  },
  codeTextStyle: {
    height: isIOS() ? 16 : 22,
    ...CENTER,
  },
  countryPickerButtonStyle: {
    width: 70,
    borderRadius: 10,
  },
  textContainerStyle: {
    height: 42,
    backgroundColor: COLORS.WHITE,
  },
  textInputStyle: {
    height: 42,
  },
});
