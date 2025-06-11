import {
  CommonActions,
  createNavigationContainerRef,
  StackActions,
} from '@react-navigation/native';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { Icon } from 'components/index';
import { LANGUAGES, VARIABLES } from 'constants/common';
import { SCREENS } from 'constants/routes';
import i18n from 'i18n/index';
import { FontSize } from 'types/fontTypes';
import { COLORS } from 'utils/colors';

export type RootStackParamList = {
  [SCREENS.LOGIN]: undefined;
  [SCREENS.SIGN_UP]: undefined;
  [SCREENS.FORGOT_PASSWORD]: { isFromForgot: boolean };
  [SCREENS.RESET_PASSWORD]: { token: string };
  [SCREENS.VERIFICATION]: { email: string };
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
};

export const CustomBackIcon = () => (
  <Icon
    iconStyle={[{ transform: [{ scaleX: i18n.language === LANGUAGES.ARABIC ? -1 : 1 }] }]}
    componentName={VARIABLES.Ionicons}
     iconName={'arrow-back'}
    size={FontSize.Large}
    onPress={() => onBack()}
  />
);
