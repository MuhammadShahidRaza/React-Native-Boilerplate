import { View, StyleSheet, TextStyle } from 'react-native';
import { COMMON_TEXT } from 'constants/index';
import { COLORS, screenHeight } from 'utils/index';
import { Typography } from './Typography';

type Props = {
  message?: string;
  messageStyle?: TextStyle;
  containerHeight?: number;
  containerWidth?: number;
};
const NoItemFound = ({
  message = COMMON_TEXT.NO_ITEM_FOUND,
  messageStyle,
  containerHeight = screenHeight(20),
  containerWidth,
}: Props) => {
  return (
    <View style={[styles.container, { height: containerHeight, width: containerWidth }]}>
      <Typography style={[styles.message, messageStyle]}>{message}</Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    color: COLORS.PRIMARY,
    textAlign: 'center',
  },
});

export default NoItemFound;
