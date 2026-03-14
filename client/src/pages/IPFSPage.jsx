import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Copy, Database, CheckCircle, Globe, Shield, Upload, Clock, Server, FileText, Loader } from 'lucide-react';
import IPFSManager from '../core/IPFSManager';

export default function IPFSPage({ darkMode }) {
  const [ipfsHash, setIpfsHash] = useState('');
  const [uploadLog, setUploadLog] = useState([]);
  const [copied, setCopied] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [nodeType, setNodeType] = useState('');

  useEffect(() => {
    const hash = localStorage.getItem('eversite-ipfs-hash');
    if (hash) setIpfsHash(hash);
    setUploadLog(IPFSManager.getUploadLog());
    setNodeType(IPFSManager.getNodeType() || '');
  }, []);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  const handleUpload = async () => {
    setUploading(true);
    setUploadError('');
    const result = await IPFSManager.uploadSite();
    setUploading(false);
    if (result.success) {
      setIpfsHash(result.hash);
      setUploadLog(IPFSManager.getUploadLog());
      setNodeType(result.node);
    } else {
      setUploadError(result.error);
    }
  };

  const gateways = ipfsHash ? [
    { name: 'IPFS.io', url: `https://ipfs.io/ipfs/${ipfsHash}`, color: 'bg-blue-600' },
    { name: 'Cloudflare', url: `https://cloudflare-ipfs.com/ipfs/${ipfsHash}`, color: 'bg-orange-500' },
    { name: 'Dweb.link', url: `https://dweb.link/ipfs/${ipfsHash}`, color: 'bg-green-600' },
    { name: 'Pinata', url: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`, color: 'bg-purple-600' },
  ] : [];

  const card = darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';
  const text = darkMode ? 'text-white' : 'text-gray-900';
  const sub = darkMode ? 'text-gray-400' : 'text-gray-500';
  const inputCls = darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900';

  return (
    <div className={`min-h-[calc(100vh-73px)] ${darkMode ? 'bg-black' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto px-6 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={`text-2xl font-bold ${text}`}>IPFS Deployment</h1>
            <p className={`text-sm mt-0.5 ${sub}`}>Upload this site to the decentralized IPFS network</p>
          </div>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            {uploading ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? 'Uploading...' : ipfsHash ? 'Re-upload' : 'Upload to IPFS'}
          </button>
        </div>

        {/* Node info */}
        <div className={`rounded-xl border p-4 mb-4 ${card}`}>
          <div className="flex items-center gap-3 mb-3">
            <Server className="w-4 h-4 text-blue-500" />
            <p className={`text-sm font-medium ${text}`}>IPFS Node</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <p className={`text-xs ${sub} mb-1`}>Local Node (preferred)</p>
              <p className={`font-mono text-xs ${text}`}>http://127.0.0.1:5001</p>
              <p className="text-xs text-amber-500 mt-1">Run: <span className="font-mono">ipfs daemon</span></p>
            </div>
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <p className={`text-xs ${sub} mb-1`}>Fallback</p>
              <p className={`font-mono text-xs ${text}`}>Infura IPFS API</p>
              <p className="text-xs text-green-500 mt-1">Auto-used if local unavailable</p>
            </div>
          </div>
          {nodeType && (
            <div className="mt-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <p className={`text-xs ${sub}`}>Last upload used: <span className="font-medium text-green-500">{nodeType === 'local' ? 'Local IPFS daemon' : 'Infura'}</span></p>
            </div>
          )}
        </div>

        {uploadError && (
          <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">Upload failed</p>
            <p className="text-xs text-red-500 mt-1">{uploadError}</p>
            <p className="text-xs text-red-400 mt-2">Make sure <span className="font-mono">ipfs daemon</span> is running, or check your Infura credentials.</p>
          </div>
        )}

        {uploading && (
          <div className={`mb-4 p-4 rounded-xl border ${card} flex items-center gap-3`}>
            <Loader className="w-5 h-5 animate-spin text-blue-500 flex-shrink-0" />
            <div>
              <p className={`text-sm font-medium ${text}`}>Uploading to IPFS...</p>
              <p className={`text-xs ${sub}`}>Collecting site files and uploading to the network</p>
            </div>
          </div>
        )}

        {/* Current hash */}
        {ipfsHash && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`rounded-xl border p-5 mb-4 ${card}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className={`font-semibold ${text}`}>Uploaded Successfully</p>
                <p className={`text-xs ${sub}`}>Site is live on IPFS</p>
              </div>
            </div>

            <div className="mb-4">
              <p className={`text-xs font-medium ${sub} mb-1.5`}>CID (Content Identifier)</p>
              <div className="flex gap-2">
                <input
                  value={ipfsHash}
                  readOnly
                  className={`flex-1 px-3 py-2 rounded-lg font-mono text-xs border ${inputCls}`}
                />
                <button
                  onClick={() => copyToClipboard(ipfsHash, 'hash')}
                  className={`px-3 py-2 rounded-lg border text-xs transition-colors ${darkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  {copied === 'hash' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <p className={`text-xs font-medium ${sub} mb-2`}>Access via Gateways</p>
              <div className="grid grid-cols-2 gap-2">
                {gateways.map(gw => (
                  <div key={gw.name} className={`flex items-center gap-2 p-2.5 rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className={`w-6 h-6 ${gw.color} rounded flex items-center justify-center flex-shrink-0`}>
                      <Globe className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className={`text-xs flex-1 truncate ${text}`}>{gw.name}</span>
                    <a href={gw.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-400 flex-shrink-0">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button onClick={() => copyToClipboard(gw.url, gw.name)} className={`flex-shrink-0 ${sub} hover:text-blue-500`}>
                      {copied === gw.name ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Upload history */}
        {uploadLog.length > 0 && (
          <div className={`rounded-xl border p-5 ${card}`}>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-blue-500" />
              <p className={`text-sm font-medium ${text}`}>Upload History</p>
            </div>
            <div className="space-y-2">
              {uploadLog.map((entry, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <FileText className={`w-4 h-4 flex-shrink-0 ${sub}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`font-mono text-xs truncate ${text}`}>{entry.hash}</p>
                    <p className={`text-xs ${sub} mt-0.5`}>{new Date(entry.uploadedAt).toLocaleString()} · {entry.files} files · {entry.node}</p>
                  </div>
                  <button onClick={() => copyToClipboard(entry.hash, `log-${i}`)} className={`flex-shrink-0 ${sub} hover:text-blue-500`}>
                    {copied === `log-${i}` ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {!ipfsHash && !uploading && (
          <div className={`rounded-xl border-2 border-dashed p-12 text-center ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            <Database className={`w-12 h-12 mx-auto mb-3 ${darkMode ? 'text-gray-700' : 'text-gray-300'}`} />
            <p className={`font-medium ${text}`}>Not uploaded yet</p>
            <p className={`text-sm mt-1 ${sub}`}>Click "Upload to IPFS" to deploy this site to the decentralized network</p>
            <div className="mt-4 flex items-center justify-center gap-4 text-xs">
              {[
                { icon: Shield, label: 'Censorship resistant', color: 'text-blue-500' },
                { icon: Globe, label: 'Globally distributed', color: 'text-green-500' },
                { icon: Database, label: 'No single point of failure', color: 'text-purple-500' },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className={`flex items-center gap-1.5 ${sub}`}>
                  <Icon className={`w-3.5 h-3.5 ${color}`} />
                  {label}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
