import { StyleSheet, View } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { COLORS } from 'utils/colors';
import { screenHeight, screenWidth } from 'utils/helpers';

export const WorkerRequestDetailSkeleton = () => (
  <SkeletonPlaceholder
    backgroundColor={COLORS.SKELETON_BACKGROUND}
    highlightColor={COLORS.SKELETON_HIGHLIGHT}
  >
    <View style={styles.wrap}>
      <SkeletonPlaceholder.Item
        width={screenWidth(40)}
        height={28}
        borderRadius={14}
        alignSelf='center'
        marginBottom={12}
      />
      <SkeletonPlaceholder.Item
        width={screenWidth(35)}
        height={32}
        borderRadius={16}
        alignSelf='center'
        marginBottom={20}
      />
      <View style={styles.card}>
        <SkeletonPlaceholder.Item width={56} height={56} borderRadius={28} />
        <View style={styles.cardBody}>
          <SkeletonPlaceholder.Item width={screenWidth(40)} height={18} borderRadius={6} />
          <SkeletonPlaceholder.Item
            width={screenWidth(25)}
            height={14}
            borderRadius={6}
            marginTop={8}
          />
        </View>
        <SkeletonPlaceholder.Item width={screenWidth(18)} height={36} borderRadius={6} />
      </View>
      <SkeletonPlaceholder.Item
        width={screenWidth(85)}
        height={screenHeight(12)}
        borderRadius={14}
        marginTop={16}
      />
      <SkeletonPlaceholder.Item
        width={screenWidth(85)}
        height={72}
        borderRadius={14}
        marginTop={14}
      />
      <SkeletonPlaceholder.Item
        width={screenWidth(70)}
        height={48}
        borderRadius={12}
        alignSelf='center'
        marginTop={32}
      />
    </View>
  </SkeletonPlaceholder>
);

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  cardBody: {
    flex: 1,
  },
});
