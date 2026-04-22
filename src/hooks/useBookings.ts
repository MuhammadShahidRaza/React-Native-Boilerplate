// import { useCallback, useEffect, useState } from 'react';
// import { useAppDispatch, useAppSelector } from 'types/reduxTypes';
// import { appendBookings, setBookings, type BookingsTab } from 'store/slices/bookings';
// import {
//   fetchUserBookingsPage,
//   fetchDentorBookingsPage,
//   type BookingStatusParam,
//   type BookingsSortOrder,
// } from 'api/functions/app/home';
// import { Booking } from 'types/responseTypes';

// type UseBookingsParams = {
//   isDentor: boolean;
//   /** When provided, fetches by status (5 per page) and uses local state. For Activities/MyJobs tabs. */
//   status?: BookingStatusParam;
//   /** Sort field (e.g. 'date', 'created_at') */
//   sort?: string;
//   /** Sort order: asc or desc */
//   order?: BookingsSortOrder;
//   /** Date range: from (YYYY-MM-DD) */
//   date_from?: string;
//   /** Date range: to (YYYY-MM-DD) */
//   date_to?: string;
// };

// /**
//  * Single hook for bookings. Use without status for Home (Redux). Use with status for Activities/MyJobs tabs (local state, 5 per page).
//  */
// export function useBookings({
//   isDentor,
//   status,
//   sort,
//   order,
//   date_from,
//   date_to,
// }: UseBookingsParams) {
//   const tab: BookingsTab = isDentor ? 'dentor' : 'user';
//   const reduxState = useAppSelector(state => state.bookings[tab]);
//   const dispatch = useAppDispatch();

//   const [localItems, setLocalItems] = useState<Booking[]>([]);
//   const [localPage, setLocalPage] = useState(0);
//   const [localLastPage, setLocalLastPage] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [loadingMore, setLoadingMore] = useState(false);

//   const useStatusMode = status != null;
//   const items = useStatusMode ? localItems : reduxState.items;
//   const currentPage = useStatusMode ? localPage : reduxState.currentPage;
//   const lastPage = useStatusMode ? localLastPage : reduxState.lastPage;

//   const fetchPage = useCallback(
//     async (page: number, append: boolean) => {
//       const fetcher = isDentor ? fetchDentorBookingsPage : fetchUserBookingsPage;
//       const res = await fetcher({
//         page,
//         limit: 5,
//         ...(status && { status }),
//         ...(sort && { sort }),
//         ...(order && { order }),
//         ...(date_from && { date_from }),
//         ...(date_to && { date_to }),
//       });
//       type Payload = {
//         booking?: Booking[];
//         current_page?: number;
//         last_page?: number;
//         total?: number;
//       };
//       const payload: Payload | undefined = (res as { data?: Payload })?.data ?? (res as Payload);
//       if (!payload) return;
//       const booking = payload.booking;
//       const current_page = payload.current_page ?? 1;
//       const last_page = payload.last_page ?? 1;
//       const totalCount = payload.total ?? 0;
//       const itemsToSet = Array.isArray(booking) ? booking : [];

//       if (useStatusMode) {
//         if (append) {
//           setLocalItems(prev => prev.concat(itemsToSet));
//         } else {
//           setLocalItems(itemsToSet);
//         }
//         setLocalPage(current_page);
//         setLocalLastPage(last_page);
//       } else {
//         if (append) {
//           dispatch(
//             appendBookings({
//               tab,
//               items: itemsToSet,
//               currentPage: current_page,
//               lastPage: last_page,
//               total: totalCount,
//             }),
//           );
//         } else {
//           dispatch(
//             setBookings({
//               tab,
//               items: itemsToSet,
//               currentPage: current_page,
//               lastPage: last_page,
//               total: totalCount,
//             }),
//           );
//         }
//       }
//     },
//     [dispatch, isDentor, tab, status, sort, order, date_from, date_to, useStatusMode],
//   );

