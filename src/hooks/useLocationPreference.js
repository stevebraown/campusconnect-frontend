// Hook for accessing the location preference context
// Profile is the source of truth; LocationProvider syncs with it
import { useContext } from 'react';
import LocationContext from '../context/LocationContextBase';

export const useLocationPreference = () => {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocationPreference must be used within LocationProvider');
  return ctx;
};

export default useLocationPreference;
