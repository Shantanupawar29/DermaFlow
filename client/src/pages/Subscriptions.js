import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, Pause, Play, X, Check, Star, ChevronRight, Sparkles, 
  ShoppingBag, RefreshCw, Gift, Droplet, Briefcase, Gem, 
  AlertCircle, Truck, Calendar, Tag, Percent, Shield, Clock,
  Box, Zap, Heart, Smile, Award, ArrowLeft 
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';




const M = '#4A0E2E';
const fmt = v => '₹' + (v || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

const PLAN_INFO = {
  monthly:   { label: 'Monthly',   freq: 'Every 30 days',  disc: 10, color: '#1d4ed8', bg: '#eff6ff', icon: Calendar },
  quarterly: { label: 'Quarterly', freq: 'Every 90 days',  disc: 15, color: '#16a34a', bg: '#f0fdf4', icon: RefreshCw },
  biannual:  { label: 'Biannual',  freq: 'Every 180 days', disc: 20, color: M,          bg: `${M}18`,  icon: Clock },
};

const FREEBIE_TIERS = [
  { min: 5000,  max: 7499, label: 'Free Mini Sample',       icon: Droplet, color: '#8b5cf6' },
  { min: 7500,  max: 9999, label: 'Free Travel Kit',        icon: Briefcase, color: '#ec4899' },
  { min: 10000, max: null, label: 'Free Full-Size Product', icon: Gem, color: '#f59e0b' },
];

function FreebieBar({ price }) {
  const tier = FREEBIE_TIERS.find(t => price >= t.min && (t.max === null || price <= t.max));
  const next = FREEBIE_TIERS.find(t => price < t.min);
  const TierIcon = tier?.icon;
  const NextIcon = next?.icon;
  
  if (!tier && !next) return null;
  if (!tier) {
    return (
      <div style={{ background: '#f9fafb', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#6b7280', marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Award size={14} color="#f59e0b" />
        <span>Spend {fmt(next.min - price)} more per cycle → unlock <strong>{NextIcon && <NextIcon size={12} style={{ display: 'inline', marginRight: 4 }} />} {next.label}</strong></span>
      </div>
    );
  }
  return (
    <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
      <TierIcon size={18} color={tier.color} />
      <div>
        <div style={{ fontWeight: 700, fontSize: 12, color: '#15803d' }}>{tier.label} unlocked!</div>
        <div style={{ fontSize: 11, color: '#6b7280' }}>Included with your next delivery</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    active:    { bg: '#f0fdf4', color: '#16a34a', label: 'Active', icon: Check },
    paused:    { bg: '#fff7ed', color: '#d97706', label: 'Paused', icon: Pause },
    cancelled: { bg: '#fef2f2', color: '#dc2626', label: 'Cancelled', icon: X },
  };
  const s = map[status] || map.active;
  const Icon = s.icon;
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <Icon size={11} />
      {s.label}
    </span>
  );
}

export default function Subscriptions() {
  const { user } = useAuth();
  const [subs, setSubs]           = useState([]);
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState('mine'); // 'mine' | 'browse'
  const [actionLoading, setActionLoading] = useState('');
  const [selectedPlan, setSelectedPlan]   = useState({});
  const [subscribing, setSubscribing]     = useState('');

  const fetchSubs = async () => {
    try {
      const { data } = await api.get('/subscriptions/mine');
      setSubs(data);
    } catch (e) { console.error(e); }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products?limit=20');
      setProducts(data.products || data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (user) {
      Promise.all([fetchSubs(), fetchProducts()]).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const handlePause = async (subId) => {
    setActionLoading(subId);
    try {
      await api.put(`/subscriptions/${subId}/pause`);
      await fetchSubs();
    } catch (e) { alert('Failed to update subscription'); }
    setActionLoading('');
  };

  const handleCancel = async (subId) => {
    if (!window.confirm('Cancel this subscription?')) return;
    setActionLoading(subId);
    try {
      await api.put(`/subscriptions/${subId}/cancel`, { reason: 'User cancelled' });
      await fetchSubs();
    } catch (e) { alert('Failed to cancel'); }
    setActionLoading('');
  };

  const handleSubscribe = async (productId) => {
    const plan = selectedPlan[productId] || 'monthly';
    setSubscribing(productId);
    try {
      await api.post('/subscriptions', { productId, plan });
      await fetchSubs();
      setTab('mine');
      alert(`Subscribed successfully on ${PLAN_INFO[plan].label} plan!`);
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to subscribe');
    }
    setSubscribing('');
  };

  const activeSubs    = subs.filter(s => s.status === 'active');
  const pausedSubs    = subs.filter(s => s.status === 'paused');
  const cancelledSubs = subs.filter(s => s.status === 'cancelled');

  const tabStyle = (t) => ({
    padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
    fontWeight: 600, fontSize: 13,
    background: tab === t ? M : '#f3f4f6',
    color: tab === t ? '#fff' : '#374151',
    transition: 'all 0.15s',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  });

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <Package size={48} color="#d1d5db" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontWeight: 700, color: '#1f2937', marginBottom: 8 }}>Login to manage subscriptions</h2>
        <Link to="/login" style={{ background: M, color: '#fff', padding: '10px 24px', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>Login</Link>
      </div>
    );
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 80, color: '#9ca3af' }}>Loading…</div>;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px', fontFamily: 'system-ui,sans-serif' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: M, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Package size={28} /> Subscribe & Save
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280' }}>Set up recurring deliveries and save up to 20% on every order.</p>
      </div>
{/* // In the return statement, right after the header */}
<div style={{ marginBottom: 24 }}>
  <Link 
    to="/dashboard" 
    style={{ 
      display: 'inline-flex', 
      alignItems: 'center', 
      gap: 8, 
      color: M, 
      textDecoration: 'none',
      fontSize: 14,
      fontWeight: 500,
      padding: '8px 0',
      borderBottom: `1px solid ${M}20`,
    }}
  >
    <ArrowLeft size={18} />
    Back to Dashboard
  </Link>
</div>
      {/* Plan benefits */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 28 }}>
        {Object.entries(PLAN_INFO).map(([key, p]) => {
          const Icon = p.icon;
          return (
            <div key={key} style={{ background: p.bg, borderRadius: 14, padding: '16px 18px', border: `1px solid ${p.color}20` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Icon size={20} color={p.color} />
                <div style={{ fontWeight: 700, color: p.color, fontSize: 14 }}>{p.label}</div>
              </div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3 }}>{p.freq}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: p.color, marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Percent size={16} /> {p.disc}% off
              </div>
            </div>
          );
        })}
      </div>

      {/* Freebie info */}
      <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 12, padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        <Gift size={20} color="#d97706" />
        <div style={{ fontSize: 13, color: '#92400e', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <strong>Freebies:</strong>
          {FREEBIE_TIERS.map((tier, idx) => {
            const TierIcon = tier.icon;
            return (
              <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <TierIcon size={14} color={tier.color} />
                <span>₹{tier.min.toLocaleString()}+ → {tier.label}</span>
                {idx < FREEBIE_TIERS.length - 1 && <span style={{ color: '#d97706' }}>|</span>}
              </span>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <button style={tabStyle('mine')} onClick={() => setTab('mine')}>
          <Package size={14} />
          My Subscriptions {subs.length > 0 && `(${subs.length})`}
        </button>
        <button style={tabStyle('browse')} onClick={() => setTab('browse')}>
          <ShoppingBag size={14} />
          Browse Products
        </button>
      </div>

      {/* ── MY SUBSCRIPTIONS ────────────────────────────────────────────── */}
      {tab === 'mine' && (
        <div>
          {subs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, background: '#f9fafb', borderRadius: 16 }}>
              <Package size={48} color="#d1d5db" style={{ margin: '0 auto 16px' }} />
              <p style={{ color: '#9ca3af', marginBottom: 16 }}>No active subscriptions yet</p>
              <button onClick={() => setTab('browse')} style={{ background: M, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <ShoppingBag size={14} /> Browse Products →
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {subs.map(sub => {
                const plan = PLAN_INFO[sub.plan] || PLAN_INFO.monthly;
                const PlanIcon = plan.icon;
                const discPrice = sub.pricePerCycle || Math.round((sub.product?.price || 0) * (1 - (sub.discountPct || 10) / 100));
                const origPrice = sub.originalPrice || sub.product?.price || 0;

                return (
                  <div key={sub._id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden' }}>
                    {/* Top bar */}
                    <div style={{ background: sub.status === 'active' ? `${M}08` : '#f9fafb', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <StatusBadge status={sub.status} />
                        <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 8, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <PlanIcon size={12} />
                          {plan.label} · {plan.disc}% off
                        </span>
                      </div>
                      <span style={{ fontSize: 11, color: '#9ca3af', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Truck size={11} />
                        {sub.deliveryCount || 0} deliveries
                      </span>
                    </div>

                    <div style={{ padding: '18px 20px' }}>
                      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                        {/* Product image */}
                        <div style={{ width: 64, height: 64, background: '#f5f0eb', borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
                          <img
                            src={sub.productImage || sub.product?.images?.[0] || '/api/placeholder/64/64'}
                            alt={sub.productName}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: 700, fontSize: 15, color: '#1f2937', marginBottom: 4 }}>
                            {sub.productName || sub.product?.name}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                            <span style={{ fontSize: 18, fontWeight: 800, color: M }}>{fmt(discPrice)}</span>
                            <span style={{ fontSize: 12, color: '#9ca3af', textDecoration: 'line-through' }}>{fmt(origPrice)}</span>
                            <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 600 }}>per cycle</span>
                          </div>
                          {sub.nextDelivery && (
                            <p style={{ fontSize: 12, color: '#6b7280', marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <Calendar size={12} />
                              Next delivery: <strong>{new Date(sub.nextDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                            </p>
                          )}
                          <FreebieBar price={discPrice} />
                        </div>
                      </div>

                      {/* Actions */}
                      {sub.status !== 'cancelled' && (
                        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                          <button
                            onClick={() => handlePause(sub._id)}
                            disabled={actionLoading === sub._id}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 6,
                              background: sub.status === 'paused' ? '#f0fdf4' : '#fff7ed',
                              color: sub.status === 'paused' ? '#16a34a' : '#d97706',
                              border: `1px solid ${sub.status === 'paused' ? '#86efac' : '#fed7aa'}`,
                              borderRadius: 8, padding: '7px 14px', cursor: 'pointer',
                              fontSize: 12, fontWeight: 600,
                            }}
                          >
                            {sub.status === 'paused' ? <><Play size={13} /> Resume</> : <><Pause size={13} /> Pause</>}
                          </button>
                          <button
                            onClick={() => handleCancel(sub._id)}
                            disabled={actionLoading === sub._id}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 6,
                              background: '#fef2f2', color: '#dc2626',
                              border: '1px solid #fca5a5',
                              borderRadius: 8, padding: '7px 14px', cursor: 'pointer',
                              fontSize: 12, fontWeight: 600,
                            }}
                          >
                            <X size={13} /> Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── BROWSE PRODUCTS ─────────────────────────────────────────────── */}
      {tab === 'browse' && (
        <div>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={14} />
            Choose a product and a plan to start saving on every delivery.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {products.map(product => {
              const plan = selectedPlan[product._id] || 'monthly';
              const planInfo = PLAN_INFO[plan];
              const discPrice = Math.round(product.price * (1 - planInfo.disc / 100));
              const alreadySubscribed = subs.some(s => (s.product?._id || s.product) === product._id && s.status === 'active');
              const PlanIcon = planInfo.icon;

              return (
                <div key={product._id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden' }}>
                  <div style={{ height: 140, background: '#f5f0eb', overflow: 'hidden' }}>
                    <img src={product.images?.[0] || '/api/placeholder/260/140'} alt={product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: '14px 16px' }}>
                    <p style={{ fontWeight: 700, fontSize: 13, color: '#1f2937', marginBottom: 4, lineHeight: 1.4 }}>{product.name}</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 10 }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: M }}>{fmt(discPrice)}</span>
                      <span style={{ fontSize: 11, textDecoration: 'line-through', color: '#9ca3af' }}>{fmt(product.price)}</span>
                      <span style={{ fontSize: 10, color: '#16a34a', fontWeight: 600 }}>-{planInfo.disc}%</span>
                    </div>

                    {/* Plan selector */}
                    <div style={{ position: 'relative', marginBottom: 10 }}>
                      <select
                        value={plan}
                        onChange={e => setSelectedPlan(prev => ({ ...prev, [product._id]: e.target.value }))}
                        style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 10px', fontSize: 12, outline: 'none', appearance: 'none', background: '#fff' }}
                        disabled={alreadySubscribed}
                      >
                        {Object.entries(PLAN_INFO).map(([key, p]) => (
                          <option key={key} value={key}>{p.label} — {p.disc}% off ({p.freq})</option>
                        ))}
                      </select>
                      <ChevronRight size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%) rotate(90deg)', pointerEvents: 'none', color: '#9ca3af' }} />
                    </div>

                    {alreadySubscribed ? (
                      <div style={{ textAlign: 'center', padding: '8px', background: '#f0fdf4', borderRadius: 8, fontSize: 12, color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <Check size={14} /> Already subscribed
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSubscribe(product._id)}
                        disabled={subscribing === product._id || product.stockQuantity < 1}
                        style={{
                          width: '100%', background: product.stockQuantity < 1 ? '#d1d5db' : M,
                          color: '#fff', border: 'none', borderRadius: 8, padding: '9px',
                          fontWeight: 700, fontSize: 13, cursor: product.stockQuantity < 1 ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        }}
                      >
                        {subscribing === product._id ? (
                          <><RefreshCw size={14} className="animate-spin" /> Subscribing…</>
                        ) : product.stockQuantity < 1 ? (
                          <><Package size={14} /> Out of Stock</>
                        ) : (
                          <><Gift size={14} /> Subscribe & Save {planInfo.disc}%</>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}