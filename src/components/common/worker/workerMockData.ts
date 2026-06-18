export type WorkerTripRecord = {
  id: string;
  status: string;
  statusLabel: string;
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
    status: 'completed',
    statusLabel: 'Completed',
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
    status: 'completed',
    statusLabel: 'Completed',
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

export type WorkerServiceType = 'parcel' | 'food' | 'ride';

export type WorkerRequestRecord = {
  id: string;
  customerName: string;
  fare: string;
  serviceType: WorkerServiceType;
};

export function formatWorkerServiceType(type: WorkerServiceType): string {
  if (type === 'ride') return 'Ride';
  if (type === 'parcel') return 'Parcel';
  return 'Food';
}

export type WorkerRequestDetail = WorkerRequestRecord & {
  customerId?: number;
  customerPhone?: string;
  customerAvatar?: string | null;
  customerRating?: string;
  pickupAddress: string;
  pickupShortName: string;
  dropoffAddress: string;
  dropoffShortName: string;
  distance: string;
  eta: string;
  payment: string;
  baseFare: string;
  commission: string;
  commissionPercentage?: number;
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
    customerId: 1,
    customerPhone: '+1234567890',
    customerAvatar: null,
    customerRating: '4.8',
    pickupAddress: '67 Murray Street, NY',
    pickupShortName: 'Murray Street',
    dropoffAddress: '85 W Broadway, NY',
    dropoffShortName: 'Airport Terminal 2',
    distance: '6.8 km',
    eta: '12 min',
    payment: 'Cash',
    baseFare: 'CFA 550',
    commission: '-CFA 82',
    commissionPercentage: 15,
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
    customerId: 1,
    customerPhone: '+1234567890',
    customerAvatar: null,
    customerRating: '4.8',
    pickupAddress: '67 Murray Street, NY',
    pickupShortName: 'Murray Street',
    dropoffAddress: '85 W Broadway, NY',
    dropoffShortName: 'Airport Terminal 2',
    distance: '6.8 km',
    eta: '12 min',
    payment: 'Cash',
    baseFare: 'CFA 550',
    commission: '-CFA 82',
    commissionPercentage: 15,
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
    customerId: 1,
    customerPhone: '+1234567890',
    customerAvatar: null,
    customerRating: '4.8',
    pickupAddress: '67 Murray Street, NY',
    pickupShortName: 'Murray Street',
    dropoffAddress: '85 W Broadway, NY',
    dropoffShortName: 'Airport Terminal 2',
    distance: '6.8 km',
    eta: '12 min',
    payment: 'Cash',
    baseFare: 'CFA 550',
    commission: '-CFA 82',
    commissionPercentage: 15,
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

export const ALPHA_WORKER_WALLET_SUMMARY = {
  total_earnings: 850,
  today_earnings: 10.19,
  week_earnings: 3,
  month_earnings: 7.73,
  wallet_balance: 500,
  balance: 500,
} as const;
