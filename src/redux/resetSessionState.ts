import type { AppDispatch } from 'types/reduxTypes';
import { resetAlphaAddressStore } from 'constants/alphaAddressMocks';
import { resetAlphaWorkerMockSeed } from 'constants/alphaWorkerMocks';
import { resetAddressState } from 'store/slices/address';
import { ENV_CONSTANTS } from 'constants/common';
import { resetAppState } from 'store/slices/appSettings';
import { resetBookingsState } from 'store/slices/bookings';
import { resetFoodCartState } from 'store/slices/foodCart';
import { resetNotificationState } from 'store/slices/notification';
import { resetServicesState } from 'store/slices/services';
import { resetUserState } from 'store/slices/user';
import { resetWorkerAvailability } from 'store/slices/worker';

/** Clear all session-scoped Redux state on logout / auth expiry (keeps app language & theme). */
export function resetSessionState(dispatch: AppDispatch) {
  if (ENV_CONSTANTS.IS_ALPHA_PHASE) {
    resetAlphaAddressStore();
    resetAlphaWorkerMockSeed();
  }
  dispatch(resetAppState());
  dispatch(resetUserState());
  dispatch(resetAddressState());
  dispatch(resetBookingsState());
  dispatch(resetServicesState());
  dispatch(resetWorkerAvailability());
  dispatch(resetFoodCartState());
  dispatch(resetNotificationState());
}
