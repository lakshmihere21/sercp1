import { useState, useEffect, useRef, useCallback } from 'react';

const DEFAULT_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 5000,
};

export const useGeolocation = (watch = false, options = DEFAULT_OPTIONS) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const watchIdRef = useRef(null);

  const onSuccess = useCallback((pos) => {
    setLocation({
      latitude:  pos.coords.latitude,
      longitude: pos.coords.longitude,
      accuracy:  pos.coords.accuracy,
      speed:     pos.coords.speed,
      timestamp: pos.timestamp,
    });
    setError(null);
    setLoading(false);
  }, []);

  const onError = useCallback((err) => {
    const messages = {
      1: 'Location access denied. Please enable location permissions.',
      2: 'Location unavailable. Please try again.',
      3: 'Location request timed out.',
    };
    setError(messages[err.code] || 'Unable to get location.');
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      setLoading(false);
      return;
    }

    if (watch) {
      watchIdRef.current = navigator.geolocation.watchPosition(onSuccess, onError, options);
    } else {
      navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
    }

    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [watch]);

  const refresh = useCallback(() => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
  }, [onSuccess, onError]);

  return { location, error, loading, refresh };
};

export default useGeolocation;
