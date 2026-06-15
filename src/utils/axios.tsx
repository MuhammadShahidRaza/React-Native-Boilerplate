import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { getKeychainItem, removeKeychainItem, removeMultipleItem } from './storage';
import { logger } from 'utils/logger';
import NetInfo from '@react-native-community/netinfo';
import { ENV_CONSTANTS, VARIABLES } from 'constants/common';
import store from 'store/store';
import { resetSessionState } from 'store/resetSessionState';
import { setIsAppLoading } from 'store/slices/appSettings';

type FileLike = {
  uri?: string;
  path?: string;
  name?: string;
  filename?: string;
  type?: string;
  mime?: string;
};

interface RequestOptions {
  url: string;
  data?: object;
  config?: AxiosRequestConfig;
  includeToken?: boolean;
  showLoader?: boolean;
  addToPending?: boolean;
  /** Skip console error logging (background polling). */
  silentErrors?: boolean;
  onUploadProgress?: (percent: number) => void;
}

const isFileValue = (value: unknown): value is FileLike => {
  if (!value || typeof value !== 'object') return false;
  const v = value as FileLike;
  return !!(v.uri || v.path);
};

const hasFileInData = (data?: object): boolean => {
  if (!data) return false;
  return Object.values(data).some(isFileValue);
};

