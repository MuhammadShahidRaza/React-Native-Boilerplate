import { Header, Icon, Input, RowComponent, Typography, Wrapper } from 'components/common';
import { VARIABLES } from 'constants/common';
import { COMMON_TEXT } from 'constants/screens';
import { useState, useRef, useEffect, useCallback } from 'react';
import { View, SectionList, StyleSheet, Alert } from 'react-native';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS } from 'utils/colors';
import { isIOS, screenWidth, formatDateMonthDayYear } from 'utils/helpers';
import { FLEX_CENTER } from '../../utils/commonStyles/index';
import { IMAGES } from 'constants/assets';
import { useTranslation } from 'hooks/useTranslation';
import { AppScreenProps } from 'types/navigation';
import { SCREENS } from 'constants/routes';
import { useMessages } from 'hooks/useMessages';
import { useAppSelector } from 'types/reduxTypes';
import { setIsOnMessagesScreen } from 'utils/notifications';
import { useConversations } from 'hooks/useConversations';
import { useUserById } from 'hooks/useUserById';
import {
  updatePresence,
  subscribeToPresence,
  markConversationRead,
} from '../../services/chat/firestoreChat';
import { fetchDentorBookingsPage, fetchUserBookingsPage } from 'api/functions/app/home';
import { isWorkerRole } from 'config/app';
import { useFocusEffect } from '@react-navigation/native';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'other';
  createdAt: Date;
}

const groupMessagesByDate = (messages: Message[]) => {
  // 🔥 Always sort before grouping
  const sorted = [...messages].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  const sectionsMap: Record<string, Message[]> = {};

  sorted.forEach(message => {
    const date = message.createdAt.toDateString();
    if (!sectionsMap[date]) sectionsMap[date] = [];
    sectionsMap[date].push(message);
  });

  // 🔥 Preserve correct date order
  return Object.keys(sectionsMap)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    .map(date => ({
      title: date,
      data: sectionsMap[date],
    }));
};

/** Normalize text by removing spaces/gaps used to bypass validation */
const normalizeForValidation = (text: string): string =>
  text.replace(/\s+/g, '').replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, '');

const containsEmail = (text: string): boolean => {
  const normalized = normalizeForValidation(text);
  return /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(normalized);
};

const containsPhoneNumber = (text: string): boolean => {
  const collapsed = text.replace(/[\s.\-()]+/g, '');
  const match = collapsed.match(/\d{7,}/);
  return !!match;
};

