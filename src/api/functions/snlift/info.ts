import { API_ROUTES } from 'api/routes';
import { handleGetApiRequest } from '../app';

export type SnliftAppInfo = {
  app_name?: string;
  version?: string;
  min_version?: string;
  [key: string]: unknown;
};

export async function getAppInfo() {
  return handleGetApiRequest<SnliftAppInfo>({
    url: API_ROUTES.APP_INFO,
    showError: false,
  });
}
