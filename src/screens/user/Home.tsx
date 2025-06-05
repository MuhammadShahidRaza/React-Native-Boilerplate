import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Typography, Wrapper } from 'components/index';
import { COLORS } from 'utils/colors';
import { getHomeListing } from 'api/functions/app/home';
import { clearAllStorageItems } from 'utils/storage';

export const Home = () => {
  const CheckLocationPermission = async () => {
    // const isGranted = await isLocationPermissionGranted();
    // if (!isGranted) {
    //   replace(SCREENS.LOCATION);
    // } else {
    // getHomeListing();
    // }
  };
  useEffect(() => {
    // CheckLocationPermission();
    clearAllStorageItems();
  }, []);

  return (
    <Wrapper useScrollView backgroundColor={COLORS.HEADER}>
      <Typography>HOME</Typography>
    </Wrapper>
  );
};

const styles = StyleSheet.create({});
