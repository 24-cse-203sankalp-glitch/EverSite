import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageCircle, X, Users, Shield, Paperclip, Video, Phone, Search } from 'lucide-react';
import EverSiteCore from '../core/EverSiteCore';
import MessageEncryption from '../core/MessageEncryption';

export default function P2PChat({ isOpen, onClose, connectedPeers, darkMode }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [username, setUsername] = useState('');
  const [isUsernameSet, setIsUsernameSet] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const audioRef = useRef(new Audio('/notification.mp3'));

  useEffect(() => {
    // Listen for chat messages via socket.io
    if (EverSiteCore.socket) {
      const handleChatMessage = (data) => {
        if (data.username !== username) {
          setMessages(prev => [...prev, {
            id: Date.now(),
            username: data.username,
            message: data.message,
            timestamp: data.timestamp,
            isOwn: false,
            read: false
          }]);
          playNotificationSound();
        }
      };

      EverSiteCore.socket.on('chat-message', handleChatMessage);

      return () => {
        if (EverSiteCore.socket) {
          EverSiteCore.socket.off('chat-message', handleChatMessage);
        }
      };
    }
  }, [username]);

  useEffect(() {
    EverSiteCore.on('peer-data', handleIncomingMessage);
    
    const savedUsername = localStorage.getItem('eversite-username');
    if (savedUsername) {
      setUsername(savedUsername);
      setIsUsernameSet(true);
    }

    return () => {
      EverSiteCore.off('peer-data', handleIncomingMessage);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleIncomingMessage = ({ peerId, data }) => {
    if (data.type === 'chat-message') {
      const decrypted = MessageEncryption.decrypt(data.encryptedMessage);
      if (decrypted) {
        setMessages(prev => [...prev, {
          id: Date.now(),
          username: decrypted.username,
          message: decrypted.message,
          timestamp: decrypted.timestamp,
          peerId: peerId,
          isOwn: false,
          read: false
        }]);
        
        playNotificationSound();
        sendReadReceipt(peerId, data.messageId);
      }
    }
    
    if (data.type === 'chat-file') {
      const decrypted = MessageEncryption.decrypt(data.encryptedData);
      if (decrypted) {
        setMessages(prev => [...prev, {
          id: Date.now(),
          username: decrypted.username,
          message: `Shared file: ${decrypted.fileName}`,
          timestamp: decrypted.timestamp,
          peerId: peerId,
          isOwn: false,
          isFile: true,
          fileData: decrypted
        }]);
        playNotificationSound();
      }
    }
    
    if (data.type === 'typing-indicator') {
      setTypingUsers(prev => new Set(prev).add(data.username));
      setTimeout(() => {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.username);
          return newSet;
        });
      }, 3000);
    }
    
    if (data.type === 'read-receipt') {
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId ? { ...msg, read: true } : msg
      ));
    }
  };

  const playNotificationSound = () => {
    try {
      audioRef.current.play().catch(() => {});
    } catch (error) {}
  };

  const sendReadReceipt = (peerId, messageId) => {
    EverSiteCore.broadcastToAllPeers({
      type: 'read-receipt',
      messageId,
      peerId
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSetUsername = (e) => {
    e.preventDefault();
    if (username.trim()) {
      localStorage.setItem('eversite-username', username);
      setIsUsernameSet(true);
      sendMessage(`${username} joined the chat`, true);
    }
  };

  const handleTyping = () => {
    EverSiteCore.broadcastToAllPeers({
      type: 'typing-indicator',
      username
    });
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      typingTimeoutRef.current = null;
    }, 1000);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      const messageId = Date.now();
      const messageData = {
        username: username,
        message: inputMessage,
        timestamp: new Date().toISOString()
      };

      // Add to local messages
      setMessages(prev => [...prev, {
        id: messageId,
        username: username,
        message: inputMessage,
        timestamp: messageData.timestamp,
        isOwn: true,
        read: false
      }]);

      // Broadcast via socket.io directly
      if (EverSiteCore.socket && EverSiteCore.socket.connected) {
        EverSiteCore.socket.emit('chat-message', messageData);
      }

      setInputMessage('');
    }
  };

  const handleFileShare = async (e) => {
    const file = e.target.files[0];
    if (!file || connectedPeers === 0) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const fileData = {
        username: username,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileData: event.target.result,
        timestamp: new Date().toISOString()
      };

      const encrypted = MessageEncryption.encrypt(fileData);

      setMessages(prev => [...prev, {
        id: Date.now(),
        username: username,
        message: `Shared file: ${file.name}`,
        timestamp: fileData.timestamp,
        isOwn: true,
        isFile: true,
        fileData: fileData
      }]);

      EverSiteCore.broadcastToAllPeers({
        type: 'chat-file',
        encryptedData: encrypted
      });
    };
    reader.readAsDataURL(file);
  };

  const sendMessage = (text, isSystemMessage = false) => {
    const messageId = Date.now();
    const messageData = {
      username: username,
      message: text,
      timestamp: new Date().toISOString(),
      isSystem: isSystemMessage
    };

    const encrypted = MessageEncryption.encrypt(messageData);

    setMessages(prev => [...prev, {
      id: messageId,
      username: username,
      message: text,
      timestamp: messageData.timestamp,
      isOwn: true,
      isSystem: isSystemMessage,
      read: false
    }]);

    EverSiteCore.broadcastToAllPeers({
      type: 'chat-message',
      encryptedMessage: encrypted,
      messageId
    });
  };

  const filteredMessages = searchQuery
    ? messages.filter(msg => 
        msg.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

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
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'} rounded-t-xl`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>P2P Secure Chat</h3>
              <div className={`flex items-center gap-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <Users className="w-4 h-4" />
                <span>{EverSiteCore.peerCount || 0} online</span>
                <span className="text-gray-400">•</span>
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-green-600">Live</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-colors`}
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-600'} transition-colors`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {showSearch && (
          <div className={`p-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages..."
              className={`w-full px-3 py-2 rounded-lg ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
        )}

        {!isUsernameSet ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <form onSubmit={handleSetUsername} className="w-full max-w-md space-y-4">
              <div className="text-center mb-6">
                <h4 className={`text-2xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Choose Your Username</h4>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>This will be visible to other peers</p>
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

              {filteredMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      msg.isSystem
                        ? darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'
                        : msg.isOwn
                        ? 'bg-blue-600 text-white'
                        : darkMode ? 'bg-gray-700 text-white' : 'bg-white border border-gray-200 text-gray-900'
                    } text-center text-sm ${msg.isSystem ? 'italic' : ''}`}
                  >
                    {!msg.isSystem && (
                      <p className="text-xs opacity-75 mb-1 font-medium">
                        {msg.isOwn ? 'You' : msg.username}
                      </p>
                    )}
                    <p className="break-words">{msg.message}</p>
                    {msg.isFile && msg.fileData && (
                      <a
                        href={msg.fileData.fileData}
                        download={msg.fileData.fileName}
                        className={`inline-block mt-2 px-3 py-1 rounded text-xs ${
                          msg.isOwn ? 'bg-white/20 hover:bg-white/30' : darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        📎 Download {msg.fileData.fileName} ({(msg.fileData.fileSize / 1024).toFixed(1)} KB)
                      </a>
                    )}
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs opacity-60">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                      {msg.isOwn && (
                        <span className="text-xs opacity-60">
                          {msg.read ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {typingUsers.size > 0 && (
                <div className={`text-sm italic ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className={`p-4 border-t ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} rounded-b-xl`}>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => {
                    setInputMessage(e.target.value);
                    handleTyping();
                  }}
                  placeholder="Type a message..."
                  className={`flex-1 px-4 py-2.5 rounded-lg ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 disabled:bg-gray-800' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 disabled:bg-gray-100'
                  } border focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:text-gray-400`}
                />
                <label className="btn-secondary px-4 cursor-pointer flex items-center gap-2">
                  <input
                    type="file"
                    onChange={handleFileShare}
                    disabled={connectedPeers === 0}
                    className="hidden"
                  />
                  <Paperclip className="w-5 h-5" />
                </label>
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className={`text-xs flex items-center gap-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                <Shield className="w-3 h-3" />
                End-to-end encrypted • Direct P2P • File sharing enabled
              </p>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
