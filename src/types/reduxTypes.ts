import { useDispatch, useSelector } from 'react-redux';
import { AddressState } from 'store/slices/address';
import { AppSettingsState } from 'store/slices/appSettings';
import { CategoriesState } from 'store/slices/categories';
import { NotificationState } from 'store/slices/notification';
import { PaymentState } from 'store/slices/payment';
import { UserState } from 'store/slices/user';
import store from 'store/store';

export type RootState = {
  app: AppSettingsState;
  payment: PaymentState;
  user: UserState;
  category: CategoriesState;
  address: AddressState;
  notification: NotificationState;
};

export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
