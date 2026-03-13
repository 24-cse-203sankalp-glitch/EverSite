import { Shield, Wifi, Lock, Database, MessageSquare, Zap, Globe, Users, BookOpen, Heart, Wrench, AlertTriangle, Mail, Github, Twitter } from 'lucide-react';

export default function HomePage({ darkMode, onNavigate }) {
  const features = [
    {
      icon: Shield,
      title: 'Blockchain Security',
      description: 'Every piece of information is cryptographically verified using SHA-256 hashing and proof-of-work consensus, ensuring data integrity and authenticity across the network.'
    },
    {
      icon: Wifi,
      title: 'Peer-to-Peer Network',
      description: 'Built on WebRTC technology, EverSite creates direct connections between users, eliminating single points of failure and enabling true decentralization without central servers.'
    },
    {
      icon: Lock,
      title: 'End-to-End Encryption',
      description: 'All communications are protected with military-grade AES-256 encryption. Your messages and data remain private, readable only by intended recipients.'
    },
    {
      icon: Database,
      title: 'Offline-First Architecture',
      description: 'Service Workers and IndexedDB enable full functionality without internet. Access critical information anytime, anywhere, even during network outages or disasters.'
    },
    {
      icon: MessageSquare,
      title: 'Encrypted P2P Chat',
      description: 'Real-time messaging with typing indicators, read receipts, file sharing, and message search. All conversations are encrypted and transmitted directly between peers.'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized performance with React 18, efficient caching strategies, and distributed content delivery. Experience instant page loads and seamless navigation.'
    }
  ];

  const infoSections = [
    {
      icon: BookOpen,
      title: 'Wiki Knowledge Base',
      description: 'Comprehensive survival guides, emergency procedures, and essential knowledge',
      color: 'blue',
      section: 'wiki'
    },
    {
      icon: Heart,
      title: 'Medical Procedures',
      description: 'Life-saving medical information, CPR, first aid, and emergency treatments',
      color: 'red',
      section: 'medical'
    },
    {
      icon: Wrench,
      title: 'Technical Documentation',
      description: 'System administration, network configuration, security hardening guides',
      color: 'purple',
      section: 'technical'
    },
    {
      icon: AlertTriangle,
      title: 'Emergency Resources',
      description: 'Emergency contacts, evacuation checklists, shelter guidelines',
      color: 'orange',
      section: 'emergency'
    }
  ];

  const stats = [
    { label: 'Decentralized', value: '100%' },
    { label: 'Uptime', value: '99.9%' },
    { label: 'Encryption', value: 'AES-256' },
    { label: 'Open Source', value: 'MIT' }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="text-center py-20">
        <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
          <Shield className="w-4 h-4" />
          Blockchain-Secured • Peer-to-Peer • Offline-First
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          Decentralized Information<br />
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Always Accessible
          </span>
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed">
          EverSite is a revolutionary peer-to-peer information platform that ensures critical knowledge remains accessible even when traditional networks fail. Built with blockchain security, end-to-end encryption, and offline-first architecture.
        </p>

        <div className="flex items-center justify-center gap-4 mb-12">
          <button 
            onClick={() => onNavigate('wiki')}
            className="btn-primary text-lg px-8 py-3"
          >
            Explore Knowledge Base
          </button>
          <button 
            onClick={() => onNavigate('legal')}
            className="btn-secondary text-lg px-8 py-3"
          >
            Learn More
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {stats.map((stat, idx) => (
            <div key={idx} className="card p-6 text-center">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Built for Resilience
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Advanced technology stack designed to keep information flowing when it matters most
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="card p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Information Sections */}
      <section className="py-20 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Comprehensive Knowledge Library
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Access critical information across multiple domains, all verified and ready for offline use
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {infoSections.map((section, idx) => (
            <button
              key={idx}
              onClick={() => onNavigate(section.section)}
              className="card p-8 text-left hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-lg group"
            >
              <div className={`w-14 h-14 bg-${section.color}-100 dark:bg-${section.color}-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <section.icon className={`w-7 h-7 text-${section.color}-600 dark:text-${section.color}-400`} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {section.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {section.description}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            How EverSite Works
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Understanding the technology behind decentralized information sharing
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              1
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Connect to Network
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your browser establishes direct WebRTC connections with other peers in the network, creating a mesh topology
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              2
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Verify with Blockchain
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              All content is hashed and verified using blockchain technology, ensuring authenticity and preventing tampering
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              3
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Access Offline
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Content is cached locally using Service Workers and IndexedDB, enabling full offline functionality
            </p>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Real-World Applications
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="card p-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              🌪️ Natural Disasters
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              When hurricanes, earthquakes, or floods disrupt traditional infrastructure, EverSite ensures emergency information, medical procedures, and survival guides remain accessible through peer-to-peer connections.
            </p>
          </div>

          <div className="card p-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              🔌 Power Outages
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              During widespread blackouts, access critical technical documentation, system recovery procedures, and communication tools without relying on centralized servers or cloud services.
            </p>
          </div>

          <div className="card p-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              🌐 Network Censorship
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              In regions with restricted internet access, EverSite's decentralized architecture enables information sharing without central control points that can be blocked or monitored.
            </p>
          </div>

          <div className="card p-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              🏥 Remote Locations
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Medical professionals in remote areas can access life-saving procedures, drug information, and emergency protocols even without reliable internet connectivity.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 border-t border-gray-200 dark:border-gray-700">
        <div className="card p-12 text-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Get in Touch
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Have questions, suggestions, or want to contribute? We'd love to hear from you.
          </p>
          
          <div className="flex items-center justify-center gap-6 mb-8">
            <a 
              href="mailto:contact@eversite.network" 
              className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline text-lg"
            >
              <Mail className="w-5 h-5" />
              contact@eversite.network
            </a>
          </div>

          <div className="flex items-center justify-center gap-4">
            <a href="https://github.com/eversite" target="_blank" rel="noopener noreferrer" className="btn-secondary">
              <Github className="w-5 h-5" />
              GitHub
            </a>
            <a href="https://twitter.com/eversite" target="_blank" rel="noopener noreferrer" className="btn-secondary">
              <Twitter className="w-5 h-5" />
              Twitter
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-200 dark:border-gray-700 mt-20">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h3 className="font-bold text-gray-900 dark:text-white">EverSite</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Decentralized information platform built for resilience and accessibility.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Information</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => onNavigate('wiki')} className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">Wiki</button></li>
              <li><button onClick={() => onNavigate('medical')} className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">Medical</button></li>
              <li><button onClick={() => onNavigate('technical')} className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">Technical</button></li>
              <li><button onClick={() => onNavigate('emergency')} className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">Emergency</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => onNavigate('resources')} className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">External Links</button></li>
              <li><a href="https://github.com/eversite" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">GitHub</a></li>
              <li><a href="https://github.com/eversite/docs" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">Documentation</a></li>
              <li><a href="https://github.com/eversite/contribute" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">Contribute</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => onNavigate('legal')} className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">Terms of Use</button></li>
              <li><button onClick={() => onNavigate('legal')} className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">Privacy Policy</button></li>
              <li><button onClick={() => onNavigate('legal')} className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">Disclaimer</button></li>
              <li><a href="https://opensource.org/licenses/MIT" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">MIT License</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © 2024 EverSite. Open source under MIT License. Built with ❤️ for a resilient future.
          </p>
        </div>
      </footer>
    </div>
  );
}
