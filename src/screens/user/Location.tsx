import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Pressable, ActivityIndicator } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { Typography, Wrapper, Icon, RowComponent, FlatListComponent } from 'components/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS } from 'utils/colors';
import { STYLES } from 'utils/commonStyles';
import { navigate, onBack } from 'navigation/Navigators';
import { SCREENS } from 'constants/routes';
import { Map } from 'components/common/Map';
import { INITIAL_REGION } from 'constants/common';
import type { Region } from 'react-native-maps';
import { VARIABLES } from 'constants/common';
import { updateAddress } from 'api/functions/app/address';
import { setAddressDefault } from 'store/slices/address';
import { useCurrentLocation } from 'hooks/useCurrentLocation';
import { useAppDispatch } from 'types/reduxTypes';
import { useAddressList } from 'hooks/useAddressList';
import type { Address } from 'types/responseTypes';
import { setUserAddressDefault } from 'store/slices/user';
import { screenWidth } from 'utils/helpers';

const formatAddressDisplay = (addr: Address) => {
  const parts = [addr.street, addr.city, addr.state, addr.postal_code, addr.country].filter(
    Boolean,
  );
  return parts.join(', ') || addr.street || 'Address';
};

const AddressListSkeleton = () => (
  <SkeletonPlaceholder
    borderRadius={10}
    backgroundColor={COLORS.SKELETON_BACKGROUND}
    highlightColor={COLORS.SKELETON_HIGHLIGHT}
  >
    <SkeletonPlaceholder.Item
      width={screenWidth(90)}
      height={180}
      borderRadius={11}
      marginRight={12}
      marginBottom={20}
    />
    {[1, 2, 3, 4, 5].map(i => (
      <View key={i} style={styles.addressRow}>
        <View style={styles.skeletonRow}>
          <SkeletonPlaceholder.Item width={22} height={22} borderRadius={11} marginRight={12} />
          <View style={styles.skeletonContent}>
            <SkeletonPlaceholder.Item width={80} height={16} borderRadius={6} marginBottom={8} />
            <SkeletonPlaceholder.Item width={180} height={14} borderRadius={6} />
          </View>
          <SkeletonPlaceholder.Item width={24} height={24} borderRadius={8} />
        </View>
      </View>
    ))}
  </SkeletonPlaceholder>
);

