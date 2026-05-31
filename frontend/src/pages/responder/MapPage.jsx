import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { alertAPI } from '../../services/api';
import { getSocket, emitLocationUpdate } from '../../services/socket';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const createIcon = (emoji, size = 32) => L.divIcon({
  html: `<div style="font-size:${size}px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4))">${emoji}</div>`,
  className: 'bg-transparent border-none',
  iconAnchor: [size / 2, size],
});

const SEVERITY_COLORS = { CRITICAL: '#dc2626', HIGH: '#ea580c', MEDIUM: '#d97706', LOW: '#16a34a' };
const TYPE_ICONS = { medical: '🏥', accident: '🚗', fire: '🔥', crime: '🚔', women_safety: '👩', natural_disaster: '🌪️', other: '⚠️' };

function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => { map.setView([lat, lng], 14); }, [lat, lng]);
  return null;
}

export default function ResponderMapPage() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [myLocation, setMyLocation] = useState(null);
  const [liveLocations, setLiveLocations] = useState({});
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState(null);

  useEffect(() => {
    let watchId;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        setMyLocation({ lat: latitude, lng: longitude });

        try {
          const res = await alertAPI.getNearby({ lat: latitude, lng: longitude, radius: 30 });
          setAlerts(res.data.data || []);
        } catch {}
        setLoading(false);

        // Watch position and broadcast
        watchId = navigator.geolocation.watchPosition((p) => {
          const loc = { lat: p.coords.latitude, lng: p.coords.longitude };
          setMyLocation(loc);
          emitLocationUpdate({ latitude: p.coords.latitude, longitude: p.coords.longitude });
        }, null, { enableHighAccuracy: true, maximumAge: 3000 });
      }, () => {
        setMyLocation({ lat: 19.076, lng: 72.877 });
        setLoading(false);
      });
    }

    // Socket events
    const socket = getSocket();
    if (socket) {
      socket.on('NEW_EMERGENCY_ALERT', ({ alert }) => {
        setAlerts(prev => [alert, ...prev]);
      });
      socket.on('TRACK_USER', (data) => {
        setLiveLocations(prev => ({ ...prev, [data.userId]: data }));
      });
      socket.on('ALERT_STATUS_UPDATED', ({ alertId, status }) => {
        setAlerts(prev => prev.map(a => a._id === alertId ? { ...a, status } : a));
      });
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      socket?.off('NEW_EMERGENCY_ALERT');
      socket?.off('TRACK_USER');
      socket?.off('ALERT_STATUS_UPDATED');
    };
  }, []);

  const filtered = filter === 'ALL' ? alerts : alerts.filter(a => a.type === filter.toLowerCase() || a.severity === filter);
  const activeAlerts = alerts.filter(a => a.status === 'ACTIVE');

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Live Emergency Map</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm text-slate-500">{activeAlerts.length} active emergencies in 30km radius</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {['ALL', 'ACTIVE', 'CRITICAL', 'HIGH'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === f ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 flex-1">
        {/* Map */}
        <div className="lg:col-span-2 h-96 lg:h-full min-h-80 rounded-2xl overflow-hidden shadow-sm border border-slate-100">
          {loading ? (
            <div className="h-full flex items-center justify-center bg-slate-50">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Getting your location...</p>
              </div>
            </div>
          ) : myLocation ? (
            <MapContainer center={[myLocation.lat, myLocation.lng]} zoom={13} className="h-full w-full">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='© OpenStreetMap' />
              <RecenterMap lat={myLocation.lat} lng={myLocation.lng} />

              {/* My Location */}
              <Marker position={[myLocation.lat, myLocation.lng]} icon={createIcon('🛡️', 36)}>
                <Popup><b>Your Location</b><br />Responder: {user?.name}</Popup>
              </Marker>
              <Circle center={[myLocation.lat, myLocation.lng]} radius={20000} color="#3b82f6" fillOpacity={0.05} weight={1} />

              {/* Alert Markers */}
              {filtered.map(alert => {
                const lat = alert.location?.coordinates?.[1];
                const lng = alert.location?.coordinates?.[0];
                if (!lat || !lng) return null;
                return (
                  <Marker key={alert._id} position={[lat, lng]} icon={createIcon(TYPE_ICONS[alert.type] || '⚠️', 32)}
                    eventHandlers={{ click: () => setSelectedAlert(alert) }}>
                    <Popup>
                      <div className="min-w-max">
                        <p className="font-bold text-sm">{alert.type?.replace('_', ' ').toUpperCase()}</p>
                        <p className="text-xs text-red-600 font-semibold">{alert.severity}</p>
                        <p className="text-xs text-slate-600 mt-1">{alert.address}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{alert.citizenName}</p>
                        <Link to={`/citizen/alerts/${alert._id}`}
                          className="block mt-2 bg-orange-500 text-white text-center py-1 rounded text-xs font-semibold hover:bg-orange-600">
                          Respond →
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              {/* Live tracked users */}
              {Object.values(liveLocations).map(loc => (
                <Marker key={loc.userId} position={[loc.latitude, loc.longitude]} icon={createIcon('📍', 24)}>
                  <Popup>{loc.name} ({loc.role})</Popup>
                </Marker>
              ))}
            </MapContainer>
          ) : null}
        </div>

        {/* Sidebar - Alert List */}
        <div className="space-y-3 overflow-y-auto max-h-96 lg:max-h-full">
          <p className="font-semibold text-slate-700 text-sm sticky top-0 bg-slate-50 py-1">{filtered.length} Alerts</p>
          {filtered.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              <p className="text-3xl mb-2">✅</p>
              <p className="text-sm">No alerts matching filter</p>
            </div>
          )}
          {filtered.map(alert => (
            <div key={alert._id}
              onClick={() => setSelectedAlert(alert)}
              className={`bg-white rounded-xl p-4 shadow-sm border cursor-pointer transition-all hover:shadow-md ${
                selectedAlert?._id === alert._id ? 'border-orange-400' : 'border-slate-100'
              }`}>
              <div className="flex items-start gap-3">
                <span className="text-xl">{TYPE_ICONS[alert.type] || '⚠️'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-800 text-sm capitalize">{alert.type?.replace('_', ' ')}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold`}
                      style={{ background: SEVERITY_COLORS[alert.severity] + '20', color: SEVERITY_COLORS[alert.severity] }}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{alert.address}</p>
                  <p className="text-xs text-slate-400 mt-1">{new Date(alert.createdAt).toLocaleTimeString()}</p>
                  <Link to={`/citizen/alerts/${alert._id}`}
                    className="inline-block mt-2 bg-orange-500 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-orange-600 transition-colors">
                    Respond →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
