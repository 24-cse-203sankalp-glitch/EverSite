import { useState, useEffect, useRef } from 'react';
import { Bell, X, Users, UserPlus, UserMinus, AlertTriangle, Info, CheckCircle, Trash2 } from 'lucide-react';

const STORAGE_KEY = 'eversite-notifications';

export function useNotifications() {
  const [notifications, setNotifications] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
  });

  const add = (type, title, message) => {
    const n = { id: Date.now() + Math.random(), type, title, message, time: Date.now(), read: false };
    setNotifications(prev => {
      const updated = [n, ...prev].slice(0, 50);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const markAllRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clear = () => {
    setNotifications([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const remove = (id) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return { notifications, add, markAllRead, clear, remove };
}

const TYPE_META = {
  peer_join:  { icon: UserPlus,      color: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-950' },
  peer_leave: { icon: UserMinus,     color: 'text-red-400',    bg: 'bg-red-50 dark:bg-red-950' },
  alert:      { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950' },
  info:       { icon: Info,          color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-950' },
  success:    { icon: CheckCircle,   color: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-950' },
};

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function NotificationCenter({ darkMode, notifications, onMarkAllRead, onClear, onRemove }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const unread = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handler = (e) => { if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false); };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleOpen = () => {
    setOpen(o => !o);
    if (!open && unread > 0) setTimeout(onMarkAllRead, 1500);
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={handleOpen}
        className={`relative p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className={`absolute right-0 top-full mt-2 w-80 rounded-xl shadow-2xl border z-[100] overflow-hidden ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className={`flex items-center justify-between px-4 py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-500" />
              <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Notifications</span>
              {unread > 0 && <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">{unread}</span>}
            </div>
            <div className="flex items-center gap-1">
              {notifications.length > 0 && (
                <button onClick={onClear} className={`p-1.5 rounded-lg text-xs ${darkMode ? 'text-gray-500 hover:bg-gray-800' : 'text-gray-400 hover:bg-gray-100'}`} title="Clear all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button onClick={() => setOpen(false)} className={`p-1.5 rounded-lg ${darkMode ? 'text-gray-500 hover:bg-gray-800' : 'text-gray-400 hover:bg-gray-100'}`}>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className={`py-10 text-center text-sm ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No notifications yet
              </div>
            ) : (
              notifications.map(n => {
                const meta = TYPE_META[n.type] || TYPE_META.info;
                const Icon = meta.icon;
                return (
                  <div key={n.id} className={`flex items-start gap-3 px-4 py-3 border-b last:border-0 transition-colors ${darkMode ? 'border-gray-800 hover:bg-gray-800' : 'border-gray-100 hover:bg-gray-50'} ${!n.read ? darkMode ? 'bg-gray-800/50' : 'bg-blue-50/50' : ''}`}>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${meta.bg}`}>
                      <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{n.title}</p>
                      <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{n.message}</p>
                      <p className={`text-[10px] mt-1 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>{timeAgo(n.time)}</p>
                    </div>
                    <button onClick={() => onRemove(n.id)} className={`flex-shrink-0 p-1 rounded ${darkMode ? 'text-gray-600 hover:text-gray-400' : 'text-gray-300 hover:text-gray-500'}`}>
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
