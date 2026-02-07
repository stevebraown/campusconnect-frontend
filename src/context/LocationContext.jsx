// Provider for location preference – profile is source of truth
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { userAPI } from '../services/api';
import LocationContext from './LocationContextBase';

export const LocationProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [locationEnabled, setLocationEnabledState] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);

  // Load from profile when user is authenticated
  useEffect(() => {
    if (!currentUser) {
      setLocationEnabledState(false);
      setLocationLoading(false);
      return;
    }
    let cancelled = false;
    setLocationLoading(true);
    userAPI
      .getProfile()
      .then((res) => {
        if (!cancelled && res.success && res.data?.profile) {
          setLocationEnabledState(res.data.profile.locationEnabled === true);
        }
      })
      .catch(() => {
        if (!cancelled) setLocationEnabledState(false);
      })
      .finally(() => {
        if (!cancelled) setLocationLoading(false);
      });
    return () => { cancelled = true; };
  }, [currentUser?.uid]);

  // Update profile and local state; returns Promise for loading/error handling
  const setLocationEnabled = useCallback(
    async (enabled) => {
      if (!currentUser) return;
      setLocationEnabledState(enabled);
      try {
        const result = await userAPI.updateProfile(currentUser.uid, { locationEnabled: enabled });
        if (!result.success) {
          setLocationEnabledState(!enabled);
          throw new Error(result.error?.message || 'Failed to update location setting');
        }
      } catch (err) {
        setLocationEnabledState(!enabled);
        throw err;
      }
    },
    [currentUser?.uid]
  );

  const value = useMemo(
    () => ({ locationEnabled, setLocationEnabled, locationLoading }),
    [locationEnabled, setLocationEnabled]
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};
