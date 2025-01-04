import {isIOS} from 'utils/index';

export const FONT_FAMILY = {
  GORDITA: {
    BLACK: isIOS() ? 'Gordita-Black' : 'GorditaBlack',
    BOLD: isIOS() ? 'Gordita-Bold' : 'GorditaBold',
    MEDIUM: isIOS() ? 'Gordita-Medium' : 'GorditaMedium',
    REGULAR: isIOS() ? 'Gordita-Regular' : 'GorditaRegular',
    LIGHT: isIOS() ? 'Gordita-Light' : 'GorditaLight',
  },
};
