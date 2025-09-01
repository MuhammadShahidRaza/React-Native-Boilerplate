// // https://github.com/react-native-maps/react-native-maps/issues/4861
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import MapView, { Callout, Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { COLORS, getCurrentLocation, screenHeight, screenWidth } from 'utils/index';
import { Icon } from './Icon';
import { VARIABLES } from 'constants/common';
import { Wrapper } from './Wrapper';
import { ChildrenType, voidFuntionType } from 'types/common';

interface Location {
  latitude: number;
  longitude: number;
}

interface MapProps {
  region: Region;
  onRegionChange?: (region: Region) => void;
  onMarkerDragEnd?: (coordinate: Location) => void;
  showMarker?: boolean;
  onPressMarker?: (coordinate: Location) => void;
  showCurrentLocation?: boolean;
  style?: ViewStyle;
  customPopupPress?: voidFuntionType;
  showCurrentLocationButton?: boolean;
  showMarkers?: boolean;
  scrollEnabled?: boolean;
  customPopup?: ChildrenType;
  markersCoordinate?: Location[];
}

export const Map: FC<MapProps> = ({
  region,
  onRegionChange,
  onMarkerDragEnd,
  showMarker = false,
  onPressMarker,
  customPopupPress,
  showCurrentLocation = false,
  showCurrentLocationButton = true,
  style,
  showMarkers = false,
  scrollEnabled = true,
  customPopup,
  markersCoordinate = [],
}) => {
  const mapRef = useRef<MapView>(null);
  const [currentRegion, setCurrentRegion] = useState<Region>(region);
  const [currentLocation, setCurrentLocation] = useState<Region>(region);

  const fetchCurrentLocation = async () => {
    try {
      const position = await getCurrentLocation();
      if (position) {
        const newRegion: Region = {
          ...currentRegion,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setCurrentLocation(newRegion);
        setCurrentRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion, 500);
      }
    } catch (error) {
      console.error('Error getting user current location:', error);
      // You could add user feedback here, e.g., showing an alert or fallback UI
    }
  };

  useEffect(() => {
    if (showCurrentLocation) {
      fetchCurrentLocation();
    }
  }, [showCurrentLocation, fetchCurrentLocation]);

  const handleRegionChange = useCallback((region: Region) => {
    setCurrentRegion(region);
    onRegionChange?.(region);
  }, []);

  const handleMarkerDragEnd = useCallback(
    (e: { nativeEvent: { coordinate: Location } }) => {
      const { latitude, longitude } = e.nativeEvent.coordinate;
      onMarkerDragEnd?.({ latitude, longitude });
    },
    [onMarkerDragEnd],
  );
  return (
    <Wrapper>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={[styles.map, style]}
        scrollEnabled={scrollEnabled}
        maxZoomLevel={20}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={false}
        minZoomLevel={14}
        region={currentRegion}
        // onRegionChangeComplete={handleRegionChange}
      >
        {showMarker && (
          <Marker
            coordinate={currentRegion}
            pinColor={COLORS.SECONDARY}
            draggable
            onDragEnd={handleMarkerDragEnd}
            onPress={() => onPressMarker?.(currentLocation)}
          />
        )}

        {showMarkers &&
          markersCoordinate.map((coord, index) => (
            <Marker key={index} pinColor={COLORS.SECONDARY} coordinate={coord}>
              {customPopup && <Callout onPress={customPopupPress}>{customPopup}</Callout>}
            </Marker>
          ))}
      </MapView>
      {showCurrentLocationButton && (
        <TouchableOpacity style={styles.currentLocationButton} onPress={fetchCurrentLocation}>
          <Icon
            componentName={VARIABLES.MaterialIcons}
            iconName={'my-location'}
            size={30}
            iconStyle={styles.iconStyle}
          />
        </TouchableOpacity>
      )}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  map: {
    width: screenWidth(100),
    height: screenHeight(100),
  },
  currentLocationButton: {
    position: 'absolute',
    zIndex: 2,
    bottom: 50,
    right: 5,
    backgroundColor: COLORS.WHITE,
    padding: 10,
    borderRadius: 30,
    marginHorizontal: 10,
    marginVertical: 10,
  },
  iconStyle: {
    color: COLORS.SECONDARY,
  },
  rowComponent: {
    gap: 10,
  },
  photoImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});
