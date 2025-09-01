import { AddressReducer, AppReducer, NotificationReducer, UserReducer } from '../slices/index';

export const REDUCERS = {
  user: UserReducer,
  app: AppReducer,
  notification: NotificationReducer,
  address: AddressReducer,
};
