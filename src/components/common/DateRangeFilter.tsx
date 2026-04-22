import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Button, Icon, RowComponent, Typography } from 'components/index';
import { ModalComponent } from 'components/common/Modal';
import { COLORS, formatDateMonthDayYear, screenWidth } from 'utils/index';
import { FontSize, FontWeight } from 'types/fontTypes';
import { VARIABLES } from 'constants/common';

export type DateSortOrder = 'asc' | 'desc';

interface DateRangeFilterState {
  dateFrom: string | null;
  dateTo: string | null;
  sortOrder: DateSortOrder;
}

interface DateRangeFilterContextValue extends DateRangeFilterState {
  setDateFrom: (d: string | null) => void;
  setDateTo: (d: string | null) => void;
  setSortOrder: (order: DateSortOrder) => void;
  clearFilter: () => void;
  openFilterModal: () => void;
  closeFilterModal: () => void;
  filterModalVisible: boolean;
}

const defaultState: DateRangeFilterState = {
  dateFrom: null,
  dateTo: null,
  sortOrder: 'desc',
};

const DateRangeFilterContext = createContext<DateRangeFilterContextValue | null>(null);

export function useDateRangeFilter(): DateRangeFilterContextValue {
  const ctx = useContext(DateRangeFilterContext);
  if (!ctx) throw new Error('useDateRangeFilter must be used within DateRangeFilterProvider');
  return ctx;
}

/** Parse item with date (MM/DD/YYYY) or created_at (YYYY-MM-DD) to timestamp */
export function getTimestampFromDateFields(item: { date?: string; created_at?: string }): number {
  const raw = item.date || item.created_at || '';
  if (!raw) return 0;
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return new Date(raw).getTime();
  const [mm, dd, yyyy] = raw.split('/');
  if (mm && dd && yyyy) return new Date(`${yyyy}-${mm}-${dd}`).getTime();
  return new Date(raw).getTime();
}

/** Filter by date range and sort by date (generic, use getTimestamp for your item type) */
export function filterAndSortByDate<T>(
  items: T[],
  getTimestamp: (item: T) => number,
  dateFrom: string | null,
  dateTo: string | null,
  sortOrder: DateSortOrder,
): T[] {
  let list = [...items];
  if (dateFrom) {
    const from = new Date(dateFrom).setHours(0, 0, 0, 0);
    list = list.filter(j => getTimestamp(j) >= from);
  }
  if (dateTo) {
    const to = new Date(dateTo).setHours(23, 59, 59, 999);
    list = list.filter(j => getTimestamp(j) <= to);
  }
  list.sort((a, b) => {
    const ta = getTimestamp(a);
    const tb = getTimestamp(b);
    return sortOrder === 'asc' ? ta - tb : tb - ta;
  });
  return list;
}

