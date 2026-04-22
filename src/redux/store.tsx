import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AddressReducer,
  AppReducer,
  BookingsReducer,
  NotificationReducer,
  ServicesReducer,
  UserReducer,
} from './slices/index';

// Combine reducers
const rootReducer = combineReducers({
  user: UserReducer,
  app: AppReducer,
  notification: NotificationReducer,
  address: AddressReducer,
  services: ServicesReducer,
  bookings: BookingsReducer,
});

// Redux Persist configuration
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  version: 1,
  // Only persist these reducers (theme and language will be auto-saved)
  whitelist: ['app', 'user', 'address'],
  // Don't persist notification state (it's temporary)
  blacklist: ['notification', 'services', 'bookings'],
  // Debug mode in development
  debug: __DEV__,
  // Migration function to handle version changes
  migrate: (state: any) => {
    // If state exists, return it; otherwise return undefined to use initialState
    return Promise.resolve(state);
  },
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist actions and flush operations
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/REGISTER',
          'persist/FLUSH',
          'persist/PAUSE',
          'persist/PURGE',
        ],
        // Ignore non-serializable paths in persist actions
        ignoredActionPaths: ['meta.arg', 'payload'],
        // Ignore non-serializable values in state (for persist metadata + socket instance)
        ignoredPaths: ['_persist'],
      },
    }),
});

export const persistor = persistStore(store);
export default store;
