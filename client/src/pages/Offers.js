import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  Gift, Copy, Check, Star, Trophy, Ticket, Users,
  Sparkles, ShoppingBag, ArrowRight, Lock,
  Share2, MousePointer2, RefreshCw, Package
} from 'lucide-react';
import api from '../services/api';

const MAROON = '#4A0E2E';
const GOLD = '#C9A84C';
const CHAMPAGNE = '#FDFCFB';

const STATIC_COUPONS = [
  { code: 'WELCOME15', discount: '15% OFF', minSpend: '₹999' },
  { code: 'GLOW10',    discount: '10% OFF', minSpend: '₹499' },
  { code: 'FREESHIP',  discount: 'Free Shipping', minSpend: '₹999' },
];

const SPIN_SEGMENTS = [
  { label: '20% OFF',   type: 'voucher',   discount: 20,  color: MAROON,    prob: 5  },
  { label: '15% OFF',   type: 'voucher',   discount: 15,  color: GOLD,      prob: 10 },
  { label: '50 PTS',    type: 'points',    pts: 50,       color: '#8B6B5E', prob: 20 },
  { label: 'FREE SHIP', type: 'voucher',   freeShipping: true, discount: 0, color: '#A39185', prob: 15 },
  { label: 'ZOMATO',    type: 'affiliate', partner: 'Zomato', discount: 15, color: '#632A31', prob: 5  },
  { label: '10% OFF',   type: 'voucher',   discount: 10,  color: MAROON,    prob: 20 },
  { label: 'NYKAA',     type: 'affiliate', partner: 'Nykaa',  discount: 100, flat: true, color: GOLD, prob: 5 },
];

const SCRATCH_PRIZES = [
  { label: '₹100 FLAT', type: 'voucher', discount: 100, flat: true,         prob: 10 },
  { label: '20% OFF',   type: 'voucher', discount: 20,                       prob: 15 },
  { label: '100 PTS',   type: 'points',  pts: 100,                           prob: 20 },
  { label: 'FREE SHIP', type: 'voucher', freeShipping: true, discount: 0,    prob: 20 },
];

const weightedRandom = (items) => {
  const total = items.reduce((s, i) => s + (i.prob || 1), 0);
  let r = Math.random() * total;
  for (const item of items) { r -= (item.prob || 1); if (r <= 0) return item; }
  return items[0];
};

// ── Spin Wheel ────────────────────────────────────────────────────────────────
function SpinWheel({ onResult, canSpin }) {
  const canvasRef   = useRef(null);
  const rotationRef = useRef(0);
  const [spinning, setSpinning] = useState(false);

  useEffect(() => { drawWheel(); }, [canSpin]);

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2, cy = canvas.height / 2;
    const radius = cx - 10;
    const step = (2 * Math.PI) / SPIN_SEGMENTS.length;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    SPIN_SEGMENTS.forEach((seg, i) => {
      const start = i * step + rotationRef.current;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, start, start + step);
      ctx.fillStyle = seg.color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + step / 2);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(seg.label, radius * 0.65, 4);
      ctx.restore();
    });

    // Centre dot
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fillStyle = MAROON;
    ctx.fill();
  };

  const spin = () => {
    if (spinning || !canSpin) return;
    setSpinning(true);

    // Pick prize BEFORE animation (deterministic)
    const prize = weightedRandom(SPIN_SEGMENTS);

    // Figure out which segment index this prize is
    const idx = SPIN_SEGMENTS.indexOf(prize);
    const step = (2 * Math.PI) / SPIN_SEGMENTS.length;

    // We want the pointer (top = -π/2) to land on this segment's midpoint
    const targetAngle = -(idx * step + step / 2) - Math.PI / 2;
    // Add 5 full rotations for drama
    const totalRotation = targetAngle + Math.PI * 10;

    const duration = 4000;
    const startRotation = rotationRef.current;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 4);
      rotationRef.current = startRotation + (totalRotation - startRotation) * easeOut;
      drawWheel();
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        onResult(prize);
      }
    };
    requestAnimationFrame(animate);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-6">
        {/* Pointer arrow */}
        <div style={{
          position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)',
          zIndex: 10, width: 0, height: 0,
          borderLeft: '10px solid transparent',
          borderRight: '10px solid transparent',
          borderTop: `20px solid ${MAROON}`,
        }} />
        <canvas ref={canvasRef} width={280} height={280} className="rounded-full shadow-2xl" />
      </div>
      <button onClick={spin} disabled={!canSpin || spinning}
        style={{
          background: canSpin && !spinning ? MAROON : '#d1d5db',
          color: '#fff', border: 'none', borderRadius: 999,
          padding: '10px 32px', fontWeight: 700, fontSize: 13,
          letterSpacing: '0.08em', textTransform: 'uppercase',
          cursor: canSpin && !spinning ? 'pointer' : 'not-allowed',
          transition: 'transform 0.1s',
        }}
      >
        {spinning ? 'Spinning…' : canSpin ? 'Spin Ritual' : 'Already Spun Today'}
      </button>
      {!canSpin && (
        <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 8 }}>
          Come back tomorrow for your next spin!
        </p>
      )}
    </div>
  );
}

