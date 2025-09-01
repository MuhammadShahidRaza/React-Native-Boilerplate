import { TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { FlatListComponent } from './Flatlist';
import { COLORS } from 'utils/colors';
import { FLEX_CENTER } from 'utils/commonStyles';
import { FontWeight } from 'types/fontTypes';
import { SetStateType } from 'types/common';
import { Typography } from './Typography';
import {
  getCurrentDate,
  getCurrentMonth,
  getHalfWeekdayName,
  screenHeight,
  screenWidth,
} from 'utils/helpers';
import { MONTHS } from 'constants/common';
import { useEffect, useRef } from 'react';

type Props = {
  selectedMonth: string;
  selectedDate: number;
  setSelectedDate: SetStateType<number>;
};

const generateDatesWithWeekdays = (month: string) => {
  const currentYear = new Date().getFullYear();
  const monthSelected = Object.values(MONTHS).indexOf(month);
  const start = new Date(currentYear, monthSelected, 1);
  const end = new Date(currentYear, monthSelected + 1, 0);
  const dates = [];

  for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
    dates.push({
      date: d.getDate(),
      weekday: getHalfWeekdayName(new Date(d)),
    });
  }

  return dates;
};

export const DatesListing = ({
  selectedMonth = getCurrentMonth(),
  selectedDate = getCurrentDate(),
  setSelectedDate,
}: Props) => {
  const datesWithWeekdays = generateDatesWithWeekdays(selectedMonth);
  const flatListRef = useRef<FlatList<{ date: number; weekday: string }> | null>(null);

  useEffect(() => {
    const scollToCurrrentDate = () => {
      setTimeout(() => {
        if (flatListRef.current && selectedDate) {
          const index = datesWithWeekdays.findIndex(d => d.date === selectedDate);
          if (index >= 0) {
            flatListRef.current.scrollToIndex({ index, animated: true });
          }
        }
      }, 2000);
    };

    scollToCurrrentDate();
  }, []);

  return (
    <FlatListComponent
      reference={flatListRef}
      data={datesWithWeekdays}
      horizontal
      renderItem={({ item, index }) => (
        <TouchableOpacity
          key={index}
          onPress={() => {
            setSelectedDate(item.date);
          }}
          style={[
            styles.dateButton,
            {
              backgroundColor: selectedDate === item.date ? COLORS.SECONDARY : COLORS.WHITE,
            },
          ]}
        >
          <Typography
            style={{
              fontWeight: FontWeight.Bold,
              color: selectedDate === item.date ? COLORS.WHITE : COLORS.GRAY,
            }}
          >
            {item?.date.toString()}
          </Typography>
          <Typography
            style={{
              color: selectedDate === item.date ? COLORS.WHITE : COLORS.GRAY,
            }}
          >
            {item.weekday}
          </Typography>
        </TouchableOpacity>
      )}
    />
  );
};

const styles = StyleSheet.create({
  dateButton: {
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    height: screenHeight(8),
    width: screenWidth(20),
    marginVertical: 20,
    borderRadius: 10,
    marginRight: 10,
    ...FLEX_CENTER,
    gap: 5,
  },
});
