import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Gift, Copy, Check, Tag, Clock, Star, Zap, RefreshCw,
  Trophy, Ticket, Users, ChevronRight, AlertCircle, Lock
} from 'lucide-react';

const API = 'http://localhost:5000/api';
const M   = '#4A0E2E';
const tok = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

// ── AFFILIATE PRIZES (mixed with own vouchers) ────────────────────────────────
const SPIN_SEGMENTS = [
  { label: '10% off DermaFlow', type: 'own',       discount: 10, color: '#fef3c7', text: '#d97706', prob: 25 },
  { label: '15% off Zomato',    type: 'affiliate',  partner: 'Zomato',    discount: 15, minOrder: 200, color: '#dbeafe', text: '#1d4ed8', prob: 18 },
  { label: '5% off DermaFlow',  type: 'own',        discount: 5,  color: '#f0fdf4', text: '#16a34a', prob: 20 },
  { label: '₹100 off Nykaa',    type: 'affiliate',  partner: 'Nykaa',     discount: 100, flat: true, minOrder: 699, color: '#fdf2f8', text: '#be185d', prob: 12 },
  { label: '20% off DermaFlow', type: 'own',        discount: 20, color: '#ede9fe', text: '#7c3aed', prob: 8  },
  { label: '50 Glow Points',    type: 'points',     pts: 50,      color: '#f0fdfa', text: '#0d9488', prob: 15 },
  { label: '15% off Swiggy',    type: 'affiliate',  partner: 'Swiggy',    discount: 15, minOrder: 300, color: '#fff7ed', text: '#c2410c', prob: 10 },
  { label: 'Free Shipping',     type: 'shipping',   color: '#f0fdf4', text: '#15803d', prob: 8 },
  { label: '10% off Myntra',    type: 'affiliate',  partner: 'Myntra',    discount: 10, minOrder: 499, color: '#fdf4ff', text: '#9333ea', prob: 7 },
  { label: 'Try Again',         type: 'none',       color: '#f9fafb', text: '#9ca3af', prob: 7 },
];

// ── SCRATCH CARD PRIZES ───────────────────────────────────────────────────────
const SCRATCH_PRIZES = [
  { label: '₹50 off',         type: 'own',       discount: 50, flat: true,  prob: 20 },
  { label: '10% off',         type: 'own',       discount: 10,             prob: 25 },
  { label: '25 Glow Points',  type: 'points',    pts: 25,                  prob: 20 },
  { label: '15% off Nykaa',   type: 'affiliate', partner: 'Nykaa', discount: 15, minOrder: 499, prob: 15 },
  { label: 'Free Shipping',   type: 'shipping',                            prob: 12 },
  { label: '50 Glow Points',  type: 'points',    pts: 50,                  prob: 8  },
];

// ── HELPERS ───────────────────────────────────────────────────────────────────
const weightedRandom = (items) => {
  const total = items.reduce((s, i) => s + (i.prob || 1), 0);
  let r = Math.random() * total;
  for (const item of items) { r -= (item.prob || 1); if (r <= 0) return item; }
  return items[0];
};

const nextMidnight = () => {
  const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(0,0,0,0);
  return d;
};

const timeUntilMidnight = () => {
  const now = new Date(), midnight = nextMidnight();
  const diff = midnight - now;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
};

// ── COUNTDOWN TIMER ───────────────────────────────────────────────────────────
function Countdown() {
  const [time, setTime] = useState(timeUntilMidnight());
  useEffect(() => {
    const t = setInterval(() => setTime(timeUntilMidnight()), 1000);
    return () => clearInterval(t);
  }, []);
  return <span style={{ fontFamily: 'monospace', fontWeight: 800, color: M }}>{time}</span>;
}

