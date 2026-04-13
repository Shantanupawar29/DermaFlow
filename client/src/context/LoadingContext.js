import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { DermaLoader } from '../components/Loader';

const LoadingContext = createContext();

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return context;
};

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading');
  const requestCount = useRef(0);

  const showLoading = useCallback((message = 'Loading') => {
    setLoadingMessage(message);
    setLoading(true);
  }, []);

  const hideLoading = useCallback(() => {
    setLoading(false);
    setLoadingMessage('Loading');
  }, []);

  // For API calls that should show loader
  const withLoading = useCallback(async (promise, message = 'Loading') => {
    showLoading(message);
    try {
      return await promise;
    } finally {
      hideLoading();
    }
  }, [showLoading, hideLoading]);

  // For multiple API calls - shows loader only for first request
  const trackRequest = useCallback(() => {
    requestCount.current++;
    if (requestCount.current === 1) {
      showLoading();
    }
  }, [showLoading]);

  const trackResponse = useCallback(() => {
    requestCount.current--;
    if (requestCount.current === 0) {
      hideLoading();
    }
  }, [hideLoading]);

  return (
    <LoadingContext.Provider value={{ 
      loading, 
      loadingMessage, 
      showLoading, 
      hideLoading, 
      withLoading,
      trackRequest,
      trackResponse
    }}>
      {children}
      {loading && <DermaLoader message={loadingMessage} />}
    </LoadingContext.Provider>
  );
};