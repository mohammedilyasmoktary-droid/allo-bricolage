import { apiClient } from './client';

export interface Message {
  id: string;
  bookingId: string;
  senderId: string;
  receiverId: string;
  message: string;
  messageType: string;
  fileUrl?: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    profilePictureUrl?: string;
  };
  receiver: {
    id: string;
    name: string;
    profilePictureUrl?: string;
  };
}

export interface Conversation {
  bookingId: string;
  otherUser: {
    id: string;
    name: string;
    email: string;
    profilePictureUrl?: string;
  };
  booking: {
    id: string;
    category: string;
    status: string;
  };
  lastMessage: {
    id: string;
    message: string;
    senderId: string;
    createdAt: string;
  } | null;
  unreadCount: number;
  updatedAt: string;
}

export interface SendMessageData {
  bookingId: string;
  message: string;
}

export const messagesApi = {
  getConversations: async (): Promise<Conversation[]> => {
    const response = await apiClient.get('/messages/conversations');
    return response.data;
  },

  getMessages: async (bookingId: string): Promise<Message[]> => {
    const response = await apiClient.get(`/messages/booking/${bookingId}`);
    return response.data;
  },

  sendMessage: async (data: SendMessageData): Promise<Message> => {
    const response = await apiClient.post('/messages', data);
    return response.data;
  },

  markAsRead: async (bookingId: string): Promise<void> => {
    await apiClient.patch(`/messages/mark-read/${bookingId}`);
  },
};

