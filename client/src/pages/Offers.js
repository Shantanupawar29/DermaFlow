import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Gift, Copy, Check, Tag, Clock, Star, Zap, 
  Trophy, Ticket, Users, ChevronRight, 
  Sparkles, ShoppingBag, Repeat, Target, 
  BookOpen, Info, Disc, ArrowRight, Lock, 
  Smartphone, Share2, MousePointer2, RefreshCw 
} from 'lucide-react';

const API = 'http://localhost:5000/api';
const MAROON = '#4A0E2E';
const GOLD = '#C9A84C';
const CHAMPAGNE = '#FDFCFB';

const tok = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

// Static Coupons for Boutique Promo Codes
const STATIC_COUPONS = [
  { code: 'WELCOME15', discount: '15% OFF', minSpend: '₹999' },
  { code: 'GLOW10', discount: '10% OFF', minSpend: '₹499' },
  { code: 'FREESHIP', discount: 'Free Shipping', minSpend: '₹999' },
];

// --- Segments for Spin Wheel ---
const SPIN_SEGMENTS = [
  { label: '20% OFF', type: 'voucher', discount: 20, color: MAROON, prob: 5 },
  { label: '15% OFF', type: 'voucher', discount: 15, color: GOLD, prob: 10 },
  { label: '50 PTS', type: 'points', pts: 50, color: '#8B6B5E', prob: 20 },
  { label: 'FREE SHIP', type: 'voucher', freeShipping: true, color: '#A39185', prob: 15 },
  { label: 'ZOMATO', type: 'affiliate', partner: 'Zomato', discount: 15, color: '#632A31', prob: 5 },
  { label: '10% OFF', type: 'voucher', discount: 10, color: MAROON, prob: 20 },
  { label: 'NYKAA', type: 'affiliate', partner: 'Nykaa', discount: 100, flat: true, color: GOLD, prob: 5 },
];

// --- Scratch Card Prizes ---
const SCRATCH_PRIZES = [
  { label: '₹100 FLAT', type: 'voucher', discount: 100, flat: true, prob: 10 },
  { label: '20% OFF', type: 'voucher', discount: 20, prob: 15 },
  { label: '100 PTS', type: 'points', pts: 100, prob: 20 },
  { label: 'FREE SHIP', type: 'voucher', freeShipping: true, prob: 20 },
];

const weightedRandom = (items) => {
  const total = items.reduce((s, i) => s + (i.prob || 1), 0);
  let r = Math.random() * total;
  for (const item of items) { r -= (item.prob || 1); if (r <= 0) return item; }
  return items[0];
};

// Helper function to copy to clipboard
const copyToClipboard = (code, setCopiedCode) => {
  navigator.clipboard.writeText(code);
  setCopiedCode(code);
  setTimeout(() => setCopiedCode(null), 2000);
};

