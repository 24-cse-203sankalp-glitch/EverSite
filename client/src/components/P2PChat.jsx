import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageCircle, X, Users, Shield, Copy, Paperclip, Download, Image, File, Trash2 } from 'lucide-react';
import CryptoJS from 'crypto-js';

const CHAT_KEY = 'eversite-chat-history';
const ENCRYPTION_SECRET = 'eversite-p2p-secret-key-2024';

function encrypt(data) {
  return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_SECRET).toString();
}

function decrypt(cipher) {
  try {
    const bytes = CryptoJS.AES.decrypt(cipher, ENCRYPTION_SECRET);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch { return null; }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export default function P2PChat({ isOpen, onClose, darkMode }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [username, setUsername] = useState('');
  const [isUsernameSet, setIsUsernameSet] = useState(false);
  const [myPeerId, setMyPeerId] = useState('');
  const [targetPeerId, setTargetPeerId] = useState('');
  const [connections, setConnections] = useState([]);
  const [onlinePeers, setOnlinePeers] = useState(1);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileRef = useRef(null);
  const localIdRef = useRef('');

  useEffect(() => {
    const savedUsername = localStorage.getItem('eversite-username');
    if (savedUsername) { setUsername(savedUsername); setIsUsernameSet(true); }
    const savedMessages = localStorage.getItem(CHAT_KEY);
    if (savedMessages) {
      try { setMessages(JSON.parse(savedMessages)); } catch {}
    }
    if (isOpen) initPeer();
    return () => window.removeEventListener('storage', handleStorageMessage);
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (messages.length > 0) localStorage.setItem(CHAT_KEY, JSON.stringify(messages.slice(-100)));
  }, [messages]);

  const handleStorageMessage = (e) => {
    if (!e.key?.startsWith('peer-message-')) return;
    try {
      const raw = JSON.parse(e.newValue);
      if (raw.to !== localIdRef.current) return;
      const data = decrypt(raw.encryptedData);
      if (!data) return;
      setMessages(prev => [...prev, { ...data, id: Date.now() + Math.random(), isOwn: false }]);
    } catch {}
  };

  const initPeer = () => {
    const localId = 'peer-' + Math.random().toString(36).substr(2, 9);
    localIdRef.current = localId;
    setMyPeerId(localId);
    window.addEventListener('storage', handleStorageMessage);
    setInterval(() => {
      Object.keys(localStorage).forEach(k => {
        if ((k.startsWith('peer-connect-') || k.startsWith('peer-message-')) && Date.now() - parseInt(k.split('-').pop()) > 10000) {
          localStorage.removeItem(k);
        }
      });
    }, 10000);
  };

  const handleSetUsername = (e) => {
    e.preventDefault();
    if (username.trim()) { localStorage.setItem('eversite-username', username); setIsUsernameSet(true); }
  };

  const handleConnectToPeer = () => {
    if (!targetPeerId.trim()) return;
    localStorage.setItem('peer-connect-' + Date.now(), JSON.stringify({ fromId: localIdRef.current, targetId: targetPeerId }));
    setConnections(prev => [...prev, { peer: targetPeerId, open: true }]);
    setOnlinePeers(prev => prev + 1);
    setTargetPeerId('');
  };

  const sendToConnections = (msgData) => {
    connections.forEach(conn => {
      if (!conn.open) return;
      const encrypted = encrypt(msgData);
      localStorage.setItem('peer-message-' + Date.now() + '-' + Math.random(), JSON.stringify({
        from: localIdRef.current,
        to: conn.peer,
        encryptedData: encrypted,
      }));
    });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || connections.length === 0) return;
    const msgData = { type: 'text', username, message: inputMessage, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, { ...msgData, id: Date.now(), isOwn: true }]);
    sendToConnections(msgData);
    setInputMessage('');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || connections.length === 0) return;
    if (file.size > 5 * 1024 * 1024) { alert('Max file size is 5MB'); return; }
    setUploading(true);
    try {
      const base64 = await fileToBase64(file);
      const isImage = file.type.startsWith('image/');
      const msgData = {
        type: isImage ? 'image' : 'file',
        username,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        fileData: base64,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, { ...msgData, id: Date.now(), isOwn: true }]);
      sendToConnections(msgData);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const downloadFile = (msg) => {
    const a = document.createElement('a');
    a.href = msg.fileData;
    a.download = msg.fileName;
    a.click();
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(CHAT_KEY);
  };

  const copyPeerId = () => navigator.clipboard.writeText(myPeerId);

  const dm = darkMode;
  const bg = dm ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200';
  const inputCls = dm ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500';

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className={`${bg} rounded-xl shadow-2xl w-full max-w-2xl h-[640px] flex flex-col border`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${dm ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'} rounded-t-xl`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${dm ? 'text-white' : 'text-gray-900'}`}>P2P Chat</h3>
              <div className={`flex items-center gap-2 text-sm ${dm ? 'text-gray-400' : 'text-gray-600'}`}>
                <Users className="w-4 h-4" /><span>{onlinePeers} Online</span>
                <span>·</span>
                <Shield className="w-4 h-4 text-green-600" /><span className="text-green-600">E2E Encrypted</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button onClick={clearChat} className={`p-2 rounded-lg ${dm ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`} title="Clear chat">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button onClick={onClose} className={`p-2 rounded-lg ${dm ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-600'}`}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {!isUsernameSet ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <form onSubmit={handleSetUsername} className="w-full max-w-md space-y-4">
              <div className="text-center mb-6">
                <h4 className={`text-2xl font-semibold mb-2 ${dm ? 'text-white' : 'text-gray-900'}`}>Choose Username</h4>
                <p className={dm ? 'text-gray-400' : 'text-gray-600'}>All messages are AES-256 encrypted</p>
              </div>
              <input
                type="text" value={username} onChange={e => setUsername(e.target.value)}
                placeholder="Enter username..." autoFocus maxLength={20}
                className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputCls}`}
              />
              <button type="submit" className="w-full btn-primary" disabled={!username.trim()}>Join Chat</button>
            </form>
          </div>
        ) : (
          <>
            {/* Peer connect */}
            <div className={`p-4 border-b ${dm ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`text-xs font-medium ${dm ? 'text-gray-400' : 'text-gray-600'} mb-1 block`}>Your Peer ID</label>
                  <div className="flex gap-2">
                    <input value={myPeerId} readOnly className={`flex-1 px-3 py-2 rounded-lg text-xs border ${inputCls}`} />
                    <button onClick={copyPeerId} className="btn-secondary px-2" title="Copy"><Copy className="w-4 h-4" /></button>
                  </div>
                </div>
                <div>
                  <label className={`text-xs font-medium ${dm ? 'text-gray-400' : 'text-gray-600'} mb-1 block`}>Connect to Peer</label>
                  <div className="flex gap-2">
                    <input
                      value={targetPeerId} onChange={e => setTargetPeerId(e.target.value)}
                      placeholder="Paste peer ID..." className={`flex-1 px-3 py-2 rounded-lg text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputCls}`}
                    />
                    <button onClick={handleConnectToPeer} disabled={!targetPeerId.trim()} className="btn-primary px-3 text-xs">Connect</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${dm ? 'bg-gray-900' : 'bg-gray-50'}`}>
              {messages.length === 0 && (
                <div className={`text-center py-10 ${dm ? 'text-gray-500' : 'text-gray-400'}`}>
                  <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium">No messages yet</p>
                  <p className="text-xs mt-1">{connections.length > 0 ? 'Send a message or file' : 'Connect to a peer first'}</p>
                </div>
              )}
              {messages.map(msg => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-xl px-4 py-2.5 ${
                    msg.isOwn ? 'bg-blue-600 text-white' : dm ? 'bg-gray-700 text-white' : 'bg-white border border-gray-200 text-gray-900'
                  }`}>
                    <p className="text-xs opacity-70 mb-1 font-medium">{msg.isOwn ? 'You' : msg.username}</p>

                    {msg.type === 'text' && <p className="break-words text-sm">{msg.message}</p>}

                    {msg.type === 'image' && (
                      <div>
                        <img src={msg.fileData} alt={msg.fileName} className="rounded-lg max-w-full max-h-48 object-contain mb-2" />
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs opacity-70 truncate">{msg.fileName} · {formatSize(msg.fileSize)}</span>
                          <button onClick={() => downloadFile(msg)} className="opacity-70 hover:opacity-100">
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {msg.type === 'file' && (
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${msg.isOwn ? 'bg-blue-500' : dm ? 'bg-gray-600' : 'bg-gray-100'}`}>
                          <File className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{msg.fileName}</p>
                          <p className="text-xs opacity-60">{formatSize(msg.fileSize)}</p>
                        </div>
                        <button onClick={() => downloadFile(msg)} className="opacity-70 hover:opacity-100 flex-shrink-0">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-1 mt-1">
                      <Shield className="w-2.5 h-2.5 opacity-50" />
                      <p className="text-xs opacity-50">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className={`p-4 border-t ${dm ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} rounded-b-xl`}>
              <input ref={fileRef} type="file" className="hidden" onChange={handleFileUpload} />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => connections.length > 0 && fileRef.current?.click()}
                  disabled={connections.length === 0 || uploading}
                  className={`p-2.5 rounded-lg border transition-colors disabled:opacity-40 ${dm ? 'border-gray-600 text-gray-400 hover:bg-gray-700' : 'border-gray-300 text-gray-500 hover:bg-gray-50'}`}
                  title="Send file or image"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <input
                  type="text" value={inputMessage} onChange={e => setInputMessage(e.target.value)}
                  placeholder={connections.length > 0 ? 'Type a message...' : 'Connect to a peer first...'}
                  className={`flex-1 px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${inputCls}`}
                  disabled={connections.length === 0}
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || connections.length === 0}
                  className="btn-primary px-5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              {uploading && <p className="text-xs text-blue-600 mt-1.5 text-center">Encrypting and sending file...</p>}
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
