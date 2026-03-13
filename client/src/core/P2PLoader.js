import EverSiteCore from './EverSiteCore';

class P2PLoader {
  constructor() {
    this.loadAttempts = 0;
    this.maxAttempts = 3;
  }

  async loadFromPeers(resourcePath) {
    console.log(`🔍 Attempting to load ${resourcePath} from peers...`);
    
    // First check local cache
    const cached = await EverSiteCore.getCachedData(resourcePath);
    if (cached) {
      console.log(`✅ Found ${resourcePath} in local cache`);
      return cached;
    }

    // Request from all connected peers
    return new Promise((resolve, reject) => {
      let resolved = false;
      const timeout = setTimeout(() => {
        if (!resolved) {
          reject(new Error('Timeout: No peers responded'));
        }
      }, 10000);

      // Listen for chunk received
      const handler = (data) => {
        if (data.chunkId === resourcePath && !resolved) {
          resolved = true;
          clearTimeout(timeout);
          EverSiteCore.off('chunk-received', handler);
          resolve(data.content);
        }
      };

      EverSiteCore.on('chunk-received', handler);

      // Request from all peers
      EverSiteCore.broadcastToAllPeers({
        type: 'request-chunk',
        chunkId: resourcePath
      });

      // Also request from signaling server
      if (EverSiteCore.socket && EverSiteCore.socket.connected) {
        EverSiteCore.socket.emit('request-site-data', resourcePath);
      }
    });
  }

  async reconstructSite() {
    console.log('🔄 Reconstructing site from peer network...');
    
    try {
      // Try to load main HTML
      const html = await this.loadFromPeers('index.html');
      
      if (html) {
        console.log('✅ Successfully reconstructed site from peers!');
        return html;
      }
    } catch (error) {
      console.error('❌ Failed to reconstruct from peers:', error);
    }

    return null;
  }

  async ensureResourceAvailable(resourcePath) {
    try {
      // Try normal fetch first
      const response = await fetch(resourcePath);
      if (response.ok) {
        return await response.text();
      }
    } catch (error) {
      console.log(`⚠️ Server unavailable, loading ${resourcePath} from peers...`);
    }

    // Fallback to P2P
    return await this.loadFromPeers(resourcePath);
  }
}

export default new P2PLoader();
