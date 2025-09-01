import { StyleSheet, View } from 'react-native';
import {
  Button,
  DatesListing,
  FlatListComponent,
  Header,
  MonthsListing,
  Wrapper,
} from 'components/index';
import { isIOS, screenHeight, screenWidth } from 'utils/helpers';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS } from 'utils/colors';
import { COMMON_TEXT } from 'constants/screens';
import { ChildrenType, SetStateType } from 'types/common';
import { useTranslation } from 'hooks/useTranslation';

interface Props {
  headerTitle: string;
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  selectedDate: number;
  selectedMonth: string;
  setSelectedDate: SetStateType<number>;
  isCustomTab: boolean;
  setSelectedMonth: SetStateType<string>;
  children: ChildrenType;
}

export const CutomTabsBooking: React.FC<Props> = ({
  headerTitle,
  selectedTab,
  setSelectedTab,
  selectedDate,
  selectedMonth,
  setSelectedDate,
  children,
  isCustomTab,
  setSelectedMonth,
}) => {
  const tabs = [COMMON_TEXT.UPCOMING, COMMON_TEXT.COMPLETED, COMMON_TEXT.CUSTOM];
  const { isLangRTL } = useTranslation();
  return (
    <Wrapper>
      <Header title={headerTitle} />
      <View style={styles.container}>
        <FlatListComponent
          data={tabs}
          horizontal
          renderItem={({ item }) => (
            <Button
              key={item}
              style={[
                styles.tabButton,
                {
                  padding: isIOS() ? (isLangRTL ? 3 : 10) : 8,
                  height: screenHeight(isIOS() ? (isLangRTL ? 5 : 4.5) : 5.2),

                  backgroundColor: item === selectedTab ? COLORS.PRIMARY : COLORS.WHITE,
                  borderColor: item === selectedTab ? COLORS.SECONDARY : COLORS.BORDER,
                },
              ]}
              textStyle={[
                styles.tabButtonText,
                {
                  color: item === selectedTab ? COLORS.SECONDARY : COLORS.BORDER,
                  fontWeight: FontWeight.Medium,
                },
              ]}
              title={item}
              onPress={() => setSelectedTab(item)}
            />
          )}
        />
        {isCustomTab && (
          <>
            <MonthsListing selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />
            <DatesListing
              selectedDate={selectedDate}
              selectedMonth={selectedMonth}
              setSelectedDate={setSelectedDate}
            />
          </>
        )}
        {children}
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
  },
  tabButton: {
    width: screenWidth(28.5),
    borderRadius: 20,
    marginRight: 5,
    marginBottom: 15,
    borderWidth: 1,
  },
  tabButtonText: {
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.Normal,
  },
  // other styles remain the same
});
