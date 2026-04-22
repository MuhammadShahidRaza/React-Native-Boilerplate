import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export interface ChatParticipant {
  id: number;
  full_name: string;
  profile_image?: string | null;
}

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  createdAt: Date;
  read?: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  participantDetails: Record<string, ChatParticipant>;
  lastMessage?: {
    text: string;
    senderId: string;
    createdAt: FirebaseFirestoreTypes.Timestamp;
  };
  createdAt: FirebaseFirestoreTypes.Timestamp;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
}
