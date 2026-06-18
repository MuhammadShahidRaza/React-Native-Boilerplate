import type { MapCoord } from 'utils/coordinateAlongPolyline';
import type { ParcelTrackPhase } from 'types/parcelTrip';
import type { RideTrackPhase } from 'types/rideTracking';

export type TrackingDirectionsLeg = {
  origin: MapCoord;
  destination: MapCoord;
  legKey: string;
};

/** Ride tracking — route always starts at live driver position when available. */
export function resolveRideDirectionsLeg(
  phase: RideTrackPhase,
  pickup: MapCoord,
  dropoff: MapCoord,
  providerCoord: MapCoord | null,
): TrackingDirectionsLeg | null {
  if (phase === 'completed' || !providerCoord) return null;

  if (phase === 'in_progress') {
    return {
      origin: providerCoord,
      destination: dropoff,
      legKey: 'dropoff-leg',
    };
  }

  if (phase === 'arriving' || phase === 'arrived') {
    return {
      origin: providerCoord,
      destination: pickup,
      legKey: 'pickup-leg',
    };
  }

  return null;
}

/** Parcel / courier tracking — route from live courier position. */
export function resolveParcelDirectionsLeg(
  phase: ParcelTrackPhase,
  pickup: MapCoord,
  dropoff: MapCoord,
  providerCoord: MapCoord | null,
): TrackingDirectionsLeg | null {
  if (phase === 'delivered' || !providerCoord) return null;

  if (phase === 'in_transit') {
    return {
      origin: providerCoord,
      destination: dropoff,
      legKey: 'dropoff-leg',
    };
  }

  return {
    origin: providerCoord,
    destination: pickup,
    legKey: 'pickup-leg',
  };
}

/** Food delivery — courier heading to customer dropoff. */
export function resolveCourierToDropoffLeg(
  dropoff: MapCoord,
  providerCoord: MapCoord | null,
): TrackingDirectionsLeg | null {
  if (!providerCoord) return null;

  return {
    origin: providerCoord,
    destination: dropoff,
    legKey: 'dropoff-leg',
  };
}

/** Worker navigation — route from live GPS (throttled) to pickup or dropoff. */
export function resolveWorkerDirectionsLeg(
  phase: 'pickup' | 'dropoff',
  destination: MapCoord,
  vehicleCoord: MapCoord | null,
): TrackingDirectionsLeg | null {
  if (!vehicleCoord) return null;

  return {
    origin: vehicleCoord,
    destination,
    legKey: phase === 'pickup' ? 'pickup-leg' : 'dropoff-leg',
  };
}
