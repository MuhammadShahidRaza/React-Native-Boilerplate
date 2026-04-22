import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Typography } from './Typography';
import { useTheme } from 'hooks/useTheme';
import { ThemeMode } from 'types/themeTypes';
import { FontWeight } from 'types/fontTypes';
import { COLORS } from 'utils/colors';

interface ThemeOptionProps {
  mode: ThemeMode;
  label: string;
  isSelected: boolean;
  onSelect: () => void;
}

const ThemeOption: React.FC<ThemeOptionProps> = ({ label, isSelected, onSelect }) => {
  return (
    <TouchableOpacity
      style={[
        styles.option,
        {
          backgroundColor: isSelected ? COLORS.PRIMARY : COLORS.SURFACE,
          borderColor: isSelected ? COLORS.PRIMARY : COLORS.BORDER,
        },
      ]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <Typography
        color={isSelected ? COLORS.TEXT_INVERSE : COLORS.TEXT}
        fontWeight={isSelected ? FontWeight.SemiBold : FontWeight.Normal}
      >
        {label}
      </Typography>
    </TouchableOpacity>
  );
};

interface ThemeSelectorProps {
  showLabels?: boolean;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ showLabels = true }) => {
  const { themeMode, setThemeMode } = useTheme();

  const themeOptions: { mode: ThemeMode; label: string }[] = [
    { mode: 'system', label: 'System' },
    { mode: 'light', label: 'Light' },
    { mode: 'dark', label: 'Dark' },
  ];

  return (
    <View style={styles.container}>
      {showLabels && (
        <Typography style={styles.title} fontWeight={FontWeight.Medium} translate={false}>
          Theme
        </Typography>
      )}
      <View style={styles.optionsContainer}>
        {themeOptions.map(option => (
          <ThemeOption
            key={option.mode}
            mode={option.mode}
            label={option.label}
            isSelected={themeMode === option.mode}
            onSelect={() => setThemeMode(option.mode)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  title: {
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  option: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
