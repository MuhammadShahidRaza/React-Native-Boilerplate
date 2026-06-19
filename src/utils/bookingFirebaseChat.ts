import { SCREENS } from 'constants/routes';
import { ENV_CONSTANTS } from 'constants/common';
import { navigate } from 'navigation/index';
import { showToast } from 'utils/toast';
import type { User } from 'types/responseTypes';

export type BookingChatPeer = {
  id?: number | string | null;
  full_name?: string;
  profile_image?: string | null;
};

function buildSocketOtherUser(peer: BookingChatPeer): User {
  const id = Number(peer.id) || 0;
  return {
    id,
    full_name: peer.full_name?.trim() || 'Driver',
    email: '',
    email_verified_at: null,
    profile_image: peer.profile_image ?? null,
  };
}

const ALPHA_CHAT_FALLBACK_PEER: BookingChatPeer = {
  id: 101,
  full_name: 'John Doe',
};

/** Open chat with the other party on a booking (worker ↔ customer / provider ↔ user). */
export function navigateToBookingFirebaseChat(params: {
  otherUser?: BookingChatPeer | null;
  bookingId?: number | string;
}): void {
  const otherUserId = params.otherUser?.id;

  if (ENV_CONSTANTS.IS_ALPHA_PHASE) {
    const peerId = otherUserId ?? ALPHA_CHAT_FALLBACK_PEER.id;
    navigate(SCREENS.MESSAGES_SOCKET, {
      data: {
        conversationId: `booking-${params.bookingId ?? peerId}`,
        otherUser: buildSocketOtherUser({
          id: peerId,
          full_name: params.otherUser?.full_name ?? ALPHA_CHAT_FALLBACK_PEER.full_name,
          profile_image: params.otherUser?.profile_image,
        }),
      },
    });
    return;
  }

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
