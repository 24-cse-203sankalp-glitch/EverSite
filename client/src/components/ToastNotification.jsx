import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Download, Upload, X } from 'lucide-react';

export default function ToastNotification({ notifications, onDismiss, darkMode }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            className={`${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border rounded-lg shadow-lg min-w-[320px] p-4 ${
              notification.type === 'success' ? darkMode ? 'border-green-700' : 'border-green-200' :
              notification.type === 'error' ? darkMode ? 'border-red-700' : 'border-red-200' :
              notification.type === 'download' ? darkMode ? 'border-blue-700' : 'border-blue-200' :
              darkMode ? 'border-purple-700' : 'border-purple-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {notification.type === 'success' && (
                  <div className={`w-8 h-8 ${darkMode ? 'bg-green-900' : 'bg-green-100'} rounded-full flex items-center justify-center`}>
                    <CheckCircle className={`w-5 h-5 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                  </div>
                )}
                {notification.type === 'error' && (
                  <div className={`w-8 h-8 ${darkMode ? 'bg-red-900' : 'bg-red-100'} rounded-full flex items-center justify-center`}>
                    <AlertCircle className={`w-5 h-5 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                  </div>
                )}
                {notification.type === 'download' && (
                  <div className={`w-8 h-8 ${darkMode ? 'bg-blue-900' : 'bg-blue-100'} rounded-full flex items-center justify-center`}>
                    <Download className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'} animate-bounce`} />
                  </div>
                )}
                {notification.type === 'upload' && (
                  <div className={`w-8 h-8 ${darkMode ? 'bg-purple-900' : 'bg-purple-100'} rounded-full flex items-center justify-center`}>
                    <Upload className={`w-5 h-5 ${darkMode ? 'text-purple-400' : 'text-purple-600'} animate-bounce`} />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {notification.title}
                </p>
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {notification.message}
                </p>
              </div>
              
              <button
                onClick={() => onDismiss(notification.id)}
                className={`flex-shrink-0 ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
