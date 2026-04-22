import { View, StyleSheet } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { SkeletonWrapper } from 'components/common';
import { COLORS, STYLES } from 'utils/index';
import { screenHeight, screenWidth } from 'utils/helpers';

interface InfoBoxSkeletonProps {
  showBiddingSection?: boolean;
  count?: number;
}

/**
 * Reusable skeleton component for JobInfoBox and BookingInfoBox
 * Uses SkeletonWrapper with custom renderItem
 */
export const InfoBoxSkeleton: React.FC<InfoBoxSkeletonProps> = ({ count = 1 }) => {
  const renderSkeletonItem = () => (
    <View style={styles.container}>
      <View style={styles.contentRow}>
        {/* Photo skeleton */}
        <SkeletonPlaceholder.Item
          width={screenWidth(15)}
          height={screenHeight(17)}
          borderRadius={12}
          marginRight={12}
        />
        {/* Info column skeleton */}
        <View style={styles.infoColumn}>
          <SkeletonPlaceholder.Item
            width={screenWidth(52)}
            height={25}
            borderRadius={6}
            marginBottom={8}
          />
          <SkeletonPlaceholder.Item
            width={screenWidth(52)}
            height={16}
            borderRadius={6}
            marginBottom={6}
          />
          <SkeletonPlaceholder.Item
            width={screenWidth(52)}
            height={16}
            borderRadius={6}
            marginBottom={6}
          />
          <SkeletonPlaceholder.Item
            width={screenWidth(52)}
            height={16}
            borderRadius={6}
            marginBottom={8}
          />
          {/* Buttons skeleton */}
          <View style={styles.buttonsRow}>
            <SkeletonPlaceholder.Item
              width={screenWidth(25)}
              height={40}
              borderRadius={8}
              marginRight={8}
            />
            <SkeletonPlaceholder.Item width={screenWidth(25)} height={40} borderRadius={8} />
          </View>
        </View>
        {/* Right content skeleton (price) */}
        <View style={styles.buttonsColumn}>
          <SkeletonPlaceholder.Item
            width={screenWidth(10)}
            height={25}
            borderRadius={6}
            alignSelf='flex-start'
          />

          <SkeletonPlaceholder.Item
            width={screenWidth(10)}
            height={25}
            borderRadius={6}
            alignSelf='flex-start'
          />
        </View>
      </View>
    </View>
  );

  return (
    <SkeletonWrapper isLoading={true} count={count} renderItem={renderSkeletonItem}>
      <View />
    </SkeletonWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 15,
    marginTop: 15,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
    ...STYLES.SHADOW,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoColumn: {
    flex: 1,
  },
  buttonsRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  buttonsColumn: {
    alignSelf: 'flex-start',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 45,
  },
});
