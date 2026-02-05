// Shared hook for API request state
import { useState, useEffect } from 'react';

/**
 * Custom hook for making API calls with loading and error states
 * @param {Function} apiFunction - API function to call
 * @param {boolean} immediate - Whether to call immediately on mount
 * @returns {Object} - { data, loading, error, refetch }
 */
export const useAPI = (apiFunction, immediate = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiFunction();
      
      if (response.success) {
        setData(response.data);
      } else {
        // Extract error message safely - response.error might be an object
        const errorMessage = typeof response.error === 'string' 
          ? response.error 
          : response.error?.message || 'An error occurred';
        setError(errorMessage);
      }
    } catch (err) {
      setError({
        message: 'Unexpected error occurred',
        status: 0,
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, []);
  
  const refetch = () => {
    fetchData();
  };
  
  return {
    data,
    loading,
    error,
    refetch,
  };
};

export default useAPI;