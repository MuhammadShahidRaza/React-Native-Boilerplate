import { useState, useEffect } from 'react';
import { View, TouchableOpacity, Alert, Platform, StyleSheet, Image } from 'react-native';
import { changeAppIcon, getCurrentIcon } from '../../utils/appIcon';
import { useTheme } from '../../hooks';
import { COLORS } from 'utils/colors';
import { FontSize } from 'types/fontTypes';
import { Typography } from './Typography';
import { Wrapper } from './Wrapper';

const appIconDark = require('../../assets/images/app-icon-dark.png');
const appIconLight = require('../../assets/images/app-icon-light.png');

type IconOption = {
  id: 'dark' | 'light';
  label: string;
  description: string;
};

const iconOptions: IconOption[] = [
  {
    id: 'dark',
    label: 'Dark Icon',
    description: 'Black background icon',
  },
  {
    id: 'light',
    label: 'Light Icon',
    description: 'White background icon',
  },
];

/**
 * Component that allows users to manually select their app icon
 * iOS requires icon changes to be triggered by direct user interaction
 */
export const AppIconSelector = () => {
  useTheme();
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    loadCurrentIcon();
  }, []);

  const loadCurrentIcon = async () => {
    const current = await getCurrentIcon();
    // Map the current icon to our option IDs
    if (current === 'DarkAppIcon' || current === 'Dark') {
      setSelectedIcon('dark');
    } else if (current === 'LightAppIcon' || current === 'Light') {
      setSelectedIcon('light');
    } else {
      // Default icon - set to dark
      setSelectedIcon('dark');
    }
  };

  const handleIconChange = async (iconId: 'dark' | 'light') => {
    if (isChanging || selectedIcon === iconId) return;

    setIsChanging(true);
    try {
      await changeAppIcon(iconId);
      setSelectedIcon(iconId);
      // iOS shows a native alert, but we can show success for Android
      if (Platform.OS === 'android') {
        Alert.alert('Success', 'App icon changed successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to change app icon. Please try again.');
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <Wrapper headerTitle='Icon Selector' showBackButton={true}>
      <View style={styles.container}>
        <Typography style={styles.title}>App Icon</Typography>
        <Typography style={styles.subtitle}>
          Choose which icon appears on your mobile app
        </Typography>

        <View style={styles.optionsContainer}>
          {iconOptions.map(option => {
            const isSelected = selectedIcon === option.id;
            return (
              <TouchableOpacity
                key={option.id}
                style={[styles.option, isSelected && styles.optionSelected]}
                onPress={() => handleIconChange(option.id)}
                disabled={isChanging}
              >
                <View style={styles.optionContent}>
                  <View style={styles.iconPreview}>
                    <Image
                      source={option.id === 'dark' ? appIconDark : appIconLight}
                      style={styles.iconImage}
                      resizeMode='cover'
                    />
                  </View>
                  <View style={styles.optionText}>
                    <Typography
                      style={[
                        styles.optionLabel,
                        isSelected ? { color: COLORS.TEXT_INVERSE } : { color: COLORS.TEXT },
                      ]}
                    >
                      {option.label}
                    </Typography>
                    <Typography
                      style={[
                        styles.optionDescription,

                        isSelected ? { color: COLORS.TEXT_INVERSE } : { color: COLORS.TEXT },
                      ]}
                    >
                      {option.description}
                    </Typography>
                  </View>
                </View>
                {isSelected && (
                  <View style={styles.checkmark}>
                    <Typography style={styles.checkmarkText}>✓</Typography>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.TEXT,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: FontSize.Medium,
    color: COLORS.TEXT,
    marginBottom: 20,
  },
  optionsContainer: {
    gap: 20,
  },
  option: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.BORDER,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionSelected: {
    borderColor: COLORS.TEXT,
    backgroundColor: COLORS.PRIMARY,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconPreview: {
    marginRight: 20,
  },
  iconImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  iconPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 12,
    borderWidth: 1,
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: FontSize.Medium,
    fontWeight: '600',
    color: COLORS.TEXT,
    marginBottom: 10,
  },
  optionDescription: {
    fontSize: FontSize.Small,
    color: COLORS.TEXT,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.TEXT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: COLORS.PRIMARY,
    fontSize: FontSize.Small,
    fontWeight: 'bold',
  },
  note: {
    fontSize: FontSize.ExtraLarge,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 20,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
