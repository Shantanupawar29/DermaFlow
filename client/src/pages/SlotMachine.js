import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Zap, RefreshCw, Trophy, Clock, Star, Diamond, Info, Sparkles } from 'lucide-react';
import api from '../services/api';

const MAROON = '#4A0E2E';
const GOLD = '#C9A84C';
const OFF_WHITE = '#FDFCFB';

// Updated Symbols to match Skincare Theme
const SYMBOLS = ['🌿', '🧴', '✨', '💧', '🌸', '💎', '⭐', '🧬'];

const PAYOUTS = {
  '💎💎💎': { label: 'DIAMOND GLOW', pts: 500, color: '#4facfe' },
  '⭐⭐⭐': { label: 'STAR TREATMENT', pts: 200, color: GOLD },
  '🧬🧬🧬': { label: 'GENESYS WIN', pts: 150, color: '#10b981' },
  '🌸🌸🌸': { label: 'FLORAL BLOOM', pts: 100, color: '#f472b6' },
  '🧴🧴🧴': { label: 'PRODUCT MATCH', pts: 75, color: MAROON },
  '💧💧💧': { label: 'HYDRATION HIT', pts: 50, color: '#3b82f6' },
  '✨✨✨': { label: 'SPARKLE WIN', pts: 30, color: '#8b5cf6' },
};

