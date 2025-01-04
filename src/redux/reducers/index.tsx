import {
  AddressReducer,
  AppReducer,
  NotificationReducer,
  PaymentReducer,
  UserReducer,
} from '../slices/index';

export const REDUCERS = {
  user: UserReducer,
  app: AppReducer,
  notification: NotificationReducer,
  address: AddressReducer,
  payment: PaymentReducer,
};
