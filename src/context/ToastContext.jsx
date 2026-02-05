// Context for transient toast notifications
import { createContext, useMemo, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  // Track active toast messages
  const [toasts, setToasts] = useState([]);

  // Remove a toast by id
  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Add a toast and auto-expire it
  const addToast = useCallback((message, options = {}) => {
    const id = Date.now() + Math.random();
    const toast = {
      id,
      message,
      type: options.type || 'info',
      duration: options.duration || 5000,
    };
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => remove(id), toast.duration);
  }, [remove]);

  const value = useMemo(() => ({ addToast }), [addToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast stack */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-lg shadow bg-white dark:bg-campus-gray-800 border ${
              t.type === 'success'
                ? 'border-green-200 text-green-800'
                : t.type === 'error'
                ? 'border-red-200 text-red-800'
                : 'border-campus-gray-200 text-campus-gray-800 dark:text-campus-gray-100'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastContext;
