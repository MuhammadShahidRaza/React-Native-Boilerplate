import { API_ROUTES } from 'api/routes';
import { handlePostApiRequest } from '../app';

export async function checkExistingUser(email: string) {
  return handlePostApiRequest<{ exists: boolean }, { email: string }>({
    url: API_ROUTES.EXISTING_USER_CHECK,
    data: { email },
    showLoader: false,
  });
}
