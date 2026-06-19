import { INITIAL_REGION } from 'constants/common';
import type { Address, AddressListData, AddressPayload } from 'types/responseTypes';

const now = () => new Date().toISOString();

function buildSeedAddresses(): Address[] {
  return [
    {
      id: 1,
      user_id: 1,
      street: '67 Murray Street',
      city: 'New York',
      state: 'NY',
      postal_code: '10001',
      country: 'USA',
      full_address: '67 Murray Street, New York, NY 10001, USA',
      latitude: String(INITIAL_REGION.latitude + 0.005),
      longitude: String(INITIAL_REGION.longitude - 0.003),
      is_default: 1,
      created_at: now(),
      updated_at: now(),
      deleted_at: null,
      label: 'Home',
    },
  ];
}

let alphaAddresses = buildSeedAddresses();
let alphaNextAddressId = 100;

export function resetAlphaAddressStore(): void {
  alphaAddresses = buildSeedAddresses();
  alphaNextAddressId = 100;
}

export function getAlphaAddressList(page = 1): AddressListData {
  return {
    addresses: [...alphaAddresses],
    current_page: page,
    last_page: 1,
    per_page: alphaAddresses.length,
    total: alphaAddresses.length,
  };
}

export function createAlphaAddress(data: AddressPayload): Address {
  const id = alphaNextAddressId++;
  if (data.is_default) {
    alphaAddresses = alphaAddresses.map(a => ({ ...a, is_default: 0 }));
  }
  const addr: Address = {
    id,
    user_id: 1,
    street: data.street,
    city: data.city,
    state: data.state,
    postal_code: data.postal_code,
    country: data.country ?? '',
    full_address: data.street,
    latitude: data.latitude,
    longitude: data.longitude,
    is_default: data.is_default ? 1 : 0,
    created_at: now(),
    updated_at: now(),
    deleted_at: null,
    label: data.title ?? data.label ?? 'Home',
  };
  alphaAddresses.unshift(addr);
  return addr;
}

export function updateAlphaAddress(
  id: number,
  data: Partial<AddressPayload>,
): Address | undefined {
  const idx = alphaAddresses.findIndex(a => a.id === id);
  if (idx < 0) return undefined;

  if (data.is_default) {
    alphaAddresses = alphaAddresses.map(a => ({
      ...a,
      is_default: a.id === id ? 1 : 0,
    }));
  }

  const current = alphaAddresses[idx];
  const updated: Address = {
    ...current,
    street: data.street ?? current.street,
    city: data.city ?? current.city,
    state: data.state ?? current.state,
    postal_code: data.postal_code ?? current.postal_code,
    country: data.country ?? current.country,
    full_address: data.street ?? current.full_address,
    latitude: data.latitude ?? current.latitude,
    longitude: data.longitude ?? current.longitude,
    is_default:
      data.is_default !== undefined ? (data.is_default ? 1 : 0) : current.is_default,
    label: data.title ?? data.label ?? current.label,
    updated_at: now(),
  };
  alphaAddresses[idx] = updated;
  return updated;
}

export function deleteAlphaAddress(id: number): void {
  alphaAddresses = alphaAddresses.filter(a => a.id !== id);
}
