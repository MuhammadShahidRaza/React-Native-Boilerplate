import type { DropdownItemProps } from 'components/common/Dropdown';
import { APP_CONFIG } from 'config/app';

/** Vehicle type shown in the picker and sent to the backend as-is. */
export const WORKER_VEHICLE_TYPE_OPTIONS = [
  { label: 'Standard', value: 'standard' },
  { label: 'Comfort', value: 'comfort' },
  { label: 'Business', value: 'business' },
] as const;

export function vehicleTypeToApiValue(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';

  const byLabel = WORKER_VEHICLE_TYPE_OPTIONS.find(
    option => option.label.toLowerCase() === trimmed.toLowerCase(),
  );
  if (byLabel) return byLabel.value;

  return trimmed.toLowerCase();
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

export const WORKER_VEHICLE_TYPE_DROPDOWN: DropdownItemProps[] =
  WORKER_VEHICLE_TYPE_OPTIONS.map((option, index) => ({
    name: option.label,
    id: index + 1,
  }));

/** Vehicle type sent to the backend — courier always gets 'standard' (no picker shown); driver sends their pick. */
export function resolveWorkerVehicleApiType(
  selectedType: string,
  role: string | null | undefined,
): string {
  if (role === APP_CONFIG.COURIER_ROLE) return 'standard';
  return vehicleTypeToApiValue(selectedType);
}
