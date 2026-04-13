// components/DermaLoader.js
import React, { useEffect, useState } from 'react';

const M = '#4A0E2E';
const TIPS = [
  '✨ Always apply SPF last in your AM routine — even on cloudy days!',
  '💫 Retinol and Vitamin C should be used at different times of day.',
  '💧 Hyaluronic Acid works best on damp skin for maximum hydration.',
  '🧼 Double cleansing removes 99% of sunscreen & makeup effectively.',
  '🌟 Niacinamide pairs with almost everything in your routine.',
  '🔬 Patch test new products for 24–48 hours before full application.',
  '🌸 Less is more — build your routine slowly, one product at a time.',
  '🌙 Your skin repairs itself at night — use active ingredients then.',
  '💤 Sleep on a silk pillowcase to reduce friction and wrinkles.',
  '💊 Take your skincare down to your neck and chest area!',
];

export const showGlobalLoader = (message = 'Loading') => {
  const event = new CustomEvent('showLoader', { detail: { message } });
  window.dispatchEvent(event);
};

export const hideGlobalLoader = () => {
  const event = new CustomEvent('hideLoader');
  window.dispatchEvent(event);
};

export const withGlobalLoader = async (promise, message = 'Loading') => {
  showGlobalLoader(message);
  try {
    return await promise;
  } finally {
    hideGlobalLoader();
  }
};

export function DermaLoader({ message = 'Loading', isGlobal = false }) {
  const [tip, setTip] = useState(TIPS[Math.floor(Math.random() * TIPS.length)]);
  const [dots, setDots] = useState(1);
  const [currentMessage, setCurrentMessage] = useState(message);
  
  useEffect(() => {
    const t = setInterval(() => setDots(d => d >= 3 ? 1 : d + 1), 500);
    return () => clearInterval(t);
  }, []);

  // Change tip every 5 seconds
  useEffect(() => {
    const tipInterval = setInterval(() => {
      const newTip = TIPS[Math.floor(Math.random() * TIPS.length)];
      setTip(newTip);
    }, 5000);
    return () => clearInterval(tipInterval);
  }, []);

  // Handle global loader events
  useEffect(() => {
    const handleShow = (e) => {
      if (e.detail?.message) setCurrentMessage(e.detail.message);
    };
    window.addEventListener('showLoader', handleShow);
    window.addEventListener('hideLoader', () => {});
    return () => {
      window.removeEventListener('showLoader', handleShow);
    };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, #fff5f7 0%, #ffffff 50%, #fff5f7 100%)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Poppins', 'Inter', system-ui, -apple-system, sans-serif",
      padding: '2rem',
      backdropFilter: 'blur(0px)',
    }}>
      {/* Animated Background Circles */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(74,14,46,0.03) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 20s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '5%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(74,14,46,0.04) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 25s ease-in-out infinite reverse',
      }} />
      <div style={{
        position: 'absolute',
        top: '40%',
        right: '15%',
        width: '150px',
        height: '150px',
        background: 'radial-gradient(circle, rgba(255,215,0,0.05) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'pulse 8s ease-in-out infinite',
      }} />

      {/* Main Loader Container */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
      }}>
        {/* Animated Gradient Ring */}
        <div style={{
          position: 'relative',
          width: 120,
          height: 120,
        }}>
          {/* Rotating Ring */}
          <svg width="120" height="120" viewBox="0 0 120 120" style={{ position: 'absolute', top: 0, left: 0 }}>
            <defs>
              <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7B2D3C"/>
                <stop offset="50%" stopColor="#4A0E2E"/>
                <stop offset="100%" stopColor="#9B4D6B"/>
              </linearGradient>
              <linearGradient id="ringGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFD700"/>
                <stop offset="50%" stopColor="#FFA500"/>
                <stop offset="100%" stopColor="#FF6B6B"/>
              </linearGradient>
            </defs>
            <circle
              cx="60" cy="60" r="52"
              fill="none"
              stroke="url(#ringGradient)"
              strokeWidth="3"
              strokeDasharray="100 200"
              strokeLinecap="round"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 60 60"
                to="360 60 60"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
            <circle
              cx="60" cy="60" r="40"
              fill="none"
              stroke="url(#ringGradient2)"
              strokeWidth="2"
              strokeDasharray="80 160"
              strokeLinecap="round"
              opacity="0.6"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="360 60 60"
                to="0 60 60"
                dur="3s"
                repeatCount="indefinite"
              />
            </circle>
          </svg>

          {/* Center Icon */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 50,
            height: 50,
            background: `linear-gradient(135deg, ${M}, #9B4D6B)`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(74,14,46,0.3)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L12 7" />
              <path d="M12 2L12 7" transform="rotate(90 12 12)" />
              <path d="M12 2L12 7" transform="rotate(180 12 12)" />
              <path d="M12 2L12 7" transform="rotate(270 12 12)" />
              <circle cx="12" cy="12" r="3" />
              <path d="M12 22V17" />
              <path d="M12 22V17" transform="rotate(90 12 12)" />
              <path d="M12 22V17" transform="rotate(180 12 12)" />
              <path d="M12 22V17" transform="rotate(270 12 12)" />
            </svg>
          </div>
        </div>

        {/* Loading Message */}
        <div style={{
          fontSize: 20,
          fontWeight: 600,
          background: `linear-gradient(135deg, ${M}, #9B4D6B)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '0.5px',
        }}>
          {currentMessage}{'.'.repeat(dots)}
        </div>

        {/* Animated Dots */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${M}, #9B4D6B)`,
                animation: `bounce 1.4s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>

        {/* Skincare Tip Card */}
        <div style={{
          maxWidth: 380,
          marginTop: 32,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: 20,
          padding: '20px 24px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.08), 0 0 0 1px rgba(74,14,46,0.05)',
          animation: 'slideUp 0.6s ease-out',
          transition: 'all 0.3s ease',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 12,
          }}>
            <div style={{
              width: 32,
              height: 32,
              background: `linear-gradient(135deg, ${M}10, #9B4D6B10)`,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={M} strokeWidth="2">
                <path d="M12 2L15 9H22L16 14L19 21L12 16.5L5 21L8 14L2 9H9L12 2Z" />
              </svg>
            </div>
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              color: '#92400e',
              background: '#fef3c7',
              padding: '4px 12px',
              borderRadius: 20,
            }}>
              Skincare Wisdom
            </div>
          </div>
          <div style={{
            fontSize: 14,
            color: '#78350f',
            lineHeight: 1.6,
            fontWeight: 500,
          }}>
            {tip}
          </div>
          <div style={{
            marginTop: 12,
            height: 2,
            background: `linear-gradient(90deg, ${M}, #9B4D6B, transparent)`,
            borderRadius: 2,
            animation: 'slideIn 1.5s ease-out',
          }} />
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-10px); }
          75% { transform: translateY(10px) translateX(-5px); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.9; }
        }
        
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1.2); opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideIn {
          from {
            width: 0;
            opacity: 0;
          }
          to {
            width: 100%;
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export default DermaLoader;