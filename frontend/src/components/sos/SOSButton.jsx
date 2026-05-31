import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { alertAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { SOS_COUNTDOWN_SECONDS } from '../../utils/constants';
import toast from 'react-hot-toast';

/**
 * SOSButton — standalone reusable SOS trigger component
 * Can be embedded anywhere (dashboard, floating button, etc.)
 *
 * Props:
 *   size       'sm' | 'md' | 'lg'   (default 'md')
 *   type       emergency type        (default 'other')
 *   floating   boolean               show as floating action button
 */
export default function SOSButton({ size = 'md', type = 'other', floating = false }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [phase, setPhase] = useState('idle'); // idle | confirm | sending | done
  const [countdown, setCountdown] = useState(SOS_COUNTDOWN_SECONDS);
  const [location, setLocation] = useState(null);
  const countRef = useRef(null);

  const sizes = {
    sm: 'w-16 h-16 text-2xl',
    md: 'w-24 h-24 text-3xl',
    lg: 'w-36 h-36 text-2xl',
  };

  // Get location on mount
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      pos => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLocation({ lat: 19.076, lng: 72.877 })
    );
  }, []);

  // Countdown logic
  useEffect(() => {
    if (phase !== 'confirm') return;
    setCountdown(SOS_COUNTDOWN_SECONDS);
    countRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(countRef.current); triggerSOS(); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(countRef.current);
  }, [phase]);

  const triggerSOS = async () => {
    clearInterval(countRef.current);
    setPhase('sending');
    try {
      const res = await alertAPI.triggerSOS({
        type,
        coordinates: [location?.lat || 19.076, location?.lng || 72.877],
        address: 'Getting location...',
        customMessage: user?.customEmergencyMessage,
      });
      setPhase('done');
      toast.success('🚨 SOS Alert Sent!');
      setTimeout(() => navigate(`/citizen/alerts/${res.data.alert._id}`), 1500);
    } catch {
      toast.error('Failed to send SOS. Call 112 immediately!');
      setPhase('idle');
    }
  };

  const cancel = () => {
    clearInterval(countRef.current);
    setPhase('idle');
  };

  if (floating) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setPhase('confirm')}
          className={`${sizes[size]} rounded-full bg-red-600 text-white flex items-center justify-center shadow-2xl hover:bg-red-700 active:scale-95 transition-all sos-btn-pulse`}
          aria-label="SOS Emergency Button"
        >
          🚨
        </button>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {phase === 'idle' && (
        <motion.button
          key="idle"
          onClick={() => setPhase('confirm')}
          className={`${sizes[size]} rounded-full bg-red-600 text-white flex flex-col items-center justify-center shadow-2xl hover:bg-red-700 active:scale-95 transition-all sos-btn-pulse`}
          whileTap={{ scale: 0.95 }}
        >
          <span>🚨</span>
          {size !== 'sm' && <span className="text-xs font-bold mt-1">SOS</span>}
        </motion.button>
      )}

      {phase === 'confirm' && (
        <motion.div key="confirm" initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center">
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute w-32 h-32 rounded-full bg-red-100 animate-ping" />
            <button
              onClick={cancel}
              className="relative w-24 h-24 rounded-full bg-red-600 text-white flex flex-col items-center justify-center shadow-2xl z-10"
            >
              <span className="text-3xl font-black">{countdown}</span>
              <span className="text-xs">CANCEL</span>
            </button>
          </div>
        </motion.div>
      )}

      {phase === 'sending' && (
        <motion.div key="sending" className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        </motion.div>
      )}

      {phase === 'done' && (
        <motion.div key="done" initial={{ scale: 0 }} animate={{ scale: 1 }}
          className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center text-2xl">
          ✅
        </motion.div>
      )}
    </AnimatePresence>
  );
}
