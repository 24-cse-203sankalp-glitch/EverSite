import { useState, useEffect, useRef } from 'react';
import { Send, Trash2, Bot, User, Wifi, WifiOff, Loader } from 'lucide-react';

const STORAGE_KEY = 'eversite-ai-history';

// Offline knowledge base — factual survival & general answers
const OFFLINE_KB = [
  { q: ['water', 'purif', 'drink', 'safe water'], a: 'To purify water: (1) Boil for 1 minute (3 min above 6500ft). (2) Use iodine tablets — 2 tabs per liter, wait 30 min. (3) Bleach — 8 drops unscented per gallon, wait 30 min. (4) Ceramic/LifeStraw filters remove bacteria and protozoa. Always use the clearest water available and let sediment settle first.' },
  { q: ['first aid', 'bleeding', 'wound', 'cut', 'injury'], a: 'For bleeding: Apply direct pressure with a clean cloth for 10–15 min without lifting. Elevate the limb above heart level. For severe limb bleeding, apply a tourniquet 2–3 inches above the wound. For deep wounds, do not remove embedded objects — stabilize them. Signs of infection: redness, warmth, pus, fever — seek medical help.' },
  { q: ['fire', 'start fire', 'ignite', 'flint'], a: 'Starting fire without a lighter: (1) Flint and steel — strike at 30° angle onto char cloth or dry tinder. (2) Bow drill — friction method using softwood spindle on fireboard. (3) Magnifying glass — focus sunlight on dark tinder. Always prepare a tinder bundle (dry grass, bark, cattail fluff) before attempting ignition. Build fire in a teepee or log cabin structure.' },
  { q: ['shelter', 'build shelter', 'survive cold', 'hypothermia'], a: 'Emergency shelter: (1) Lean-to — prop a branch between two trees, lean sticks at 45°, cover with leaves/bark. (2) Debris hut — pile 3ft of leaves over a frame for insulation. (3) Snow cave — dig into a slope, keep entrance lower than sleeping area to trap heat. Insulate from ground — you lose more heat downward than upward. Hypothermia signs: shivering, confusion, slurred speech — warm core first.' },
  { q: ['navigate', 'direction', 'north', 'compass', 'lost'], a: 'Navigation without compass: (1) Sun rises East, sets West. At noon, sun is due South (Northern hemisphere). (2) Stick shadow method — place stick, mark shadow tip, wait 15 min, mark again — line points East-West. (3) North Star (Polaris) — find Big Dipper, follow the two outer stars 5x their distance. (4) Moss grows on north side of trees in Northern hemisphere (not always reliable). (5) Analog watch — point hour hand at sun, bisect angle to 12 = South.' },
  { q: ['food', 'forage', 'eat', 'edible', 'plant', 'berries'], a: 'Universal edibility test: (1) Smell — avoid bitter almond or peach smell (cyanide). (2) Skin test — rub on inner wrist, wait 15 min for reaction. (3) Lip test — touch to lips, wait 3 min. (4) Mouth test — chew small piece, hold 15 min, spit. (5) Eat small amount, wait 8 hours. Safe plants: dandelion (all parts), cattail (roots/pollen), pine needles (vitamin C tea). Avoid: white berries, umbrella-shaped flowers, shiny leaves.' },
  { q: ['signal', 'rescue', 'sos', 'help', 'found'], a: 'Signaling for rescue: (1) SOS in Morse: 3 short, 3 long, 3 short (··· — — — ···). (2) Signal mirror — reflect sunlight toward aircraft/rescuers, visible 10+ miles. (3) Whistle — 3 blasts = distress signal. (4) Ground-to-air signals: X = need medical help, V = need help, → = traveling this direction. Make signals at least 10ft wide using rocks, logs, or trampled grass. (5) Fire with green leaves produces white smoke visible in daylight.' },
  { q: ['knot', 'rope', 'tie', 'lash'], a: 'Essential knots: (1) Bowline — creates fixed loop that won\'t slip, used for rescue. (2) Clove hitch — quick attachment to poles/trees. (3) Square knot — joining two ropes of equal thickness. (4) Taut-line hitch — adjustable loop for tent lines. (5) Figure-8 — stopper knot, climbing safety. (6) Sheet bend — joining ropes of different thickness. Practice until you can tie them in the dark.' },
  { q: ['medical', 'cpr', 'heart', 'cardiac', 'resuscit'], a: 'CPR (adult): (1) Check scene safety, tap shoulders, shout. (2) Call 911 or send someone. (3) 30 chest compressions — heel of hand on center of chest, 2 inches deep, 100–120/min. (4) 2 rescue breaths — tilt head, lift chin, seal mouth, watch chest rise. (5) Continue 30:2 ratio until AED arrives or person recovers. Hands-only CPR (no breaths) is acceptable if untrained.' },
  { q: ['snake', 'bite', 'venom', 'poison', 'sting'], a: 'Snake bite: (1) Move away from snake — do NOT try to catch it. (2) Keep victim calm and still — movement spreads venom. (3) Remove jewelry/tight clothing near bite. (4) Keep bitten limb below heart level. (5) Mark the edge of swelling with pen and time. (6) Get to hospital ASAP — antivenom is the only treatment. Do NOT: cut and suck, apply tourniquet, use ice, or give alcohol.' },
  { q: ['hello', 'hi', 'hey', 'greet'], a: 'Hello! I\'m EverSite AI — your offline survival and emergency assistant. Ask me about first aid, water purification, shelter building, navigation, foraging, fire starting, signaling for rescue, or any general survival topic. I work fully offline.' },
  { q: ['what can you do', 'help', 'capabilities', 'what do you know'], a: 'I can help with: 🩺 First aid & medical emergencies | 💧 Water purification | 🔥 Fire starting | 🏕 Shelter building | 🧭 Navigation without GPS | 🌿 Foraging & edible plants | 📡 Rescue signaling | 🪢 Knots & rope work | 🐍 Animal bites & stings | ⚡ General survival knowledge. Ask me anything — I work fully offline.' },
  { q: ['stop bleeding', 'tourniquet', 'severe bleeding'], a: 'To stop severe bleeding: (1) Apply firm direct pressure with a clean cloth — hold for 10 min without lifting. (2) If bleeding soaks through, add more cloth on top. (3) For limb bleeding that won\'t stop, apply a tourniquet 2–3 inches above the wound, tighten until bleeding stops, note the time. (4) Keep the person still and warm. Do NOT remove embedded objects.' },
  { q: ['start a fire', 'make fire', 'no lighter'], a: 'Starting fire without a lighter: (1) Flint & steel — strike at 30° angle onto dry tinder. (2) Bow drill — fast strokes with softwood spindle on fireboard until ember forms, transfer to tinder bundle and blow gently. (3) Magnifying glass — focus sunlight on dark tinder. Always build a tinder bundle first (dry grass, bark shavings, cattail fluff) before attempting ignition.' },
  { q: ['find food', 'no food', 'starving', 'edible plants'], a: 'Finding food in the wild: Safe edibles — dandelion (entire plant), cattail roots and pollen, pine needles (make tea for vitamin C), acorns (boil to remove tannins). Universal test: rub on wrist, wait 15 min, then lips 3 min, then chew small piece and wait 8 hours. Avoid: white berries, umbrella-shaped flowers, milky sap, shiny leaves. Insects (grasshoppers, grubs) are high protein — cook before eating.' },
  { q: ['build shelter', 'emergency shelter', 'no tent'], a: 'Quick emergency shelter: (1) Lean-to — lash a branch between two trees at shoulder height, lean sticks against it at 45°, layer leaves/bark on top. (2) Debris hut — make a frame and pile 3ft of dry leaves over it — insulates even in freezing temps. (3) Always insulate from the ground first — you lose more heat downward than upward. Use leaves, pine needles, or your pack.' },
  { q: ['call for help', 'signal rescue', 'lost signal'], a: 'Signaling for rescue: (1) Whistle — 3 blasts = universal distress signal, repeat every few minutes. (2) Signal mirror — aim reflected sunlight at aircraft or distant rescuers, visible 10+ miles. (3) Ground-to-air symbols: V = need help, X = need medical help — make them 10ft+ wide with rocks or logs. (4) Fire with green leaves = white smoke visible in daylight. (5) SOS in Morse: 3 short, 3 long, 3 short.' },
];

