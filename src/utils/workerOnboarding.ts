import type { User } from 'types/responseTypes';
import { pickFromUserDetails } from 'api/normalizers/snlift';
import { vehicleTypeToApiValue } from 'constants/vehicleTypes';
import { hasUri } from 'utils/index';
import store from 'store/store';
import {
  setDocumentsComplete,
  setVehicleDetailsComplete,
  setWorkerOnline,
} from 'store/slices/worker';
import type { SelectedMedia } from 'hooks/useMediaPicker';

function hasUploadedMedia(value: unknown): boolean {
  if (!value) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return hasUri(value);
}

/** API expects YYYY-MM-DD (e.g. 2028-12-31). */
function formatValidityDateForApi(isoDate: string): string {
  if (!isoDate?.trim()) return '';
  const raw = isoDate.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  const ddmmyyyy = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (ddmmyyyy) return `${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`;
  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return '';
}

/** PATCH user/onboarding — vehicle fields (matches backend schema). */
export function buildVehicleDetailsUploadPayload(values: {
  vehicle_brand: string;
  vehicle_model: string;
  vehicle_license_plate: string;
  vehicle_year: string;
  vehicle_color: string;
  vehicle_type: string;
}): Record<string, string> {
  const year = values.vehicle_year.trim();
  return {
    vehicle_brand: values.vehicle_brand.trim(),
    vehicle_model: values.vehicle_model.trim(),
    vehicle_license_plate: values.vehicle_license_plate.trim(),
    vehicle_year: year,
    year,
    vehicle_color: values.vehicle_color.trim(),
    vehicle_type: vehicleTypeToApiValue(values.vehicle_type),
  };
}

/** PATCH user/onboarding — document fields (matches nested details schema). */
export function buildWorkerDocumentsUploadPayload(values: {
  driver_license_number: string;
  driver_license_validity_date: string;
  driver_license_front?: SelectedMedia | null | string;
  driver_license_back?: SelectedMedia | null | string;
  mot_picture?: SelectedMedia | null | string;
}): Record<string, unknown> {
  const licenseNumber = values.driver_license_number?.trim();
  const validityDate = formatValidityDateForApi(values.driver_license_validity_date);
  const payload: Record<string, unknown> = {};

  if (licenseNumber) {
    payload.driver_license_number = licenseNumber;
    payload.driving_license_number = licenseNumber;
  }

  if (validityDate) {
    payload.driver_license_validity_date = validityDate;
  }

  if (hasUri(values.driver_license_front)) {
    // Backend saves MOT as mot_certificate; license images use driver_license_* on upload.
    payload.driver_license_front = values.driver_license_front;
    payload.driving_license_front = values.driver_license_front;
  }

  if (hasUri(values.driver_license_back)) {
    payload.driver_license_back = values.driver_license_back;
    payload.driving_license_back = values.driver_license_back;
  }

  if (hasUri(values.mot_picture)) {
    payload.mot_certificate = values.mot_picture;
  }

  return payload;
}

function readDetailsField(user: User | null | undefined, keys: string[]): string | undefined {
  const value = pickFromUserDetails(user, keys);
  return value || undefined;
}

export function isWorkerVehicleComplete(user: User | null | undefined): boolean {
  const brand = readDetailsField(user, ['vehicle_brand', 'vehicle_make']);
  const model = readDetailsField(user, ['vehicle_model', 'category']);
  const plate = readDetailsField(user, ['vehicle_license_plate', 'license_plate']);
  const yearRaw = readDetailsField(user, ['vehicle_year', 'year']);
  const hasValidYear = (() => {
    if (!yearRaw) return false;
    if (!/^\d{4}$/.test(yearRaw)) return false;
    if (brand && yearRaw.toLowerCase() === brand.toLowerCase()) return false;
    return true;
  })();
  const color = readDetailsField(user, ['vehicle_color', 'color']);
  const type = readDetailsField(user, ['vehicle_type', 'type']);
  const hasCore = Boolean(brand && model && plate && color && type);
  return hasCore && hasValidYear;
}

export function isWorkerDocumentsComplete(user: User | null | undefined): boolean {
  if (!user?.details) return false;
  const d = user.details as Record<string, unknown>;
  const licenseNumber = readDetailsField(user, [
    'driver_license_number',
    'driving_license_number',
  ]);
  const validityDate = readDetailsField(user, [
    'driver_license_validity_date',
    'issue_date',
  ]);
  const licenseFront =
    d.driving_license_front ?? d.driver_license_front ?? null;
  const licenseBack =
    d.driving_license_back ?? d.driver_license_back ?? null;
  const mot =
    d.business_license_front ?? d.mot_certificate ?? null;
  return Boolean(
    licenseNumber &&
      validityDate &&
      hasUploadedMedia(licenseFront) &&
      hasUploadedMedia(licenseBack) &&
      hasUploadedMedia(mot),
  );
}

export function syncWorkerOnboardingFlags(user: User | null | undefined): void {
  store.dispatch(setVehicleDetailsComplete(isWorkerVehicleComplete(user)));
  store.dispatch(setDocumentsComplete(isWorkerDocumentsComplete(user)));
}

/** Read backend online flag (`is_online`, legacy `availabilty`). */
export function parseUserIsOnline(user: User | null | undefined): boolean | null {
  if (!user) return null;
  const raw: unknown =
    user.is_online ??
    user.availabilty ??
    (user as unknown as Record<string, unknown>).availability;
  if (raw === undefined || raw === null) return null;
  if (typeof raw === 'boolean') return raw;
  if (typeof raw === 'number') return raw === 1;
  if (typeof raw === 'string') {
    const value = raw.trim().toLowerCase();
    if (value === '') return null;
    if (value === '1' || value === 'true' || value === 'online') return true;
    if (value === '0' || value === 'false' || value === 'offline') return false;
  }
  return null;
}

export function syncWorkerOnlineFromUser(user: User | null | undefined): void {
  const isOnline = parseUserIsOnline(user);
  if (isOnline === null) return;
  store.dispatch(setWorkerOnline(isOnline));
}

export function isWorkerOnboardingComplete(user: User | null | undefined): boolean {
  return isWorkerVehicleComplete(user) && isWorkerDocumentsComplete(user);
}

function parseBalanceValue(raw: string | number | null | undefined): number | null {
  if (raw === undefined || raw === null || raw === '') return null;
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : null;
  const n = parseFloat(String(raw).replace(/[^0-9.-]/g, ''));
  return Number.isNaN(n) ? null : n;
}

/** Spendable worker wallet balance (commission tokens). */
export function parseWalletBalance(user: User | null | undefined): number {
  if (!user) return 0;
  const u = user as User & {
    wallet_balance?: number | string;
    total_cfa_balance?: number | string;
  };
  const fromWallet = parseBalanceValue(u.wallet_balance);
  if (fromWallet !== null) return fromWallet;
  const fromTotalCfa = parseBalanceValue(u.total_cfa_balance);
  if (fromTotalCfa !== null) return fromTotalCfa;
  const fromBalance = parseBalanceValue(u.balance);
  if (fromBalance !== null) return fromBalance;
  return 0;
}

export function hasWalletFunds(user: User | null | undefined): boolean {
  return parseWalletBalance(user) > 0;
}

export const WORKER_WALLET_TOP_OFF = {
  title: 'Top off your wallet',
  description:
    'Your wallet balance is currently 0. Contact the Admin to top off your wallet and continue using the Sn Lift app.',
  primaryButtonText: 'Contact Admin',
} as const;
