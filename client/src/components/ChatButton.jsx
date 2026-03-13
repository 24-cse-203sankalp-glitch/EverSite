import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ChatButton({ onClick, unreadCount }) {
  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full shadow-2xl shadow-cyan-500/50 flex items-center justify-center z-40 hover:shadow-cyan-500/70 transition-shadow"
    >
      <MessageCircle className="w-8 h-8 text-white" />
      {unreadCount > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white"
        >
          {unreadCount}
        </motion.div>
      )}
    </motion.button>
  );
}
