// Background listener for proximity match events
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { onProximityMatch, offProximityMatch } from '../services/socket';
import { useToast } from '../hooks/useToast';

// Use browser notifications when permitted
const notifyBrowser = (title, body) => {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    new Notification(title, { body });
  }
};

function ProximityListener() {
  // Access current user and toast helpers
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  // Subscribe to proximity matches for the logged-in user
  useEffect(() => {
    if (!currentUser) return undefined;

    const handler = (payload) => {
      const { users = [], distanceMeters, profiles = {} } = payload || {};
      if (!users.includes(currentUser.uid)) return;
      const otherId = users.find((u) => u !== currentUser.uid);
      const otherDisplayName = otherId ? (profiles[otherId]?.displayName || 'Someone') : 'Someone';
      const distance = distanceMeters ? Math.round(distanceMeters) : 0;
      const msg = `${otherDisplayName} is nearby (within ${distance}m)`;
      addToast(msg, { type: 'info', duration: 6000 });
      notifyBrowser('Nearby match', msg);
    };

    onProximityMatch(handler);
    return () => offProximityMatch(handler);
  }, [currentUser, addToast]);

  return null;
}

export default ProximityListener;