const containsLink = (text: string): boolean => {
  const normalized = normalizeForValidation(text);
  return (
    /https?:\/\/[^\s]*/i.test(normalized) || /www\.[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i.test(normalized)
  );
};

const validateMessage = (text: string): { isValid: boolean; error: string } => {
  if (containsEmail(text))
    return { isValid: false, error: 'Email addresses are not allowed in messages' };
  if (containsPhoneNumber(text))
    return { isValid: false, error: 'Phone numbers are not allowed in messages' };
  if (containsLink(text))
    return { isValid: false, error: 'Links and URLs are not allowed in messages' };
  return { isValid: true, error: '' };
};

export const MessagesFirebase = ({ route }: AppScreenProps<typeof SCREENS.MESSAGES_FIREBASE>) => {
  const { isLangRTL } = useTranslation();
  const [activeBookingId, setActiveBookingId] = useState(null);
  const data = route.params?.data;
  const paramConversationId = data?.conversationId;
  const paramOtherUserId = data?.otherUserId ?? data?.otherUser?.id;
  const paramBookingId = data?.bookingId != null ? String(data.bookingId) : activeBookingId;
  const initialOtherUser = data?.initialOtherUser;

  const user = useAppSelector(s => s.user.userDetails);
  const currentUserId = user?.id?.toString() ?? '';
  const { startConversation } = useConversations();
  const { user: fetchedUser } = useUserById(paramOtherUserId);
  const otherUser = fetchedUser ?? initialOtherUser;

  // Fetch active booking ID
  const role = useAppSelector(state => state?.user?.role);
  const isDentor = isWorkerRole(role);
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        const fetcher = isDentor ? fetchDentorBookingsPage : fetchUserBookingsPage;
        const res = await fetcher({ page: 1, limit: 20 });
        const bookings = res?.data?.booking;
        const id = getActiveBookingId(bookings);
        setActiveBookingId(id);
      };

      fetchData();
    }, []),
  );
  const getActiveBookingId = (bookings: any[]) => {
    const found = bookings.find(
      item =>
        item.status === 'upcoming' ||
        item.status === 'in_progress' ||
        item.booking_assignments?.some(b => b.status === 'in_progress'),
    );

    return found ? found.id : null;
  };
  // End fetch active booking ID

  const [resolvedConversationId, setResolvedConversationId] = useState<string | null>(
    paramConversationId ?? null,
  );
  const [resolving, setResolving] = useState(!paramConversationId && !!paramOtherUserId);

  useEffect(() => {
    setIsOnMessagesScreen(true);
    return () => setIsOnMessagesScreen(false);
  }, []);

  useEffect(() => {
    if (!resolvedConversationId || !currentUserId) return;
    markConversationRead(resolvedConversationId, currentUserId).catch(() => {});
  }, [resolvedConversationId, currentUserId]);

  useEffect(() => {
    if (paramConversationId) {
      setResolvedConversationId(paramConversationId);
      return;
    }
    if (!paramOtherUserId || !currentUserId) {
      setResolving(false);
      return;
    }
    (async () => {
      const id = await startConversation(String(paramOtherUserId));
      setResolvedConversationId(id ?? null);
      setResolving(false);
    })();
  }, [paramConversationId, paramOtherUserId, currentUserId, startConversation]);

  const {
    messages: firestoreMessages,
    loading,
    sending,
    sendMessage,
    bookingCompleted,
  } = useMessages(resolvedConversationId ?? undefined, currentUserId, paramBookingId);

  const messages: Message[] = firestoreMessages.map(m => ({
    id: m.id,
    text: m.text,
    sender: m.senderId === currentUserId ? 'user' : 'other',
    createdAt: m.createdAt,
  }));

  const [inputText, setInputText] = useState('');
  const [validationError, setValidationError] = useState('');
  const sectionListRef = useRef<SectionList>(null);
  const groupedMessages = groupMessagesByDate(messages);

  // Add "This booking has been completed" event at end when bookingCompleted
  const sectionsWithEvent = bookingCompleted
    ? [
        ...groupedMessages,
        {
          title: '',
          data: [
            {
              id: '__booking_completed__',
              text: '',
              sender: 'other' as const,
              createdAt: new Date(),
            },
          ],
        },
      ]
    : groupedMessages;

  const handleSend = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || sending) return;

    const validation = validateMessage(trimmed);
    if (!validation.isValid) {
      setValidationError(validation.error);
      Alert.alert('Invalid Message', validation.error);
      return;
    }
    setValidationError('');
    const ok = await sendMessage(trimmed);
    if (ok) {
      setInputText('');
      updatePresence(currentUserId).catch(() => {});
    }
  };

  const scrollToBottom = () => {
    if (sectionsWithEvent.length === 0) return;
    const list = sectionListRef.current as any;
    const scrollResponder = list?.getScrollResponder?.();
    if (scrollResponder?.scrollTo) {
      scrollResponder.scrollTo({ y: 999999, animated: true });
    }
  };

  useEffect(() => {
    if (sectionsWithEvent.length === 0) return;
    const delay = bookingCompleted ? 400 : 250;
    const timer = setTimeout(scrollToBottom, delay);
    return () => clearTimeout(timer);
  }, [messages.length, sectionsWithEvent.length, bookingCompleted]);

  const renderMessage = ({ item }: { item: Message }) => {
    if (item.id === '__booking_completed__') {
      return (
        <View style={styles.eventMessageContainer}>
          <Typography translate={false} style={styles.eventMessageText}>
            This booking has been completed
          </Typography>
        </View>
      );
    }
    const timeStr = item.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return (
      <RowComponent
        style={[styles.row, { justifyContent: item.sender === 'user' ? 'flex-end' : 'flex-start' }]}
      >
        <View
          style={[
            styles.messageContainer,
            item.sender === 'user' ? styles.userMessage : styles.otherMessage,
          ]}
        >
          <View style={styles.messageContent}>
            <Typography
              style={item.sender === 'user' ? styles.userMessageText : styles.otherMessageText}
            >
              {item.text}
            </Typography>
            <Typography translate={false} style={styles.timestamp}>
              {timeStr}
            </Typography>
          </View>
        </View>
      </RowComponent>
    );
  };

  const otherUserName = otherUser?.full_name ?? otherUser?.first_name ?? 'Chat';
  const otherUserImage = otherUser?.profile_image ?? IMAGES.USER_IMAGE;

  // Presence: update our lastSeen when on chat, subscribe to other user's presence
  const [otherUserLastSeen, setOtherUserLastSeen] = useState<Date | null>(null);
  useEffect(() => {
    if (!currentUserId) return;
    updatePresence(currentUserId).catch(() => {});
    const interval = setInterval(() => {
      updatePresence(currentUserId).catch(() => {});
    }, 45000);
    return () => clearInterval(interval);
  }, [currentUserId, resolvedConversationId]);
  const [hasPresenceData, setHasPresenceData] = useState(false);
  useEffect(() => {
    if (!paramOtherUserId) return;
    return subscribeToPresence(String(paramOtherUserId), data => {
      setOtherUserLastSeen(data.lastSeen ?? null);
      setHasPresenceData(true);
    });
  }, [paramOtherUserId]);
  const presenceSubtitle = (() => {
    if (!hasPresenceData) return 'Loading...';
    if (!otherUserLastSeen) return 'Offline';
    const diff = Date.now() - otherUserLastSeen.getTime();
    if (diff < 2 * 60 * 1000) return 'Online';
    if (diff < 60 * 60 * 1000) return `Last seen ${Math.floor(diff / 60000)} min ago`;
    return `Last seen ${formatDateMonthDayYear(otherUserLastSeen.toISOString())}`;
  })();

  if (resolving) {
    return (
      <Wrapper showBackButton={false}>
        <View style={[styles.loadingWrap, FLEX_CENTER]}>
          <Typography>Starting conversation...</Typography>
        </View>
      </Wrapper>
    );
  }

  if (!resolvedConversationId && !paramConversationId) {
    return (
      <Wrapper showBackButton={true}>
        <View style={[styles.loadingWrap, FLEX_CENTER]}>
          <Typography>Unable to load conversation. Go back and try again.</Typography>
        </View>
      </Wrapper>
    );
  }

  return (
    <Wrapper showBackButton={false}>
      <Header
        headerContainerStyle={{ gap: 15 }}
        titleContainerStyle={{ justifyContent: 'flex-start' }}
        titleStyle={{ fontSize: FontSize.Medium }}
        subtitle={presenceSubtitle}
        subtitleContainerStyle={{ alignItems: 'flex-start' }}
        subtitleTextStyle={{
          color: presenceSubtitle === 'Online' ? COLORS.GREEN : COLORS.TEXT_SECONDARY,
        }}
        title={otherUserName}
        centerImage={otherUserImage}
        showBackButton={true}
        centerImageStyle={{ backgroundColor: COLORS.WHITE }}
      />
      {loading ? (
        <View style={[styles.loadingWrap, FLEX_CENTER]}>
          <Typography>Loading messages...</Typography>
        </View>
      ) : (
        <SectionList
          ref={sectionListRef}
          sections={sectionsWithEvent}
          renderItem={renderMessage}
          onContentSizeChange={scrollToBottom}
          renderSectionHeader={({ section }) =>
            section.title ? (
              <View style={styles.sectionHeaderContainer}>
                <Typography translate={false} style={styles.sectionHeader}>
                  {formatDateMonthDayYear(section.title)}
                </Typography>
              </View>
            ) : null
          }
          keyExtractor={item => item.id}
          ListEmptyComponent={
            <View style={[styles.loadingWrap, FLEX_CENTER]}>
              <Typography style={{ color: COLORS.TEXT }}>No messages yet. Say hello!</Typography>
            </View>
          }
        />
      )}
      <RowComponent style={styles.inputContainer}>
        <Input
          name={COMMON_TEXT.EMAIL}
          onChangeText={text => {
            setInputText(text);
            if (validationError) setValidationError('');
          }}
          containerStyle={{ width: screenWidth(78) }}
          value={inputText}
          placeholder={bookingCompleted ? 'Chat closed - booking completed' : 'Type Message...'}
          error={validationError}
          touched={!!validationError}
          editable={!bookingCompleted}
        />
        <Icon
          componentName={VARIABLES.Ionicons}
          iconName='send-outline'
          onPress={bookingCompleted ? undefined : handleSend}
          iconStyle={{
            backgroundColor: bookingCompleted ? COLORS.TEXT_SECONDARY : COLORS.PRIMARY,
            color: COLORS.WHITE,
            marginBottom: 12,
            padding: 13,
            fontSize: FontSize.ExtraLarge,
            overflow: 'hidden',
            borderRadius: 10,
            transform: [{ scaleX: isLangRTL ? -1 : 1 }],
          }}
        />
      </RowComponent>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  row: {
    marginVertical: 5,
    marginHorizontal: 15,
  },
  messageContainer: {
    padding: 10,
    borderRadius: 10,
    maxWidth: screenWidth(78),
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.PRIMARY,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.SEARCH_BAR,
  },
  userMessageText: {
    color: COLORS.WHITE,
  },
  otherMessageText: {
    color: COLORS.TEXT,
  },
  timestamp: {
    fontSize: FontSize.ExtraSmall,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'right',
    marginTop: 5,
  },
  messageContent: {
    maxWidth: screenWidth(100),
  },
  inputContainer: {
    gap: 10,
    paddingTop: 10,
    marginBottom: isIOS() ? 50 : 25,
    ...FLEX_CENTER,
  },
  sectionHeaderContainer: {
    backgroundColor: COLORS.BACKGROUND,
    paddingVertical: 10,
  },
  sectionHeader: {
    fontWeight: FontWeight.SemiBold,
    textAlign: 'center',
    color: COLORS.TEXT,
  },
  eventMessageContainer: {
    alignSelf: 'center',
    marginVertical: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: COLORS.SEARCH_BAR,
    borderRadius: 8,
  },
  eventMessageText: {
    fontSize: FontSize.Small,
    color: COLORS.TEXT_SECONDARY,
    fontStyle: 'italic',
  },
  loadingWrap: {
    flex: 1,
    minHeight: 200,
  },
});