//   useEffect(() => {
//     if (useStatusMode) {
//       let cancelled = false;
//       setLoading(true);
//       fetchPage(1, false).finally(() => {
//         if (!cancelled) setLoading(false);
//       });
//       return () => {
//         cancelled = true;
//       };
//     }
//     if (reduxState.loaded) return;
//     let cancelled = false;
//     setLoading(true);
//     fetchPage(1, false).finally(() => {
//       if (!cancelled) setLoading(false);
//     });
//     return () => {
//       cancelled = true;
//     };
//   }, [
//     useStatusMode ? status : reduxState.loaded,
//     fetchPage,
//     useStatusMode,
//     sort,
//     order,
//     date_from,
//     date_to,
//   ]);

//   const refetch = useCallback(async () => {
//     setLoading(true);
//     await fetchPage(1, false);
//     setLoading(false);
//   }, [fetchPage]);

//   const loadMore = useCallback(async () => {
//     if (loadingMore || currentPage >= lastPage || lastPage === 0) return;
//     setLoadingMore(true);
//     await fetchPage(currentPage + 1, true);
//     setLoadingMore(false);
//   }, [currentPage, lastPage, fetchPage, loadingMore]);

//   const hasMore = currentPage < lastPage && lastPage > 0;

//   return {
//     items,
//     loading,
//     loadingMore,
//     refetch,
//     loadMore,
//     hasMore,
//     total: reduxState.total,
//     loaded: useStatusMode ? true : reduxState.loaded,
//   };
// }
import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  fetchUserBookingsPage,
  fetchDentorBookingsPage,
  type BookingStatusParam,
  type BookingsSortOrder,
} from 'api/functions/app/home';
import { Booking } from 'types/responseTypes';

type UseBookingsParams = {
  isDentor: boolean;
  status?: BookingStatusParam;
  sort?: string;
  order?: BookingsSortOrder;
  date_from?: string;
  date_to?: string;
};

type ApiResponse = {
  data?: {
    booking?: Booking[];
    current_page?: number;
    last_page?: number;
  };
  all_new_quotation_received_unread_count?: number;
};

export function useBookings({
  isDentor,
  status,
  sort,
  order,
  date_from,
  date_to,
}: UseBookingsParams) {
  const [items, setItems] = useState<Booking[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [lastPage, setLastPage] = useState(0);
  const [allNewQuotationReceivedUnreadCount, setAllNewQuotationReceivedUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const isMounted = useRef(false);

  const fetchPage = useCallback(
    async (page: number, append: boolean) => {
      try {
        const fetcher = isDentor ? fetchDentorBookingsPage : fetchUserBookingsPage;

        const res = (await fetcher({
          page,
          limit: 5,
          ...(status && { status }),
          ...(sort && { sort }),
          ...(order && { order }),
          ...(date_from && { date_from }),
          ...(date_to && { date_to }),
        })) as ApiResponse;

        const bookingData = res?.data?.booking ?? [];
        const current_page = res?.data?.current_page ?? 1;
        const last_page = res?.data?.last_page ?? 1;
        const unreadCount = res?.all_new_quotation_received_unread_count ?? 0;

        setItems(prev => (append ? prev.concat(bookingData) : bookingData));
        setCurrentPage(current_page);
        setLastPage(last_page);
        setAllNewQuotationReceivedUnreadCount(unreadCount);
      } catch (error) {
        console.error('Bookings fetch error', error);
      }
    },
    [isDentor, status, sort, order, date_from, date_to]
  );

  // Only fetch once per mount OR focus
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      if (!isMounted.current) isMounted.current = true;

      const load = async () => {
        setLoading(true);
        await fetchPage(1, false);
        if (!cancelled) setLoading(false);
      };
      load();

      return () => {
        cancelled = true;
      };
    }, [fetchPage])
  );

  const refetch = useCallback(async () => {
    setLoading(true);
    await fetchPage(1, false);
    setLoading(false);
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (loadingMore || currentPage >= lastPage || lastPage === 0) return;
    setLoadingMore(true);
    await fetchPage(currentPage + 1, true);
    setLoadingMore(false);
  }, [currentPage, lastPage, fetchPage, loadingMore]);

  const hasMore = currentPage < lastPage && lastPage > 0;

  return {
    items,
    loading,
    loadingMore,
    refetch,
    loadMore,
    hasMore,
    allNewQuotationReceivedUnreadCount,
  };
}