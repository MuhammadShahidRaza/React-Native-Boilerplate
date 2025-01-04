// import useFirebaseMessaging from 'hooks/useMessaging';
import MainNavigation from 'navigation/MainNavigation';
import {Provider} from 'react-redux';
import store from 'store/store';

const App = () => {
  // useFirebaseMessaging();
  return (
    <Provider store={store}>
      <MainNavigation />
    </Provider>
  );
};

export default App;
