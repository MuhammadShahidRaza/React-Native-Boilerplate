import { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleProp, useColorScheme } from 'react-native';
import {
  StyleSheet,
  TextInputProps,
  View,
  NativeSyntheticEvent,
  TextInputSubmitEditingEventData,
  TextStyle,
} from 'react-native';
import { COLORS, INPUT_THEME, isIOS, REGEX, safeString, splitPhoneNumberWithCode } from 'utils/index';
import { Typography } from './Typography';
import { StyleType } from 'types/index';
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
  startIcon?: IconComponentProps;
  error?: string;
  endIcon?: IconComponentProps;
  containerStyle?: StyleType;
  secondContainerStyle?: StyleType;
  inputContainerWithTitleStyle?: StyleType;
  titleStyle?: StyleProp<TextStyle>;
  onBlur?: () => void;
}

/** Keep only national digits in the text field (flag area already shows +code). */
const toNationalPhoneDigits = (raw: string, callingCode?: string) => {
  const trimmed = safeString(raw).trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('+')) {
    const parsed = splitPhoneNumberWithCode(trimmed);
    return safeString(parsed?.number).replace(/\D/g, '');
  }

  const codeDigits = safeString(callingCode).replace(/\D/g, '');
  const digits = trimmed.replace(/\D/g, '');
  if (codeDigits && digits.startsWith(codeDigits)) {
    return digits.slice(codeDigits.length);
  }
  return digits;
};

