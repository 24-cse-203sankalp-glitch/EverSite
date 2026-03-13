import { Shield, Wifi, WifiOff, Users, Database, Moon, Sun } from 'lucide-react';

export default function Header({ networkStatus, onCacheSite, onRefresh, darkMode, onToggleDarkMode, onNavigateHome }) {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors">
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
            <div className="card dark:bg-gray-700 dark:border-gray-600 px-4 py-2.5">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  {networkStatus.isOnline ? (
                    <Wifi className="w-4 h-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-600 dark:text-red-400" />
                  )}
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Server</p>
                    <p className={`text-sm font-semibold ${
                      networkStatus.isOnline ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {networkStatus.isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>

                <div className="w-px h-8 bg-gray-200 dark:bg-gray-600"></div>

                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Network</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {networkStatus.peerCount} Peers
                    </p>
                  </div>
                </div>

                <div className="w-px h-8 bg-gray-200 dark:bg-gray-600"></div>

                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Connected</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {networkStatus.connectedPeers}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onToggleDarkMode}
                className="btn-secondary text-sm px-3"
                title="Toggle dark mode"
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                onClick={onCacheSite}
                className="btn-secondary text-sm"
                title="Cache site"
              >
                Cache
              </button>
              <button
                onClick={onRefresh}
                className="btn-secondary text-sm"
                title="Refresh"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
