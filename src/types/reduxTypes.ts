import { useDispatch, useSelector } from 'react-redux';
import { AddressState } from 'store/slices/address';
import { AppSettingsState } from 'store/slices/appSettings';
import { NotificationState } from 'store/slices/notification';
import { UserState } from 'store/slices/user';
import store from 'store/store';

export type RootState = {
  app: AppSettingsState;
  user: UserState;
  address: AddressState;
  notification: NotificationState;
};

export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
