import { useEffect, useRef } from 'react';
import { StyleProp } from 'react-native';
import {
  TextInput,
  StyleSheet,
  TextInputProps,
  View,
  NativeSyntheticEvent,
  TextInputSubmitEditingEventData,
  TextStyle,
} from 'react-native';
import { COLORS, REGEX } from 'utils/index';
import { Typography } from './Typography';
import { useFocus } from 'hooks/useFocus';
import { Icon, IconComponentProps } from './Icon';
import { RowComponent } from './Row';
import i18n from 'i18n/index';
import { ChildrenType, StyleType } from 'types/common';
import { FontSize } from 'types/fontTypes';

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
  onSubmitEditing?: (e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => void;
  autoFocus?: boolean;
  editable?: boolean;
  blurOnSubmit?: boolean;
  secureTextEntry?: boolean;
  allowSpacing?: boolean;
  touched?: boolean;
  name: string;
  isTitleInLine?: boolean;
  error?: string;
  lineAfterIcon?: boolean;
  startIcon: IconComponentProps;
  endIcon?: IconComponentProps;
  containerStyle?: StyleType;
  secondContainerStyle?: StyleType;
  titleStyle?: StyleProp<TextStyle>;
  inputContainerWithTitle?: StyleType
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
  lineAfterIcon = false,
  isTitleInLine = false,
  secureTextEntry,
  allowSpacing = false,
  name,
  startIcon,
  endIcon,
  containerStyle,
  secondContainerStyle,
  editable,
  titleStyle,
  onPress,
  inputContainerWithTitle,
  ...rest
}) => {
  const inputRef = useRef<TextInput>(null);
  const { activeInput, setActiveInput, focusNextInput, textInput } = useFocus();
  const height = isTitleInLine ? 36 : 42;
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

  const handleSubmitEditing = (e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => {
    if (onSubmitEditing) onSubmitEditing(e);
    if (returnKeyType === 'next') {
      focusNextInput(); // Focus next input
    }
  };

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
              name === activeInput ? COLORS.PRIMARY : isErrorShown ? COLORS.RED : COLORS.INPUT_BACKGROUND,
            borderWidth: 1,
            borderRadius: isTitleInLine ? 15 : 10,
          },
          secondContainerStyle,
        ]}
      >
        {/* {startIcon && <Icon {...startIcon} iconStyle={[styles.startIcon, startIcon.iconStyle]} />} */}
        <Icon iconStyle={[styles.startIcon, startIcon?.iconStyle]} {...startIcon} />
        {lineAfterIcon && <View style={styles.lineStyle} />}
        {label && <Typography style={styles.label}>{label}</Typography>}

        <View style={[styles.inputContainerWithTitle, inputContainerWithTitle]}>
          {isTitleInLine && title && (
            <Typography style={[styles.title, titleStyle]}>{title}</Typography>
          )}
          <RowComponent style={{ width: '100%' }}>
            <TextInput
              ref={inputRef}
              style={[{ height }, styles.input, style]}
              placeholder={i18n.t(placeholder)}
              value={value}
              onPress={onPress}
              placeholderTextColor={COLORS.TEXT}
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
            {endIcon && <Icon {...endIcon} iconStyle={[styles.endIcon, endIcon.iconStyle]} />}
            {endImage && endImage}
          </RowComponent>
        </View>
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
    backgroundColor: COLORS.INPUT_BACKGROUND,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginBottom: 5,
  },
  inputContainerWithTitle: { width: '80%' },
  label: {
    backgroundColor: COLORS.WHITE,
    top: -9,
    left: 8,
    paddingHorizontal: 4,
    position: 'absolute',
  },
  lineStyle: {
    backgroundColor: COLORS.BORDER,
    width: 1,
    marginHorizontal: 10,
    height: '100%',
  },
  startIcon: {
    padding: 10,
    fontSize: FontSize.ExtraLarge,
    color: COLORS.INPUT_FIELD_TEXT,
  },
  endIcon: {
    padding: 10,
  },
  title: {
    paddingTop: 6,
    color: COLORS.TEXT,
    fontSize: FontSize.MediumSmall,
  },
  error: {
    paddingHorizontal: 10,
    textAlign: 'right',
    color: COLORS.ERROR,
  },
  input: {
    flex: 1,
    color: COLORS.INPUT_FIELD_TEXT,
  },
  iconContainer: {
    marginHorizontal: 8,
  },
});
