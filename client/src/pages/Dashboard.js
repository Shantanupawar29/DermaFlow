// client/src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sun, Moon, Sparkles, Recycle, Gift, Star, Trophy,
  ShoppingBag, Package, Wallet, Box, Ticket,
  LogOut, Check, ChevronRight, Award, Calendar,
  Heart, Shield, ArrowRight, Clock, Zap, Copy
} from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
const M = '#4A0E2E';

const TIER = {
  bronze:   { color: '#d97706', bg: '#fef3c7', bar: '#f59e0b', label: 'Bronze', min: 0,    max: 500 },
  silver:   { color: '#64748b', bg: '#f1f5f9', bar: '#94a3b8', label: 'Silver', min: 500,  max: 1000 },
  gold:     { color: '#b45309', bg: '#fefce8', bar: '#eab308', label: 'Gold',   min: 1000, max: 2000 },
  platinum: { color: '#7c3aed', bg: '#ede9fe', bar: '#8b5cf6', label: 'Platinum', min: 2000, max: 2000 },
};

const ORDER_STATUS = {
  pending:    { bg: '#fefce8', color: '#d97706', label: 'Pending' },
  processing: { bg: '#eff6ff', color: '#1d4ed8', label: 'Processing' },
  confirmed:  { bg: '#f0fdf4', color: '#16a34a', label: 'Confirmed' },
  shipped:    { bg: '#f0fdfa', color: '#0d9488', label: 'Shipped' },
  delivered:  { bg: '#dcfce7', color: '#15803d', label: 'Delivered' },
  cancelled:  { bg: '#fef2f2', color: '#dc2626', label: 'Cancelled' },
};

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', flex: 1, minWidth: 130 }}>
      <div style={{ background: color ? `${color}15` : '#f3f4f6', borderRadius: 9, padding: 8, display: 'inline-flex', marginBottom: 10 }}>
        <Icon size={16} color={color || '#6b7280'} />
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: color || '#1f2937', lineHeight: 1.1, marginBottom: 3 }}>{value}</div>
      <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>{label}</div>
    </div>
  );
}

function Tab({ label, active, onClick, icon: Icon }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 5,
      padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
      fontSize: 12, fontWeight: 600, transition: 'all 0.15s',
      background: active ? M : 'transparent',
      color: active ? '#fff' : '#6b7280',
    }}>
      {Icon && <Icon size={13} />}{label}
    </button>
  );
}

function RewardCard({ points, label, description, icon: Icon, currentPoints }) {
  const earned = currentPoints >= points;
  const progress = Math.min((currentPoints / Math.max(points, 1)) * 100, 100);
  return (
    <div style={{
      background: earned ? '#f0fdf4' : '#fff',
      border: earned ? '1.5px solid #86efac' : '1px solid #f0f0f0',
      borderRadius: 14, padding: '18px', position: 'relative',
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
    }}>
      {earned && (
        <div style={{ position: 'absolute', top: 10, right: 10, background: '#16a34a', color: '#fff', borderRadius: 999, padding: '2px 8px', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
          <Check size={9} /> Earned
        </div>
      )}
      <div style={{ color: earned ? '#16a34a' : M, marginBottom: 8 }}><Icon size={22} /></div>
      <div style={{ fontWeight: 700, color: '#1f2937', marginBottom: 3, fontSize: 13 }}>{label}</div>
      <div style={{ fontSize: 11, color: '#6b7280', marginBottom: earned ? 0 : 10 }}>{description}</div>
      {!earned && (
        <>
          <div style={{ background: '#e5e7eb', borderRadius: 999, height: 5, overflow: 'hidden', marginBottom: 4 }}>
            <div style={{ height: 5, background: M, width: `${progress}%`, borderRadius: 999, transition: 'width 0.8s ease' }} />
          </div>
          <div style={{ fontSize: 10, color: '#9ca3af' }}>{currentPoints} / {points} pts</div>
        </>
      )}
    </div>
  );
}

function VoucherCard({ voucher }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(voucher.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div style={{ background: `linear-gradient(135deg, ${M}, #7B2D3C)`, borderRadius: 16, padding: '20px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
      <Gift size={24} color="rgba(255,255,255,0.85)" style={{ marginBottom: 10 }} />
      <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1.1, marginBottom: 3 }}>{voucher.discount}% OFF</div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 14 }}>Min spend ₹999</div>
      <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 8, padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 14, letterSpacing: '0.1em' }}>{voucher.code}</span>
        <button onClick={copy} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: 5, padding: '3px 8px', cursor: 'pointer', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
          {copied ? <><Check size={10} /> Copied</> : <><Copy size={10} /> Copy</>}
        </button>
      </div>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>Expires: {new Date(voucher.expiresAt).toLocaleDateString('en-IN')}</div>
    </div>
  );
}

