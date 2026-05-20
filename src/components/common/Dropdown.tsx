import { useState, useCallback } from 'react';
import { View, StyleSheet, TextStyle, ScrollView } from 'react-native';
import { StyleType } from 'types/index';
import { Typography } from './Typography';
import { COLORS, INPUT_THEME, screenWidth } from 'utils/index';
import { Photo } from './Photo';
import { RowComponent } from './Row';
import { Icon } from './Icon';
import { VARIABLES } from 'constants/common';
import { COMMON_TEXT } from 'constants/screens';

export type DropdownItemProps = {
  name: string;
  id?: number;
  image?: string;
};

interface DropdownProps {
  options: DropdownItemProps[];
  selectedValue: string;
  title?: string;
  width?: number;
  /** Called with selected display value and the full option object. Use the second arg when you need id, image, etc. */
  onSelect: (value: string, item: DropdownItemProps) => void;
  containerStyle?: StyleType;
  textStyle?: TextStyle;
  titleStyle?: TextStyle;
  touched?: boolean;
  disabled?: boolean;
  error?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  selectedValue,
  onSelect,
  containerStyle,
  title,
  titleStyle,
  textStyle,
  width = screenWidth(90),
  touched,
  error,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleDropdown = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const handleSelectOption = useCallback(
    (item: DropdownItemProps) => {
      onSelect(item.name, item);
      setIsOpen(false);
    },
    [onSelect],
  );

  const selectedOption = options.find(option => option.name === selectedValue);
  const isErrorShown = touched && error;

  return (
    <>
      <View style={[styles.wrapper, containerStyle]}>
        {title && (
          <Typography
            style={[{ marginBottom: INPUT_THEME.title.marginBottom }, styles.title, titleStyle]}
          >
            {title}
          </Typography>
        )}
        <View
          style={[
            styles.container,
            {
              borderBottomRightRadius: isOpen ? 10 : INPUT_THEME.input.borderRadius,
              borderBottomStartRadius: isOpen ? 10 : INPUT_THEME.input.borderRadius,
              borderTopStartRadius: isOpen ? 10 : INPUT_THEME.input.borderRadius,
              borderTopEndRadius: isOpen ? 10 : INPUT_THEME.input.borderRadius,
              width,
              borderWidth: 1,
              borderColor: isErrorShown ? COLORS.RED : COLORS.BORDER,
            },
          ]}
        >
          <RowComponent
            onPress={disabled ? undefined : toggleDropdown}
            style={[
              styles.selectedContainer,
              styles.gap_10,
              {
                minHeight: INPUT_THEME.input.height,
              },
            ]}
          >
            <RowComponent style={[styles.gap_10, { width: '90%', justifyContent: 'flex-start' }]}>
              {selectedOption?.image && (
                <Photo source={selectedOption.image} imageStyle={styles.imageStyle} />
              )}
              {!selectedValue && (
                <RowComponent style={{ gap: 3 }}>
                  <Typography style={styles.placeholderValue}>{COMMON_TEXT.SELECT}</Typography>
                  <Typography style={styles.placeholderValue}>{title ?? ''}</Typography>
                </RowComponent>
              )}
              <Typography style={[styles.selectedValue, textStyle]}>{selectedValue}</Typography>
            </RowComponent>
            <Icon componentName={VARIABLES.AntDesign} iconName={'down'} color={COLORS.ICONS} />
          </RowComponent>
        </View>
        <View style={{ zIndex: 1, width, marginBottom: 5 }}>
          {isOpen && (
            <View style={[styles.dropdown, { width }]}>
              <ScrollView
                style={{ maxHeight: screenWidth(30) }}
                contentContainerStyle={{ flexGrow: 1 }}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps='handled'
                bounces={false}
                scrollEnabled={true}
                // {...(Platform.OS === 'android' && {
                //   persistentScrollbar: true,
                //   overScrollMode: 'never',
                // })}
              >
                {options.map((item, index) => (
                  <RowComponent
                    key={index}
                    onPress={() => handleSelectOption(item)}
                    style={[styles.dropdownItem, styles.gap_10]}
                  >
                    {item.image && (
                      <Photo disabled source={item.image} imageStyle={styles.imageStyle} />
                    )}
                    <Typography style={styles.option}>{item.name}</Typography>
                  </RowComponent>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>
      {isErrorShown && <Typography style={styles.error}>{error}</Typography>}
    </>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 5,
  },
  gap_10: {
    gap: 10,
  },
  container: {
    borderRadius: 10,
    // backgroundColor: COLORS.INPUT_BACKGROUND,
  },
  selectedValue: {
    fontSize: INPUT_THEME.value.fontSize,
    color: COLORS.TEXT,
    width: '75%',
  },
  placeholderValue: {
    fontSize: INPUT_THEME.placeholder.fontSize,
    color: COLORS.PLACEHOLDER,
  },
  selectedContainer: {
    paddingHorizontal: 8,
  },
  title: {
    color: COLORS.ICONS,
    fontSize: INPUT_THEME.title.fontSize,
  },
  dropdownItem: {
    justifyContent: 'flex-start',
    paddingHorizontal: 10,
  },
  dropdown: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: COLORS.BORDER,
    borderBottomEndRadius: 10,
    borderBottomStartRadius: 10,
    borderTopStartRadius: 0,
    //     // position: 'absolute', //TODO: //LANGUAGE ISSUE
    borderTopEndRadius: 0,
    backgroundColor: COLORS.BACKGROUND,
  },
  error: {
    paddingHorizontal: 10,
    textAlign: 'right',
    color: COLORS.ERROR,
    fontSize: INPUT_THEME.error.fontSize,
  },
  option: {
    paddingVertical: 10,
    width: '95%',
    fontSize: INPUT_THEME.option.fontSize,
    color: COLORS.TEXT_SECONDARY,
  },
  imageStyle: {
    width: 35,
    height: 22,
    resizeMode: 'contain',
  },
});
