import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

// Only shows toasts for notifications added after mount — auto-dismisses after 5s
export default function ToastNotification({ notifications, darkMode }) {
  const [toasts, setToasts] = useState([]);
  const [seenIds] = useState(() => new Set());

  useEffect(() => {
    if (!notifications.length) return;
    const latest = notifications[0];
    if (seenIds.has(latest.id)) return;
    seenIds.add(latest.id);
    setToasts(prev => [...prev, latest]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== latest.id));
    }, 5000);
  }, [notifications]);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 80 }}
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border min-w-[280px] max-w-xs ${
              darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'
            }`}
          >
            {t.type === 'success' && <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />}
            {t.type === 'error'   && <AlertCircle  className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />}
            {!['success','error'].includes(t.type) && <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />}
            <div className="flex-1">
              <p className="text-xs font-semibold">{t.title}</p>
              {t.message && <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t.message}</p>}
            </div>
            <button
              onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
              className={`flex-shrink-0 ${darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
