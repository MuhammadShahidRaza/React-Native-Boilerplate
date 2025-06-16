import Geolocation, { GeolocationResponse } from '@react-native-community/geolocation';
import Permissions, { check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { Alert, Linking } from 'react-native';
import { isIOS } from './helpers';
import { ENV_CONSTANTS } from 'constants/common';
// import { getUniqueId } from 'react-native-device-info';

interface AddressComponents {
  long_name: string;
  types: string[];
}

export interface AddressDetails {
  fullAddress: string;
  postalCode: string;
  street: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

const getAddressComponent = (addressComponents: AddressComponents[], type: string): string => {
  const component = addressComponents.find(component => component.types.includes(type));
  return component?.long_name || '';
};

const reverseGeocode = async ({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}): Promise<AddressDetails> => {
  const defaultAddressDetails: AddressDetails = {
    fullAddress: '',
    postalCode: '',
    street: '',
    city: '',
    country: '',
    latitude,
    longitude,
  };

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&result_type=street_address|route|postal_code&key=${ENV_CONSTANTS.MAP_API_KEY}`,
    );

    if (!response.ok) {
      throw new Error('Failed to fetch reverse geocoding data');
    }

    const data = await response.json();
    if (data.results.length) {
      const addressComponents = data.results[0]?.address_components;
      const address = data.results[0]?.formatted_address || '';

      return {
        ...defaultAddressDetails,
        fullAddress: address,
        postalCode: getAddressComponent(addressComponents, 'postal_code'),
        street: getAddressComponent(addressComponents, 'route'),
        city: getAddressComponent(addressComponents, 'locality'),
        country: getAddressComponent(addressComponents, 'country'),
      };
    }

    return defaultAddressDetails;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return defaultAddressDetails;
  }
};

const getLocationPermission = async (): Promise<boolean> => {
  try {
    const permission = await Permissions.request(
      isIOS() ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    );

    if (permission === 'blocked' || permission === 'denied' || permission === 'unavailable') {
      Alert.alert(
        'Allow Permissions',
        'Please allow location permission to access your current location',
        [
          {
            text: 'Go to Settings',
            onPress: () =>
              isIOS() ? Linking.openURL('App-Prefs:LOCATION_SERVICES') : Linking.openSettings(),
          },
          {
            text: 'Cancel',
          },
        ],
      );
    }

    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
};

// const getLocationPermission = async () => {
//   try {
//     const currentStatus = await check(
//       isIOS() ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
//     );
//     if (currentStatus === RESULTS.GRANTED) {
//       const isGPSEnabled = await DeviceInfo.isLocationEnabled();
//       const hasAsked = store?.getState()?.user?.hasAskPermission;
//       if (!isGPSEnabled && (hasAsked == undefined || !hasAsked)) {
//         Alert.alert('Turn on Location', 'Please enable GPS to access your location', [
//           {
//             text: 'Go to Settings',
//             onPress: () => {
//               store?.dispatch(setHasAskPermission(true));
//               if (isIOS()) {
//                 Linking.openURL('app-settings:');
//               } else {
//                 Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS');
//               }
//             },
//           },
//           {
//             text: 'Cancel',
//             style: 'cancel',
//             onPress: () => {
//               store?.dispatch(setHasAskPermission(true));
//             },
//           },
//         ]);
//         return false;
//       }
//       return true;
//     }
//     //   console.log('Location permission already granted');
//     //   return true;
//     // }
//     // If permission is not granted, request it
//     const permission = await request(
//       isIOS() ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
//     );
//     if (
//       permission === RESULTS.BLOCKED ||
//       permission === RESULTS.DENIED ||
//       permission === RESULTS.UNAVAILABLE
//     ) {
//       Alert.alert(
//         'Allow Permissions',
//         'Please allow location permission to access your current location',
//         [
//           {
//             text: 'Go to Settings',
//             onPress: () => Linking.openSettings(),
//           },
//           {
//             text: 'Cancel',
//             onPress: () => onBack(),
//           },
//         ],
//       );
//     }
//     return permission === RESULTS.GRANTED;
//   } catch (error) {
//     console.error('Error requesting location permission:', error);
//     return false;
//   }
// };

const getCurrentLocation = async (): Promise<GeolocationResponse | null> => {
  try {
    const hasPermission = await getLocationPermission();
    if (hasPermission) {
      return new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
          position => resolve(position),
          error => reject(error),
        );
      });
    }

    return null;
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
};

const isLocationPermissionGranted = async () => {
  try {
    const permission = isIOS()
      ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
      : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
    const result = await check(permission);

    switch (result) {
      case RESULTS.UNAVAILABLE:
        console.log('Location permission is not available on this device');
        return false;
      case RESULTS.DENIED:
        console.log('Location permission has not been requested yet');
        return false;
      case RESULTS.GRANTED:
        console.log('Location permission is granted');
        return true;
      case RESULTS.BLOCKED:
        console.log('Location permission is blocked');
        return false;
      default:
        return false;
    }
  } catch (error) {
    console.error('Error checking location permission', error);
    return false;
  }
};

export { getCurrentLocation, reverseGeocode, getLocationPermission, isLocationPermissionGranted };