const DateRangeFilterModal: React.FC = () => {
  const {
    dateFrom,
    dateTo,
    sortOrder,
    setDateFrom,
    setDateTo,
    setSortOrder,
    clearFilter,
    closeFilterModal,
    filterModalVisible,
  } = useDateRangeFilter();
  const [tempFrom, setTempFrom] = useState<string | null>(dateFrom);
  const [tempTo, setTempTo] = useState<string | null>(dateTo);
  const [tempSort, setTempSort] = useState<DateSortOrder>(sortOrder);

  const handleDayPress = useCallback(
    (day: { dateString: string }) => {
      const d = day.dateString;
      if (!tempFrom || (tempFrom && tempTo)) {
        setTempFrom(d);
        setTempTo(null);
      } else {
        const from = new Date(tempFrom).getTime();
        const to = new Date(d).getTime();
        if (to < from) {
          setTempFrom(d);
          setTempTo(tempFrom);
        } else {
          setTempTo(d);
        }
      }
    },
    [tempFrom, tempTo],
  );

  const minDate = tempFrom && !tempTo ? tempFrom : undefined;

  const markedDates = useMemo(() => {
    const m: Record<
      string,
      { startingDay?: boolean; endingDay?: boolean; color?: string; textColor?: string }
    > = {};
    if (tempFrom) {
      m[tempFrom] = { startingDay: true, color: COLORS.PRIMARY, textColor: COLORS.WHITE };
      if (tempTo && tempTo !== tempFrom) {
        m[tempTo] = { endingDay: true, color: COLORS.PRIMARY, textColor: COLORS.WHITE };
      }
    }
    return m;
  }, [tempFrom, tempTo]);

  useEffect(() => {
    if (filterModalVisible) {
      setTempFrom(dateFrom);
      setTempTo(dateTo);
      setTempSort(sortOrder);
    }
  }, [filterModalVisible, dateFrom, dateTo, sortOrder]);

  const onApply = useCallback(() => {
    setDateFrom(tempFrom);
    setDateTo(tempTo);
    setSortOrder(tempSort);
    closeFilterModal();
  }, [tempFrom, tempTo, tempSort, setDateFrom, setDateTo, setSortOrder, closeFilterModal]);

  const onClear = useCallback(() => {
    setTempFrom(null);
    setTempTo(null);
    setTempSort('desc');
    clearFilter();
    closeFilterModal();
  }, [clearFilter, closeFilterModal]);

  return (
    <ModalComponent
      position='center'
      modalVisible={filterModalVisible}
      setModalVisible={() => closeFilterModal()}
      modalSecondaryContainerStyle={filterStyles.modal}
    >
      <View style={filterStyles.modalHeader}>
        <Typography style={filterStyles.modalTitle}>Date range & sort</Typography>
        <TouchableOpacity
          onPress={closeFilterModal}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Icon
            componentName={VARIABLES.Ionicons}
            iconName='close'
            size={FontSize.Large}
            color={COLORS.TEXT}
          />
        </TouchableOpacity>
      </View>
      <Calendar
        onDayPress={handleDayPress}
        markingType='period'
        markedDates={markedDates}
        minDate={minDate}
        style={filterStyles.calendar}
        theme={{
          backgroundColor: COLORS.BACKGROUND,
          calendarBackground: COLORS.BACKGROUND,
          textSectionTitleColor: COLORS.TEXT,
          selectedDayBackgroundColor: COLORS.PRIMARY,
          selectedDayTextColor: COLORS.WHITE,
          todayTextColor: COLORS.PRIMARY,
          dayTextColor: COLORS.TEXT,
          textDisabledColor: COLORS.TEXT_SECONDARY,
          arrowColor: COLORS.PRIMARY,
          monthTextColor: COLORS.TEXT,
          textDayFontSize: FontSize.MediumSmall,
          textMonthFontSize: FontSize.Medium,
          textDayHeaderFontSize: FontSize.Small,
        }}
      />
      {/* <Typography style={filterStyles.sortLabel}>Sort by date</Typography>
      <RowComponent style={filterStyles.sortRow}>
        <TouchableOpacity
          style={[filterStyles.sortOption, tempSort === 'asc' && filterStyles.sortOptionActive]}
          onPress={() => setTempSort('asc')}
        >
          <Typography style={[filterStyles.sortOptionText, tempSort === 'asc' && filterStyles.sortOptionTextActive]}>
            Oldest first
          </Typography>
        </TouchableOpacity>
        <TouchableOpacity
          style={[filterStyles.sortOption, tempSort === 'desc' && filterStyles.sortOptionActive]}
          onPress={() => setTempSort('desc')}
        >
          <Typography style={[filterStyles.sortOptionText, tempSort === 'desc' && filterStyles.sortOptionTextActive]}>
            Newest first
          </Typography>
        </TouchableOpacity>
      </RowComponent> */}
      <RowComponent style={filterStyles.modalButtons}>
        <Button title='Clear' onPress={onClear} style={filterStyles.buttonClear} />
        <Button title='Apply' onPress={onApply} style={filterStyles.buttonApply} />
      </RowComponent>
    </ModalComponent>
  );
};

