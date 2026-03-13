import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageCircle, X, Users, Shield, Copy } from 'lucide-react';
import Peer from 'peerjs';

export default function P2PChat({ isOpen, onClose, darkMode, connectedPeers }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [username, setUsername] = useState('');
  const [isUsernameSet, setIsUsernameSet] = useState(false);
  const [myPeerId, setMyPeerId] = useState('');
  const [targetPeerId, setTargetPeerId] = useState('');
  const [connections, setConnections] = useState([]);
  const [onlinePeers, setOnlinePeers] = useState(0);
  const messagesEndRef = useRef(null);
  const peerRef = useRef(null);

  useEffect(() => {
    const savedUsername = localStorage.getItem('eversite-username');
    if (savedUsername) {
      setUsername(savedUsername);
      setIsUsernameSet(true);
    }

    if (isOpen && !peerRef.current) {
      initPeer();
    }

    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
    };
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initPeer = () => {
    const peer = new Peer({
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' }
        ]
      }
    });

    peer.on('open', (id) => {
      setMyPeerId(id);
      setOnlinePeers(1);
    });

    peer.on('connection', (conn) => {
      setupConnection(conn);
    });

    peer.on('error', (err) => {
      console.error('PeerJS error:', err);
    });

    peerRef.current = peer;
  };

  const setupConnection = (conn) => {
    conn.on('open', () => {
      setConnections(prev => [...prev, conn]);
      setOnlinePeers(prev => prev + 1);
    });

    conn.on('data', (data) => {
      if (data.type === 'CHAT_MESSAGE') {
        setMessages(prev => [...prev, {
          id: Date.now() + Math.random(),
          username: data.username,
          message: data.message,
          timestamp: data.timestamp,
          isOwn: false
        }]);
      }
    });

    conn.on('close', () => {
      setConnections(prev => prev.filter(c => c !== conn));
      setOnlinePeers(prev => Math.max(1, prev - 1));
    });
  };

  const handleSetUsername = (e) => {
    e.preventDefault();
    if (username.trim()) {
      localStorage.setItem('eversite-username', username);
      setIsUsernameSet(true);
    }
  };

  const handleConnectToPeer = () => {
    if (!targetPeerId.trim() || !peerRef.current) return;

    const conn = peerRef.current.connect(targetPeerId);
    setupConnection(conn);
    setTargetPeerId('');
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim() && connections.length > 0) {
      const messageData = {
        type: 'CHAT_MESSAGE',
        username: username,
        message: inputMessage,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, {
        id: Date.now(),
        username: username,
        message: inputMessage,
        timestamp: messageData.timestamp,
        isOwn: true
      }]);

      connections.forEach(conn => {
        if (conn.open) {
          conn.send(messageData);
        }
      });

      setInputMessage('');
    }
  };

  const copyPeerId = () => {
    navigator.clipboard.writeText(myPeerId);
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
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>P2P Chat</h3>
              <div className={`flex items-center gap-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <Users className="w-4 h-4" />
                <span>{onlinePeers} Online</span>
                <span className="text-gray-400">•</span>
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-green-600">{connections.length} Connected</span>
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
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Start P2P chatting</p>
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
            <div className={`p-4 border-b ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
              <div className="space-y-3">
                <div>
                  <label className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1 block`}>Your Peer ID (share this)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={myPeerId}
                      readOnly
                      className={`flex-1 px-3 py-2 rounded-lg text-sm ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } border`}
                    />
                    <button
                      onClick={copyPeerId}
                      className="btn-secondary px-3"
                      title="Copy Peer ID"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1 block`}>Connect to Peer</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={targetPeerId}
                      onChange={(e) => setTargetPeerId(e.target.value)}
                      placeholder="Paste peer ID..."
                      className={`flex-1 px-3 py-2 rounded-lg text-sm ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    <button
                      onClick={handleConnectToPeer}
                      className="btn-primary px-4 text-sm"
                      disabled={!targetPeerId.trim()}
                    >
                      Connect
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
              {messages.length === 0 && (
                <div className={`text-center py-12 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No messages yet</p>
                  <p className="text-sm mt-2">{connections.length > 0 ? 'Start chatting!' : 'Connect to a peer to start chatting'}</p>
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
                  placeholder={connections.length > 0 ? "Type a message..." : "Connect to a peer first..."}
                  className={`flex-1 px-4 py-2.5 rounded-lg ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  disabled={connections.length === 0}
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || connections.length === 0}
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
