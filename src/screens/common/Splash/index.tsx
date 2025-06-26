import { StatusBar, StyleSheet, View } from 'react-native';
import { VIDEO } from 'constants/assets';
import Video from 'react-native-video';
import { screenHeight, screenWidth } from 'utils/helpers';
import { COLORS } from 'utils/colors';
import { useEffect, useState } from 'react';

export const Splash = () => {
  const [paused, setPaused] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPaused(false);
    }, 1000); 
    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: paused ? COLORS.SECONDARY : COLORS.WHITE }]}>
      <StatusBar backgroundColor={COLORS.SECONDARY} barStyle='light-content' />
      <Video source={VIDEO.SPLASH} paused={paused} style={styles.video} resizeMode='cover' />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  video: {
    width: screenWidth(100),
    height: screenHeight(100),
  },
});