// ── SPIN WHEEL ────────────────────────────────────────────────────────────────
function SpinWheel({ onResult, canSpin, glowPoints }) {
  const canvasRef  = useRef(null);
  const rotRef     = useRef(0);
  const [spinning, setSpinning] = useState(false);
  const [result,   setResult]   = useState(null);

  const draw = (rot) => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2, cy = canvas.height / 2, r = cx - 6;
    const slice = (2 * Math.PI) / SPIN_SEGMENTS.length;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save(); ctx.translate(cx, cy); ctx.rotate((rot * Math.PI) / 180);
    SPIN_SEGMENTS.forEach((seg, i) => {
      const start = i * slice;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r, start, start + slice); ctx.closePath();
      ctx.fillStyle = seg.color; ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.08)'; ctx.lineWidth = 1; ctx.stroke();
      ctx.save(); ctx.rotate(start + slice / 2);
      ctx.textAlign = 'right'; ctx.fillStyle = seg.text;
      ctx.font = `bold ${SPIN_SEGMENTS.length > 8 ? 9 : 11}px system-ui`;
      const words = seg.label.split(' ');
      if (words.length > 2) {
        ctx.fillText(words.slice(0, 2).join(' '), r - 12, -4);
        ctx.fillText(words.slice(2).join(' '), r - 12, 8);
      } else {
        ctx.fillText(seg.label, r - 12, 4);
      }
      ctx.restore();
    });
    ctx.restore();
    // Center
    ctx.beginPath(); ctx.arc(cx, cy, 26, 0, 2 * Math.PI);
    ctx.fillStyle = M; ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('SPIN', cx, cy + 4);
  };

  useEffect(() => { draw(rotRef.current); }, []);

  const spin = async () => {
    if (spinning || !canSpin) return;
    setSpinning(true); setResult(null);
    const prize = weightedRandom(SPIN_SEGMENTS);
    const extraSpins = 5 + Math.floor(Math.random() * 4);
    const from = rotRef.current;
    const to   = from + extraSpins * 360 + Math.random() * 360;
    const dur  = 4000;
    const start = performance.now();
    const animate = (now) => {
      const t = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 4);
      const cur = from + (to - from) * ease;
      rotRef.current = cur;
      draw(cur);
      if (t < 1) { requestAnimationFrame(animate); }
      else {
        setSpinning(false);
        setResult(prize);
        onResult(prize);
      }
    };
    requestAnimationFrame(animate);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <div style={{ position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)', zIndex: 2 }}>
          <div style={{ width: 0, height: 0, borderLeft: '12px solid transparent', borderRight: '12px solid transparent', borderTop: `24px solid ${M}` }}/>
        </div>
        <canvas ref={canvasRef} width={280} height={280} onClick={spin}
          style={{ cursor: canSpin && !spinning ? 'pointer' : 'not-allowed', borderRadius: '50%', boxShadow: '0 8px 32px rgba(74,14,46,0.2)', display: 'block' }}/>
      </div>
      {result && result.type !== 'none' && (
        <div style={{ marginTop: 16, background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 12, padding: '12px 20px', display: 'inline-block' }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#15803d' }}>You won: {result.label}!</div>
          {result.type === 'affiliate' && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3 }}>Valid on {result.partner} · Min order ₹{result.minOrder}</div>}
        </div>
      )}
      {result?.type === 'none' && (
        <div style={{ marginTop: 16, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: '12px 20px', display: 'inline-block', color: '#9ca3af', fontSize: 14, fontWeight: 600 }}>Better luck next time!</div>
      )}
      {!canSpin && (
        <div style={{ marginTop: 12, fontSize: 12, color: '#9ca3af' }}>
          Next spin available at midnight — <Countdown />
        </div>
      )}
      {canSpin && !spinning && !result && (
        <button onClick={spin} style={{ marginTop: 14, background: M, color: '#fff', border: 'none', borderRadius: 9, padding: '10px 24px', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
          Spin Now
        </button>
      )}
    </div>
  );
}

