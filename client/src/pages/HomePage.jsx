import { useState, useEffect } from 'react';
import { Shield, BookOpen, Heart, Wrench, AlertTriangle, Video, Map, Bot, Lock, MessageSquare, Phone, Thermometer, Wind, Droplets, Eye, Wifi, WifiOff, Users, Cloud, CloudRain, Sun, CloudSnow, Zap, Navigation } from 'lucide-react';

const WEATHER_ICONS = {
  0: Sun, 1: Sun, 2: Cloud, 3: Cloud,
  45: Cloud, 48: Cloud,
  51: CloudRain, 53: CloudRain, 55: CloudRain,
  61: CloudRain, 63: CloudRain, 65: CloudRain,
  71: CloudSnow, 73: CloudSnow, 75: CloudSnow,
  80: CloudRain, 81: CloudRain, 82: CloudRain,
  95: Zap, 96: Zap, 99: Zap,
};

const WEATHER_DESC = {
  0:'Clear sky', 1:'Mainly clear', 2:'Partly cloudy', 3:'Overcast',
  45:'Foggy', 48:'Icy fog',
  51:'Light drizzle', 53:'Drizzle', 55:'Heavy drizzle',
  61:'Light rain', 63:'Rain', 65:'Heavy rain',
  71:'Light snow', 73:'Snow', 75:'Heavy snow',
  80:'Rain showers', 81:'Rain showers', 82:'Heavy showers',
  95:'Thunderstorm', 96:'Thunderstorm', 99:'Thunderstorm',
};

const QUICK_ACTIONS = [
  { id:'emergency', label:'Emergency', icon: AlertTriangle, color:'bg-red-600 hover:bg-red-700', text:'text-white' },
  { id:'medical',   label:'Medical',   icon: Heart,         color:'bg-pink-600 hover:bg-pink-700', text:'text-white' },
  { id:'map',       label:'Map',       icon: Map,           color:'bg-emerald-600 hover:bg-emerald-700', text:'text-white' },
  { id:'ai',        label:'AI Help',   icon: Bot,           color:'bg-violet-600 hover:bg-violet-700', text:'text-white' },
];

const SECTIONS = [
  { id:'wiki',      label:'Wiki',      icon: BookOpen,      color:'text-blue-500',   desc:'Survival guides & knowledge' },
  { id:'medical',   label:'Medical',   icon: Heart,         color:'text-red-500',    desc:'Emergency procedures' },
  { id:'technical', label:'Technical', icon: Wrench,        color:'text-purple-500', desc:'System & network docs' },
  { id:'emergency', label:'Emergency', icon: AlertTriangle, color:'text-orange-500', desc:'Contacts & checklists' },
  { id:'videos',    label:'Videos',    icon: Video,         color:'text-indigo-500', desc:'Offline video library' },
  { id:'map',       label:'Map',       icon: Map,           color:'text-emerald-500',desc:'Offline GPS map' },
  { id:'ai',        label:'AI',        icon: Bot,           color:'text-violet-500', desc:'Offline AI assistant' },
  { id:'vault',     label:'Vault',     icon: Lock,          color:'text-amber-500',  desc:'Encrypted documents' },
];

