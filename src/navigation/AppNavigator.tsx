import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SCREENS } from 'constants/index';
import {
  AllBids,
  Filter,
  Search,
  Reviews,
  AddReview,
  TipDentor,
  NotificationListing,
  Profile,
  EditProfile,
  // Language,
  ContactUs,
  Cart,
  Settings,
  Help,
  Location,
  LocationMapPicker,
  LocationAddDetails,
  Home,
  ChangePassword,
  AddCard,
  Checkout,
  ProofOfVerification,
  BookServiceProvider,
  ServiceType,
  ThemeSelector,
  TransactionHistory,
  MyWallet,
  ChatFirebase,
  MessagesFirebase,
  MessagesSocket,
  ChatSocket,
  BookRideScreen,
  SendParcelScreen,
  SendParcelFindingScreen,
  CourierMatchedScreen,
  TrackParcelScreen,
  OrderFoodScreen,
  RestaurantMenuScreen,
  FoodDeliveryCartScreen,
} from 'screens/user';
import { BottomNavigator } from './BottomNavigator';
import { useBackHandler } from 'hooks/index';
import { screenOptions } from '.';
import { PrivacyPolicy } from 'screens/common';
import { AppIconSelector } from 'components/index';
import { renderCommonScreens } from './CommonNavigator';

export const AppNavigator = () => {
  useBackHandler();

  const Stack = createNativeStackNavigator();

  const screens = {
    [SCREENS.BOTTOM_STACK]: BottomNavigator,
    [SCREENS.HOME]: Home,
    [SCREENS.NOTIFICATION_LISTING]: NotificationListing,
    [SCREENS.ADD_REVIEW]: AddReview,
    [SCREENS.TIP_DENTOR]: TipDentor,
    [SCREENS.LOCATION]: Location,
    [SCREENS.LOCATION_MAP_PICKER]: LocationMapPicker,
    [SCREENS.LOCATION_ADD_DETAILS]: LocationAddDetails,
    [SCREENS.CHAT_FIREBASE]: ChatFirebase,
    [SCREENS.CHAT_SOCKET]: ChatSocket,
    [SCREENS.MESSAGES_FIREBASE]: MessagesFirebase,
    [SCREENS.MESSAGES_SOCKET]: MessagesSocket,
    [SCREENS.ADD_CARD]: AddCard,
    [SCREENS.THEME_SELECTOR]: ThemeSelector,
    [SCREENS.ICON_SELECTOR]: AppIconSelector,
    [SCREENS.MY_WALLET]: MyWallet,
    [SCREENS.TRANSACTION_HISTORY]: TransactionHistory,
    [SCREENS.PROFILE]: Profile,
    [SCREENS.EDIT_PROFILE]: EditProfile,
    [SCREENS.PRIVACY_POLICY]: PrivacyPolicy,
    [SCREENS.TERMS_AND_CONDITIONS]: PrivacyPolicy,
    [SCREENS.CHANGE_PASSWORD]: ChangePassword,
    [SCREENS.SEARCH]: Search,
    [SCREENS.NOTIFICATIONS]: NotificationListing,
    [SCREENS.FILTER]: Filter,
    [SCREENS.SETTINGS]: Settings,
    // [SCREENS.LANGUAGE]: Language,
    [SCREENS.HELP]: Help,
    [SCREENS.CONTACT_US]: ContactUs,
    [SCREENS.REVIEWS]: Reviews,
    [SCREENS.CART]: Cart,
    [SCREENS.CHECKOUT]: Checkout,
    [SCREENS.SERVICE_TYPE]: ServiceType,
    [SCREENS.PROOF_OF_VERIFICATION]: ProofOfVerification,
    [SCREENS.BOOK_SERVICE_PROVIDER]: BookServiceProvider,
    [SCREENS.ALL_BIDS]: AllBids,
    [SCREENS.BOOK_RIDE]: BookRideScreen,
    [SCREENS.SEND_PARCEL]: SendParcelScreen,
    [SCREENS.SEND_PARCEL_FINDING]: SendParcelFindingScreen,
    [SCREENS.COURIER_MATCHED]: CourierMatchedScreen,
    [SCREENS.TRACK_PARCEL]: TrackParcelScreen,
    [SCREENS.ORDER_FOOD]: OrderFoodScreen,
    [SCREENS.RESTAURANT_MENU]: RestaurantMenuScreen,
    [SCREENS.FOOD_DELIVERY_CART]: FoodDeliveryCartScreen,
  };

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {Object.entries(screens).map(([name, component]: [string, React.ComponentType<any>]) => (
        <Stack.Screen
          key={name}
          name={name}
          component={component}
          options={
            name === SCREENS.LOCATION ? { animation: 'slide_from_bottom' as const } : undefined
          }
        />
      ))}
      {renderCommonScreens(Stack)}
    </Stack.Navigator>
  );
};