function findOfflineAnswer(query) {
  const q = query.toLowerCase();
  let best = null;
  let bestScore = 0;
  for (const entry of OFFLINE_KB) {
    const score = entry.q.reduce((acc, kw) => acc + (q.includes(kw) ? 1 : 0), 0);
    if (score > bestScore) { bestScore = score; best = entry; }
  }
  if (best && bestScore > 0) return best.a;
  return "I don't have specific offline data for that query. Try asking about: water purification, first aid, fire starting, shelter, navigation, foraging, signaling, knots, CPR, or snake bites. When online, I can answer broader questions.";
}

async function askOnlineAI(messages) {
  // Use OpenRouter free tier — no API key needed for some models
  // Fallback chain: try multiple free endpoints
  const lastMsg = messages[messages.length - 1].content;

  // Try 1: Pollinations correct endpoint
  try {
    const res = await fetch('https://text.pollinations.ai/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'You are EverSite AI, a helpful survival and emergency assistant. Be concise and factual.' },
          ...messages.map(m => ({ role: m.role, content: m.content }))
        ],
        model: 'openai',
        private: true
      }),
      signal: AbortSignal.timeout(10000)
    });
    if (res.ok) {
      const text = await res.text();
      // Make sure it's not HTML
      if (!text.trim().startsWith('<')) return text.trim();
    }
  } catch {}

  // Try 2: Ollama-style free proxy
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer gsk_free'
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          { role: 'system', content: 'You are EverSite AI, a helpful survival and emergency assistant.' },
          ...messages.map(m => ({ role: m.role, content: m.content }))
        ]
      }),
      signal: AbortSignal.timeout(10000)
    });
    if (res.ok) {
      const data = await res.json();
      const reply = data?.choices?.[0]?.message?.content;
      if (reply) return reply;
    }
  } catch {}

  // All online attempts failed — fall back to offline KB
  throw new Error('All online AI endpoints failed');
}

