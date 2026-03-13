import { motion } from 'framer-motion';
import { Brain, TrendingUp, Zap, Shield, Activity } from 'lucide-react';

export default function AIOptimizationDashboard({ optimizationData }) {
  const { totalPeers, averageScore, topPeers, trafficTrend, autoScaling } = optimizationData || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <Brain className="w-8 h-8 text-purple-400" />
        <div>
          <h3 className="text-2xl font-semibold">AI Optimization Engine</h3>
          <p className="text-sm text-gray-400">Intelligent peer and content distribution</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Network Health */}
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-green-400" />
            <p className="text-sm text-gray-400">Network Health</p>
          </div>
          <p className="text-3xl font-bold text-green-400">{averageScore || 0}%</p>
          <p className="text-xs text-gray-500 mt-1">Average peer score</p>
        </div>

        {/* Traffic Trend */}
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-4 border border-blue-500/30">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <p className="text-sm text-gray-400">Traffic Trend</p>
          </div>
          <p className="text-3xl font-bold text-blue-400 capitalize">
            {trafficTrend?.trend || 'Stable'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {trafficTrend?.change > 0 ? '+' : ''}{trafficTrend?.change || 0}% change
          </p>
        </div>

        {/* Auto Scaling */}
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-purple-400" />
            <p className="text-sm text-gray-400">Auto Scaling</p>
          </div>
          <p className="text-3xl font-bold text-purple-400 capitalize">
            {autoScaling?.action?.replace('_', ' ') || 'Maintain'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {autoScaling?.recommended || 0} replicas recommended
          </p>
        </div>

        {/* Active Optimizations */}
        <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl p-4 border border-orange-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-orange-400" />
            <p className="text-sm text-gray-400">Optimizations</p>
          </div>
          <p className="text-3xl font-bold text-orange-400">Active</p>
          <p className="text-xs text-gray-500 mt-1">Real-time adjustments</p>
        </div>
      </div>

      {/* Top Performing Peers */}
      <div className="bg-white/5 rounded-xl p-4">
        <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          Top Performing Peers
        </h4>
        <div className="space-y-2">
          {topPeers && topPeers.length > 0 ? (
            topPeers.map((peer, index) => (
              <div
                key={peer.id}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                    index === 1 ? 'bg-gray-400/20 text-gray-300' :
                    index === 2 ? 'bg-orange-500/20 text-orange-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-mono text-sm">Peer {peer.id}</p>
                    <p className="text-xs text-gray-500">Optimized for hosting</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-purple-400">{peer.score}</p>
                  <p className="text-xs text-gray-500">score</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">
              Collecting peer metrics...
            </p>
          )}
        </div>
      </div>

      {/* AI Features */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/30">
          <h5 className="font-semibold mb-2 text-purple-400">🎯 Smart Replication</h5>
          <p className="text-sm text-gray-400">
            AI automatically replicates content to peers with best connectivity
          </p>
        </div>
        <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/30">
          <h5 className="font-semibold mb-2 text-blue-400">📊 Traffic Prediction</h5>
          <p className="text-sm text-gray-400">
            Predicts load patterns and pre-distributes content
          </p>
        </div>
        <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/30">
          <h5 className="font-semibold mb-2 text-green-400">⚡ Auto Scaling</h5>
          <p className="text-sm text-gray-400">
            Dynamically adjusts replicas based on demand
          </p>
        </div>
      </div>
    </motion.div>
  );
}
