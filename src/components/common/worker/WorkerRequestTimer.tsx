import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Typography } from '../Typography';
import { FontSize, FontWeight } from 'types/fontTypes';
import { APP_GRADIENT_PRIMARY_LIGHT, COLORS } from 'utils/index';

const SIZE = 96;
const STROKE = 7;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GRADIENT_ID = 'workerTimerGradient';

export interface WorkerRequestTimerProps {
  seconds?: number;
  onExpire?: () => void;
}

export const WorkerRequestTimer = ({ seconds = 60, onExpire }: WorkerRequestTimerProps) => {
  const [remaining, setRemaining] = useState(seconds);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    setRemaining(seconds);
    const startedAt = Date.now();

    const tick = () => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const left = Math.max(0, seconds - elapsed);
      setRemaining(left);
      if (left <= 0) {
        onExpireRef.current?.();
        return false;
      }
      return true;
    };

    tick();
    const id = setInterval(() => {
      if (!tick()) clearInterval(id);
    }, 250);

    return () => clearInterval(id);
  }, [seconds]);

  const progress = remaining / seconds;
  const offset = CIRCUMFERENCE * (1 - progress);
  const displayMin = String(Math.floor(remaining / 60)).padStart(2, '0');
  const displaySec = String(remaining % 60).padStart(2, '0');
  const showSecondsOnly = remaining < 60;

  return (
    <View style={styles.wrap}>
      <Svg width={SIZE} height={SIZE}>
        <Defs>
          <LinearGradient id={GRADIENT_ID} x1='0%' y1='0%' x2='100%' y2='100%'>
            <Stop offset='0%' stopColor={APP_GRADIENT_PRIMARY_LIGHT[0]} />
            <Stop offset='100%' stopColor={APP_GRADIENT_PRIMARY_LIGHT[1]} />
          </LinearGradient>
        </Defs>
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={COLORS.APP_LINE}
          strokeWidth={STROKE}
          fill='none'
        />
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={`url(#${GRADIENT_ID})`}
          strokeWidth={STROKE}
          fill='none'
          strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
          strokeDashoffset={offset}
          strokeLinecap='round'
          rotation='-90'
          origin={`${SIZE / 2}, ${SIZE / 2}`}
        />
      </Svg>
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
      <Typography style={styles.subTime}>{`${displayMin}:${displaySec}`}</Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    width: SIZE,
    height: SIZE + 18,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelWrap: {
    position: 'absolute',
    top: SIZE / 2 - 22,
    alignItems: 'center',
  },
  time: {
    fontSize: FontSize.ExtraLarge,
    fontWeight: FontWeight.Bold,
    color: COLORS.APP_TEXT,
    lineHeight: 32,
  },
  unit: {
    fontSize: FontSize.ExtraSmall,
    color: COLORS.APP_TEXT_MUTED,
    marginTop: -2,
  },
  subTime: {
    position: 'absolute',
    bottom: 0,
    fontSize: FontSize.ExtraSmall,
    color: COLORS.APP_TEXT_MUTED,
    fontWeight: FontWeight.SemiBold,
  },
});
