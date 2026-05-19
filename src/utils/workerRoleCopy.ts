import { APP_CONFIG } from 'config/app';

export type WorkerJobKind = 'ride' | 'delivery';

export function getWorkerJobKind(role: string | null | undefined): WorkerJobKind {
  return role === APP_CONFIG.COURIER_ROLE ? 'delivery' : 'ride';
}

export function isCourierRole(role: string | null | undefined): boolean {
  return role === APP_CONFIG.COURIER_ROLE;
}

export function isDriverRole(role: string | null | undefined): boolean {
  return role === APP_CONFIG.DRIVER_ROLE;
}

export type WorkerRoleCopy = {
  jobKind: WorkerJobKind;
  onlineStatus: string;
  offlineStatus: string;
  lookingButton: string;
  requestsTitle: string;
  requestDetailTitle: string;
  historyTitle: string;
  tripsStatLabel: string;
  fareLabel: string;
  acceptButton: string;
  arrivedAtPickup: string;
  headingToDestination: (destination: string) => string;
  completeJob: string;
  jobCompletedTitle: string;
  jobCompletedSubtitle: string;
};

export function getWorkerRoleCopy(role: string | null | undefined): WorkerRoleCopy {
  if (isCourierRole(role)) {
    return {
      jobKind: 'delivery',
      onlineStatus: "You're online - looking for deliveries",
      offlineStatus: "You're offline",
      lookingButton: 'Looking for deliveries',
      requestsTitle: 'Delivery Requests',
      requestDetailTitle: 'Delivery Request',
      historyTitle: 'Delivery History',
      tripsStatLabel: 'Deliveries',
      fareLabel: 'Fee',
      acceptButton: 'Accept Delivery',
      arrivedAtPickup: 'Arrived at Pickup',
      headingToDestination: dest => `Heading to ${dest}`,
      completeJob: 'Complete Delivery',
      jobCompletedTitle: 'Delivery Completed',
      jobCompletedSubtitle: "Great job! Here's your delivery summary",
    };
  }

  return {
    jobKind: 'ride',
    onlineStatus: "You're online - looking for rides",
    offlineStatus: "You're offline",
    lookingButton: 'Looking for rides',
    requestsTitle: 'Ride Requests',
    requestDetailTitle: 'Ride Request',
    historyTitle: 'Ride History',
    tripsStatLabel: 'Rides',
    fareLabel: 'Fare',
    acceptButton: 'Accept Ride',
    arrivedAtPickup: 'Arrived at Pickup',
    headingToDestination: dest => `Heading to ${dest}`,
    completeJob: 'Complete Ride',
    jobCompletedTitle: 'Ride Completed',
    jobCompletedSubtitle: "Great job! Here's your trip summary",
  };
}
