import { ScrollView, StyleSheet, Pressable } from 'react-native';
import { Typography } from '../Typography';
import { FontSize, FontWeight } from 'types/fontTypes';
import { BRAND_PRIMARY, BRAND_SECONDARY, COLORS } from 'utils/index';
import { AppGradient, GRADIENT_END, GRADIENT_START } from '../AppGradient';

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
            style={[styles.chipPress, active ? styles.chipPressActive : styles.chipInactive]}
            accessibilityRole='button'
            accessibilityState={{ selected: active }}
          >
            {active ? (
              <AppGradient
                colors={[BRAND_SECONDARY, BRAND_PRIMARY]}
                start={GRADIENT_START}
                end={GRADIENT_END}
                fill
                style={styles.chipGradient}
                pointerEvents='none'
              />
            ) : null}
            <Typography style={[active ? styles.chipTxtOn : styles.chipTxt, styles.chipLabel]}>
              {option}
            </Typography>
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
  contentCentered: {},
  chipPress: {
    marginRight: 8,
  },
  chipPressActive: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 50,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  chipGradient: {
    ...StyleSheet.absoluteFill,
    borderRadius: 50,
  },
  chipLabel: {
    zIndex: 1,
  },
  chipInactive: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 50,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.APP_LINE,
    backgroundColor: COLORS.WHITE,
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
