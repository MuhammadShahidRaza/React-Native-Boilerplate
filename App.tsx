import { StripeProvider } from '@stripe/stripe-react-native';
import useFirebaseMessaging from 'hooks/useMessaging';
import MainNavigation from 'navigation/MainNavigation';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import store, { persistor } from 'store/store';
import { ThemeProvider } from 'theme/ThemeContext';
import { SocketProvider } from 'context/SocketContext';
import { ENV_CONSTANTS } from 'constants/common';
// import { KeyboardProvider } from 'react-native-keyboard-controller';

const App = () => {
  useFirebaseMessaging();
  return (
    <StripeProvider publishableKey={ENV_CONSTANTS.STRIPE_KEY ?? ''}>
      <SafeAreaProvider>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <ThemeProvider>
              <SocketProvider>
                <MainNavigation />
              </SocketProvider>
            </ThemeProvider>
          </PersistGate>
        </Provider>
      </SafeAreaProvider>
    </StripeProvider>
  );
};

export default App;
