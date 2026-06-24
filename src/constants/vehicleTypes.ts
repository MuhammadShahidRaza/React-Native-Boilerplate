import type { DropdownItemProps } from 'components/common/Dropdown';
import { APP_CONFIG } from 'config/app';

export const WORKER_VEHICLE_TYPE_OPTIONS = [
  { label: 'Car', value: 'car' },
  { label: 'Bike', value: 'bike' },
  // { label: 'Van', value: 'van' },
  // { label: 'Motorcycle', value: 'motorcycle' },
  // { label: 'Truck', value: 'truck' },
] as const;

/** Ride-tier labels that were incorrectly used as vehicle types. */
const LEGACY_VEHICLE_TYPE_MAP: Record<
  string,
  (typeof WORKER_VEHICLE_TYPE_OPTIONS)[number]['value']
> = {
  standard: 'car',
  premium: 'car',
  comfort: 'car',
  business: 'car',
  xl: 'car',
};

export function vehicleTypeToApiValue(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';

  const byLabel = WORKER_VEHICLE_TYPE_OPTIONS.find(
    option => option.label.toLowerCase() === trimmed.toLowerCase(),
  );
  if (byLabel) return byLabel.value;

  const lower = trimmed.toLowerCase();
  if (LEGACY_VEHICLE_TYPE_MAP[lower]) return LEGACY_VEHICLE_TYPE_MAP[lower];

  const byValue = WORKER_VEHICLE_TYPE_OPTIONS.find(option => option.value === lower);
  if (byValue) return byValue.value;

  return lower;
}

export function vehicleTypeToFormLabel(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';

  const apiValue = vehicleTypeToApiValue(trimmed);
  const option = WORKER_VEHICLE_TYPE_OPTIONS.find(item => item.value === apiValue);
  return option?.label ?? trimmed;
}

export function vehicleTypeDisplayLabel(input: string): string {
  return vehicleTypeToFormLabel(input) || input.trim();
}

/** Service tier shown in the "Vehicle Type" picker — same 3 options for courier and driver. */
const WORKER_VEHICLE_CATEGORY_OPTIONS = [
  { label: 'Standard', value: 'standard' },
  { label: 'Comfort', value: 'comfort' },
  { label: 'Business', value: 'business' },
] as const;

export const WORKER_VEHICLE_TYPE_DROPDOWN: DropdownItemProps[] =
  WORKER_VEHICLE_CATEGORY_OPTIONS.map((option, index) => ({
    name: option.label,
    id: index + 1,
  }));

/** Tier sent to the backend — courier always gets 'standard' (no picker shown); driver sends their pick. */
export function resolveWorkerVehicleApiType(
  selectedTier: string,
  role: string | null | undefined,
): string {
  if (role === APP_CONFIG.COURIER_ROLE) return 'standard';
  return vehicleTypeToApiValue(selectedTier);
}
