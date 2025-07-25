import {
  AddressReducer,
  AppReducer,
  NotificationReducer,
  PaymentReducer,
  UserReducer,
  CategoryReducer,
} from '../slices/index';

export const REDUCERS = {
  user: UserReducer,
  app: AppReducer,
  notification: NotificationReducer,
  address: AddressReducer,
  category: CategoryReducer,
  payment: PaymentReducer,
};