export const Location = () => {
  const dispatch = useAppDispatch();
  const {
    addressList,
    loadingAddresses,
    loadingMore,
    selectedId,
    setSelectedId,
    loadMore: _loadMore,
    refetch,
  } = useAddressList();
  const { currentAddress, loading: loadingLocation, loadCurrentLocation } = useCurrentLocation();
  const [mapRegion, setMapRegion] = useState<Region>(INITIAL_REGION);
  const [updatingDefaultId, setUpdatingDefaultId] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadAndUpdateMap = useCallback(
    async (forceRefresh = false) => {
      const result = await loadCurrentLocation(forceRefresh);
      if (result) {
        setMapRegion({
          ...INITIAL_REGION,
          latitude: result.latitude,
          longitude: result.longitude,
        });
      }
    },
    [loadCurrentLocation],
  );

  useEffect(() => {
    loadAndUpdateMap();
  }, [loadAndUpdateMap]);

  const handleMapPress = useCallback(() => {
    navigate(SCREENS.LOCATION_MAP_PICKER);
  }, []);

  const handleAddNewAddress = useCallback(() => {
    navigate(SCREENS.LOCATION_MAP_PICKER, { addNewAddress: true });
  }, []);

  const handleEditAddress = useCallback((item: Address) => {
    navigate(SCREENS.LOCATION_MAP_PICKER, { editAddress: item });
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([refetch(), loadAndUpdateMap(true)]);
    setIsRefreshing(false);
  }, [refetch, loadAndUpdateMap]);

  const handleSelectAddress = useCallback(
    async (item: Address) => {
      setSelectedId(item.id);
      if (item.is_default == 1) return;
      setUpdatingDefaultId(item.id);
      dispatch(setUserAddressDefault(item));
      dispatch(setAddressDefault(item.id));
      try {
        updateAddress(item.id, { is_default: true });
      } finally {
        setUpdatingDefaultId(null);
        onBack();
      }
    },
    [dispatch, setSelectedId],
  );

  const renderItem = useCallback(
    ({ item }: { item: Address }) => (
      <TouchableOpacity
        style={styles.addressRow}
        onPress={() => handleSelectAddress(item)}
        activeOpacity={0.7}
        disabled={updatingDefaultId === item.id}
      >
        <View style={styles.radioOuter}>
          {selectedId === item.id && <View style={styles.radioInner} />}
        </View>
        <View style={styles.addressContent}>
          <Typography style={styles.addressLabel} fontWeight={FontWeight.Bold}>
            {item?.label || 'Other'}
          </Typography>
          <Typography style={styles.addressText} numberOfLines={2}>
            {item?.full_address || formatAddressDisplay(item)}
          </Typography>
        </View>
        <TouchableOpacity
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          onPress={() => handleEditAddress(item)}
        >
          <Icon
            componentName={VARIABLES.MaterialCommunityIcons}
            iconName='pencil-outline'
            size={FontSize.MediumLarge}
            color={COLORS.TEXT_SECONDARY}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    ),
    [handleSelectAddress, handleEditAddress, selectedId, updatingDefaultId],
  );

  const ListHeader = useMemo(
    () => (
      <>
        <Pressable style={styles.mapContainer} onPress={handleMapPress}>
          <Map
            region={mapRegion}
            scrollEnabled={false}
            showCenterMarker={true}
            showCurrentLocationButton={false}
            style={styles.map}
          />
          {loadingLocation && (
            <View style={styles.mapLoadingOverlay}>
              <ActivityIndicator size='large' color={COLORS.PRIMARY} />
            </View>
          )}
        </Pressable>
        {currentAddress && (
          <>
            <View style={styles.currentLocationSection}>
              <View style={styles.currentLocationIcon} />
              <Typography style={styles.currentLocationLabel} fontWeight={FontWeight.Bold}>
                Current Location
              </Typography>
            </View>
            <Typography style={styles.currentAddressText} numberOfLines={2}>
              {currentAddress.fullAddress}
            </Typography>
          </>
        )}
      </>
    ),
    [loadingLocation, mapRegion, currentAddress, loadingAddresses, handleMapPress],
  );

  const ListFooter = useMemo(
    () =>
      loadingMore ? (
        <View style={styles.footerLoader}>
          <ActivityIndicator size='small' color={COLORS.PRIMARY} />
        </View>
      ) : null,
    [loadingMore],
  );

  return (
    <Wrapper headerTitle='Select Address'>
      {loadingAddresses ? (
        <View style={styles.skeletonContainer}>
          <AddressListSkeleton />
        </View>
      ) : (
        <FlatListComponent
          style={styles.scroll}
          data={addressList}
          scrollEnabled={true}
          renderItem={renderItem}
          ListHeaderComponent={ListHeader}
          ListFooterComponent={ListFooter}
          contentContainerStyle={styles.scrollContent}
          // onEndReached={loadMore}
          onRefresh={handleRefresh}
          refreshing={isRefreshing}
        />
      )}
      <RowComponent style={styles.addNewRow} onPress={handleAddNewAddress}>
        <Icon
          componentName={VARIABLES.MaterialCommunityIcons}
          iconName='plus'
          size={FontSize.Large}
          color={COLORS.PRIMARY}
        />
        <Typography style={styles.addNewText} color={COLORS.PRIMARY}>
          Add New Address
        </Typography>
      </RowComponent>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  skeletonContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  mapContainer: {
    height: 180,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    ...STYLES.SHADOW,
    backgroundColor: COLORS.SURFACE,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BORDER,
  },
  mapLoadingOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  map: {
    flex: 1,
    borderRadius: 12,
  },
  currentLocationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 4,
  },
  currentLocationIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.TEXT,
    marginRight: 8,
  },
  currentLocationLabel: {
    fontSize: FontSize.Medium,
    color: COLORS.TEXT,
  },
  currentAddressText: {
    fontSize: FontSize.Small,
    color: COLORS.TEXT_SECONDARY,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skeletonContent: {
    flex: 1,
    marginLeft: 12,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.TEXT_SECONDARY,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.PRIMARY,
  },
  addressContent: {
    flex: 1,
  },
  addressLabel: {
    fontSize: FontSize.Medium,
    color: COLORS.TEXT,
    textTransform: 'capitalize',
    marginBottom: 2,
  },
  addressText: {
    fontSize: FontSize.Small,
    color: COLORS.TEXT_SECONDARY,
  },
  addNewRow: {
    justifyContent: 'flex-start',
    padding: 20,
    marginBottom: 20,
  },
  addNewText: {
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.Medium,
    marginLeft: 8,
  },
  emptyRow: {
    padding: 20,
  },
  emptyText: {
    fontSize: FontSize.Small,
    color: COLORS.TEXT_SECONDARY,
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});
