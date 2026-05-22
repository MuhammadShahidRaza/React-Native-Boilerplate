import { useEffect, useRef } from 'react';
import { Animated, Easing, Image, ImageSourcePropType, StyleSheet } from 'react-native';
import { AppGradient, GRADIENT_END, GRADIENT_START } from '../AppGradient';
import { GradientIcon } from '../GradientIcon';
import { Typography } from '../Typography';
import type { IconComponentProps } from '../Icon';
import { FontSize, FontWeight } from 'types/fontTypes';
import { BRAND_PRIMARY, BRAND_SECONDARY, COLORS } from 'utils/index';

export interface RideAnimatedStatusBlockProps {
  animationKey: string;
  iconProps?: Pick<IconComponentProps, 'componentName' | 'iconName' | 'size' | 'color'>;
  imageSource?: ImageSourcePropType;
  title: string;
  subtitle: string;
}

export const RideAnimatedStatusBlock = ({
  animationKey,
  iconProps,
  imageSource,
  title,
  subtitle,
}: RideAnimatedStatusBlockProps) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    opacity.setValue(0);
    translateY.setValue(10);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [animationKey, opacity, translateY]);

  return (
    <Animated.View
      style={[styles.statusWrap, { opacity, transform: [{ translateY }] }]}
      key={animationKey}
    >
      {imageSource ? (
        <AppGradient
          colors={[BRAND_SECONDARY, BRAND_PRIMARY]}
          start={GRADIENT_START}
          end={GRADIENT_END}
          fill
          style={styles.iconCircle}
        >
          <Image source={imageSource} style={styles.checkImage} resizeMode='contain' />
        </AppGradient>
      ) : iconProps ? (
        <GradientIcon
          {...iconProps}
          color={iconProps.color ?? COLORS.WHITE}
          size={iconProps.size ?? 36}
          containerSize={88}
          borderRadius={44}
        />
      ) : null}
      <Typography style={styles.statusTitle}>{title}</Typography>
      <Typography style={styles.statusSub}>{subtitle}</Typography>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  statusWrap: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: FontSize.ExtraLarge,
    fontWeight: FontWeight.SemiBold,
    color: COLORS.APP_TEXT,
    textAlign: 'center',
    marginTop: 12,
  },
  statusSub: {
    fontSize: FontSize.MediumSmall,
    color: COLORS.APP_TEXT_SMALL,
    textAlign: 'center',
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  checkImage: {
    width: 42,
    height: 42,
    tintColor: COLORS.WHITE,
  },
});
