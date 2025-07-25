import { View } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { ChildrenType } from 'types/index';

interface SkeletonLoaderProps {
  children: ChildrenType;
  height?: number;
  isLoading?: boolean
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ children, height, isLoading = false }) => {
  // const [isLoading, setIsLoading] = useState(true);
  // useEffect(() => {
  //   setTimeout(() => {
  //     setIsLoading(false);
  //   }, 500);
  // }, []);
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
