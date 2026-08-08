import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Bell, CheckCheck, ShieldAlert, Sparkles, Clock } from 'lucide-react';

export const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

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
  }, []);

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Notifications</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">In-app alerts, leave updates, and escalation notices</p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 rounded-xl flex items-center gap-2 transition-all"
        >
          <CheckCheck className="w-4 h-4" /> Mark All Read
        </button>
      </div>

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