// ── Scratch Card ──────────────────────────────────────────────────────────────
function ScratchCard({ canPlay, onWin }) {
  const [revealed, setRevealed] = useState(false);
  const [prize, setPrize]       = useState(null);

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
        <div onClick={handleReveal} style={{
          height: 140, borderRadius: 16,
          border: `2px dashed ${canPlay ? GOLD : '#e5e7eb'}`,
          background: canPlay ? CHAMPAGNE : '#f9fafb',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          cursor: canPlay ? 'pointer' : 'not-allowed',
          opacity: canPlay ? 1 : 0.6, transition: 'all 0.2s',
        }}>
          {canPlay ? (
            <>
              <MousePointer2 size={24} color={GOLD} style={{ marginBottom: 8 }} />
              <p style={{ fontWeight: 700, fontSize: 13, color: MAROON, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tap to Scratch</p>
            </>
          ) : (
            <>
              <Lock size={20} color="#d1d5db" style={{ marginBottom: 8 }} />
              <p style={{ fontSize: 12, color: '#9ca3af' }}>Unlock with your first order</p>
            </>
          )}
        </div>
      ) : (
        <div style={{
          height: 140, borderRadius: 16,
          border: `1px solid ${GOLD}`, background: '#fff',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Trophy size={20} color={GOLD} style={{ marginBottom: 8 }} />
          <p style={{ fontWeight: 800, fontSize: 22, color: MAROON }}>{prize?.label}</p>
          <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Voucher saved to Your Coupons ✅</p>
        </div>
      )}
    </div>
  );
}

// ── Main Offers Page ──────────────────────────────────────────────────────────
export default function Offers() {
  const { user } = useAuth();
  const [userData, setUserData]   = useState(null);
  const [canSpin, setCanSpin]     = useState(false);
  const [canScratch, setCanScratch] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [prizeMsg, setPrizeMsg]   = useState('');

  useEffect(() => {
    if (user) fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUserData(data);

      const isToday = (dateStr) => {
        if (!dateStr) return false;
        const d = new Date(dateStr), n = new Date();
        return d.getDate() === n.getDate() && d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
      };
      setCanSpin(!isToday(data.lastSpinDate));
      setCanScratch(!isToday(data.lastScratchDate) && (data.orderCount || 0) > 0);
    } catch (e) { console.error(e); }
  };

  const handlePrizeAction = async (prize, type) => {
    try {
      const { data } = await api.post(`/auth/${type}`, { prize });
      await fetchUserData(); // refresh so vouchers update

      // Build human-readable prize message
      let msg = '';
      if (prize.type === 'points')    msg = `🎉 You won ${prize.pts} Glow Points!`;
      else if (prize.freeShipping)    msg = `🎉 Free Shipping voucher saved!`;
      else if (prize.type === 'affiliate') msg = `🎉 ${prize.partner} voucher saved — ${prize.discount}${prize.flat ? '₹' : '%'} off!`;
      else msg = `🎉 ${prize.label} voucher saved to Your Coupons!`;

      if (data.voucherCode) msg += ` Code: ${data.voucherCode}`;
      setPrizeMsg(msg);
      setTimeout(() => setPrizeMsg(''), 6000);
    } catch (e) {
      console.error(e);
      const errMsg = e.response?.data?.message || 'Error saving prize';
      setPrizeMsg(`❌ ${errMsg}`);
      setTimeout(() => setPrizeMsg(''), 4000);
    }
  };

  const handleLuckyDraw = async () => {
    if (userData?.luckyDrawEntered) { alert('You have already entered the lucky draw!'); return; }
    try {
      await api.post('/auth/lucky-draw', {});
      fetchUserData();
      alert("✨ You've entered the Grand Lucky Draw!");
    } catch (e) { alert('Error entering lucky draw'); }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const activeEarnedVouchers = (userData?.vouchers || []).filter(
    v => !v.isUsed && new Date(v.expiresAt) > new Date()
  );

  const formatVoucher = (v) => {
    if (v.type === 'flat') return `₹${v.discount} OFF`;
    if (v.discount === 0)  return 'FREE SHIPPING';
    return `${v.discount}% OFF`;
  };

  return (
    <div className="min-h-screen pb-20" style={{ background: CHAMPAGNE, fontFamily: "'Inter', sans-serif" }}>

      {/* Hero */}
      <section style={{ background: MAROON }} className="py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <Sparkles size={48} color={GOLD} style={{ margin: '0 auto 20px' }} />
          <h1 style={{ fontFamily: "'Georgia', serif", color: CHAMPAGNE, fontSize: 'clamp(2rem, 8vw, 3.5rem)', fontStyle: 'italic', marginBottom: 8 }}>
            The Gilded Boutique
          </h1>
          <p style={{ fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>
            Daily Rituals & Exclusive Perks
          </p>
        </div>
      </section>

      {/* Stats bar */}
      <div className="max-w-6xl mx-auto px-4 -mt-8">
        <div className="bg-white rounded-3xl p-6 shadow-xl grid grid-cols-2 md:grid-cols-4 gap-4 border border-gray-100">
          {[
            { icon: <Star size={20} color={GOLD} />, val: userData?.glowPoints || 0,           label: 'Glow Points' },
            { icon: <Ticket size={20} color={GOLD} />, val: activeEarnedVouchers.length,        label: 'Coupons' },
            { icon: <ShoppingBag size={20} color={GOLD} />, val: userData?.orderCount || 0,     label: 'Total Orders' },
            { icon: <Users size={20} color={GOLD} />, val: userData?.referralCount || 0,        label: 'Referrals' },
          ].map((s, i) => (
            <div key={i} className={`text-center ${i > 0 ? 'border-l border-gray-100' : ''}`}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: MAROON }}>{s.val}</div>
              <p style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Prize message toast */}
      {prizeMsg && (
        <div style={{
          position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)',
          background: MAROON, color: '#fff', padding: '12px 24px', borderRadius: 12,
          zIndex: 100, fontWeight: 600, fontSize: 14, boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          maxWidth: '90vw', textAlign: 'center',
        }}>
          {prizeMsg}
        </div>
      )}

      {/* Spin + Scratch */}
      <div className="max-w-6xl mx-auto px-4 mt-12 grid lg:grid-cols-3 gap-8">

        {/* Spin Wheel */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-50">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 style={{ fontFamily: "'Georgia', serif", fontSize: 28, fontStyle: 'italic', color: MAROON }}>Daily Spin Ritual</h2>
              <p style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>Resets every 24 hours</p>
            </div>
            <RefreshCw size={18} color={canSpin ? MAROON : '#e5e7eb'} />
          </div>
          {user ? (
            <SpinWheel canSpin={canSpin} onResult={(p) => handlePrizeAction(p, 'spin')} />
          ) : (
            <div className="text-center py-12">
              <p style={{ color: '#9ca3af', marginBottom: 12 }}>Please login to spin</p>
              <Link to="/login" style={{ background: MAROON, color: '#fff', padding: '10px 24px', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>Login</Link>
            </div>
          )}
        </div>

        {/* Scratch + Slot */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] p-7 shadow-sm border border-gray-50">
            <h3 style={{ fontFamily: "'Georgia', serif", fontSize: 20, fontStyle: 'italic', color: MAROON, marginBottom: 16 }}>Mystery Scratch</h3>
            {user ? (
              <ScratchCard canPlay={canScratch} onWin={(p) => handlePrizeAction(p, 'scratch')} />
            ) : (
              <div className="text-center py-8">
                <Lock size={24} color="#d1d5db" style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: 12, color: '#9ca3af' }}>Login to play</p>
              </div>
            )}
            {!canScratch && user && (userData?.orderCount || 0) === 0 && (
              <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', marginTop: 8 }}>Place your first order to unlock!</p>
            )}
          </div>

          <Link to="/slot" style={{ textDecoration: 'none', display: 'block' }}>
            <div style={{ background: MAROON, borderRadius: 32, padding: '28px 24px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'transform 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(0.97)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div>
                <h3 style={{ fontFamily: "'Georgia', serif", fontSize: 18, fontStyle: 'italic' }}>The Slot Sanctuary</h3>
                <p style={{ fontSize: 10, opacity: 0.6, marginTop: 3 }}>High Stakes • High Glow</p>
              </div>
              <ArrowRight size={18} />
            </div>
          </Link>

          {/* Subscription link */}
          <Link to="/subscriptions" style={{ textDecoration: 'none', display: 'block' }}>
            <div style={{ background: `${GOLD}20`, border: `1px solid ${GOLD}40`, borderRadius: 24, padding: '20px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: 14, color: MAROON }}>📦 Subscribe & Save</h3>
                <p style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>Up to 20% off on repeat orders</p>
              </div>
              <ArrowRight size={16} color={MAROON} />
            </div>
          </Link>
        </div>
      </div>

      {/* Lucky Draw */}
      <div className="max-w-6xl mx-auto px-4 mt-10">
        <div style={{ background: MAROON, borderRadius: 48, padding: '40px 40px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'relative', zIndex: 1, maxWidth: 500 }}>
            <span style={{ background: GOLD, color: MAROON, fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 999 }}>LIVE EVENT</span>
            <h2 style={{ fontFamily: "'Georgia', serif", fontSize: 36, fontStyle: 'italic', margin: '12px 0' }}>Grand Beauty Hamper</h2>
            <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 24 }}>Win the "DermaFlow Radiance Kit" worth ₹4,999. Winners announced on the 1st of every month.</p>
            {userData?.luckyDrawEntered ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: GOLD, fontWeight: 700 }}>
                <Check size={18} /> ENTRY CONFIRMED
              </div>
            ) : (
              <button onClick={handleLuckyDraw} style={{ background: GOLD, color: MAROON, border: 'none', borderRadius: 999, padding: '12px 28px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                ENTER DRAW FOR FREE
              </button>
            )}
          </div>
          <Trophy size={180} style={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.08 }} />
        </div>
      </div>

      {/* Referral + Coupons */}
      <div className="max-w-6xl mx-auto px-4 mt-10">
        <div className="grid md:grid-cols-2 gap-8">

          {/* Referral */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-50">
            <h3 style={{ fontFamily: "'Georgia', serif", fontSize: 20, fontStyle: 'italic', color: MAROON, marginBottom: 6 }}>Invite Your Inner Circle</h3>
            <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 20 }}>Earn 200 Glow Points for every successful referral.</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: CHAMPAGNE, border: '1px solid #e5e7eb', borderRadius: 16, padding: '14px 18px' }}>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: MAROON, letterSpacing: '0.1em' }}>{userData?.referralCode || 'DERMA_GIFT'}</span>
              <button onClick={() => copyCode(userData?.referralCode || 'DERMA_GIFT')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: GOLD }}>
                <Share2 size={18} />
              </button>
            </div>
          </div>

          {/* Coupons */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-50">
            <h3 style={{ fontFamily: "'Georgia', serif", fontSize: 20, fontStyle: 'italic', color: MAROON, marginBottom: 16 }}>Your Active Coupons</h3>

            {/* Earned vouchers */}
            {activeEarnedVouchers.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 11, color: GOLD, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Earned Rewards</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {activeEarnedVouchers.map((v, i) => (
                    <div key={i} style={{ background: MAROON, borderRadius: 12, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{formatVoucher(v)}</span>
                        {v.partner && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginLeft: 6 }}>via {v.partner}</span>}
                        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                          Expires {new Date(v.expiresAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <code style={{ fontSize: 10, background: 'rgba(255,255,255,0.15)', padding: '3px 8px', borderRadius: 6, color: '#fff', fontFamily: 'monospace' }}>{v.code}</code>
                        <button onClick={() => copyCode(v.code)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: GOLD }}>
                          {copiedCode === v.code ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Static promo codes */}
            <div>
              <p style={{ fontSize: 11, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Boutique Promo Codes</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {STATIC_COUPONS.map((c, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: CHAMPAGNE, borderRadius: 16, border: '1px solid #f0f0f0' }}>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: MAROON }}>{c.discount}</span>
                      <p style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>On orders over {c.minSpend}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <code style={{ fontSize: 12, fontWeight: 700, color: GOLD, fontFamily: 'monospace' }}>{c.code}</code>
                      <button onClick={() => copyCode(c.code)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                        {copiedCode === c.code ? <Check size={14} color={MAROON} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {activeEarnedVouchers.length === 0 && (
              <p style={{ textAlign: 'center', color: '#d1d5db', fontSize: 13, marginTop: 16 }}>Spin or scratch to earn exclusive coupons!</p>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,600&family=Inter:wght@300;400;700&display=swap');
      `}</style>
    </div>
  );
}