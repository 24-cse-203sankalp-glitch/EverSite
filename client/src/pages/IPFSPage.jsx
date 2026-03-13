import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Copy, Database, CheckCircle, Globe, Shield } from 'lucide-react';

export default function IPFSPage({ darkMode }) {
  const [ipfsHash, setIpfsHash] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const hash = localStorage.getItem('eversite-ipfs-hash');
    if (hash) {
      setIpfsHash(hash);
    }
  }, []);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const ipfsGateways = [
    { name: 'IPFS.io', url: `https://ipfs.io/ipfs/${ipfsHash}` },
    { name: 'Cloudflare', url: `https://cloudflare-ipfs.com/ipfs/${ipfsHash}` },
    { name: 'Dweb.link', url: `https://dweb.link/ipfs/${ipfsHash}` },
    { name: 'Pinata', url: `https://gateway.pinata.cloud/ipfs/${ipfsHash}` }
  ];

  if (!ipfsHash) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className={`text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            IPFS Access
          </h1>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            Decentralized hosting via InterPlanetary File System
          </p>
        </div>

        <div className={`card ${darkMode ? 'bg-gray-800 border-gray-700' : ''} p-12 text-center`}>
          <Database className={`w-20 h-20 mx-auto mb-6 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
          <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Site Not Uploaded to IPFS Yet
          </h2>
          <p className={`text-lg mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Click the "Upload to IPFS" button in the header to deploy this site to the decentralized IPFS network.
          </p>
          <div className={`max-w-2xl mx-auto text-left space-y-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold mb-1">Censorship Resistant</p>
                <p className="text-sm">Once uploaded, the site cannot be taken down or blocked</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold mb-1">Always Available</p>
                <p className="text-sm">Distributed across thousands of nodes worldwide</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Database className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold mb-1">No Single Point of Failure</p>
                <p className="text-sm">Works even if the original server goes offline</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className={`text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          IPFS Access
        </h1>
        <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
          Your site is live on the decentralized IPFS network
        </p>
      </div>

      <div className={`card ${darkMode ? 'bg-gray-800 border-gray-700' : ''} p-6 mb-6`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Successfully Deployed to IPFS
            </h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Your site is now distributed across the global IPFS network
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2 block`}>
              IPFS Hash (CID)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={ipfsHash}
                readOnly
                className={`flex-1 px-4 py-3 rounded-lg font-mono text-sm ${
                  darkMode 
                    ? 'bg-gray-900 border-gray-700 text-white' 
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                } border`}
              />
              <button
                onClick={() => copyToClipboard(ipfsHash)}
                className="btn-secondary px-4"
                title="Copy hash"
              >
                {copied ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Access via IPFS Gateways
        </h3>
        <p className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Click any gateway below to access your site through different IPFS providers
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ipfsGateways.map((gateway) => (
          <motion.a
            key={gateway.name}
            href={gateway.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`card ${darkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'hover:bg-gray-50'} p-6 transition-colors group`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {gateway.name}
                  </h4>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} truncate max-w-xs`}>
                    {gateway.url}
                  </p>
                </div>
              </div>
              <ExternalLink className={`w-5 h-5 ${darkMode ? 'text-gray-500 group-hover:text-blue-400' : 'text-gray-400 group-hover:text-blue-600'} transition-colors`} />
            </div>
          </motion.a>
        ))}
      </div>

      <div className={`card ${darkMode ? 'bg-gray-800 border-gray-700' : ''} p-6 mt-6`}>
        <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          What is IPFS?
        </h3>
        <div className={`space-y-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <p>
            IPFS (InterPlanetary File System) is a peer-to-peer hypermedia protocol designed to make the web faster, safer, and more open.
          </p>
          <p>
            Your site is now stored across thousands of nodes worldwide. Even if the original server goes down, your site remains accessible through the IPFS network.
          </p>
          <p className="font-semibold text-blue-600 dark:text-blue-400">
            Share any of the gateway links above with users for permanent, decentralized access to this site.
          </p>
        </div>
      </div>
    </div>
  );
}
