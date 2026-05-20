import type { User } from 'types/responseTypes';
import { hasUri } from 'utils/index';

export function isWorkerVehicleComplete(user: User | null | undefined): boolean {
  const d = user?.details as Record<string, string | undefined> | undefined;
  const u = user as User & {
    vehicle_brand?: string;
    vehicle_model?: string;
    vehicle_license_plate?: string;
    vehicle_year?: string;
    vehicle_color?: string;
    vehicle_type?: string;
  };
  const brand = (u?.vehicle_brand ?? d?.vehicle_brand)?.trim();
  const model = (u?.vehicle_model ?? d?.vehicle_model)?.trim();
  const plate = (u?.vehicle_license_plate ?? d?.vehicle_license_plate)?.trim();
  const year = (u?.vehicle_year ?? d?.vehicle_year)?.trim();
  const color = (u?.vehicle_color ?? d?.vehicle_color)?.trim();
  const type = (u?.vehicle_type ?? d?.vehicle_type)?.trim();
  return Boolean(brand && model && plate && year && color && type);
}

export function isWorkerDocumentsComplete(user: User | null | undefined): boolean {
  const d = user?.details;
  if (!d) return false;
  const hasLicense =
    hasUri(d.driving_license_front) && hasUri(d.driving_license_back);
  const hasMot = hasUri(d.business_license_front);
  return Boolean(hasLicense && hasMot);
}

export function isWorkerOnboardingComplete(user: User | null | undefined): boolean {
  return isWorkerVehicleComplete(user) && isWorkerDocumentsComplete(user);
}

export function parseWalletBalance(user: User | null | undefined): number {
  const raw = (user as User & { wallet_balance?: number | string })?.wallet_balance;
  if (typeof raw === 'number') return raw;
  if (typeof raw === 'string') {
    const n = parseFloat(raw.replace(/[^0-9.-]/g, ''));
    return Number.isNaN(n) ? 0 : n;
  }
  return user?.upcoming_balance ?? 0;
}
