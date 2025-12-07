import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { notificationsApi, Notification } from '../api/notifications';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  getLatestUnread: () => Notification | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  const refreshNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    
    try {
      setLoading(true);
      const [allNotifications, count] = await Promise.all([
        notificationsApi.getAll(),
        notificationsApi.getUnreadCount(),
      ]);
      setNotifications(allNotifications);
      setUnreadCount(count);
      setLastChecked(new Date());
    } catch (error) {
      console.error('Failed to refresh notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, []);

  const getLatestUnread = useCallback((): Notification | null => {
    const unread = notifications.filter(n => !n.isRead);
    if (unread.length === 0) return null;
    // Return the most recent unread notification
    return unread.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
  }, [notifications]);

  // Initial load
  useEffect(() => {
    if (user) {
      refreshNotifications();
    }
  }, [user, refreshNotifications]);

  // Poll for new notifications every 10 seconds
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      refreshNotifications();
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [user, refreshNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
        getLatestUnread,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

