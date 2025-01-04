import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import {ChildrenType} from 'types/common';

interface SkeletonLoaderProps {
  children: ChildrenType;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({children}) => {
  return (
    <SkeletonPlaceholder>
      <>{children}</>
    </SkeletonPlaceholder>
  );
};
