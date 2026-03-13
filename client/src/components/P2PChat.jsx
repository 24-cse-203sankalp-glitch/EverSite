import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageCircle, X, Users, Shield } from 'lucide-react';
import io from 'socket.io-client';

export default function P2PChat({ isOpen, onClose, darkMode }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [username, setUsername] = useState('');
  const [isUsernameSet, setIsUsernameSet] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const savedUsername = localStorage.getItem('eversite-username');
    if (savedUsername) {
      setUsername(savedUsername);
      setIsUsernameSet(true);
    }
  }, []);

  useEffect(() => {
    if (isUsernameSet) {
      const newSocket = io('https://ever-site-server.vercel.app');
      
      newSocket.on('connect', () => {
        console.log('Connected to server');
        newSocket.emit('join-chat', { username });
      });

      newSocket.on('chat-message', (data) => {
        setMessages(prev => [...prev, {
          id: Date.now() + Math.random(),
          username: data.username,
          message: data.message,
          timestamp: data.timestamp,
          isOwn: data.username === username
        }]);
      });

      newSocket.on('user-count', (count) => {
        setOnlineUsers(count);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isUsernameSet, username]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSetUsername = (e) => {
    e.preventDefault();
    if (username.trim()) {
      localStorage.setItem('eversite-username', username);
      setIsUsernameSet(true);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim() && socket) {
      const messageData = {
        username: username,
        message: inputMessage,
        timestamp: new Date().toISOString()
      };

      socket.emit('chat-message', messageData);
      setInputMessage('');
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col border`}
      >
        <div className={`flex items-center justify-between p-4 border-b ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'} rounded-t-xl`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Live Chat</h3>
              <div className={`flex items-center gap-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <Users className="w-4 h-4" />
                <span>{onlineUsers} online</span>
                <span className="text-gray-400">•</span>
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-green-600">Live</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-600'} transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isUsernameSet ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <form onSubmit={handleSetUsername} className="w-full max-w-md space-y-4">
              <div className="text-center mb-6">
                <h4 className={`text-2xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Choose Your Username</h4>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Join the conversation</p>
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username..."
                className={`w-full px-4 py-3 rounded-lg ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                autoFocus
                maxLength={20}
              />
              <button
                type="submit"
                className="w-full btn-primary"
                disabled={!username.trim()}
              >
                Join Chat
              </button>
            </form>
          </div>
        ) : (
          <>
            <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
              {messages.length === 0 && (
                <div className={`text-center py-12 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No messages yet</p>
                  <p className="text-sm mt-2">Start chatting!</p>
                </div>
              )}

              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      msg.isOwn
                        ? 'bg-blue-600 text-white'
                        : darkMode ? 'bg-gray-700 text-white' : 'bg-white border border-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="text-xs opacity-75 mb-1 font-medium">
                      {msg.isOwn ? 'You' : msg.username}
                    </p>
                    <p className="break-words">{msg.message}</p>
                    <p className="text-xs opacity-60 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              ))}
              
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className={`p-4 border-t ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} rounded-b-xl`}>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type a message..."
                  className={`flex-1 px-4 py-2.5 rounded-lg ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
