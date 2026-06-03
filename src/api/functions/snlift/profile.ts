import { API_ROUTES } from 'api/routes';
import { extractApiList } from 'api/normalizers/snlift';
import { handleGetApiRequest } from '../app';
import type { User } from 'types/responseTypes';

export async function listAllUsers(params?: { page?: number }) {
  const raw = await handleGetApiRequest<Record<string, unknown>>({
    url: API_ROUTES.USERS_ALL,
    params: params as Record<string, number> | undefined,
    showError: false,
  });
  if (!raw) return [];
  return extractApiList<User>(raw, ['users', 'data', 'items']);
}
