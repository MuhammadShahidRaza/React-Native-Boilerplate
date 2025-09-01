import useFirebaseMessaging from 'hooks/useMessaging';
import MainNavigation from 'navigation/MainNavigation';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import store from 'store/store';

const App = () => {
  useFirebaseMessaging();
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <MainNavigation />
      </Provider>
    </SafeAreaProvider>
  );
};

export default App;
