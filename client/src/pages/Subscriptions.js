import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, Gift, Pause, Play, X, RefreshCw,
  Check, Star, ChevronRight, Sparkles, ShoppingBag
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const M = '#4A0E2E';
const fmt = v => '₹' + (v || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

const PLAN_INFO = {
  monthly: { label: 'Monthly', freq: 'Every 30 days', disc: 10, color: '#1d4ed8', bg: '#eff6ff' },
  quarterly: { label: 'Quarterly', freq: 'Every 90 days', disc: 15, color: '#16a34a', bg: '#f0fdf4' },
  biannual: { label: 'Biannual', freq: 'Every 180 days', disc: 20, color: M, bg: `${M}10` },
};

const FREEBIE_TIERS = [
  { min: 2000, max: 4999, label: 'Free Mini Sample', icon: '🧴', desc: 'A curated mini product from DermaFlow' },
  { min: 5000, max: 7499, label: 'Free Travel Kit', icon: '👜', desc: '5 travel-size minis of bestsellers' },
  { min: 7500, max: null, label: 'Free Full-Size Product', icon: '✨', desc: 'A surprise full-size product worth ₹800+' },
];

function FreebieBar({ price }) {
  const tier = FREEBIE_TIERS.find(t => price >= t.min && (t.max === null || price <= t.max));
  if (!tier) {
    const next = FREEBIE_TIERS[0];
    const need = next.min - price;
    return (
      <div style={{ background: '#f9fafb', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#6b7280' }}>
        Spend ₹{need.toLocaleString('en-IN')} more per cycle to unlock your first freebie
      </div>
    );
  }
  return (
    <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 22 }}>{tier.icon}</span>
      <div>
        <div style={{ fontWeight: 700, fontSize: 13, color: '#15803d' }}>{tier.label} unlocked!</div>
        <div style={{ fontSize: 11, color: '#6b7280' }}>{tier.desc}</div>
      </div>
    </div>
  );
}

export default function Subscriptions() {
  const { user } = useAuth();
  const [subs, setSubs] = useState([]);
  const [freebies, setFreebies] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newSub, setNewSub] = useState({ productId: '', plan: 'monthly' });
  const [saving, setSaving] = useState(false);
  const [cancelModal, setCancelModal] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const fetch = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [sRes, fRes, pRes] = await Promise.allSettled([
        api.get('/subscriptions/mine'),
        api.get('/subscriptions/freebies'),
        api.get('/products'),
      ]);
      if (sRes.status === 'fulfilled') setSubs(sRes.value.data);
      if (fRes.status === 'fulfilled') setFreebies(fRes.value.data);
      if (pRes.status === 'fulfilled') setProducts((pRes.value.data.products || pRes.value.data).filter(p => p.isActive && p.stockQuantity > 0));
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetch();
  }, [user]);

  const subscribe = async () => {
    if (!newSub.productId) { alert('Please select a product'); return; }
    setSaving(true);
    try {
      await api.post('/subscriptions', newSub);
      setShowAdd(false);
      setNewSub({ productId: '', plan: 'monthly' });
      fetch();
    } catch (e) { alert(e.response?.data?.message || 'Failed to subscribe'); }
    setSaving(false);
  };

  const togglePause = async (id) => {
    try { await api.put(`/subscriptions/${id}/pause`, {}); fetch(); }
    catch (e) { alert('Failed'); }
  };

  const cancel = async () => {
    try {
      await api.put(`/subscriptions/${cancelModal}/cancel`, { reason: cancelReason });
      setCancelModal(null);
      setCancelReason('');
      fetch();
    } catch (e) { alert('Failed'); }
  };

  const iStyle = { width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', fontSize: 13, boxSizing: 'border-box', outline: 'none', background: '#fafafa' };
  const selectedProduct = products.find(p => p._id === newSub.productId);
  const planInfo = PLAN_INFO[newSub.plan];
  const discountedPrice = selectedProduct && planInfo
    ? Math.round(selectedProduct.price * (1 - planInfo.disc / 100))
    : 0;

  if (!user) {
    return (
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '2rem 1rem', textAlign: 'center' }}>
        <Package size={48} className="text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Please login to manage subscriptions</p>
        <Link to="/login" className="inline-block mt-4 bg-maroon text-white px-6 py-2 rounded-lg">Login</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '2rem 1rem', fontFamily: 'system-ui,sans-serif', color: '#1f2937' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: M, margin: 0 }}>Subscriptions</h1>
          <p style={{ color: '#9ca3af', fontSize: 12, marginTop: 4, marginBottom: 0 }}>
            Subscribe to your favourite products — save up to 20% + free gifts with every delivery
          </p>
        </div>
        <button onClick={() => setShowAdd(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: M, color: '#fff', border: 'none', borderRadius: 9, padding: '9px 18px', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
          <Package size={14} /> Subscribe to a Product
        </button>
      </div>

      <div style={{ background: `linear-gradient(135deg,${M},#7B2D3C)`, borderRadius: 16, padding: '18px 22px', marginBottom: 20, color: '#fff' }}>
        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Gift size={18} /> Subscription Freebies — Included with Every Delivery
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
          {freebies.map(f => (
            <div key={f.tier} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 3 }}>{f.label}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>Subscription ≥ ₹{f.min.toLocaleString('en-IN')}/cycle</div>
            </div>
          ))}
        </div>
      </div>

      {showAdd && (
        <div style={{ background: '#fff', border: `1.5px solid ${M}30`, borderRadius: 16, padding: 22, marginBottom: 20 }}>
          <h3 style={{ fontWeight: 800, fontSize: 15, color: M, marginBottom: 16 }}>Choose a Product to Subscribe</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Product *</label>
              <select value={newSub.productId} onChange={e => setNewSub(s => ({ ...s, productId: e.target.value }))} style={iStyle}>
                <option value="">Select a product</option>
                {products.map(p => <option key={p._id} value={p._id}>{p.name} — ₹{p.price.toLocaleString('en-IN')}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Frequency</label>
              <select value={newSub.plan} onChange={e => setNewSub(s => ({ ...s, plan: e.target.value }))} style={iStyle}>
                <option value="monthly">Monthly (10% off)</option>
                <option value="quarterly">Quarterly (15% off)</option>
                <option value="biannual">Biannual (20% off)</option>
              </select>
            </div>
          </div>

          {selectedProduct && (
            <div style={{ background: '#f9fafb', borderRadius: 12, padding: '14px 16px', marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                <span style={{ fontWeight: 600 }}>{selectedProduct.name}</span>
                <div>
                  <span style={{ textDecoration: 'line-through', color: '#9ca3af', marginRight: 6 }}>₹{selectedProduct.price.toLocaleString('en-IN')}</span>
                  <span style={{ fontWeight: 800, color: M }}>₹{discountedPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#16a34a', fontWeight: 600, marginBottom: 6 }}>
                Save {planInfo?.disc}% = ₹{(selectedProduct.price - discountedPrice).toLocaleString('en-IN')} per delivery
              </div>
              <FreebieBar price={discountedPrice} />
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={subscribe} disabled={saving} style={{ background: M, color: '#fff', border: 'none', borderRadius: 8, padding: '9px 20px', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
              {saving ? 'Subscribing...' : 'Confirm Subscription'}
            </button>
            <button onClick={() => setShowAdd(false)} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '9px 16px', cursor: 'pointer', fontSize: 13, color: '#6b7280' }}>Cancel</button>
          </div>
        </div>
      )}

      {cancelModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 400 }}>
            <h3 style={{ fontWeight: 800, fontSize: 16, marginBottom: 8 }}>Cancel Subscription</h3>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>Help us improve — why are you cancelling?</p>
            <select value={cancelReason} onChange={e => setCancelReason(e.target.value)} style={{ ...iStyle, marginBottom: 16 }}>
              <option value="">Select a reason</option>
              <option value="too_expensive">Too expensive</option>
              <option value="not_using">Not using the product enough</option>
              <option value="found_alternative">Found an alternative</option>
              <option value="quality_issue">Quality concern</option>
              <option value="other">Other</option>
            </select>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={cancel} style={{ flex: 1, background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, padding: '9px', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>Confirm Cancel</button>
              <button onClick={() => { setCancelModal(null); setCancelReason(''); }} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '9px 16px', cursor: 'pointer', fontSize: 13 }}>Keep Subscription</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>Loading subscriptions...</div>
      ) : subs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 14, border: '1px solid #f0f0f0', color: '#9ca3af' }}>
          <Package size={36} color="#e5e7eb" style={{ margin: '0 auto 12px', display: 'block' }} />
          <p style={{ fontSize: 14, marginBottom: 16 }}>No active subscriptions yet</p>
          <p style={{ fontSize: 12, marginBottom: 20 }}>Subscribe to your favourite products and save up to 20% on every delivery</p>
          <Link to="/products" style={{ background: M, color: '#fff', padding: '9px 20px', borderRadius: 9, textDecoration: 'none', fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 7 }}>
            <ShoppingBag size={14} /> Explore Products
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {subs.map(sub => {
            const pi = PLAN_INFO[sub.plan] || PLAN_INFO.monthly;
            const isCancelled = sub.status === 'cancelled';
            const isPaused = sub.status === 'paused';
            return (
              <div key={sub._id} style={{ background: '#fff', border: `1.5px solid ${isCancelled ? '#f3f4f6' : isPaused ? '#fde68a' : '#f0f0f0'}`, borderRadius: 16, padding: '18px 22px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', opacity: isCancelled ? 0.7 : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span style={{ fontWeight: 800, fontSize: 15, color: '#1f2937' }}>{sub.productName}</span>
                      <span style={{ background: isCancelled ? '#f3f4f6' : isPaused ? '#fef3c7' : '#f0fdf4', color: isCancelled ? '#9ca3af' : isPaused ? '#d97706' : '#15803d', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999 }}>
                        {sub.status.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
                      <span style={{ background: pi.bg, color: pi.color, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, marginRight: 8 }}>{pi.label}</span>
                      {pi.freq} · {sub.discountPercent}% off
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
                      <div>
                        <span style={{ textDecoration: 'line-through', color: '#9ca3af', marginRight: 5 }}>₹{(sub.originalPrice || 0).toLocaleString('en-IN')}</span>
                        <span style={{ fontWeight: 800, color: M }}>₹{(sub.pricePerCycle || 0).toLocaleString('en-IN')}</span>
                        <span style={{ color: '#9ca3af', fontSize: 11 }}>/delivery</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    {sub.nextDeliveryDate && !isCancelled && (
                      <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 10 }}>
                        Next delivery: <strong style={{ color: '#1f2937' }}>{new Date(sub.nextDeliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                      </div>
                    )}
                    {!isCancelled && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => togglePause(sub._id)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: '#374151' }}>
                          {isPaused ? <><Play size={11} /> Resume</> : <><Pause size={11} /> Pause</>}
                        </button>
                        <button onClick={() => setCancelModal(sub._id)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#fef2f2', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: '#dc2626' }}>
                          <X size={11} /> Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {sub.freebieLabel && !isCancelled && (
                  <div style={{ marginTop: 12, background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 9, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                    <Gift size={14} color="#16a34a" />
                    <span style={{ fontWeight: 600, color: '#15803d' }}>{sub.freebieLabel} included with delivery</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}