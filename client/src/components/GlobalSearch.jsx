import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, BookOpen, Heart, Wrench, AlertTriangle, ArrowRight } from 'lucide-react';

// ── Search index built from all page content ──────────────────────────────────
const SEARCH_INDEX = [
  // Wiki
  { id:'w1', section:'wiki', title:'Emergency Preparedness Guide', category:'Safety', excerpt:'Complete guide to preparing for natural disasters, power outages, and emergency situations with detailed checklists.' },
  { id:'w2', section:'wiki', title:'Water Purification Methods', category:'Survival', excerpt:'Boiling, chemical treatment, filtration, SODIS, and emergency water sources.' },
  { id:'w3', section:'wiki', title:'First Aid Essentials', category:'Medical', excerpt:'CPR, Heimlich maneuver, severe bleeding control, burns, shock, and poisoning.' },
  { id:'w4', section:'wiki', title:'Shelter Building Techniques', category:'Survival', excerpt:'Lean-to, debris hut, snow cave, tarp configurations, and insulation materials.' },
  { id:'w5', section:'wiki', title:'Fire Starting Methods', category:'Survival', excerpt:'Tinder, kindling, fuel wood, ferro rod, bow drill, fire lay configurations.' },
  { id:'w6', section:'wiki', title:'Navigation Without GPS', category:'Survival', excerpt:'Shadow stick, North Star, natural indicators, map reading, compass use.' },
  { id:'w7', section:'wiki', title:'Food Foraging Safety', category:'Survival', excerpt:'Universal edibility test, safe plants, dangerous plants, berries, nuts.' },
  { id:'w8', section:'wiki', title:'Knots & Rope Work', category:'Technical', excerpt:'Bowline, clove hitch, square knot, figure-eight, sheet bend, lashing.' },
  // Medical
  { id:'m1', section:'medical', title:'CPR – Cardiopulmonary Resuscitation', category:'Emergency', excerpt:'30 compressions, 2 breaths, 100-120/min, AED use, hands-only CPR.' },
  { id:'m2', section:'medical', title:'Stroke Recognition – FAST Method', category:'Emergency', excerpt:'Face drooping, arm weakness, speech difficulty, time to call 911.' },
  { id:'m3', section:'medical', title:'Severe Bleeding Control', category:'Trauma', excerpt:'Direct pressure, elevation, tourniquet application, pressure bandage.' },
  { id:'m4', section:'medical', title:'Severe Allergic Reaction (Anaphylaxis)', category:'Emergency', excerpt:'EpiPen use, positioning, monitoring, second dose, hospital monitoring.' },
  { id:'m5', section:'medical', title:'Burn Treatment', category:'Trauma', excerpt:'Cool with water, no ice, cover with sterile bandage, when to seek help.' },
  { id:'m6', section:'medical', title:'Choking – Heimlich Maneuver', category:'Emergency', excerpt:'Abdominal thrusts, unconscious choking, infant back blows, chest thrusts.' },
  // Technical
  { id:'t1', section:'technical', title:'Network Configuration', category:'Infrastructure', excerpt:'Router setup, port forwarding, DNS configuration, firewall settings.' },
  { id:'t2', section:'technical', title:'Server Administration', category:'Systems', excerpt:'Linux basics, Nginx web server, SSL/TLS setup with Certbot.' },
  { id:'t3', section:'technical', title:'Security Hardening', category:'Security', excerpt:'SSH security, UFW firewall, fail2ban, automatic updates.' },
  { id:'t4', section:'technical', title:'Backup & Recovery', category:'Data', excerpt:'3-2-1 backup rule, rsync, tar, database dumps, recovery procedures.' },
  { id:'t5', section:'technical', title:'System Monitoring', category:'Operations', excerpt:'CPU, memory, disk I/O, network monitoring, alerts, log management.' },
  // Emergency
  { id:'e1', section:'emergency', title:'Emergency Contacts', category:'Emergency', excerpt:'911, Poison Control 1-800-222-1222, Suicide Prevention 988, Red Cross, FEMA.' },
  { id:'e2', section:'emergency', title:'Evacuation Checklist', category:'Emergency', excerpt:'Documents, medications, cash, water, food, first aid kit, phone chargers.' },
  { id:'e3', section:'emergency', title:'Emergency Shelter Guidelines', category:'Emergency', excerpt:'Shelter locations, registration, rules, Red Cross family reunification.' },
  { id:'e4', section:'emergency', title:'Family Communication Plan', category:'Emergency', excerpt:'Out-of-state contact, meeting points, written copies, practice plan.' },
];

const SECTION_META = {
  wiki:      { icon: BookOpen,      color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-950',   label: 'Wiki' },
  medical:   { icon: Heart,         color: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-950',     label: 'Medical' },
  technical: { icon: Wrench,        color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950', label: 'Technical' },
  emergency: { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950', label: 'Emergency' },
};

function highlight(text, query) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-200 dark:bg-yellow-700 text-inherit rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function GlobalSearch({ darkMode, onNavigate, isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef(null);

  // Ctrl+K to open
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onNavigate('__search_open__');
      }
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose, onNavigate]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults([]);
      setSelected(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const q = query.toLowerCase();
    const hits = SEARCH_INDEX.filter(item =>
      item.title.toLowerCase().includes(q) ||
      item.excerpt.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    ).slice(0, 8);
    setResults(hits);
    setSelected(0);
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, results.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
    if (e.key === 'Enter' && results[selected]) { navigate(results[selected]); }
  };

  const navigate = (item) => {
    onNavigate(item.section);
    onClose();
    setQuery('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4" onClick={onClose}>
      <div
        className={`w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Input */}
        <div className={`flex items-center gap-3 px-4 py-3.5 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <Search className={`w-5 h-5 flex-shrink-0 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search wiki, medical, emergency, technical..."
            className={`flex-1 text-sm bg-transparent outline-none ${darkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
          />
          <div className="flex items-center gap-2">
            {query && <button onClick={() => setQuery('')} className={`${darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}><X className="w-4 h-4" /></button>}
            <kbd className={`text-xs px-1.5 py-0.5 rounded border font-mono ${darkMode ? 'border-gray-600 text-gray-500' : 'border-gray-300 text-gray-400'}`}>Esc</kbd>
          </div>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <ul className="max-h-96 overflow-y-auto py-2">
            {results.map((item, i) => {
              const meta = SECTION_META[item.section];
              const Icon = meta.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => navigate(item)}
                    onMouseEnter={() => setSelected(i)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${
                      selected === i
                        ? darkMode ? 'bg-gray-800' : 'bg-gray-50'
                        : ''
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${meta.bg}`}>
                      <Icon className={`w-4 h-4 ${meta.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {highlight(item.title, query)}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${meta.bg} ${meta.color}`}>{meta.label}</span>
                      </div>
                      <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {highlight(item.excerpt, query)}
                      </p>
                    </div>
                    <ArrowRight className={`w-4 h-4 flex-shrink-0 mt-1 ${selected === i ? meta.color : darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {query && results.length === 0 && (
          <div className={`px-4 py-8 text-center text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            No results for "<span className="font-medium">{query}</span>"
          </div>
        )}

        {!query && (
          <div className={`px-4 py-4 flex items-center justify-between text-xs ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
            <span>Search across all {SEARCH_INDEX.length} articles</span>
            <div className="flex items-center gap-3">
              <span><kbd className="font-mono">↑↓</kbd> navigate</span>
              <span><kbd className="font-mono">↵</kbd> open</span>
              <span><kbd className="font-mono">Esc</kbd> close</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
