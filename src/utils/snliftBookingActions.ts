import { cancelBooking, deleteBooking } from 'api/functions/snlift/bookings';
import { showToast } from 'utils/toast';

export async function cancelSniftBooking(
  bookingId: number | undefined,
  reason: string,
): Promise<boolean> {
  if (bookingId == null) return true;
  const res = await cancelBooking(bookingId, reason.trim() || 'Cancelled by user');
  if (!res) {
    showToast({ message: 'Could not cancel booking. Try again.' });
    return false;
  }
  return true;
}

export async function deleteSniftBooking(bookingId: number | undefined): Promise<boolean> {
  if (bookingId == null) return true;
  const res = await deleteBooking(bookingId);
  if (!res) {
    showToast({ message: 'Could not cancel booking. Try again.' });
    return false;
  }
  return true;
}
