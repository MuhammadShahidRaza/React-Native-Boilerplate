import { INITIAL_REGION } from 'constants/common';
import type { MapCoord } from 'utils/coordinateAlongPolyline';

export const MOCK_FOOD_ORDER = {
  restaurantName: 'Burger Lab',
  etaLabel: '25-35 mins',
  courierName: 'John Doe',
  courierPhone: '+01000000000',
  vehicleType: 'YAMAHA',
  licensePlate: 'AA-001-AA',
  vehicleColor: 'Black',
  pickup: {
    latitude: INITIAL_REGION.latitude + 0.006,
    longitude: INITIAL_REGION.longitude - 0.004,
  } satisfies MapCoord,
  dropoff: {
    latitude: INITIAL_REGION.latitude - 0.005,
    longitude: INITIAL_REGION.longitude + 0.006,
  } satisfies MapCoord,
};
