import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sun, Moon, Sparkles, Recycle, Gift, Star, Trophy, 
  ShoppingBag, Package, Zap, Wallet, Box, Ticket, 
  LogOut, Check, ChevronRight, Clock, Award, Users,
  Heart, Shield, TrendingUp, Calendar
} from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const TIER_STYLE = {
  bronze:   { color: '#cd7f32', bg: '#fef3c7', bar: '#f59e0b', label: 'Bronze', next: 'Spend ₹5,000 for Silver' },
  silver:   { color: '#94a3b8', bg: '#f1f5f9', bar: '#94a3b8', label: 'Silver', next: 'Spend ₹20,000 for Gold' },
  gold:     { color: '#d4af37', bg: '#fefce8', bar: '#eab308', label: 'Gold', next: 'Spend ₹50,000 for Platinum' },
  platinum: { color: '#7c3aed', bg: '#ede9fe', bar: '#8b5cf6', label: 'Platinum', next: "You're at the top tier!" },
};

const STATUS_STYLE = {
  pending:    { bg: '#fefce8', color: '#d97706' },
  processing: { bg: '#eff6ff', color: '#1d4ed8' },
  confirmed:  { bg: '#f0fdf4', color: '#16a34a' },
  shipped:    { bg: '#f0fdfa', color: '#0d9488' },
  delivered:  { bg: '#dcfce7', color: '#15803d' },
  cancelled:  { bg: '#fef2f2', color: '#dc2626' },
};

function Tab({ label, active, onClick }) {
  return (
    <button 
      onClick={onClick} 
      style={{ 
        padding: '0.5rem 1.25rem', 
        borderRadius: '9999px', 
        border: 'none', 
        cursor: 'pointer', 
        fontSize: '0.85rem', 
        fontWeight: 600,
        background: active ? '#7B2D3C' : 'transparent',
        color: active ? '#fff' : '#6b7280',
        transition: 'all 0.2s'
      }}
    >
      {label}
    </button>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div style={{ 
      background: '#fff', 
      border: '1px solid #f3f4f6', 
      borderRadius: '1rem', 
      padding: '1.25rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    }}>
      <div style={{ color: color || '#6b7280', marginBottom: '0.5rem' }}>
        <Icon size={20} />
      </div>
      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: color || '#1f2937', lineHeight: 1.2 }}>
        {value}
      </div>
      <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.3rem' }}>
        {label}
      </div>
    </div>
  );
}

function RewardCard({ points, label, description, icon: Icon, currentPoints, earned }) {
  const progress = Math.min((currentPoints / points) * 100, 100);
  
  return (
    <div style={{ 
      background: earned ? 'linear-gradient(135deg, #f0fdf4, #dcfce7)' : '#fff',
      border: earned ? '2px solid #86efac' : '1px solid #f3f4f6',
      borderRadius: '1rem',
      padding: '1.25rem',
      position: 'relative'
    }}>
      {earned && (
        <div style={{ 
          position: 'absolute', 
          top: 10, 
          right: 10, 
          background: '#16a34a', 
          color: '#fff', 
          borderRadius: '999px', 
          padding: '0.15rem 0.5rem', 
          fontSize: '0.65rem', 
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '2px'
        }}>
          <Check size={10} /> Earned
        </div>
      )}
      <div style={{ color: earned ? '#16a34a' : '#7B2D3C', marginBottom: '0.5rem' }}>
        <Icon size={24} />
      </div>
      <div style={{ fontWeight: 700, color: '#1f2937', marginBottom: '0.2rem', fontSize: '0.9rem' }}>
        {label}
      </div>
      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
        {description}
      </div>
      {!earned && (
        <div style={{ marginTop: '0.75rem' }}>
          <div style={{ background: '#e5e7eb', borderRadius: '999px', height: 5, overflow: 'hidden' }}>
            <div style={{ height: 5, background: '#7B2D3C', width: `${progress}%`, borderRadius: '999px' }} />
          </div>
          <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.3rem' }}>
            {currentPoints} / {points} pts
          </div>
        </div>
      )}
    </div>
  );
}

