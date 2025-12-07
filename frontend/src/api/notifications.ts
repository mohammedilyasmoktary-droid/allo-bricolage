import { apiClient } from './client';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationsApi = {
  getAll: async (): Promise<Notification[]> => {
    const response = await apiClient.get('/notifications');
    return response.data;
  },

  getUnread: async (): Promise<Notification[]> => {
    const response = await apiClient.get('/notifications?unreadOnly=true');
    return response.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get('/notifications/unread/count');
    return response.data.count;
  },

  markAsRead: async (id: string): Promise<Notification> => {
    const response = await apiClient.patch(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.patch('/notifications/read-all');
  },
};

