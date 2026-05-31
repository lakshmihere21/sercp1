import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { alertAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const EMERGENCY_TYPES = [
  { value: 'medical', label: 'Medical', icon: '🏥', color: 'border-blue-400 bg-blue-50', desc: 'Heart attack, injury, illness' },
  { value: 'accident', label: 'Accident', icon: '🚗', color: 'border-orange-400 bg-orange-50', desc: 'Road/vehicle accident' },
  { value: 'fire', label: 'Fire', icon: '🔥', color: 'border-red-400 bg-red-50', desc: 'Fire emergency' },
  { value: 'crime', label: 'Crime', icon: '🚔', color: 'border-slate-400 bg-slate-50', desc: 'Theft, assault, robbery' },
  { value: 'women_safety', label: 'Women Safety', icon: '👩', color: 'border-pink-400 bg-pink-50', desc: 'Harassment, stalking' },
  { value: 'natural_disaster', label: 'Natural Disaster', icon: '🌪️', color: 'border-green-400 bg-green-50', desc: 'Flood, earthquake' },
  { value: 'other', label: 'Other', icon: '⚠️', color: 'border-yellow-400 bg-yellow-50', desc: 'Other emergencies' },
];

export default function SOSPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState('type'); // type | confirm | sending | sent
  const [selectedType, setSelectedType] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [description, setDescription] = useState('');
  const [customMessage, setCustomMessage] = useState(user?.customEmergencyMessage || '');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const countdownRef = useRef(null);

  // Get GPS on load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy }),
        (err) => { setLocationError('Location access denied. Using default location.'); setLocation({ latitude: 19.076, longitude: 72.877 }); },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLocationError('Geolocation not supported');
      setLocation({ latitude: 19.076, longitude: 72.877 });
    }
  }, []);

  // Countdown for auto-send
  useEffect(() => {
    if (step === 'confirm') {
      setCountdown(5);
      countdownRef.current = setInterval(() => {
        setCountdown(c => {
          if (c <= 1) { clearInterval(countdownRef.current); handleSendSOS(); return 0; }
          return c - 1;
        });
      }, 1000);
    }
    return () => clearInterval(countdownRef.current);
  }, [step]);

  const handleSendSOS = async () => {
    clearInterval(countdownRef.current);
    setStep('sending');
    setLoading(true);
    try {
      const res = await alertAPI.triggerSOS({
        type: selectedType,
        coordinates: [location.latitude, location.longitude],
        address: `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`,
        description,
        customMessage: customMessage || undefined,
      });
      setStep('sent');
      toast.success('🚨 SOS Alert Sent! Help is on the way.');
      setTimeout(() => navigate(`/citizen/alerts/${res.data.alert._id}`), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send SOS');
      setStep('type');
    } finally {
      setLoading(false);
    }
  };

  const cancelCountdown = () => {
    clearInterval(countdownRef.current);
    setStep('type');
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          Emergency SOS System
        </div>
        <h1 className="text-xl font-bold text-slate-900">Trigger Emergency Alert</h1>
        <p className="text-slate-600 mt-2 text-sm">
          {location ? `📍 Location ready (${location.accuracy ? `±${Math.round(location.accuracy)}m` : 'GPS'})` : '⏳ Getting your location...'}
        </p>
        {locationError && <p className="text-yellow-600 text-xs mt-1">{locationError}</p>}
      </div>

      <AnimatePresence mode="wait">
        {/* ── Step 1: Choose Type ── */}
        {step === 'type' && (
          <motion.div key="type" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <p className="font-semibold text-slate-700 mb-3">Select Emergency Type</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {EMERGENCY_TYPES.map(t => (
                <button key={t.value} onClick={() => setSelectedType(t.value)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all hover:shadow-md ${selectedType === t.value ? 'border-red-500 bg-red-50 shadow-md' : t.color}`}>
                  <div className="text-2xl mb-2">{t.icon}</div>
                  <p className="font-bold text-sm text-slate-800">{t.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{t.desc}</p>
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description (optional)</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  className="input-field resize-none h-20" placeholder="Briefly describe the emergency..." />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Emergency Message</label>
                <input value={customMessage} onChange={e => setCustomMessage(e.target.value)}
                  className="input-field" placeholder="I need immediate help!" />
              </div>
            </div>

            <button onClick={() => { if (!selectedType) return toast.error('Select emergency type'); if (!location) return toast.error('Waiting for location...'); setStep('confirm'); }}
              className="w-full mt-6 bg-red-600 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-red-700 transition-all shadow-xl shadow-red-200 active:scale-95">
              🚨 TRIGGER SOS
            </button>
            <p className="text-center text-slate-400 text-xs mt-3">This will alert emergency responders and your contacts</p>
          </motion.div>
        )}

        {/* ── Step 2: Confirm ── */}
        {step === 'confirm' && (
          <motion.div key="confirm" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
            <div className="text-center py-8">
              {/* Pulsing SOS button */}
              <div className="relative inline-flex items-center justify-center mb-6">
                <div className="w-48 h-48 rounded-full bg-red-100 animate-ping absolute" />
                <div className="w-36 h-36 rounded-full bg-red-200 animate-ping absolute animation-delay-75" />
                <button onClick={cancelCountdown}
                  className="relative w-36 h-36 rounded-full bg-red-600 text-white flex flex-col items-center justify-center shadow-2xl z-10 hover:bg-red-700 transition-colors">
                  <span className="text-2xl font-bold">{countdown}</span>
                  <span className="text-xs font-semibold mt-1">TAP TO CANCEL</span>
                </button>
              </div>

              <h2 className="text-xl font-bold text-slate-900 mb-2">Sending SOS in {countdown}s</h2>
              <p className="text-slate-600 mb-2">Emergency type: <strong>{EMERGENCY_TYPES.find(t => t.value === selectedType)?.label}</strong></p>
              <p className="text-slate-500 text-sm">📍 {location?.latitude?.toFixed(4)}, {location?.longitude?.toFixed(4)}</p>

              <div className="flex gap-3 mt-8">
                <button onClick={cancelCountdown}
                  className="flex-1 border-2 border-slate-300 text-slate-600 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-colors">
                  ✕ Cancel
                </button>
                <button onClick={handleSendSOS}
                  className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors">
                  🚨 Send Now
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Step 3: Sending ── */}
        {step === 'sending' && (
          <motion.div key="sending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <div className="w-20 h-20 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h2 className="text-xl font-bold text-slate-900">Sending SOS Alert...</h2>
            <p className="text-slate-500 mt-2">Notifying responders and emergency contacts</p>
          </motion.div>
        )}

        {/* ── Step 4: Sent ── */}
        {step === 'sent' && (
          <motion.div key="sent" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-2xl mx-auto mb-6">✅</div>
            <h2 className="text-xl font-bold text-green-700">SOS Alert Sent!</h2>
            <p className="text-slate-600 mt-2">Help is on the way. Redirecting to tracking...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emergency Quickdial */}
      <div className="card bg-red-50 border-red-100">
        <p className="font-semibold text-red-800 mb-3">🆘 Quick Call</p>
        <div className="grid grid-cols-2 gap-2">
          {[['112', 'National Emergency'], ['100', 'Police'], ['108', 'Ambulance'], ['101', 'Fire']].map(([num, label]) => (
            <a key={num} href={`tel:${num}`}
              className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-red-200 hover:bg-red-50 transition-colors">
              <span className="font-mono font-bold text-red-600 text-sm">{num}</span>
              <span className="text-slate-600 text-xs">{label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
