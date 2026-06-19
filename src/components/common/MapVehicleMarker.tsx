import { Image, StyleSheet, View } from 'react-native';
import { IMAGES } from 'constants/assets';
import { COLORS } from 'utils/index';

export type MapVehicleMarkerKind = 'car' | 'bike';

export interface MapVehicleMarkerProps {
  kind: MapVehicleMarkerKind;
  onLoad?: () => void;
}

/** Top-down car/bike asset for map markers. */
export const MapVehicleMarker = ({ kind, onLoad }: MapVehicleMarkerProps) => (
  <View style={styles.wrapAsset} collapsable={false}>
    <Image
      source={kind === 'bike' ? IMAGES.MAP_COURIER_BIKE : IMAGES.MAP_DRIVER_CAR}
      style={kind === 'bike' ? styles.bikeImg : styles.carImg}
      resizeMode='contain'
      fadeDuration={0}
      onLoad={onLoad}
    />
  </View>
);

const styles = StyleSheet.create({
  wrapAsset: {
    width: 40,
    height: 40,
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
