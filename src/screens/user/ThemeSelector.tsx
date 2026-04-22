import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography, Wrapper, SvgComponent } from 'components/index';
import { useTheme } from 'hooks/useTheme';
import { ThemeMode } from 'types/themeTypes';
import { FontWeight, FontSize } from 'types/fontTypes';
import { COLORS, screenHeight, screenWidth, STYLES } from 'utils/index';
import { SVG } from 'constants/assets';

interface SegmentedControlProps {
  options: { label: string; value: ThemeMode }[];
  selectedValue: ThemeMode;
  onValueChange: (value: ThemeMode) => void;
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  selectedValue,
  onValueChange,
}) => {
  return (
    <View style={styles.segmentedContainer}>
      {options.map(option => {
        const isSelected = selectedValue === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.segment,
              isSelected && styles.segmentSelected,
              option.value === 'light' && styles.segmentLeft,
              option.value === 'dark' && styles.segmentRight,
            ]}
            onPress={() => onValueChange(option.value)}
            activeOpacity={0.7}
          >
            <Typography
              style={[styles.segmentText, isSelected && styles.segmentTextSelected]}
              fontWeight={isSelected ? FontWeight.SemiBold : FontWeight.Normal}
            >
              {option.label}
            </Typography>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export const ThemeSelectorScreen = () => {
  const { themeMode, setThemeMode, isDark } = useTheme();

  const themeOptions: { label: string; value: ThemeMode }[] = [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'System', value: 'system' },
  ];

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
  };

  return (
    <Wrapper useScrollView={false}>
      <View style={styles.container}>
        {/* Sun/Moon Icon */}
        <View style={styles.iconContainer}>
          <SvgComponent
            Svg={isDark ? SVG.EARTH : SVG.SUN}
            svgHeight={screenHeight(30)}
            svgWidth={screenWidth(50)}
          />
        </View>

        {/* Title */}
        <Typography style={styles.title}>Choose a style</Typography>

        {/* Description */}
        <Typography style={styles.description}>
          Pop or subtitle. Day or night. Customize your interface.
        </Typography>

        {/* Segmented Control */}
        <View style={styles.controlContainer}>
          <SegmentedControl
            options={themeOptions}
            selectedValue={themeMode}
            onValueChange={handleThemeChange}
          />
        </View>
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 20,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSize.XL,
    color: COLORS.TEXT,
    textAlign: 'center',
    fontWeight: FontWeight.Bold,
  },
  description: {
    fontSize: FontSize.MediumLarge,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: screenHeight(6),
    lineHeight: 22,
    paddingHorizontal: 30,
  },
  controlContainer: {
    width: '100%',
    alignItems: 'center',
  },
  segmentedContainer: {
    flexDirection: 'row',
    borderRadius: 30,
    padding: 4,
    width: screenWidth(80),
    ...STYLES.SHADOW,
    backgroundColor: COLORS.LIGHT_GREY,
  },
  segment: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentLeft: {
    borderTopLeftRadius: 26,
    borderBottomLeftRadius: 26,
  },
  segmentRight: {
    borderTopRightRadius: 26,
    borderBottomRightRadius: 26,
  },
  segmentSelected: {
    backgroundColor: COLORS.BACKGROUND,
  },
  segmentText: {
    fontSize: FontSize.Medium,
    color: COLORS.TEXT_SECONDARY,
  },
  segmentTextSelected: {
    color: COLORS.TEXT,
  },
});
