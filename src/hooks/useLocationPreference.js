// Hook for accessing the location preference context
import { useContext } from 'react';
import LocationContext from '../context/LocationContextBase';

export const useLocationPreference = () => {
  // Ensure the hook is used inside the provider
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocationPreference must be used within LocationProvider');
  return ctx;
};

export default useLocationPreference;
