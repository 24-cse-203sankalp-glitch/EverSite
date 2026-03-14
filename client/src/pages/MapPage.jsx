import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Droplets, Heart, Home, Shield, Trash2, Ruler, Wifi, WifiOff } from 'lucide-react';

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ---- IndexedDB tile cache ----
const DB_NAME = 'eversite-tiles';
const DB_STORE = 'tiles';
let tileDB = null;

function openTileDB() {
  if (tileDB) return Promise.resolve(tileDB);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = e => e.target.result.createObjectStore(DB_STORE);
    req.onsuccess = e => { tileDB = e.target.result; resolve(tileDB); };
    req.onerror = reject;
  });
}

async function getTile(key) {
  const db = await openTileDB();
  return new Promise((resolve) => {
    const tx = db.transaction(DB_STORE, 'readonly');
    const req = tx.objectStore(DB_STORE).get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => resolve(null);
  });
}

async function putTile(key, blob) {
  const db = await openTileDB();
  return new Promise((resolve) => {
    const tx = db.transaction(DB_STORE, 'readwrite');
    tx.objectStore(DB_STORE).put(blob, key);
    tx.oncomplete = resolve;
    tx.onerror = resolve;
  });
}

// Custom tile layer that caches to IndexedDB
class CachingTileLayer extends L.TileLayer {
  createTile(coords, done) {
    const img = document.createElement('img');
    img.setAttribute('role', 'presentation');
    const url = this.getTileUrl(coords);
    const key = `${coords.z}/${coords.x}/${coords.y}`;

    getTile(key).then(cached => {
      if (cached) {
        img.src = URL.createObjectURL(cached);
        done(null, img);
      } else if (navigator.onLine) {
        fetch(url)
          .then(r => r.blob())
          .then(blob => {
            putTile(key, blob);
            img.src = URL.createObjectURL(blob);
            done(null, img);
          })
          .catch(e => done(e, img));
      } else {
        // Offline and not cached — show blank tile
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        done(null, img);
      }
    });
    return img;
  }
}

function OfflineTileLayer() {
  const map = useMap();
  useEffect(() => {
    const layer = new CachingTileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
        subdomains: ['a', 'b', 'c'],
      }
    );
    layer.addTo(map);
    return () => map.removeLayer(layer);
  }, [map]);
  return null;
}

const MARKER_TYPES = {
  safe: { label: 'Safe Zone', color: '#22c55e', icon: Shield },
  water: { label: 'Water Source', color: '#3b82f6', icon: Droplets },
  hospital: { label: 'Hospital / Medical', color: '#ef4444', icon: Heart },
  shelter: { label: 'Shelter', color: '#f59e0b', icon: Home },
  custom: { label: 'Custom Pin', color: '#8b5cf6', icon: MapPin },
};

const createColoredIcon = (color) =>
  L.divIcon({
    className: '',
    html: `<div style="width:28px;height:28px;background:${color};border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -30],
  });

function getPulsingIcon() {
  return L.divIcon({
    className: 'pulsing-location-icon',
    html: `<div class="pulse-ring"></div><div class="pulse-dot"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

function LocationTracker({ onLocation }) {
  const map = useMap();
  const hasFlown = useRef(false);
  useEffect(() => {
    map.locate({ watch: true, enableHighAccuracy: true, maximumAge: 5000 });
    map.on('locationfound', (e) => {
      onLocation(e.latlng, e.accuracy);
      // Auto-fly to user location on first fix
      if (!hasFlown.current) {
        hasFlown.current = true;
        map.flyTo(e.latlng, 16, { duration: 2 });
      }
    });
    map.on('locationerror', (e) => {
      console.warn('Location error:', e.message);
    });
    return () => map.stopLocate();
  }, [map, onLocation]);
  return null;
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({ click: (e) => onMapClick(e.latlng) });
  return null;
}

function FlyToLocation({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target, 17, { duration: 1.5 });
  }, [target, map]);
  return null;
}

