import { FileText, Shield, AlertCircle } from 'lucide-react';

export default function LegalPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card p-8">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-8 h-8 text-gray-600 dark:text-gray-400" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Terms of Use & Legal Information</h1>
        </div>

        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Disclaimer</h2>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  The information provided on EverSite is for educational and informational purposes only. 
                  It is not intended as a substitute for professional medical, legal, or technical advice.
                </p>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Always consult with qualified professionals for specific advice related to your situation. 
              In medical emergencies, call 911 or your local emergency services immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Privacy & Data</h2>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  EverSite uses peer-to-peer technology. Your data is stored locally and shared only with connected peers.
                </p>
              </div>
            </div>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>• No central server stores your personal information</li>
              <li>• Chat messages are transmitted directly between peers</li>
              <li>• Cached content is stored in your browser's local storage</li>
              <li>• You can clear cached data at any time through browser settings</li>
              <li>• Blockchain verification ensures data integrity</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Open Source</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              EverSite is an open-source project designed to provide resilient access to critical information. 
              The source code is available for review, modification, and distribution under the MIT License.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We encourage community contributions to improve the platform and expand its capabilities.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Acceptable Use</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Users of EverSite agree to:
            </p>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>• Use the platform for lawful purposes only</li>
              <li>• Not distribute malicious content or malware</li>
              <li>• Respect the privacy and rights of other users</li>
              <li>• Not attempt to disrupt or compromise the network</li>
              <li>• Verify critical information from authoritative sources</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Limitation of Liability</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              EverSite and its contributors are not liable for any damages arising from the use or inability to use this platform. 
              The information is provided "as is" without warranties of any kind, either express or implied.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Contact</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              For questions, concerns, or contributions, please visit our GitHub repository or contact the development team.
            </p>
          </section>
        </div>
      </div>

      <div className="card p-6 bg-gray-50 dark:bg-gray-800">
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          Last updated: January 2024 • EverSite v1.0
        </p>
      </div>
    </div>
  );
}
