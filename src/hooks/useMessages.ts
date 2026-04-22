import { useEffect, useState } from 'react';
import {
  subscribeToMessages,
  subscribeToConversation,
  sendMessage as sendMessageToFirestore,
} from '../services/chat/firestoreChat';
import { logger } from 'utils/logger';
import type { ChatMessage } from 'types/chat';

export function useMessages(
  conversationId: string | undefined,
  currentUserId: string,
  paramBookingId?: string,
) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [bookingCompleted, setBookingCompleted] = useState(false);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      setBookingCompleted(false);
      return;
    }

    setLoading(true);
    const unsubMessages = subscribeToMessages(conversationId, list => {
      setMessages(list);
      setLoading(false);
    });
    const unsubConv = subscribeToConversation(conversationId, data => {
      const completedIds = (data.completedBookingIds ?? []).map(String);
      const legacyCompleted = !!data.bookingCompleted;
      const isCompleted = paramBookingId
        ? completedIds.includes(String(paramBookingId))
        : legacyCompleted || completedIds.length > 0;
      setBookingCompleted(isCompleted);
    });

    return () => {
      unsubMessages();
      unsubConv();
    };
  }, [conversationId, paramBookingId]);

  const sendMessage = async (text: string): Promise<boolean> => {
    if (!conversationId || !text.trim() || bookingCompleted) return false;
    setSending(true);
    try {
      await sendMessageToFirestore(conversationId, text.trim(), currentUserId, paramBookingId);
      return true;
    } catch (e) {
      logger.error('sendMessage error:', e);
      return false;
    } finally {
      setSending(false);
    }
  };

  return { messages, loading, sending, sendMessage, bookingCompleted };
}
