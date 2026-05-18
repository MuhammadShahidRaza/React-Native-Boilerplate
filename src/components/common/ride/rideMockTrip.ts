import { IMAGES } from 'constants/assets';

/** Mock trip data shared by driver-found and track-ride screens until API wiring. */
export const MOCK_RIDE_TRIP = {
  driverName: 'John Doe',
  rating: '4.9',
  avatar: IMAGES.USER,
  vehicleModel: 'Toyota Corolla',
  vehiclePlate: 'ABC-1234',
  vehicleStats: [
    { icon: 'car', label: 'Vehicle Type', value: 'Toyota' },
    { icon: 'card-text-outline', label: 'License Plate', value: 'AA-001-AA' },
    { icon: 'water', label: 'Color', value: 'Black' },
  ],
  estimateFare: 'CFA 330',
  paymentMethod: 'Cash',
};