// ── SCRATCH CARD ──────────────────────────────────────────────────────────────
function ScratchCard({ prize, onScratched, scratched }) {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const pct       = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#c0a080';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    for (let i = 0; i < 40; i++) {
      ctx.fillRect(Math.random()*canvas.width, Math.random()*canvas.height, 3+Math.random()*20, 1.5);
    }
    ctx.fillStyle = '#b08060';
    ctx.font = 'bold 14px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('SCRATCH HERE', canvas.width/2, canvas.height/2 - 8);
    ctx.font = '11px system-ui'; ctx.fillStyle = '#8b6040';
    ctx.fillText('Rub to reveal your prize', canvas.width/2, canvas.height/2 + 12);
  }, []);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const src  = e.touches ? e.touches[0] : e;
    return { x: (src.clientX - rect.left) * (canvas.width / rect.width), y: (src.clientY - rect.top) * (canvas.height / rect.height) };
  };

  const scratch = (e) => {
    if (scratched || !isDrawing.current) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath(); ctx.arc(pos.x, pos.y, 22, 0, 2*Math.PI); ctx.fill();

    // Check revealed %
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let transparent = 0;
    for (let i = 3; i < data.length; i += 4) if (data[i] === 0) transparent++;
    pct.current = (transparent / (data.length / 4)) * 100;
    if (pct.current > 55) onScratched();
  };

  if (scratched) return null;

  return (
    <canvas ref={canvasRef} width={260} height={120}
      style={{ borderRadius: 12, cursor: 'crosshair', display: 'block', touchAction: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
      onMouseDown={() => { isDrawing.current = true; }}
      onMouseUp={()   => { isDrawing.current = false; }}
      onMouseMove={scratch}
      onTouchStart={(e) => { isDrawing.current = true; scratch(e); }}
      onTouchEnd={()   => { isDrawing.current = false; }}
      onTouchMove={scratch}
    />
  );
}

function ScratchCardGame({ onWin, canPlay }) {
  const [prize,     setPrize]     = useState(null);
  const [scratched, setScratched] = useState(false);
  const [started,   setStarted]   = useState(false);

  const start = () => {
    setPrize(weightedRandom(SCRATCH_PRIZES));
    setStarted(true);
  };

  const revealed = () => {
    setScratched(true);
    onWin(prize);
  };

  if (!canPlay) return (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <Lock size={28} color="#d1d5db" style={{ margin: '0 auto 8px', display: 'block' }}/>
      <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 6 }}>Scratch card available after your next order</p>
      <p style={{ fontSize: 11, color: '#d1d5db' }}>Next scratch: <Countdown /></p>
    </div>
  );

  if (!started) return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: 260, height: 120, background: 'linear-gradient(135deg,#c0a080,#8b6040)', borderRadius: 12, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
        <div style={{ color: '#fff', textAlign: 'center' }}>
          <Gift size={28} style={{ margin: '0 auto 6px', display: 'block' }}/>
          <div style={{ fontWeight: 800, fontSize: 15 }}>Scratch Card</div>
          <div style={{ fontSize: 11, opacity: 0.8 }}>A prize is hidden inside</div>
        </div>
      </div>
      <button onClick={start} style={{ background: M, color: '#fff', border: 'none', borderRadius: 9, padding: '10px 24px', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
        Get Your Card
      </button>
    </div>
  );

  return (
    <div style={{ textAlign: 'center' }}>
      {!scratched ? (
        <>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
            <div style={{ width: 260, height: 120, background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px solid #86efac' }}>
              <div style={{ fontWeight: 800, fontSize: 22, color: '#15803d' }}>{prize?.label}</div>
              {prize?.type === 'affiliate' && <div style={{ fontSize: 11, color: '#6b7280', marginTop: 3 }}>on {prize.partner}</div>}
            </div>
            <div style={{ position: 'absolute', inset: 0 }}>
              <ScratchCard prize={prize} onScratched={revealed} scratched={scratched}/>
            </div>
          </div>
          <p style={{ fontSize: 12, color: '#9ca3af' }}>Scratch to reveal your prize</p>
        </>
      ) : (
        <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 14, padding: '20px 24px' }}>
          <Check size={28} color="#15803d" style={{ margin: '0 auto 8px', display: 'block' }}/>
          <div style={{ fontWeight: 800, fontSize: 18, color: '#15803d', marginBottom: 4 }}>You revealed: {prize?.label}!</div>
          {prize?.type === 'affiliate' && <div style={{ fontSize: 12, color: '#6b7280' }}>Valid on {prize.partner} · Min ₹{prize.minOrder}</div>}
        </div>
      )}
    </div>
  );
}

