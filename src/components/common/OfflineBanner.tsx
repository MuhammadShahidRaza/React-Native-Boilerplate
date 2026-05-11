import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { Typography } from './Typography';
import { COLORS } from 'utils/colors';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COMMON_TEXT } from 'constants/screens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const OfflineBanner = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [slideAnim] = useState(new Animated.Value(-50));
  const insetBottom = useSafeAreaInsets().bottom;

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        setIsConnected(true);
        Animated.timing(slideAnim, {
          toValue: -50, // slide up (hide)
          duration: 300,
          useNativeDriver: true,
        }).start();
      } else {
        setIsConnected(false);
        Animated.timing(slideAnim, {
          toValue: 0, // slide down (show)
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    });

    return () => unsubscribe();
  }, []); // slideAnim is stable and doesn't need to be in dependencies

  if (isConnected) return null;

  return (
    <Animated.View
      style={[styles.banner, { transform: [{ translateY: slideAnim }], bottom: insetBottom }]}
    >
      <View style={styles.bannerInner}>
        <Typography style={styles.text}>{COMMON_TEXT.NO_INTERNET_CONNECTION}</Typography>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 12,
    marginHorizontal: 12,
    borderRadius: 14,
    overflow: 'hidden',
    minHeight: 36,
    zIndex: 9999,
    backgroundColor: 'rgba(180, 32, 32, 0.9)',
  },
  bannerInner: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    zIndex: 2,
  },
  text: {
    color: COLORS.WHITE,
    fontWeight: FontWeight.SemiBold,
    fontSize: FontSize.Small,
  },
});
