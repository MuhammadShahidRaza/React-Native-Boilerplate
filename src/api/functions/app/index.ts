import { COMMON_TEXT } from 'constants/screens';
import i18n from 'i18n/index';
import {
  get,
  patch,
  patchWithSingleFile,
  post,
  postWithSingleFile,
  put,
  putWithSingleFile,
  remove,
} from 'utils/axios';
import { showToast } from 'utils/toast';
import { logger } from 'utils/logger';

// R type for Return
// A type for Accept

const isDataEmpty = (data: unknown): boolean =>
  data === null ||
  data === undefined ||
  (Array.isArray(data) && data.length === 0) ||
  (typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length === 0);

export const parseApiResponse = <R>(response: {
  data?: unknown;
  messages?: string[];
  code?: number;
}): R => {
  logger.log('parseApiResponse', response);
  const data = response?.data;
  if (!isDataEmpty(data)) return data as R;
  return { message: response?.messages?.[0], code: response?.code } as R;
};

export const handleApiError = (error: unknown): void => {
  logger.log(error);
  const errorMessage =
    (error instanceof Error && error.message) || i18n.t(COMMON_TEXT.SOMETHING_WENT_WRONG);
  showToast({ message: errorMessage });
};

const handleGetApiRequest = async <R extends object>({
  url,
  params,
  showLoader = true,
  config = {},
  addToPending = false,
  showError = true,
  silentErrors = false,
}: {
  url: string;
  params?: Record<string, string | number>;
  config?: Record<string, unknown>;
  addToPending?: boolean;
  showError?: boolean;
  showLoader?: boolean;
  silentErrors?: boolean;
}): Promise<R | undefined> => {
  try {
    const response = await get({
      url,
      showLoader: showLoader,
      config: { ...config, ...(params ? { params } : {}) },
      addToPending: addToPending,
      silentErrors,
    });
    return parseApiResponse<R>(response);
  } catch (error) {
    if (showError) handleApiError(error);
  }
  return;
};

const handlePostApiRequest = async <R extends object, A extends object>({
  url,
  data,
  config = {},
  showLoader,
  showError = true,
}: {
  url: string;
  data: A;
  config?: Record<string, unknown>;
  showLoader?: boolean;
  /** When true, don't show toast on error */
  showError?: boolean;
}): Promise<R | undefined> => {
  try {
    const response = await post({
      url,
      data,
      config,
      showLoader,
    });
    logger.log('parseApiResponse', response);
    return parseApiResponse<R>(response);
  } catch (error) {
    logger.log(error);
    if (showError) {
      handleApiError(error);
    }
  }
  return;
};
const handlePatchApiRequest = async <R extends object, A extends object>({
  url,
  data,
  showLoader,
}: {
  url: string;
  data: A;
  showLoader?: boolean;
}): Promise<R | undefined> => {
  try {
    const response = await patch({
      url,
      data,
      showLoader,
    });
    return parseApiResponse<R>(response);
  } catch (error) {
    handleApiError(error);
  }
  return;
};
const handleFormDataPatchRequest = async <R extends object, A extends object>({
  url,
  data,
  showLoader,
  onUploadProgress,
}: {
  url: string;
  data: A;
  showLoader?: boolean;
  onUploadProgress?: (percent: number) => void;
}): Promise<R | undefined> => {
  try {
    const response = await patchWithSingleFile({
      url,
      data,
      showLoader,
      onUploadProgress,
    });
    return parseApiResponse<R>(response);
  } catch (error) {
    handleApiError(error);
  }
  return;
};
const handleDeleteApiRequest = async <R extends object, A extends object>({
  url,
  data,
  showLoader,
  showError = true,
}: {
  url: string;
  data: A;
  showLoader?: boolean;
  /** When true, don't show toast on error */
  showError?: boolean;
}): Promise<R | undefined> => {
  try {
    const response = await remove({
      url,
      data,
      showLoader,
    });
    return parseApiResponse<R>(response);
  } catch (error) {
    if (showError) {
      handleApiError(error);
    }
  }
  return;
};

const handlePutApiRequest = async <R extends object, A extends object>({
  url,
  data,
}: {
  url: string;
  data: A;
}): Promise<R | undefined> => {
  try {
    const response = await put({
      url,
      data,
    });
    return parseApiResponse<R>(response);
  } catch (error) {
    handleApiError(error);
  }
  return;
};

const handleFormDataPutRequest = async <R extends object, A extends object>({
  url,
  data,
  showLoader,
  onUploadProgress,
}: {
  url: string;
  data: A;
  showLoader?: boolean;
  onUploadProgress?: (percent: number) => void;
}): Promise<R | undefined> => {
  try {
    const response = await putWithSingleFile({
      url,
      data,
      showLoader,
      onUploadProgress,
    });
    return parseApiResponse<R>(response);
  } catch (error) {
    handleApiError(error);
  }
  return;
};
const handleFormDataPostRequest = async <R extends object, A extends object>({
  url,
  data,
  showLoader,
  onUploadProgress,
}: {
  url: string;
  data: A;
  showLoader?: boolean;
  onUploadProgress?: (percent: number) => void;
}): Promise<R | undefined> => {
  try {
    const response = await postWithSingleFile({
      url,
      data,
      showLoader,
      onUploadProgress,
    });
    return parseApiResponse<R>(response);
  } catch (error) {
    handleApiError(error);
  }
  return;
};

export {
  handleGetApiRequest,
  handlePostApiRequest,
  handleFormDataPostRequest,
  handleFormDataPatchRequest,
  handlePutApiRequest,
  handlePatchApiRequest,
  handleFormDataPutRequest,
  handleDeleteApiRequest,
};
