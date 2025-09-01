import { useEffect, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { Typography } from './Typography';
import { COLORS } from 'utils/colors';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COMMON_TEXT } from 'constants/screens';

export const OfflineBanner = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [slideAnim] = useState(new Animated.Value(-50));

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
  }, [slideAnim]);

  if (isConnected) return null;

  return (
    <Animated.View style={[styles.banner, { transform: [{ translateY: slideAnim }] }]}>
      <Typography style={styles.text}>{COMMON_TEXT.NO_INTERNET_CONNECTION}</Typography>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    backgroundColor: COLORS.DARK_RED,
    padding: 5,
    zIndex: 9999,
    alignItems: 'center',
  },
  text: {
    color: COLORS.WHITE,
    fontWeight: FontWeight.SemiBold,
    fontSize: FontSize.Small,
  },
});