function haversineDistance(a, b) {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  const d = 2 * R * Math.asin(Math.sqrt(x));
  return d < 1000 ? `${d.toFixed(0)} m` : `${(d / 1000).toFixed(2)} km`;
}

const STORAGE_KEY = 'eversite-map-markers';

export default function MapPage({ darkMode }) {
  const [userLocation, setUserLocation] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [markers, setMarkers] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
  });
  const [addingType, setAddingType] = useState(null);
  const [pendingLatLng, setPendingLatLng] = useState(null);
  const [pendingLabel, setPendingLabel] = useState('');
  const [flyTarget, setFlyTarget] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(markers));
  }, [markers]);

  const handleLocation = useCallback((latlng, acc) => {
    setUserLocation(latlng);
    setAccuracy(acc);
  }, []);

  const handleMapClick = useCallback((latlng) => {
    if (!addingType) return;
    setPendingLatLng(latlng);
  }, [addingType]);

  const confirmMarker = () => {
    if (!pendingLatLng) return;
    const newMarker = {
      id: Date.now(),
      type: addingType,
      lat: pendingLatLng.lat,
      lng: pendingLatLng.lng,
      label: pendingLabel || MARKER_TYPES[addingType].label,
    };
    setMarkers(prev => [...prev, newMarker]);
    setPendingLatLng(null);
    setPendingLabel('');
    setAddingType(null);
  };

  const deleteMarker = (id) => setMarkers(prev => prev.filter(m => m.id !== id));

  const goToMyLocation = () => {
    if (userLocation) setFlyTarget({ ...userLocation, _t: Date.now() });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-73px)] min-h-0">
      {/* Top bar */}
      <div className={`flex items-center gap-3 px-4 py-2 border-b ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-200'} flex-wrap`}>
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          <span className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>Offline Map</span>
        </div>
        <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          {isOnline ? 'Online — tiles caching' : 'Offline — cached tiles'}
        </div>
        {userLocation && (
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            📍 {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}
            {accuracy && ` ±${accuracy.toFixed(0)}m`}
          </div>
        )}
        <button
          onClick={goToMyLocation}
          disabled={!userLocation}
          className="ml-auto flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg disabled:opacity-40 hover:bg-blue-700 transition-colors"
        >
          <Navigation className="w-3.5 h-3.5" /> My Location
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Sidebar controls */}
        <div className={`w-56 flex-shrink-0 border-r overflow-y-auto p-3 space-y-3 ${darkMode ? 'bg-black border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Add Marker</p>
            <div className="space-y-1">
              {Object.entries(MARKER_TYPES).map(([type, { label, color, icon: Icon }]) => (
                <button
                  key={type}
                  onClick={() => { setAddingType(addingType === type ? null : type); setPendingLatLng(null); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors border ${
                    addingType === type
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-700'
                      : darkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-900' : 'border-gray-200 text-gray-700 hover:bg-white'
                  }`}
                >
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>
            {addingType && (
              <p className="text-xs text-blue-600 mt-2 text-center animate-pulse">
                Click on map to place marker
              </p>
            )}
          </div>

          {pendingLatLng && (
            <div className={`p-3 rounded-lg border ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
              <p className={`text-xs font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Label (optional)</p>
              <input
                value={pendingLabel}
                onChange={e => setPendingLabel(e.target.value)}
                placeholder={MARKER_TYPES[addingType]?.label}
                className={`w-full px-2 py-1.5 text-xs rounded border ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-1 focus:ring-blue-500`}
              />
              <div className="flex gap-2 mt-2">
                <button onClick={confirmMarker} className="flex-1 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">Add</button>
                <button onClick={() => { setPendingLatLng(null); setPendingLabel(''); }} className="flex-1 py-1.5 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300">Cancel</button>
              </div>
            </div>
          )}

          <div>
            <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Markers ({markers.length})
            </p>
            {markers.length === 0 && (
              <p className={`text-xs ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>No markers yet</p>
            )}
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {markers.map(m => (
                <div
                  key={m.id}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer ${darkMode ? 'hover:bg-gray-900' : 'hover:bg-white'}`}
                  onClick={() => setFlyTarget({ lat: m.lat, lng: m.lng, _t: Date.now() })}
                >
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: MARKER_TYPES[m.type]?.color }} />
                  <span className={`text-xs flex-1 truncate ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{m.label}</span>
                  <button
                    onClick={e => { e.stopPropagation(); deleteMarker(m.id); }}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {userLocation && markers.length > 0 && (
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <Ruler className="w-3 h-3 inline mr-1" />Distance from me
              </p>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {markers.map(m => (
                  <div key={m.id} className={`flex justify-between text-xs px-2 py-1 rounded ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span className="truncate flex-1">{m.label}</span>
                    <span className="font-mono text-blue-600 ml-2 flex-shrink-0">
                      {haversineDistance(userLocation, { lat: m.lat, lng: m.lng })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Map */}
        <div className="flex-1 relative" style={{ minHeight: 0 }}>
        <style>{`
            .pulsing-location-icon { position: relative; }
            .pulse-ring {
              position: absolute; inset: 0;
              background: #3b82f6; border-radius: 50%;
              animation: mapPulse 1.5s ease-out infinite;
              opacity: 0.4;
            }
            .pulse-dot {
              position: absolute; inset: 4px;
              background: #3b82f6; border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 0 6px rgba(59,130,246,0.8);
            }
            @keyframes mapPulse {
              0% { transform: scale(1); opacity: 0.4; }
              100% { transform: scale(2.8); opacity: 0; }
            }
            .leaflet-container { background: ${darkMode ? '#1a1a2e' : '#e8f4f8'}; }
            .leaflet-tile-pane { opacity: 1; }
          `}</style>
          <MapContainer
            center={[20, 0]}
            zoom={3}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
          >
            <OfflineTileLayer />
            <LocationTracker onLocation={handleLocation} />
            <MapClickHandler onMapClick={handleMapClick} />
            {flyTarget && <FlyToLocation target={flyTarget} />}

            {userLocation && (
              <>
                <Marker position={userLocation} icon={getPulsingIcon()}>
                  <Popup>
                    <strong>📍 You are here</strong><br />
                    {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}<br />
                    {accuracy && `Accuracy: ±${accuracy.toFixed(0)}m`}
                  </Popup>
                </Marker>
                {accuracy && (
                  <Circle
                    center={userLocation}
                    radius={accuracy}
                    pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.1, weight: 1 }}
                  />
                )}
              </>
            )}

            {markers.map(m => (
              <Marker
                key={m.id}
                position={[m.lat, m.lng]}
                icon={createColoredIcon(MARKER_TYPES[m.type]?.color || '#8b5cf6')}
              >
                <Popup>
                  <div style={{ minWidth: 140 }}>
                    <strong>{m.label}</strong><br />
                    <span style={{ color: '#6b7280', fontSize: 11 }}>{MARKER_TYPES[m.type]?.label}</span><br />
                    <span style={{ fontSize: 11 }}>{m.lat.toFixed(5)}, {m.lng.toFixed(5)}</span>
                    {userLocation && (
                      <><br /><span style={{ color: '#3b82f6', fontSize: 11 }}>
                        Distance: {haversineDistance(userLocation, { lat: m.lat, lng: m.lng })}
                      </span></>
                    )}
                    <br />
                    <button
                      onClick={() => deleteMarker(m.id)}
                      style={{ marginTop: 6, color: '#ef4444', fontSize: 11, cursor: 'pointer', background: 'none', border: 'none' }}
                    >
                      🗑 Remove
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {addingType && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-blue-600 text-white text-xs px-4 py-2 rounded-full shadow-lg pointer-events-none">
              Click anywhere on the map to place a {MARKER_TYPES[addingType]?.label}
            </div>
          )}
          {!isOnline && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000] bg-orange-600 text-white text-xs px-4 py-2 rounded-full shadow-lg pointer-events-none flex items-center gap-2">
              <WifiOff className="w-3.5 h-3.5" />
              Offline — showing cached tiles only. Uncached areas will appear blank.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
