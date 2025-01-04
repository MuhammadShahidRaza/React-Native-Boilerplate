import {Photo, RowComponent, Typography} from 'components/common';
import {MONTHS, WEEKDAYS, WEEKDAYS_ABBR} from 'constants/common';
import {COMMON_TEXT} from 'constants/screens';
import {Dimensions, NativeModules, Platform} from 'react-native';
import {ChildrenType, voidFuntionType} from 'types/common';
import {User} from 'types/response';
import {COLORS} from 'utils/colors';
import {FLEX_CENTER, STYLES} from 'utils/commonStyles';
// import {getFCMToken} from '..';
// import { getUniqueId } from 'react-native-device-info';
import {IMAGES} from 'constants/assets';

export const screenHeight = (percent: number) => {
  const screenHeight = Dimensions.get('window').height;
  return (screenHeight * percent) / 100;
};

export const screenWidth = (percent: number) => {
  const screenWidth = Dimensions.get('window').width;
  return (screenWidth * percent) / 100;
};

export const fontScale = (percent: number) => {
  const scale = Dimensions.get('window').scale;
  return (scale * percent) / 2;
};

// export const fontScale = (percent: number) => {
//   const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

//   // Base scale based on a standard screen width
//   const BASE_WIDTH = 375; // iPhone 6/7/8 screen width
//   const BASE_HEIGHT = 667; // iPhone 6/7/8 screen height

//   const scaleWidth = SCREEN_WIDTH / BASE_WIDTH;
//   const scaleHeight = SCREEN_HEIGHT / BASE_HEIGHT;

//   const scale = Math.min(scaleWidth, scaleHeight);

//   const newSize = percent * scale;
//   return Math.round(PixelRatio.roundToNearestPixel(newSize));
//   // const scale = Dimensions.get('window').scale;
//   // return (scale * percent) / 2;
// };

export const isIOS = () => {
  const isIOS = Platform.OS === 'ios';
  return isIOS;
};

// export const isAndroid13 = () => {
//   const isAndroid13 = Platform.constants?.Release >= 13;
//   return isAndroid13;
// };

export const deviceType = () => {
  const deviceType = Platform.OS;
  return deviceType;
};
export const deviceUdid = () => {
  // const deviceUdid = getUniqueId();
  const deviceUdid = '';
  return deviceUdid;
};
export const appVersion = () => {
  // const deviceUdid = getUniqueId();
  const appVersion = '';
  return appVersion;
};
export const deviceOS = () => {
  // const deviceUdid = getUniqueId();
  const deviceOS = '';
  return deviceOS;
};
export const deviceBrand = () => {
  // const deviceUdid = getUniqueId();
  const deviceBrand = '';
  return deviceBrand;
};

export const deviceDetails = () => {
  const data = {
    udid: deviceUdid(),
    device_type: deviceType(),
    device_brand: deviceBrand(),
    device_os: deviceOS(),
    app_version: appVersion(),
  };
  return data;
};

export const getDeviceLang = () => {
  const appLanguage = isIOS()
    ? NativeModules.SettingsManager.settings.AppleLocale ||
      NativeModules.SettingsManager.settings.AppleLanguages[0]
    : NativeModules.I18nManager.localeIdentifier;

  return appLanguage.search(/-|_/g) !== -1
    ? appLanguage.slice(0, 2)
    : appLanguage;
};

export const capitalizeFirstCharacter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const greetings = (): string => {
  const hours = new Date().getHours();
  if (hours < 6) {
    return COMMON_TEXT.GREETINGS;
  } else if (hours < 12) {
    return COMMON_TEXT.GOOD_MORNING;
  } else if (hours < 18) {
    return COMMON_TEXT.GOOD_AFTERNOON;
  } else {
    return COMMON_TEXT.GOOD_EVENING;
  }
};

export const getCurrentMonth = () => {
  const now = new Date();
  return Object.values(MONTHS)[now.getMonth()];
};

export const getCurrentDate = () => {
  const now = new Date();
  return now.getDate();
};

export const getHalfWeekdayName = (date: Date) => {
  return Object.values(WEEKDAYS_ABBR)[date.getDay()];
};

export const getWeekdayName = (date: Date) => {
  return Object.values(WEEKDAYS)[date.getDay()];
};

export const getFirstCharactersOfName = (user: User): string => {
  if (!user) return '';
  const firstName = user.first_name ?? '';
  const lastName = user.last_name ?? '';
  return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
};

export const getFullName = (user: User | null): string => {
  if (!user?.first_name) return '';
  const firstName = user.first_name?.trim() ?? '';
  const lastName = user.last_name?.trim() ?? '';
  return `${firstName} ${lastName}`.trim();
};
export const getCityCountry = (user: User | null): string => {
  if (!user?.country || !user?.city) return '';
  const city = user.city?.trim() ?? '';
  const country = user.country?.trim() ?? '';
  return `${city}, ${country}`.trim();
};
export const getUserProfilePicture = (
  user: User | null,
  onPress?: voidFuntionType,
): ChildrenType => {
  if (!user?.first_name) return '';
  if (user?.profile_image) {
    return (
      <Photo
        onPress={onPress}
        source={user?.profile_image ? {uri: user?.profile_image} : IMAGES.USER}
        imageStyle={STYLES.USER_IMAGE}
      />
    );
  } else {
    return (
      <RowComponent
        onPress={onPress}
        style={[
          STYLES.USER_IMAGE,
          FLEX_CENTER,
          {
            backgroundColor: COLORS.PRIMARY,
          },
        ]}>
        <Typography style={{color: COLORS.WHITE}}>
          {getFirstCharactersOfName(user)}
        </Typography>
      </RowComponent>
    );
  }
};