// --- Sub-Component: Spin Wheel ---
function SpinWheel({ onResult, canSpin }) {
  const canvasRef = useRef(null);
  const rotationRef = useRef(0);
  const [spinning, setSpinning] = useState(false);

  useEffect(() => { drawWheel(); }, [canSpin]);

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = centerX - 10;
    const angleStep = (2 * Math.PI) / SPIN_SEGMENTS.length;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    SPIN_SEGMENTS.forEach((seg, i) => {
      const startAngle = i * angleStep + rotationRef.current;
      ctx.beginPath(); ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + angleStep);
      ctx.fillStyle = seg.color; ctx.fill();
      ctx.strokeStyle = CHAMPAGNE; ctx.lineWidth = 2; ctx.stroke();
      ctx.save(); ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + angleStep / 2); ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px Inter'; ctx.fillText(seg.label, radius / 2 + 10, 5); ctx.restore();
    });
    ctx.beginPath(); ctx.arc(centerX, centerY, 15, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
  };

  const spin = () => {
    if (spinning || !canSpin) return;
    setSpinning(true);
    const prize = weightedRandom(SPIN_SEGMENTS);
    const duration = 4000;
    const startRotation = rotationRef.current;
    const totalRotation = startRotation + (Math.PI * 10) + (Math.random() * Math.PI * 2);
    const start = performance.now();

    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 4);
      rotationRef.current = startRotation + (totalRotation - startRotation) * easeOut;
      drawWheel();
      if (progress < 1) requestAnimationFrame(animate);
      else { setSpinning(false); onResult(prize); }
    };
    requestAnimationFrame(animate);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-6">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 text-maroon-900">
          <ArrowRight className="rotate-90 fill-current" size={32} />
        </div>
        <canvas ref={canvasRef} width={280} height={280} className="rounded-full shadow-2xl" />
      </div>
      <button onClick={spin} disabled={!canSpin || spinning} className={`px-8 py-3 rounded-full font-bold text-xs tracking-widest uppercase transition-all shadow-md ${canSpin && !spinning ? 'bg-maroon-900 text-white hover:scale-105' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
        {spinning ? 'Spinning...' : 'Spin Ritual'}
      </button>
    </div>
  );
}

// --- Sub-Component: Scratch Card ---
function ScratchCard({ canPlay, onWin }) {
  const [revealed, setRevealed] = useState(false);
  const [prize, setPrize] = useState(null);

  const handleReveal = () => {
    if (!canPlay || revealed) return;
    const p = weightedRandom(SCRATCH_PRIZES);
    setPrize(p);
    setRevealed(true);
    onWin(p);
  };

  return (
    <div className="w-full">
      {!revealed ? (
        <div 
          onClick={handleReveal}
          className={`h-40 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer ${canPlay ? 'border-gold-500 bg-champagne hover:bg-white' : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'}`}
        >
          {canPlay ? (
            <>
              <MousePointer2 className="text-gold-500 mb-2 animate-bounce" size={24} />
              <p className="text-maroon-900 font-bold text-sm uppercase tracking-tighter">Tap to Scratch</p>
            </>
          ) : (
            <>
              <Lock className="text-gray-300 mb-2" size={20} />
              <p className="text-gray-400 text-xs">Unlock with your first order</p>
            </>
          )}
        </div>
      ) : (
        <div className="h-40 rounded-2xl bg-white border border-gold-500 flex flex-col items-center justify-center animate-pulse">
          <Trophy className="text-gold-500 mb-1" size={20} />
          <p className="text-maroon-900 font-bold text-xl">{prize?.label}</p>
          <p className="text-[10px] text-gray-400">Added to your coupons</p>
        </div>
      )}
    </div>
  );
}

