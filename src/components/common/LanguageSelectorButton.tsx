import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ImageSourcePropType } from 'react-native';
import { COLORS } from 'utils/colors';
import { FontSize } from 'types/fontTypes';

interface LanguageSelectorButtonProps {
  language: string;
  flag: ImageSourcePropType;
  selected?: boolean;
  onPress?: () => void;
}

export const LanguageSelectorButton: React.FC<LanguageSelectorButtonProps> = ({
  language,
  flag,
  selected = false,
  onPress,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.button, selected && styles.selected]}
    >
      <Image source={flag} style={styles.flag} resizeMode="contain" />
      <Text style={styles.languageText}>{language}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.LANGUAGE_BTN_COLOR, // or use a neutral white/gray color
    borderRadius: 32,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 10,
    width:156
  },
  selected: {
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
  },
  flag: {
    height: 42,
    width: 42,
    borderRadius: 16,
    marginRight: 12,
  },
  languageText: {
    fontSize: FontSize.Medium,
    color: COLORS.BLACK,
    fontWeight: '500',
    marginStart:14
  },
});
