import { StripeProvider } from '@stripe/stripe-react-native';
import useFirebaseMessaging from 'hooks/useMessaging';
import MainNavigation from 'navigation/MainNavigation';
import { useVariantBootstrap } from 'hooks/useVariantBootstrap';
import { useWorkerActiveJobTrackingBootstrap } from 'hooks/useWorkerActiveJobTrackingBootstrap';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import store, { persistor } from 'store/store';
import { ThemeProvider } from 'theme/ThemeContext';
import { SocketProvider } from 'context/SocketContext';
import { ENV_CONSTANTS } from 'constants/common';
import { KeyboardProvider } from 'react-native-keyboard-controller';
const AppContent = () => {
  useVariantBootstrap();
  useWorkerActiveJobTrackingBootstrap();
  return (
    <ThemeProvider>
      <SocketProvider>
        <MainNavigation />
      </SocketProvider>
    </ThemeProvider>
  );
};

const App = () => {
  useFirebaseMessaging();
  return (
    <StripeProvider publishableKey={ENV_CONSTANTS.STRIPE_KEY ?? ''}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <AppContent />
            </PersistGate>
          </Provider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </StripeProvider>
  );
};

export default App;
