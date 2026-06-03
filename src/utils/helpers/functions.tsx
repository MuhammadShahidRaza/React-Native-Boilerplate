import { Photo, RowComponent, Typography } from 'components/common';
import { ENV_CONSTANTS, MONTHS, WEEKDAYS, WEEKDAYS_ABBR } from 'constants/common';
import { COMMON_TEXT } from 'constants/screens';
import { Alert, Dimensions, NativeModules, Platform, PixelRatio } from 'react-native';
import { ChildrenType, voidFuntionType } from 'types/common';
import { User } from 'types/responseTypes';
import { COLORS } from 'utils/colors';
import { FLEX_CENTER, STYLES } from 'utils/commonStyles';
import { getUniqueId, getVersion, getBrand } from 'react-native-device-info';
import { IMAGES } from 'constants/assets';
import parsePhoneNumber from 'libphonenumber-js';
import { getFCMToken } from 'utils/notifications';
import NetInfo from '@react-native-community/netinfo';
import { showToast } from 'utils/toast';
import { logger } from 'utils/logger';
import { SelectedMedia } from 'hooks/useMediaPicker';

export const initNetworkListener = () => {
  NetInfo.addEventListener(state => {
    if (!state.isConnected) {
      showToast({ message: '📴 No Internet Connection' });
    } else {
      showToast({ message: '✅ Back Online', isError: false });
    }
  });
};

type PhoneValues = {
  phone_number?: string;
  country_code?: string;
  calling_code?: string;
};

/** Returns a normalized phone payload ready to send to the API. */
export const buildPhonePayload = (values: PhoneValues) => {
  const phone = normalizePhoneNumber(values.phone_number ?? '', values.calling_code);
  return {
    phone,
    phone_number: phone,
    country_code: values.country_code ?? '',
    calling_code: values.calling_code ?? '',
  };
};

export const normalizePhoneNumber = (
  phone_number: string,
  calling_code?: string | null,
): string => {
  const normalizedCode = (calling_code || '').replace(/\+/g, '').trim();

  // Remove all non-digit characters from phone number
  const digitsOnlyPhone = phone_number.replace(/\D/g, '');

  if (!normalizedCode) {
    // No valid calling code provided, return just the digits
    return `+${digitsOnlyPhone}`;
  }

  // If phone already starts with the calling code, return with +
  if (digitsOnlyPhone.startsWith(normalizedCode)) {
    return `+${digitsOnlyPhone}`;
  }

  // Otherwise, prepend the calling code
  return `+${normalizedCode}${digitsOnlyPhone}`;
};

/** National number for phone input display (Profile, Edit Profile, etc.). */
export function getDisplayPhoneNumber(
  user: { phone_number?: string | null; phone?: string | null; calling_code?: string | null } | null | undefined,
) {
  const raw = user?.phone_number ?? user?.phone ?? '';
  if (!raw) return '';
  const withPlus = raw.startsWith('+') ? raw : `${user?.calling_code ?? '+1'}${raw}`;
  const parsed = splitPhoneNumberWithCode(withPlus);
  return parsed?.number || raw.replace(/\D/g, '');
}

export function splitPhoneNumberWithCode(phoneNumber: string | null | undefined) {
  try {
    const parsed = parsePhoneNumber(phoneNumber ?? '');
    return {
      countryCode: '+' + parsed?.countryCallingCode,
      number: parsed?.nationalNumber,
    };
  } catch {
    return {
      countryCode: '',
      number: phoneNumber,
    };
  }
}

export const openCameraOrGallery = ({
  cameraPress,
  galleryPress,
}: {
  cameraPress: voidFuntionType;
  galleryPress: voidFuntionType;
}) => {
  Alert.alert(
    'Choose Option',
    'Select an option to upload a photo',
    [
      {
        text: 'Camera',
        onPress: cameraPress,
      },
      {
        text: 'Gallery',
        onPress: galleryPress,
      },
      { text: 'Cancel', style: 'cancel' },
    ],
    { cancelable: true },
  );
};

