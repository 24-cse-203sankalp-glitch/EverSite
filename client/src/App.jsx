import { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import P2PChat from './components/P2PChat';
import ToastNotification from './components/ToastNotification';
import HomePage from './pages/HomePage';
import WikiPage from './pages/WikiPage';
import MedicalPage from './pages/MedicalPage';
import TechnicalPage from './pages/TechnicalPage';
import EmergencyPage from './pages/EmergencyPage';
import ResourcesPage from './pages/ResourcesPage';
import LegalPage from './pages/LegalPage';
import VideosPage from './pages/VideosPage';
import IPFSPage from './pages/IPFSPage';
import EverSiteCore from './core/EverSiteCore';
import P2PLoader from './core/P2PLoader';
import IPFSManager from './core/IPFSManager';

function App() {
  const [networkStatus, setNetworkStatus] = useState({
    isOnline: false,
    peerCount: 0,
    connectedPeers: 0,
    peerId: null,
    ipfsHash: null
  });
  const [notifications, setNotifications] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    initEverSite();
    registerServiceWorker();
    setupP2PListener();
    initIPFS();
    
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme) {
      setDarkMode(savedTheme === 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#000000';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '';
    }
  }, [darkMode]);

  const setupP2PListener = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', async (event) => {
        if (event.data && event.data.type === 'FETCH_FROM_P2P') {
          try {
            const content = await P2PLoader.loadFromPeers(event.data.url);
            
            if (content && navigator.serviceWorker.controller) {
              navigator.serviceWorker.controller.postMessage({
                type: 'P2P_CONTENT',
                url: event.data.url,
                content: content
              });
              
              addNotification('download', 'P2P Success', 'Loaded from peers');
            }
          } catch (error) {
            console.error('Failed to load from P2P:', error);
            addNotification('error', 'P2P Failed', 'Could not load from peers');
          }
        }
      });
    }
  };

  const addNotification = (type, title, message) => {
    // Notifications disabled
  };

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const initEverSite = async () => {
    const success = await EverSiteCore.init();
    
    if (success) {
      EverSiteCore.on('status-change', (data) => {
        setNetworkStatus(prev => ({ ...prev, isOnline: data.online }));
      });

      EverSiteCore.on('peer-count', (count) => {
        setNetworkStatus(prev => ({ ...prev, peerCount: count }));
      });

      EverSiteCore.on('peer-connected', () => {
        const stats = EverSiteCore.getStats();
        setNetworkStatus(prev => ({ ...prev, connectedPeers: stats.connectedPeers }));
      });

      EverSiteCore.on('peer-disconnected', () => {
        const stats = EverSiteCore.getStats();
        setNetworkStatus(prev => ({ ...prev, connectedPeers: stats.connectedPeers }));
      });

      EverSiteCore.on('peer-id', (id) => {
        setNetworkStatus(prev => ({ ...prev, peerId: id }));
      });

      EverSiteCore.on('chunk-received', () => {});
    }
    
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('Service Worker registered:', registration);
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  };

  const initIPFS = async () => {
    await IPFSManager.init();
    const hash = IPFSManager.getSiteHash();
    if (hash) {
      setNetworkStatus(prev => ({ ...prev, ipfsHash: hash }));
    }
  };

  const handleCacheSite = async () => {
    await EverSiteCore.cacheCurrentSite();
    
    const result = await IPFSManager.uploadSite();
    if (result.success) {
      setNetworkStatus(prev => ({ ...prev, ipfsHash: result.hash }));
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return <HomePage darkMode={darkMode} onNavigate={setActiveSection} />;
      case 'wiki':
        return <WikiPage darkMode={darkMode} />;
      case 'medical':
        return <MedicalPage darkMode={darkMode} />;
      case 'technical':
        return <TechnicalPage darkMode={darkMode} />;
      case 'emergency':
        return <EmergencyPage darkMode={darkMode} />;
      case 'resources':
        return <ResourcesPage darkMode={darkMode} />;
      case 'legal':
        return <LegalPage darkMode={darkMode} />;
      case 'videos':
        return <VideosPage darkMode={darkMode} />;
      case 'ipfs':
        return <IPFSPage darkMode={darkMode} />;
      default:
        return <HomePage darkMode={darkMode} onNavigate={setActiveSection} />;
    }
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors">
        <ToastNotification notifications={notifications} onDismiss={dismissNotification} darkMode={darkMode} />
        <P2PChat 
          isOpen={isChatOpen} 
          onClose={() => setIsChatOpen(false)}
          connectedPeers={networkStatus.connectedPeers}
          darkMode={darkMode}
        />

        <Header 
          networkStatus={networkStatus}
          onCacheSite={handleCacheSite}
          onRefresh={handleRefresh}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          onNavigateHome={() => setActiveSection('home')}
        />

        <div className="flex">
          <Sidebar 
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            onOpenChat={() => setIsChatOpen(true)}
            darkMode={darkMode}
          />

          <main className="flex-1 p-8 dark:bg-black">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
