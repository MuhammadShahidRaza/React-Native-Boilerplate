import {
  CommonActions,
  createNavigationContainerRef,
  StackActions,
} from '@react-navigation/native';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { GradientIcon } from 'components/index';
import { Pressable, StyleProp, ViewStyle } from 'react-native';
import { SCREENS } from 'constants/routes';
import i18n from 'i18n/index';
import { LANGUAGES, VARIABLES } from 'constants/common';
import { JobStatus } from 'screens/user/MyJobs';
import { Address, Booking, Service, FontSize, FontWeight, User } from 'types/index';
import type { FoodOrderPhase } from 'types/foodOrderTracking';
import type { ParcelTrackPhase, ParcelTripCoords } from 'types/parcelTrip';
import type { RideTrackPhase } from 'types/rideTracking';
import { COLORS } from 'utils/colors';

export type RootStackParamList = {
  // User Screens
  [SCREENS.HOME]: undefined;
  [SCREENS.CART]: undefined;
  [SCREENS.NOTIFICATIONS]: undefined;
  [SCREENS.NOTIFICATION_LISTING]: undefined;
  [SCREENS.PROFILE]: undefined;
  [SCREENS.ADD_CARD]: undefined;
  [SCREENS.THEME_SELECTOR]: undefined;
  [SCREENS.BOTTOM_STACK]:
    | {
        screen?: string;
        params?: Record<string, any>;
      }
    | undefined;
  [SCREENS.SETTINGS]: undefined;
  [SCREENS.WALLET]: undefined;
  [SCREENS.HELP]: undefined;
  [SCREENS.ICON_SELECTOR]: undefined;
  [SCREENS.CHANGE_PASSWORD]: undefined;
  [SCREENS.ABOUT]: undefined;
  [SCREENS.CONTACT_US]: undefined;
  [SCREENS.REVIEWS]: { userId?: number };
  [SCREENS.CHAT_SOCKET]: undefined;
  [SCREENS.CHAT_FIREBASE]: undefined;
  [SCREENS.FAQ]: undefined;
  [SCREENS.TASKS]: undefined;
  [SCREENS.SHOP]: undefined;
  [SCREENS.CART]: undefined;
  [SCREENS.MESSAGES_FIREBASE]: {
    data?: {
      conversationId?: string;
      otherUserId?: number | string;
      otherUser?: { id?: number; full_name?: string; profile_image?: string | null };
      initialOtherUser?: { full_name?: string; first_name?: string; profile_image?: string | null };
      bookingId?: number | string;
    };
  };
  [SCREENS.MESSAGES_SOCKET]: {
    data: {
      conversationId?: string;
      otherUser?: User;
    };
  };
  [SCREENS.FAVORITES]: undefined;
  [SCREENS.CHECKOUT]: undefined;
  [SCREENS.EDIT_PROFILE]: undefined;
  [SCREENS.LANGUAGE]: undefined;
  [SCREENS.LOCATION]: undefined;
  [SCREENS.LOCATION_MAP_PICKER]: {
    editAddress?: Address;
    addNewAddress?: boolean;
  };
  [SCREENS.LOCATION_ADD_DETAILS]: {
    address: {
      fullAddress: string;
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      latitude: number;
      longitude: number;
      addressId?: number;
    };
  };
  [SCREENS.TERMS_AND_CONDITIONS]: undefined;
  [SCREENS.ORDERS]: undefined;
  [SCREENS.FILTER]: {
    data: {
      heading: string;
    };
  };
  [SCREENS.PRIVACY_POLICY]: { title: string };
  [SCREENS.PAYMENTS]: undefined;
  [SCREENS.INVOICES]: undefined;
  [SCREENS.ADD_REVIEW]: {
    isNotEditable?: boolean;
    bookingId?: number;
    userToReview?: User;
    booking?: Booking;
    review?: { rating: number; comment: string };
  };
  [SCREENS.TIP_DENTOR]: {
    bookingId?: number;
    userToTip?: User;
    booking?: Booking;
  };
  [SCREENS.DOCUMENTATION_UPLOAD]: {
    isFromSettings?: boolean;
  };
  [SCREENS.JOB_DETAIL]: {
    jobId?: number;
    serviceType?: string;
    subType?: string;
    status?: string;
  };
  [SCREENS.PROOF_OF_VERIFICATION]: {
    isEditable: boolean;
    bookingId?: number;
  };
  [SCREENS.BOOK_SERVICE_PROVIDER]: {
    service: Service;
  };
  [SCREENS.ALL_BIDS]: {
    data: {
      jobId?: number;
    };
  };
  [SCREENS.TRANSACTION_HISTORY]: undefined;
  [SCREENS.MY_WALLET]: undefined;
  [SCREENS.SERVICE_TYPE]: undefined;
  [SCREENS.ACTIVITIES]: {};
  [SCREENS.MY_JOBS]: {
    selectedTab?: JobStatus;
  };

  [SCREENS.RIDE_LOCATION_PICKER]: {
    field: 'pickup' | 'dropoff';
    storedPickup?: { fullAddress: string; postalCode: string; street: string; city: string; state: string; country: string; latitude: number; longitude: number };
    storedDropoff?: { fullAddress: string; postalCode: string; street: string; city: string; state: string; country: string; latitude: number; longitude: number };
  } | undefined;
  [SCREENS.BOOK_RIDE]: {
    pickedAddress?: {
      fullAddress: string; postalCode: string; street: string; city: string;
      state: string; country: string; latitude: number; longitude: number;
    };
    pickerField?: 'pickup' | 'dropoff';
    storedPickup?: { fullAddress: string; postalCode: string; street: string; city: string; state: string; country: string; latitude: number; longitude: number };
    storedDropoff?: { fullAddress: string; postalCode: string; street: string; city: string; state: string; country: string; latitude: number; longitude: number };
  } | undefined;
  [SCREENS.CHOOSE_RIDE]: {
    pickupAddress?: string;
    dropoffAddress?: string;
    pickupLat?: number;
    pickupLng?: number;
    dropoffLat?: number;
    dropoffLng?: number;
  } | undefined;
  [SCREENS.FINDING_DRIVER]: {
    rideType?: string;
    pickupAddress?: string;
    dropoffAddress?: string;
    pickupLat?: number;
    pickupLng?: number;
    dropoffLat?: number;
    dropoffLng?: number;
  } | undefined;
  [SCREENS.DRIVER_FOUND]: {
    pickupLat?: number;
    pickupLng?: number;
    dropoffLat?: number;
    dropoffLng?: number;
  } | undefined;
  [SCREENS.TRACK_RIDE]:
    | {
        phase?: RideTrackPhase;
        pickupLat?: number;
        pickupLng?: number;
        dropoffLat?: number;
        dropoffLng?: number;
      }
    | undefined;
  [SCREENS.SEND_PARCEL]: undefined;
  [SCREENS.SEND_PARCEL_FINDING]: {
    pickupLat?: number;
    pickupLng?: number;
    dropoffLat?: number;
    dropoffLng?: number;
  } | undefined;
  [SCREENS.COURIER_MATCHED]: ParcelTripCoords | undefined;
  [SCREENS.TRACK_PARCEL]: (ParcelTripCoords & { phase?: ParcelTrackPhase }) | undefined;
  [SCREENS.ORDER_FOOD]: undefined;
  [SCREENS.RESTAURANT_MENU]: { restaurantId?: string; name?: string } | undefined;
  [SCREENS.FOOD_DELIVERY_CART]: undefined;
  [SCREENS.TRACK_FOOD_ORDER]: { phase?: FoodOrderPhase } | undefined;
  [SCREENS.WORKER_RIDE_HISTORY]: undefined;
  [SCREENS.WORKER_EARNINGS]: undefined;
  [SCREENS.WORKER_LOOKING_FOR_DELIVERIES]: undefined;
  [SCREENS.WORKER_REQUESTS]: undefined;
  [SCREENS.WORKER_REQUEST_DETAIL]: { requestId: string };
  [SCREENS.WORKER_JOB_NAVIGATION]: { requestId: string; phase?: 'pickup' | 'dropoff' };
  [SCREENS.WORKER_JOB_COMPLETED]: { requestId: string };

  // Auth Screens
  [SCREENS.GET_STARTED]: undefined;
  [SCREENS.ONBOARDING]: undefined;
  [SCREENS.LOGIN]: undefined;
  [SCREENS.COMPLETE_PROFILE]: {
    isFromSettings?: boolean;
  };
  [SCREENS.PROFESSIONAL_DETAILS]: {
    isFromSettings?: boolean;
  };
  [SCREENS.VEHICLE_DETAILS]: {
    isFromSettings?: boolean;
  };
  [SCREENS.SIGN_UP]: undefined;
  [SCREENS.FORGOT_PASSWORD]: undefined;
  [SCREENS.RESET_PASSWORD]: {
    data:
      | {
          email?: string;
          phone_number?: string;
          country_code?: string;
          calling_code?: string;
          otp_code?: string;
        }
      | undefined;
  };
  [SCREENS.VERIFICATION]: {
    isFromForgot?: boolean;
    email?: string;
    phone_number?: string;
    country_code?: string;
    calling_code?: string;
  };
};

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigate<T extends keyof RootStackParamList>(
  name: T,
  params?: RootStackParamList[T],
) {
  if (navigationRef.isReady()) {
    (navigationRef.navigate as any)(name, params);
  }
}