export const formatEventDateTimeRange = ({
  date,
  startTime,
  endTime,
}: {
  date?: string;
  startTime?: string;
  endTime?: string;
}): string => {
  if (!date || !startTime) return '';

  const getDateWithTime = (baseDate: string, time: string) => {
    try {
      const base = new Date(baseDate);
      if (isNaN(base.getTime())) return null;

      const [hours, minutes, seconds] = time.split(':').map(Number);
      base.setHours(hours || 0);
      base.setMinutes(minutes || 0);
      base.setSeconds(seconds || 0);
      return base;
    } catch {
      return null;
    }
  };

  const formatTime = (date: Date) =>
    date
      .toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
      .replace(':', '.')
      .toLowerCase(); // 8.00 pm

  const formatDate = (date: Date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const startDate = getDateWithTime(date, startTime);
  if (!startDate) return '';

  const endDate = endTime ? getDateWithTime(date, endTime) : null;

  const formattedDate = formatDate(startDate);
  const formattedStartTime = formatTime(startDate);
  const formattedEndTime = endDate ? formatTime(endDate) : '';

  return formattedEndTime
    ? `${formattedDate}, ${formattedStartTime} - ${formattedEndTime}`
    : `${formattedDate}, ${formattedStartTime}`;
};

export const safeString = (val?: string | number | null | undefined): string =>
  val != null ? String(val) : '';

/** Get address string from User.address (object or string) */
export const getUserAddressString = (
  addr?:
    | {
        full_address?: string | null;
        street?: string;
        city?: string;
        state?: string;
        country?: string;
        postal_code?: string;
      }
    | string
    | null,
): string => {
  if (!addr) return '';
  if (typeof addr === 'string') return addr;
  const parts = [addr?.street, addr?.city, addr?.state, addr?.country, addr?.postal_code]
    .filter(Boolean)
    .join(', ');
  return (addr?.full_address ?? parts) || greetings();
};
export const safeNumber = (val?: number | null): number => val ?? 0;

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

// Responsive font size configuration
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Use whichever is smaller, width or height
const SCALE = SCREEN_WIDTH > SCREEN_HEIGHT ? SCREEN_HEIGHT : SCREEN_WIDTH;

// Base width for scaling calculations
const BASE_WIDTH = 375;

// Configuration object for fine-tuning text sizes
// Adjusted for pixel-perfect rendering across devices
const fontConfig = {
  phone: {
    small: { min: 0.85, max: 0.95 },
    medium: { min: 0.9, max: 1.0 },
    large: { min: 0.95, max: 1.05 },
  },
  tablet: {
    small: { min: 1.2, max: 1.3 },
    medium: { min: 1.3, max: 1.4 },
    large: { min: 1.4, max: 1.5 },
  },
};

/**
 * Helper function to get device type (phone or tablet)
 */
export const getDeviceType = (): 'phone' | 'tablet' => {
  const pixelDensity = PixelRatio.get();
  const adjustedWidth = SCREEN_WIDTH * pixelDensity;
  const adjustedHeight = SCREEN_HEIGHT * pixelDensity;

  if (pixelDensity < 2 && (adjustedWidth >= 1000 || adjustedHeight >= 1000)) {
    return 'tablet';
  } else if (pixelDensity === 2 && (adjustedWidth >= 1920 || adjustedHeight >= 1920)) {
    return 'tablet';
  } else {
    return 'phone';
  }
};

/**
 * Helper function to determine screen size category
 */
const getScreenSizeCategory = (): 'small' | 'medium' | 'large' => {
  if (SCALE < 350) return 'small';
  if (SCALE > 500) return 'large';
  return 'medium';
};

/**
 * Get responsive font size that adapts to device size and system font scaling
 * Pixel-perfect rendering across all devices
 * @param baseSize - Base font size from FontSize enum
 * @returns Responsive font size that adapts to screen size and accessibility settings
 */
export const getResponsiveFontSize = (size: number): number => {
  const deviceType = getDeviceType();
  const screenCategory = getScreenSizeCategory();
  const config = fontConfig[deviceType][screenCategory];

  // Calculate the scale factor based on screen width
  const scaleFactor = SCALE / BASE_WIDTH;

  // Clamp the scale factor between the configured min and max
  const clampedScaleFactor = Math.min(Math.max(scaleFactor, config.min), config.max);

  // Calculate the base responsive size
  let newSize = size * clampedScaleFactor;

  // Platform-specific adjustments for pixel-perfect rendering
  // Android renders fonts larger, iOS renders them smaller
  if (Platform.OS === 'android') {
    // Reduce Android font sizes for better balance
    newSize *= 0.85; // 15% reduction for Android
  } else {
    // Increase iOS font sizes for better readability
    newSize *= 1.15; // 15% increase for iOS
  }

  // Additional scaling for tablets
  if (deviceType === 'tablet') {
    newSize *= 1.08; // 8% additional boost for tablets
  }

  // Round to nearest pixel for crisp rendering
  const finalSize = PixelRatio.roundToNearestPixel(newSize);

  // Clamp to reasonable bounds (before system font scaling)
  // iOS: min 10px, Android: min 9px
  // Note: System font scaling will be handled by React Native's allowFontScaling
  const minSize = Platform.OS === 'ios' ? 10 : 9;

  return Math.max(minSize, finalSize);
};

/**
 * Function to adjust font configuration at runtime if needed
 */
export const adjustFontConfig = (
  deviceType: 'phone' | 'tablet',
  sizeCategory: 'small' | 'medium' | 'large',
  minScale: number,
  maxScale: number,
) => {
  fontConfig[deviceType][sizeCategory] = { min: minScale, max: maxScale };
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

// Helper function to split title: 2 words on first line, rest on second line
export const formatTitle = (text: string, firstLineWords: number = 2): string => {
  const words = text.split(' ');
  if (words.length <= 2) {
    return text;
  }
  // First 2 words on first line, rest on second line
  const firstLine = words.slice(0, firstLineWords).join(' ');
  const secondLine = words.slice(firstLineWords).join(' ');
  return `${firstLine}\n${secondLine}`;
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);

  const datePart = formatDateMonthDayYear(date);
  const timePart = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `${datePart} ${timePart}`;
};

/**
 * Format date as MM/DD/YYYY (American format)
 * @param dateInput - Date string, Date object, or timestamp
 * @returns Formatted date string in MM/DD/YYYY format
 */
export const formatDateMonthDayYear = (
  dateInput: string | Date | number | null | undefined,
): string => {
  if (!dateInput) return '';

  try {
    const date =
      typeof dateInput === 'string' || typeof dateInput === 'number'
        ? new Date(dateInput)
        : dateInput;

    if (isNaN(date.getTime())) return '';

    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  } catch (error) {
    logger.error('Error formatting date:', error);
    return '';
  }
};

export const isIOS = () => {
  const isIOS = Platform.OS === 'ios';
  return isIOS;
};

export const roundToNearestHalf = (num: number) => {
  return Math.round(num * 2) / 2;
};
// export const isAndroid13 = () => {
//   const isAndroid13 = Platform.constants?.Release >= 13;
//   return isAndroid13;
// };

export const deviceType = () => {
  const deviceType = Platform.OS;
  return deviceType;
};
export const deviceUdid = async () => {
  const deviceUdid = await getUniqueId();
  return deviceUdid;
};
export const appVersion = () => {
  const appVersion = getVersion();
  return appVersion;
};
export const deviceOS = () => {
  const deviceOS = Platform.OS;
  return deviceOS;
};
export const deviceBrand = () => {
  const deviceBrand = getBrand();
  return deviceBrand;
};

export const deviceDetails = async () => {
  const data = {
    udid: await getUniqueId(),
    device_type: deviceType(),
    device_brand: deviceBrand(),
    device_os: deviceOS(),
    app_version: appVersion(),
    device_token: ENV_CONSTANTS.IS_ALPHA_PHASE ? 'temp_token' : await getFCMToken(),
  };

  return data;
};

export const getDeviceLang = () => {
  const appLanguage = isIOS()
    ? NativeModules.SettingsManager.settings.AppleLocale ||
      NativeModules.SettingsManager.settings.AppleLanguages[0]
    : NativeModules.I18nManager.localeIdentifier;

  return appLanguage.search(/-|_/g) !== -1 ? appLanguage.slice(0, 2) : appLanguage;
};

export const capitalizeFirstCharacter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const hasUri = (v: unknown): v is SelectedMedia =>
  !!v && typeof v === 'object' && !!(v as SelectedMedia)?.uri;

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
export const getCurrentDay = () => {
  const now = new Date();
  return now.getDay();
};

export const getHalfWeekdayName = (date: Date) => {
  return Object.values(WEEKDAYS_ABBR)[date.getDay()];
};

export const getWeekdayName = (date: Date) => {
  return Object.values(WEEKDAYS)[date.getDay()];
};

type DentorBookingItem = {
  user_id?: number;
  user?: User;
  dentor?: User;
  quotations?: Array<{ status?: string; user?: User }>;
  booking_assignments?: Array<{ dentor?: User }>;
};

/** Get dentor (service provider) from booking - for user's Add Review flow. Excludes current user when API returns wrong structure. */
export const getDentorFromBooking = (
  item: DentorBookingItem | null,
  excludeUserId?: number,
): User | undefined => {
  if (!item) return undefined;
  const isExcluded = (u: User | undefined) =>
    !u || (excludeUserId != null && u.id === excludeUserId);

  const candidates: (User | undefined)[] = [
    item.dentor,
    item.quotations?.find(q => q.status === 'accepted')?.user,
    item.quotations?.[0]?.user,
    item.booking_assignments?.[0]?.dentor,
  ];
  return candidates.find(u => u && !isExcluded(u)) as User | undefined;
};

/** Get booking price from item.price or quotations (accepted first, else first) */
export const getBookingPrice = (
  item: {
    price?: number | string;
    quotations?: Array<{ amount?: number | string; status?: string }>;
  } | null,
): string | number | undefined => {
  if (!item) return undefined;
  if (item.price != null && item?.price !== '') return item.price;
  const accepted = item?.quotations?.find(q => q.status === 'accepted');
  if (accepted?.amount != null) return accepted.amount;
  return item.quotations?.[0]?.amount;
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
        source={user?.profile_image ? { uri: user?.profile_image } : IMAGES.USER}
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
        ]}
      >
        <Typography style={{ color: COLORS.TEXT }}>{getFirstCharactersOfName(user)}</Typography>
      </RowComponent>
    );
  }
};
