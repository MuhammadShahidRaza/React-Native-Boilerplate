import { COLORS } from 'utils/colors';

export type NotificationVisual = {
  iconName: string;
  iconBg: string;
  iconColor: string;
};

export function formatNotificationTimeAgo(dateStr: string): string {
  const then = new Date(dateStr).getTime();
  const diffMs = Date.now() - then;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'Today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

export function getNotificationVisual(type: string): NotificationVisual {
  switch (type) {
    case 'order-confirmed':
      return {
        iconName: 'restaurant',
        iconBg: '#D1FAE5',
        iconColor: COLORS.APP_PRIMARY,
      };
    case 'driver-found':
      return {
        iconName: 'delivery-dining',
        iconBg: '#DBEAFE',
        iconColor: '#2563EB',
      };
    case 'welcome':
      return {
        iconName: 'notifications',
        iconBg: '#E5E7EB',
        iconColor: '#6B7280',
      };
    case 'parcel-delivered':
      return {
        iconName: 'inventory-2',
        iconBg: '#D1FAE5',
        iconColor: COLORS.APP_PRIMARY,
      };
    case 'ride-completed':
      return {
        iconName: 'directions-car',
        iconBg: '#E0E7FF',
        iconColor: '#4F46E5',
      };
    default:
      return {
        iconName: 'notifications',
        iconBg: COLORS.NOTIFICATION_ICON_BACKGROUND,
        iconColor: COLORS.PRIMARY,
      };
  }
}
