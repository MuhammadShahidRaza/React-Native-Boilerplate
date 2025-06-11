import { useCallback } from 'react';
import { StyleSheet, View, TextStyle } from 'react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { COLORS } from 'utils/colors';
import { isIOS, screenWidth } from 'utils/helpers';
import { Typography } from './Typography';
import { SetStateType } from 'types/common';
import { FontSize } from 'types/fontTypes';
import { RowComponent } from '..';

interface RangeSliderProps {
  title?: string;
  titleStyle?: TextStyle;
  values: number[];
  labels?: number[];
  setValues: SetStateType<number[]>;

}

export const RangeSlider: React.FC<RangeSliderProps> = ({
  title,
  titleStyle,
  setValues,
  values,
  labels
}) => {
  const multiSliderValuesChange = useCallback((values: number[]) => {
    setValues(values);
  }, []);

  return (
    <>
      {title && (
        <Typography style={[styles.title, titleStyle]}>{title}</Typography>
      )}
      <MultiSlider
        values={values}
        selectedStyle={styles.selectedStyle}
        containerStyle={styles.containerStyle}
        min={1}
        max={100}
        trackStyle={styles.trackStyle}
        onValuesChange={multiSliderValuesChange}
        allowOverlap={false}
        minMarkerOverlapDistance={10}
        isMarkersSeparated={true}
        sliderLength={screenWidth(90)}
        customMarkerLeft={() => (
          <View style={styles.markerContainer}>
            <View style={styles.marker} />
            <Typography style={styles.markerText}>
            </Typography>
          </View>
        )}
        customMarkerRight={() => (
          <View style={styles.markerContainer}>
            <View style={styles.marker} />
            <Typography style={styles.markerText}>
            </Typography>
          </View>
        )}
      />

      <View style={styles.labelContainer}>
        {labels?.map((item, index) => (
          <Typography key={index} style={styles.markerText}>
            {`$${item?.toString()}`}
          </Typography>
        ))}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  title: {
    marginBottom: 8,
  },
  selectedStyle: {
    backgroundColor: COLORS.PURPLE,
  },
  containerStyle: {
    marginTop: 10,
    justifyContent: 'flex-start',
    height: isIOS() ? 10 : 60,
  },
  trackStyle: {
    height: 3,
    backgroundColor: COLORS.BORDER,
  },
  markerContainer: {
    alignItems: 'center',
  },
  marker: {
    height: 20,
    marginTop: isIOS() ? 25 : 35,
    width: 20,
    borderRadius: 10,
    backgroundColor: COLORS.PURPLE,
    borderWidth: 2,
    borderColor: COLORS.SECONDARY,
  },
  markerText: {
    color: COLORS.SECONDARY,
    fontSize: FontSize.Small,
    marginTop: 5
  },
  labelContainer: {
    width: '100%',
    justifyContent: 'space-between',
    flexDirection: 'row'
  },
});
