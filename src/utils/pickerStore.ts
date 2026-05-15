import type { AddressDetails } from './location';

type PickerField = 'pickup' | 'dropoff';

interface PickerResult {
  address: AddressDetails;
  field: PickerField;
}

let pickerResult: PickerResult | null = null;

export const setPickerResult = (result: PickerResult) => {
  pickerResult = result;
};

export const getAndClearPickerResult = () => {
  const result = pickerResult;
  pickerResult = null;
  return result;
};
