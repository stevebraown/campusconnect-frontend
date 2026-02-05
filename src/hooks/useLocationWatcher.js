// Hook for background location updates
import { useEffect, useRef, useState } from 'react';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLocationPreference } from './useLocationPreference';

const MIN_MOVE_METERS = 25;
const MIN_INTERVAL_MS = 60_000; // 1 minute

export const useLocationWatcher = () => {
  const { currentUser } = useAuth();
  const { locationEnabled } = useLocationPreference();
  const [error, setError] = useState(() => (!('geolocation' in navigator) ? 'Geolocation not supported' : null));
  const lastSentRef = useRef({ time: 0, lat: null, lng: null });
  const watchIdRef = useRef(null);

  useEffect(() => {
    if (!locationEnabled || !currentUser) {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return undefined;
    }

    if (!('geolocation' in navigator)) return undefined;

    const handleSuccess = (pos) => {
      const { latitude, longitude } = pos.coords;
      const now = Date.now();
      const last = lastSentRef.current;

      const shouldSend = (() => {
        if (last.lat === null || last.lng === null) return true;
        // Simple distance check using Pythagorean theorem (good enough for small distances)
        // Backend handles precise Haversine calculations
        const latDiff = latitude - last.lat;
        const lngDiff = longitude - last.lng;
        // Approximate meters: 1 degree lat ≈ 111km, 1 degree lng ≈ 111km * cos(lat)
        const latMeters = latDiff * 111000;
        const lngMeters = lngDiff * 111000 * Math.cos((latitude + last.lat) / 2 * Math.PI / 180);
        const distMeters = Math.sqrt(latMeters * latMeters + lngMeters * lngMeters);
        const timeDelta = now - last.time;
        return distMeters >= MIN_MOVE_METERS || timeDelta >= MIN_INTERVAL_MS;
      })();

      if (!shouldSend) return;

      lastSentRef.current = { time: now, lat: latitude, lng: longitude };

      userAPI
        .updateLocation(currentUser.uid, { lat: latitude, lng: longitude })
        .catch((err) => {
          // Handle geofence errors gracefully (expected if outside campus)
          if (err?.error?.message?.includes('geofence') || err?.error?.message?.includes('Location outside')) {
            // Silently ignore geofence errors - user is just outside campus area
            return;
          }
          // Only log/show errors for other issues
          console.error('Location update failed', err);
          setError('Failed to update location');
        });
    };

    const handleError = (err) => {
      console.error('Geolocation error', err);
      setError(err.message || 'Geolocation error');
    };

    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: false,
      maximumAge: 30_000,
      timeout: 10_000,
    });

    watchIdRef.current = watchId;

    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [locationEnabled, currentUser]);

  return { error };
};

export default useLocationWatcher;
