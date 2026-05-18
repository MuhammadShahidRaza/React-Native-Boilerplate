import { StyleSheet, View } from 'react-native';
import { COLORS } from 'utils/index';

export interface RideProgressSegmentsProps {
  /** Number of equal segments across the strip */
  stepCount: number;
  /** Completed / active sweep: segments with index <= activeSegmentIndex are emphasized */
  activeSegmentIndex: number;
}

/** Horizontal ride progress strip matching app ride screens. */
export const RideProgressSegments = ({ stepCount, activeSegmentIndex }: RideProgressSegmentsProps) => (
  <View style={styles.progressRow}>
    {Array.from({ length: stepCount }).map((_, i) => (
      // eslint-disable-next-line react/no-array-index-key
      <View key={i} style={styles.progressSegWrap}>
        <View
          style={[styles.progressSeg, i <= activeSegmentIndex ? styles.segActive : styles.segInactive]}
        />
        {i === activeSegmentIndex ? <View style={styles.progressDot} /> : null}
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 20,
  },
  progressSegWrap: {
    flex: 1,
    height: 6,
    position: 'relative',
  },
  progressSeg: {
    height: 5,
    borderRadius: 4,
  },
  segActive: { backgroundColor: COLORS.APP_PRIMARY },
  segInactive: { backgroundColor: COLORS.APP_LINE },
  progressDot: {
    position: 'absolute',
    right: -6,
    top: -3,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.APP_PRIMARY,
    borderWidth: 2,
    borderColor: COLORS.WHITE,
  },
});
