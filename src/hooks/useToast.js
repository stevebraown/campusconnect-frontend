// Hook for accessing toast actions
import { useContext } from 'react';
import ToastContext from '../context/ToastContext';

export const useToast = () => {
  // Ensure the hook is used inside the provider
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export default useToast;
