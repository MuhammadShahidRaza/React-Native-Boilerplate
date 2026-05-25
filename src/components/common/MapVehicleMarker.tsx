import { Image, StyleSheet, View } from 'react-native';
import { IMAGES } from 'constants/assets';
import { COLORS } from 'utils/index';

export type MapVehicleMarkerKind = 'car' | 'bike';

export interface MapVehicleMarkerProps {
  kind: MapVehicleMarkerKind;
}

/** Live vehicle marker on map: car for ride drivers, bike for courier / food delivery. */
export const MapVehicleMarker = ({ kind }: MapVehicleMarkerProps) => (
  <View style={styles.wrapAsset}>
    <Image
      source={kind === 'bike' ? IMAGES.MAP_COURIER_BIKE : IMAGES.MAP_DRIVER_CAR}
      style={kind === 'bike' ? styles.bikeImg : styles.carImg}
      resizeMode='contain'
    />
  </View>
);

const styles = StyleSheet.create({
  wrapAsset: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bikeImg: {
    width: 40,
    height: 40,
  },
  carImg: {
    width: 36,
    height: 36,
    backgroundColor: COLORS.TRANSPARENT,
    borderRadius: 50,
  },
});
