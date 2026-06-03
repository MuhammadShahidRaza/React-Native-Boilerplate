import { API_ROUTES } from 'api/routes';
import { extractApiList, normalizeActivitiesList } from 'api/normalizers/snlift';
import { ENV_CONSTANTS } from 'constants/common';
import { MOCK_NOTIFICATIONS_PAGE } from 'constants/mockNotifications';
import { handleGetApiRequest, handlePostApiRequest } from '.';
import { NotificationsListData } from 'types/responseTypes';

export const getNotifications = async (page = 1): Promise<NotificationsListData | null> => {
  if (ENV_CONSTANTS.IS_ALPHA_PHASE) {
    return page === 1 ? MOCK_NOTIFICATIONS_PAGE : { ...MOCK_NOTIFICATIONS_PAGE, activities: [] };
  }
  const response = await handleGetApiRequest<NotificationsListData>({
    url: API_ROUTES.GET_NOTIFICATIONS,
    params: { page },
  });
  if (!response) return null;
  const rawList =
    extractApiList<Record<string, unknown>>(response, ['activities', 'data', 'notifications']) ||
    [];
  const activities = normalizeActivitiesList(
    rawList.length > 0 ? rawList : ((response.activities ?? []) as unknown[]),
  );
  return { ...response, activities };
};

/** Trigger push notification to recipient when a chat message is sent. Fails silently. */
export const sendMessageNotification = async (
  userId: number,
  bookingId?: number,
): Promise<void> => {
  await handlePostApiRequest<object, { user_id: number; job_id?: number }>({
    url: API_ROUTES.SEND_MESSAGE_NOTIFICATION,
    data: { user_id: userId, job_id: bookingId },
    showError: false,
  });
};
