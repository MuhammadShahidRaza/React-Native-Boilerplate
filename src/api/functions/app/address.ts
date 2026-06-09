import { API_ROUTES } from 'api/routes';
import { extractApiList } from 'api/normalizers/snlift';
import {
  handleDeleteApiRequest,
  handleGetApiRequest,
  handlePatchApiRequest,
  handlePostApiRequest,
} from '.';
import { Address, AddressListData, AddressPayload } from 'types/responseTypes';

/** Postman: POST /address/create — `title`, `address`, string lat/long. */
function toApiAddressBody(data: Partial<AddressPayload> & { street: string }): Record<string, unknown> {
  const body: Record<string, unknown> = {
    title: data.title ?? data.label ?? 'Home',
    address: data.street,
    city: data.city ?? '',
    state: data.state ?? '',
    postal_code: data.postal_code ?? '',
    latitude: String(data.latitude ?? ''),
    longitude: String(data.longitude ?? ''),
  };
  if (data.is_default !== undefined) body.is_default = data.is_default;
  return body;
}

function normalizeAddressItem(raw: Record<string, unknown>): Address {
  const street =
    String(raw.address ?? raw.street ?? '').trim() ||
    String(raw.title ?? '').trim();
  return {
    id: Number(raw.id) || 0,
    user_id: Number(raw.user_id) || 0,
    street,
    city: String(raw.city ?? ''),
    full_address: String(raw.full_address ?? raw.address ?? street),
    state: String(raw.state ?? ''),
    postal_code: String(raw.postal_code ?? ''),
    country: String(raw.country ?? ''),
    latitude: String(raw.latitude ?? ''),
    longitude: String(raw.longitude ?? ''),
    is_default: Number(raw.is_default) ? 1 : 0,
    created_at: String(raw.created_at ?? ''),
    updated_at: String(raw.updated_at ?? ''),
    deleted_at: (raw.deleted_at as string | null) ?? null,
    label: String(raw.title ?? raw.label ?? ''),
  };
}

function normalizeAddressListResponse(raw: unknown, page = 1): AddressListData | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const r = raw as AddressListData & Record<string, unknown>;
  const addresses = extractApiList<Record<string, unknown>>(raw, ['addresses', 'data', 'items']).map(
    normalizeAddressItem,
  );
  return {
    ...r,
    addresses,
    current_page: Number(r.current_page ?? page),
    last_page: Number(r.last_page ?? 1),
    per_page: Number(r.per_page ?? addresses.length),
    total: Number(r.total ?? addresses.length),
  };
}

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
  return normalizeAddressListResponse(response, page);
};

/** Create new address — POST /address/create or POST /address (alias). */
const createAddress = async (data: AddressPayload): Promise<Address | undefined> => {
  const body = toApiAddressBody(data);
  let response = await handlePostApiRequest<Record<string, unknown>, Record<string, unknown>>({
    url: API_ROUTES.ADDRESS_CREATE,
    data: body,
  });
  if (!response) {
    response = await handlePostApiRequest<Record<string, unknown>, Record<string, unknown>>({
      url: API_ROUTES.ADDRESS_LIST,
      data: body,
    });
  }
  // API wraps the created address under an "address" key: { address: { id, title, ... } }
  const raw = ((response as any)?.address as Record<string, unknown>) ?? response;
  return raw ? normalizeAddressItem(raw) : undefined;
};

/** Update address by id */
const updateAddress = async (
  id: number,
  data: Partial<AddressPayload>,
): Promise<Address | undefined> => {
  const response = await handlePatchApiRequest<Record<string, unknown>, Record<string, unknown>>({
    url: API_ROUTES.ADDRESS_UPDATE(id),
    data: toApiAddressBody({
      street: data.street ?? '',
      ...data,
      is_default: data.is_default ?? false,
    }),
  });
  const raw = ((response as any)?.address as Record<string, unknown>) ?? response;
  return raw ? normalizeAddressItem(raw) : undefined;
};

/** Delete address by id */
const deleteAddress = async (id: number): Promise<void> => {
  await handleDeleteApiRequest<{ message?: string }, Record<string, never>>({
    url: API_ROUTES.ADDRESS_DELETE(id),
    data: {},
  });
};

export { getAddressList, createAddress, updateAddress, deleteAddress };
