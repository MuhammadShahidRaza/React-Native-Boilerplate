import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useAppSelector } from 'types/reduxTypes';
import {
  subscribeToConversations,
  subscribeToMessages,
  getOtherParticipantId,
  createOrGetConversation,
  getConversationId,
} from '../services/chat/firestoreChat';
import { logger } from 'utils/logger';

export interface ConversationItem {
  id: string;
  otherUserId: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  lastMessageSenderId?: string;
  unreadCount: number;
}

export function useConversations() {
  const user = useAppSelector(s => s.user.userDetails);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const userId = user?.id?.toString() ?? '';

  // Re-subscribe when app comes to foreground (real device Firestore listeners drop in background)
  const appStateRef = useRef(AppState.currentState);
  useEffect(() => {
    const sub = AppState.addEventListener('change', nextState => {
      if (appStateRef.current !== 'active' && nextState === 'active') {
        logger.log('[chat-counter] app foregrounded — refreshing subscriptions');
        setRefreshKey(k => k + 1);
      }
      appStateRef.current = nextState;
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!userId) {
      setConversations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToConversations(userId, rawList => {
      setConversations(prev => {
        const items: ConversationItem[] = rawList
          .filter(
            conv =>
              conv.participants?.length === 2 && conv.participants[0] !== conv.participants[1],
          )
          .map(conv => {
            const otherId = getOtherParticipantId(conv, userId);
            const existing = prev.find(c => c.id === conv.id);
            return {
              id: conv.id,
              otherUserId: otherId ?? '',
              lastMessage: conv.lastMessage?.text,
              lastMessageTime: conv.lastMessage?.createdAt?.toDate?.(),
              lastMessageSenderId: conv.lastMessage?.senderId,
              unreadCount: existing?.unreadCount ?? 0, // preserve count from message subscriptions
            };
          });
        return items;
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId, refreshKey]);

  useEffect(() => {
    if (!userId || !conversations.length) return;

    const unsubscribers = conversations.map(conversation =>
      subscribeToMessages(conversation.id, messages => {
        const unreadFromMessages = messages.filter(
          message => !message.read && message.senderId !== userId,
        ).length;

        setConversations(prev => {
          const found = prev.find(c => c.id === conversation.id);
          if (!found || found.unreadCount === unreadFromMessages) {
            return prev;
          }

          if (unreadFromMessages > found.unreadCount) {
            logger.log('[chat-counter] unread increased', {
              conversationId: conversation.id,
              userId,
              previous: found.unreadCount,
              next: unreadFromMessages,
              delta: unreadFromMessages - found.unreadCount,
            });
          }

          return prev.map(c =>
            c.id === conversation.id ? { ...c, unreadCount: unreadFromMessages } : c,
          );
        });
      }),
    );

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, conversations.map(c => c.id).join(','), refreshKey]);

  const startConversation = async (otherUserId: string): Promise<string | null> => {
    if (!userId) return null;
    try {
      return await createOrGetConversation(userId, otherUserId);
    } catch (e) {
      logger.error('startConversation error:', e);
      return null;
    }
  };

  const getOrCreateConversationId = (otherUserId: string) => getConversationId(userId, otherUserId);

  const totalUnreadCount = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return {
    conversations,
    loading,
    userId,
    startConversation,
    getOrCreateConversationId,
    totalUnreadCount,
  };
}
