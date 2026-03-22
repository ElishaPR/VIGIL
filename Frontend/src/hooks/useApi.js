import { useState, useCallback, useEffect } from "react";
import { parseApiError } from "../utils/error-handler.js";

/**
 * Custom hook for handling API calls with loading and error states
 * 
 * @param {Function} apiFunction - The async API function to call
 * @param {Object} options - Configuration options
 * @returns {Object} - { data, loading, error, execute, retry }
 */
export const useApi = (apiFunction, options = {}) => {
  const { autoExecute = false, onSuccess = null, onError = null } = options;
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(autoExecute);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await apiFunction(...args);
        setData(result);
        
        if (onSuccess) {
          onSuccess(result);
        }
        
        return result;
      } catch (err) {
        const parsedError = parseApiError(err);
        setError(parsedError);
        
        if (onError) {
          onError(parsedError);
        }
        
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, onSuccess, onError]
  );

  const retry = useCallback(() => {
    execute();
  }, [execute]);

  // Auto-execute on mount if enabled
  useEffect(() => {
    if (autoExecute) {
      execute();
    }
  }, [autoExecute, execute]);

  return {
    data,
    loading,
    error,
    execute,
    retry,
    setData, // Allow manual data updates
  };
};

/**
 * Custom hook for handling API list operations with pagination and filtering
 */
export const useApiList = (apiFunction, options = {}) => {
  const { autoExecute = true } = options;
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(autoExecute);
  const [error, setError] = useState(null);

  const fetch = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiFunction(...args);
      setItems(result.items || result);
      
      return result;
    } catch (err) {
      const parsedError = parseApiError(err);
      setError(parsedError);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  const addItem = useCallback((item) => {
    setItems((prev) => [item, ...prev]);
  }, []);

  const updateItem = useCallback((id, updates) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id || item.uuid === id ? { ...item, ...updates } : item))
    );
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((item) => item.id !== id && item.uuid !== id));
  }, []);

  const retry = useCallback(() => {
    fetch();
  }, [fetch]);

  // Auto-execute on mount
  useEffect(() => {
    if (autoExecute) {
      fetch();
    }
  }, [autoExecute, fetch]);

  return {
    items,
    loading,
    error,
    fetch,
    addItem,
    updateItem,
    removeItem,
    retry,
    setItems,
  };
};
