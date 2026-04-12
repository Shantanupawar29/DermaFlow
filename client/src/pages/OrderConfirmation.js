import React, { useEffect, useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle, Package, Printer, Star, Gift, ChevronRight, Sparkles } from 'lucide-react';
import axios from 'axios';

const API = 'http://localhost:5000/api';
const M   = '#4A0E2E';
const tok = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

const SCRATCH_PRIZES = [
  { label: '₹50 off next order', type: 'own',       discount: 50, flat: true,  prob: 20 },
  { label: '10% off next order', type: 'own',       discount: 10,              prob: 25 },
  { label: '25 Glow Points',     type: 'points',    pts: 25,                   prob: 20 },
  { label: '15% off on Nykaa',   type: 'affiliate', partner: 'Nykaa', discount: 15, minOrder: 499, prob: 15 },
  { label: 'Free Shipping',      type: 'shipping',                             prob: 12 },
  { label: '50 Glow Points',     type: 'points',    pts: 50,                   prob: 8  },
];

const weighted = (items) => {
  const total = items.reduce((s, i) => s + (i.prob || 1), 0);
  let r = Math.random() * total;
  for (const item of items) { r -= item.prob || 1; if (r <= 0) return item; }
  return items[0];
};

// ── SCRATCH CARD ──────────────────────────────────────────────────────────────
function ScratchCardReveal({ prize, onScratched }) {
  const canvasRef  = useRef(null);
  const drawing    = useRef(false);
  const revealed   = useRef(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const grd = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grd.addColorStop(0, '#c8a060');
    grd.addColorStop(1, '#a06820');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Texture
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    for (let i = 0; i < 60; i++) {
      ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2 + Math.random() * 30, 1);
    }
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 15px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('✦  SCRATCH TO REVEAL  ✦', canvas.width / 2, canvas.height / 2 - 8);
    ctx.font = '11px system-ui'; ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText('Your order reward is hidden here', canvas.width / 2, canvas.height / 2 + 12);
  }, []);

  const pos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const src  = e.touches ? e.touches[0] : e;
    return { x: (src.clientX - rect.left) * (canvas.width / rect.width), y: (src.clientY - rect.top) * (canvas.height / rect.height) };
  };

  const scratch = (e) => {
    if (done || !drawing.current) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = pos(e, canvas);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath(); ctx.arc(x, y, 26, 0, 2 * Math.PI); ctx.fill();
    const d = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let t = 0;
    for (let i = 3; i < d.length; i += 4) if (d[i] === 0) t++;
    revealed.current = (t / (d.length / 4)) * 100;
    if (revealed.current > 55) { setDone(true); onScratched && onScratched(); }
  };

  if (done) return null;

  return (
    <canvas ref={canvasRef} width={320} height={130}
      style={{ borderRadius: 12, cursor: 'crosshair', display: 'block', touchAction: 'none', boxShadow: '0 6px 20px rgba(0,0,0,0.2)' }}
      onMouseDown={() => drawing.current = true}
      onMouseUp={()   => drawing.current = false}
      onMouseMove={scratch}
      onTouchStart={(e) => { drawing.current = true; scratch(e); }}
      onTouchEnd={()   => drawing.current = false}
      onTouchMove={scratch}
    />
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [prize, setPrize]       = useState(null);
  const [prizeRevealed, setRevealed] = useState(false);
  const [savingPrize, setSaving]  = useState(false);
  const [voucherCode, setVoucherCode] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const r = await axios.get(`${API}/orders/${id}`, tok());
        setOrder(r.data);
        setPrize(weighted(SCRATCH_PRIZES));
      } catch(e) { console.error(e); }
      setLoading(false);
    };
    fetch();
  }, [id]);

  const onScratched = async () => {
    setRevealed(true);
    if (!prize || prize.type === 'none') return;
    setSaving(true);
    try {
      const r = await axios.post(`${API}/auth/scratch`, { prize, orderId: id }, tok());
      if (r.data.voucherCode) setVoucherCode(r.data.voucherCode);
    } catch(e) { console.error(e); }
    setSaving(false);
  };

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center', color: '#9ca3af', fontFamily: 'system-ui,sans-serif' }}>Loading your order...</div>;
  if (!order)  return (
    <div style={{ textAlign: 'center', padding: '4rem', fontFamily: 'system-ui,sans-serif' }}>
      <Package size={48} color="#e5e7eb" style={{ margin: '0 auto 12px', display: 'block' }}/>
      <h2 style={{ fontWeight: 700, color: '#1f2937' }}>Order not found</h2>
      <Link to="/products" style={{ color: M }}>Back to Products</Link>
    </div>
  );

  const fmt = v => '₹' + (v || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '3rem 1rem', fontFamily: 'system-ui,sans-serif' }}>

      {/* Success header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 80, height: 80, background: '#f0fdf4', borderRadius: '50%', marginBottom: 16 }}>
          <CheckCircle size={40} color="#16a34a"/>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#1f2937', margin: '0 0 6px', letterSpacing: '-0.5px' }}>Order Confirmed!</h1>
        <p style={{ color: '#9ca3af', fontSize: 14, margin: 0 }}>
          Thank you for your order · #{order.orderNumber}
        </p>
      </div>

      {/* ── SCRATCH CARD ── */}
      <div style={{ background: '#fff', border: '2px dashed #f0f0f0', borderRadius: 20, padding: '28px 24px', marginBottom: 24, textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 6 }}>
          <Gift size={18} color={M}/>
          <h2 style={{ fontWeight: 800, fontSize: 16, color: '#1f2937', margin: 0 }}>Your Order Reward</h2>
        </div>
        <p style={{ color: '#9ca3af', fontSize: 12, marginBottom: 20 }}>Scratch below to reveal your exclusive prize for this order</p>

        {/* Prize revealed underneath scratch layer */}
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: prizeRevealed ? 0 : 8 }}>
          {/* Prize card (always rendered, shown when scratch layer is gone) */}
          <div style={{ width: 320, height: 130, background: `linear-gradient(135deg, ${M}, #7B2D3C)`, borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Sparkles size={20} color="rgba(255,255,255,0.7)" style={{ marginBottom: 6 }}/>
            <div style={{ fontWeight: 900, fontSize: 22, letterSpacing: '-0.3px' }}>{prize?.label}</div>
            {prize?.type === 'affiliate' && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>on {prize.partner} · min ₹{prize.minOrder}</div>}
            {voucherCode && <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 800, letterSpacing: '0.12em', marginTop: 6, background: 'rgba(255,255,255,0.15)', padding: '3px 12px', borderRadius: 6 }}>{voucherCode}</div>}
          </div>
          {/* Scratch overlay */}
          {!prizeRevealed && (
            <div style={{ position: 'absolute', top: 0, left: 0 }}>
              <ScratchCardReveal prize={prize} onScratched={onScratched}/>
            </div>
          )}
        </div>

        {prizeRevealed && (
          <div style={{ marginTop: 14, fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
            {prize?.type === 'points'   && `${prize.pts} Glow Points added to your account!`}
            {prize?.type === 'own'      && voucherCode && `Your voucher code: `}
            {prize?.type === 'own'      && voucherCode && <strong style={{ fontFamily: 'monospace', color: M }}>{voucherCode}</strong>}
            {prize?.type === 'affiliate' && `Use on ${prize.partner} app — valid for 7 days`}
            {prize?.type === 'shipping' && 'Applied to your next order automatically'}
          </div>
        )}
        {!prizeRevealed && <p style={{ fontSize: 11, color: '#d1d5db', marginTop: 6 }}>Use your mouse or finger to scratch</p>}
      </div>

      {/* Order details */}
      <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 16, padding: '22px', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Order Info</div>
            <div style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.8 }}>
              <div><strong>Order:</strong> {order.orderNumber}</div>
              <div><strong>Invoice:</strong> {order.invoiceNumber}</div>
              <div><strong>Date:</strong> {new Date(order.orderDate || order.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}</div>
              <div><strong>Payment:</strong> {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</div>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Shipping To</div>
            <div style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.8 }}>
              {order.shippingAddress?.street && <div>{order.shippingAddress.street}</div>}
              {order.shippingAddress?.city && <div>{order.shippingAddress.city}, {order.shippingAddress.state}</div>}
              {order.shippingAddress?.zipCode && <div>{order.shippingAddress.zipCode}</div>}
              {order.phone && <div>{order.phone}</div>}
            </div>
          </div>
        </div>

        {/* Items */}
        <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 16 }}>
          {(order.items || []).map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f9fafb', fontSize: 13 }}>
              <div>
                <span style={{ fontWeight: 600, color: '#1f2937' }}>{item.name}</span>
                <span style={{ color: '#9ca3af', marginLeft: 8 }}>×{item.quantity}</span>
              </div>
              <span style={{ fontWeight: 700, color: M }}>{fmt(item.price * item.quantity)}</span>
            </div>
          ))}
          <div style={{ paddingTop: 12 }}>
            {[
              { label: 'Subtotal', value: fmt(order.totalAmount) },
              { label: 'Tax (18% GST)', value: fmt(order.taxAmount) },
              { label: 'Shipping', value: order.shippingAmount === 0 ? 'Free' : fmt(order.shippingAmount) },
              { label: 'Discount', value: order.discountAmount > 0 ? `–${fmt(order.discountAmount)}` : '—' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
                <span>{label}</span><span>{value}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 16, color: M, paddingTop: 10, borderTop: '1px solid #f0f0f0', marginTop: 6 }}>
              <span>Grand Total</span><span>{fmt(order.grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Glow points earned */}
      {order.glowPointsEarned > 0 && (
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 12, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
          <Star size={16} color="#16a34a" fill="#16a34a"/>
          <span style={{ fontWeight: 600, color: '#15803d' }}>+{order.glowPointsEarned} Glow Points earned on this order!</span>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link to="/dashboard" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: M, color: '#fff', borderRadius: 10, padding: '12px', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
          <Package size={16}/> Track Order
        </Link>
        <Link to="/products" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#fff', color: M, border: `1.5px solid ${M}`, borderRadius: 10, padding: '12px', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
          Continue Shopping <ChevronRight size={16}/>
        </Link>
        <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f3f4f6', color: '#6b7280', border: 'none', borderRadius: 10, padding: '12px 16px', cursor: 'pointer', fontSize: 13 }}>
          <Printer size={15}/> Print
        </button>
      </div>

      <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 20 }}>
        A confirmation email has been sent · Questions? <a href="/help" style={{ color: M }}>Contact us</a>
      </p>
    </div>
  );
}
