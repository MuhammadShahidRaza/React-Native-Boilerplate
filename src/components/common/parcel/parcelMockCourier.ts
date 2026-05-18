import { IMAGES } from 'constants/assets';

/** Mock courier data for send-parcel flow until API wiring. */
export const MOCK_PARCEL_COURIER = {
  courierName: 'John Doe',
  rating: '4.9',
  phone: '+01 000 0000 00',
  avatar: IMAGES.USER,
  trackingId: 'SN-PKL-2847',
  deliveryFee: 'CFA 100',
  paymentMethod: 'Cash',
  vehicleStats: [
    { icon: 'motorbike', label: 'Vehicle Type', value: 'YAMAHA' },
    { icon: 'card-text-outline', label: 'License Plate', value: 'AA-001-AA' },
    { icon: 'water', label: 'Color', value: 'Black' },
  ],
};
