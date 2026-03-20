/**
 * Notification System — Context, Bell, and Toasts
 *
 * Provides:
 * - NotificationProvider: wraps the app, manages notification state
 * - useNotifications: hook to access notifications from any component
 * - NotificationBell: bell icon with unread badge for the Header
 * - ToastContainer: renders toast popups at bottom-right
 *
 * Supabase Realtime: subscribes to the 'notifications' table when the
 * user is authenticated. Falls back gracefully if the table doesn't exist.
 */

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Bell, X, Info, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from './supabase';
import { useAuth } from './auth';

const NotificationContext = createContext(null);

// ─── NOTIFICATION PROVIDER ──────────────────────────────────────

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  // Count unread
  const unreadCount = notifications.filter(n => !n.read).length;

  // Add a toast notification (visible for 5 seconds)
  const addToast = useCallback((message, type = 'info') => {
    const id = ++toastIdRef.current;
    const toast = { id, message, type, createdAt: Date.now() };
    setToasts(prev => [...prev.slice(-4), toast]); // keep max 5
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
    return id;
  }, []);

  // Dismiss a toast
  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Mark a notification as read
  const markAsRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    // Also update in Supabase if authenticated
    if (user) {
      supabase.from('notifications').update({ read: true }).eq('id', id).then(() => {});
    }
  }, [user]);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    if (user) {
      supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)
        .then(() => {});
    }
  }, [user]);

  // Load initial notifications from Supabase
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    // Fetch from Supabase for authenticated users
    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (!error && data) {
          setNotifications(data);
        }
      } catch {
        // Table may not exist yet — fail silently
      }
    };

    fetchNotifications();

    // Subscribe to realtime inserts for this user
    const channel = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotif = payload.new;
          setNotifications(prev => [newNotif, ...prev]);
          addToast(newNotif.title || newNotif.message, newNotif.type || 'info');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, addToast]);

  const value = {
    notifications,
    unreadCount,
    toasts,
    addToast,
    dismissToast,
    markAsRead,
    markAllAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * useNotifications — access notification state from any component
 */
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

// ─── NOTIFICATION BELL (for Header) ─────────────────────────────

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const typeIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle size={16} className="text-bocra-green flex-shrink-0" />;
      case 'warning': return <AlertTriangle size={16} className="text-bocra-yellow flex-shrink-0" />;
      case 'error': return <AlertCircle size={16} className="text-red-500 flex-shrink-0" />;
      default: return <Info size={16} className="text-bocra-cyan flex-shrink-0" />;
    }
  };

  const formatTime = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell size={18} className="text-bocra-slate/50" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-bocra-magenta text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse-slow">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-[70] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-sm font-bold text-bocra-slate">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-bocra-blue hover:text-bocra-cyan font-medium transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-bocra-slate/40">
                No notifications
              </div>
            ) : (
              notifications.map(n => (
                <button
                  key={n.id}
                  onClick={() => { markAsRead(n.id); }}
                  className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${!n.read ? 'bg-bocra-blue/[0.02]' : ''}`}
                >
                  {typeIcon(n.type)}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${!n.read ? 'font-semibold text-bocra-slate' : 'text-bocra-slate/70'}`}>
                      {n.title || n.message}
                    </p>
                    {n.title && n.message && (
                      <p className="text-xs text-bocra-slate/50 mt-0.5 line-clamp-2">{n.message}</p>
                    )}
                    <p className="text-[10px] text-bocra-slate/30 mt-1">{formatTime(n.created_at)}</p>
                  </div>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-bocra-cyan flex-shrink-0 mt-1.5" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TOAST CONTAINER (rendered in Layout) ───────────────────────

export function ToastContainer() {
  const { toasts, dismissToast } = useNotifications();

  const typeStyles = {
    info: 'border-l-bocra-cyan bg-bocra-cyan/5',
    success: 'border-l-bocra-green bg-bocra-green/5',
    warning: 'border-l-bocra-yellow bg-bocra-yellow/5',
    error: 'border-l-red-500 bg-red-50',
  };

  const typeIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle size={18} className="text-bocra-green flex-shrink-0" />;
      case 'warning': return <AlertTriangle size={18} className="text-bocra-yellow flex-shrink-0" />;
      case 'error': return <AlertCircle size={18} className="text-red-500 flex-shrink-0" />;
      default: return <Info size={18} className="text-bocra-cyan flex-shrink-0" />;
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9998] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border border-gray-100 border-l-4 bg-white animate-slide-up ${typeStyles[toast.type] || typeStyles.info}`}
          role="alert"
        >
          {typeIcon(toast.type)}
          <p className="text-sm text-bocra-slate flex-1">{toast.message}</p>
          <button
            onClick={() => dismissToast(toast.id)}
            className="text-bocra-slate/30 hover:text-bocra-slate/60 transition-colors flex-shrink-0"
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
