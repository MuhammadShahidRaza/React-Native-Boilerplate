export type ParcelTrackPhase =
  | 'accepted'
  | 'arrived'
  | 'ready_for_pickup'
  | 'picked_up'
  | 'in_transit'
  | 'delivered';

export type ParcelTripCoords = {
  pickupAddress?: string;
  dropoffAddress?: string;
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
  senderName?: string;
  senderPhone?: string;
  receiverName?: string;
  receiverPhone?: string;
  pkg?: string;
};
