import { View, StyleSheet } from 'react-native';
import { MONTHS, VARIABLES } from 'constants/index';
import { screenWidth } from 'utils/helpers';
import { Dropdown } from './Dropdown';
import { Icon } from './Icon';
import { RowComponent } from './Row';
import { Typography } from './Typography';
import { FontWeight, SetStateType, StyleType } from 'types/index';
import { useTranslation } from 'hooks/useTranslation';

type Props = {
  selectedMonth: string;
  setSelectedMonth: SetStateType<string>;
  dropDownStyle?: StyleType;
};
const monthsArray = Object.values(MONTHS);

export const MonthsListing = ({ selectedMonth, setSelectedMonth, dropDownStyle }: Props) => {
  const { isLangRTL } = useTranslation();
  const getPreviousMonth = (currentMonth: string) => {
    const index = monthsArray.indexOf(currentMonth);
    return monthsArray[(index - 1 + monthsArray.length) % monthsArray.length];
  };

  const getNextMonth = (currentMonth: string) => {
    const index = monthsArray.indexOf(currentMonth);
    return monthsArray[(index + 1) % monthsArray.length];
  };

  const previousMonth = getPreviousMonth(selectedMonth);
  const nextMonth = getNextMonth(selectedMonth);

  const handlePrevMonth = () => {
    setSelectedMonth(previousMonth);
  };

  const handleNextMonth = () => {
    setSelectedMonth(nextMonth);
  };

  return (
    <>
      <RowComponent hitSlop={8} onPress={handlePrevMonth}>
        <RowComponent>
          <Icon
            iconStyle={{ transform: [{ scaleX: isLangRTL ? -1 : 1 }] }}
            componentName={VARIABLES.MaterialIcons}
            iconName={'keyboard-arrow-left'}
          />

          <Typography style={styles.sideText}>{previousMonth}</Typography>
        </RowComponent>

        <RowComponent hitSlop={8} onPress={handleNextMonth}>
          <Typography style={styles.sideText}>{nextMonth}</Typography>
          <Icon
            componentName={VARIABLES.MaterialIcons}
            iconStyle={{ transform: [{ scaleX: isLangRTL ? -1 : 1 }] }}
            iconName={'keyboard-arrow-right'}
          />
        </RowComponent>
      </RowComponent>

      <View
        style={[
          {
            position: 'absolute',
            left: screenWidth(32),
            top: 45,
            zIndex: 10,
          },
          dropDownStyle,
        ]}
      >
        <Dropdown
          width={screenWidth(28)}
          containerStyle={{ borderWidth: 0 }}
          textStyle={styles.title}
          options={monthsArray.map(monthKey => ({
            name: monthKey,
          }))}
          selectedValue={selectedMonth}
          onSelect={setSelectedMonth}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  title: {
    fontWeight: FontWeight.Bold,
  },
  sideText: {},
});
