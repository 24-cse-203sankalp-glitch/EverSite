import { motion } from 'framer-motion';
import { Activity, Download, Upload, Users } from 'lucide-react';

export default function P2PVisualizer({ peerCount, connectedPeers, isOnline }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-semibold flex items-center gap-2">
          <Activity className="w-6 h-6 text-cyan-400" />
          P2P Network Status
        </h3>
        <div className={`px-4 py-2 rounded-full ${isOnline ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {isOnline ? '🟢 Server Online' : '🔴 Server Offline'}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Total Network Peers */}
        <div className="text-center p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/30">
          <Users className="w-12 h-12 text-blue-400 mx-auto mb-3" />
          <p className="text-4xl font-bold text-blue-400">{peerCount}</p>
          <p className="text-sm text-gray-400 mt-2">Total Network Peers</p>
        </div>

        {/* Your Connections */}
        <div className="text-center p-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/30">
          <Download className="w-12 h-12 text-cyan-400 mx-auto mb-3" />
          <p className="text-4xl font-bold text-cyan-400">{connectedPeers}</p>
          <p className="text-sm text-gray-400 mt-2">Your Connections</p>
        </div>

        {/* Data Sharing */}
        <div className="text-center p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/30">
          <Upload className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <p className="text-4xl font-bold text-green-400">
            {connectedPeers > 0 ? 'Active' : 'Waiting'}
          </p>
          <p className="text-sm text-gray-400 mt-2">Sharing Status</p>
        </div>
      </div>

      {/* Visual Network Representation */}
      <div className="mt-8 relative h-32 flex items-center justify-center">
        {/* Center Node (You) */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute z-10 w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/50"
        >
          <span className="text-white font-bold">YOU</span>
        </motion.div>

        {/* Connected Peers */}
        {Array.from({ length: Math.min(connectedPeers, 6) }).map((_, i) => {
          const angle = (i * 360) / Math.min(connectedPeers, 6);
          const radius = 80;
          const x = Math.cos((angle * Math.PI) / 180) * radius;
          const y = Math.sin((angle * Math.PI) / 180) * radius;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="absolute w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg"
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <Users className="w-5 h-5 text-white" />
            </motion.div>
          );
        })}

        {/* Connection Lines */}
        {Array.from({ length: Math.min(connectedPeers, 6) }).map((_, i) => {
          const angle = (i * 360) / Math.min(connectedPeers, 6);
          const rotation = angle;

          return (
            <motion.div
              key={`line-${i}`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: i * 0.1 }}
              className="absolute h-0.5 bg-gradient-to-r from-cyan-400/50 to-purple-400/50 origin-left"
              style={{
                width: '80px',
                left: '50%',
                top: '50%',
                transform: `rotate(${rotation}deg)`,
                transformOrigin: 'left center'
              }}
            />
          );
        })}
      </div>

      {/* Status Message */}
      <div className="mt-6 text-center">
        {connectedPeers === 0 && (
          <p className="text-gray-400">
            ⏳ Waiting for peers to connect...
          </p>
        )}
        {connectedPeers > 0 && isOnline && (
          <p className="text-green-400">
            ✅ Connected to {connectedPeers} peer{connectedPeers > 1 ? 's' : ''} - Ready to share!
          </p>
        )}
        {connectedPeers > 0 && !isOnline && (
          <p className="text-cyan-400">
            🚀 Server offline - Running on P2P network with {connectedPeers} peer{connectedPeers > 1 ? 's' : ''}!
          </p>
        )}
      </div>
    </motion.div>
  );
}
