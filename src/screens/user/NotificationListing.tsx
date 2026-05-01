import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { Wrapper } from 'components/common';
import { Typography, RowComponent, FlatListComponent, SkeletonWrapper } from 'components/common';
import { Icon } from 'components/common/Icon';
import { COLORS } from 'utils/colors';
import { handleNotificationNavigation } from 'utils/notifications';
import { FontSize, FontWeight } from 'types/fontTypes';
import { VARIABLES } from 'constants/common';
import { COMMON_TEXT } from 'constants/screens';
import { getNotifications } from 'api/functions/app/notifications';
import { Activity } from 'types/responseTypes';
import { formatDateMonthDayYear, screenWidth } from 'utils/helpers';
import { setNotificationUnreadCount } from 'store/slices/user';
import { useAppDispatch } from 'types/reduxTypes';

const NotificationSkeleton = () => (
  <View style={skeletonStyles.container}>
    <SkeletonWrapper
      isLoading={true}
      count={10}
      renderItem={index =>
        index === 0 ? (
          <SkeletonPlaceholder.Item width={100} height={20} borderRadius={6} marginBottom={15} />
        ) : (
          <View style={skeletonStyles.skeletonRow}>
            <SkeletonPlaceholder.Item width={45} height={45} borderRadius={10} marginRight={15} />
            <View style={skeletonStyles.skeletonContent}>
              <SkeletonPlaceholder.Item
                width={screenWidth(70)}
                height={16}
                borderRadius={6}
                marginBottom={8}
              />
              <SkeletonPlaceholder.Item width={screenWidth(50)} height={14} borderRadius={6} />
            </View>
          </View>
        )
      }
    >
      <View />
    </SkeletonWrapper>
  </View>
);

const getDateGroupLabel = (dateStr: string): string => {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  date.setHours(0, 0, 0, 0);
  if (date.getTime() === today.getTime()) return 'Today';
  if (date.getTime() === yesterday.getTime()) return 'Yesterday';
  return formatDateMonthDayYear(dateStr);
};

const getIconForType = (type: string): string => {
  const map: Record<string, string> = {
    'new-booking-available': 'event',
    'new-quotation-accepted': 'event',
    'new-quotation-received': 'request-quote',
    'updated-quotation-received': 'request-quote',
    'quotation-received': 'request-quote',
    'booking-confirmed': 'event',
    'booking-cancelled': 'event',
    'booking-status-updated': 'event',
    'proof-of-work-submitted': 'verified-user',
    'result-of-work-approved': 'check-circle',
    'payment-withdrawal-requested': 'account-balance-wallet',
    'password-updated': 'lock',
    'profile-updated': 'person',
    'card-added': 'credit-card',
  };
  return map[type] ?? 'notifications';
};

type FlatListItem =
  | { type: 'header'; date: string; id: string }
  | { type: 'item'; activity: Activity; id: string };

const buildGroups = (activities: Activity[]) => {
  const byDate = activities.reduce<Record<string, Activity[]>>((acc, a) => {
    const label = getDateGroupLabel(a.created_at);
    if (!acc[label]) acc[label] = [];
    acc[label].push(a);
    return acc;
  }, {});
  const order = ['Today', 'Yesterday'];
  return Object.keys(byDate)
    .sort((a, b) => {
      const ai = order.indexOf(a);
      const bi = order.indexOf(b);
      if (ai >= 0 && bi >= 0) return ai - bi;
      if (ai >= 0) return -1;
      if (bi >= 0) return 1;
      return (
        new Date(byDate[b][0]?.created_at ?? 0).getTime() -
        new Date(byDate[a][0]?.created_at ?? 0).getTime()
      );
    })
    .map(date => ({ date, activities: byDate[date] }));
};

const flattenGroups = (groups: { date: string; activities: Activity[] }[]): FlatListItem[] => {
  const items: FlatListItem[] = [];
  groups.forEach(g => {
    items.push({ type: 'header', date: g.date, id: `h-${g.date}` });
    g.activities.forEach(a => items.push({ type: 'item', activity: a, id: `a-${a.id}` }));
  });
  return items;
};