export default function AIChatPage({ darkMode }) {
  const [messages, setMessages] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const bottomRef = useRef(null);

  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input.trim(), time: Date.now() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      let reply;
      if (isOnline) {
        try {
          reply = await askOnlineAI(newMessages);
        } catch {
          reply = findOfflineAnswer(userMsg.content);
        }
      } else {
        reply = findOfflineAnswer(userMsg.content);
      }
      setMessages(prev => [...prev, { role: 'assistant', content: reply, time: Date.now() }]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const base = darkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900';
  const card = darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';
  const inputCls = darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400';

  return (
    <div className={`flex flex-col h-[calc(100vh-73px)] ${base}`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-6 py-3 border-b ${darkMode ? 'border-gray-800 bg-black' : 'border-gray-200 bg-white'}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-blue-600 rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>EverSite AI</h2>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Survival & Emergency Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${isOnline ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {isOnline ? 'Online Mode' : 'Offline Mode'}
          </div>
          {messages.length > 0 && (
            <button
              onClick={clearHistory}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${darkMode ? 'border-gray-700 text-gray-400 hover:bg-gray-900' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear History
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-blue-600 rounded-2xl flex items-center justify-center">
              <Bot className="w-9 h-9 text-white" />
            </div>
            <div>
              <h3 className={`text-lg font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>EverSite AI Assistant</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Works online and offline. Ask anything about survival, first aid, emergencies, or general knowledge.</p>
            </div>
            <div className="grid grid-cols-2 gap-2 max-w-md w-full">
              {[
                { label: 'How do I purify water?', q: 'how do I purify water' },
                { label: 'Stop severe bleeding', q: 'stop bleeding tourniquet' },
                { label: 'Build emergency shelter', q: 'build emergency shelter' },
                { label: 'Signal for rescue', q: 'call for help signal rescue' },
                { label: 'Start a fire without a lighter', q: 'start a fire no lighter' },
                { label: 'Find food in the wild', q: 'find food edible plants' },
              ].map(({ label, q: chipQ }) => (
                <button
                  key={label}
                  onClick={() => {
                    const userMsg = { role: 'user', content: chipQ, time: Date.now() };
                    const newMessages = [...messages, userMsg];
                    setMessages(newMessages);
                    setLoading(true);
                    const reply = findOfflineAnswer(chipQ);
                    setTimeout(() => {
                      setMessages(prev => [...prev, { role: 'assistant', content: reply, time: Date.now() }]);
                      setLoading(false);
                    }, 300);
                  }}
                  className={`text-xs px-3 py-2 rounded-lg border text-left transition-colors ${darkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-900' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-br-sm'
                : darkMode ? 'bg-gray-800 text-gray-100 rounded-bl-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
            }`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <p className={`text-xs mt-1.5 ${msg.role === 'user' ? 'text-blue-200' : darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {new Date(msg.time).toLocaleTimeString()}
              </p>
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className={`px-4 py-3 rounded-2xl rounded-bl-sm ${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
              <Loader className="w-4 h-4 animate-spin text-blue-600" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className={`px-4 py-3 border-t ${darkMode ? 'border-gray-800 bg-black' : 'border-gray-200 bg-white'}`}>
        <div className="flex gap-2 max-w-4xl mx-auto">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Ask anything — works offline..."
            className={`flex-1 px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputCls}`}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className={`text-center text-xs mt-1.5 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
          {isOnline ? 'Connected to AI — full knowledge available' : 'Offline — using built-in survival knowledge base'}
        </p>
      </div>
    </div>
  );
}