export function onBack() {
  navigationRef.current?.goBack();
}

/** Pop multiple screens (e.g. finish LocationMapPicker → LocationAddDetails flow). */
export function pop(count = 1) {
  if (count <= 0 || !navigationRef.isReady()) return;
  navigationRef.current?.dispatch(StackActions.pop(count));
}

export function replace<T extends keyof RootStackParamList>(
  name: T,
  params?: RootStackParamList[T],
) {
  navigationRef.current?.dispatch(StackActions.replace(name, params));
}

export function popToTop() {
  navigationRef.current?.dispatch(StackActions.popToTop());
}

export function reset<T extends keyof RootStackParamList>(name: T) {
  navigationRef.current?.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name }],
    }),
  );
}

/** Push a flow screen with Home (tab stack) underneath — back returns to Home, not booking steps. */
export function resetToHomeAndScreen<T extends keyof RootStackParamList>(
  name: T,
  params?: RootStackParamList[T],
) {
  if (!navigationRef.isReady()) return;
  navigationRef.dispatch(
    CommonActions.reset({
      index: 1,
      routes: [{ name: SCREENS.BOTTOM_STACK }, { name, params }],
    }),
  );
}

export const screenOptions: NativeStackNavigationOptions = {
  animation: 'fade',
  headerStyle: {
    backgroundColor: COLORS.BACKGROUND,
  },
  headerShown: false,
  headerTintColor: COLORS.PRIMARY,
  headerShadowVisible: false,
  headerLeft: () => <CustomBackIcon />,
  headerTitleAlign: 'center',
  headerTitleStyle: {
    fontWeight: FontWeight.Bold,
  },
  headerBackButtonDisplayMode: 'minimal',
  // Note: React Navigation doesn't support allowFontScaling in headerTitleStyle
  // Font scaling is controlled at the component level (Typography component)

  // React Navigation automatically handles safe area for headers
  // To customize per screen, use:
  // - headerTransparent: true (for transparent headers)
  // - contentStyle: { paddingTop: 0 } (to remove safe area padding)
  // - headerStatusBarHeight: 0 (to remove status bar height)
};

/** Minimum 48pt touch target + extra hitSlop for reliable back navigation */
const BACK_TOUCH_SIZE = 48;
const BACK_HIT_SLOP = { top: 12, bottom: 12, left: 12, right: 12 };

export const CustomBackIcon = ({
  onPress,
  style,
}: {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) => {
  const handlePress = onPress ?? onBack;

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={BACK_HIT_SLOP}
      accessibilityRole='button'
      accessibilityLabel='Go back'
      style={({ pressed }) => [
        {
          minWidth: BACK_TOUCH_SIZE,
          minHeight: BACK_TOUCH_SIZE,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.75 : 1,
        },
        style,
      ]}
    >
      <GradientIcon
        componentName={VARIABLES.Feather}
        iconName='arrow-left'
        size={FontSize.MediumLarge}
        color={COLORS.WHITE}
        borderRadius={12}
        containerSize={40}
        iconStyle={[
          {
            transform: [{ scaleX: i18n.language === LANGUAGES.ARABIC ? -1 : 1 }],
          },
        ]}
      />
    </Pressable>
  );
};
