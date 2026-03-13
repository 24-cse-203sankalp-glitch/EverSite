import { motion } from 'framer-motion';
import { Shield, Zap, Globe } from 'lucide-react';

export default function Hero() {
  return (
    <div className="text-center space-y-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
          EverSite
        </h1>
        <p className="text-2xl text-gray-300 mt-4">The Website That Never Dies</p>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-lg text-gray-400 max-w-2xl mx-auto"
      >
        A decentralized, self-sustaining website that stays online even when servers go down.
        Every visitor becomes a host, creating an unstoppable network.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
      >
        <div className="glass-card p-6 hover:scale-105 transition-transform">
          <Shield className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Disaster Resilient</h3>
          <p className="text-gray-400">Stays accessible during outages and emergencies</p>
        </div>

        <div className="glass-card p-6 hover:scale-105 transition-transform">
          <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Self-Healing</h3>
          <p className="text-gray-400">Automatically reconstructs from distributed pieces</p>
        </div>

        <div className="glass-card p-6 hover:scale-105 transition-transform">
          <Globe className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Peer-Powered</h3>
          <p className="text-gray-400">Every visitor contributes to the network</p>
        </div>
      </motion.div>
    </div>
  );
}
