import { View, StyleSheet } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { COLORS, STYLES } from 'utils/index';
import { screenWidth } from 'utils/helpers';

const SKELETON_COUNT = 3;

export const TransactionCardSkeleton = () => (
  <SkeletonPlaceholder
    backgroundColor={COLORS.SKELETON_BACKGROUND}
    highlightColor={COLORS.SKELETON_HIGHLIGHT}
  >
    <View style={styles.container}>
      {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.row}>
            <View style={styles.left}>
              <SkeletonPlaceholder.Item width={40} height={40} borderRadius={20} marginRight={12} />
              <View style={styles.info}>
                <SkeletonPlaceholder.Item
                  width={screenWidth(35)}
                  height={18}
                  borderRadius={6}
                  marginBottom={8}
                />
                <SkeletonPlaceholder.Item width={screenWidth(45)} height={14} borderRadius={6} />
              </View>
            </View>
            <View style={styles.right}>
              <SkeletonPlaceholder.Item
                width={60}
                height={18}
                borderRadius={6}
                marginBottom={8}
                alignSelf='flex-end'
              />
              <SkeletonPlaceholder.Item
                width={40}
                height={14}
                borderRadius={6}
                alignSelf='flex-end'
              />
            </View>
          </View>
        </View>
      ))}
    </View>
  </SkeletonPlaceholder>
);

const styles = StyleSheet.create({
  container: {
    // paddingHorizontal: 20,
    paddingVertical: 10,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...STYLES.SHADOW,
    backgroundColor: COLORS.SURFACE,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  info: {
    flex: 1,
  },
  right: {
    alignItems: 'flex-end',
  },
});
