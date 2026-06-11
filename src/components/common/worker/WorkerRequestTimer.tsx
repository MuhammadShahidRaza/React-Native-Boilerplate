import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppGradient, Typography } from 'components/index';
import { FontSize, FontWeight } from 'types/fontTypes';
import { APP_GRADIENT_HORIZONTAL, COLORS } from 'utils/index';

const SIZE = 100;
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
      return Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
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
        return Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
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

  const displayMin = String(Math.floor(remaining / 60)).padStart(2, '0');
  const displaySec = String(remaining % 60).padStart(2, '0');
  const showSecondsOnly = remaining < 60;

  return (
    <View style={styles.wrap}>
      <View style={styles.ring}>
        <AppGradient
          colors={[...APP_GRADIENT_HORIZONTAL]}
          start={{ x: -1, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.circle}
        >
          <View style={styles.labelWrap}>
            {showSecondsOnly ? (
              <>
                <Typography style={styles.time}>{displaySec}</Typography>
                <Typography style={styles.unit}>Sec</Typography>
              </>
            ) : (
              <>
                <Typography style={styles.time}>{`${displayMin}:${displaySec}`}</Typography>
                <Typography style={styles.unit}>Min</Typography>
              </>
            )}
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
  labelWrap: {
    alignItems: 'center',
  },
  time: {
    fontSize: FontSize.ExtraLarge,
    fontWeight: FontWeight.Bold,
    color: COLORS.WHITE,
    lineHeight: 32,
  },
  unit: {
    fontSize: FontSize.Small,
    fontWeight: FontWeight.Bold,
    color: COLORS.WHITE,
    marginTop: -2,
  },
});
