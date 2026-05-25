import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import MapView, { Callout, Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { COLORS, getCurrentLocation } from 'utils/index';
import { Icon } from './Icon';
import { MapVehicleMarker, type MapVehicleMarkerKind } from './MapVehicleMarker';
import { INITIAL_REGION, VARIABLES } from 'constants/common';
import { logger } from 'utils/logger';
import { ChildrenType, voidFuntionType } from 'types/common';
import { useTheme } from 'hooks/useTheme';

export interface MapLocation {
  latitude: number;
  longitude: number;
}

/** Map appearance: 'auto' follows app theme, 'light'/'dark' force a specific style */
export type MapStyleMode = 'auto' | 'light' | 'dark';

interface MapProps {
  /** Initial region; defaults to INITIAL_REGION (default map address) when not provided. */
  region?: Region;
  onRegionChange?: (region: Region) => void;
  /** Called when map stops scrolling - center coords for address picker  */
  onRegionChangeComplete?: (region: Region) => void;
  onMarkerDragEnd?: (coordinate: MapLocation) => void;
  showMarker?: boolean;
  /** Fixed center pin overlay - marker stays in center, user drags map to pick address */
  showCenterMarker?: boolean;
  onPressMarker?: (coordinate: MapLocation) => void;
  showCurrentLocation?: boolean;
  style?: ViewStyle;
  customPopupPress?: voidFuntionType;
  showCurrentLocationButton?: boolean;
  showMarkers?: boolean;
  scrollEnabled?: boolean;
  customPopup?: ChildrenType;
  markersCoordinate?: MapLocation[];
  /** Map style: 'auto' (theme-based), 'light', or 'dark'. Override per screen as needed. */
  mapStyle?: MapStyleMode;
  /** Override wrapper container style */
  wrapperStyle?: ViewStyle;
  /** Override center marker container style */
  centerMarkerStyle?: ViewStyle;
  /** Override current location button style */
  currentLocationButtonStyle?: ViewStyle;
  /** When false, hides the blue user-location dot (use during route preview). Default: true unless `showCenterMarker`. */
  showsUserLocationDot?: boolean;
  /** Ref to access map (e.g. animateToRegion) */
  mapRef?: React.MutableRefObject<MapView | null>;
  /** Children rendered inside MapView (e.g. Polyline, Marker) */
  children?: React.ReactNode;
  /** Custom top-down vehicle icon for the user location dot (bike / car). */
  userLocationVehicleKind?: MapVehicleMarkerKind;
  /** Override min zoom level (default 14) */
  minZoomLevel?: number;
  /** Override max zoom level (default 20) */
  maxZoomLevel?: number;
  /**
   * `live`: controlled `region` synced from props (pickers).
   * `initialOnly`: `initialRegion` only — camera can stay after `fitToCoordinates` / directions (no snap-back).
   */
  regionTracking?: 'live' | 'initialOnly';
}

export const Map: FC<MapProps> = ({
  region = INITIAL_REGION,
  onRegionChange,
  onRegionChangeComplete,
  onMarkerDragEnd,
  showMarker = false,
  showCenterMarker = false,
  onPressMarker,
  customPopupPress,
  showCurrentLocation = false,
  showCurrentLocationButton = true,
  style,
  showMarkers = false,
  scrollEnabled = true,
  customPopup,
  markersCoordinate = [],
  mapStyle = 'light',
  wrapperStyle,
  centerMarkerStyle,
  currentLocationButtonStyle,
  showsUserLocationDot,
  mapRef: mapRefProp,
  children,
  minZoomLevel = 14,
  maxZoomLevel = 20,
  regionTracking = 'live',
  userLocationVehicleKind,
}) => {
  const { isDark } = useTheme();
  const resolvedMapStyle = mapStyle === 'auto' ? (isDark ? 'dark' : 'light') : mapStyle;
  const internalRef = useRef<MapView>(null);
  const mapRef = mapRefProp ?? internalRef;
  const [currentRegion, setCurrentRegion] = useState<Region>(region);
  const [currentLocation, setCurrentLocation] = useState<Region>(region);
  const [userLocation, setUserLocation] = useState<MapLocation | null>(null);

  /** Native `showsUserLocation` emits `topUserLocationChange`, which Fabric does not support yet. */
  const wantsUserLocationDot = showsUserLocationDot ?? !showCenterMarker;
  const useCustomUserLocationMarker = wantsUserLocationDot || showCurrentLocation;

  useEffect(() => {
    if (showCenterMarker || regionTracking === 'initialOnly') return;
    setCurrentRegion(r => {
      const same =
        r.latitude === region.latitude &&
        r.longitude === region.longitude &&
        r.latitudeDelta === region.latitudeDelta &&
        r.longitudeDelta === region.longitudeDelta;
      return same ? r : region;
    });
  }, [
    showCenterMarker,
    regionTracking,
    region.latitude,
    region.longitude,
    region.latitudeDelta,
    region.longitudeDelta,
  ]);

  const fetchCurrentLocation = useCallback(async () => {
    try {
      const position = await getCurrentLocation();
      if (position) {
        const newRegion: Region = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: region.latitudeDelta,
          longitudeDelta: region.longitudeDelta,
        };
        setCurrentLocation(newRegion);
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        if (regionTracking !== 'initialOnly') {
          setCurrentRegion(newRegion);
        }
        mapRef.current?.animateToRegion(newRegion, 500);
      }
    } catch (error) {
      logger.warn('Map: could not read current location', error);
    }
  }, [region.latitudeDelta, region.longitudeDelta, mapRef, regionTracking]);

  const handleMapReady = useCallback(() => {
    if (useCustomUserLocationMarker && regionTracking !== 'initialOnly') {
      void fetchCurrentLocation();
    }
  }, [useCustomUserLocationMarker, fetchCurrentLocation, regionTracking]);

  const handleRegionChangeComplete = useCallback(
    (newRegion: Region) => {
      setCurrentRegion(newRegion);
      onRegionChange?.(newRegion);
      onRegionChangeComplete?.(newRegion);
    },
    [onRegionChange, onRegionChangeComplete],
  );

  const handleMarkerDragEnd = useCallback(
    (e: { nativeEvent: { coordinate: MapLocation } }) => {
      const { latitude, longitude } = e.nativeEvent.coordinate;
      onMarkerDragEnd?.({ latitude, longitude });
    },
    [onMarkerDragEnd],
  );
  return (
    <View style={[styles.wrapper, wrapperStyle]}>
      <View style={styles.mapContainer}>
        <MapView
          ref={r => {
            (internalRef as React.MutableRefObject<MapView | null>).current = r;
            if (mapRefProp) (mapRefProp as React.MutableRefObject<MapView | null>).current = r;
          }}
          provider={PROVIDER_GOOGLE}
          style={[styles.map, style]}
          scrollEnabled={scrollEnabled}
          maxZoomLevel={maxZoomLevel}
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={false}
          minZoomLevel={minZoomLevel}
          userInterfaceStyle={resolvedMapStyle}
          onMapReady={handleMapReady}
          {...(showCenterMarker
            ? { initialRegion: region, onRegionChangeComplete: handleRegionChangeComplete }
            : regionTracking === 'initialOnly'
              ? { initialRegion: region }
              : { region: currentRegion, onRegionChangeComplete: handleRegionChangeComplete })}
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
          {useCustomUserLocationMarker && userLocation ? (
            userLocationVehicleKind ? (
              <Marker coordinate={userLocation} anchor={{ x: 0.5, y: 0.5 }} flat>
                <MapVehicleMarker kind={userLocationVehicleKind} />
              </Marker>
            ) : (
              <Marker coordinate={userLocation} pinColor={COLORS.APP_PRIMARY} />
            )
          ) : null}
          {children}
        </MapView>
        {showCenterMarker && (
          <View style={[styles.centerMarker, centerMarkerStyle]} pointerEvents='none'>
            <Icon
              componentName={VARIABLES.MaterialIcons}
              iconName='location-on'
              size={ICON_SIZE}
              color={COLORS.PRIMARY}
            />
          </View>
        )}
      </View>
      {showCurrentLocationButton && (
        <TouchableOpacity
          style={[styles.currentLocationButton, currentLocationButtonStyle]}
          onPress={fetchCurrentLocation}
        >
          <Icon
            componentName={VARIABLES.MaterialIcons}
            iconName={'my-location'}
            size={30}
            iconStyle={styles.iconStyle}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const ICON_SIZE = 48;
const HALF_ICON = ICON_SIZE / 2;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    position: 'relative',
  },
  mapContainer: {
    flex: 1,
    width: '100%',
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  centerMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -HALF_ICON,
    marginTop: -HALF_ICON,
    zIndex: 1,
  },
  currentLocationButton: {
    position: 'absolute',
    zIndex: 2,
    bottom: 8,
    right: 8,
    backgroundColor: COLORS.WHITE,
    padding: 10,
    borderRadius: 30,
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
