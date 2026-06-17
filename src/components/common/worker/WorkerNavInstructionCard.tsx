import { StyleSheet, View } from 'react-native';
import { Icon, Typography } from 'components/index';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS } from 'utils/index';
import type { NavStep } from 'utils/workerNavigation';
import { resolveNavStepIcon } from 'utils/workerNavigation';

export interface WorkerNavInstructionCardProps {
  distanceLabel: string;
  etaLabel: string;
  distanceCaption: string;
  step: NavStep;
}

export const WorkerNavInstructionCard = ({
  distanceLabel,
  etaLabel,
  distanceCaption,
  step,
}: WorkerNavInstructionCardProps) => {
  const turnIcon = resolveNavStepIcon(step);

  return (
  <View style={styles.card}>
    <View style={styles.topRow}>
      <View>
        <Typography style={styles.caption}>{distanceCaption}</Typography>
        <Typography style={styles.metric}>{distanceLabel}</Typography>
      </View>
      <View style={styles.topRight}>
        <Typography style={styles.caption}>ETA</Typography>
        <Typography style={styles.metric}>{etaLabel}</Typography>
      </View>
    </View>
    <View style={styles.divider} />
    <View style={styles.instructionRow}>
      <View style={styles.arrowCircle}>
        <Icon
          componentName={turnIcon.componentName}
          iconName={turnIcon.iconName}
          size={FontSize.Large}
          color={COLORS.WHITE}
        />
      </View>
      <View style={styles.instructionText}>
        <Typography style={styles.instructionTitle} numberOfLines={2}>
          {step.instruction}
        </Typography>
        {step.distanceText ? (
          <Typography style={styles.instructionSub}>{step.distanceText}</Typography>
        ) : null}
      </View>
    </View>
  </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.APP_LINE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  topRight: {
    alignItems: 'flex-end',
  },
  caption: {
    fontSize: FontSize.ExtraLarge,
    color: COLORS.BLACK,
  },
  metric: {
    fontSize: FontSize.MediumLarge,
    fontWeight: FontWeight.Bold,
    color: COLORS.BLACK,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.APP_LINE,
    marginVertical: 12,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  arrowCircle: {
    width: 50,
    height: 50,
  
    borderRadius: 50,
    backgroundColor:'#B5B5B7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionText: {
    flex: 1,
  },
  instructionTitle: {
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
  },
  instructionSub: {
    fontSize: FontSize.Small,
    color: COLORS.APP_TEXT_MUTED,
    marginTop: 4,
  },
});
