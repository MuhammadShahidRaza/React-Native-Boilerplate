import {useEffect, useRef} from 'react';
import {StyleProp} from 'react-native';
import {
  TextInput,
  StyleSheet,
  TextInputProps,
  View,
  NativeSyntheticEvent,
  TextInputSubmitEditingEventData,
  TextStyle,
} from 'react-native';
import {COLORS, REGEX} from 'utils/index';
import {Typography} from './Typography';
import {useFocus} from 'hooks/useFocus';
import {Icon, IconComponentProps} from './Icon';
import {RowComponent} from './Row';
import i18n from 'i18n/index';
import {ChildrenType, StyleType} from 'types/common';

interface InputProps extends TextInputProps {
  label?: string;
  title?: string;
  value: string;
  placeholder: string;
  onChangeText: (text: string) => void;
  onPress?: () => void;
  style?: StyleProp<TextStyle>;
  endImage?: ChildrenType;
  maxLines?: number;
  returnKeyType?: TextInputProps['returnKeyType'];
  onSubmitEditing?: (
    e: NativeSyntheticEvent<TextInputSubmitEditingEventData>,
  ) => void;
  autoFocus?: boolean;
  editable?: boolean;
  blurOnSubmit?: boolean;
  secureTextEntry?: boolean;
  allowSpacing?: boolean;
  touched?: boolean;
  name: string;
  error?: string;
  startIcon?: IconComponentProps;
  endIcon?: IconComponentProps;
  containerStyle?: StyleType;
  secondContainerStyle?: StyleType;
  titleStyle?: StyleProp<TextStyle>;
}

export const Input: React.FC<InputProps> = ({
  label,
  title,
  value,
  placeholder,
  error,
  onChangeText,
  style,
  endImage,
  touched,
  maxLines,
  returnKeyType = 'next',
  onSubmitEditing,
  autoFocus,
  blurOnSubmit,
  secureTextEntry,
  allowSpacing = true,
  name,
  startIcon,
  endIcon,
  containerStyle,
  secondContainerStyle,
  editable,
  titleStyle,
  onPress,
  ...rest
}) => {
  const inputRef = useRef<TextInput>(null);
  const {activeInput, setActiveInput, focusNextInput, textInput} = useFocus();
  const isErrorShown = touched && error;
  useEffect(() => {
    textInput(name, inputRef.current);
    if (name === 'initial' && autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus, name, textInput]);

  const handleTextChange = (text: string) => {
    onChangeText(!allowSpacing ? text.replace(REGEX.REMOVE_SPACES, '') : text);
  };

  const handleSubmitEditing = (
    e: NativeSyntheticEvent<TextInputSubmitEditingEventData>,
  ) => {
    if (onSubmitEditing) onSubmitEditing(e);
    if (returnKeyType === 'next') {
      focusNextInput(); // Focus next input
    }
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
          secondContainerStyle,
        ]}>
        {startIcon && (
          <Icon
            {...startIcon}
            iconStyle={[styles.startIcon, startIcon.iconStyle]}
          />
        )}
        {label && <Typography style={styles.label}>{label}</Typography>}
        <TextInput
          ref={inputRef}
          style={[styles.input, style]}
          placeholder={i18n.t(placeholder)}
          value={value}
          onPress={onPress}
          placeholderTextColor={COLORS.MEDIUM_GREY}
          onChangeText={handleTextChange}
          multiline={!!maxLines}
          numberOfLines={maxLines}
          editable={editable}
          returnKeyType={returnKeyType}
          onSubmitEditing={handleSubmitEditing}
          autoFocus={autoFocus}
          onBlur={() => setActiveInput('')}
          onFocus={() => setActiveInput(name)}
          blurOnSubmit={blurOnSubmit}
          secureTextEntry={secureTextEntry}
          {...rest}
        />
        {endIcon && (
          <Icon {...endIcon} iconStyle={[styles.endIcon, endIcon.iconStyle]} />
        )}
        {endImage && endImage}
      </RowComponent>
      {isErrorShown && <Typography style={styles.error}>{error}</Typography>}
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
    paddingHorizontal: 12,
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
    marginBottom: 8,
  },
  error: {
    paddingHorizontal: 10,
    textAlign: 'right',
    color: COLORS.ERROR,
  },
  input: {
    flex: 1,
    height: 42,
    color: COLORS.BLACK,
  },
  iconContainer: {
    marginHorizontal: 8,
  },
});
