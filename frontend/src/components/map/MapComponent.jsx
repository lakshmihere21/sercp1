import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MAP_CONFIG } from '../../utils/constants';

// Create custom map icon from emoji
export const createIcon = (emoji, size = 32) => L.divIcon({
  html: `<div style="font-size:${size}px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.35))">${emoji}</div>`,
  className: 'bg-transparent border-none',
  iconAnchor: [size / 2, size],
});

const TYPE_ICONS = {
  medical: '🏥', accident: '🚗', fire: '🔥', crime: '🚔',
  women_safety: '👩', natural_disaster: '🌪️', other: '⚠️',
};

// Auto-recenter map when center prop changes
function RecenterMap({ lat, lng, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) map.setView([lat, lng], zoom || map.getZoom());
  }, [lat, lng, zoom]);
  return null;
}

/**
 * MapComponent — reusable Leaflet map with citizen/responder markers
 *
 * Props:
 *   center        [lat, lng]   Map center
 *   zoom          number       Zoom level
 *   height        string       CSS height (default '400px')
 *   citizenMarker { lat, lng, label }
 *   responderMarker { lat, lng, label }
 *   alertMarkers  [{ lat, lng, type, alertId, label }]
 *   liveLocations { [userId]: { latitude, longitude, name, role } }
 *   showRoute     boolean      Draw line between citizen and responder
 *   className     string       Extra CSS classes
 */
export default function MapComponent({
  center = MAP_CONFIG.DEFAULT_CENTER,
  zoom = MAP_CONFIG.DEFAULT_ZOOM,
  height = '400px',
  citizenMarker,
  responderMarker,
  alertMarkers = [],
  liveLocations = {},
  showRoute = false,
  className = '',
}) {
  return (
    <div className={`rounded-2xl overflow-hidden shadow-sm border border-slate-100 ${className}`} style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full"
        zoomControl={true}
      >
        <TileLayer
          url={MAP_CONFIG.TILE_URL}
          attribution={MAP_CONFIG.ATTRIBUTION}
        />

        {/* Auto-recenter */}
        {citizenMarker && (
          <RecenterMap lat={citizenMarker.lat} lng={citizenMarker.lng} />
        )}

        {/* Citizen marker */}
        {citizenMarker && (
          <Marker position={[citizenMarker.lat, citizenMarker.lng]} icon={createIcon('🔴', 36)}>
            <Popup>
              <strong>📍 {citizenMarker.label || 'Your Location'}</strong>
            </Popup>
          </Marker>
        )}

        {/* Responder marker */}
        {responderMarker && (
          <Marker position={[responderMarker.lat, responderMarker.lng]} icon={createIcon('🚑', 32)}>
            <Popup>
              <strong>🛡️ {responderMarker.label || 'Responder'}</strong>
            </Popup>
          </Marker>
        )}

        {/* Route line */}
        {showRoute && citizenMarker && responderMarker && (
          <Polyline
            positions={[
              [citizenMarker.lat, citizenMarker.lng],
              [responderMarker.lat, responderMarker.lng],
            ]}
            color="#2563eb"
            dashArray="8"
            weight={3}
          />
        )}

        {/* Alert markers */}
        {alertMarkers.map((alert, i) => (
          <Marker key={alert.alertId || i} position={[alert.lat, alert.lng]}
            icon={createIcon(TYPE_ICONS[alert.type] || '⚠️', 28)}>
            <Popup>
              <p className="font-bold text-sm">{alert.label || alert.type}</p>
            </Popup>
          </Marker>
        ))}

        {/* Live tracked users */}
        {Object.values(liveLocations).map((loc) => (
          <Marker key={loc.userId || loc.name}
            position={[loc.latitude, loc.longitude]}
            icon={createIcon(loc.role === 'responder' ? '🛡️' : '📍', 24)}>
            <Popup>{loc.name} ({loc.role})</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