// ── LUCKY DRAW ────────────────────────────────────────────────────────────────
function LuckyDraw({ user, alreadyEntered, onEnter, entries }) {
  const daysLeft = Math.ceil((new Date('2025-03-31') - new Date()) / (1000*60*60*24));
  return (
    <div>
      <div style={{ background: `linear-gradient(135deg,${M},#7B2D3C)`, borderRadius: 16, padding: '24px', color: '#fff', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}/>
        <div style={{ position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }}/>
        <Trophy size={28} color="rgba(255,255,255,0.9)" style={{ marginBottom: 10 }}/>
        <h3 style={{ fontWeight: 900, fontSize: 20, margin: '0 0 6px', letterSpacing: '-0.3px' }}>Beauty Hamper Lucky Draw</h3>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', margin: '0 0 16px', lineHeight: 1.6 }}>
          Win 1 of 50 premium beauty hampers worth ₹2,500 each. Every customer gets one free entry. Place an order to get 3 extra entries!
        </p>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'Total Prizes', value: '50 Hampers' },
            { label: 'Prize Value', value: '₹2,500 each' },
            { label: 'Entries', value: `${entries.toLocaleString('en-IN')}+` },
            { label: 'Draw Date', value: '31 March 2025' },
          ].map(k => (
            <div key={k.label}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginBottom: 2 }}>{k.label}</div>
              <div style={{ fontWeight: 800, fontSize: 15 }}>{k.value}</div>
            </div>
          ))}
        </div>
      </div>

      {alreadyEntered ? (
        <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Check size={20} color="#15803d"/>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#15803d' }}>You're entered in the lucky draw!</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Place an order to earn 3 more entries and improve your chances. Draw: 31 March.</div>
          </div>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Enter the Lucky Draw — it's free</div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{daysLeft > 0 ? `${daysLeft} days left to enter` : 'Draw closed'}</div>
          </div>
          {user ? (
            <button onClick={onEnter} disabled={daysLeft <= 0} style={{ background: M, color: '#fff', border: 'none', borderRadius: 9, padding: '9px 20px', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
              Enter Free
            </button>
          ) : (
            <a href="/login" style={{ background: M, color: '#fff', borderRadius: 9, padding: '9px 20px', textDecoration: 'none', fontWeight: 700, fontSize: 13 }}>Login to Enter</a>
          )}
        </div>
      )}

      <div style={{ marginTop: 12, background: '#f9fafb', borderRadius: 10, padding: '12px 16px', fontSize: 11, color: '#9ca3af', lineHeight: 1.7 }}>
        T&C: One free entry per customer. 3 bonus entries per order placed before 31 March 2025. Winners announced on 1 April 2025 via email. Hamper contents may vary.
      </div>
    </div>
  );
}

// ── GLOW POINTS REDEEMER ──────────────────────────────────────────────────────
function GlowPointsPanel({ user }) {
  const pts = user?.glowPoints || 0;
  const worth = Math.floor(pts / 100) * 10; // 100 pts = ₹10

  return (
    <div style={{ background: `linear-gradient(135deg,${M}f0,${M}d0)`, backgroundImage: `linear-gradient(135deg, ${M}, #7B2D3C)`, borderRadius: 16, padding: '22px', color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Glow Points</div>
          <div style={{ fontSize: 36, fontWeight: 900, lineHeight: 1 }}>{pts.toLocaleString('en-IN')}</div>
        </div>
        <Star size={28} color="rgba(255,255,255,0.6)"/>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginBottom: 4 }}>Redeemable value</div>
        <div style={{ fontSize: 22, fontWeight: 800 }}>₹{worth.toLocaleString('en-IN')}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>100 Glow Points = ₹10 discount</div>
      </div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>
        Apply at checkout — min 100 pts. Earn 10 pts per ₹100 spent, 25 pts per review, 50 pts per recycled bottle, 200 pts per referral.
      </div>
      {pts >= 100 && (
        <div style={{ marginTop: 12, background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '8px 12px', fontSize: 12, fontWeight: 700 }}>
          You have enough points to save ₹{worth} on your next order!
        </div>
      )}
    </div>
  );
}

