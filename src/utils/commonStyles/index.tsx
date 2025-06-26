import { ViewStyle } from 'react-native';
import { COLORS } from 'utils/colors';

export const FLEX_BETWEEN: ViewStyle = {
  alignItems: 'center',
  justifyContent: 'space-between',
};

export const FLEX_CENTER: ViewStyle = {
  alignItems: 'center',
  justifyContent: 'center',
};
export const FLEX_END: ViewStyle = {
  alignItems: 'center',
  justifyContent: 'flex-end',
};

export const FLEX_ROW: ViewStyle = {
  alignItems: 'center',
  flexDirection: 'row',
};

export const CENTER: ViewStyle = {
  alignItems: 'center',
};

export const STYLES = {
  CONTAINER: {
    marginHorizontal: 20,
  },
  SHADOW: {
    elevation: 2,
    shadowColor: COLORS.BLACK,
    backgroundColor: COLORS.WHITE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  TEXT_SHADOW: {
    textShadowColor: COLORS.DARK_BLACK_OPACITY,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  USER_IMAGE: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  LINE_SPACE: {
    height: 10,
  },
  GAP_2: {
    gap: 2,
  },
  GAP_5: {
    gap: 5,
  },
  GAP_10: {
    gap: 10,
  },
  GAP_20: {
    gap: 20,
  },
  GAP_15: {
    gap: 15,
  },
  GAP_12: {
    gap: 12,
  },
  GAP_25: {
    gap: 25,
  },
};
