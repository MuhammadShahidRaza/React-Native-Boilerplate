import { ScrollView, StyleSheet, Pressable, View } from 'react-native';
import { Typography } from '../Typography';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS } from 'utils/index';
import { AppGradient } from '../AppGradient';

export interface FilterChipRowProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
}

export function FilterChipRow<T extends string>({
  options,
  value,
  onChange,
}: FilterChipRowProps<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.content, styles.contentCentered]}
      style={styles.scroll}
    >
      {options.map(option => {
        const active = option === value;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={styles.chipPress}
            accessibilityRole='button'
            accessibilityState={{ selected: active }}
          >
            {active ? (
              <AppGradient variant='primaryLight' style={styles.chip}>
                <Typography style={styles.chipTxtOn}>{option}</Typography>
              </AppGradient>
            ) : (
              <View style={[styles.chip, styles.chipInactive]}>
                <Typography style={styles.chipTxt}>{option}</Typography>
              </View>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  contentCentered: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  chipPress: {
    marginRight: 8,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 50,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipInactive: {
    borderWidth: 1,
    borderColor: COLORS.APP_LINE,
    backgroundColor: COLORS.WHITE,
  },
  chipOn: {
    borderWidth: 0,
  },
  chipTxt: {
    color: COLORS.APP_TEXT_MUTED,
    fontWeight: FontWeight.SemiBold,
    fontSize: FontSize.MediumSmall,
    textAlign: 'center',
  },
  chipTxtOn: {
    color: COLORS.WHITE,
    fontWeight: FontWeight.SemiBold,
    fontSize: FontSize.MediumSmall,
    textAlign: 'center',
  },
});
