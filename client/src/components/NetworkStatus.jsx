import { motion } from 'framer-motion';
import { Wifi, WifiOff, Users } from 'lucide-react';

export default function NetworkStatus({ isOnline, peerCount, connectedPeers }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="w-6 h-6 text-green-400" />
            ) : (
              <WifiOff className="w-6 h-6 text-red-400" />
            )}
            <div>
              <p className="text-sm text-gray-300">Server Status</p>
              <p className={`font-semibold ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>

          <div className="h-12 w-px bg-white/20"></div>

          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-400" />
            <div>
              <p className="text-sm text-gray-300">Network Peers</p>
              <p className="font-semibold text-cyan-400">{peerCount} Active</p>
            </div>
          </div>

          <div className="h-12 w-px bg-white/20"></div>

          <div className="flex items-center gap-2">
            <div className={isOnline ? 'status-online' : 'status-offline'}></div>
            <div>
              <p className="text-sm text-gray-300">Connected To</p>
              <p className="font-semibold text-blue-400">{connectedPeers} Peers</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
