import { API_ROUTES } from 'api/routes';
import {
  handleDeleteApiRequest,
  handleGetApiRequest,
  handlePatchApiRequest,
  handlePostApiRequest,
} from '.';
import { Address, AddressListData, AddressPayload } from 'types/responseTypes';

/** Get paginated address list */
const getAddressList = async ({
  page = 1,
}: {
  page?: number;
}): Promise<AddressListData | undefined> => {
  const response = await handleGetApiRequest<AddressListData>({
    url: API_ROUTES.ADDRESS_LIST,
    params: { page },
  });

  return response;
};

/** Create new address */
const createAddress = async (data: AddressPayload): Promise<Address | undefined> => {
  const response = await handlePostApiRequest<Address, AddressPayload>({
    url: API_ROUTES.ADDRESS_CREATE,
    data,
  });
  return response;
};

/** Update address by id */
const updateAddress = async (
  id: number,
  data: Partial<AddressPayload>,
): Promise<Address | undefined> => {
  const response = await handlePatchApiRequest<Address, Partial<AddressPayload>>({
    url: API_ROUTES.ADDRESS_UPDATE(id),
    data,
  });
  return response;
};

/** Delete address by id */
const deleteAddress = async (id: number): Promise<void> => {
  await handleDeleteApiRequest<{ message?: string }, Record<string, never>>({
    url: API_ROUTES.ADDRESS_DELETE(id),
    data: {},
  });
};

export { getAddressList, createAddress, updateAddress, deleteAddress };
