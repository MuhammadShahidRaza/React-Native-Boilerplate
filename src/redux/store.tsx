import { configureStore } from '@reduxjs/toolkit';
import { REDUCERS } from './reducers';

const store = configureStore({
  reducer: REDUCERS,
});
export default store;
