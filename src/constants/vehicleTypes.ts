import type { DropdownItemProps } from 'components/common/Dropdown';

export const WORKER_VEHICLE_TYPE_OPTIONS = [
  { label: 'Car', value: 'car' },
  { label: 'Bike', value: 'bike' },
  { label: 'Van', value: 'van' },
  { label: 'Motorcycle', value: 'motorcycle' },
  { label: 'Truck', value: 'truck' },
] as const;

/** Ride-tier labels that were incorrectly used as vehicle types. */
const LEGACY_VEHICLE_TYPE_MAP: Record<string, (typeof WORKER_VEHICLE_TYPE_OPTIONS)[number]['value']> =
  {
    standard: 'car',
    premium: 'car',
    comfort: 'car',
    business: 'car',
    xl: 'van',
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

export const WORKER_VEHICLE_TYPE_DROPDOWN: DropdownItemProps[] = WORKER_VEHICLE_TYPE_OPTIONS.map(
  (option, index) => ({
    name: option.label,
    id: index + 1,
  }),
);
