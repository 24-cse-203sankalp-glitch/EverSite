import { BookOpen, Heart, Wrench, MessageSquare, Shield, Globe, FileText, AlertTriangle } from 'lucide-react';

const navigationItems = [
  { id: 'wiki', label: 'Wiki', icon: BookOpen, color: 'blue' },
  { id: 'medical', label: 'Medical', icon: Heart, color: 'red' },
  { id: 'technical', label: 'Technical', icon: Wrench, color: 'purple' },
  { id: 'emergency', label: 'Emergency', icon: AlertTriangle, color: 'orange' },
  { id: 'legal', label: 'Legal', icon: FileText, color: 'gray' },
  { id: 'resources', label: 'Resources', icon: Globe, color: 'green' },
];

export default function Sidebar({ activeSection, onSectionChange, onOpenChat, darkMode }) {
  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-[calc(100vh-73px)] sticky top-[73px] overflow-y-auto transition-colors">
      <nav className="p-4 space-y-1">
        <div className="mb-4">
          <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 mb-2">
            Information
          </h2>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className={`w-5 h-5 ${
                  isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'
                }`} />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 mb-2">
            Communication
          </h2>
          <button
            onClick={onOpenChat}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <MessageSquare className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            P2P Chat
            <span className="ml-auto bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full">
              Secure
            </span>
          </button>
        </div>

        <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Blockchain Secured</p>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            All data is cryptographically verified and distributed across the peer network.
          </p>
        </div>
      </nav>
    </aside>
  );
}
