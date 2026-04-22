import {
  AddressReducer,
  AppReducer,
  NotificationReducer,
  UserReducer,
  ServicesReducer,
} from '../slices/index';

export const REDUCERS = {
  user: UserReducer,
  app: AppReducer,
  notification: NotificationReducer,
  address: AddressReducer,
  services: ServicesReducer,
};
