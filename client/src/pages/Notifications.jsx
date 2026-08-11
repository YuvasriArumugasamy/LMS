import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Bell, CheckCheck, ShieldAlert, Sparkles, Clock, BellRing, CheckCircle, AlertCircle } from 'lucide-react';
import { requestFcmToken, onForegroundMessage } from '../firebase';

export const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pushStatus, setPushStatus] = useState('UNKNOWN'); // UNKNOWN, ENABLED, DENIED, ENABLING
  const [pushMessage, setPushMessage] = useState('');

  const fetchAndMarkNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data.notifications || []);

      // Auto-mark all notifications as read when opening Notifications page
      if (res.data.data.unreadCount > 0) {
        await api.patch('/notifications/all/read');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndMarkNotifications();

    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setPushStatus('ENABLED');
      } else if (Notification.permission === 'denied') {
        setPushStatus('DENIED');
      }
    }

    const unsubscribe = onForegroundMessage((payload) => {
      console.log('Foreground notification received:', payload);
      setPushMessage(payload?.notification?.title || 'New Push Notification received!');
      fetchAndMarkNotifications();
      setTimeout(() => setPushMessage(''), 5000);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const handleEnablePush = async () => {
    setPushStatus('ENABLING');
    try {
      const token = await requestFcmToken();
      if (token) {
        await api.post('/auth/fcm-token', { fcmToken: token });
        setPushStatus('ENABLED');
        setPushMessage('Browser push notifications enabled successfully!');
        setTimeout(() => setPushMessage(''), 5000);
      } else {
        if ('Notification' in window && Notification.permission === 'denied') {
          setPushStatus('DENIED');
        } else {
          setPushStatus('UNKNOWN');
        }
      }
    } catch (err) {
      console.error('Failed to enable push notifications:', err);
      setPushStatus('UNKNOWN');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/all/read');
      fetchAndMarkNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Toast Alert for Push Message */}
      {pushMessage && (
        <div className="p-4 rounded-2xl bg-indigo-600 text-white font-semibold text-sm shadow-lg flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-3">
            <BellRing className="w-5 h-5" />
            <span>{pushMessage}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Notifications</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">In-app alerts, leave updates, and real-time push notifications</p>
        </div>

        <div className="flex items-center gap-3">
          {pushStatus === 'ENABLED' ? (
            <span className="px-3.5 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-emerald-500/20">
              <CheckCircle className="w-4 h-4" /> Push Active
            </span>
          ) : pushStatus === 'DENIED' ? (
            <span className="px-3.5 py-1.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-rose-500/20">
              <AlertCircle className="w-4 h-4" /> Push Blocked
            </span>
          ) : (
            <button
              onClick={handleEnablePush}
              disabled={pushStatus === 'ENABLING'}
              className="px-4 py-2 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md shadow-primary/20 transition-all disabled:opacity-50"
            >
              <BellRing className="w-4 h-4" />
              {pushStatus === 'ENABLING' ? 'Enabling...' : 'Enable Push Notifications'}
            </button>
          )}

          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 rounded-xl flex items-center gap-2 transition-all"
          >
            <CheckCheck className="w-4 h-4" /> Mark All Read
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <div
              key={n._id}
              className="glass-card p-5 flex items-start justify-between gap-4 border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{n.title}</h4>
                  <p className="text-xs text-slate-500 font-medium mt-1">{n.message}</p>
                  <span className="text-[10px] text-slate-400 font-semibold mt-2 inline-block">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="glass-card p-12 text-center text-slate-400 font-medium">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>You have no notifications at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
};

