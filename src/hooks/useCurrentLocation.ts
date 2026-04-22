import { useCallback, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'types/reduxTypes';
import { setCurrentAddress } from 'store/slices/address';
import { getCurrentLocation, reverseGeocode, getLocationPermission } from 'utils/location';
import type { AddressDetails } from 'utils/location';

export type LoadCurrentLocationResult = {
  address: AddressDetails;
  latitude: number;
  longitude: number;
} | null;

// Module-level: shared across all hook instances to prevent duplicate fetches
let inFlightPromise: Promise<LoadCurrentLocationResult> | null = null;

/** Shared hook for loading current location - prevents duplicate fetches across HomeHeader, Location, etc. */
export function useCurrentLocation() {
  const dispatch = useAppDispatch();
  const currentAddress = useAppSelector(state => state.address.currentAddress);
  const [loading, setLoading] = useState(false);
  const currentAddressRef = useRef(currentAddress);
  currentAddressRef.current = currentAddress;

  // Use ref for cache check so we don't change loadCurrentLocation reference when currentAddress updates
  const loadCurrentLocation = useCallback(
    async (forceRefresh = false): Promise<LoadCurrentLocationResult> => {
      if (!forceRefresh && currentAddressRef.current?.fullAddress) {
        const addr = currentAddressRef.current;
        return { address: addr, latitude: addr.latitude, longitude: addr.longitude };
      }
      if (inFlightPromise) return inFlightPromise;

      setLoading(true);
      const doLoad = async (): Promise<LoadCurrentLocationResult> => {
        try {
          const hasPermission = await getLocationPermission();
          if (!hasPermission) {
            dispatch(setCurrentAddress(null));
            return null;
          }
          const position = await getCurrentLocation();
          if (!position) {
            dispatch(setCurrentAddress(null));
            return null;
          }
          const { latitude, longitude } = position.coords;
          try {
            const result = await reverseGeocode({ latitude, longitude });
            dispatch(setCurrentAddress(result));
            return { address: result, latitude, longitude };
          } catch {
            dispatch(setCurrentAddress(null));
            return null;
          }
        } finally {
          inFlightPromise = null;
          setLoading(false);
        }
      };
      inFlightPromise = doLoad();
      return inFlightPromise;
    },
    [dispatch],
  );

  return { currentAddress, loading, loadCurrentLocation };
}
