import { API_ROUTES } from 'api/routes';
import { handleDeleteApiRequest, handlePostApiRequest } from '../app';

export type RegisterDevicePayload = {
  udid: string;
  device_type: string;
  device_brand?: string;
  device_os: string;
  app_version?: string;
  device_token: string;
};

/** POST /user/device — register FCM / device after login (Postman). */
export async function registerUserDevice(data: RegisterDevicePayload) {
  return handlePostApiRequest<{ message?: string }, RegisterDevicePayload>({
    url: API_ROUTES.USER_DEVICE,
    data,
    showError: false,
  });
}

/** DELETE /user/device — remove device on logout. */
export async function removeUserDevice(data: { udid: string }) {
  return handleDeleteApiRequest<{ message?: string }, { udid: string }>({
    url: API_ROUTES.USER_DEVICE,
    data,
    showError: false,
  });
}
