import { useState, useEffect, useCallback } from 'react';
import { notifAPI } from '../services/api';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notifAPI.getAll();
      setNotifications(res.data.data?.notifications || []);
      setUnreadCount(res.data.data?.unreadCount || 0);
    } catch (err) {
      console.error('Notifications fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const markRead = useCallback(async (id) => {
    try {
      await notifAPI.markRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await notifAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  }, []);

  const addNotification = useCallback((notif) => {
    setNotifications(prev => [notif, ...prev]);
    if (!notif.isRead) setUnreadCount(prev => prev + 1);
  }, []);

  // Request browser notification permission
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return false;
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }, []);

  // Show browser notification
  const showBrowserNotif = useCallback((title, body, icon = '/favicon.svg') => {
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon });
    }
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    refresh: load,
    markRead,
    markAllRead,
    addNotification,
    requestPermission,
    showBrowserNotif,
  };
};

export default useNotifications;
