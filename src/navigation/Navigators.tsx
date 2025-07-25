import {
  CommonActions,
  createNavigationContainerRef,
  StackActions,
} from '@react-navigation/native';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { Icon, OrderItem } from 'components/index';
import { LANGUAGES, VARIABLES } from 'constants/common';
import { SCREENS } from 'constants/routes';
import i18n from 'i18n/index';
import { FontSize } from 'types/fontTypes';
import { CategoryItem } from 'types/responseTypes';
import { COLORS } from 'utils/colors';

export type RootStackParamList = {
  // User Screens
  [SCREENS.HOME]: undefined;
  [SCREENS.CART]: undefined;
  [SCREENS.NOTIFICATIONS]: undefined;
  [SCREENS.NOTIFICATION_LISTING]: undefined;
  [SCREENS.PROFILE]: undefined;
  [SCREENS.ADD_CARD]: undefined;
  [SCREENS.BOTTOM_STACK]: undefined;
  [SCREENS.SETTINGS]: undefined;
  [SCREENS.WALLET]: undefined;
  [SCREENS.HELP]: undefined;
  [SCREENS.CHANGE_PASSWORD]: undefined;
  [SCREENS.ABOUT]: undefined;
  [SCREENS.CONTACT_US]: undefined;
  [SCREENS.FAQ]: undefined;
  [SCREENS.TASKS]: undefined;
  [SCREENS.SHOP]: undefined;
  [SCREENS.CART]: undefined;
  [SCREENS.FAVORITES]: undefined;
  [SCREENS.CHECKOUT]: undefined;
  [SCREENS.EDIT_PROFILE]: undefined;
  [SCREENS.SELECT_REGION]: undefined;
  [SCREENS.LANGUAGE]: undefined;
  [SCREENS.ORDERS]: undefined;
  [SCREENS.FILTER]: {
    data: {
      heading: string;
    };
  };
  [SCREENS.PRIVACY_POLICY]: { title: string };
  [SCREENS.PAYMENTS]: undefined;
  [SCREENS.INVOICES]: undefined;
  [SCREENS.ADD_REVIEW]: { isNotEditable: boolean };
  [SCREENS.VIEW_ALL]: { data: { items: CategoryItem[]; headerTitle: string } };
  [SCREENS.VIEW_DETAILS]: { data: CategoryItem };
  [SCREENS.DETAILS]: { data: CategoryItem; heading: string };
  [SCREENS.ECOMMERCE_DETAILS]: { data: any; heading: string };
  [SCREENS.ORDER_DETAIL]: { data: OrderItem };
  [SCREENS.SUB_CATEGORY_ITEMS]: {
    data: {
      heading: string;
      items: CategoryItem[];
      itemHeading: string;
    };
  };
  [SCREENS.VIEW_ALL_ECOMMERCE]: {
    data: {
      items: {
        id: string;
        name: string;
        image: string;
        products?: {
          id: string;
          name: string;
          image: string;
          price: string;
        }[];
      };
      headerTitle: string;
    };
  };
  [SCREENS.SUB_CATEGORY_FOOD]: {
    data: {
      heading: string;
      items: CategoryItem[];
      itemHeading: string;
      categories?: { id: string; name: string; image: string }[];
    };
  };
  // Auth Screens
  [SCREENS.LOGIN]: undefined;
  [SCREENS.SIGN_UP]: undefined;
  [SCREENS.FORGOT_PASSWORD]: undefined;
  [SCREENS.RESET_PASSWORD]: { token: string };
  [SCREENS.VERIFICATION]: { isFromForgot?: boolean; email: string };
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

export const screenOptions: NativeStackNavigationOptions = {
  animation: 'fade',
  headerStyle: {
    backgroundColor: COLORS.WHITE,
  },
  headerTintColor: COLORS.PRIMARY,
  headerShadowVisible: false,
  headerLeft: () => <CustomBackIcon />,
  headerTitleAlign: 'center',
};

export const CustomBackIcon = () => (
  <Icon
    iconStyle={[{ transform: [{ scaleX: i18n.language === LANGUAGES.ARABIC ? -1 : 1 }] }]}
    componentName={VARIABLES.Ionicons}
    iconName={'arrow-back-outline'}
    size={FontSize.Large}
    onPress={() => onBack()}
  />
);
