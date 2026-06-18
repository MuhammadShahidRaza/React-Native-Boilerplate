import { Pressable, StyleSheet, View } from 'react-native';
import { Icon, Typography } from 'components/index';
import { VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS } from 'utils/colors';

type Props = {
  value: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: number;
  title?: string;
  subtitle?: string;
};

export function BookingRatingStars({
  value,
  onChange,
  readonly = false,
  size = 40,
  title,
  subtitle,
}: Props) {
  return (
    <View style={styles.wrap}>
      {title ? <Typography style={styles.title}>{title}</Typography> : null}
      {subtitle ? <Typography style={styles.subtitle}>{subtitle}</Typography> : null}
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map(step => (
          <Pressable
            key={step}
            onPress={readonly ? undefined : () => onChange?.(step)}
            disabled={readonly}
            hitSlop={8}
          >
            <Icon
              componentName={VARIABLES.Ionicons}
              iconName={step <= value ? 'star' : 'star-outline'}
              size={size}
              color={step <= value ? COLORS.APP_STAR : COLORS.APP_LINE}
            />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontWeight: FontWeight.SemiBold,
    color: COLORS.APP_TEXT,
    fontSize: FontSize.Large,
  },
  subtitle: {
    fontSize: FontSize.Small,
    color: COLORS.APP_TEXT_MUTED,
    textAlign: 'center',
  },
  stars: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
});
