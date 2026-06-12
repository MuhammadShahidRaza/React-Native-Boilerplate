import { useDispatch, useSelector } from 'react-redux';
import { AddressState } from 'store/slices/address';
import { AppSettingsState } from 'store/slices/appSettings';
import { BookingsState } from 'store/slices/bookings';
import type { FoodCartState } from 'store/slices/foodCart';
import { NotificationState } from 'store/slices/notification';
import { ServicesState } from 'store/slices/services';
import { UserState } from 'store/slices/user';
import type { WorkerAvailabilityState } from 'store/slices/worker';

export type { WorkerAvailabilityState };
import store from 'store/store';

export type RootState = {
  app: AppSettingsState;
  user: UserState;
  address: AddressState;
  notification: NotificationState;
  services: ServicesState;
  bookings: BookingsState;
  worker: WorkerAvailabilityState;
  foodCart: FoodCartState;
};

export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
