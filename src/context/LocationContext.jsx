// Provider for persisting location permission preference
import { useEffect, useMemo, useState } from 'react';
import LocationContext from './LocationContextBase';
const STORAGE_KEY = 'cc_location_enabled';

export const LocationProvider = ({ children }) => {
  // Load initial preference from local storage
  const [locationEnabled, setLocationEnabled] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'true';
  });

  // Persist preference changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, locationEnabled ? 'true' : 'false');
  }, [locationEnabled]);

  // Memoize context value
  const value = useMemo(
    () => ({ locationEnabled, setLocationEnabled }),
    [locationEnabled]
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};