function VoucherCard({ voucher }) {
  const copyCode = () => {
    navigator.clipboard.writeText(voucher.code);
    alert('Voucher code copied!');
  };

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #7B2D3C, #4A0E2E)', 
      borderRadius: '1.25rem', 
      padding: '1.5rem', 
      color: '#fff',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', top: -24, right: -24, width: 96, height: 96, background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
      <Gift size={28} color="rgba(255,255,255,0.9)" />
      <div style={{ fontSize: '2rem', fontWeight: 900, margin: '0.5rem 0 0.25rem' }}>
        {voucher.discount}% OFF
      </div>
      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.65)', marginBottom: '1rem' }}>
        On your order · Min spend ₹999
      </div>
      <div style={{ 
        background: 'rgba(255,255,255,0.12)', 
        borderRadius: '0.6rem', 
        padding: '0.6rem 0.875rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '0.75rem'
      }}>
        <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1rem', letterSpacing: '0.12em' }}>
          {voucher.code}
        </span>
        <button 
          onClick={copyCode}
          style={{ 
            background: 'rgba(255,255,255,0.2)', 
            border: 'none', 
            color: '#fff', 
            borderRadius: '0.35rem', 
            padding: '0.25rem 0.6rem', 
            cursor: 'pointer', 
            fontSize: '0.7rem', 
            fontWeight: 700 
          }}
        >
          Copy
        </button>
      </div>
      <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.55)' }}>
        Expires: {new Date(voucher.expiresAt).toLocaleDateString('en-IN')}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const [userData, setUserData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [routine, setRoutine] = useState({ amRoutine: [], pmRoutine: [] });
  const [loading, setLoading] = useState(true);
  const [recycling, setRecycling] = useState(false);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      fetchRoutine();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [userRes, ordersRes] = await Promise.all([
        axios.get(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/orders/my-orders`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setUserData(userRes.data);
      setOrders(ordersRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoutine = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/quiz/routine`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoutine(response.data);
    } catch (error) {
      console.error('Error fetching routine:', error);
    }
  };

  const handleRecycle = async () => {
    setRecycling(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/users/recycle`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserData(prev => ({ ...prev, glowPoints: response.data.glowPoints }));
      alert('+50 GlowPoints added for recycling! Thank you for being eco-friendly!');
      fetchDashboardData();
    } catch (error) {
      console.error('Recycling error:', error);
      alert('Failed to add points. Please try again.');
    } finally {
      setRecycling(false);
    }
  };

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" />;
  }

  const cu = userData || user;
  const points = cu.glowPoints || 0;
  const totalSpent = orders.reduce((sum, order) => sum + (order.grandTotal || order.totalAmount || 0), 0);
  
  // Determine tier
  let tier = TIER_STYLE.bronze;
  if (points >= 2000) tier = TIER_STYLE.platinum;
  else if (points >= 1000) tier = TIER_STYLE.gold;
  else if (points >= 500) tier = TIER_STYLE.silver;
  
  const progressToNext = points >= 2000 ? 100 : (points / 2000) * 100;
  const activeVouchers = (cu.vouchers || []).filter(v => !v.isUsed && new Date(v.expiresAt) > new Date());

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ color: '#6b7280' }}>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            width: 56, height: 56, borderRadius: '50%', 
            background: 'linear-gradient(135deg, #7B2D3C, #4A0E2E)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            color: '#fff', fontWeight: 800, fontSize: '1.2rem' 
          }}>
            {cu.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1f2937', margin: 0 }}>
              Hello, {cu.name?.split(' ')[0]}!
            </h1>
            <p style={{ color: '#9ca3af', fontSize: '0.8rem', margin: 0 }}>{cu.email}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/products" style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem', 
            padding: '0.5rem 1.25rem', background: '#7B2D3C', color: '#fff', 
            borderRadius: '0.6rem', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 
          }}>
            <ShoppingBag size={16} /> Shop
          </Link>
          <button onClick={() => { logout(); }} style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem', 
            padding: '0.5rem 1.25rem', border: '1px solid #e5e7eb', 
            borderRadius: '0.6rem', background: '#fff', color: '#6b7280', 
            cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 
          }}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard icon={Star} label="Glow Points" value={points} color="#7B2D3C" />
        <StatCard icon={Package} label="Orders" value={orders.length} color="#1d4ed8" />
        <StatCard icon={Wallet} label="Total Spent" value={`₹${totalSpent.toFixed(0)}`} color="#047857" />
        <StatCard icon={Award} label="Loyalty Tier" value={tier.label} color={tier.color} />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', background: '#f3f4f6', borderRadius: '9999px', padding: '0.3rem', width: 'fit-content', marginBottom: '1.5rem' }}>
        {['overview', 'routine', 'orders', 'rewards', 'vouchers'].map(t => (
          <Tab key={t} label={t.charAt(0).toUpperCase() + t.slice(1)} active={tab === t} onClick={() => setTab(t)} />
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Loyalty Card */}
          <div style={{ 
            background: `linear-gradient(135deg, ${tier.bg}, #fff)`, 
            border: `1.5px solid ${tier.color}30`, 
            borderRadius: '1.25rem', 
            padding: '1.5rem' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: tier.color, fontSize: '0.9rem' }}>
                  <Trophy size={16} /> {tier.label.toUpperCase()}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.2rem' }}>{tier.next}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: tier.color, lineHeight: 1.2 }}>{points}</div>
                <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Glow Points</div>
              </div>
            </div>
            <div style={{ background: '#e5e7eb', borderRadius: '999px', height: 8, overflow: 'hidden' }}>
              <div style={{ height: 8, background: tier.bar, width: `${progressToNext}%`, borderRadius: '999px', transition: 'width 0.8s ease' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.7rem', color: '#9ca3af' }}>
              <span>₹{totalSpent.toFixed(0)} spent</span>
              <span>500 pts = ₹50 off</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ background: '#fff', border: '1px solid #f3f4f6', borderRadius: '1.25rem', padding: '1.25rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.95rem' }}>Quick Actions</h3>
              <Link to="/products" style={{ 
                display: 'flex', alignItems: 'center', gap: '0.6rem', 
                background: '#f9fafb', borderRadius: '0.6rem', padding: '0.6rem 0.875rem', 
                textDecoration: 'none', color: '#374151', fontSize: '0.85rem', fontWeight: 500,
                marginBottom: '0.5rem', border: '1px solid #f3f4f6'
              }}>
                <ShoppingBag size={16} color="#7B2D3C" /> Browse Products
              </Link>
              <Link to="/quiz" style={{ 
                display: 'flex', alignItems: 'center', gap: '0.6rem', 
                background: '#f9fafb', borderRadius: '0.6rem', padding: '0.6rem 0.875rem', 
                textDecoration: 'none', color: '#374151', fontSize: '0.85rem', fontWeight: 500,
                border: '1px solid #f3f4f6'
              }}>
                <Sparkles size={16} color="#7B2D3C" /> Retake Quiz
              </Link>
            </div>

            {/* Latest Order */}
            {orders.length > 0 && (
              <div style={{ background: '#fff', border: '1px solid #f3f4f6', borderRadius: '1.25rem', padding: '1.25rem' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Package size={16} color="#7B2D3C" /> Latest Order
                </h3>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                  #{orders[0].orderNumber || orders[0]._id.slice(-8).toUpperCase()}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                  {orders[0].items?.map(i => i.name).join(', ') || '—'}
                </div>
                <div style={{ fontWeight: 800, color: '#7B2D3C' }}>₹{orders[0].grandTotal?.toFixed(2) || orders[0].totalAmount?.toFixed(2)}</div>
                <button onClick={() => setTab('orders')} style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#7B2D3C', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                  View all orders →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Routine Tab */}
      {tab === 'routine' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {/* AM Routine */}
          <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #f3f4f6', overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(135deg, #fef3c7, #fff)', padding: '1rem', borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sun size={20} color="#d97706" />
                <h3 style={{ fontWeight: 700, margin: 0 }}>Morning Routine</h3>
                <span style={{ background: '#fef3c7', color: '#d97706', fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '999px' }}>AM</span>
              </div>
            </div>
            <div style={{ padding: '1rem' }}>
              {routine.amRoutine?.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <p style={{ color: '#9ca3af', marginBottom: '0.5rem' }}>No products in your AM routine</p>
                  <Link to="/quiz" style={{ color: '#7B2D3C', fontSize: '0.85rem' }}>Take the quiz →</Link>
                </div>
              ) : (
                routine.amRoutine.map((product, idx) => (
                  <div key={product._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#f9fafb', borderRadius: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{ width: 28, height: 28, background: '#7B2D3C', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.75rem' }}>
                      {idx + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{product.name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>{product.description?.substring(0, 50)}...</div>
                    </div>
                    <Link to={`/product/${product._id}`} style={{ fontSize: '0.7rem', color: '#7B2D3C' }}>View</Link>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* PM Routine */}
          <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #f3f4f6', overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(135deg, #e0e7ff, #fff)', padding: '1rem', borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Moon size={20} color="#6366f1" />
                <h3 style={{ fontWeight: 700, margin: 0 }}>Evening Routine</h3>
                <span style={{ background: '#e0e7ff', color: '#6366f1', fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '999px' }}>PM</span>
              </div>
            </div>
            <div style={{ padding: '1rem' }}>
              {routine.pmRoutine?.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <p style={{ color: '#9ca3af', marginBottom: '0.5rem' }}>No products in your PM routine</p>
                  <Link to="/quiz" style={{ color: '#7B2D3C', fontSize: '0.85rem' }}>Take the quiz →</Link>
                </div>
              ) : (
                routine.pmRoutine.map((product, idx) => (
                  <div key={product._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#f9fafb', borderRadius: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{ width: 28, height: 28, background: '#7B2D3C', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.75rem' }}>
                      {idx + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{product.name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>{product.description?.substring(0, 50)}...</div>
                    </div>
                    <Link to={`/product/${product._id}`} style={{ fontSize: '0.7rem', color: '#7B2D3C' }}>View</Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {tab === 'orders' && (
        <div>
          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
              <Package size={48} color="#d1d5db" />
              <p style={{ marginTop: '0.75rem', marginBottom: '1.25rem' }}>No orders yet</p>
              <Link to="/products" style={{ background: '#7B2D3C', color: '#fff', padding: '0.6rem 1.5rem', borderRadius: '9999px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>
                Start Shopping
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {orders.map(order => {
                const statusStyle = STATUS_STYLE[order.status] || STATUS_STYLE.pending;
                return (
                  <div key={order._id} style={{ background: '#fff', border: '1px solid #f3f4f6', borderRadius: '1rem', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>#{order.orderNumber || order._id.slice(-8).toUpperCase()}</span>
                        <span style={{ fontSize: '0.7rem', color: '#9ca3af', marginLeft: '0.5rem' }}>
                          <Calendar size={12} style={{ display: 'inline', marginRight: '0.2rem' }} />
                          {new Date(order.orderDate || order.createdAt).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ background: statusStyle.bg, color: statusStyle.color, fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '999px' }}>
                          {order.status?.toUpperCase() || 'PENDING'}
                        </span>
                        <span style={{ fontWeight: 800, color: '#7B2D3C' }}>₹{(order.grandTotal || order.totalAmount || 0).toFixed(2)}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      {order.items?.map(i => i.name).join(', ') || '—'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Rewards Tab */}
      {tab === 'rewards' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {[
            { points: 0, label: 'Welcome Bonus', description: 'Signed up', icon: Gift, earned: true },
            { points: 100, label: '₹10 off next order', description: '100 pts needed', icon: Ticket, earned: points >= 100 },
            { points: 250, label: 'Free delivery', description: '250 pts needed', icon: Box, earned: points >= 250 },
            { points: 500, label: '₹50 off any order', description: '500 pts needed', icon: Star, earned: points >= 500 },
            { points: 1000, label: '₹150 off + free gift', description: '1000 pts needed', icon: Gift, earned: points >= 1000 },
          ].map(reward => (
            <RewardCard key={reward.points} {...reward} currentPoints={points} />
          ))}
        </div>
      )}

      {/* Vouchers Tab */}
      {tab === 'vouchers' && (
        <div>
          {activeVouchers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
              <Ticket size={48} color="#d1d5db" />
              <p style={{ marginTop: '0.75rem' }}>No active vouchers.</p>
              <p style={{ fontSize: '0.8rem', marginTop: '0.4rem' }}>New users get a 15% welcome voucher on signup!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {activeVouchers.map((voucher, idx) => (
                <VoucherCard key={idx} voucher={voucher} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}