export default function Dashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const [userData, setUserData] = useState(null);
  const [orders, setOrders]     = useState([]);
  const [routine, setRoutine]   = useState({ amRoutine: [], pmRoutine: [] });
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState('overview');

  useEffect(() => {
    if (user) { fetchData(); fetchRoutine(); }
  }, [user]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const h = { headers: { Authorization: `Bearer ${token}` } };
      const [uRes, oRes] = await Promise.all([
        axios.get(`${API_URL}/auth/me`, h),
        axios.get(`${API_URL}/orders/my-orders`, h),
      ]);
      setUserData(uRes.data);
      setOrders(oRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchRoutine = async () => {
    try {
      const token = localStorage.getItem('token');
      const r = await axios.get(`${API_URL}/quiz/routine`, { headers: { Authorization: `Bearer ${token}` } });
      setRoutine(r.data);
    } catch (e) { /* quiz not completed yet */ }
  };

  if (!isAuthenticated || !user) return <Navigate to="/login" />;

  const cu = userData || user;
  const points = cu.glowPoints || 0;
  const totalSpent = orders.reduce((s, o) => s + (o.grandTotal || o.totalAmount || 0), 0);

  const tierKey = points >= 2000 ? 'platinum' : points >= 1000 ? 'gold' : points >= 500 ? 'silver' : 'bronze';
  const tier = TIER[tierKey];
  const nextTier = { bronze: TIER.silver, silver: TIER.gold, gold: TIER.platinum, platinum: null }[tierKey];
  const progressPct = nextTier ? Math.min(((points - tier.min) / (nextTier.min - tier.min)) * 100, 100) : 100;

  const activeVouchers = (cu.vouchers || []).filter(v => !v.isUsed && new Date(v.expiresAt) > new Date());

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: '#9ca3af', fontSize: 14 }}>
      Loading dashboard...
    </div>
  );

  const TABS = [
    { k: 'overview', l: 'Overview', I: Zap },
    { k: 'routine',  l: 'My Routine', I: Sun },
    { k: 'orders',   l: 'Orders', I: Package },
    { k: 'rewards',  l: 'Rewards', I: Award },
    { k: 'vouchers', l: 'Vouchers', I: Ticket },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1rem', fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: `linear-gradient(135deg, ${M}, #7B2D3C)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 18 }}>
            {cu.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#1f2937', margin: 0 }}>
              Hello, {cu.name?.split(' ')[0]}!
            </h1>
            <p style={{ color: '#9ca3af', fontSize: 11, margin: 0 }}>{cu.email}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/products" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: M, color: '#fff', borderRadius: 9, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
            <ShoppingBag size={14} /> Shop
          </Link>
          <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: 9, background: '#fff', color: '#6b7280', cursor: 'pointer', fontSize: 13 }}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        <StatCard icon={Star}    label="Glow Points"  value={points}                      color={M} />
        <StatCard icon={Package} label="Orders"       value={orders.length}               color="#1d4ed8" />
        <StatCard icon={Wallet}  label="Total Spent"  value={`₹${Math.round(totalSpent).toLocaleString('en-IN')}`} color="#047857" />
        <StatCard icon={Award}   label="Loyalty Tier" value={tier.label}                  color={tier.color} />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#f3f4f6', borderRadius: 10, padding: 4, width: 'fit-content', marginBottom: 20, flexWrap: 'wrap' }}>
        {TABS.map(({ k, l, I }) => (
          <Tab key={k} label={l} active={tab === k} onClick={() => setTab(k)} icon={I} />
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Loyalty card */}
          <div style={{ background: tier.bg, border: `1.5px solid ${tier.color}30`, borderRadius: 16, padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, color: tier.color, fontSize: 13, marginBottom: 3 }}>
                  <Trophy size={15} /> {tier.label.toUpperCase()} MEMBER
                </div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>
                  {nextTier ? `${nextTier.min - points} pts to ${nextTier.label}` : "Top tier — maximum rewards unlocked!"}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: tier.color, lineHeight: 1 }}>{points}</div>
                <div style={{ fontSize: 10, color: '#9ca3af' }}>Glow Points</div>
              </div>
            </div>
            <div style={{ background: '#e5e7eb', borderRadius: 999, height: 8, overflow: 'hidden', marginBottom: 6 }}>
              <div style={{ height: 8, background: tier.bar, width: `${progressPct}%`, borderRadius: 999, transition: 'width 0.8s ease' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#9ca3af' }}>
              <span>₹{Math.round(totalSpent).toLocaleString('en-IN')} spent</span>
              <span>500 pts = ₹50 off</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            {/* Quick actions */}
            <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, padding: '18px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12, color: '#1f2937', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Zap size={14} color={M} /> Quick Actions
              </div>
              {[
                { to: '/products', label: 'Browse Products', icon: ShoppingBag },
                { to: '/quiz',     label: 'Take Skin Quiz',  icon: Sparkles },
              ].map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f9fafb', borderRadius: 8, padding: '9px 12px', textDecoration: 'none', color: '#374151', fontSize: 13, fontWeight: 500, marginBottom: 6, border: '1px solid #f3f4f6', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon size={14} color={M} /> {label}
                  </div>
                  <ArrowRight size={12} color="#d1d5db" />
                </Link>
              ))}
            </div>

            {/* Latest order */}
            {orders.length > 0 && (
              <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, padding: '18px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12, color: '#1f2937', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Package size={14} color={M} /> Latest Order
                </div>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                  #{orders[0].orderNumber || orders[0]._id.slice(-8).toUpperCase()}
                </div>
                <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 8 }}>
                  {orders[0].items?.map(i => i.name).slice(0, 2).join(', ')}{orders[0].items?.length > 2 ? ` +${orders[0].items.length - 2} more` : ''}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 800, color: M, fontSize: 15 }}>₹{(orders[0].grandTotal || orders[0].totalAmount || 0).toLocaleString('en-IN')}</div>
                  <span style={{
                    background: (ORDER_STATUS[orders[0].status] || ORDER_STATUS.pending).bg,
                    color: (ORDER_STATUS[orders[0].status] || ORDER_STATUS.pending).color,
                    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999
                  }}>
                    {(ORDER_STATUS[orders[0].status] || ORDER_STATUS.pending).label.toUpperCase()}
                  </span>
                </div>
                <button onClick={() => setTab('orders')} style={{ marginTop: 10, fontSize: 11, color: M, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                  View all orders <ChevronRight size={11} />
                </button>
              </div>
            )}

            {/* Points perks */}
            <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, padding: '18px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12, color: '#1f2937', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Heart size={14} color={M} /> Earn More Points
              </div>
              {[
                { label: 'Place an order', pts: '+10 pts/₹100' },
                { label: 'Write a review', pts: '+25 pts' },
                { label: 'Refer a friend', pts: '+200 pts' },
                { label: 'Recycle bottle', pts: '+50 pts' },
              ].map(({ label, pts }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f9fafb', fontSize: 12 }}>
                  <span style={{ color: '#4b5563' }}>{label}</span>
                  <span style={{ fontWeight: 700, color: M }}>{pts}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── ROUTINE ── */}
      {tab === 'routine' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {[
            { key: 'amRoutine', label: 'Morning Routine', tag: 'AM', icon: Sun, tagColor: '#d97706', tagBg: '#fef3c7', headerBg: '#fffbeb' },
            { key: 'pmRoutine', label: 'Evening Routine', tag: 'PM', icon: Moon, tagColor: '#6366f1', tagBg: '#e0e7ff', headerBg: '#eef2ff' },
          ].map(({ key, label, tag, icon: Icon, tagColor, tagBg, headerBg }) => (
            <div key={key} style={{ background: '#fff', borderRadius: 14, border: '1px solid #f0f0f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ background: headerBg, padding: '14px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon size={18} color={tagColor} />
                <span style={{ fontWeight: 700, fontSize: 14 }}>{label}</span>
                <span style={{ background: tagBg, color: tagColor, fontSize: 10, padding: '2px 7px', borderRadius: 999, fontWeight: 700 }}>{tag}</span>
              </div>
              <div style={{ padding: '14px 18px' }}>
                {!routine[key]?.length ? (
                  <div style={{ textAlign: 'center', padding: '30px 0' }}>
                    <Sparkles size={28} color="#e5e7eb" style={{ margin: '0 auto 10px', display: 'block' }} />
                    <p style={{ color: '#9ca3af', fontSize: 13, marginBottom: 10 }}>No products in your {tag} routine yet</p>
                    <Link to="/quiz" style={{ color: M, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                      Take the skin quiz <ArrowRight size={12} />
                    </Link>
                  </div>
                ) : routine[key].map((product, idx) => (
                  <div key={product._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px', background: '#f9fafb', borderRadius: 10, marginBottom: 8 }}>
                    <div style={{ width: 26, height: 26, background: M, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 11, flexShrink: 0 }}>
                      {idx + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{product.name}</div>
                      <div style={{ fontSize: 10, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {product.description?.substring(0, 55)}...
                      </div>
                    </div>
                    <Link to={`/product/${product._id}`} style={{ fontSize: 11, color: M, fontWeight: 600, textDecoration: 'none', flexShrink: 0 }}>View</Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── ORDERS ── */}
      {tab === 'orders' && (
        <div>
          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: 14, border: '1px solid #f0f0f0' }}>
              <Package size={40} color="#e5e7eb" style={{ margin: '0 auto 12px', display: 'block' }} />
              <p style={{ color: '#9ca3af', marginBottom: 16, fontSize: 14 }}>No orders yet</p>
              <Link to="/products" style={{ background: M, color: '#fff', padding: '8px 20px', borderRadius: 9, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                Start Shopping
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {orders.map(order => {
                const s = ORDER_STATUS[order.status] || ORDER_STATUS.pending;
                return (
                  <div key={order._id} style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, padding: '14px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontWeight: 700, fontSize: 13 }}>#{order.orderNumber || order._id.slice(-8).toUpperCase()}</span>
                        <span style={{ fontSize: 10, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Calendar size={10} /> {new Date(order.orderDate || order.createdAt).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ background: s.bg, color: s.color, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999 }}>{s.label.toUpperCase()}</span>
                        <span style={{ fontWeight: 800, color: M, fontSize: 14 }}>₹{(order.grandTotal || order.totalAmount || 0).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>
                      {order.items?.map(i => i.name).join(', ') || '—'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── REWARDS ── */}
      {tab === 'rewards' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          {[
            { points: 0,    label: 'Welcome Bonus',      description: 'Account created',        icon: Gift },
            { points: 100,  label: '₹10 off next order', description: '100 pts required',       icon: Ticket },
            { points: 250,  label: 'Free delivery',      description: '250 pts required',       icon: Box },
            { points: 500,  label: '₹50 off any order',  description: '500 pts required',       icon: Star },
            { points: 1000, label: '₹150 off + gift',    description: '1000 pts required',      icon: Trophy },
            { points: 2000, label: 'Platinum status',    description: 'Exclusive perks forever', icon: Shield },
          ].map(r => <RewardCard key={r.points} {...r} currentPoints={points} />)}
        </div>
      )}

      {/* ── VOUCHERS ── */}
      {tab === 'vouchers' && (
        <div>
          {activeVouchers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: 14, border: '1px solid #f0f0f0', color: '#9ca3af' }}>
              <Ticket size={36} color="#e5e7eb" style={{ margin: '0 auto 12px', display: 'block' }} />
              <p style={{ fontSize: 14, marginBottom: 6 }}>No active vouchers</p>
              <p style={{ fontSize: 12 }}>New users receive a 15% welcome voucher on signup.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
              {activeVouchers.map((v, i) => <VoucherCard key={i} voucher={v} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}