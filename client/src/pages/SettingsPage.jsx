import { useState, useEffect } from 'react';
import { User, Trash2, Download, Upload, Bell, BellOff, Shield, Wifi, Database, CheckCircle, AlertCircle, Loader, Phone, Save } from 'lucide-react';
import IPFSManager from '../core/IPFSManager';

const SETTINGS_KEY = 'eversite-settings';

function defaultSettings() {
  return {
    username: localStorage.getItem('eversite-username') || '',
    emergencyContact: '',
    emergencyPhone: '',
    notifyPeerJoin: true,
    notifyPeerLeave: true,
    notifyAlerts: true,
  };
}

export default function SettingsPage({ darkMode }) {
  const [settings, setSettings] = useState(() => {
    try { return { ...defaultSettings(), ...JSON.parse(localStorage.getItem(SETTINGS_KEY)) }; } catch { return defaultSettings(); }
  });
  const [saved, setSaved] = useState(false);
  const [diagResults, setDiagResults] = useState(null);
  const [diagRunning, setDiagRunning] = useState(false);
  const [importError, setImportError] = useState('');

  const save = () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    localStorage.setItem('eversite-username', settings.username);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const set = (key, val) => setSettings(s => ({ ...s, [key]: val }));

  const clearAllData = () => {
    if (!confirm('Clear ALL EverSite data? This includes chat history, vault, map markers, AI history, and settings. This cannot be undone.')) return;
    const keep = ['darkMode'];
    Object.keys(localStorage).forEach(k => { if (!keep.includes(k) && k.startsWith('eversite')) localStorage.removeItem(k); });
    // Also clear tile DB
    indexedDB.deleteDatabase('eversite-tiles');
    alert('All data cleared. Refreshing...');
    window.location.reload();
  };

  const exportVault = () => {
    const vault = localStorage.getItem('eversite-vault-docs');
    if (!vault) { alert('No vault data to export.'); return; }
    const blob = new Blob([JSON.stringify({ vault, exportedAt: new Date().toISOString() })], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `eversite-vault-backup-${Date.now()}.json`;
    a.click();
  };

  const importVault = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImportError('');
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data.vault) throw new Error('Invalid backup file');
        localStorage.setItem('eversite-vault-docs', data.vault);
        alert('Vault imported successfully. Go to Secure Vault to unlock it.');
      } catch { setImportError('Invalid backup file format.'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const runDiagnostics = async () => {
    setDiagRunning(true);
    setDiagResults(null);
    const results = {};

    // Internet
    try {
      const r = await fetch('https://1.1.1.1/cdn-cgi/trace', { signal: AbortSignal.timeout(4000) });
      results.internet = r.ok ? 'ok' : 'fail';
    } catch { results.internet = 'fail'; }

    // Local server (port 3001)
    try {
      const r = await fetch('http://localhost:3001/health', { signal: AbortSignal.timeout(3000) });
      results.server = r.ok ? 'ok' : 'fail';
    } catch { results.server = 'fail'; }

    // Video downloader (port 3003)
    try {
      const r = await fetch('http://localhost:3003/', { signal: AbortSignal.timeout(3000) });
      results.downloader = r.ok ? 'ok' : 'fail';
    } catch { results.downloader = 'fail'; }

    // IPFS local node
    try {
      const r = await fetch('http://127.0.0.1:5001/api/v0/version', { method: 'POST', signal: AbortSignal.timeout(3000) });
      results.ipfs = r.ok ? 'ok' : 'fail';
    } catch { results.ipfs = 'fail'; }

    // IndexedDB tile cache size
    try {
      const db = await new Promise((res, rej) => {
        const req = indexedDB.open('eversite-tiles', 1);
        req.onsuccess = e => res(e.target.result);
        req.onerror = rej;
      });
      const count = await new Promise((res) => {
        const tx = db.transaction('tiles', 'readonly');
        const req = tx.objectStore('tiles').count();
        req.onsuccess = () => res(req.result);
        req.onerror = () => res(0);
      });
      results.tileCacheCount = count;
    } catch { results.tileCacheCount = 0; }

    setDiagResults(results);
    setDiagRunning(false);
  };

  const base = darkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900';
  const card = darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';
  const input = darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900';
  const sub = darkMode ? 'text-gray-400' : 'text-gray-500';

  const DiagRow = ({ label, status }) => (
    <div className={`flex items-center justify-between py-2 border-b last:border-0 ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{label}</span>
      {status === undefined ? <span className={`text-xs ${sub}`}>—</span>
        : typeof status === 'number' ? <span className="text-xs text-blue-500 font-mono">{status} tiles cached</span>
        : status === 'ok'
          ? <span className="flex items-center gap-1 text-xs text-green-500"><CheckCircle className="w-3.5 h-3.5" /> Online</span>
          : <span className="flex items-center gap-1 text-xs text-red-400"><AlertCircle className="w-3.5 h-3.5" /> Offline</span>
      }
    </div>
  );

  return (
    <div className={`min-h-[calc(100vh-73px)] ${base}`}>
      <div className="max-w-2xl mx-auto px-6 py-6 space-y-5">
        <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Settings</h1>

        {/* Profile */}
        <div className={`rounded-xl border p-5 ${card}`}>
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-blue-500" />
            <h2 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Profile</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className={`text-xs font-medium ${sub} block mb-1`}>Display Name</label>
              <input value={settings.username} onChange={e => set('username', e.target.value)} placeholder="Your username" className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${input}`} />
            </div>
            <div>
              <label className={`text-xs font-medium ${sub} block mb-1`}>Emergency Contact Name</label>
              <input value={settings.emergencyContact} onChange={e => set('emergencyContact', e.target.value)} placeholder="e.g. John Doe" className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${input}`} />
            </div>
            <div>
              <label className={`text-xs font-medium ${sub} block mb-1`}>Emergency Contact Phone</label>
              <div className="relative">
                <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${sub}`} />
                <input value={settings.emergencyPhone} onChange={e => set('emergencyPhone', e.target.value)} placeholder="+1 (555) 000-0000" className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${input}`} />
              </div>
            </div>
            <button onClick={save} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
              {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className={`rounded-xl border p-5 ${card}`}>
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-4 h-4 text-blue-500" />
            <h2 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Notifications</h2>
          </div>
          <div className="space-y-3">
            {[
              { key: 'notifyPeerJoin',  label: 'Peer joined network' },
              { key: 'notifyPeerLeave', label: 'Peer left network' },
              { key: 'notifyAlerts',    label: 'Emergency alerts' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{label}</span>
                <button
                  onClick={() => { set(key, !settings[key]); }}
                  className={`w-10 h-5 rounded-full transition-colors relative ${settings[key] ? 'bg-blue-600' : darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${settings[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Vault Backup */}
        <div className={`rounded-xl border p-5 ${card}`}>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-amber-500" />
            <h2 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Vault Backup</h2>
          </div>
          <p className={`text-xs ${sub} mb-3`}>Export your encrypted vault to a file, or import a previous backup. The vault remains encrypted — you still need your password to access it.</p>
          <div className="flex gap-2">
            <button onClick={exportVault} className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg border transition-colors ${darkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
              <Download className="w-4 h-4" /> Export Vault
            </button>
            <label className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg border cursor-pointer transition-colors ${darkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
              <Upload className="w-4 h-4" /> Import Vault
              <input type="file" accept=".json" className="hidden" onChange={importVault} />
            </label>
          </div>
          {importError && <p className="text-xs text-red-500 mt-2">{importError}</p>}
        </div>

        {/* Network Diagnostics */}
        <div className={`rounded-xl border p-5 ${card}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-blue-500" />
              <h2 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Network Diagnostics</h2>
            </div>
            <button
              onClick={runDiagnostics}
              disabled={diagRunning}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg disabled:opacity-50 transition-colors"
            >
              {diagRunning ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Wifi className="w-3.5 h-3.5" />}
              {diagRunning ? 'Testing...' : 'Run Test'}
            </button>
          </div>
          {diagResults ? (
            <div>
              <DiagRow label="Internet connectivity" status={diagResults.internet} />
              <DiagRow label="EverSite server (localhost:3001)" status={diagResults.server} />
              <DiagRow label="Video downloader (localhost:3003)" status={diagResults.downloader} />
              <DiagRow label="IPFS local node (localhost:5001)" status={diagResults.ipfs} />
              <DiagRow label="Offline map tile cache" status={diagResults.tileCacheCount} />
            </div>
          ) : (
            <p className={`text-xs ${sub}`}>Click "Run Test" to check all services.</p>
          )}
        </div>

        {/* Danger Zone */}
        <div className={`rounded-xl border border-red-200 dark:border-red-900 p-5 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
          <h2 className="text-sm font-semibold text-red-500 mb-3">Danger Zone</h2>
          <p className={`text-xs ${sub} mb-3`}>Permanently delete all EverSite data from this device including chat history, vault, map markers, AI history, cached tiles, and settings.</p>
          <button onClick={clearAllData} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" /> Clear All Data
          </button>
        </div>
      </div>
    </div>
  );
}
