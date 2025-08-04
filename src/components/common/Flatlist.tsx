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

interface FlatListComponentProps<T> {
  data: T[];
  renderItem?: ListRenderItem<T>;
  containerStyle?: ViewStyle;
  numColumns?: number;
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
  pagination?: boolean;
  onLoadMore?: voidFuntionType;
  isLoadingMore?: boolean;
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
  bounces = false,
  EmptyComponent,
  style,
  getItemLayout,
  onRefresh,
  stickyHeaderIndices,
  keyExtractor,
  refreshing = false,
  scrollEnabled = horizontal ?? false,
  pagination = false,
  onLoadMore,
  isLoadingMore = false,
  noItemProps,
  ...otherProps
}: FlatListComponentProps<T>) => {
  const renderHeader = HeaderComponent ? <HeaderComponent /> : null;
  // const renderFooter = FooterComponent ? <FooterComponent /> : null;

  const renderFooter = () => {
    if (FooterComponent) return <FooterComponent />;
    if (pagination && isLoadingMore) {
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
        onEndReached={pagination ? onLoadMore : undefined}
        refreshControl={
          onRefresh && <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReachedThreshold={0.5}
        {...otherProps}
      />
    </View>
  );
};
