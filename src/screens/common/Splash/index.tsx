import { StatusBar, StyleSheet, View } from 'react-native';
import { screenHeight, screenWidth, COLORS } from 'utils/index';

export const Splash = () => {
  return (
    <View style={[styles.container, { backgroundColor: COLORS.SECONDARY }]}>
      <StatusBar backgroundColor={COLORS.SECONDARY} barStyle='light-content' />
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
