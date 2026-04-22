import { memo, useCallback, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { SearchBar } from 'components/appComponents';
import { FlatListComponent, MessageBox, Wrapper } from 'components/common';
import { navigate } from 'navigation/Navigators';
import { STYLES, COLORS } from 'utils/index';
import { SCREENS } from 'constants/index';
import { useConversations } from 'hooks/useConversations';
import { useUserById, useUsersByIds } from 'hooks/useUserById';
import { IMAGES } from 'constants/assets';
import { screenWidth } from 'utils/helpers';

const ChatListItem = memo(
  ({
    item,
    userId,
    initialUser,
    onPress,
  }: {
    item: {
      id: string;
      otherUserId: string;
      lastMessage?: string;
      lastMessageTime?: Date;
      lastMessageSenderId?: string;
      unreadCount: number;
    };
    userId: string;
    initialUser?: { full_name?: string; first_name?: string; profile_image?: string | null } | null;
    onPress: () => void;
  }) => {
    const { user } = useUserById(item.otherUserId);
    const displayUser = user ?? initialUser;
    const isSentByMe = item.lastMessageSenderId === userId;
    const preview = item.lastMessage
      ? (isSentByMe ? 'You: ' : '') + item.lastMessage
      : 'No messages yet';
    const userName = displayUser?.full_name ?? displayUser?.first_name ?? 'User';
    const userImage = displayUser?.profile_image ?? IMAGES.USER_IMAGE;
    const hasUnread = item?.unreadCount > 0;

    return (
      <View>
        <MessageBox
          onPress={onPress}
          containerStyle={{ paddingVertical: 15, gap: 20, borderBottomWidth: 0.5 }}
          userImage={userImage}
          imageStyle={{ width: 50, height: 50, borderRadius: 50 }}
          messageNumLine={2}
          messageStyle={{ color: COLORS.PLACEHOLDER }}
          userName={userName}
          message={preview}
          time={formatChatTime(item.lastMessageTime)}
          timeStyle={{ marginBottom: hasUnread ? 35 : 20 }}
        />
        {hasUnread && (
          <View style={chatItemStyles.badge}>
            <Text style={chatItemStyles.badgeText}>
              {item?.unreadCount > 99 ? '99+' : item?.unreadCount}
            </Text>
          </View>
        )}
      </View>
    );
  },
);

const ChatListSkeleton = () => (
  <SkeletonPlaceholder
    borderRadius={10}
    backgroundColor={COLORS.SKELETON_BACKGROUND}
    highlightColor={COLORS.SKELETON_HIGHLIGHT}
  >
    {[1, 2, 3, 4, 5].map(i => (
      <View key={i} style={skeletonStyles.row}>
        <SkeletonPlaceholder.Item width={50} height={50} borderRadius={25} marginRight={20} />
        <View style={skeletonStyles.content}>
          <SkeletonPlaceholder.Item
            width={screenWidth(40)}
            height={16}
            borderRadius={6}
            marginBottom={8}
          />
          <SkeletonPlaceholder.Item width={screenWidth(55)} height={14} borderRadius={6} />
        </View>
        <SkeletonPlaceholder.Item width={40} height={14} borderRadius={6} alignSelf='flex-end' />
      </View>
    ))}
  </SkeletonPlaceholder>
);

const formatChatTime = (date?: Date): string => {
  if (!date) return '';
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diff < 172800000) return 'Yesterday';
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

export const ChatFirebase = () => {
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { conversations, loading, userId } = useConversations();
  const otherUserIds = conversations.map(c => c.otherUserId);
  const { usersMap, loading: usersLoading } = useUsersByIds(otherUserIds, refreshTrigger);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setRefreshTrigger(t => t + 1);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const renderChats = useCallback(
    ({ item }: { item: (typeof conversations)[0] }) => (
      <ChatListItem
        item={item}
        userId={userId}
        initialUser={usersMap[item.otherUserId]}
        onPress={() =>
          navigate(SCREENS.MESSAGES_FIREBASE, {
            data: {
              conversationId: item.id,
              otherUserId: item.otherUserId,
              initialOtherUser: usersMap[item.otherUserId] ?? undefined,
            },
          })
        }
      />
    ),
    [userId, usersMap],
  );

  const filtered = searchText.trim()
    ? conversations.filter(c => {
        const u = usersMap[c.otherUserId];
        const name = u?.full_name ?? u?.first_name ?? '';
        return name.toLowerCase().includes(searchText.toLowerCase());
      })
    : conversations;

  return (
    <Wrapper headerTitle='My Chats' showBackButton={false}>
      <SearchBar
        value={searchText}
        onChangeText={setSearchText}
        showBorder={false}
        containerStyle={{
          ...STYLES.SHADOW,
          marginHorizontal: 30,
          marginBottom: 20,
          borderRadius: 50,
          backgroundColor: COLORS.SURFACE,
        }}
      />
      {loading || (conversations.length > 0 && usersLoading) ? (
        <View style={skeletonStyles.container}>
          <ChatListSkeleton />
        </View>
      ) : (
        <FlatListComponent
          scrollEnabled={true}
          data={filtered}
          renderItem={renderChats}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />
      )}
    </Wrapper>
  );
};

const skeletonStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.BORDER,
  },
  content: {
    flex: 1,
  },
});

const chatItemStyles = StyleSheet.create({
  badge: {
    position: 'absolute',
    bottom: 12,
    right: 20,
    backgroundColor: '#FB344F',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
  },
});
