import { useState, useEffect, useRef } from 'react';
import { Lock, Unlock, Upload, FileText, Image, File, Trash2, Download, Eye, EyeOff, Shield, Plus, X } from 'lucide-react';
import CryptoJS from 'crypto-js';

const VAULT_KEY = 'eversite-vault-docs';
const VAULT_LOCKED_KEY = 'eversite-vault-locked';

function encryptData(data, password) {
  return CryptoJS.AES.encrypt(JSON.stringify(data), password).toString();
}

function decryptData(cipher, password) {
  try {
    const bytes = CryptoJS.AES.decrypt(cipher, password);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch {
    return null;
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getFileIcon(type) {
  if (type?.startsWith('image/')) return Image;
  if (type?.includes('pdf') || type?.includes('text')) return FileText;
  return File;
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function VaultPage({ darkMode }) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [docs, setDocs] = useState([]);
  const [hasVault, setHasVault] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [docLabel, setDocLabel] = useState('');
  const [pendingFile, setPendingFile] = useState(null);
  const fileRef = useRef(null);
  const vaultPassword = useRef('');

  useEffect(() => {
    setHasVault(!!localStorage.getItem(VAULT_KEY));
  }, []);

  const unlock = () => {
    setError('');
    if (!hasVault) {
      if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
      if (password !== confirmPassword) { setError('Passwords do not match'); return; }
      vaultPassword.current = password;
      setDocs([]);
      setIsUnlocked(true);
    } else {
      const cipher = localStorage.getItem(VAULT_KEY);
      const decrypted = decryptData(cipher, password);
      if (!decrypted) { setError('Wrong password'); return; }
      vaultPassword.current = password;
      setDocs(decrypted);
      setIsUnlocked(true);
    }
    setPassword('');
    setConfirmPassword('');
  };

  const lock = () => {
    saveDocs(docs);
    setIsUnlocked(false);
    vaultPassword.current = '';
    setDocs([]);
  };

  const saveDocs = (d) => {
    const encrypted = encryptData(d, vaultPassword.current);
    localStorage.setItem(VAULT_KEY, encrypted);
    setHasVault(true);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('File too large (max 5MB)'); return; }
    setPendingFile(file);
    setDocLabel(file.name);
    e.target.value = '';
  };

  const confirmUpload = async () => {
    if (!pendingFile) return;
    setUploading(true);
    setError('');
    try {
      const base64 = await fileToBase64(pendingFile);
      const newDoc = {
        id: Date.now(),
        name: docLabel || pendingFile.name,
        originalName: pendingFile.name,
        type: pendingFile.type,
        size: pendingFile.size,
        data: base64,
        uploadedAt: new Date().toISOString(),
      };
      const updated = [...docs, newDoc];
      setDocs(updated);
      saveDocs(updated);
      setPendingFile(null);
      setDocLabel('');
    } catch (e) {
      setError('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const deleteDoc = (id) => {
    const updated = docs.filter(d => d.id !== id);
    setDocs(updated);
    saveDocs(updated);
    if (previewDoc?.id === id) setPreviewDoc(null);
  };

  const downloadDoc = (doc) => {
    const a = document.createElement('a');
    a.href = doc.data;
    a.download = doc.originalName;
    a.click();
  };

  const deleteVault = () => {
    if (!confirm('Delete entire vault? This cannot be undone.')) return;
    localStorage.removeItem(VAULT_KEY);
    setHasVault(false);
    setIsUnlocked(false);
    setDocs([]);
    vaultPassword.current = '';
  };

  const base = darkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900';
  const card = darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';
  const inputCls = darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900';

  if (!isUnlocked) {
    return (
      <div className={`min-h-[calc(100vh-73px)] flex items-center justify-center ${base}`}>
        <div className={`w-full max-w-md p-8 rounded-2xl border shadow-xl ${card}`}>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {hasVault ? 'Unlock Vault' : 'Create Vault'}
            </h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {hasVault ? 'Enter your password to access encrypted documents' : 'Set a master password to create your encrypted vault'}
            </p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && unlock()}
                placeholder="Master password"
                className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 pr-10 ${inputCls}`}
                autoFocus
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {!hasVault && (
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && unlock()}
                placeholder="Confirm password"
                className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${inputCls}`}
              />
            )}

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button
              onClick={unlock}
              disabled={!password}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-40"
            >
              {hasVault ? 'Unlock' : 'Create Vault'}
            </button>

            {hasVault && (
              <button onClick={deleteVault} className="w-full py-2 text-red-500 text-sm hover:underline">
                Delete vault
              </button>
            )}
          </div>

          <div className={`mt-6 p-3 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-amber-50'} flex items-start gap-2`}>
            <Shield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-amber-800'}`}>
              Documents are encrypted with AES-256 and stored locally. No data leaves your device. Works fully offline.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-[calc(100vh-73px)] ${base}`}>
      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Unlock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Secure Vault</h2>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{docs.length} document{docs.length !== 1 ? 's' : ''} · AES-256 encrypted · Offline</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Document
            </button>
            <button
              onClick={lock}
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-xl border transition-colors ${darkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-900' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <Lock className="w-4 h-4" /> Lock
            </button>
          </div>
        </div>

        <input ref={fileRef} type="file" className="hidden" onChange={handleFileSelect} accept="image/*,.pdf,.txt,.doc,.docx,.png,.jpg,.jpeg" />

        {/* Pending upload */}
        {pendingFile && (
          <div className={`mb-4 p-4 rounded-xl border ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-amber-50 border-amber-200'}`}>
            <p className={`text-sm font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Add label for: <span className="text-amber-600">{pendingFile.name}</span> ({formatSize(pendingFile.size)})
            </p>
            <div className="flex gap-2">
              <input
                value={docLabel}
                onChange={e => setDocLabel(e.target.value)}
                placeholder="Document label (e.g. Passport, Insurance Card)"
                className={`flex-1 px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-amber-500 ${inputCls}`}
              />
              <button onClick={confirmUpload} disabled={uploading} className="px-4 py-2 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 disabled:opacity-50">
                {uploading ? 'Encrypting...' : 'Save'}
              </button>
              <button onClick={() => { setPendingFile(null); setDocLabel(''); }} className="px-3 py-2 text-gray-500 hover:text-gray-700">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {docs.length === 0 ? (
          <div className={`text-center py-20 rounded-2xl border-2 border-dashed ${darkMode ? 'border-gray-800 text-gray-600' : 'border-gray-200 text-gray-400'}`}>
            <Lock className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Vault is empty</p>
            <p className="text-sm mt-1">Upload IDs, insurance cards, medical records, or any important documents</p>
            <button onClick={() => fileRef.current?.click()} className="mt-4 px-6 py-2 bg-amber-500 text-white text-sm rounded-xl hover:bg-amber-600">
              Upload First Document
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {docs.map(doc => {
              const Icon = getFileIcon(doc.type);
              const isImage = doc.type?.startsWith('image/');
              return (
                <div key={doc.id} className={`rounded-xl border p-4 ${card}`}>
                  <div className="flex items-start gap-3">
                    {isImage ? (
                      <img src={doc.data} alt={doc.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-amber-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{doc.name}</p>
                      <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {formatSize(doc.size)} · {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        <Shield className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-green-600">AES-256 Encrypted</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {isImage && (
                      <button
                        onClick={() => setPreviewDoc(previewDoc?.id === doc.id ? null : doc)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs rounded-lg border transition-colors ${darkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                      >
                        <Eye className="w-3.5 h-3.5" /> Preview
                      </button>
                    )}
                    <button
                      onClick={() => downloadDoc(doc)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs rounded-lg border transition-colors ${darkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                    <button
                      onClick={() => deleteDoc(doc.id)}
                      className="px-3 py-1.5 text-xs rounded-lg border border-red-200 text-red-500 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {previewDoc?.id === doc.id && isImage && (
                    <div className="mt-3">
                      <img src={doc.data} alt={doc.name} className="w-full rounded-lg object-contain max-h-64" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