export const PhoneInputComponent: React.FC<PhoneInputProp> = ({
  label,
  title,
  value,
  placeholder,
  error,
  onChangeText,
  lineAfterIcon = false,
  style,
  touched,
  returnKeyType = 'next',
  onSubmitEditing,
  autoFocus,
  isTitleInLine = false,
  blurOnSubmit,
  defaultCode = 'US',
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
  secondContainerStyle,
  inputContainerWithTitleStyle,
  onBlur,
  ...rest
}) => {
  const phoneRef = useRef<PhoneInput>(null);
  const { activeInput, setActiveInput } = useFocus();
  const [showError, setShowError] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [displayNumber, setDisplayNumber] = useState(() => toNationalPhoneDigits(value));
  const isErrorShown = touched && error;
  const lockCountryPicker = !editable;
  const height = isTitleInLine ? (isIOS() ? 36 : 40) : INPUT_THEME.input.height;
  const isDarkMode = useColorScheme() == 'dark';

  const countryPickerProps = useMemo(() => {
    const fromRest = rest.countryPickerProps ?? {};
    const fromRestModal = fromRest.modalProps ?? {};
    return {
      withEmoji: true,
      withFlag: true,
      ...fromRest,
      ...(lockCountryPicker
        ? { visible: false, modalProps: { visible: false, ...fromRestModal } }
        : {
            modalProps: {
              animationType: 'slide' as const,
              ...(Platform.OS === 'ios' ? { presentationStyle: 'fullScreen' as const } : {}),
              ...fromRestModal,
            },
          }),
    };
  }, [lockCountryPicker, rest.countryPickerProps]);

  const handleNationalChange = (text: string) => {
    const national = !allowSpacing ? text.replace(REGEX.REMOVE_SPACES, '') : text;
    const digitsOnly = national.replace(/\D/g, '');
    setDisplayNumber(digitsOnly);
    onChangeText(digitsOnly);
  };

  const handleSubmitEditing = (e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => {
    if (onSubmitEditing) onSubmitEditing(e);
  };

  const validateNumber = (text: string) => {
    if (touched && text.startsWith('0')) {
      setShowError(i18n.t(VALIDATION_MESSAGES.WRONG_PHONE_NUMBER));
    } else {
      setShowError('');
    }
  };

  useEffect(() => {
    const national = toNationalPhoneDigits(value, countryCode);
    setDisplayNumber(national);
    validateNumber(national);
  }, [value, countryCode]);

  return (
    <View style={[styles.container, containerStyle]}>
      {!isTitleInLine && title && (
        <Typography
          style={[
            { marginBottom: isTitleInLine ? 0 : INPUT_THEME.title.marginBottom },
            styles.title,
            titleStyle,
          ]}
        >
          {title}
        </Typography>
      )}
      <RowComponent
        style={[
          styles.inputContainer,
          isTitleInLine && styles.inputContainerInline,
          {
            borderColor:
              name === activeInput ? COLORS.PRIMARY : isErrorShown ? COLORS.RED : COLORS.BORDER,
            borderWidth: isTitleInLine ? 0 : 1,
            borderBottomWidth: isTitleInLine ? 1 : undefined,
            borderRadius: isTitleInLine ? 0 : INPUT_THEME.input.borderRadius,
          },
          secondContainerStyle,
        ]}
      >
        {startIcon ? (
          <Icon iconStyle={[styles.startIcon, startIcon.iconStyle]} {...startIcon} />
        ) : null}
        {lineAfterIcon && startIcon ? <View style={styles.lineStyle} /> : null}
        {label && <Typography style={styles.label}>{label}</Typography>}
        <View
          style={[
            styles.inputContainerWithTitle,
            !startIcon && !endIcon ? styles.inputContainerFullWidth : null,
            inputContainerWithTitleStyle,
          ]}
        >
          {isTitleInLine && title ? (
            <Typography style={[styles.title, titleStyle]}>{title}</Typography>
          ) : null}
          <RowComponent>
            <PhoneInput
              ref={phoneRef}
              value={displayNumber}
              defaultCode={defaultCode}
              layout='first'
              disableArrowIcon={lockCountryPicker}
              countryPickerProps={countryPickerProps}
              placeholder={i18n.t(placeholder)}
              containerStyle={[
                { height },
                styles.innerContainer,
                isTitleInLine && styles.innerContainerInline,
              ]}
              countryPickerButtonStyle={[
                styles.countryPickerButtonStyle,
                isTitleInLine && styles.countryPickerInline,
              ]}
              textInputProps={{
                placeholderTextColor: isDarkMode ? COLORS.ICONS : COLORS.TEXT,
                editable: editable,
                returnKeyType: returnKeyType,
                maxLength: 12,
                blurOnSubmit: blurOnSubmit,
                onSubmitEditing: handleSubmitEditing,
                onBlur: () => {
                  setActiveInput('');
                  onBlur?.();
                },
                onFocus: () => setActiveInput(name),
                allowFontScaling: false,
              }}
              disabled={lockCountryPicker}
              textInputStyle={[
                { height, fontSize: INPUT_THEME.value.fontSize },
                styles.textInputStyle,
                !editable && styles.textInputDisabled,
              ]}
              codeTextStyle={[styles.codeTextStyle, { fontSize: INPUT_THEME.value.fontSize }]}
              textContainerStyle={[
                { height },
                styles.textContainerStyle,
                isTitleInLine && styles.textContainerInline,
              ]}
              onChangeCountry={country => {
                const code = safeString(country?.callingCode?.[0]);
                setCountryCode(code);
                onChangeCallingCode(code);
                onChangeCountryCode(country?.cca2);
              }}
              onChangeText={(text: string) => {
                handleNationalChange(text);
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

const PROFILE_FIELD_CONTAINER = {
  borderWidth: 0,
  borderBottomWidth: 1,
  marginBottom: 20,
} as const;

const styles = StyleSheet.create({
  container: {
    marginBottom: 5,
  },
  inputContainer: {
    alignItems: 'center',
    backgroundColor: INPUT_THEME.inputBackground.backgroundColor,
    overflow: 'hidden',
    paddingHorizontal: 8,
    marginBottom: 5,
  },
  inputContainerInline: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
  },
  inputContainerWithTitle: { flex: 1 },
  inputContainerFullWidth: { width: '100%' },
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
    fontSize: 24,
    color: COLORS.PLACEHOLDER,
  },
  endIcon: {
    padding: 10,
  },
  title: {
    paddingTop: 6,
    color: COLORS.ICONS,
    fontSize: INPUT_THEME.title.fontSize,
  },
  error: {
    paddingHorizontal: 10,
    textAlign: 'right',
    color: COLORS.ERROR,
    fontSize: INPUT_THEME.error.fontSize,
  },
  innerContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: INPUT_THEME.inputBackground.backgroundColor,
    paddingLeft: 0,
  },
  innerContainerInline: {
    backgroundColor: 'transparent',
    borderRadius: 0,
  },
  codeTextStyle: {
    includeFontPadding: false,
    textAlignVertical: 'center',
    marginRight: 2,
    paddingRight: 0,
  },
  countryPickerButtonStyle: {
    borderRadius: INPUT_THEME.input.borderRadius,
    minWidth: 64,
    paddingRight: 4,
    marginRight: 2,
    backgroundColor: INPUT_THEME.inputBackground.backgroundColor,
  },
  countryPickerInline: {
    backgroundColor: 'transparent',
    width: 52,
    marginRight: 0,
  },
  textContainerStyle: {
    flex: 1,
    paddingLeft: 0,
    paddingVertical: 0,
    backgroundColor: INPUT_THEME.inputBackground.backgroundColor,
  },
  textContainerInline: {
    backgroundColor: 'transparent',
  },
  textInputStyle: {
    color: COLORS.TEXT,
  },
  textInputDisabled: {
    color: COLORS.TEXT,
    opacity: 1,
  },
});

/** Matches Profile / Edit Profile inline field chrome (title above, bottom border only). */
export const PROFILE_PHONE_INPUT_STYLE = PROFILE_FIELD_CONTAINER;
