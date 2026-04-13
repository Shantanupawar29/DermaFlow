// src/components/ApiLoaderWrapper.js
import { useEffect } from 'react';
import { useLoading } from '../context/LoadingContext';
import { setLoadingCallbacks } from '../services/api';

export const ApiLoaderWrapper = ({ children }) => {
  const { trackRequest, trackResponse } = useLoading();

  useEffect(() => {
    setLoadingCallbacks(trackRequest, trackResponse);
    return () => {
      setLoadingCallbacks(null, null);
    };
  }, [trackRequest, trackResponse]);

  return children;
};