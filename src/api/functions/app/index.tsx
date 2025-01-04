import {COMMON_TEXT} from 'constants/screens';
import i18n from 'i18n/index';
import {get, post} from 'utils/axios';
import {showToast} from 'utils/toast';

// R type for Return
// A type for Accept

const handleGetApiRequest = async <R extends object>(
  url: string,
): Promise<R | undefined> => {
  try {
    const response = await get({
      url,
    });
    return (
      response?.data ?? {
        message: response?.messages?.[0],
        code: response?.code,
      }
    );
  } catch (error) {
    const errorMessage =
      (error instanceof Error && error.message) ||
      i18n.t(COMMON_TEXT.SOMETHING_WENT_WRONG);
    showToast({
      message: errorMessage,
    });
  }
  return;
};

const handlePostApiRequest = async <R extends object, A extends object>(
  url: string,
  data: A,
): Promise<R | undefined> => {
  try {
    const response = await post({
      url,
      data,
    });
    return (
      response?.data ?? {
        message: response?.messages?.[0],
        code: response?.code,
      }
    );
  } catch (error) {
    const errorMessage =
      (error instanceof Error && error.message) ||
      i18n.t(COMMON_TEXT.SOMETHING_WENT_WRONG);
    showToast({
      message: errorMessage,
    });
  }
  return;
};

export {handleGetApiRequest, handlePostApiRequest};
