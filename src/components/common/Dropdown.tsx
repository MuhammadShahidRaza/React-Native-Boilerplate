import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TextStyle } from 'react-native';
import { FontSize, StyleType } from 'types/index';
import { Typography } from './Typography';
import { COLORS, screenWidth } from 'utils/index';
import { FlatListComponent } from './Flatlist';
import { Photo } from './Photo';
import { RowComponent } from './Row';
import { Icon } from './Icon';
import { VARIABLES } from 'constants/common';
import { COMMON_TEXT } from 'constants/screens';

export type DropdownItemProps = {
  name: string;
  image?: string;
};

type RenderDropdownItemProps = {
  item: DropdownItemProps;
  index: number;
};

interface DropdownProps {
  options: DropdownItemProps[];
  selectedValue: string;
  title?: string;
  width?: number;
  onSelect: (value: string) => void;
  containerStyle?: StyleType;
  textStyle?: TextStyle;
  titleStyle?: TextStyle;
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
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleDropdown = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const handleSelectOption = useCallback(
    (value: string) => {
      onSelect(value);
      setIsOpen(false);
    },
    [onSelect],
  );

  const renderDropdownItem = useCallback(
    ({ item, index }: RenderDropdownItemProps) => (
      <RowComponent
        key={index}
        onPress={() => handleSelectOption(item.name)}
        style={[styles.dropdownItem, styles.gap_10]}
      >
        {item.image && <Photo disabled source={item.image} imageStyle={styles.imageStyle} />}
        <Typography style={styles.option}>{item.name}</Typography>
      </RowComponent>
    ),
    [handleSelectOption],
  );

  const selectedOption = options.find(option => option.name === selectedValue);

  return (
    <>
      {title && <Typography style={[styles.title, titleStyle]}>{title}</Typography>}
      <View
        style={[
          styles.container,
          containerStyle,
          {
            borderBottomRightRadius: isOpen ? 0 : 10,
            borderBottomStartRadius: isOpen ? 0 : 10,
            width,
          },
        ]}
      >
        <RowComponent onPress={toggleDropdown} style={[styles.selectedContainer, styles.gap_10]}>
          <RowComponent style={styles.gap_10}>
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
      <View style={{ zIndex: 1, width, marginBottom: 10 }}>
        {isOpen && (
          <View style={[styles.dropdown, { width }]}>
            <FlatListComponent
              data={options}
              scrollEnabled={true}
              style={{ height: screenWidth(30) }}
              renderItem={renderDropdownItem}
            />
          </View>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  gap_10: {
    gap: 10,
  },
  container: {
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 10,
  },
  selectedValue: {
    fontSize: FontSize.Medium,
    color: COLORS.BLACK,
    textTransform: 'capitalize',
  },
  placeholderValue: {
    fontSize: FontSize.Medium,
    color: COLORS.BORDER,
  },
  selectedContainer: {
    height: 40,
    paddingHorizontal: 10,
  },
  title: {
    marginBottom: 8,
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
    backgroundColor: COLORS.WHITE,
  },
  option: {
    paddingVertical: 10,
    fontSize: FontSize.Medium,
    textTransform: 'capitalize',
    color: COLORS.DARK_GREY,
  },
  imageStyle: {
    width: 35,
    height: 22,
    resizeMode: 'contain',
  },
});
