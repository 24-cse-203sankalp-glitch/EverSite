import React from 'react';
import { Shield, Wifi, WifiOff, Users, Database, Moon, Sun, ExternalLink, HardDrive, Upload, Loader, Search, Settings } from 'lucide-react';
import NotificationCenter from './NotificationCenter';

export default function Header({ networkStatus, onCacheSite, onIPFSUpload, onRefresh, darkMode, onToggleDarkMode, onNavigateHome, onOpenSearch, onOpenSettings, notifications, onMarkAllRead, onClearNotifs, onRemoveNotif }) {
  const [fakeOnline, setFakeOnline] = React.useState(null);
  const [caching, setCaching] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const displayOnline = fakeOnline !== null ? fakeOnline : networkStatus.isOnline;

  const handleCache = async () => {
    setCaching(true);
    try { await onCacheSite(); } finally { setCaching(false); }
  };

  const handleIPFS = async () => {
    setUploading(true);
    try { await onIPFSUpload(); } finally { setUploading(false); }
  };
  return (
    <header className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <button onClick={onNavigateHome} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">EverSite</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Decentralized Information Network</p>
            </div>
          </button>

          <div className="flex items-center gap-4">
            <div className="card dark:bg-gray-900 dark:border-gray-800 px-4 py-2.5">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => setFakeOnline(fakeOnline === null ? !networkStatus.isOnline : fakeOnline === networkStatus.isOnline ? !fakeOnline : null)} title="Click to toggle display">
                  {displayOnline ? (
                    <Wifi className="w-4 h-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-600 dark:text-red-400" />
                  )}
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Server</p>
                    <p className={`text-sm font-semibold ${
                      displayOnline ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {displayOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>

                <div className="w-px h-8 bg-gray-200 dark:bg-gray-800"></div>

                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Network</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {networkStatus.peerCount} Peers
                    </p>
                  </div>
                </div>

                <div className="w-px h-8 bg-gray-200 dark:bg-gray-800"></div>

                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Connected</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {networkStatus.connectedPeers}
                    </p>
                  </div>
                </div>

                {networkStatus.ipfsHash && (
                  <>
                    <div className="w-px h-8 bg-gray-200 dark:bg-gray-800"></div>
                    <a
                      href={`https://ipfs.io/ipfs/${networkStatus.ipfsHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      title="View on IPFS"
                    >
                      <Database className="w-4 h-4" />
                      <span>IPFS</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Search */}
              <button
                onClick={onOpenSearch}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border transition-colors ${darkMode ? 'border-gray-700 text-gray-400 hover:bg-gray-800' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                title="Search (Ctrl+K)"
              >
                <Search className="w-4 h-4" />
                <span className="text-xs hidden sm:inline">Search</span>
                <kbd className={`text-[10px] px-1 py-0.5 rounded border font-mono hidden sm:inline ${darkMode ? 'border-gray-600 text-gray-500' : 'border-gray-300 text-gray-400'}`}>Ctrl K</kbd>
              </button>
              <NotificationCenter darkMode={darkMode} notifications={notifications || []} onMarkAllRead={onMarkAllRead} onClear={onClearNotifs} onRemove={onRemoveNotif} />
              <button onClick={onToggleDarkMode} className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`} title="Toggle dark mode">
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button onClick={handleCache} disabled={caching} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors disabled:opacity-50 ${darkMode ? 'border-gray-700 text-gray-400 hover:bg-gray-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`} title="Cache site locally">
                {caching ? <Loader className="w-4 h-4 animate-spin" /> : <HardDrive className="w-4 h-4" />}
                <span className="hidden sm:inline">{caching ? 'Caching...' : 'Cache'}</span>
              </button>
              <button onClick={handleIPFS} disabled={uploading} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors disabled:opacity-50 ${darkMode ? 'border-gray-700 text-gray-400 hover:bg-gray-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`} title="Upload to IPFS">
                {uploading ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <span className="hidden sm:inline">{uploading ? 'Uploading...' : 'IPFS'}</span>
              </button>
              <button onClick={onOpenSettings} className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`} title="Settings">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
