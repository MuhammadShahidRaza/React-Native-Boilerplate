export type ParcelTrackPhase = 'picked_up' | 'in_transit' | 'delivered';

export type ParcelTripCoords = {
  pickupLat?: number;
  pickupLng?: number;
  dropoffLat?: number;
  dropoffLng?: number;
  bookingId?: number;
  createdAt?: string;
  timerAnchorAt?: string;
  timerDurationSeconds?: number;
  /** Fresh booking — countdown starts when this screen mounts (full admin timer). */
  startTimerOnMount?: boolean;
};
