import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon, Typography } from 'components/index';
import { COLORS, safeString, screenHeight } from 'utils/index';
import { VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import { Booking } from 'types/responseTypes';
import { navigate } from 'navigation/index';
import { SCREENS } from 'constants/routes';

const BANNER_HEIGHT = screenHeight(17); // ~1/4 of viewport

/** User (customer) stages: Booking → Bid → In Progress → Complete */
const USER_STAGES = [
  {
    key: 'booking',
    label: 'Booking',
    icon: 'calendar-check',
    component: VARIABLES.MaterialCommunityIcons,
  },
  { key: 'bid', label: 'Bid', icon: 'gavel', component: VARIABLES.MaterialCommunityIcons },
  {
    key: 'in_progress',
    label: 'In Progress',
    icon: 'cog',
    component: VARIABLES.MaterialCommunityIcons,
  },
  {
    key: 'complete',
    label: 'Complete',
    icon: 'check-circle',
    component: VARIABLES.MaterialCommunityIcons,
  },
] as const;

/** Dentor (technician) stages: Awaiting Approval → Confirmed → In Progress → Complete */
const DENTOR_STAGES = [
  {
    key: 'awaiting',
    label: 'Awaiting Approval',
    icon: 'clipboard-check',
    component: VARIABLES.MaterialCommunityIcons,
  },
  {
    key: 'confirmed',
    label: 'Confirmed',
    icon: 'check',
    component: VARIABLES.MaterialCommunityIcons,
  },
  {
    key: 'in_progress',
    label: 'In Progress',
    icon: 'wrench',
    component: VARIABLES.MaterialCommunityIcons,
  },
  {
    key: 'complete',
    label: 'Complete',
    icon: 'check-circle',
    component: VARIABLES.MaterialCommunityIcons,
  },
] as const;

/** Map API status to completed step index (0-based). User flow. */
function getCompletedStepIndexUser(status: string | undefined): number {
  const s = (status ?? '').toLowerCase().trim();
  if (s === 'pending') return 0; // Booking done
  if (s === 'bidding') return 1; // Bid done
  if (s === 'upcoming') return 1; // Bid done, scheduled
  if (s === 'in_progress') return 2; // In Progress done
  if (s === 'completed' || s === 'complete') return 3; // All done
  return 0;
}

/** Map API status to completed step index (0-based). Dentor flow (after bid placed). */
function getCompletedStepIndexDentor(status: string | undefined): number {
  const s = (status ?? '').toLowerCase().trim();
  if (s === 'bidding') return 0; // Awaiting Approval
  if (s === 'upcoming') return 1; // Confirmed
  if (s === 'in_progress') return 2; // In Progress done
  if (s === 'completed' || s === 'complete') return 3; // Complete
  return 0;
}

function getBannerTitle(item: Booking): string {
  const make = safeString(item?.vehicle_make);
  const year = safeString(item?.vehicle_year);
  if (make || year) return `${make} ${year}`.trim();
  return item?.service?.name ?? item?.service_type?.name ?? 'Job';
}

export interface JobActivityBannerProps {
  item: Booking;
  isDentor?: boolean;
  onPress?: () => void;
}

export const JobActivityBanner: React.FC<JobActivityBannerProps> = ({
  item,
  isDentor = false,
  onPress,
}) => {
  const rawStatus = typeof item?.status === 'string' ? item.status : String(item?.status ?? '');
  const stages = isDentor ? DENTOR_STAGES : USER_STAGES;
  let completedStep = isDentor
    ? getCompletedStepIndexDentor(rawStatus)
    : getCompletedStepIndexUser(rawStatus);
  // Fallback: if booking has review, it's completed
  if (item?.review != null && completedStep < 3) {
    completedStep = 3;
  }
  const title = getBannerTitle(item);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      navigate(SCREENS.JOB_DETAIL, { jobId: item?.id });
    }
  };

  return (
    <TouchableOpacity style={styles.banner} onPress={handlePress} activeOpacity={0.85}>
      <Typography style={styles.title} numberOfLines={1}>
        {title}
      </Typography>
      <View style={styles.progressRow}>
        {stages.flatMap((stage, index) => {
          const isDone = index <= completedStep;
          const elements: React.ReactNode[] = [
            <View key={stage.key} style={styles.stageWrapper}>
              <View style={[styles.iconCircle, isDone && styles.iconCircleDone]}>
                <Icon
                  componentName={stage.component}
                  iconName={stage.icon}
                  size={20}
                  color={isDone ? COLORS.WHITE : COLORS.TEXT_SECONDARY}
                />
              </View>
              <Typography
                style={[styles.stageLabel, isDone && styles.stageLabelDone]}
                numberOfLines={1}
              >
                {stage.label}
              </Typography>
            </View>,
          ];
          if (index < stages.length - 1) {
            elements.push(
              <View key={`conn-${stage.key}`} style={styles.connector}>
                <View
                  style={[styles.connectorLine, index < completedStep && styles.connectorLineDone]}
                />
              </View>,
            );
          }
          return elements;
        })}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  banner: {
    minHeight: BANNER_HEIGHT,
    backgroundColor: COLORS.SURFACE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.Bold,
    color: COLORS.TEXT,
    marginBottom: 14,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  stageWrapper: {
    alignItems: 'center',
    flex: 0,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.INPUT_BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  iconCircleDone: {
    backgroundColor: COLORS.PRIMARY,
  },
  stageLabel: {
    fontSize: 10,
    fontWeight: FontWeight.Medium,
    color: COLORS.TEXT_SECONDARY,
    maxWidth: 72,
    textAlign: 'center',
  },
  stageLabelDone: {
    color: COLORS.TEXT,
  },
  connector: {
    flex: 1,
    paddingHorizontal: 6,
    marginTop: 17,
    justifyContent: 'center',
  },
  connectorLine: {
    // flex: 1,
    height: 2,
    backgroundColor: COLORS.DIVIDER,
    alignSelf: 'stretch',
    marginHorizontal: 2,
  },
  connectorLineDone: {
    backgroundColor: COLORS.PRIMARY,
  },
});
