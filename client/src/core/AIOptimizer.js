// AI-Powered Peer Optimization Engine
// Intelligently decides which peers should host which content

class AIOptimizer {
  constructor() {
    this.peerMetrics = new Map();
    this.contentPriority = new Map();
    this.geolocationCache = new Map();
  }

  // Analyze peer quality based on multiple factors
  analyzePeer(peerId, metrics) {
    const score = this.calculatePeerScore(metrics);
    
    this.peerMetrics.set(peerId, {
      ...metrics,
      score,
      lastUpdated: Date.now()
    });

    return score;
  }

  calculatePeerScore(metrics) {
    const weights = {
      bandwidth: 0.3,      // Connection speed
      uptime: 0.25,        // How long they've been connected
      reliability: 0.2,    // Success rate of transfers
      storage: 0.15,       // Available storage space
      latency: 0.1         // Response time
    };

    let score = 0;
    
    // Bandwidth score (0-100)
    if (metrics.bandwidth) {
      score += (Math.min(metrics.bandwidth / 10, 100) / 100) * weights.bandwidth * 100;
    }

    // Uptime score (longer = better)
    if (metrics.uptime) {
      const uptimeMinutes = metrics.uptime / 60000;
      score += (Math.min(uptimeMinutes / 30, 1)) * weights.uptime * 100;
    }

    // Reliability score (success rate)
    if (metrics.successRate !== undefined) {
      score += metrics.successRate * weights.reliability * 100;
    }

    // Storage score
    if (metrics.availableStorage) {
      score += (Math.min(metrics.availableStorage / 100, 1)) * weights.storage * 100;
    }

    // Latency score (lower is better)
    if (metrics.latency) {
      const latencyScore = Math.max(0, 1 - (metrics.latency / 1000));
      score += latencyScore * weights.latency * 100;
    }

    return Math.round(score);
  }

  // Predict which peers should host which content
  optimizeContentDistribution(peers, contentChunks) {
    const distribution = new Map();

    // Sort peers by score
    const sortedPeers = Array.from(peers.entries())
      .map(([id, peer]) => ({
        id,
        ...peer,
        metrics: this.peerMetrics.get(id) || {}
      }))
      .sort((a, b) => (b.metrics.score || 0) - (a.metrics.score || 0));

    // Distribute content to top peers
    contentChunks.forEach((chunk, index) => {
      const targetPeers = [];
      
      // Replicate to top 3 peers for redundancy
      const replicationFactor = Math.min(3, sortedPeers.length);
      
      for (let i = 0; i < replicationFactor; i++) {
        const peer = sortedPeers[i];
        if (peer) {
          targetPeers.push(peer.id);
        }
      }

      distribution.set(chunk.id, {
        chunk,
        targetPeers,
        priority: this.calculateChunkPriority(chunk)
      });
    });

    return distribution;
  }

  calculateChunkPriority(chunk) {
    // Critical files get higher priority
    const criticalFiles = ['index.html', 'app.js', 'main.css'];
    
    if (criticalFiles.some(file => chunk.id.includes(file))) {
      return 'high';
    }
    
    if (chunk.id.includes('.js') || chunk.id.includes('.css')) {
      return 'medium';
    }
    
    return 'low';
  }

  // Predict traffic patterns
  predictTraffic(historicalData) {
    if (!historicalData || historicalData.length < 2) {
      return { trend: 'stable', confidence: 0 };
    }

    // Simple moving average
    const recentData = historicalData.slice(-10);
    const average = recentData.reduce((sum, val) => sum + val, 0) / recentData.length;
    const latest = recentData[recentData.length - 1];

    const change = ((latest - average) / average) * 100;

    let trend = 'stable';
    if (change > 20) trend = 'increasing';
    if (change < -20) trend = 'decreasing';

    return {
      trend,
      change: Math.round(change),
      confidence: Math.min(recentData.length / 10, 1)
    };
  }

  // Geographic optimization
  async optimizeByGeolocation(peers) {
    const geoGroups = new Map();

    for (const [peerId, peer] of peers) {
      // Estimate location based on latency patterns
      const location = await this.estimateLocation(peerId, peer);
      
      if (!geoGroups.has(location)) {
        geoGroups.set(location, []);
      }
      
      geoGroups.get(location).push(peerId);
    }

    return geoGroups;
  }

  async estimateLocation(peerId, peer) {
    // Simple geolocation estimation based on latency
    // In production, use actual geolocation API
    
    if (this.geolocationCache.has(peerId)) {
      return this.geolocationCache.get(peerId);
    }

    const latency = peer.latency || 100;
    
    let region = 'unknown';
    if (latency < 50) region = 'local';
    else if (latency < 150) region = 'regional';
    else region = 'distant';

    this.geolocationCache.set(peerId, region);
    return region;
  }

  // Auto-scaling: Add/remove replicas based on demand
  autoScale(currentLoad, peerCount) {
    const optimalReplicas = Math.ceil(currentLoad / 100);
    const maxReplicas = Math.min(peerCount, 10);
    
    return {
      recommended: Math.min(optimalReplicas, maxReplicas),
      current: peerCount,
      action: optimalReplicas > peerCount ? 'scale_up' : 
              optimalReplicas < peerCount ? 'scale_down' : 'maintain'
    };
  }

  // Remove unnecessary copies to save bandwidth
  pruneRedundantCopies(distribution, minReplicas = 2) {
    const pruned = new Map();

    for (const [chunkId, data] of distribution) {
      const { targetPeers, priority } = data;
      
      // Keep more copies of high-priority content
      const optimalReplicas = priority === 'high' ? 3 : 
                             priority === 'medium' ? 2 : 
                             minReplicas;

      pruned.set(chunkId, {
        ...data,
        targetPeers: targetPeers.slice(0, optimalReplicas)
      });
    }

    return pruned;
  }

  // Generate optimization report
  generateReport() {
    const peers = Array.from(this.peerMetrics.entries());
    const totalPeers = peers.length;
    const avgScore = peers.reduce((sum, [_, p]) => sum + (p.score || 0), 0) / totalPeers || 0;

    const topPeers = peers
      .sort((a, b) => (b[1].score || 0) - (a[1].score || 0))
      .slice(0, 5)
      .map(([id, metrics]) => ({
        id: id.slice(0, 8),
        score: metrics.score
      }));

    return {
      totalPeers,
      averageScore: Math.round(avgScore),
      topPeers,
      timestamp: new Date().toISOString()
    };
  }
}

export default new AIOptimizer();
