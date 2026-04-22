// Mock redux-persist persistStore to avoid open handles (setTimeout) in tests
jest.mock('redux-persist', () => {
  const actual = jest.requireActual('redux-persist');
  return {
    ...actual,
    persistStore: () => ({
      persist: jest.fn(),
      purge: jest.fn(),
      flush: jest.fn(),
      pause: jest.fn(),
      subscribe: jest.fn(() => jest.fn()),
    }),
  };
});

// Mock Stripe (used by App)
jest.mock('@stripe/stripe-react-native', () => ({
  StripeProvider: ({ children }) => children,
  useStripe: () => ({}),
  useConfirmPayment: () => ({}),
}));

// Mock Firebase Firestore (used by firestoreChat -> JobInfoBox -> App)
jest.mock('@react-native-firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  onSnapshot: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
}));

// Mock Google Sign-In & Apple Auth (ESM packages used by socialLogins)
jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: { signIn: jest.fn(), signOut: jest.fn(), configure: jest.fn() },
  statusCodes: {},
}));
jest.mock('@invertase/react-native-apple-authentication', () => ({
  default: { performRequest: jest.fn(), isSupported: jest.fn(() => Promise.resolve(false)) },
  appleAuthAndroid: {},
}));
jest.mock('base-64', () => ({ decode: (s) => Buffer.from(s, 'base64').toString('utf8') }));

// Mock Firebase (used by App via useMessaging)
jest.mock('@react-native-firebase/messaging', () => ({
  getMessaging: jest.fn(),
  getInitialNotification: jest.fn(),
  onMessage: jest.fn(),
}));
jest.mock('hooks/useMessaging', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock native modules that fail in Jest
jest.mock('react-native-blob-util', () => ({ default: {} }));
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
}));
jest.mock('@react-native-community/geolocation', () => ({
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
}));
jest.mock('react-native-permissions', () => ({
  default: { check: jest.fn(), request: jest.fn() },
  check: jest.fn(() => Promise.resolve('granted')),
  request: jest.fn(() => Promise.resolve('granted')),
  PERMISSIONS: {},
  RESULTS: {},
}));

// Mock utils/location to break deep dependency chain (geolocation, permissions)
jest.mock('utils/location', () => ({
  getCurrentLocation: jest.fn(),
  reverseGeocode: jest.fn(),
  getAddressFromCoordinates: jest.fn(),
}));

// Mock Notifee
jest.mock('@notifee/react-native', () => ({
  default: {},
  AndroidImportance: {},
  EventType: {},
}));

// Mock utils/notifications
jest.mock('utils/notifications', () => ({
  requestNotificationPermission: jest.fn(),
  getFCMToken: jest.fn(() => Promise.resolve('mock-token')),
}));

jest.mock('react-native-device-info', () => ({
  getUniqueId: jest.fn(() => Promise.resolve('test-id')),
  getVersion: jest.fn(() => '1.0'),
  getBrand: jest.fn(() => 'test'),
}));

// Mock utils/helpers and utils/helpers/functions to avoid native modules
jest.mock('utils/helpers/functions', () => ({
  isIOS: () => false,
  screenWidth: () => 375,
  screenHeight: () => 667,
  initNetworkListener: jest.fn(),
}));
jest.mock('utils/helpers', () => ({
  isIOS: () => false,
  screenWidth: () => 375,
  screenHeight: () => 667,
}));

// Mock react-native-skeleton-placeholder, masked-view, image-crop-picker for component tests
jest.mock('react-native-skeleton-placeholder', () => {
  const { View } = require('react-native');
  return { __esModule: true, default: View };
});
jest.mock('@react-native-masked-view/masked-view', () => {
  const { View } = require('react-native');
  return { default: View };
});
jest.mock('react-native-image-crop-picker', () => ({
  default: { openPicker: jest.fn(), openCamera: jest.fn() },
  Image: {},
}));
jest.mock('react-native-webview', () => {
  const { View } = require('react-native');
  return { WebView: View };
});
jest.mock('react-native-maps', () => {
  const { View } = require('react-native');
  return {
    default: View,
    Marker: View,
    Callout: View,
    PROVIDER_GOOGLE: 'google',
    Region: {},
  };
});
jest.mock('react-native-maps', () => {
  const { View } = require('react-native');
  return {
    default: View,
    Marker: View,
    Callout: View,
    PROVIDER_GOOGLE: 'google',
    Region: {},
  };
});

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

// Mock i18n
jest.mock('i18n/index', () => ({
  t: (key) => key,
  changeLanguage: jest.fn(),
}));

// Mock constants/assets/fonts to avoid isIOS and Platform in font loading
jest.mock('constants/assets/fonts', () => ({
  FONT_FAMILY: {
    GORDITA: { BLACK: 'GorditaBlack', BOLD: 'GorditaBold', MEDIUM: 'GorditaMedium', REGULAR: 'GorditaRegular', LIGHT: 'GorditaLight' },
    POPPINS: { BOLD: 'PoppinsBold', SEMIBOLD: 'PoppinsSemiBold', MEDIUM: 'PoppinsMedium', REGULAR: 'PoppinsRegular' },
  },
}));

// Mock useTranslation (used by Typography, RowComponent, etc.)
jest.mock('hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key) => key,
    changeLanguage: jest.fn(),
    isLangRTL: false,
  }),
}));

// Mock hooks/index to avoid loading useUserById -> api -> navigation -> full app
jest.mock('hooks/index', () => {
  const actualFocus = jest.requireActual('hooks/useFocus');
  return {
    useTranslation: () => ({ t: (key) => key, changeLanguage: jest.fn(), isLangRTL: false }),
    useFocus: actualFocus.useFocus,
    FocusProvider: actualFocus.FocusProvider,
    useTheme: () => ({ theme: {}, isDark: false }),
    useAuth: () => ({}),
    useUserLoginStatus: () => ({ isUserLoggedIn: true, isLoading: false }),
    useBackHandler: () => {},
    useResetStackOnBack: () => {},
    useMessaging: () => {},
  };
});

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/FontAwesome', () => 'Icon');
jest.mock('react-native-vector-icons/Entypo', () => 'Icon');
jest.mock('react-native-vector-icons/Feather', () => 'Icon');
jest.mock('react-native-vector-icons/EvilIcons', () => 'Icon');
jest.mock('react-native-vector-icons/AntDesign', () => 'Icon');
jest.mock('react-native-vector-icons/FontAwesome5', () => 'Icon');
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');