// ── MAIN OFFERS PAGE ──────────────────────────────────────────────────────────
export default function Offers() {
  const { user }                    = useAuth();
  const [tab, setTab]               = useState('spin');
  const [userData, setUserData]     = useState(null);
  const [canSpin, setCanSpin]       = useState(false);
  const [canScratch, setCanScratch] = useState(false);
  const [luckDrawEntered, setEntered] = useState(false);
  const [entries, setEntries]       = useState(12847);
  const [winResult, setWinResult]   = useState(null);
  const [copied, setCopied]         = useState(null);
  const [saving, setSaving]         = useState(false);

  // Static coupons
  const COUPONS = [
    { code: 'WELCOME15', discount: '15% OFF', desc: 'New customers — first order', minSpend: 999,  till: '2025-12-31', color: M },
    { code: 'DERMA20',   discount: '20% OFF', desc: 'Sitewide — limited time',     minSpend: 1499, till: '2025-06-30', color: '#1d4ed8' },
    { code: 'FREESHIP',  discount: 'Free Ship',desc: 'Orders above ₹999',          minSpend: 999,  till: '2025-12-31', color: '#16a34a' },
    { code: 'BUNDLE10',  discount: '10% OFF', desc: 'Buy 2+ products',             minSpend: 1999, till: '2025-09-30', color: '#d97706' },
  ];

  useEffect(() => {
    if (!user) return;
    axios.get(`${API}/auth/me`, tok()).then(r => {
      const u = r.data;
      setUserData(u);
      const today = new Date().toDateString();
      const lastSpin = u.lastSpinDate ? new Date(u.lastSpinDate).toDateString() : null;
      setCanSpin(lastSpin !== today);
      const lastScratch = u.lastScratchDate ? new Date(u.lastScratchDate).toDateString() : null;
      setCanScratch(lastScratch !== today && (u.orderCount || 0) > 0);
      setEntered(u.luckyDrawEntered || false);
    }).catch(() => {});
  }, [user]);

  const handleSpinResult = async (prize) => {
    if (!user || prize.type === 'none') return;
    setSaving(true);
    try {
      const r = await axios.post(`${API}/auth/spin`, { prize }, tok());
      setUserData(prev => ({ ...prev, glowPoints: r.data.glowPoints, vouchers: r.data.vouchers || prev?.vouchers || [], lastSpinDate: new Date() }));
      setCanSpin(false);
      setWinResult(prize);
    } catch(e) { console.error(e); }
    setSaving(false);
  };

  const handleScratchWin = async (prize) => {
    if (!user) return;
    try {
      await axios.post(`${API}/auth/scratch`, { prize }, tok());
      setCanScratch(false);
    } catch(e) { console.error(e); }
  };

  const handleLuckyDraw = async () => {
    if (!user) return;
    try {
      await axios.post(`${API}/auth/lucky-draw`, {}, tok());
      setEntered(true);
      setEntries(e => e + 1);
    } catch(e) { alert(e.response?.data?.message || 'Failed to enter'); }
  };

  const copy = (code) => { navigator.clipboard.writeText(code); setCopied(code); setTimeout(() => setCopied(null), 2000); };

  const TABS = [
    { k: 'spin',    l: 'Spin Wheel',   I: Zap },
    { k: 'scratch', l: 'Scratch Card', I: Gift },
    { k: 'lucky',   l: 'Lucky Draw',   I: Trophy },
    { k: 'points',  l: 'Glow Points',  I: Star },
    { k: 'coupons', l: 'Coupons',      I: Tag },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2.5rem 1rem', fontFamily: 'system-ui,sans-serif' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, background: `${M}15`, borderRadius: '50%', marginBottom: 14 }}>
          <Gift size={28} color={M}/>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#1f2937', margin: '0 0 8px', letterSpacing: '-0.5px' }}>Rewards & Offers</h1>
        <p style={{ color: '#9ca3af', fontSize: 14, margin: 0 }}>
          Spin to win, scratch to reveal, enter lucky draws — and redeem Glow Points for real discounts
        </p>
        {!user && (
          <div style={{ marginTop: 12, background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 10, padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#92400e' }}>
            <AlertCircle size={13}/> <a href="/login" style={{ color: '#92400e', fontWeight: 700 }}>Login</a> to play games and save your prizes
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#f3f4f6', borderRadius: 12, padding: 5, marginBottom: 28, flexWrap: 'wrap' }}>
        {TABS.map(({ k, l, I }) => (
          <button key={k} onClick={() => setTab(k)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, minWidth: 90, whiteSpace: 'nowrap', background: tab === k ? M : 'transparent', color: tab === k ? '#fff' : '#6b7280', transition: 'all 0.15s' }}>
            <I size={13}/>{l}
          </button>
        ))}
      </div>

      {/* ── SPIN WHEEL TAB ── */}
      {tab === 'spin' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
          <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 16, padding: '28px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', textAlign: 'center' }}>
            <SpinWheel onResult={handleSpinResult} canSpin={!!(user && canSpin)} glowPoints={userData?.glowPoints || 0}/>
          </div>
          <div>
            <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, padding: '20px', marginBottom: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: '#1f2937' }}>What you can win</div>
              {SPIN_SEGMENTS.filter(s => s.type !== 'none').map((seg, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid #f9fafb', fontSize: 12 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: seg.color, border: `2px solid ${seg.text}`, flexShrink: 0 }}/>
                  <span style={{ flex: 1, fontWeight: 500 }}>{seg.label}</span>
                  {seg.type === 'affiliate' && <span style={{ fontSize: 10, background: '#dbeafe', color: '#1d4ed8', padding: '1px 6px', borderRadius: 999, fontWeight: 700 }}>Partner</span>}
                </div>
              ))}
            </div>
            <div style={{ background: '#f9fafb', borderRadius: 12, padding: '14px 16px', fontSize: 12, color: '#6b7280', lineHeight: 1.7 }}>
              Spin once per day. Partner prizes are affiliate coupons — valid on partner apps, min spend applies. DermaFlow earns a commission when you use them.
            </div>
          </div>
        </div>
      )}

      {/* ── SCRATCH CARD TAB ── */}
      {tab === 'scratch' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
          <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 16, padding: '28px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', textAlign: 'center' }}>
            <h3 style={{ fontWeight: 800, fontSize: 18, margin: '0 0 6px', color: '#1f2937' }}>Scratch to Reveal</h3>
            <p style={{ color: '#9ca3af', fontSize: 12, marginBottom: 20 }}>One scratch card per day — unlocks after placing an order</p>
            <ScratchCardGame onWin={handleScratchWin} canPlay={!!(user && canScratch)}/>
            {user && !canScratch && (userData?.orderCount || 0) === 0 && (
              <p style={{ fontSize: 12, color: '#d97706', marginTop: 12 }}>Place your first order to unlock scratch cards!</p>
            )}
          </div>
          <div>
            <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: '#1f2937' }}>Possible prizes</div>
              {SCRATCH_PRIZES.map((p, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f9fafb', fontSize: 12 }}>
                  <span style={{ fontWeight: 500 }}>{p.label}</span>
                  {p.type === 'affiliate' && <span style={{ fontSize: 10, background: '#dbeafe', color: '#1d4ed8', padding: '1px 6px', borderRadius: 999, fontWeight: 700 }}>{p.partner}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── LUCKY DRAW TAB ── */}
      {tab === 'lucky' && (
        <LuckyDraw user={user} alreadyEntered={luckDrawEntered} onEnter={handleLuckyDraw} entries={entries}/>
      )}

      {/* ── GLOW POINTS TAB ── */}
      {tab === 'points' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <GlowPointsPanel user={userData || user}/>
          <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 16, padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14, color: '#1f2937' }}>How to earn Glow Points</div>
            {[
              { action: 'Place an order',     earn: '10 pts per ₹100' },
              { action: 'Write a review',     earn: '+25 pts' },
              { action: 'Recycle a bottle',   earn: '+50 pts' },
              { action: 'Refer a friend',     earn: '+200 pts' },
              { action: 'Complete skin quiz', earn: '+25 pts' },
              { action: 'Sign up',            earn: '+50 pts' },
            ].map(({ action, earn }) => (
              <div key={action} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f9fafb', fontSize: 13 }}>
                <span style={{ color: '#4b5563' }}>{action}</span>
                <span style={{ fontWeight: 700, color: M }}>{earn}</span>
              </div>
            ))}
            <div style={{ marginTop: 16, background: '#f0fdf4', borderRadius: 10, padding: '12px 14px', fontSize: 12, color: '#15803d', lineHeight: 1.7 }}>
              <strong>Redemption:</strong> 100 Glow Points = ₹10 off. Redeem at checkout — enter your points in the discount section. Min 100 pts per redemption.
            </div>
          </div>
        </div>
      )}

      {/* ── COUPONS TAB ── */}
      {tab === 'coupons' && (
        <div>
          {/* User's spin/scratch vouchers */}
          {(userData?.vouchers || []).filter(v => !v.isUsed && new Date(v.expiresAt) > new Date()).length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: '#1f2937' }}>Your Earned Vouchers</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 12 }}>
                {(userData.vouchers || []).filter(v => !v.isUsed && new Date(v.expiresAt) > new Date()).map((v, i) => (
                  <div key={i} style={{ background: `linear-gradient(135deg,${M},#7B2D3C)`, borderRadius: 14, padding: '18px', color: '#fff' }}>
                    <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 3 }}>{v.discount}{v.type === 'percent' ? '%' : '₹'} OFF</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginBottom: 12 }}>Expires {new Date(v.expiresAt).toLocaleDateString('en-IN')}</div>
                    <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 7, padding: '7px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 12, letterSpacing: '0.08em' }}>{v.code}</span>
                      <button onClick={() => copy(v.code)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: 5, padding: '3px 8px', cursor: 'pointer', fontSize: 10, fontWeight: 700 }}>
                        {copied === v.code ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Static coupons */}
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: '#1f2937' }}>Active Promo Codes</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
            {COUPONS.map((c, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ background: `${c.color}15`, borderRadius: 9, padding: 8 }}><Tag size={18} color={c.color}/></div>
                  <span style={{ fontWeight: 800, fontSize: 18, color: c.color }}>{c.discount}</span>
                </div>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, color: '#1f2937' }}>{c.desc}</div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 12 }}>Min spend ₹{c.minSpend} · Expires {new Date(c.till).toLocaleDateString('en-IN')}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ flex: 1, background: '#f9fafb', borderRadius: 7, padding: '8px 12px', fontFamily: 'monospace', fontWeight: 700, fontSize: 13, color: '#1f2937', border: '1px solid #f0f0f0' }}>{c.code}</div>
                  <button onClick={() => copy(c.code)} style={{ background: M, color: '#fff', border: 'none', borderRadius: 7, padding: '8px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                    {copied === c.code ? <><Check size={13}/> Copied</> : <><Copy size={13}/> Copy</>}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Referral */}
          {user && (
            <div style={{ marginTop: 24, background: `linear-gradient(135deg,${M},#7B2D3C)`, borderRadius: 16, padding: '24px', color: '#fff', textAlign: 'center' }}>
              <Gift size={24} color="rgba(255,255,255,0.8)" style={{ marginBottom: 10 }}/>
              <h3 style={{ fontWeight: 800, fontSize: 18, margin: '0 0 6px' }}>Refer Friends — Earn 200 pts Each</h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 18, lineHeight: 1.6 }}>
                Share your unique code. When they sign up, you both earn 200 Glow Points (= ₹20 off).
              </p>
              <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 10, padding: '10px 16px', display: 'inline-flex', gap: 12, alignItems: 'center', minWidth: 260 }}>
                <span style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: 16, letterSpacing: '0.15em' }}>{userData?.referralCode || user?.referralCode || '—'}</span>
                <button onClick={() => copy(userData?.referralCode || '')} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: 7, padding: '5px 12px', cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>
                  {copied === userData?.referralCode ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