const buildFormBodyForBlob = (
  data: object,
  method: 'POST' | 'PUT' | 'PATCH',
): Array<{
  name: string;
  data: string | ReturnType<typeof ReactNativeBlobUtil.wrap>;
  filename?: string;
  type?: string;
}> => {
  const formBody: Array<{
    name: string;
    data: string | ReturnType<typeof ReactNativeBlobUtil.wrap>;
    filename?: string;
    type?: string;
  }> = [];
  Object.entries(data).forEach(([key, value]) => {
    if (isFileValue(value)) {
      const filePath = (value.uri || value.path || '').replace(/^file:\/\//, '');
      const filename = value.name || value.filename || 'file';
      const type = value.type || value.mime || 'application/octet-stream';
      formBody.push({
        name: key,
        filename,
        type,
        data: ReactNativeBlobUtil.wrap(filePath),
      });
    } else {
      formBody.push({
        name: key,
        data: typeof value === 'string' ? value : JSON.stringify(value ?? ''),
      });
    }
  });
  if (method === 'PATCH') {
    formBody.push({ name: '_method', data: 'PATCH' });
  }
  return formBody;
};

const getFullUrl = (url: string, config: AxiosRequestConfig): string => {
  const base = (config.baseURL || ENV_CONSTANTS.BASE_URL || '').replace(/\/$/, '');
  const path = (url || '').replace(/^\//, '');
  return `${base}/${path}`;
};

export interface ErrorResponse {
  error?: {
    messages?: string[];
    code?: number;
  };
  message?: string;
  messages?: string[];
  errors?: string[] | { field: string; message: string }[];
  code?: number;
  success?: boolean;
}

export interface ErrorMessage {
  error: {
    messages: string;
  };
}

interface PendingRequest {
  config: AxiosRequestConfig;
  includeToken: boolean;
  showLoader: boolean;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

let pendingRequests: PendingRequest[] = [];

NetInfo.addEventListener(state => {
  if (state.isConnected && pendingRequests.length > 0) {
    // Retry all pending requests when network is restored
    const requestsToRetry = [...pendingRequests];
    pendingRequests = [];

    requestsToRetry.forEach(({ config, includeToken, showLoader, resolve, reject }) => {
      makeHttpRequest(config, includeToken, showLoader).then(resolve).catch(reject);
    });
  }
});

const axiosInstance = axios.create({
  baseURL: ENV_CONSTANTS.BASE_URL,
  timeout: 600000,
  headers: {
    Accept: 'application/json',
  },
});

const setAuthToken = async () => {
  try {
    const USER_TOKEN = await getKeychainItem(VARIABLES.USER_TOKEN);
    if (USER_TOKEN) {
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${USER_TOKEN}`;
    } else {
      delete axiosInstance.defaults.headers.common.Authorization;
    }
  } catch (error) {
    logger.error('Error setting auth token:', error);
    delete axiosInstance.defaults.headers.common.Authorization;
  }
};

class HttpError extends Error {
  status: number;
  errors?: string[] | string | { field: string; message: string }[];
  constructor(
    message: string | undefined,
    status: number,
    errors?: string[] | string | { field: string; message: string }[],
  ) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

class NetworkError extends Error {
  constructor(message: string) {
    super(message);
  }
}

class SocketError extends Error {
  constructor(message: string) {
    super(message);
  }
}

// Constants for authentication error detection
const UNAUTH_ERROR_MESSAGES = ['Unauthenticated', 'Unauthorized', 'unauthenticated'] as const;
const UNAUTHORIZED_STATUS_CODE = 401;

/**
 * Checks if the error indicates an unauthenticated state and clears auth data if needed
 */
const checkUnAuth = async (errorMessage?: string, statusCode?: number): Promise<void> => {
  const isUnauthMessage = errorMessage
    ? UNAUTH_ERROR_MESSAGES.some(msg => msg.toLowerCase() === errorMessage.toLowerCase())
    : false;

  const isUnauthCode = statusCode === UNAUTHORIZED_STATUS_CODE;

  if (isUnauthMessage || isUnauthCode) {
    // Clear auth state and tokens only (keep language/theme/onboarding)
    resetSessionState(store.dispatch);
    await removeMultipleItem([VARIABLES.IS_USER_LOGGED_IN, VARIABLES.USER_TOKEN]);
    await removeKeychainItem(VARIABLES.USER_TOKEN);
  }
};

/** Detects `{ error: { status: false, code: 422, messages: [...] } }` returned with HTTP 200. */
export const getResponseEnvelopeError = (
  payload: unknown,
): { message: string; code: number } | null => {
  if (!payload || typeof payload !== 'object') return null;
  const envelope = payload as ErrorResponse & {
    error?: { code?: number; messages?: string[]; status?: boolean; message?: string };
  };
  const error = envelope.error;
  if (!error) return null;
  const failed =
    error.status === false || (typeof error.code === 'number' && error.code >= 400);
  if (!failed) return null;
  return {
    message: error.messages?.[0] || error.message || 'Request failed',
    code: error.code || 422,
  };
};

/**
 * Extracts error message from response data following priority order
 */
const extractErrorMessage = (
  responseData: ErrorResponse,
): { message: string; errors?: ErrorResponse['errors'] } | null => {
  // Priority 1: Deep nested error: { error: { messages: [...] } }
  if (responseData?.error?.messages?.[0]) {
    return { message: responseData.error.messages[0] };
  }

  // Priority 2: General messages array: { messages: [...] }
  if (responseData?.messages?.[0]) {
    return {
      message: responseData?.messages[0],
      errors: responseData.errors,
    };
  }

  // Priority 3: Single message or field validation errors
  if (responseData?.message || (responseData?.errors && responseData.errors.length > 0)) {
    const firstError = responseData.errors?.[0];
    const errorMessage =
      typeof firstError === 'string' ? firstError : (firstError as { message?: string })?.message;

    const message = responseData.message || errorMessage || 'An unknown error occurred';
    return { message, errors: responseData.errors };
  }

  return null;
};

/**
 * Handles network-related errors (no response from server)
 */
const handleNetworkError = async (error: AxiosError): Promise<never> => {
  if (error?.code === 'ECONNABORTED') {
    throw new SocketError('Socket timeout: The request took too long to complete.');
  }

  const netState = await NetInfo.fetch();
  if (!netState.isConnected) {
    throw new NetworkError('No Internet Connection. Please check your network.');
  }

  throw new NetworkError('Server unreachable. Please try again later.');
};

/**
 * Handles HTTP response errors with proper error extraction and authentication checks
 */
const handleRequestError = async (
  error: AxiosError<ErrorResponse>,
  silent = false,
): Promise<never> => {
  if (!silent) {
    logger.error('handleRequestError', error);
  }
  if (!axios.isAxiosError(error)) {
    throw error;
  }

  // Handle network/socket errors (no response)
  if (!error?.response) {
    await handleNetworkError(error);
    // handleNetworkError always throws, but TypeScript needs this for type narrowing
    throw new Error('Unreachable code');
  }

  // At this point, error?.response is guaranteed to exist
  const { status } = error?.response;
  const responseData = error?.response.data;
  const statusCode = responseData?.error?.code || responseData?.code || status;

  // Extract error message with priority order
  const extractedError = extractErrorMessage(responseData || {});

  if (extractedError) {
    await checkUnAuth(extractedError?.message, statusCode);
    throw new HttpError(extractedError?.message, status, extractedError?.errors);
  }

  // Fallback to status text if no error message found
  await checkUnAuth(undefined, statusCode);
  throw new HttpError(error?.response.statusText || 'An error occurred', status);
};

const makeHttpRequest = async (
  config: AxiosRequestConfig,
  includeToken = true,
  showLoader = true,
  addToPending = false,
  silentErrors = false,
): Promise<any> => {
  if (ENV_CONSTANTS.IS_ALPHA_PHASE) return;
  if (!silentErrors) {
    logger.log('makeHttpRequest', config);
  }
  // Check network connection before making the request
  const netState = await NetInfo.fetch();
  if (!netState.isConnected) {
    if (addToPending) {
      // Add to pending queue to retry when network is restored
      return new Promise((resolve, reject) => {
        pendingRequests.push({
          config,
          includeToken,
          showLoader,
          resolve,
          reject,
        });
      });
    } else {
      // Immediately throw network error
      store.dispatch(setIsAppLoading(false));
      throw new NetworkError('No Internet Connection. Please check your network.');
    }
  }

  try {
    if (showLoader) {
      store.dispatch(setIsAppLoading(true));
    }
    if (includeToken) {
      await setAuthToken();
    }
    const response = await axiosInstance(config);
    store.dispatch(setIsAppLoading(false));

    if (!silentErrors) {
      logger.log('response?.data', response?.data);
    }

    const payload = response?.data?.response ?? response?.data;
    const envelopeError = getResponseEnvelopeError(payload);
    if (envelopeError) {
      throw new HttpError(envelopeError.message, envelopeError.code);
    }
    return payload;
  } catch (error) {
    // Always set loading to false first
    store.dispatch(setIsAppLoading(false));

    if (!silentErrors) {
      logger.log('error', error);
    }

    if (error instanceof AxiosError && error?.response?.data?.error?.type === 'card_error') {
      throw new HttpError(
        error?.response?.data?.error?.message,
        error?.response?.data?.error?.code,
      );
    } else if (
      error instanceof NetworkError ||
      error instanceof SocketError ||
      error instanceof HttpError
    ) {
      // Re-throw known error types
      throw error;
    } else {
      await handleRequestError(error as AxiosError<ErrorResponse>, silentErrors);
      // This line is unreachable, but TypeScript needs it
      throw error;
    }
  }
};

const get = async ({
  url,
  config = {},
  includeToken = true,
  showLoader = true,
  addToPending = false,
  silentErrors = false,
}: RequestOptions) => {
  return makeHttpRequest(
    { method: 'GET', url, ...config },
    includeToken,
    showLoader,
    addToPending,
    silentErrors,
  );
};

const post = async ({
  url,
  data,
  config = {},
  includeToken = true,
  showLoader = true,
  addToPending = false,
}: RequestOptions) => {
  return makeHttpRequest(
    { method: 'POST', url, data, ...config },
    includeToken,
    showLoader,
    addToPending,
  );
};

const put = async ({
  url,
  data,
  config = {},
  includeToken = true,
  showLoader = true,
  addToPending = false,
}: RequestOptions) => {
  return makeHttpRequest(
    { method: 'PUT', url, data, ...config },
    includeToken,
    showLoader,
    addToPending,
  );
};

const patch = async ({
  url,
  data,
  config = {},
  includeToken = true,
  showLoader = true,
  addToPending = false,
}: RequestOptions) => {
  return makeHttpRequest(
    { method: 'PATCH', url, data, ...config },
    includeToken,
    showLoader,
    addToPending,
  );
};

// const remove = async (url, config={}, includeToken = true) => {
//   return makeHttpRequest({ method: 'DELETE', url, ...config }, includeToken,showLoader);
// };

const remove = async ({
  url,
  data = {},
  config = {},
  includeToken = true,
  showLoader = true,
  addToPending = false,
}: RequestOptions) => {
  const headers = {
    'Content-Type': 'application/json', // Set the appropriate content type
    ...(config.headers || {}),
  };

  const requestOptions = {
    method: 'DELETE',
    url,
    headers,
    data: JSON.stringify(data), // Convert data to JSON string
    ...config,
  };

  return makeHttpRequest(requestOptions, includeToken, showLoader, addToPending);
};

const makeBlobFileRequest = async (
  method: 'POST' | 'PUT' | 'PATCH',
  url: string,
  data: object,
  config: AxiosRequestConfig,
  includeToken: boolean,
  showLoader: boolean,
  onUploadProgress?: (percent: number) => void,
): Promise<any> => {
  if (ENV_CONSTANTS.IS_ALPHA_PHASE) return;

  const netState = await NetInfo.fetch();
  if (!netState.isConnected) {
    store.dispatch(setIsAppLoading(false));
    throw new NetworkError('No Internet Connection. Please check your network.');
  }

  let token = '';
  if (includeToken) {
    token = (await getKeychainItem(VARIABLES.USER_TOKEN)) || '';
  }

  const fullUrl = getFullUrl(url, config);
  const formBody = buildFormBodyForBlob(data, method);
  const httpMethod = method === 'PATCH' ? 'POST' : method;

  const headers: Record<string, string> = {
    'Content-Type': 'multipart/form-data',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(config.headers as Record<string, string>),
  };

  if (showLoader) {
    store.dispatch(setIsAppLoading(true));
  }

  return new Promise((resolve, reject) => {
    let req = ReactNativeBlobUtil.fetch(httpMethod, fullUrl, headers, formBody);

    if (onUploadProgress) {
      req = req.uploadProgress({ interval: 100 }, (sent, total) => {
        const percent = total > 0 ? Math.floor((sent / total) * 100) : 0;
        onUploadProgress(percent);
      });
    }

    req
      .then(res => {
        store.dispatch(setIsAppLoading(false));
        try {
          const json = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
          const payload = json?.response ?? json;
          const envelopeError = getResponseEnvelopeError(payload);
          if (envelopeError) {
            reject(new HttpError(envelopeError.message, envelopeError.code));
            return;
          }
          resolve(payload);
        } catch {
          resolve(res.data);
        }
      })
      .catch(async err => {
        store.dispatch(setIsAppLoading(false));
        try {
          const resData = err?.response?.data;
          const parsed = typeof resData === 'string' ? JSON.parse(resData || '{}') : resData || {};
          await checkUnAuth(parsed?.message, err?.response?.status);
          throw new HttpError(
            parsed?.message || parsed?.error?.messages?.[0] || err?.message || 'Upload failed',
            err?.response?.status || 500,
            parsed?.errors,
          );
        } catch (e) {
          if (e instanceof HttpError) throw e;
          throw new HttpError(err?.message || 'Upload failed', 500);
        }
      });
  });
};

const postWithSingleFile = async ({
  url,
  data = {},
  config = {},
  includeToken = true,
  showLoader = true,
  addToPending = false,
  onUploadProgress,
}: RequestOptions) => {
  if (hasFileInData(data)) {
    return makeBlobFileRequest(
      'POST',
      url,
      data,
      config,
      includeToken,
      showLoader,
      onUploadProgress,
    );
  }

  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    formData.append(key, value as string | Blob);
  });

  return makeHttpRequest(
    {
      method: 'POST',
      url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      ...config,
    },
    includeToken,
    showLoader,
    addToPending,
  );
};

const putWithSingleFile = async ({
  url,
  data = {},
  config = {},
  includeToken = true,
  showLoader = true,
  addToPending = false,
  onUploadProgress,
}: RequestOptions) => {
  if (hasFileInData(data)) {
    return makeBlobFileRequest(
      'PUT',
      url,
      data,
      config,
      includeToken,
      showLoader,
      onUploadProgress,
    );
  }

  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value as string | Blob);
  });

  return makeHttpRequest(
    {
      method: 'PUT',
      url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      ...config,
    },
    includeToken,
    showLoader,
    addToPending,
  );
};

const patchWithSingleFile = async ({
  url,
  data = {},
  config = {},
  includeToken = true,
  showLoader = true,
  addToPending = false,
  onUploadProgress,
}: RequestOptions) => {
  if (hasFileInData(data)) {
    return makeBlobFileRequest(
      'PATCH',
      url,
      data,
      config,
      includeToken,
      showLoader,
      onUploadProgress,
    );
  }

  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value as string | Blob);
  });
  formData.append('_method', 'PATCH');

  return makeHttpRequest(
    {
      method: 'POST',
      url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      ...config,
    },
    includeToken,
    showLoader,
    addToPending,
  );
};

export {
  setAuthToken,
  get,
  post,
  put,
  patch,
  remove,
  postWithSingleFile,
  patchWithSingleFile,
  putWithSingleFile,
};
