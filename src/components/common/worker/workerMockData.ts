export type WorkerTripRecord = {
  id: string;
  date: string;
  earned: string;
  pickupLabel: string;
  pickupAddress: string;
  destinationLabel: string;
  destinationAddress: string;
  distance: string;
  rating: string;
  payment: string;
};

export const WORKER_HISTORY_STATS = {
  trips: '04',
  tripsLabel: 'Trips',
  earned: 'CFA 59.45',
  earnedLabel: 'Earned',
  rating: '4.9',
  ratingLabel: 'Avg Rating',
} as const;

export const WORKER_HISTORY_TRIPS: WorkerTripRecord[] = [
  {
    id: '1',
    date: '15-04-2026',
    earned: 'CFA 59.45',
    pickupLabel: 'Pickup: Central Station',
    pickupAddress: '67 Murray Street, NY',
    destinationLabel: 'Destination: Airport Terminal 2',
    destinationAddress: '85 W Broadway, NY',
    distance: '12.3 km',
    rating: '5.0',
    payment: 'Cash',
  },
  {
    id: '2',
    date: '15-04-2026',
    earned: 'CFA 59.45',
    pickupLabel: 'Pickup: Central Station',
    pickupAddress: '67 Murray Street, NY',
    destinationLabel: 'Destination: Airport Terminal 2',
    destinationAddress: '85 W Broadway, NY',
    distance: '12.3 km',
    rating: '5.0',
    payment: 'Cash',
  },
];

export type WorkerServiceType = 'parcel' | 'food';

export type WorkerRequestRecord = {
  id: string;
  customerName: string;
  fare: string;
  serviceType: WorkerServiceType;
};

export function formatWorkerServiceType(type: WorkerServiceType): string {
  return type === 'parcel' ? 'Parcel' : 'Food';
}

export type WorkerRequestDetail = WorkerRequestRecord & {
  pickupAddress: string;
  dropoffAddress: string;
  dropoffShortName: string;
  distance: string;
  eta: string;
  payment: string;
  baseFare: string;
  commission: string;
  earned: string;
  previousWallet: string;
  newWallet: string;
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
};

export const WORKER_MOCK_REQUESTS: WorkerRequestRecord[] = [
  { id: '1', customerName: 'John Doe', fare: 'CFA 18.50', serviceType: 'parcel' },
  { id: '2', customerName: 'John Doe', fare: 'CFA 18.50', serviceType: 'food' },
  { id: '3', customerName: 'John Doe', fare: 'CFA 18.50', serviceType: 'food' },
];

export const WORKER_REQUEST_DETAILS: Record<string, WorkerRequestDetail> = {
  '1': {
    id: '1',
    customerName: 'John Doe',
    fare: 'CFA 18.50',
    serviceType: 'parcel',
    pickupAddress: '67 Murray Street, NY',
    dropoffAddress: '85 W Broadway, NY',
    dropoffShortName: 'Airport Terminal 2',
    distance: '6.8 km',
    eta: '12 min',
    payment: 'Cash',
    baseFare: 'CFA 550',
    commission: '-CFA 82',
    earned: 'CFA 468',
    previousWallet: 'CFA 500',
    newWallet: 'CFA 418',
    pickupLat: 40.7128,
    pickupLng: -74.006,
    dropoffLat: 40.708,
    dropoffLng: -74.001,
  },
  '2': {
    id: '2',
    customerName: 'John Doe',
    fare: 'CFA 18.50',
    serviceType: 'food',
    pickupAddress: '67 Murray Street, NY',
    dropoffAddress: '85 W Broadway, NY',
    dropoffShortName: 'Airport Terminal 2',
    distance: '6.8 km',
    eta: '12 min',
    payment: 'Cash',
    baseFare: 'CFA 550',
    commission: '-CFA 82',
    earned: 'CFA 468',
    previousWallet: 'CFA 500',
    newWallet: 'CFA 418',
    pickupLat: 40.7128,
    pickupLng: -74.006,
    dropoffLat: 40.708,
    dropoffLng: -74.001,
  },
  '3': {
    id: '3',
    customerName: 'John Doe',
    fare: 'CFA 18.50',
    serviceType: 'food',
    pickupAddress: '67 Murray Street, NY',
    dropoffAddress: '85 W Broadway, NY',
    dropoffShortName: 'Airport Terminal 2',
    distance: '6.8 km',
    eta: '12 min',
    payment: 'Cash',
    baseFare: 'CFA 550',
    commission: '-CFA 82',
    earned: 'CFA 468',
    previousWallet: 'CFA 500',
    newWallet: 'CFA 418',
    pickupLat: 40.7128,
    pickupLng: -74.006,
    dropoffLat: 40.708,
    dropoffLng: -74.001,
  },
};

export function getWorkerRequestDetail(requestId: string): WorkerRequestDetail {
  return WORKER_REQUEST_DETAILS[requestId] ?? WORKER_REQUEST_DETAILS['1'];
}

export const WORKER_EARNINGS_SUMMARY = {
  total: 'CFA 850',
  today: '+CFA 10.19',
  week: '+CFA 3',
  month: '+CFA 7.73',
} as const;