function Reel({ symbol, spinning, delay }) {
  const [display, setDisplay] = useState(symbol);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (spinning) {
      setTimeout(() => {
        intervalRef.current = setInterval(() => {
          setDisplay(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
        }, 90);
      }, delay);
    } else {
      clearInterval(intervalRef.current);
      setDisplay(symbol);
    }
    return () => clearInterval(intervalRef.current);
  }, [spinning, symbol, delay]);

  return (
    <div style={{
      width: 100, height: 120, 
      background: '#fff',
      borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 48, 
      border: `1px solid ${spinning ? GOLD : '#E5E7EB'}`,
      boxShadow: spinning ? `0 0 15px ${GOLD}30` : 'inset 0 2px 4px rgba(0,0,0,0.02)',
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', inset: 6, border: `1px solid ${GOLD}15`, borderRadius: 12 }} />
      <span style={{ filter: spinning ? 'blur(2px)' : 'none', transition: 'filter 0.2s' }}>
        {display}
      </span>
    </div>
  );
}

export default function SlotMachine() {
  const { user } = useAuth();
  const [reels, setReels] = useState(['🧴', '✨', '🌿']);
  const [spinning, setSpin] = useState(false);
  const [result, setResult] = useState(null);
  const [creditsLeft, setCreditsLeft] = useState(0);
  const [userData, setUserData] = useState(null);
  const [timeUntilMidnight, setTimeUntilMidnight] = useState('');

  useEffect(() => { 
    if (user) fetchUserData(); 
  }, [user]);
  
  useEffect(() => {
    if (!userData) return;
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [userData]);

  const fetchUserData = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUserData(data);
      const today = new Date().toDateString();
      const lastSlot = data.lastSlotDate ? new Date(data.lastSlotDate).toDateString() : null;
      setCreditsLeft(lastSlot !== today ? 3 : (data.slotCreditsLeft ?? 3));
    } catch (e) { console.error(e); }
  };

  const updateTimer = () => {
    const now = new Date();
    const midnight = new Date().setHours(24, 0, 0, 0);
    const diff = midnight - now;
    if (diff <= 0) fetchUserData();
    else {
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeUntilMidnight(`${h}h ${m}m ${s}s`);
    }
  };

  const spin = async () => {
    if (spinning || creditsLeft <= 0 || !user) return;
    setSpin(true); setResult(null);
    setCreditsLeft(p => p - 1);
    
    await new Promise(r => setTimeout(r, 2000));
    
    const rand = Math.random();
    let newReels;
    let winPayout = null;

    if (rand < 0.05) { newReels = ['💎','💎','💎']; winPayout = PAYOUTS['💎💎💎']; }
    else if (rand < 0.15) { newReels = ['🧴','🧴','🧴']; winPayout = PAYOUTS['🧴🧴🧴']; }
    else {
      newReels = [SYMBOLS[0], SYMBOLS[1], SYMBOLS[2]].sort(() => Math.random() - 0.5);
    }

    setReels(newReels);
    setSpin(false);

    try {
      const response = await api.post('/auth/slot-win', { 
        pts: winPayout ? winPayout.pts : 0, 
        symbols: winPayout ? newReels.join('') : 'NO_WIN' 
      });
      if (winPayout) setResult(winPayout);
      setUserData(prev => ({ ...prev, glowPoints: response.data.glowPoints }));
    } catch(e) { console.error(e); }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: OFF_WHITE, color: '#333', paddingBottom: '4rem' }}>
      
      <header style={{ textAlign: 'center', padding: '4rem 1rem 2rem' }}>
        <h1 style={{ 
          fontFamily: "'Cormorant Garamond', serif", 
          fontSize: '3.5rem', 
          color: MAROON, 
          fontWeight: 600,
          margin: 0
        }}>
          Glow Slots
        </h1>
        <p style={{ letterSpacing: '2px', fontSize: '0.8rem', textTransform: 'uppercase', color: GOLD, fontWeight: 600 }}>
          Daily Rewards • Premium Skincare
        </p>
      </header>

      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '0 1.5rem' }}>
        
        <div style={{ 
          background: '#fff', 
          borderRadius: '32px', 
          padding: '2.5rem', 
          boxShadow: '0 20px 50px rgba(74, 14, 46, 0.08)',
          border: '1px solid #F3F4F6',
          textAlign: 'center'
        }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', fontSize: '0.9rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} color={GOLD} />
              <strong>{creditsLeft} SPINS LEFT</strong>
            </span>
            <span style={{ color: '#999' }}>
              {creditsLeft === 0 ? `REFRESH IN ${timeUntilMidnight}` : 'REFRESH AT MIDNIGHT'}
            </span>
          </div>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '12px', 
            padding: '1.5rem', 
            background: '#FDFCFB', 
            borderRadius: '24px',
            border: '1px solid #F3F4F6',
            marginBottom: '2rem'
          }}>
            {reels.map((s, i) => <Reel key={i} symbol={s} spinning={spinning} delay={i * 150} />)}
          </div>

          <div style={{ height: '60px', marginBottom: '1rem' }}>
            {result && !spinning && (
              <div style={{ animation: 'fadeInUp 0.5s ease' }}>
                <div style={{ color: GOLD, fontWeight: 700, fontSize: '1.2rem' }}>{result.label}</div>
                <div style={{ color: MAROON, fontWeight: 600 }}>+{result.pts} Glow Points</div>
              </div>
            )}
          </div>

          <button
            onClick={spin}
            disabled={!user || creditsLeft <= 0 || spinning}
            style={{
              width: '100%',
              padding: '1.2rem',
              borderRadius: '16px',
              border: 'none',
              background: creditsLeft > 0 ? MAROON : '#D1D5DB',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: 700,
              letterSpacing: '2px',
              cursor: 'pointer',
              transition: 'transform 0.2s, background 0.3s',
              boxShadow: creditsLeft > 0 ? `0 10px 20px ${MAROON}30` : 'none'
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {spinning ? 'BREWING GLOW...' : creditsLeft > 0 ? 'PULL LEVER' : 'COME BACK TOMORROW'}
          </button>
        </div>

        <div style={{ marginTop: '3rem' }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', color: MAROON, marginBottom: '1.5rem' }}>
            Prize Legend
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {Object.entries(PAYOUTS).slice(0, 4).map(([key, val]) => (
              <div key={key} style={{ 
                background: '#fff', 
                padding: '1rem', 
                borderRadius: '16px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                border: '1px solid #F3F4F6'
              }}>
                <span style={{ fontSize: '1.5rem' }}>{key.substring(0, 2)}</span>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#999', textTransform: 'uppercase' }}>{val.label}</div>
                  <div style={{ fontWeight: 700, color: MAROON }}>{val.pts} PTS</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=Inter:wght@400;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}