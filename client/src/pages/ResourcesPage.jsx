import { Globe, Download, ExternalLink } from 'lucide-react';

const resources = [
  {
    category: 'Government Resources',
    items: [
      { name: 'FEMA - Federal Emergency Management', url: 'https://www.fema.gov', description: 'Disaster assistance and preparedness' },
      { name: 'CDC - Centers for Disease Control', url: 'https://www.cdc.gov', description: 'Health and safety information' },
      { name: 'Ready.gov', url: 'https://www.ready.gov', description: 'Emergency preparedness guides' },
      { name: 'Weather.gov', url: 'https://www.weather.gov', description: 'National Weather Service alerts' },
    ]
  },
  {
    category: 'Health & Medical',
    items: [
      { name: 'Red Cross First Aid', url: 'https://www.redcross.org/take-a-class/first-aid', description: 'First aid training and resources' },
      { name: 'WHO - World Health Organization', url: 'https://www.who.int', description: 'Global health information' },
      { name: 'MedlinePlus', url: 'https://medlineplus.gov', description: 'Trusted health information' },
      { name: 'Poison Control', url: 'https://www.poison.org', description: 'Poisoning prevention and treatment' },
    ]
  },
  {
    category: 'Communication Tools',
    items: [
      { name: 'EverSite P2P Chat', url: '#', description: 'Decentralized peer-to-peer messaging', local: true },
      { name: 'Signal', url: 'https://signal.org', description: 'Encrypted messaging app' },
      { name: 'Briar', url: 'https://briarproject.org', description: 'Offline messaging via Bluetooth/WiFi' },
      { name: 'FireChat', url: 'https://www.opengarden.com/firechat', description: 'Mesh networking chat' },
    ]
  },
  {
    category: 'Technical Resources',
    items: [
      { name: 'Offline Wikipedia', url: 'https://www.kiwix.org', description: 'Download Wikipedia for offline use' },
      { name: 'OpenStreetMap', url: 'https://www.openstreetmap.org', description: 'Free offline maps' },
      { name: 'LibreOffice', url: 'https://www.libreoffice.org', description: 'Free office suite' },
      { name: 'VLC Media Player', url: 'https://www.videolan.org', description: 'Offline media player' },
    ]
  }
];

export default function ResourcesPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">External Resources</h2>
        <p className="text-gray-600 dark:text-gray-400">Useful links and tools for emergency preparedness and information access</p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Note:</strong> External links require internet connection. Download offline versions when possible for emergency access.
        </p>
      </div>

      {resources.map((section, idx) => (
        <div key={idx} className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{section.category}</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {section.items.map((item, itemIdx) => (
              <a
                key={itemIdx}
                href={item.url}
                target={item.local ? '_self' : '_blank'}
                rel="noopener noreferrer"
                className="bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg p-4 transition-colors group"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {item.name}
                  </h4>
                  {item.local ? (
                    <Download className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{item.description}</p>
              </a>
            ))}
          </div>
        </div>
      ))}

      {/* Downloadable Content */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Download className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Offline Content</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Download these resources for offline access during emergencies:
        </p>
        <div className="space-y-3">
          <button className="w-full bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4 text-left transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Complete Wiki Archive</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">All wiki articles (5.2 MB)</p>
              </div>
              <Download className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </button>
          <button className="w-full bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4 text-left transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Medical Procedures PDF</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Emergency medical guide (2.1 MB)</p>
              </div>
              <Download className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </button>
          <button className="w-full bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4 text-left transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Technical Documentation</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">System admin guides (3.8 MB)</p>
              </div>
              <Download className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
