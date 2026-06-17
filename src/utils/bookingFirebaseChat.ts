import { SCREENS } from 'constants/routes';
import { navigate } from 'navigation/index';
import { showToast } from 'utils/toast';

export type BookingChatPeer = {
  id?: number | string | null;
  full_name?: string;
  profile_image?: string | null;
};

/** Open Firebase chat with the other party on a booking (worker ↔ customer / provider ↔ user). */
export function navigateToBookingFirebaseChat(params: {
  otherUser?: BookingChatPeer | null;
  bookingId?: number | string;
}): void {
  const otherUserId = params.otherUser?.id;
  if (!otherUserId) {
    showToast({ message: 'Chat is not available for this booking yet.' });
    return;
  }

  navigate(SCREENS.MESSAGES_FIREBASE, {
    data: {
      otherUserId,
      bookingId: params.bookingId,
      initialOtherUser: params.otherUser?.full_name
        ? {
            full_name: params.otherUser.full_name,
            profile_image: params.otherUser.profile_image ?? null,
          }
        : undefined,
    },
  });
}
