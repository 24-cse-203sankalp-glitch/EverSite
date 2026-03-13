import { Wrench, Code, Server, Database, Shield } from 'lucide-react';
import { useState } from 'react';

const technicalDocs = [
  {
    id: 'network',
    title: 'Network Configuration',
    icon: Server,
    category: 'Infrastructure',
    content: [
      {
        subtitle: 'Router Setup',
        items: [
          'Access router admin panel (usually 192.168.1.1)',
          'Default credentials: admin/admin or admin/password',
          'Change default password immediately',
          'Enable WPA3 or WPA2 encryption',
          'Disable WPS (WiFi Protected Setup)',
          'Set strong WiFi password (12+ characters)',
          'Enable firewall',
          'Disable remote management'
        ]
      },
      {
        subtitle: 'Port Forwarding',
        items: [
          'Navigate to Port Forwarding section',
          'Add rule: External Port → Internal IP:Port',
          'Common ports: HTTP (80), HTTPS (443), SSH (22)',
          'Use static IP for forwarded devices',
          'Test with online port checker tools'
        ]
      },
      {
        subtitle: 'DNS Configuration',
        items: [
          'Primary DNS: 1.1.1.1 (Cloudflare)',
          'Secondary DNS: 8.8.8.8 (Google)',
          'Or use: 9.9.9.9 (Quad9) for security',
          'Configure in router or device network settings',
          'Flush DNS cache after changes'
        ]
      }
    ]
  },
  {
    id: 'server',
    title: 'Server Administration',
    icon: Database,
    category: 'Systems',
    content: [
      {
        subtitle: 'Linux Server Basics',
        items: [
          'Update system: sudo apt update && sudo apt upgrade',
          'Check disk space: df -h',
          'Check memory: free -h',
          'View processes: top or htop',
          'Check logs: tail -f /var/log/syslog',
          'Restart service: sudo systemctl restart [service]',
          'Enable service on boot: sudo systemctl enable [service]'
        ]
      },
      {
        subtitle: 'Web Server (Nginx)',
        items: [
          'Install: sudo apt install nginx',
          'Start: sudo systemctl start nginx',
          'Config location: /etc/nginx/sites-available/',
          'Enable site: sudo ln -s /etc/nginx/sites-available/site /etc/nginx/sites-enabled/',
          'Test config: sudo nginx -t',
          'Reload: sudo systemctl reload nginx',
          'Logs: /var/log/nginx/'
        ]
      },
      {
        subtitle: 'SSL/TLS Setup',
        items: [
          'Install Certbot: sudo apt install certbot python3-certbot-nginx',
          'Get certificate: sudo certbot --nginx -d domain.com',
          'Auto-renewal: sudo certbot renew --dry-run',
          'Force HTTPS in Nginx config',
          'Use strong cipher suites',
          'Enable HSTS header'
        ]
      }
    ]
  },
  {
    id: 'security',
    title: 'Security Hardening',
    icon: Shield,
    category: 'Security',
    content: [
      {
        subtitle: 'SSH Security',
        items: [
          'Disable root login: PermitRootLogin no',
          'Use SSH keys instead of passwords',
          'Change default port: Port 2222',
          'Limit user access: AllowUsers username',
          'Install fail2ban: sudo apt install fail2ban',
          'Configure fail2ban for SSH protection',
          'Use strong key: ssh-keygen -t ed25519'
        ]
      },
      {
        subtitle: 'Firewall (UFW)',
        items: [
          'Install: sudo apt install ufw',
          'Default deny: sudo ufw default deny incoming',
          'Allow SSH: sudo ufw allow 22/tcp',
          'Allow HTTP/HTTPS: sudo ufw allow 80,443/tcp',
          'Enable: sudo ufw enable',
          'Check status: sudo ufw status',
          'Delete rule: sudo ufw delete [rule number]'
        ]
      },
      {
        subtitle: 'System Updates',
        items: [
          'Enable automatic security updates',
          'Install: sudo apt install unattended-upgrades',
          'Configure: sudo dpkg-reconfigure unattended-upgrades',
          'Check for updates daily',
          'Test updates in staging environment first',
          'Keep backups before major updates'
        ]
      }
    ]
  },
  {
    id: 'backup',
    title: 'Backup & Recovery',
    icon: Database,
    category: 'Data',
    content: [
      {
        subtitle: 'Backup Strategy',
        items: [
          '3-2-1 Rule: 3 copies, 2 different media, 1 offsite',
          'Automate backups with cron jobs',
          'Test restores regularly',
          'Encrypt sensitive backups',
          'Document backup procedures',
          'Monitor backup success/failure'
        ]
      },
      {
        subtitle: 'Tools',
        items: [
          'rsync: sudo rsync -avz /source/ /destination/',
          'tar: tar -czf backup.tar.gz /directory/',
          'Database: mysqldump -u user -p database > backup.sql',
          'Automated: Use Duplicity or Restic',
          'Cloud: rclone for cloud storage sync',
          'Snapshots: LVM or filesystem snapshots'
        ]
      },
      {
        subtitle: 'Recovery Procedures',
        items: [
          'Document all recovery steps',
          'Keep recovery tools on bootable USB',
          'Test recovery in isolated environment',
          'Verify data integrity after restore',
          'Have offline backup for ransomware protection',
          'Maintain recovery time objectives (RTO)'
        ]
      }
    ]
  },
  {
    id: 'monitoring',
    title: 'System Monitoring',
    icon: Code,
    category: 'Operations',
    content: [
      {
        subtitle: 'Performance Monitoring',
        items: [
          'CPU: top, htop, mpstat',
          'Memory: free -h, vmstat',
          'Disk I/O: iostat, iotop',
          'Network: iftop, nethogs, ss',
          'Logs: journalctl, tail -f /var/log/*',
          'Install monitoring: Prometheus + Grafana'
        ]
      },
      {
        subtitle: 'Alerts & Notifications',
        items: [
          'Set up email alerts for critical events',
          'Monitor disk space (alert at 80%)',
          'Track failed login attempts',
          'Monitor service uptime',
          'Set up health checks',
          'Use tools: Nagios, Zabbix, or Uptime Robot'
        ]
      },
      {
        subtitle: 'Log Management',
        items: [
          'Centralize logs with syslog',
          'Rotate logs: configure logrotate',
          'Analyze with: grep, awk, sed',
          'Use ELK stack for large deployments',
          'Archive old logs',
          'Monitor log file sizes'
        ]
      }
    ]
  }
];

