import { ScrollView, StyleSheet, Pressable } from 'react-native';
import { Typography } from '../Typography';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS } from 'utils/index';

export interface FilterChipRowProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
}

export function FilterChipRow<T extends string>({ options, value, onChange }: FilterChipRowProps<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      style={styles.scroll}
    >
      {options.map(option => {
        const active = option === value;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={[styles.chip, active && styles.chipOn]}
          >
            <Typography style={[styles.chipTxt, active && styles.chipTxtOn]}>{option}</Typography>
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
    paddingVertical: 4,
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.APP_LINE,
    marginRight: 8,
    backgroundColor: COLORS.WHITE,
  },
  chipOn: {
    backgroundColor: COLORS.APP_PRIMARY,
    borderColor: COLORS.APP_PRIMARY,
  },
  chipTxt: {
    color: COLORS.APP_TEXT_MUTED,
    fontWeight: FontWeight.Bold,
    fontSize: FontSize.Small,
  },
  chipTxtOn: {
    color: COLORS.WHITE,
  },
});
