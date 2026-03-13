import { AlertTriangle, Phone, MapPin, Radio } from 'lucide-react';

const emergencyContacts = [
  { service: 'Emergency Services', number: '911', description: 'Police, Fire, Medical emergencies' },
  { service: 'Poison Control', number: '1-800-222-1222', description: 'Poisoning and overdose information' },
  { service: 'Suicide Prevention', number: '988', description: '24/7 crisis support and prevention' },
  { service: 'Disaster Distress', number: '1-800-985-5990', description: 'Natural disaster emotional support' },
  { service: 'Red Cross', number: '1-800-733-2767', description: 'Disaster relief and assistance' },
  { service: 'FEMA', number: '1-800-621-3362', description: 'Federal disaster assistance' },
];

const evacuationChecklist = [
  'Important documents (ID, insurance, medical records)',
  'Medications (7-day supply minimum)',
  'Cash and credit cards',
  'Phone chargers and power banks',
  'First aid kit',
  'Flashlight and batteries',
  'Water (1 gallon per person per day)',
  'Non-perishable food',
  'Change of clothes',
  'Personal hygiene items',
  'Pet supplies if applicable',
  'Emergency contact list'
];

const shelterGuidelines = [
  'Locate nearest emergency shelter on local government website',
  'Bring identification and proof of residence',
  'Pack bedding, pillows, and comfort items',
  'Bring entertainment for children',
  'Follow shelter rules and staff instructions',
  'Respect other evacuees\' space and privacy',
  'Register with Red Cross for family reunification',
  'Keep valuables secured',
  'Maintain personal hygiene',
  'Stay informed via shelter announcements'
];

export default function EmergencyPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Alert Banner */}
      <div className="bg-red-600 text-white rounded-lg p-6">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-8 h-8 flex-shrink-0" />
          <div>
            <h2 className="text-2xl font-bold mb-2">Emergency Information</h2>
            <p className="text-red-100">
              In life-threatening emergencies, always call 911 first. This page provides additional resources and procedures.
            </p>
          </div>
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <Phone className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Emergency Contacts</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {emergencyContacts.map((contact, idx) => (
            <div key={idx} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{contact.service}</h4>
              <a
                href={`tel:${contact.number}`}
                className="text-2xl font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 block mb-2"
              >
                {contact.number}
              </a>
              <p className="text-sm text-gray-600 dark:text-gray-300">{contact.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Evacuation Checklist */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <MapPin className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Evacuation Checklist</h3>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-4">
          <p className="text-sm text-orange-800 dark:text-orange-200">
            <strong>Important:</strong> Prepare this bag in advance and keep it accessible. Review and update contents every 6 months.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {evacuationChecklist.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <input
                type="checkbox"
                className="mt-1 w-4 h-4 text-blue-600 rounded"
                id={`evac-${idx}`}
              />
              <label htmlFor={`evac-${idx}`} className="text-gray-700 dark:text-gray-300 cursor-pointer">
                {item}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Shelter Guidelines */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <Radio className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Emergency Shelter Guidelines</h3>
        </div>
        <div className="space-y-3">
          {shelterGuidelines.map((guideline, idx) => (
            <div key={idx} className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full flex items-center justify-center text-sm font-semibold">
                {idx + 1}
              </div>
              <p className="text-gray-700 dark:text-gray-300 pt-0.5">{guideline}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Communication Plan */}
      <div className="card p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Family Communication Plan</h3>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">Create Your Plan:</h4>
          <ul className="space-y-2 text-blue-800 dark:text-blue-200 text-sm">
            <li>• Designate an out-of-state contact person</li>
            <li>• Share contact information with all family members</li>
            <li>• Establish meeting points (local and out-of-area)</li>
            <li>• Keep written copies in wallets and emergency kits</li>
            <li>• Practice your plan twice per year</li>
            <li>• Update when phone numbers or addresses change</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
