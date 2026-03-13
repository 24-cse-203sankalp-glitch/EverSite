import { Heart, AlertCircle, Pill, Activity } from 'lucide-react';
import { useState } from 'react';

const medicalData = [
  {
    id: 'cpr',
    title: 'CPR - Cardiopulmonary Resuscitation',
    category: 'Emergency',
    icon: Heart,
    priority: 'critical',
    steps: [
      'Check if person is responsive - tap shoulders and shout',
      'Call emergency services immediately (911)',
      'Place person on firm, flat surface',
      'Position hands: Center of chest, between nipples',
      'Compress: 30 times, 2 inches deep, 100-120 per minute',
      'Give 2 rescue breaths (tilt head, lift chin, pinch nose)',
      'Continue cycles of 30 compressions and 2 breaths',
      'Use AED if available - follow voice prompts',
      'Continue until help arrives or person breathes'
    ],
    warnings: [
      'Do not stop CPR unless person starts breathing',
      'Push hard and fast - don\'t be afraid to break ribs',
      'If untrained, do hands-only CPR (no breaths)'
    ]
  },
  {
    id: 'stroke',
    title: 'Stroke Recognition - FAST Method',
    category: 'Emergency',
    icon: AlertCircle,
    priority: 'critical',
    steps: [
      'F - Face: Ask person to smile. Does one side droop?',
      'A - Arms: Ask to raise both arms. Does one drift down?',
      'S - Speech: Ask to repeat simple phrase. Is speech slurred?',
      'T - Time: If any symptoms present, call 911 immediately',
      'Note time symptoms started',
      'Keep person calm and lying down',
      'Do NOT give food, water, or medication',
      'Monitor breathing and consciousness'
    ],
    warnings: [
      'Time is critical - every minute counts',
      'Do not drive to hospital - call ambulance',
      'Treatment most effective within 3 hours'
    ]
  },
  {
    id: 'bleeding',
    title: 'Severe Bleeding Control',
    category: 'Trauma',
    icon: Activity,
    priority: 'critical',
    steps: [
      'Call 911 if bleeding is severe',
      'Wear gloves if available',
      'Have person lie down',
      'Remove visible debris (not embedded objects)',
      'Apply firm, direct pressure with clean cloth',
      'Maintain pressure for 10-15 minutes',
      'Add more cloth if blood soaks through',
      'Elevate wound above heart if possible',
      'Apply pressure bandage once bleeding slows',
      'Tourniquet only if life-threatening and pressure fails'
    ],
    warnings: [
      'Do not remove embedded objects',
      'Do not peek at wound - maintain pressure',
      'Tourniquets can cause permanent damage'
    ]
  },
  {
    id: 'allergic',
    title: 'Severe Allergic Reaction (Anaphylaxis)',
    category: 'Emergency',
    icon: AlertCircle,
    priority: 'critical',
    steps: [
      'Call 911 immediately',
      'Use epinephrine auto-injector (EpiPen) if available',
      'Inject into outer thigh - can go through clothing',
      'Have person lie down with legs elevated',
      'If breathing difficulty, allow to sit up',
      'Loosen tight clothing',
      'Monitor breathing and pulse',
      'Be prepared to perform CPR',
      'Second dose may be needed after 5-15 minutes'
    ],
    warnings: [
      'Symptoms can worsen rapidly',
      'Always call 911 even if EpiPen used',
      'Person needs hospital monitoring'
    ]
  },
  {
    id: 'burns',
    title: 'Burn Treatment',
    category: 'Trauma',
    icon: Activity,
    priority: 'high',
    steps: [
      'Remove person from heat source',
      'Remove jewelry and tight clothing',
      'Cool burn with running water (10-20 minutes)',
      'Do not use ice - can cause more damage',
      'Cover with sterile, non-stick bandage',
      'Do not pop blisters',
      'Give over-the-counter pain reliever',
      'Seek medical help for: large burns, face/hands/feet burns, chemical/electrical burns'
    ],
    warnings: [
      'Do not apply butter, oil, or ointments',
      'Do not use cotton balls - fibers stick',
      'Watch for signs of infection'
    ]
  },
  {
    id: 'choking',
    title: 'Choking - Heimlich Maneuver',
    category: 'Emergency',
    icon: AlertCircle,
    priority: 'critical',
    steps: [
      'Ask "Are you choking?" - if can\'t speak, act immediately',
      'Stand behind person',
      'Make fist with one hand above navel',
      'Grasp fist with other hand',
      'Give quick, upward thrusts',
      'Repeat until object dislodges',
      'If person becomes unconscious, lower to ground',
      'Begin CPR - chest compressions may dislodge object',
      'Check mouth before giving breaths'
    ],
    warnings: [
      'For infants: use back blows and chest thrusts',
      'For pregnant/obese: chest thrusts instead',
      'Seek medical attention even if successful'
    ]
  }
];

export default function MedicalPage() {
  const [selectedProcedure, setSelectedProcedure] = useState(null);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      default: return 'blue';
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {selectedProcedure ? (
        /* Procedure Detail */
        <div className="card p-8">
          <button
            onClick={() => setSelectedProcedure(null)}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4 text-sm font-medium"
          >
            ← Back to procedures
          </button>

          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              {selectedProcedure.icon && <selectedProcedure.icon className="w-8 h-8 text-red-600 dark:text-red-400" />}
              <div>
                <span className={`inline-block px-3 py-1 bg-${getPriorityColor(selectedProcedure.priority)}-100 dark:bg-${getPriorityColor(selectedProcedure.priority)}-900/30 text-${getPriorityColor(selectedProcedure.priority)}-700 dark:text-${getPriorityColor(selectedProcedure.priority)}-400 text-xs font-medium rounded-full mb-2`}>
                  {selectedProcedure.category} - {selectedProcedure.priority.toUpperCase()}
                </span>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {selectedProcedure.title}
                </h1>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Procedure Steps</h2>
            <div className="space-y-3">
              {selectedProcedure.steps.map((step, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 pt-1">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Warnings */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-200 mb-2">Important Warnings</h3>
                <ul className="space-y-2">
                  {selectedProcedure.warnings.map((warning, index) => (
                    <li key={index} className="text-red-800 dark:text-red-200 text-sm">
                      • {warning}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Procedure List */
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Medical Emergency Procedures</h2>
            <p className="text-gray-600 dark:text-gray-400">Critical medical information for emergency situations</p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium mb-1">Disclaimer</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  This information is for educational purposes. Always call emergency services (911) in life-threatening situations. 
                  Proper training is recommended before performing these procedures.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {medicalData.map((procedure) => {
              const Icon = procedure.icon;
              const priorityColor = getPriorityColor(procedure.priority);
              
              return (
                <div
                  key={procedure.id}
                  onClick={() => setSelectedProcedure(procedure)}
                  className="card p-6 cursor-pointer hover:border-red-300 dark:hover:border-red-700 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 bg-${priorityColor}-100 dark:bg-${priorityColor}-900/30 rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-6 h-6 text-${priorityColor}-600 dark:text-${priorityColor}-400`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs font-medium px-2 py-1 bg-${priorityColor}-100 dark:bg-${priorityColor}-900/30 text-${priorityColor}-700 dark:text-${priorityColor}-400 rounded-full`}>
                          {procedure.category}
                        </span>
                        <span className={`text-xs font-bold px-2 py-1 bg-${priorityColor}-600 dark:bg-${priorityColor}-700 text-white rounded-full uppercase`}>
                          {procedure.priority}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {procedure.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {procedure.steps.length} steps • Click to view detailed procedure
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
