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
import { COLORS, INPUT_THEME, REGEX } from 'utils/index';
import { Typography } from './Typography';
import { useFocus } from 'hooks/useFocus';
import { Icon, IconComponentProps } from './Icon';
import { RowComponent } from './Row';
import i18n from 'i18n/index';
import { ChildrenType, StyleType } from 'types/common';

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
  startIcon?: IconComponentProps;
  endIcon?: IconComponentProps;
  containerStyle?: StyleType;
  secondContainerStyle?: StyleType;
  inputContainerWithTitleStyle?: StyleType;
  titleStyle?: StyleProp<TextStyle>;
}

export const Input: React.FC<InputProps> = ({
  label,
  title,
  value,
  placeholder,
  error,
  onChangeText = () => {},
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
  allowSpacing = true,
  name,
  startIcon,
  endIcon,
  containerStyle,
  secondContainerStyle,
  editable,
  titleStyle,
  inputContainerWithTitleStyle,
  onPress,
  ...rest
}) => {
  const inputRef = useRef<TextInput>(null);
  const { activeInput, setActiveInput, focusNextInput, textInput } = useFocus();
  const height = isTitleInLine ? 40 : INPUT_THEME.input.height;
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
        activeOpacity={editable === false && onPress ? 0.7 : 1}
        onPress={onPress}
        style={[
          styles.inputContainer,
          {
            borderColor:
              name === activeInput ? COLORS.PRIMARY : isErrorShown ? COLORS.RED : COLORS.BORDER,
            borderWidth: 1,
            borderRadius: isTitleInLine
              ? INPUT_THEME.input.borderRadiusInline
              : INPUT_THEME.input.borderRadius,
          },
          secondContainerStyle,
        ]}
      >
        {/* {startIcon && <Icon {...startIcon} iconStyle={[styles.startIcon, startIcon.iconStyle]} />} */}
        {startIcon && <Icon iconStyle={[styles.startIcon, startIcon?.iconStyle]} {...startIcon} />}
        {lineAfterIcon && <View style={styles.lineStyle} />}
        {label && <Typography style={styles.label}>{label}</Typography>}

        <View
          style={[{ width: !startIcon || !endIcon ? '100%' : '80%' }, inputContainerWithTitleStyle]}
        >
          {isTitleInLine && title && (
            <Typography style={[styles.title, titleStyle]}>{title}</Typography>
          )}
          <RowComponent>
            <TextInput
              ref={inputRef}
              style={[{ height, fontSize: INPUT_THEME.value.fontSize }, styles.input, style]}
              placeholder={i18n.t(placeholder)}
              value={value}
              placeholderTextColor={COLORS.PLACEHOLDER}
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
              allowFontScaling={false}
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
    marginBottom: 5,
  },
  inputContainer: {
    alignItems: 'center',
    // backgroundColor: COLORS.INPUT_BACKGROUND,
    paddingHorizontal: 8,
    marginBottom: 5,
  },
  inputContainerWithTitle: { width: '80%' },
  label: {
    backgroundColor: COLORS.BACKGROUND,
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
    fontSize: 24,
    color: COLORS.PRIMARY,
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
  input: {
    flex: 1,
    color: COLORS.TEXT,
  },
  iconContainer: {
    marginHorizontal: 8,
  },
});
