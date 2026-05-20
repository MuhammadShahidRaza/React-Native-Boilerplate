import { StyleSheet, View } from 'react-native';
import LottieView from 'lottie-react-native';
import { screenHeight } from 'utils/index';

const COOKING_ANIMATION = require('assets/animations/cooking.json');

export const FoodPreparingAnimation = () => (
  <View style={styles.wrap}>
    <LottieView source={COOKING_ANIMATION} autoPlay loop style={styles.lottie} />
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    height: screenHeight(22),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
  },
  lottie: {
    width: screenHeight(20),
    height: screenHeight(20),
  },
});