export const DateRangeFilterBar: React.FC = () => {
  const { dateFrom, dateTo, sortOrder, openFilterModal, setSortOrder, clearFilter } =
    useDateRangeFilter();
  const hasActiveFilter = !!dateFrom || !!dateTo;
  const sortLabel = sortOrder === 'desc' ? 'Newest first' : 'Oldest first';
  const rangeLabel =
    dateFrom && dateTo
      ? `${formatDateMonthDayYear(dateFrom)} – ${formatDateMonthDayYear(dateTo)}`
      : dateFrom
        ? formatDateMonthDayYear(dateFrom)
        : null;
  return (
    <RowComponent style={filterStyles.bar}>
      <RowComponent style={filterStyles.filterButton} onPress={openFilterModal} activeOpacity={0.7}>
        <Icon
          componentName={VARIABLES.Ionicons}
          iconName='calendar-outline'
          size={FontSize.Medium}
          color={hasActiveFilter ? COLORS.PRIMARY : COLORS.TEXT_SECONDARY}
        />
        <Typography
          style={[
            filterStyles.filterButtonText,
            hasActiveFilter && filterStyles.filterButtonTextActive,
          ]}
          numberOfLines={1}
        >
          {hasActiveFilter && rangeLabel
            ? rangeLabel
            : hasActiveFilter
              ? 'Edit date range'
              : 'Filter by date'}
        </Typography>
        {hasActiveFilter && (
          <RowComponent style={filterStyles.clearChip} onPress={clearFilter} activeOpacity={0.7}>
            <Icon
              componentName={VARIABLES.Ionicons}
              iconName='close-outline'
              size={FontSize.Medium}
              color={COLORS.ERROR}
            />
            <Typography style={filterStyles.clearChipText}>Clear</Typography>
          </RowComponent>
        )}
      </RowComponent>
      <RowComponent style={filterStyles.barRight}>
        <TouchableOpacity
          style={filterStyles.sortChip}
          onPress={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
          activeOpacity={0.7}
        >
          <Typography style={filterStyles.sortChipText}>{sortLabel}</Typography>
          <Icon
            componentName={VARIABLES.Ionicons}
            iconName={sortOrder === 'desc' ? 'arrow-down' : 'arrow-up'}
            size={FontSize.Small}
            color={COLORS.TEXT_SECONDARY}
          />
        </TouchableOpacity>
      </RowComponent>
    </RowComponent>
  );
};

export const DateRangeFilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<DateRangeFilterState>(defaultState);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const value = useMemo<DateRangeFilterContextValue>(
    () => ({
      ...state,
      setDateFrom: d => setState(s => ({ ...s, dateFrom: d })),
      setDateTo: d => setState(s => ({ ...s, dateTo: d })),
      setSortOrder: o => setState(s => ({ ...s, sortOrder: o })),
      clearFilter: () => setState(defaultState),
      openFilterModal: () => setFilterModalVisible(true),
      closeFilterModal: () => setFilterModalVisible(false),
      filterModalVisible,
    }),
    [state, filterModalVisible],
  );

  return (
    <DateRangeFilterContext.Provider value={value}>
      {children}
      <DateRangeFilterModal />
    </DateRangeFilterContext.Provider>
  );
};

const filterStyles = StyleSheet.create({
  bar: {
    paddingVertical: 5,
    gap: 5,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    minWidth: 0,
  },
  filterButtonText: {
    flex: 1,
    fontSize: FontSize.MediumSmall,
    color: COLORS.TEXT_SECONDARY,
  },
  filterButtonTextActive: {
    color: COLORS.PRIMARY,
    fontSize: FontSize.Small,
    fontWeight: FontWeight.Bold,
  },
  barRight: {
    alignItems: 'center',
    gap: 8,
  },
  clearChip: {
    paddingVertical: 5,
    paddingHorizontal: 2,
    borderRadius: 8,
    backgroundColor: COLORS.SURFACE,
  },
  clearChipText: {
    color: COLORS.ERROR,
    fontSize: FontSize.Small,
    fontWeight: FontWeight.Bold,
  },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: COLORS.SURFACE,
  },
  sortChipText: {
    fontSize: FontSize.Small,
    color: COLORS.TEXT_SECONDARY,
  },
  modal: {
    padding: 16,
    borderRadius: 16,
    maxWidth: screenWidth(92),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: FontSize.MediumLarge,
    fontWeight: FontWeight.SemiBold,
    color: COLORS.TEXT,
  },
  calendar: {
    borderRadius: 12,
    marginBottom: 16,
  },
  sortLabel: {
    fontSize: FontSize.MediumSmall,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 8,
  },
  sortRow: {
    gap: 10,
    marginBottom: 20,
  },
  sortOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    alignItems: 'center',
  },
  sortOptionActive: {
    borderColor: COLORS.PRIMARY,
    backgroundColor: COLORS.PRIMARY + '15',
  },
  sortOptionText: {
    fontSize: FontSize.MediumSmall,
    color: COLORS.TEXT_SECONDARY,
  },
  sortOptionTextActive: {
    color: COLORS.PRIMARY,
    fontWeight: FontWeight.SemiBold,
  },
  modalButtons: {
    gap: 12,
    flexDirection: 'row',
  },
  buttonClear: {
    flex: 1,
    backgroundColor: COLORS.SURFACE,
  },
  buttonApply: {
    flex: 1,
  },
});
