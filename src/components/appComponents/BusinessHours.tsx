import { View, StyleSheet } from 'react-native';
import { COLORS, screenHeight, screenWidth } from 'utils/index';
import { FlatListComponent, RowComponent, Typography } from 'components/index';
import { FontWeight } from 'types/fontTypes';

export const BusinessHours = ({
  data,
}: {
  data: { day: string; start_time: string; end_time: string }[];
}) => {
  const highlightDay = (day: string) => {
    if (day === 'Friday') {
      return { fontWeight: FontWeight.Bold, paddingVertical: 2 };
    }
    return;
  };
  return (
    <FlatListComponent
      data={data}
      renderItem={({ item, index }) => (
        <RowComponent
          style={{ ...styles.container, borderBottomWidth: index === data?.length - 1 ? 0 : 0.5 }}
        >
          <RowComponent style={styles.subContainer}>
            <View style={styles.dot} />
            <Typography style={[styles.text, highlightDay(item?.day)]}>{item?.day}</Typography>
          </RowComponent>
          <RowComponent style={styles.subContainer}>
            <Typography translate={false} style={[styles.text, highlightDay(item?.day)]}>
              {item?.start_time}
            </Typography>
            <Typography style={[styles.text, highlightDay(item?.day)]}>-</Typography>
            <Typography translate={false} style={[styles.text, highlightDay(item?.day)]}>
              {item?.end_time}
            </Typography>
          </RowComponent>
        </RowComponent>
      )}
    />
  );
};

const styles = StyleSheet.create({
  serviceName: {
    fontWeight: FontWeight.SemiBold,
  },
  photoGrid: {
    width: screenWidth(42),
    height: screenHeight(18),
    borderRadius: 8,
  },
  text: {
    color: COLORS.PRIMARY,
  },
  subContainer: {
    justifyContent: 'flex-start',
    gap: 10,
    alignItems: 'center',
  },
  container: {
    padding: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.BORDER,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.SECONDARY,
  },
});
