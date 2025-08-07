import { useEffect, useRef, useState } from 'react';
import { StyleProp, useColorScheme } from 'react-native';
import {
  StyleSheet,
  TextInputProps,
  View,
  NativeSyntheticEvent,
  TextInputSubmitEditingEventData,
  TextStyle,
} from 'react-native';
import { CENTER, COLORS, isIOS, REGEX, safeString } from 'utils/index';
import { Typography } from './Typography';
import { FontSize, StyleType } from 'types/index';
import { useFocus } from 'hooks/useFocus';
import { Icon, IconComponentProps } from './Icon';
import { RowComponent } from './Row';
import i18n from 'i18n/index';
import PhoneInput, { PhoneInputProps } from 'react-native-phone-number-input';
import { VALIDATION_MESSAGES } from 'constants/validationMessages';

interface PhoneInputProp extends PhoneInputProps {
  label?: string;
  title?: string;
  value: string;
  placeholder: string;
  onChangeText: (text: string) => void;
  onChangeCountryCode: (text: string) => void;
  onChangeCallingCode: (text: string) => void;
  style?: StyleProp<TextStyle>;
  returnKeyType?: TextInputProps['returnKeyType'];
  onSubmitEditing?: (e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => void;
  autoFocus?: boolean;
  darkTheme?: boolean;
  editable?: boolean;
  blurOnSubmit?: boolean;
  allowSpacing?: boolean;
  isTitleInLine?: boolean;
  touched?: boolean;
  name: string;
  lineAfterIcon?: boolean;
  startIcon: IconComponentProps;
  error?: string;
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
  lineAfterIcon = true,
  style,
  touched,
  returnKeyType = 'next',
  onSubmitEditing,
  autoFocus,
  isTitleInLine = true,
  blurOnSubmit,
  defaultCode = 'NG',
  allowSpacing = true,
  name,
  startIcon,
  onChangeCountryCode,
  onChangeCallingCode,
  endIcon,
  darkTheme,
  titleStyle,
  editable = true,
  containerStyle,
  ...rest
}) => {
  const phoneRef = useRef<PhoneInput>(null);
  const { activeInput, setActiveInput } = useFocus();
  const [showError, setShowError] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const isErrorShown = touched && error;
  const height = isTitleInLine ? (isIOS() ? 36 : 40) : isIOS() ? 44 : 48;
  const isDarkMode = useColorScheme() == 'dark';
  const handleTextChange = (text: string) => {
    onChangeText(!allowSpacing ? text.replace(REGEX.REMOVE_SPACES, '') : text);
  };

  const handleSubmitEditing = (e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => {
    if (onSubmitEditing) onSubmitEditing(e);
  };

  const validateNumber = (text: string) => {
    const isValid = phoneRef.current?.isValidNumber(text);
    const startsWithPlusZero = text.startsWith(`+${countryCode}0`);
    if ((touched && !isValid) || (touched && startsWithPlusZero)) {
      setShowError(i18n.t(VALIDATION_MESSAGES.WRONG_PHONE_NUMBER));
    } else {
      setShowError('');
    }
  };

  useEffect(() => {
    validateNumber(value);
  }, []);

  return (
    <View style={[styles.container, containerStyle]}>
      {!isTitleInLine && title && (
        <Typography style={[{ marginBottom: isTitleInLine ? 0 : 6 }, styles.title, titleStyle]}>
          {title}
        </Typography>
      )}
      <RowComponent
        style={[
          styles.inputContainer,
          {
            borderColor:
              name === activeInput ? COLORS.PRIMARY : isErrorShown ? COLORS.RED : COLORS.BORDER,
            borderWidth: 1,
            borderRadius: isTitleInLine ? 15 : 10,
          },
        ]}
      >
        {/* {startIcon && <Icon {...startIcon} iconStyle={[styles.startIcon, startIcon.iconStyle]} />} */}
        <Icon iconStyle={[styles.startIcon, startIcon?.iconStyle]} {...startIcon} />
        {lineAfterIcon && <View style={styles.lineStyle} />}
        {label && <Typography style={styles.label}>{label}</Typography>}
        <View style={styles.inputContainerWithTitle}>
          {isTitleInLine && title && (
            <Typography style={[styles.title, titleStyle]}>{title}</Typography>
          )}
          <RowComponent>
            <PhoneInput
              ref={phoneRef}
              defaultValue={value}
              defaultCode={defaultCode}
              placeholder={i18n.t(placeholder)}
              containerStyle={[{ height }, styles.innerContainer]}
              countryPickerButtonStyle={styles.countryPickerButtonStyle}
              textInputProps={{
                placeholderTextColor: isDarkMode ? COLORS.ICONS : COLORS.TEXT,
                editable: editable,
                returnKeyType: returnKeyType,
                maxLength: 12,
                blurOnSubmit: blurOnSubmit,
                onSubmitEditing: handleSubmitEditing,
                onBlur: () => setActiveInput(''),
                onFocus: () => setActiveInput(name),
              }}
              disabled={!editable}
              textInputStyle={[{ height }, styles.textInputStyle]}
              codeTextStyle={styles.codeTextStyle}
              textContainerStyle={[{ height }, styles.textContainerStyle]}
              onChangeCountry={country => {
                setCountryCode(country?.callingCode?.[0]);
                onChangeCallingCode(safeString(country?.callingCode?.[0]));
                onChangeCountryCode(country?.cca2);
              }}
              onChangeFormattedText={(text: string) => {
                handleTextChange(text);
                validateNumber(text);
              }}
              withDarkTheme={darkTheme}
              autoFocus={autoFocus}
              {...rest}
            />
            {endIcon && <Icon {...endIcon} iconStyle={[styles.endIcon, endIcon.iconStyle]} />}
          </RowComponent>
        </View>
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
    backgroundColor: COLORS.INPUT_BACKGROUND,
    overflow: 'hidden',
    paddingHorizontal: 8,
    marginBottom: 5,
  },
  inputContainerWithTitle: { width: '80%' },
  lineStyle: {
    backgroundColor: COLORS.BORDER,
    width: 1,
    marginHorizontal: 10,
    height: '100%',
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
    fontSize: FontSize.ExtraLarge,
    color: COLORS.PRIMARY,
  },
  endIcon: {
    padding: 10,
  },
  title: {
    paddingTop: 6,
    color: COLORS.ICONS,
    fontSize: FontSize.MediumSmall,
  },
  error: {
    paddingHorizontal: 10,
    textAlign: 'right',
    color: COLORS.ERROR,
    fontSize: FontSize.Small,
  },
  innerContainer: {
    ...CENTER,
    borderRadius: 10,
  },
  codeTextStyle: {
    height: isIOS() ? 18 : 22,
    ...CENTER,
  },
  countryPickerButtonStyle: {
    borderRadius: 10,
    width: '20%',
    backgroundColor: COLORS.INPUT_BACKGROUND,
  },
  textContainerStyle: {
    maxWidth: isIOS() ? '66%' : '68%',
    backgroundColor: COLORS.INPUT_BACKGROUND,
  },
  textInputStyle: {
    color: COLORS.PRIMARY,
  },
});