export const NotificationListing = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const loadingMoreRef = useRef(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [truncatedIds, setTruncatedIds] = useState<Set<string>>(new Set());
  const dispatch = useAppDispatch();

  const toggleExpand = useCallback((itemId: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }, []);

  const markTruncated = useCallback((itemId: string) => {
    setTruncatedIds(prev => {
      if (prev.has(itemId)) return prev;
      return new Set([...prev, itemId]);
    });
  }, []);
  const groups = useMemo(() => buildGroups(activities), [activities]);
  const flatData = useMemo(() => flattenGroups(groups), [groups]);

  const fetchNotifications = useCallback(async (pageNum: number, append: boolean) => {
    const data = await getNotifications(pageNum);
    if (!data) return;
    setActivities(prev =>
      append && data.activities?.length ? [...prev, ...data.activities] : (data.activities ?? []),
    );
    dispatch(setNotificationUnreadCount(0));
    setHasMore((data.current_page ?? 1) < (data.last_page ?? 1));
  }, []);

  const loadPage = useCallback(
    async (pageNum: number, append: boolean) => {
      if (append) {
        loadingMoreRef.current = true;
        setLoadingMore(true);
      } else setLoading(true);
      await fetchNotifications(pageNum, append);
      if (append) {
        loadingMoreRef.current = false;
        setLoadingMore(false);
      } else setLoading(false);
    },
    [fetchNotifications],
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    setExpandedIds(new Set());
    setTruncatedIds(new Set());
    await fetchNotifications(1, false);
    setRefreshing(false);
  }, [fetchNotifications]);

  const handleEndReached = useCallback(() => {
    if (loading || loadingMoreRef.current || !hasMore) return;
    const next = page + 1;
    setPage(next);
    loadPage(next, true);
  }, [page, loading, hasMore, loadPage]);

  useEffect(() => {
    loadPage(1, false);
  }, []);

  const renderItem = ({ item, index }: { item: FlatListItem; index: number }) => {
    if (item.type === 'header') {
      return (
        <View style={[styles.groupHeader, index > 0 && styles.groupHeaderNotFirst]}>
          <Typography style={styles.groupTitle}>{item.date}</Typography>
        </View>
      );
    }
    const a = item.activity;
    const itemId = item.id;
    const isExpanded = expandedIds.has(itemId);
    const isTruncated = truncatedIds.has(itemId);
    const isLongByChars = (a.body?.length ?? 0) > 100;
    const showReadMore = (isTruncated || isLongByChars || isExpanded) && a.body;
    const notificationData = {
      type: a.type,
      objectable_id: a?.objectable_id,
      booking_id: a?.objectable_id ?? null,
      status: (a as any)?.status ?? null,
      sub_type: (a as any)?.sub_type ?? null,
    };

    return (
      <RowComponent
        onPress={() => handleNotificationNavigation(notificationData)}
        activeOpacity={0.7}
        style={styles.notificationItem}
      >
        <View style={styles.iconContainer}>
          <Icon
            componentName={VARIABLES.MaterialIcons as any}
            iconName={getIconForType(a.type)}
            size={24}
            color={COLORS.PRIMARY}
          />
        </View>
        <View style={styles.notificationContent}>
          <Typography style={styles.notificationTitle}>{a.title}</Typography>
          <View style={styles.bodyContainer}>
            {!isExpanded && a.body ? (
              <Typography
                style={[styles.notificationSubtitle, styles.measureText]}
                onTextLayout={e => {
                  const lines = e.nativeEvent?.lines ?? [];
                  if (lines.length > 2) markTruncated(itemId);
                }}
              >
                {a.body}
              </Typography>
            ) : null}
            <Typography
              style={styles.notificationSubtitle}
              numberOfLines={isExpanded ? undefined : 2}
              ellipsizeMode={isExpanded ? undefined : 'tail'}
            >
              {a.body}
            </Typography>
          </View>
          {showReadMore ? (
            <TouchableOpacity
              onPress={() => toggleExpand(itemId)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.7}
            >
              <Typography style={styles.readMore}>
                {isExpanded ? 'Read less' : 'Read more'}
              </Typography>
            </TouchableOpacity>
          ) : null}
        </View>
      </RowComponent>
    );
  };

  return (
    <Wrapper headerTitle={COMMON_TEXT.NOTIFICATIONS}>
      {loading ? (
        <NotificationSkeleton />
      ) : (
        <FlatListComponent<FlatListItem>
          data={flatData}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.contentContainer}
          style={styles.container}
          scrollEnabled={true}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.3}
          showLoadingMore={loadingMore}
        />
      )}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: COLORS.TEXT_SECONDARY,
  },
  groupHeader: {
    marginBottom: 15,
  },
  groupHeaderNotFirst: {
    marginTop: 30,
  },
  groupTitle: {
    fontSize: FontSize.Large,
    fontWeight: FontWeight.Bold,
    color: COLORS.TEXT,
  },
  notificationItem: {
    alignItems: 'flex-start',
    gap: 15,
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.BORDER,
    paddingBottom: 15,
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 10,
    backgroundColor: COLORS.NOTIFICATION_ICON_BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContent: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  notificationTitle: {
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.Bold,
    color: COLORS.TEXT,
    marginBottom: 4,
  },
  bodyContainer: {
    position: 'relative',
  },
  notificationSubtitle: {
    fontSize: FontSize.MediumSmall,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
  },
  measureText: {
    position: 'absolute',
    opacity: 0,
    width: '100%',
  },
  readMore: {
    fontSize: FontSize.Small,
    color: COLORS.PRIMARY,
    marginTop: 4,
    fontWeight: FontWeight.SemiBold,
  },
});

const skeletonStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.BORDER,
  },
  skeletonContent: {
    flex: 1,
  },
});
