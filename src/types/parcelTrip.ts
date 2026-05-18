export type ParcelTrackPhase = 'picked_up' | 'in_transit' | 'delivered';

export type ParcelTripCoords = {
  pickupLat?: number;
  pickupLng?: number;
  dropoffLat?: number;
  dropoffLng?: number;
};
