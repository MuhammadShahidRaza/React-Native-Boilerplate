import {View, ActivityIndicator, ViewStyle, StyleSheet} from 'react-native';
import {COLORS, screenHeight, screenWidth} from 'utils/index';

interface LoaderProps {
  containerStyle?: ViewStyle;
}

export const Loader: React.FC<LoaderProps> = ({containerStyle}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <ActivityIndicator color={COLORS.WHITE} size={'large'} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    height: screenHeight(100),
    width: screenWidth(100),
    backgroundColor: COLORS.SECONDARY,
    opacity: 0.5,
    zIndex: 999,
    elevation: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