export default function TechnicalPage() {
  const [selectedDoc, setSelectedDoc] = useState(null);

  return (
    <div className="max-w-5xl mx-auto">
      {selectedDoc ? (
        /* Documentation Detail */
        <div className="card p-8">
          <button
            onClick={() => setSelectedDoc(null)}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4 text-sm font-medium"
          >
            ← Back to documentation
          </button>

          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              {selectedDoc.icon && <selectedDoc.icon className="w-8 h-8 text-purple-600 dark:text-purple-400" />}
              <div>
                <span className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-medium rounded-full mb-2">
                  {selectedDoc.category}
                </span>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {selectedDoc.title}
                </h1>
              </div>
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-8">
            {selectedDoc.content.map((section, idx) => (
              <div key={idx}>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {section.subtitle}
                </h2>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <ul className="space-y-3">
                    {section.items.map((item, itemIdx) => (
                      <li key={itemIdx} className="flex gap-3 text-gray-700 dark:text-gray-300">
                        <span className="text-purple-600 dark:text-purple-400 font-bold">•</span>
                        <span className="font-mono text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Documentation List */
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Technical Documentation</h2>
            <p className="text-gray-600 dark:text-gray-400">System administration and technical guides</p>
          </div>

          <div className="grid gap-4">
            {technicalDocs.map((doc) => {
              const Icon = doc.icon;
              
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className="card p-6 cursor-pointer hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-medium px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full">
                        {doc.category}
                      </span>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-2 mb-2">
                        {doc.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {doc.content.length} section{doc.content.length !== 1 ? 's' : ''} • Click to view details
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
