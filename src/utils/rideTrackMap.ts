import type { RideTrackPhase } from 'types/rideTracking';

export {
  resolveRideDirectionsLeg,
  type TrackingDirectionsLeg,
} from 'utils/trackingDirections';

export function rideStatusLabel(
  phase: RideTrackPhase,
  apiStatus: string,
): { title: string; subtitle: string } {
  switch (phase) {
    case 'arriving':
      return {
        title: 'Driver is arriving',
        subtitle:
          apiStatus === 'accepted'
            ? 'Your driver is on the way to pickup'
            : 'Waiting for driver location…',
      };
    case 'arrived':
      return {
        title: 'Driver has arrived',
        subtitle: 'The driver is waiting at pickup',
      };
    case 'in_progress':
      return {
        title: 'Ride in progress',
        subtitle: 'Enjoy your ride!',
      };
    default:
      return {
        title: 'Ride Completed',
        subtitle: 'Thank you for riding with us',
      };
  }
}
