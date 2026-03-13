import { motion } from 'framer-motion';
import { Power, RefreshCw, Download } from 'lucide-react';

export default function DemoControls({ onCacheSite, onRefresh, serverOnline }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <h3 className="text-xl font-semibold mb-4">Demo Controls</h3>
      <div className="flex gap-4">
        <button
          onClick={onCacheSite}
          className="btn-primary flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          Cache Site
        </button>

        <button
          onClick={onRefresh}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          Refresh Page
        </button>

        <div className="flex items-center gap-2 px-6 py-3 bg-white/5 rounded-lg">
          <Power className={`w-5 h-5 ${serverOnline ? 'text-green-400' : 'text-red-400'}`} />
          <span className="text-sm">
            Server: <span className={serverOnline ? 'text-green-400' : 'text-red-400'}>
              {serverOnline ? 'ON' : 'OFF'}
            </span>
          </span>
        </div>
      </div>

      <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-sm text-blue-300">
          💡 <strong>Demo Tip:</strong> Click "Cache Site", then stop the signaling server to simulate an outage. 
          The site will continue working through peer connections!
        </p>
      </div>
    </motion.div>
  );
}
