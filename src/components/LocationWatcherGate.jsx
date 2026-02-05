// Bridge for location tracking and socket identity
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { initializeSocket } from '../services/socket';
import { useLocationWatcher } from '../hooks/useLocationWatcher';

function LocationWatcherGate() {
  // Access auth state and start location watcher
  const { currentUser } = useAuth();
  useLocationWatcher();

  // Connect sockets once a user is available
  useEffect(() => {
    if (currentUser) {
      initializeSocket({ userId: currentUser.uid, username: currentUser.email || currentUser.uid });
    }
  }, [currentUser]);

  return null;
}

export default LocationWatcherGate;
