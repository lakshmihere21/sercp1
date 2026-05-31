import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { alertAPI, chatAPI } from '../../services/api';
import { getSocket, joinAlertRoom, leaveAlertRoom, emitLocationUpdate, emitSendMessage, emitTyping } from '../../services/socket';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

// Custom map icons
const createIcon = (emoji, size = 32) => L.divIcon({
  html: `<div style="font-size:${size}px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))">${emoji}</div>`,
  className: 'bg-transparent border-none',
  iconAnchor: [size / 2, size],
});

const STATUS_STEPS = ['ACTIVE', 'RESPONDER_ASSIGNED', 'IN_PROGRESS', 'ARRIVED', 'RESOLVED'];

export default function AlertTrackingPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [alert, setAlert] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [responderLocation, setResponderLocation] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [tab, setTab] = useState('map'); // map | chat | timeline
  const chatEndRef = useRef(null);
  const trackingRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [alertRes, chatRes] = await Promise.all([
          alertAPI.getOne(id),
          chatAPI.getMessages(id),
        ]);
        setAlert(alertRes.data.data);
        setMessages(chatRes.data.data || []);
      } catch (err) {
        toast.error('Failed to load alert');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // Socket events
  useEffect(() => {
    joinAlertRoom(id);
    const socket = getSocket();
    if (!socket) return;

    socket.on('STATUS_UPDATE', ({ status }) => {
      setAlert(prev => prev ? { ...prev, status } : prev);
      toast.success(`Status updated: ${status}`);
    });

    socket.on('LOCATION_UPDATE', (data) => {
      if (data.role === 'responder') setResponderLocation({ lat: data.latitude, lng: data.longitude });
    });

    socket.on('NEW_MESSAGE', (msg) => {
      setMessages(prev => [...prev, msg]);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    socket.on('USER_TYPING', ({ name, isTyping }) => {
      if (isTyping) setIsTyping(`${name} is typing...`);
      else setIsTyping(false);
    });

    return () => {
      leaveAlertRoom(id);
      socket.off('STATUS_UPDATE');
      socket.off('LOCATION_UPDATE');
      socket.off('NEW_MESSAGE');
      socket.off('USER_TYPING');
    };
  }, [id]);

  // Citizen live location tracking
  useEffect(() => {
    if (!alert || alert.status === 'RESOLVED' || alert.status === 'CANCELLED') return;
    if (!navigator.geolocation) return;

    trackingRef.current = navigator.geolocation.watchPosition(
      (pos) => emitLocationUpdate({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, alertId: id }),
      null,
      { enableHighAccuracy: true, maximumAge: 5000 }
    );

    return () => {
      if (trackingRef.current) navigator.geolocation.clearWatch(trackingRef.current);
    };
  }, [alert?.status, id]);

  const sendMessage = () => {
    if (!newMsg.trim()) return;
    emitSendMessage({ alertId: id, message: newMsg.trim(), type: 'text' });
    setNewMsg('');
    emitTyping(id, false);
  };

  const handleTyping = (val) => {
    setNewMsg(val);
    emitTyping(id, val.length > 0);
  };

  const statusIndex = STATUS_STEPS.indexOf(alert?.status);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full" /></div>;
  if (!alert) return <div className="text-center py-16 text-slate-500">Alert not found</div>;

  const citizenCoords = alert.location?.coordinates ? [alert.location.coordinates[1], alert.location.coordinates[0]] : null;

  return (
    <div className="space-y-4">
      {/* Alert Header */}
      <div className="card bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl animate-pulse">🚨</span>
              <h1 className="font-semibold text-base">{alert.type?.replace('_', ' ').toUpperCase()}</h1>
            </div>
            <p className="text-red-100 text-sm">{alert.alertId}</p>
          </div>
          <div className="text-right">
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${
              alert.status === 'RESOLVED' ? 'bg-green-500' :
              alert.status === 'CANCELLED' ? 'bg-slate-500' : 'bg-white/20'
            }`}>
              {alert.status?.replace('_', ' ')}
            </span>
            <p className="text-red-100 text-xs mt-1">{alert.severity} SEVERITY</p>
          </div>
        </div>
      </div>

      {/* Status Progress */}
      <div className="card">
        <p className="font-semibold text-slate-700 text-sm mb-3">Response Progress</p>
        <div className="flex items-center gap-1">
          {STATUS_STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i < statusIndex ? 'bg-green-500 text-white' :
                i === statusIndex ? 'bg-red-600 text-white animate-pulse' :
                'bg-slate-100 text-slate-400'
              }`}>
                {i < statusIndex ? '✓' : i + 1}
              </div>
              {i < STATUS_STEPS.length - 1 && (
                <div className={`flex-1 h-1 mx-1 rounded ${i < statusIndex ? 'bg-green-400' : 'bg-slate-100'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {STATUS_STEPS.map(s => (
            <span key={s} className="text-xs text-slate-400 text-center" style={{ flex: 1 }}>{s.split('_')[0]}</span>
          ))}
        </div>
      </div>

      {/* Tab Nav */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
        {[['map', '🗺️ Map'], ['chat', '💬 Chat'], ['timeline', '📋 Timeline']].map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>
            {l}
          </button>
        ))}
      </div>

      {/* Map Tab */}
      {tab === 'map' && citizenCoords && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-80 rounded-2xl overflow-hidden shadow-sm border border-slate-100">
          <MapContainer center={citizenCoords} zoom={15} className="h-full w-full">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={citizenCoords} icon={createIcon('🔴', 36)}>
              <Popup><b>Your Location</b><br />{alert.address}</Popup>
            </Marker>
            {responderLocation && (
              <>
                <Marker position={[responderLocation.lat, responderLocation.lng]} icon={createIcon('🚑', 32)}>
                  <Popup><b>Responder Location</b></Popup>
                </Marker>
                <Polyline positions={[citizenCoords, [responderLocation.lat, responderLocation.lng]]} color="#2563eb" dashArray="8" />
              </>
            )}
          </MapContainer>
        </motion.div>
      )}

      {/* Chat Tab */}
      {tab === 'chat' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card">
          <div className="h-64 overflow-y-auto mb-3 space-y-3 pr-1">
            {messages.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <p className="text-3xl mb-2">💬</p>
                <p className="text-sm">No messages yet. Say hello!</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender?._id === user?._id || msg.sender === user?._id ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                  msg.senderRole === 'admin' ? 'bg-purple-100 text-purple-800' :
                  msg.senderRole === 'responder' ? 'bg-blue-100 text-blue-800' :
                  msg.sender?._id === user?._id || msg.sender === user?._id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'
                }`}>
                  {msg.senderName && msg.senderName !== user?.name && (
                    <p className="text-xs font-semibold opacity-70 mb-1">{msg.senderName}</p>
                  )}
                  <p>{msg.message}</p>
                  <p className="text-xs opacity-60 mt-1 text-right">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            ))}
            {isTyping && <p className="text-xs text-slate-400 italic">{isTyping}</p>}
            <div ref={chatEndRef} />
          </div>
          <div className="flex gap-2">
            <input value={newMsg} onChange={e => handleTyping(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              className="input-field" placeholder="Type a message..." />
            <button onClick={sendMessage} className="btn-primary px-4 py-2">→</button>
          </div>
        </motion.div>
      )}

      {/* Timeline Tab */}
      {tab === 'timeline' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card">
          <h3 className="font-semibold text-slate-800 mb-4">Incident Timeline</h3>
          {alert.timeline?.length === 0 ? (
            <p className="text-slate-400 text-sm">No timeline events yet</p>
          ) : (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100" />
              <div className="space-y-4">
                {alert.timeline?.map((event, i) => (
                  <div key={i} className="flex gap-4 items-start pl-10 relative">
                    <div className="absolute left-2 w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-sm" />
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800 text-sm">{event.event?.replace(/_/g, ' ')}</p>
                      {event.description && <p className="text-slate-500 text-xs mt-0.5">{event.description}</p>}
                      <p className="text-slate-400 text-xs mt-1">{new Date(event.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Responder Info */}
      {alert.assignedResponder && (
        <div className="card bg-blue-50 border-blue-100">
          <p className="font-semibold text-blue-800 mb-3">🚑 Assigned Responder</p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
              {alert.assignedResponder.name?.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-slate-800">{alert.assignedResponder.name}</p>
              <a href={`tel:${alert.assignedResponder.phone}`} className="text-blue-600 text-sm font-medium">
                📞 {alert.assignedResponder.phone}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
