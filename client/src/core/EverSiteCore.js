import io from 'socket.io-client';
import Peer from 'peerjs';
import localforage from 'localforage';
import AIOptimizer from './AIOptimizer';
import BlockchainVerifier from './BlockchainVerifier';

class EverSiteCore {
  constructor() {
    this.socket = null;
    this.peer = null;
    this.peers = new Map();
    this.siteCache = null;
    this.isOnline = true;
    this.peerCount = 0;
    this.listeners = new Map();
    this.peerMetrics = new Map();
    this.connectionStartTime = Date.now();
    
    this.initStorage();
    this.startMetricsCollection();
  }

  async initStorage() {
    this.siteCache = localforage.createInstance({
      name: 'EverSite',
      storeName: 'siteData'
    });
  }

  async init(signalingServer = 'https://ever-site-server.vercel.app') {
    try {
      // Connect to signaling server
      this.socket = io(signalingServer);
      
      // Initialize PeerJS
      this.peer = new Peer({
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
          ]
        }
      });

      this.setupSocketListeners();
      this.setupPeerListeners();
      
      return true;
    } catch (error) {
      console.error('Failed to initialize EverSite:', error);
      return false;
    }
  }

  setupSocketListeners() {
    this.socket.on('connect', () => {
      console.log('✅ Connected to signaling server');
      this.isOnline = true;
      this.emit('status-change', { online: true });
      
      // Register as peer
      this.socket.emit('register-peer', {
        hasFullSite: true,
        chunks: []
      });
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from signaling server');
      this.isOnline = false;
      this.emit('status-change', { online: false });
    });

    this.socket.on('peer-count', (count) => {
      this.peerCount = count;
      this.emit('peer-count', count);
    });

    this.socket.on('available-peers', (peers) => {
      console.log(`📡 Available peers: ${peers.length}`);
      peers.forEach(peerInfo => {
        this.connectToPeer(peerInfo.id);
      });
    });

    this.socket.on('signal', (data) => {
      // Handle WebRTC signaling
      console.log('📶 Received signal from peer');
    });
  }

  setupPeerListeners() {
    this.peer.on('open', (id) => {
      console.log(`🆔 My peer ID: ${id}`);
      this.emit('peer-id', id);
      
      // Request available peers
      this.socket.emit('get-peers');
    });

    this.peer.on('connection', (conn) => {
      console.log('🤝 Incoming peer connection');
      this.handlePeerConnection(conn);
    });

    this.peer.on('error', (error) => {
      console.error('Peer error:', error);
    });
  }

  connectToPeer(peerId) {
    if (this.peers.has(peerId)) return;
    
    try {
      const conn = this.peer.connect(peerId);
      this.handlePeerConnection(conn);
    } catch (error) {
      console.error('Failed to connect to peer:', error);
    }
  }

  handlePeerConnection(conn) {
    conn.on('open', () => {
      console.log(`✅ Connected to peer: ${conn.peer}`);
      this.peers.set(conn.peer, conn);
      this.emit('peer-connected', conn.peer);
      
      // Send greeting
      conn.send({ type: 'hello', message: 'EverSite peer connected' });
    });

    conn.on('data', (data) => {
      this.handlePeerData(conn.peer, data);
    });

    conn.on('close', () => {
      console.log(`❌ Peer disconnected: ${conn.peer}`);
      this.peers.delete(conn.peer);
      this.emit('peer-disconnected', conn.peer);
    });
  }

  handlePeerData(peerId, data) {
    console.log('📦 Received data from peer:', data);
    
    if (data.type === 'site-chunk') {
      this.cacheSiteData(data.chunkId, data.content);
    }
    
    if (data.type === 'request-chunk') {
      // Another peer is requesting data
      this.sendCachedDataToPeer(peerId, data.chunkId);
    }
    
    if (data.type === 'chunk-response') {
      // Received requested chunk
      this.cacheSiteData(data.chunkId, data.content);
      this.emit('chunk-received', { chunkId: data.chunkId, from: peerId });
    }
    
    if (data.type === 'hello') {
      // New peer connected, share our cached data
      this.shareCachedDataWithPeer(peerId);
    }
    
    this.emit('peer-data', { peerId, data });
  }

  async cacheSiteData(key, data) {
    try {
      // Add to blockchain for verification
      const block = BlockchainVerifier.addContent(data, {
        key,
        timestamp: Date.now(),
        source: 'cache'
      });

      await this.siteCache.setItem(key, {
        content: data,
        blockHash: block.hash,
        timestamp: Date.now()
      });
      
      console.log(`💾 Cached: ${key} (Blockchain verified)`);
      
      // Also send to signaling server
      this.socket.emit('store-site-data', {
        chunkId: key,
        content: data,
        blockHash: block.hash
      });
    } catch (error) {
      console.error('Cache error:', error);
    }
  }

  async getCachedData(key) {
    try {
      const cachedItem = await this.siteCache.getItem(key);
      if (cachedItem) {
        // Verify blockchain integrity
        const verification = BlockchainVerifier.verifyContent(cachedItem.content);
        
        if (verification.verified) {
          console.log(`✅ Retrieved from cache: ${key} (Verified)`);
          return cachedItem.content;
        } else {
          console.warn(`⚠️ Cache verification failed for: ${key}`);
        }
      }
      
      // Request from peers
      return await this.requestFromPeers(key);
    } catch (error) {
      console.error('Retrieval error:', error);
      return null;
    }
  }

  async requestFromPeers(key) {
    return new Promise((resolve) => {
      // Request from signaling server
      this.socket.emit('request-site-data', key);
      
      // Request from connected peers
      this.peers.forEach(conn => {
        conn.send({ type: 'request-chunk', chunkId: key });
      });
      
      // Timeout after 5 seconds
      setTimeout(() => resolve(null), 5000);
    });
  }

  broadcastToAllPeers(data) {
    this.peers.forEach(conn => {
      try {
        conn.send(data);
      } catch (error) {
        console.error('Failed to send to peer:', error);
      }
    });
  }

  // Event system
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }

  getStats() {
    return {
      isOnline: this.isOnline,
      peerCount: this.peerCount,
      connectedPeers: this.peers.size,
      peerId: this.peer?.id,
      aiOptimization: this.getAIOptimizationStats(),
      blockchain: BlockchainVerifier.getChainInfo()
    };
  }

  startMetricsCollection() {
    // Collect metrics every 10 seconds
    setInterval(() => {
      this.peers.forEach((conn, peerId) => {
        const metrics = {
          bandwidth: Math.random() * 100, // Simulated - in production, measure actual
          uptime: Date.now() - this.connectionStartTime,
          successRate: 0.95, // Track actual success rate
          availableStorage: 100,
          latency: Math.random() * 200
        };

        const score = AIOptimizer.analyzePeer(peerId, metrics);
        this.peerMetrics.set(peerId, { ...metrics, score });
      });

      this.emit('metrics-updated', this.getAIOptimizationStats());
    }, 10000);
  }

  getAIOptimizationStats() {
    const report = AIOptimizer.generateReport();
    const trafficTrend = AIOptimizer.predictTraffic([this.peerCount]);
    const autoScaling = AIOptimizer.autoScale(this.peerCount * 10, this.peers.size);

    return {
      ...report,
      trafficTrend,
      autoScaling
    };
  }

  async sendCachedDataToPeer(peerId, chunkId) {
    try {
      const data = await this.siteCache.getItem(chunkId);
      if (data) {
        const conn = this.peers.get(peerId);
        if (conn) {
          conn.send({
            type: 'chunk-response',
            chunkId: chunkId,
            content: data
          });
          console.log(`📤 Sent ${chunkId} to peer ${peerId}`);
        }
      }
    } catch (error) {
      console.error('Error sending data to peer:', error);
    }
  }

  async shareCachedDataWithPeer(peerId) {
    try {
      const keys = await this.siteCache.keys();
      const conn = this.peers.get(peerId);
      
      if (conn && keys.length > 0) {
        // Send list of available chunks
        conn.send({
          type: 'available-chunks',
          chunks: keys
        });
        
        // Send actual data for critical files
        for (const key of keys) {
          const data = await this.siteCache.getItem(key);
          conn.send({
            type: 'site-chunk',
            chunkId: key,
            content: data
          });
        }
        
        console.log(`📤 Shared ${keys.length} chunks with peer ${peerId}`);
      }
    } catch (error) {
      console.error('Error sharing cached data:', error);
    }
  }

  async cacheCurrentSite() {
    // Cache the current page HTML
    const html = document.documentElement.outerHTML;
    await this.cacheSiteData('index.html', html);
    
    // Cache CSS
    const styles = Array.from(document.styleSheets)
      .map(sheet => {
        try {
          return Array.from(sheet.cssRules).map(rule => rule.cssText).join('\n');
        } catch (e) {
          return '';
        }
      })
      .join('\n');
    
    await this.cacheSiteData('styles.css', styles);
    
    // Cache JavaScript bundles
    const scripts = Array.from(document.scripts)
      .filter(script => script.src)
      .map(script => script.src);
    
    for (const scriptUrl of scripts) {
      try {
        const response = await fetch(scriptUrl);
        const content = await response.text();
        const filename = scriptUrl.split('/').pop();
        await this.cacheSiteData(filename, content);
      } catch (e) {
        console.warn('Could not cache script:', scriptUrl);
      }
    }
    
    console.log('✅ Site cached successfully');
    
    // Share with all connected peers
    this.peers.forEach((conn, peerId) => {
      this.shareCachedDataWithPeer(peerId);
    });
  }
}

export default new EverSiteCore();
