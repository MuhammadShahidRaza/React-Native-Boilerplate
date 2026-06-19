import type { Activity, NotificationsListData } from 'types/responseTypes';

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

const base = {
  user_id: 1,
  objectable_type: 'App\\Models\\Booking',
  objectable_id: 1,
  actor_id: 1,
  viewed: 0,
  status: 1,
  updated_at: daysAgo(5),
  deleted_at: null as string | null,
};

/** Demo notifications for alpha / UI review (matches notification screen design). */
export const MOCK_NOTIFICATION_ACTIVITIES: Activity[] = [
  {
    ...base,
    id: 9001,
    type: 'order-confirmed',
    title: 'Order Confirmed!',
    body: 'Your order from Burger Lab has been confirmed. Total: CFA 10',
    created_at: daysAgo(5),
  },
  {
    ...base,
    id: 9002,
    type: 'driver-found',
    title: 'Driver Found!',
    body: 'John Doe is on the way. Estimated fare: CFA 30',
    created_at: daysAgo(5),
  },
  {
    ...base,
    id: 9003,
    type: 'welcome',
    title: 'Welcome to Sengo!',
    body: 'Start your journey with us. Book Rides, order food, and send parcels?',
    created_at: daysAgo(5),
  },
  {
    ...base,
    id: 9004,
    type: 'parcel-delivered',
    title: 'Parcel Delivered',
    body: 'Your parcel to 67 Murray Street has been delivered successfully.',
    created_at: daysAgo(6),
  },
  {
    ...base,
    id: 9005,
    type: 'ride-completed',
    title: 'Ride Completed',
    body: 'Your ride with Alex was completed. Total fare: CFA 45',
    created_at: daysAgo(7),
  },
];

export const MOCK_NOTIFICATIONS_PAGE: NotificationsListData = {
  activities: MOCK_NOTIFICATION_ACTIVITIES,
  current_page: 1,
  last_page: 1,
  per_page: 20,
  total: MOCK_NOTIFICATION_ACTIVITIES.length,
  first_page_url: '',
  from: 1,
  last_page_url: '',
  links: [],
  to: MOCK_NOTIFICATION_ACTIVITIES.length,
};
