import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppGradient, Typography } from 'components/index';
import { FontSize, FontWeight } from 'types/fontTypes';
import { BRAND_PRIMARY, BRAND_SECONDARY, COLORS } from 'utils/index';

const SIZE = 100;
const RING = 8;

export interface WorkerRequestTimerProps {
  seconds?: number;
  onExpire?: () => void;
  /** When false, countdown pauses and onExpire will not fire. */
  active?: boolean;
}

export const WorkerRequestTimer = ({
  seconds = 60,
  onExpire,
  active = true,
}: WorkerRequestTimerProps) => {
  const [remaining, setRemaining] = useState(seconds);
  const onExpireRef = useRef(onExpire);
  const activeRef = useRef(active);
  onExpireRef.current = onExpire;
  activeRef.current = active;

  useEffect(() => {
    if (!active) {
      setRemaining(seconds);
      return;
    }

    setRemaining(seconds);
    const startedAt = Date.now();

    const tick = () => {
      if (!activeRef.current) return false;
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const left = Math.max(0, seconds - elapsed);
      setRemaining(left);
      if (left <= 0) {
        if (activeRef.current) {
          onExpireRef.current?.();
        }
        return false;
      }
      return true;
    };

    tick();
    const id = setInterval(() => {
      if (!tick()) clearInterval(id);
    }, 250);

    return () => clearInterval(id);
  }, [seconds, active]);

  const displayMin = String(Math.floor(remaining / 60)).padStart(2, '0');
  const displaySec = String(remaining % 60).padStart(2, '0');
  const showSecondsOnly = remaining < 60;

  return (
    <View style={styles.wrap}>
      <View style={styles.ring}>
        <AppGradient
          colors={[BRAND_SECONDARY, BRAND_PRIMARY]}
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
                <Typography style={styles.time}>{displayMin}</Typography>
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
