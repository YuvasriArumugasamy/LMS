import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Bell,
  CheckCheck,
  BellRing,
  CheckCircle,
  AlertCircle,
  CalendarDays,
  FileText,
  User,
  ShieldCheck,
  Users
} from 'lucide-react';
import { requestFcmToken, onForegroundMessage } from '../firebase';

export const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pushStatus, setPushStatus] = useState('UNKNOWN');
  const [pushMessage, setPushMessage] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 20;

  const fetchAndMarkNotifications = async (currentPage = 1) => {
    try {
      const res = await api.get('/notifications', { params: { page: currentPage, limit: LIMIT } });
      setNotifications(res.data.data.notifications || []);
      setTotal(res.data.data.pagination?.total || 0);
      setTotalPages(res.data.data.pagination?.pages || 1);

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
    fetchAndMarkNotifications(page);

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
      // 1. Request native browser notification permission first
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setPushStatus('ENABLED');
        } else if (permission === 'denied') {
          setPushStatus('DENIED');
          return; // Stop if they explicitly blocked it
        }
      }

      // 2. Try to get FCM Token (Will fail silently if Firebase env vars are missing)
      const token = await requestFcmToken();
      if (token) {
        await api.post('/auth/fcm-token', { fcmToken: token });
        setPushMessage('Browser push notifications enabled successfully!');
        setTimeout(() => setPushMessage(''), 5000);
      }
    } catch (err) {
      console.error('Failed to enable push notifications:', err);
      if ('Notification' in window && Notification.permission === 'granted') {
        setPushStatus('ENABLED');
      } else {
        setPushStatus('UNKNOWN');
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/all/read');
      fetchAndMarkNotifications(page);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTestNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification("🚀 LMS Test Notification", {
        body: "This is a test notification. If you see this, push notifications are working perfectly on your device!",
        icon: "/vite.svg"
      });
    } else {
      alert("Please click 'Enable Push Notifications' first and allow permissions!");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-28 sm:pb-8">
      {/* Toast Alert for Push Message */}
      {pushMessage && (
        <div className="p-4 rounded-2xl bg-indigo-600 text-white font-semibold text-sm shadow-lg flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-3">
            <BellRing className="w-5 h-5" />
            <span>{pushMessage}</span>
          </div>
        </div>
      )}

      {/* Header matching Image 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Notifications</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">In-app alerts, leave updates, and real-time push notifications</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {pushStatus === 'ENABLED' ? (
            <span className="px-3.5 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-2xl flex items-center gap-1.5 border border-emerald-500/20 shadow-2xs">
              <CheckCircle className="w-4 h-4" /> Push Active
            </span>
          ) : pushStatus === 'DENIED' ? (
            <span className="px-3.5 py-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-2xl flex items-center gap-1.5 border border-rose-500/20 shadow-2xs">
              <AlertCircle className="w-4 h-4" /> Push Blocked
            </span>
          ) : (
            <button
              onClick={handleEnablePush}
              disabled={pushStatus === 'ENABLING'}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-black rounded-2xl flex items-center gap-2 shadow-md shadow-purple-500/25 transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
            >
              <BellRing className="w-4 h-4" />
              {pushStatus === 'ENABLING' ? 'Enabling...' : 'Enable Push Notifications'}
            </button>
          )}

          <button
            onClick={handleTestNotification}
            className="px-4 py-2.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200/90 dark:border-blue-800 text-xs font-extrabold text-blue-600 dark:text-blue-400 rounded-2xl flex items-center gap-2 transition-all shadow-2xs hover:scale-[1.02]"
          >
            <Bell className="w-4 h-4" /> Test Alert
          </button>

          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-extrabold text-slate-700 dark:text-slate-200 rounded-2xl flex items-center gap-2 transition-all shadow-2xs hover:scale-[1.02]"
          >
            <CheckCheck className="w-4 h-4 text-slate-500" /> Mark All Read
          </button>
        </div>
      </div>

      {/* Notifications List matching Image 2 */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm font-medium animate-pulse">Loading notifications...</div>
        ) : notifications.length > 0 ? (
          notifications.map((n, idx) => {
            const titleLower = (n.title || '').toLowerCase();
            const msgLower = (n.message || '').toLowerCase();

            // Dynamic Palette & Icon Selection matching Image 2
            let palette = {
              leftBorder: 'border-l-[5px] border-l-purple-500',
              bellBg: 'bg-purple-100/90 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300',
              dateColor: 'text-purple-600 dark:text-purple-400',
              rightIconBg: 'bg-purple-100/80 dark:bg-purple-950/50 text-purple-600 dark:text-purple-300',
              rightIcon: FileText
            };

            if (titleLower.includes('approved') || titleLower.includes('final') || msgLower.includes('approved')) {
              palette = {
                leftBorder: 'border-l-[5px] border-l-emerald-500',
                bellBg: 'bg-emerald-100/90 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300',
                dateColor: 'text-emerald-600 dark:text-emerald-400',
                rightIconBg: 'bg-emerald-100/80 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-300',
                rightIcon: ShieldCheck
              };
            } else if (titleLower.includes('hr') || titleLower.includes('manager') || msgLower.includes('manager')) {
              palette = {
                leftBorder: 'border-l-[5px] border-l-amber-500',
                bellBg: 'bg-amber-100/90 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300',
                dateColor: 'text-amber-700 dark:text-amber-400',
                rightIconBg: 'bg-amber-100/80 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300',
                rightIcon: Users
              };
            } else if (titleLower.includes('user') || titleLower.includes('employee') || msgLower.includes('employee')) {
              palette = {
                leftBorder: 'border-l-[5px] border-l-blue-500',
                bellBg: 'bg-blue-100/90 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300',
                dateColor: 'text-blue-600 dark:text-blue-400',
                rightIconBg: 'bg-blue-100/80 dark:bg-blue-950/50 text-blue-600 dark:text-blue-300',
                rightIcon: User
              };
            } else {
              // Fallback rotation palette matching Image 2
              const fallbackPalettes = [
                {
                  leftBorder: 'border-l-[5px] border-l-purple-500',
                  bellBg: 'bg-purple-100/90 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300',
                  dateColor: 'text-purple-600 dark:text-purple-400',
                  rightIconBg: 'bg-purple-100/80 dark:bg-purple-950/50 text-purple-600 dark:text-purple-300',
                  rightIcon: FileText
                },
                {
                  leftBorder: 'border-l-[5px] border-l-blue-500',
                  bellBg: 'bg-blue-100/90 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300',
                  dateColor: 'text-blue-600 dark:text-blue-400',
                  rightIconBg: 'bg-blue-100/80 dark:bg-blue-950/50 text-blue-600 dark:text-blue-300',
                  rightIcon: User
                },
                {
                  leftBorder: 'border-l-[5px] border-l-emerald-500',
                  bellBg: 'bg-emerald-100/90 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300',
                  dateColor: 'text-emerald-600 dark:text-emerald-400',
                  rightIconBg: 'bg-emerald-100/80 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-300',
                  rightIcon: ShieldCheck
                },
                {
                  leftBorder: 'border-l-[5px] border-l-amber-500',
                  bellBg: 'bg-amber-100/90 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300',
                  dateColor: 'text-amber-700 dark:text-amber-400',
                  rightIconBg: 'bg-amber-100/80 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300',
                  rightIcon: Users
                }
              ];
              palette = fallbackPalettes[idx % fallbackPalettes.length];
            }

            const RightIcon = palette.rightIcon;

            return (
              <div
                key={n._id}
                className={`bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 flex items-center justify-between gap-4 border border-slate-200/80 dark:border-slate-800 ${palette.leftBorder} shadow-2xs hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5`}
              >
                {/* Left Side: Bell Icon + Content */}
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <div className={`p-3 sm:p-3.5 rounded-2xl ${palette.bellBg} shrink-0 shadow-2xs`}>
                    <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                      {n.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1 leading-relaxed">
                      {n.message}
                    </p>
                    <div className={`flex items-center gap-1.5 text-[11px] font-bold mt-2.5 ${palette.dateColor}`}>
                      <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                      <span>{new Date(n.createdAt).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Category Circular Icon Badge matching Image 2 */}
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full ${palette.rightIconBg} flex items-center justify-center shrink-0 shadow-2xs`}>
                  <RightIcon className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center text-slate-400 font-medium border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50 text-indigo-500" />
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">You have no notifications at this time.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={() => { setPage((p) => Math.max(1, p - 1)); fetchAndMarkNotifications(page - 1); }}
            disabled={page === 1}
            className="w-9 h-9 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-black flex items-center justify-center disabled:opacity-40 hover:bg-purple-600 hover:text-white transition-all shadow-2xs"
          >
            ‹
          </button>
          <span className="text-xs font-black text-slate-700 dark:text-slate-300">
            Page {page} of {totalPages} <span className="text-slate-400 font-medium">({total} total)</span>
          </span>
          <button
            onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); fetchAndMarkNotifications(page + 1); }}
            disabled={page === totalPages}
            className="w-9 h-9 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-black flex items-center justify-center disabled:opacity-40 hover:bg-purple-600 hover:text-white transition-all shadow-2xs"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
};

