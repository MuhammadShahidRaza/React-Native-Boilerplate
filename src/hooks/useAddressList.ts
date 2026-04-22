import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'types/reduxTypes';
import { getAddressList } from 'api/functions/app/address';
import { setAddressList, appendAddressList } from 'store/slices/address';

export function useAddressList() {
  const dispatch = useAppDispatch();
  const addressList = useAppSelector(state => state.address.addressList);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const fetchAddresses = useCallback(
    async (page = 1, append = false) => {
      if (page === 1) setLoadingAddresses(true);
      else setLoadingMore(true);
      try {
        const res = await getAddressList({ page });
        if (res?.addresses) {
          if (append) {
            dispatch(appendAddressList(res?.addresses));
          } else {
            dispatch(setAddressList(res?.addresses));
          }
          setCurrentPage(res?.current_page);
          setHasMore(res?.current_page < res?.last_page);
        }
      } finally {
        setLoadingAddresses(false);
        setLoadingMore(false);
      }
    },
    [dispatch],
  );

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) fetchAddresses(currentPage + 1, true);
  }, [loadingMore, hasMore, currentPage, fetchAddresses]);

  /** Single source: Redux. Fetch when empty; sync selectedId from addressList when it has data */
  useEffect(() => {
    if (addressList.length > 0) {
      setLoadingAddresses(false);
      const defaultAddr = addressList.find(a => a.is_default == 1) ?? addressList[0];
      setSelectedId(defaultAddr?.id ?? null);
      return;
    }
    fetchAddresses(1, false);
  }, [addressList, fetchAddresses]);

  const refetch = useCallback(() => fetchAddresses(1, false), [fetchAddresses]);

  return {
    addressList,
    loadingAddresses,
    loadingMore,
    hasMore,
    selectedId,
    setSelectedId,
    loadMore,
    refetch,
  };
}