export default function HomePage({ darkMode, onNavigate, onOpenChat, peerCount, connectedPeers }) {
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [recentActivity] = useState(() => {
    try { return JSON.parse(localStorage.getItem('eversite-notifications')) || []; } catch { return []; }
  });

  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      pos => {
        const { latitude: lat, longitude: lon } = pos.coords;
        setLocation({ lat, lon });
        // Always fetch fresh when we get real GPS — clear any cached default-location weather
        localStorage.removeItem('eversite-weather');
        fetchWeather(lat, lon);
      },
      () => fetchWeather(40.7128, -74.0060),
      { timeout: 8000, enableHighAccuracy: true }
    );
  }, []);

  const fetchWeather = async (lat, lon) => {
    setWeatherLoading(true);
    try {
      const cached = localStorage.getItem('eversite-weather');
      if (cached) {
        const { data, ts, lat: cachedLat, lon: cachedLon } = JSON.parse(cached);
        const sameLocation = Math.abs((cachedLat||0) - lat) < 0.1 && Math.abs((cachedLon||0) - lon) < 0.1;
        if (sameLocation && Date.now() - ts < 30 * 60 * 1000) {
          setWeather(data); setWeatherLoading(false); return;
        }
      }
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,visibility&wind_speed_unit=mph&temperature_unit=celsius`;
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      const json = await res.json();
      const data = {
        temp: Math.round(json.current.temperature_2m),
        humidity: json.current.relative_humidity_2m,
        wind: Math.round(json.current.wind_speed_10m),
        code: json.current.weather_code,
        visibility: json.current.visibility,
      };
      localStorage.setItem('eversite-weather', JSON.stringify({ data, ts: Date.now(), lat, lon }));
      setWeather(data);
    } catch {
      const cached = localStorage.getItem('eversite-weather');
      if (cached) { try { setWeather(JSON.parse(cached).data); } catch {} }
    } finally {
      setWeatherLoading(false);
    }
  };

  const card = darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';
  const text = darkMode ? 'text-white' : 'text-gray-900';
  const sub = darkMode ? 'text-gray-400' : 'text-gray-500';
  const base = darkMode ? 'bg-black' : 'bg-gray-50';

  const WeatherIcon = weather ? (WEATHER_ICONS[weather.code] || Cloud) : Cloud;

  return (
    <div className={`min-h-[calc(100vh-73px)] ${base}`}>
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-5">

        {/* Top row: Status + Weather + Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Network Status */}
          <div className={`rounded-xl border p-4 ${card}`}>
            <p className={`text-xs font-semibold uppercase tracking-wider ${sub} mb-3`}>Network Status</p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isOnline ? <Wifi className="w-4 h-4 text-green-500" /> : <WifiOff className="w-4 h-4 text-red-400" />}
                  <span className={`text-sm ${text}`}>Internet</span>
                </div>
                <span className={`text-xs font-medium ${isOnline ? 'text-green-500' : 'text-red-400'}`}>{isOnline ? 'Online' : 'Offline'}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className={`text-sm ${text}`}>P2P Peers</span>
                </div>
                <span className={`text-xs font-medium text-blue-500`}>{peerCount || 0} visible</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-500" />
                  <span className={`text-sm ${text}`}>Connected</span>
                </div>
                <span className={`text-xs font-medium text-purple-500`}>{connectedPeers || 0} peers</span>
              </div>
            </div>
            <button
              onClick={onOpenChat}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" /> Open P2P Chat
            </button>
          </div>

          {/* Weather */}
          <div className={`rounded-xl border p-4 ${card}`}>
            <p className={`text-xs font-semibold uppercase tracking-wider ${sub} mb-3`}>
              Current Weather {location ? '' : '(Default Location)'}
            </p>
            {weatherLoading ? (
              <div className="flex items-center justify-center h-24">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : weather ? (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <WeatherIcon className="w-10 h-10 text-blue-400" />
                  <div>
                    <p className={`text-3xl font-bold ${text}`}>{weather.temp}°C</p>
                    <p className={`text-xs ${sub}`}>{WEATHER_DESC[weather.code] || 'Unknown'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: Droplets, label: 'Humidity', val: `${weather.humidity}%` },
                    { icon: Wind,     label: 'Wind',     val: `${weather.wind}mph` },
                    { icon: Eye,      label: 'Visibility', val: weather.visibility >= 1000 ? `${(weather.visibility/1000).toFixed(0)}km` : `${weather.visibility}m` },
                  ].map(({ icon: Icon, label, val }) => (
                    <div key={label} className={`rounded-lg p-2 text-center ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <Icon className={`w-3.5 h-3.5 mx-auto mb-1 ${sub}`} />
                      <p className={`text-xs font-medium ${text}`}>{val}</p>
                      <p className={`text-[10px] ${sub}`}>{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className={`text-sm ${sub} text-center py-6`}>Weather unavailable offline</p>
            )}
          </div>

          {/* Quick Emergency Actions */}
          <div className={`rounded-xl border p-4 ${card}`}>
            <p className={`text-xs font-semibold uppercase tracking-wider ${sub} mb-3`}>Quick Actions</p>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_ACTIONS.map(({ id, label, icon: Icon, color, text: t }) => (
                <button
                  key={id}
                  onClick={() => onNavigate(id)}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl ${color} ${t} transition-colors`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
            <a href="tel:911" className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-colors">
              <Phone className="w-4 h-4" /> Call 911
            </a>
          </div>
        </div>

        {/* All Sections Grid */}
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wider ${sub} mb-3`}>All Sections</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {SECTIONS.map(({ id, label, icon: Icon, color, desc }) => (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                className={`rounded-xl border p-4 text-left transition-all hover:scale-[1.02] hover:shadow-md ${card}`}
              >
                <Icon className={`w-6 h-6 mb-2 ${color}`} />
                <p className={`text-sm font-semibold ${text}`}>{label}</p>
                <p className={`text-xs mt-0.5 ${sub}`}>{desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className={`rounded-xl border p-4 ${card}`}>
          <p className={`text-xs font-semibold uppercase tracking-wider ${sub} mb-3`}>Recent Activity</p>
          {recentActivity.length === 0 ? (
            <p className={`text-sm ${sub} text-center py-4`}>No recent activity. Activity from P2P chat and alerts will appear here.</p>
          ) : (
            <div className="space-y-2">
              {recentActivity.slice(0, 5).map(n => (
                <div key={n.id} className={`flex items-center gap-3 py-2 border-b last:border-0 ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${n.type === 'peer_join' ? 'bg-green-500' : n.type === 'alert' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium ${text}`}>{n.title}</p>
                    <p className={`text-xs ${sub} truncate`}>{n.message}</p>
                  </div>
                  <p className={`text-[10px] ${sub} flex-shrink-0`}>{new Date(n.time).toLocaleTimeString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
