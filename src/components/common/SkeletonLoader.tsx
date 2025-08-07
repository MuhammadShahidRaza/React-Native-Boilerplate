import { View, ViewStyle } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { ChildrenType } from 'types/index';
import { screenWidth } from 'utils/helpers';

interface SkeletonLoaderProps {
  children: ChildrenType;
  height?: number;
  isLoading?: boolean;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  children,
  height,
  isLoading = false,
}) => {
  return (
    <SkeletonPlaceholder enabled={isLoading}>
      <View
        style={
          isLoading
            ? {
                borderWidth: 0.8,
                borderRadius: 20,
                height,
              }
            : {}
        }
      >
        {children}
      </View>
    </SkeletonPlaceholder>
  );
};

// import { View } from 'react-native';
// import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
// import { ChildrenType } from 'types/index';

// interface SkeletonLoaderProps {
//   children: ChildrenType;
//   height?: number;
//   isLoading?: boolean;
// }

// export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
//   children,
//   height,
//   isLoading = false,
// }) => {
//   return (
//     <SkeletonPlaceholder enabled={isLoading}>
//       <View
//         style={
//           isLoading
//             ? {
//                 borderWidth: 0.8,
//                 borderRadius: 20,
//                 height,
//               }
//             : {}
//         }
//       >
//         {children}
//       </View>
//     </SkeletonPlaceholder>
//   );
// };

interface SkeletonWrapperProps {
  children: ChildrenType;
  isLoading?: boolean;
  height?: number;
  width?: number;
  borderRadius?: number;
  style?: ViewStyle;
  count?: number; // Optional: render multiple skeletons
}

export const SkeletonWrapper: React.FC<SkeletonWrapperProps> = ({
  children,
  isLoading = false,
  height = 100,
  width = screenWidth(90),
  borderRadius = 12,
  style,
  count = 1,
}) => {
  if (isLoading) {
    return (
      <SkeletonPlaceholder>
        {Array.from({ length: count }).map((_, index) => (
          <View
            key={index}
            style={[
              {
                height,
                width,
                borderRadius,
                marginVertical: 6,
              },
              style,
            ]}
          />
        ))}
      </SkeletonPlaceholder>
    );
  }

  return <>{children}</>;
};
