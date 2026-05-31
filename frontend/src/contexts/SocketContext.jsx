import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getSocket } from '../services/socket';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [onlineCount, setOnlineCount] = useState(0);
  const [newAlerts, setNewAlerts] = useState([]);
  const [liveLocations, setLiveLocations] = useState({});
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    if (!socket) return;

    const handleNewAlert = (data) => {
      setNewAlerts(prev => [data.alert, ...prev]);
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-slide-up' : 'opacity-0'} bg-red-600 text-white px-5 py-4 rounded-xl shadow-xl flex items-center gap-3 max-w-sm`}>
          <span className="text-2xl">🚨</span>
          <div>
            <p className="font-bold text-sm">NEW EMERGENCY ALERT</p>
            <p className="text-xs opacity-90">{data.alert?.type?.replace('_', ' ').toUpperCase()} - {data.alert?.address?.substring(0, 50)}</p>
          </div>
        </div>
      ), { duration: 6000 });
    };

    const handleOnlineCount = ({ count }) => setOnlineCount(count);
    const handleLocationUpdate = (data) => {
      setLiveLocations(prev => ({ ...prev, [data.userId]: data }));
    };
    const handleStatusUpdate = ({ alertId, status }) => {
      toast.success(`Alert status: ${status}`);
    };
    const handleBroadcast = ({ message }) => {
      toast(message, { icon: '📢', duration: 5000 });
    };

    socket.on('NEW_EMERGENCY_ALERT', handleNewAlert);
    socket.on('ADMIN_NEW_ALERT', handleNewAlert);
    socket.on('ONLINE_COUNT', handleOnlineCount);
    socket.on('LOCATION_UPDATE', handleLocationUpdate);
    socket.on('TRACK_USER', handleLocationUpdate);
    socket.on('ALERT_STATUS_UPDATED', handleStatusUpdate);
    socket.on('SYSTEM_BROADCAST', handleBroadcast);

    if (user.role === 'responder' || user.role === 'citizen') {
      socket.on('SOS_RECEIVED', ({ alert }) => {
        toast.custom(() => (
          <div className="bg-orange-500 text-white px-5 py-4 rounded-xl shadow-xl flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <p className="font-bold text-sm">SOS RECEIVED</p>
              <p className="text-xs opacity-90">{alert.type?.replace('_', ' ')} emergency nearby</p>
            </div>
          </div>
        ));
      });
    }

    return () => {
      socket.off('NEW_EMERGENCY_ALERT', handleNewAlert);
      socket.off('ADMIN_NEW_ALERT', handleNewAlert);
      socket.off('ONLINE_COUNT', handleOnlineCount);
      socket.off('LOCATION_UPDATE', handleLocationUpdate);
      socket.off('TRACK_USER', handleLocationUpdate);
      socket.off('ALERT_STATUS_UPDATED', handleStatusUpdate);
      socket.off('SYSTEM_BROADCAST', handleBroadcast);
    };
  }, [user]);

  const getLiveLocation = useCallback((userId) => liveLocations[userId], [liveLocations]);

  return (
    <SocketContext.Provider value={{ onlineCount, newAlerts, liveLocations, getLiveLocation, notifications }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
