import { LegacyRef } from 'react';
import {
  FlatList,
  ListRenderItem,
  ViewStyle,
  TextStyle,
  RefreshControl,
  View,
  ActivityIndicator,
} from 'react-native';
import { StyleType, voidFuntionType } from 'types/common';
import NoItemFound from './NoItemFound';
import { FlatListProps } from 'react-native';

interface FlatListComponentProps<T> extends FlatListProps<T> {
  data: T[];
  renderItem: ListRenderItem<T>;
  containerStyle?: ViewStyle;
  numColumns?: number;
  onEndReachedThreshold?: number;
  reference?: LegacyRef<FlatList<T>>;
  horizontal?: boolean;
  scrollEnabled?: boolean;
  bounces?: boolean;
  contentContainerStyle?: StyleType;
  columnWrapperStyle?: StyleType;
  style?: StyleType;
  keyExtractor?: (item: T, index: number) => string;
  getItemLayout?: (
    data: ArrayLike<T> | null | undefined,
    index: number,
  ) => { length: number; offset: number; index: number };
  itemTextStyle?: TextStyle;
  HeaderComponent?: React.FC;
  FooterComponent?: React.FC;
  EmptyComponent?: React.FC;
  onRefresh?: voidFuntionType;
  refreshing?: boolean;
  nestedScrollEnabled?: boolean;
  stickyHeaderIndices?: number[];
  noItemProps?: any;
  onEndReached?: voidFuntionType;
  showLoadingMore?: boolean;
}

export const FlatListComponent = <T,>({
  data,
  renderItem,
  reference,
  horizontal,
  numColumns,
  contentContainerStyle,
  HeaderComponent,
  nestedScrollEnabled = true,
  FooterComponent,
  bounces = true,
  EmptyComponent,
  style,
  getItemLayout,
  onRefresh,
  stickyHeaderIndices,
  keyExtractor,
  refreshing = false,
  scrollEnabled = horizontal ?? false,
  onEndReached,
  onEndReachedThreshold = 0.2,
  showLoadingMore = false,
  noItemProps,
  ...otherProps
}: FlatListComponentProps<T>) => {
  const renderHeader = HeaderComponent ? <HeaderComponent /> : null;

  const renderFooter = () => {
    if (FooterComponent) return <FooterComponent />;
    if (showLoadingMore) {
      return (
        <View style={{ paddingVertical: 12, alignItems: 'center' }}>
          <ActivityIndicator size='small' />
        </View>
      );
    }
    return null;
  };

  const renderEmpty = EmptyComponent ? <EmptyComponent /> : <NoItemFound {...noItemProps} />;

  return (
    <View>
      <FlatList
        ref={reference}
        data={data}
        style={style}
        bounces={bounces}
        renderItem={renderItem}
        stickyHeaderIndices={stickyHeaderIndices}
        horizontal={horizontal}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        numColumns={numColumns}
        getItemLayout={getItemLayout}
        keyExtractor={keyExtractor ?? ((_, index) => index.toString())}
        contentContainerStyle={contentContainerStyle}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshing={refreshing}
        onScrollToIndexFailed={() => {}}
        nestedScrollEnabled={nestedScrollEnabled}
        scrollEnabled={scrollEnabled}
        onEndReached={onEndReached}
        refreshControl={
          onRefresh && <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReachedThreshold={onEndReachedThreshold}
        {...otherProps}
      />
    </View>
  );
};
