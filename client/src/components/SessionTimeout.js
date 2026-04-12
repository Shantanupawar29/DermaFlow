import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const IDLE_MS = 30 * 60 * 1000; 
const WARN_MS = 60 * 1000; // 60s warning

const SessionTimeout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(60);
  
  const idleTimer = useRef(null);
  const warnTimer = useRef(null);
  const countdownInterval = useRef(null);
  const isActive = useRef(true);

  // Clear all timers
  const clearAllTimers = useCallback(() => {
    if (idleTimer.current) {
      clearTimeout(idleTimer.current);
      idleTimer.current = null;
    }
    if (warnTimer.current) {
      clearTimeout(warnTimer.current);
      warnTimer.current = null;
    }
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
      countdownInterval.current = null;
    }
  }, []);

  // Reset all timers
  const resetTimers = useCallback(() => {
    if (!user || !isActive.current) return;
    
    // Clear existing timers
    clearAllTimers();
    
    // Hide modal if showing
    if (showModal) {
      setShowModal(false);
    }
    
    // Set new idle timer
    idleTimer.current = setTimeout(() => {
      if (!isActive.current) return;
      
      // Show warning modal
      setShowModal(true);
      setCountdown(60);
      
      // Start countdown
      countdownInterval.current = setInterval(() => {
        setCountdown((prevCount) => {
          if (prevCount <= 1) {
            // Time's up, logout
            if (countdownInterval.current) {
              clearInterval(countdownInterval.current);
            }
            return 0;
          }
          return prevCount - 1;
        });
      }, 1000);
      
      // Set warning timer to logout after warning period
      warnTimer.current = setTimeout(() => {
        if (!isActive.current) return;
        
        clearAllTimers();
        setShowModal(false);
        logout();
        toast.error('Session expired. Please login again.');
        navigate('/login');
      }, WARN_MS);
      
    }, IDLE_MS);
  }, [user, logout, navigate, clearAllTimers, showModal]);

  // Keep user logged in
  const keepAlive = useCallback(() => {
    if (!user) return;
    
    // Clear all timers and modal
    clearAllTimers();
    setShowModal(false);
    
    // Reset timers
    resetTimers();
  }, [user, clearAllTimers, resetTimers]);

  // Logout immediately
  const doLogout = useCallback(() => {
    clearAllTimers();
    setShowModal(false);
    logout();
    navigate('/login');
  }, [logout, navigate, clearAllTimers]);

  // Set up event listeners
  useEffect(() => {
    if (!user) return;
    
    isActive.current = true;
    
    // Events that reset the idle timer
    const resetEvents = [
      'mousemove', 
      'keydown', 
      'mousedown', 
      'touchstart', 
      'scroll', 
      'click',
      'wheel',
      'touchmove'
    ];
    
    const handleUserActivity = () => {
      if (showModal) {
        // If modal is showing, keepAlive will reset everything
        keepAlive();
      } else {
        // Just reset timers without showing anything
        clearAllTimers();
        resetTimers();
      }
    };
    
    // Add event listeners
    resetEvents.forEach(event => {
      window.addEventListener(event, handleUserActivity);
    });
    
    // Start timers
    resetTimers();
    
    // Cleanup
    return () => {
      isActive.current = false;
      resetEvents.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
      clearAllTimers();
    };
  }, [user, resetTimers, clearAllTimers, keepAlive, showModal]);

  // Refresh token periodically (optional - to keep session alive)
  useEffect(() => {
    if (!user) return;
    
    // Refresh token every 10 minutes to prevent expiration
    const refreshInterval = setInterval(async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Optional: Call a refresh token endpoint
          // const response = await axios.post('/api/auth/refresh-token', {}, {
          //   headers: { Authorization: `Bearer ${token}` }
          // });
          // if (response.data.token) {
          //   localStorage.setItem('token', response.data.token);
          // }
          console.log('Session active - token valid');
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
      }
    }, 10 * 60 * 1000); // Every 10 minutes
    
    return () => clearInterval(refreshInterval);
  }, [user]);

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 text-center shadow-2xl">
        <h2 className="text-lg font-bold mb-2 text-gray-800">Your session is about to expire</h2>
        <p className="text-gray-600 text-sm mb-4">
          You will be logged out in <span className="font-bold text-maroon">{countdown}</span> seconds due to inactivity.
        </p>
        <div className="flex gap-3 justify-center">
          <button 
            onClick={keepAlive} 
            className="bg-maroon text-white px-4 py-2 rounded-lg font-semibold hover:bg-maroon-light transition"
          >
            Keep Me Logged In
          </button>
          <button 
            onClick={doLogout} 
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeout;