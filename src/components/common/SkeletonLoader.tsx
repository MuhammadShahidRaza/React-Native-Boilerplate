import { View, ViewStyle } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { ChildrenType } from 'types/index';
import { COLORS } from 'utils/colors';
import { screenWidth } from 'utils/helpers';

interface SkeletonWrapperProps {
  children: ChildrenType;
  isLoading?: boolean;
  height?: number;
  width?: number;
  borderRadius?: number;
  style?: ViewStyle;
  count?: number; // Optional: render multiple skeletons
  renderItem?: (index: number) => React.ReactNode; // Optional: custom skeleton renderer
  backgroundColor?: string;
  highlightColor?: string;
}

export const SkeletonWrapper: React.FC<SkeletonWrapperProps> = ({
  children,
  isLoading = false,
  height = 100,
  width = screenWidth(90),
  borderRadius = 12,
  style,
  count = 1,
  renderItem,
  backgroundColor = COLORS.SKELETON_BACKGROUND,
  highlightColor = COLORS.SKELETON_HIGHLIGHT,
}) => {
  if (isLoading) {
    return (
      <SkeletonPlaceholder backgroundColor={backgroundColor} highlightColor={highlightColor}>
        <View>
          {Array.from({ length: count }).map((_, index) => {
            // If custom renderItem is provided, use it
            if (renderItem) {
              return <View key={index}>{renderItem(index)}</View>;
            }
            // Otherwise, use default simple skeleton
            return (
              <SkeletonPlaceholder.Item
                key={index}
                width={width}
                style={{}}
                height={height}
                borderRadius={borderRadius}
                marginTop={index === 0 ? 0 : 10}
                {...(style as any)}
              />
            );
          })}
        </View>
      </SkeletonPlaceholder>
    );
  }

  return <>{children}</>;
};
