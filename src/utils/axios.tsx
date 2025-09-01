import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { getItem, removeMultipleItem } from './index';
import { ENV_CONSTANTS, VARIABLES } from 'constants/common';
import store from 'store/store';
import { setIsAppLoading, setIsUserLoggedIn } from 'store/slices/appSettings';
import NetInfo from '@react-native-community/netinfo';
interface RequestOptions {
  url: string;
  data?: object;
  config?: AxiosRequestConfig;
  includeToken?: boolean;
  showLoader?: boolean;
}

export interface ErrorResponse {
  error?: {
    messages: string[];
  };
  message?: string;
  messages?: string[];
  errors?: string[] | { field: string; message: string }[];
  success?: boolean;
}

export interface ErrorMessage {
  error: {
    messages: string;
  };
}

let pendingRequests: (() => void)[] = [];

NetInfo.addEventListener(state => {
  if (state.isConnected) {
    pendingRequests.forEach(cb => cb());
    pendingRequests = [];
  }
});

const axiosInstance = axios.create({
  baseURL: ENV_CONSTANTS.BASE_URL,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
  },
});

const setAuthToken = async () => {
  try {
    const USER_TOKEN = await getItem(VARIABLES.USER_TOKEN);
    if (USER_TOKEN) {
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${USER_TOKEN}`;
    } else {
      delete axiosInstance.defaults.headers.common.Authorization;
    }
  } catch (error) {
    console.error('Error setting auth token:', error);
    // Handle the error if necessary
  }
};

class HttpError extends Error {
  status: number;
  errors?: string[] | string;
  constructor(message: string | undefined, status: number, errors?: string[] | string) {
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

const checkUnAuth = async (error?: string) => {
  if (error === 'Unauthenticated') {
    store.dispatch(setIsUserLoggedIn(false));
    await removeMultipleItem([VARIABLES.IS_USER_LOGGED_IN, VARIABLES.USER_TOKEN]);
  }
};

const handleRequestError = async (error: AxiosError<ErrorResponse>) => {
  store.dispatch(setIsAppLoading(false));

  if (axios.isAxiosError(error)) {
    // 🌐 Network or socket error
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        throw new SocketError('Socket timeout: The request took too long to complete.');
      }
      const netState = await NetInfo.fetch();
      if (!netState.isConnected) {
        throw new NetworkError('No Internet Connection. Please check your network.');
      }
      throw new NetworkError('Server unreachable. Please try again later.');
    }

    const status = error.response.status;
    const responseData = error.response.data;

    // 1️⃣ Check deep nested error: { error: { messages: [...] } }
    if (responseData?.error?.messages?.[0]) {
      const message = responseData.error.messages[0];
      checkUnAuth(message);
      throw new HttpError(message, status);
    }

    // 2️⃣ Check for general messages: { messages: [...] }
    if (responseData?.messages?.[0]) {
      const message = responseData.messages[0];
      checkUnAuth(message);
      throw new HttpError(message, status, responseData.errors);
    }

    // 3️⃣ Field validation or fallback single message
    if (responseData?.errors?.length > 0 || responseData?.message) {
      const fallbackMessage =
        responseData.message || responseData.errors?.[0]?.message || 'An unknown error occurred';

      checkUnAuth(fallbackMessage);
      throw new HttpError(fallbackMessage, status, responseData.errors);
    }

    // 4️⃣ Fallback to status text
    throw new HttpError(error.response.statusText, status);
  }

  // ❌ Not an Axios error
  throw error;
};

const makeHttpRequest = async (
  config: AxiosRequestConfig,
  includeToken = true,
  showLoader = true,
) => {
  try {
    if (showLoader) {
      store.dispatch(setIsAppLoading(true));
    }
    if (includeToken) {
      await setAuthToken();
    }
    const response = await axiosInstance(config);
    store.dispatch(setIsAppLoading(false));
    if (response?.data?.response) {
      return response?.data?.response;
    } else {
      return response?.data;
    }
  } catch (error) {
    if (error instanceof AxiosError && error?.response?.data?.error?.type === 'card_error') {
      throw new HttpError(
        error?.response?.data?.error?.message,
        error?.response?.data?.error?.code,
      );
    } else if (error instanceof NetworkError) {
      return new Promise((resolve, reject) => {
        pendingRequests.push(() => {
          makeHttpRequest(config, includeToken).then(resolve).catch(reject);
        });
      });
    } else {
      handleRequestError(error as AxiosError<ErrorResponse>);
    }
    store.dispatch(setIsAppLoading(false));
  }
};

const get = async ({
  url,
  config = {},
  includeToken = true,
  showLoader = true,
}: RequestOptions) => {
  return makeHttpRequest({ method: 'GET', url, ...config }, includeToken, showLoader);
};

const post = async ({
  url,
  data,
  config = {},
  includeToken = true,
  showLoader = true,
}: RequestOptions) => {
  return makeHttpRequest({ method: 'POST', url, data, ...config }, includeToken, showLoader);
};

const put = async ({
  url,
  data,
  config = {},
  includeToken = true,
  showLoader = true,
}: RequestOptions) => {
  return makeHttpRequest({ method: 'PUT', url, data, ...config }, includeToken, showLoader);
};

const patch = async ({
  url,
  data,
  config = {},
  includeToken = true,
  showLoader = true,
}: RequestOptions) => {
  return makeHttpRequest({ method: 'PATCH', url, data, ...config }, includeToken, showLoader);
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

  return makeHttpRequest(requestOptions, includeToken, showLoader);
};

const postWithSingleFile = async ({
  url,
  data,
  config = {},
  includeToken = true,
  showLoader = true,
}: RequestOptions) => {
  const formData = new FormData();
  if (data) {
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
  }

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
  );
};
const putWithSingleFile = async ({
  url,
  data,
  config = {},
  includeToken = true,
  showLoader = true,
}: RequestOptions) => {
  const formData = new FormData();
  if (data) {
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
  }

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
  );
};

const patchWithSingleFile = async ({
  url,
  data,
  config = {},
  includeToken = true,
  showLoader = true,
}: RequestOptions) => {
  const formData = new FormData();
  if (data) {
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append('_method', 'PATCH');
  }
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
