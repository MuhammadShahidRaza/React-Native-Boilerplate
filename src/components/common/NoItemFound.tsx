import { View, StyleSheet, TextStyle, Image, ImageSourcePropType } from 'react-native';
import { COMMON_TEXT, IMAGES } from 'constants/index';
import { COLORS, screenHeight } from 'utils/index';
import { Typography } from './Typography';

const LOGO_SIZE = 300;

export type NoItemFoundProps = {
  message?: string;
  messageStyle?: TextStyle;
  containerHeight?: number;
  containerWidth?: number;
  logoSource?: ImageSourcePropType;
  showImage?: boolean;
};
const NoItemFound = ({
  message = COMMON_TEXT.NO_RESULTS,
  messageStyle,
  containerHeight = screenHeight(50),
  containerWidth,
  logoSource = IMAGES.NO_DATA_FOUND,
  showImage = false,
}: NoItemFoundProps) => {
  return (
    <View style={[styles.container, { height: containerHeight, width: containerWidth }]}>
      {/* {showImage && ( */}
      {showImage && (
        <Image
          source={logoSource}
          style={styles.logo}
          resizeMode='contain'
          accessibilityLabel='No data'
        />
      )}
      {/* )} */}
      {message && <Typography style={[styles.message, messageStyle]}>{message}</Typography>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 15,
  },
  logo: {
    width: LOGO_SIZE - 100,
    height: LOGO_SIZE - 100,
  },
  message: {
    color: COLORS.PRIMARY,
    textAlign: 'center',
  },
});

export default NoItemFound;