export default function Offers() {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [canSpin, setCanSpin] = useState(false);
  const [canScratch, setCanScratch] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => { 
    if (user) fetchUserData(); 
  }, [user]);

  const fetchUserData = async () => {
    try {
      const { data } = await axios.get(`${API}/auth/me`, tok());
      setUserData(data);
      const today = new Date().toDateString();
      setCanSpin(data.lastSpinDate ? new Date(data.lastSpinDate).toDateString() !== today : true);
      setCanScratch(data.lastScratchDate ? new Date(data.lastScratchDate).toDateString() !== today && (data.orderCount > 0) : data.orderCount > 0);
    } catch (e) { 
      console.error(e); 
    }
  };

  const handlePrizeAction = async (prize, type) => {
    try {
      await axios.post(`${API}/auth/${type}`, { prize }, tok());
      fetchUserData();
      alert(`Glow Reward: ${prize.label} has been granted!`);
    } catch (e) { 
      console.error(e); 
      alert('Error saving prize. Please try again.');
    }
  };

  const handleLuckyDraw = async () => {
    if (userData?.luckyDrawEntered) {
      alert('You have already entered the lucky draw!');
      return;
    }
    try {
      await axios.post(`${API}/auth/lucky-draw`, {}, tok());
      fetchUserData();
      alert("✨ You've entered the Grand Lucky Draw!");
    } catch (e) { 
      console.error(e); 
      alert('Error entering lucky draw. Please try again.');
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Get active earned vouchers (not used and not expired)
  const activeEarnedVouchers = userData?.vouchers?.filter(
    v => !v.isUsed && new Date(v.expiresAt) > new Date()
  ) || [];

  return (
    <div className="min-h-screen pb-20 bg-[#FDFCFB]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* 1. HERO HEADER */}
      <section style={{ backgroundColor: MAROON }} className="py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <Sparkles className="mx-auto mb-6 text-gold-500 opacity-90" size={48} />
          <h1 
            style={{ fontFamily: "'Cormorant Garamond', serif", color: CHAMPAGNE }} 
            className="text-5xl md:text-6xl font-serif italic mb-4"
          >
            The Gilded Boutique
          </h1>
          <p className="text-sm font-light tracking-widest uppercase text-champagne opacity-80">
            Daily Rituals & Exclusive Perks
          </p>
        </div>
      </section>

      {/* 2. STATS BAR */}
      <div className="max-w-6xl mx-auto px-4 -mt-8">
        <div className="bg-white rounded-3xl p-6 shadow-xl grid grid-cols-2 md:grid-cols-4 gap-4 border border-gray-100">
          <div className="text-center">
            <Star className="mx-auto mb-1 text-gold-500" size={20} />
            <div className="text-xl font-bold text-maroon-900">{userData?.glowPoints || 0}</div>
            <p className="text-[10px] text-gray-400 uppercase">Glow Points</p>
          </div>
          <div className="text-center border-l border-gray-100">
            <Ticket className="mx-auto mb-1 text-gold-500" size={20} />
            <div className="text-xl font-bold text-maroon-900">{activeEarnedVouchers.length}</div>
            <p className="text-[10px] text-gray-400 uppercase">Coupons</p>
          </div>
          <div className="text-center border-l border-gray-100">
            <ShoppingBag className="mx-auto mb-1 text-gold-500" size={20} />
            <div className="text-xl font-bold text-maroon-900">{userData?.orderCount || 0}</div>
            <p className="text-[10px] text-gray-400 uppercase">Total Orders</p>
          </div>
          <div className="text-center border-l border-gray-100">
            <Users className="mx-auto mb-1 text-gold-500" size={20} />
            <div className="text-xl font-bold text-maroon-900">{userData?.referralCount || 0}</div>
            <p className="text-[10px] text-gray-400 uppercase">Referrals</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-12 grid lg:grid-cols-3 gap-8">
        
        {/* 3. SPIN WHEEL SUITE */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-50">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h2 className="text-3xl font-serif italic text-maroon-900" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Daily Spin Ritual</h2>
              <p className="text-xs text-gray-400 tracking-widest uppercase">Resets every 24 hours</p>
            </div>
            <RefreshCw className={canSpin ? "text-maroon-900" : "text-gray-200"} size={20} />
          </div>
          <SpinWheel canSpin={canSpin} onResult={(p) => handlePrizeAction(p, 'spin')} />
        </div>

        {/* 4. SIDEBAR: SCRATCH & SLOT */}
        <div className="space-y-8">
          {/* Scratch Card */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-50">
            <h3 className="text-xl font-serif italic text-maroon-900 mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Mystery Scratch</h3>
            <ScratchCard canPlay={canScratch} onWin={(p) => handlePrizeAction(p, 'scratch')} />
          </div>

          {/* Slot Machine Link */}
          <Link to="/slot" className="block group">
            <div className="bg-maroon-900 rounded-[2rem] p-8 text-white flex justify-between items-center transition-transform hover:scale-95">
              <div>
                <h3 className="text-xl font-serif italic" style={{ fontFamily: "'Cormorant Garamond', serif" }}>The Slot Sanctuary</h3>
                <p className="text-[10px] opacity-60">High Stakes • High Glow</p>
              </div>
              <ArrowRight size={20} />
            </div>
          </Link>
        </div>
      </div>

      {/* 5. LUCKY DRAW */}
      <div className="max-w-6xl mx-auto px-4 mt-12">
        <div className="bg-maroon-900  rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-lg">
            <div className="bg-gold-500 text-maroon-900 text-[10px] font-bold px-3 py-1 rounded-full inline-block mb-4">LIVE EVENT</div>
            <h2 className="text-4xl font-serif italic mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Grand Beauty Hamper</h2>
            <p className="text-sm opacity-80 mb-8 font-light">Enter our monthly lucky draw to win the "DermaFlow Radiance Kit" worth ₹4,999. Winners announced on the 1st of every month.</p>
            
            {userData?.luckyDrawEntered ? (
              <div className="flex items-center gap-2 text-gold-500 font-bold">
                <Check size={18} /> ENTRY CONFIRMED
              </div>
            ) : (
              <button onClick={handleLuckyDraw} className="bg-gold-500 text-maroon-900 px-8 py-3 rounded-full font-bold text-sm hover:bg-white transition-colors">
                ENTER DRAW FOR FREE
              </button>
            )}
          </div>
          <Trophy size={200} className="absolute -right-10 -bottom-10 opacity-10 rotate-12" />
        </div>
      </div>

      {/* 6. REFERRAL & COUPON SECTION */}
      <div className="max-w-6xl mx-auto px-4 mt-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Referral */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-50">
            <h3 className="text-xl font-serif italic text-maroon-900 mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Invite Your Inner Circle</h3>
            <p className="text-xs text-gray-400 mb-6">Earn 200 Glow Points for every successful referral.</p>
            <div className="flex items-center justify-between bg-champagne p-4 rounded-2xl border border-gray-100">
              <span className="font-mono font-bold text-maroon-900 tracking-widest">{userData?.referralCode || 'DERMA_GIFT'}</span>
              <button onClick={() => copyCode(userData?.referralCode || 'DERMA_GIFT')} className="text-gold-500 hover:text-maroon-900 transition-colors">
                <Share2 size={20} />
              </button>
            </div>
          </div>

          {/* Coupon Section - Combined Earned + Static Coupons */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-50">
            <h3 className="text-xl font-serif italic text-maroon-900 mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Your Active Coupons</h3>
            
            {/* Earned Vouchers from Games */}
            {activeEarnedVouchers.length > 0 && (
              <div className="mb-6">
                <p className="text-xs text-gold-500 mb-3 font-semibold">EARNED REWARDS</p>
                <div className="space-y-3">
                  {activeEarnedVouchers.map((v, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-maroon-900 text-white rounded-xl">
                      <div>
                        <span className="text-sm font-bold">{v.type === 'flat' ? `₹${v.discount}` : `${v.discount}%`} OFF</span>
                        <p className="text-[9px] opacity-70">Expires {new Date(v.expiresAt).toLocaleDateString()}</p>
                      </div>
                      <code className="text-[10px] bg-white/20 px-2 py-1 rounded font-mono">{v.code}</code>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Boutique Promo Codes (Static) */}
            <div>
              <p className="text-xs text-gray-400 mb-3 font-semibold">BOUTIQUE PROMO CODES</p>
              <div className="space-y-3">
                {STATIC_COUPONS.map((coupon, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-champagne rounded-2xl border border-gray-100 hover:border-gold-500 transition-colors group">
                    <div>
                      <span className="text-sm font-bold text-maroon-900">{coupon.discount}</span>
                      <p className="text-[10px] text-gray-400">On orders over {coupon.minSpend}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <code className="text-xs font-mono font-bold text-gold-500">{coupon.code}</code>
                      <button 
                        onClick={() => copyCode(coupon.code)} 
                        className="p-2 text-gray-300 group-hover:text-maroon-900 transition-colors"
                      >
                        {copiedCode === coupon.code ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {activeEarnedVouchers.length === 0 && (
              <p className="text-center text-gray-300 text-sm mt-6">Play games to earn exclusive coupons!</p>
            )}
          </div>
        </div>
      </div>

      {/* Global CSS for Fonts & Colors */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,600&family=Inter:wght@300;400;700&display=swap');
        
        .bg-gold-500 { background-color: #C9A84C; }
        .text-gold-500 { color: #C9A84C; }
        .bg-maroon-900 { background-color: #4A0E2E; }
        .text-maroon-900 { color: #4A0E2E; }
        .bg-champagne { background-color: #FDFCFB; }
        .text-champagne { color: #FDFCFB; }
        .border-gold-500 { border-color: #C9A84C; }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce {
          animation: bounce 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}