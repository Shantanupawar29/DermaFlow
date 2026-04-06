import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const IDLE_MS = 5 * 60 * 1000; // 5 minutes
const WARN_MS = 60 * 1000; // 60s warning

const SessionTimeout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const idleTimer = useRef(null);
  const logoutTimer = useRef(null);
  const countdownInterval = useRef(null);

  const resetTimers = useCallback(() => {
    if (!user) return;
    setShowModal(false);
    
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (logoutTimer.current) clearTimeout(logoutTimer.current);
    if (countdownInterval.current) clearInterval(countdownInterval.current);

    idleTimer.current = setTimeout(() => {
      setShowModal(true);
      setCountdown(60);
      
      countdownInterval.current = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(countdownInterval.current);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
      
      logoutTimer.current = setTimeout(() => {
        setShowModal(false);
        logout();
        toast.error('Session expired. Please login again.');
        navigate('/login');
      }, WARN_MS);
    }, IDLE_MS);
  }, [user, logout, navigate]);

  useEffect(() => {
    if (!user) return;
    
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll', 'click'];
    
    const handler = () => {
      if (!showModal) resetTimers();
    };
    
    events.forEach((e) => document.addEventListener(e, handler));
    resetTimers();
    
    return () => {
      events.forEach((e) => document.removeEventListener(e, handler));
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (logoutTimer.current) clearTimeout(logoutTimer.current);
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    };
  }, [user, resetTimers, showModal]);

  const keepAlive = () => {
    if (logoutTimer.current) clearTimeout(logoutTimer.current);
    if (countdownInterval.current) clearInterval(countdownInterval.current);
    resetTimers();
  };

  const doLogout = () => {
    if (logoutTimer.current) clearTimeout(logoutTimer.current);
    if (countdownInterval.current) clearInterval(countdownInterval.current);
    setShowModal(false);
    logout();
    navigate('/login');
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 text-center shadow-2xl">
        <h2 className="text-lg font-bold mb-2 text-foreground">Your session is about to expire</h2>
        <p className="text-muted-foreground text-sm mb-4">
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