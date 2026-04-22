import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  writeBatch,
  increment,
  Timestamp,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  arrayUnion,
} from '@react-native-firebase/firestore';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { sendMessageNotification } from 'api/functions/app/notifications';
import { logger } from 'utils/logger';

const CONVERSATIONS = 'conversations';
const MESSAGES = 'messages';

/** Generate deterministic conversation ID from two user IDs */
export function getConversationId(userId1: string, userId2: string): string {
  const [a, b] = [userId1, userId2].sort();
  return `${a}_${b}`;
}

/** Create or get existing conversation between two users. Requires 1 user + 1 dentor (different IDs). */
export async function createOrGetConversation(
  currentUserId: string,
  otherUserId: string,
): Promise<string | null> {
  if (!currentUserId || !otherUserId || currentUserId === otherUserId) {
    return null;
  }

  const db = getFirestore();
  const convId = getConversationId(currentUserId, otherUserId);
  const convRef = doc(db, CONVERSATIONS, convId);
  const docSnap = await getDoc(convRef);

  if (docSnap.exists()) {
    return convId;
  }

  const now = Timestamp.now();
  await setDoc(convRef, {
    participants: [currentUserId, otherUserId],
    createdAt: now,
    updatedAt: now,
  });

  return convId;
}

/** Subscribe to conversations for a user (real-time) */
export function subscribeToConversations(
  userId: string,
  onUpdate: (
    conversations: Array<{
      id: string;
      participants: string[];
      lastMessage?: { text: string; senderId: string; createdAt: FirebaseFirestoreTypes.Timestamp };
      updatedAt: FirebaseFirestoreTypes.Timestamp;
      unreadCounts?: Record<string, number>;
    }>,
  ) => void,
): () => void {
  const db = getFirestore();
  const q = query(
    collection(db, CONVERSATIONS),
    where('participants', 'array-contains', userId),
    orderBy('updatedAt', 'desc'),
  );
  const unsubscribe = onSnapshot(
    q,
    snapshot => {
      const list = snapshot.docs.map((d: { id: string; data: () => object }) => ({
        id: d.id,
        ...d.data(),
      })) as Array<{
        id: string;
        participants: string[];
        lastMessage?: {
          text: string;
          senderId: string;
          createdAt: FirebaseFirestoreTypes.Timestamp;
        };
        updatedAt: FirebaseFirestoreTypes.Timestamp;
        unreadCounts?: Record<string, number>;
      }>;
      onUpdate(list);
    },
    err => logger.error('subscribeToConversations error:', err),
  );
  return unsubscribe;
}

/** Subscribe to messages in a conversation (real-time) */
export function subscribeToMessages(
  conversationId: string,
  onUpdate: (
    messages: Array<{
      id: string;
      text: string;
      senderId: string;
      createdAt: Date;
      read?: boolean;
    }>,
  ) => void,
): () => void {
  const db = getFirestore();
  const messagesRef = collection(doc(db, CONVERSATIONS, conversationId), MESSAGES);
  const q = query(messagesRef, orderBy('createdAt', 'asc'));
  const unsubscribe = onSnapshot(
    q,
    snapshot => {
      const list = snapshot.docs.map((d: { id: string; data: () => Record<string, unknown> }) => {
        const data = d.data() as {
          createdAt?: { toDate?: () => Date };
          text?: string;
          senderId?: string;
          read?: boolean;
        };
        return {
          id: d.id,
          text: data.text ?? '',
          senderId: data.senderId ?? '',
          createdAt: data.createdAt?.toDate?.() || new Date(),
          read: data.read,
        };
      });
      onUpdate(list);
    },
    err => logger.error('subscribeToMessages error:', err),
  );
  return unsubscribe;
}

/** Send a message */
export async function sendMessage(
  conversationId: string,
  text: string,
  senderId: string,
  bookingId?: string,
): Promise<void> {
  const db = getFirestore();
  const convRef = doc(db, CONVERSATIONS, conversationId);
  const messagesRef = collection(convRef, MESSAGES);
  const msgRef = doc(messagesRef);
  const now = serverTimestamp();

  const recipientId = conversationId.split('_').find(id => id !== senderId);

  const batch = writeBatch(db);

  batch.set(msgRef, {
    text,
    senderId,
    createdAt: now,
    read: false,
  });

  // Use set with merge instead of update - update() throws not-found if doc doesn't exist
  batch.set(
    convRef,
    {
      lastMessage: { text, senderId, createdAt: now },
      updatedAt: now,
      ...(recipientId ? { [`unreadCounts.${recipientId}`]: increment(1) } : {}),
    },
    { merge: true },
  );

  if (recipientId) {
    logger.log('[chat-counter] increment requested', {
      conversationId,
      senderId,
      recipientId,
      bookingId,
      field: `unreadCounts.${recipientId}`,
      by: 1,
    });
  }

  await batch.commit();

  if (recipientId) {
    sendMessageNotification(Number(recipientId), Number(bookingId)).catch(() => {});
  }
}

/** Subscribe to a single conversation doc (e.g. for completedBookingIds) */
export function subscribeToConversation(
  conversationId: string,
  onUpdate: (data: { completedBookingIds?: string[]; bookingCompleted?: boolean }) => void,
): () => void {
  const db = getFirestore();
  const convRef = doc(db, CONVERSATIONS, conversationId);
  return onSnapshot(
    convRef,
    snap => {
      const d = snap.data();
      const completedIds = (d?.completedBookingIds as string[] | undefined) ?? [];
      const legacyCompleted = !!d?.bookingCompleted;
      onUpdate({
        completedBookingIds: completedIds,
        bookingCompleted: legacyCompleted && completedIds.length === 0,
      });
    },
    err => logger.error('subscribeToConversation error:', err),
  );
}

/** Update user presence (lastSeen). Call when user opens chat or sends message. */
const PRESENCE = 'presence';
export async function updatePresence(userId: string): Promise<void> {
  if (!userId) return;
  try {
    const db = getFirestore();
    const ref = doc(db, PRESENCE, userId);
    await setDoc(ref, { lastSeen: serverTimestamp() }, { merge: true });
  } catch {
    // Ignore
  }
}

/** Subscribe to another user's presence (lastSeen). Use for "online" / "last seen" display. */
export function subscribeToPresence(
  userId: string,
  onUpdate: (data: { lastSeen?: Date | null }) => void,
): () => void {
  if (!userId) return () => {};
  const db = getFirestore();
  const ref = doc(db, PRESENCE, userId);
  return onSnapshot(
    ref,
    snap => {
      const d = snap.data();
      const ts = d?.lastSeen;
      onUpdate({ lastSeen: ts?.toDate?.() ?? null });
    },
    err => {
      const e = err as { code?: string; message?: string };
      const isPermissionDenied =
        e?.code === 'firestore/permission-denied' ||
        (typeof e?.message === 'string' && e.message.includes('permission-denied'));
      if (isPermissionDenied) {
        logger.warn(
          'Presence: Firestore rules may not allow reading presence. Add rules for the "presence" collection.',
        );
        onUpdate({ lastSeen: null });
      } else {
        logger.error('subscribeToPresence error:', err);
        onUpdate({ lastSeen: null });
      }
    },
  );
}

/** Get the other participant's user ID in a conversation */
export function getOtherParticipantId(
  conversation: { participants: string[] },
  currentUserId: string,
): string | null {
  return conversation.participants.find(p => p !== currentUserId) ?? null;
}

/** Mark a specific booking as completed in the conversation. Per-booking: only disables chat for that booking. */
export async function markConversationCompleted(
  userId1: string,
  userId2: string,
  bookingId: string,
): Promise<void> {
  if (!userId1 || !userId2 || userId1 === userId2 || !bookingId) return;
  try {
    const convId = getConversationId(userId1, userId2);
    const db = getFirestore();
    const convRef = doc(db, CONVERSATIONS, convId);
    const convSnap = await getDoc(convRef);
    const now = serverTimestamp();
    if (convSnap.exists()) {
      await updateDoc(convRef, {
        completedBookingIds: arrayUnion(bookingId),
        updatedAt: now,
      });
    } else {
      await setDoc(convRef, {
        participants: [userId1, userId2],
        completedBookingIds: [bookingId],
        createdAt: now,
        updatedAt: now,
      });
    }
  } catch {
    // Chat may not exist or Firestore error; ignore
  }
}

/** Reset the unread message count for a user in a conversation (call when opening a chat). */
export async function markConversationRead(conversationId: string, userId: string): Promise<void> {
  if (!conversationId || !userId) return;
  try {
    const db = getFirestore();
    const convRef = doc(db, CONVERSATIONS, conversationId);
    const messagesRef = collection(convRef, MESSAGES);
    const snapshot = await getDocs(messagesRef);

    const batch = writeBatch(db);
    snapshot.docs.forEach((messageDoc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
      const data = messageDoc.data() as { senderId?: string; read?: boolean };
      if (data.senderId !== userId && !data.read) {
        batch.update(messageDoc.ref, { read: true });
      }
    });

    batch.set(convRef, { [`unreadCounts.${userId}`]: 0 }, { merge: true });
    await batch.commit();
  } catch {
    // Ignore
  }
}

// /** Delete conversation and all its messages for both participants (e.g. when job is completed). No-op if chat does not exist. */
// export async function deleteConversation(userId1: string, userId2: string): Promise<void> {
//   if (!userId1 || !userId2 || userId1 === userId2) return;
//   try {
//     const convId = getConversationId(userId1, userId2);
//     const db = getFirestore();
//     const convRef = doc(db, CONVERSATIONS, convId);
//     const convSnap = await getDoc(convRef);
//     if (!convSnap.exists()) return;
//     const messagesRef = collection(convRef, MESSAGES);
//     const snapshot = await getDocs(messagesRef);
//     const batch = writeBatch(db);
//     snapshot.docs.forEach((d: FirebaseFirestoreTypes.QueryDocumentSnapshot) => batch.delete(d.ref));
//     batch.delete(convRef);
//     await batch.commit();
//   } catch {
//     // Chat may not exist; ignore
//   }
// }
