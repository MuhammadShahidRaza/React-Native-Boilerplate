import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppGradient, Typography } from 'components/index';
import { FontSize, FontWeight } from 'types/fontTypes';
import { APP_GRADIENT_HORIZONTAL, COLORS } from 'utils/index';
import { formatJobTimerParts } from 'utils/jobDisplayTimer';

const SIZE = 108;
const RING = 8;

export interface WorkerRequestTimerProps {
  seconds?: number;
  /** Absolute expiry timestamp (ms). When set, countdown is derived from created_at + admin timer. */
  expiresAt?: number;
  onExpire?: () => void;
  /** When false, countdown pauses and onExpire will not fire. */
  active?: boolean;
}

export const WorkerRequestTimer = ({
  seconds = 60,
  expiresAt,
  onExpire,
  active = true,
}: WorkerRequestTimerProps) => {
  const [remaining, setRemaining] = useState(() => {
    if (expiresAt != null) {
      return Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
    }
    return seconds;
  });
  const onExpireRef = useRef(onExpire);
  const activeRef = useRef(active);
  const expiredRef = useRef(false);
  onExpireRef.current = onExpire;
  activeRef.current = active;

  useEffect(() => {
    expiredRef.current = false;

    if (!active) {
      setRemaining(seconds);
      return;
    }

    const getRemaining = () => {
      if (expiresAt != null) {
        return Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      }
      return seconds;
    };

    const tick = (startedAt?: number) => {
      if (!activeRef.current) return false;
      const left =
        expiresAt != null
          ? getRemaining()
          : Math.max(0, seconds - Math.floor((Date.now() - (startedAt ?? Date.now())) / 1000));
      setRemaining(left);
      if (left <= 0) {
        if (activeRef.current && !expiredRef.current) {
          expiredRef.current = true;
          onExpireRef.current?.();
        }
        return false;
      }
      return true;
    };

    const startedAt = Date.now();
    setRemaining(getRemaining());
    const id = setInterval(() => {
      if (!tick(startedAt)) clearInterval(id);
    }, 250);

    return () => clearInterval(id);
  }, [seconds, expiresAt, active]);

  const { minutes: displayMin, seconds: displaySec } = formatJobTimerParts(remaining);

  return (
    <View style={styles.wrap}>
      <View style={styles.ring}>
        <AppGradient
          colors={[...APP_GRADIENT_HORIZONTAL]}
          start={{ x: -1, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.circle}
        >
          <View style={styles.timerBody}>
            <Typography
              style={styles.time}
              fontSize={FontSize.ExtraExtraLarge}
              translate={false}
              numberOfLines={1}
            >
              {`${displayMin}:${displaySec}`}
            </Typography>
            <Typography
              style={styles.unit}
              fontSize={FontSize.Small}
              translate={false}
              numberOfLines={1}
            >
              min : sec
            </Typography>
          </View>
        </AppGradient>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  ring: {
    width: SIZE + RING * 2,
    height: SIZE + RING * 2,
    borderRadius: (SIZE + RING * 2) / 2,
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    padding: RING,
    borderColor: COLORS.SKELETON_BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerBody: {
    width: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  time: {
    fontWeight: FontWeight.Bold,
    color: COLORS.WHITE,
    lineHeight: 38,
    textAlign: 'center',
    width: SIZE - 12,
  },
  unit: {
    fontWeight: FontWeight.SemiBold,
    color: COLORS.WHITE,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 2,
    letterSpacing: 0.3,
  },
});
