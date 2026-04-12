// client/src/pages/TrackOrder.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Package, Search, Truck, CheckCircle, Clock, XCircle, MapPin, RefreshCw, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const API = 'http://localhost:5000/api';
const M   = '#4A0E2E';
const tok = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

const STEPS = [
  { key: 'pending',    label: 'Order Placed',  desc: 'Your order has been received',           icon: Clock },
  { key: 'confirmed',  label: 'Confirmed',     desc: 'Payment confirmed & being processed',    icon: CheckCircle },
  { key: 'processing', label: 'Processing',    desc: 'Products being picked & packed',         icon: Package },
  { key: 'shipped',    label: 'Shipped',        desc: 'Out for delivery with our logistics partner', icon: Truck },
  { key: 'delivered',  label: 'Delivered',     desc: 'Successfully delivered to your address', icon: CheckCircle },
];

const STATUS_IDX = { pending: 0, confirmed: 1, processing: 2, shipped: 3, delivered: 4, cancelled: -1 };

function OrderTimeline({ order }) {
  const currentIdx = STATUS_IDX[order.status] ?? 0;
  const cancelled  = order.status === 'cancelled';

  return (
    <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 16, padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
      {/* Order header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#1f2937' }}>#{order.orderNumber}</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
            Placed {new Date(order.orderDate || order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 800, fontSize: 18, color: M }}>₹{(order.grandTotal||0).toLocaleString('en-IN')}</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</div>
        </div>
      </div>

      {cancelled ? (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <XCircle size={20} color="#dc2626"/>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#dc2626' }}>Order Cancelled</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>This order has been cancelled. If you were charged, a refund will be processed in 5–7 business days.</div>
          </div>
        </div>
      ) : (
        <>
          {/* Timeline */}
          <div style={{ position: 'relative' }}>
            {STEPS.map((step, i) => {
              const done    = i <= currentIdx;
              const active  = i === currentIdx;
              const Icon    = step.icon;
              return (
                <div key={step.key} style={{ display: 'flex', gap: 16, marginBottom: i < STEPS.length-1 ? 0 : 0, position: 'relative' }}>
                  {/* Line */}
                  {i < STEPS.length - 1 && (
                    <div style={{ position: 'absolute', left: 18, top: 36, width: 2, height: 48, background: done && i < currentIdx ? M : '#f0f0f0', transition: 'background 0.3s' }}/>
                  )}
                  {/* Icon */}
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: done ? M : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1, transition: 'all 0.3s', boxShadow: active ? `0 0 0 4px ${M}25` : 'none' }}>
                    <Icon size={16} color={done ? '#fff' : '#d1d5db'}/>
                  </div>
                  {/* Content */}
                  <div style={{ paddingBottom: i < STEPS.length-1 ? 36 : 0 }}>
                    <div style={{ fontWeight: active ? 800 : 600, fontSize: 14, color: done ? '#1f2937' : '#9ca3af', transition: 'all 0.3s' }}>{step.label}</div>
                    <div style={{ fontSize: 12, color: done ? '#6b7280' : '#d1d5db', marginTop: 2, lineHeight: 1.5 }}>{step.desc}</div>
                    {active && order.updatedAt && (
                      <div style={{ fontSize: 11, color: M, marginTop: 3, fontWeight: 600 }}>
                        Updated {new Date(order.updatedAt).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tracking number */}
          {order.trackingNumber && (
            <div style={{ marginTop: 20, background: '#f9fafb', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Truck size={16} color={M}/>
              <div>
                <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', marginBottom: 2 }}>Tracking Number</div>
                <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 14, color: '#1f2937' }}>{order.trackingNumber}</div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Items */}
      <div style={{ marginTop: 20, borderTop: '1px solid #f3f4f6', paddingTop: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 10 }}>Items</div>
        {(order.items || []).map((item, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '5px 0', color: '#4b5563' }}>
            <span>{item.name} <span style={{ color: '#9ca3af' }}>×{item.quantity}</span></span>
            <span style={{ fontWeight: 600 }}>₹{((item.price||0)*item.quantity).toLocaleString('en-IN')}</span>
          </div>
        ))}
      </div>

      {/* Address */}
      {order.shippingAddress && (
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: '#6b7280' }}>
          <MapPin size={13} color="#9ca3af" style={{ marginTop: 1, flexShrink: 0 }}/>
          <span>{order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.zipCode}</span>
        </div>
      )}
    </div>
  );
}

export default function TrackOrder() {
  const { user }          = useAuth();
  const [search, setSearch] = useState('');
  const [orders, setOrders] = useState([]);
  const [found, setFound]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const fetchMyOrders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const r = await axios.get(`${API}/orders/my-orders`, tok());
      setOrders(r.data);
      setFetched(true);
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  const searchOrder = async () => {
    if (!search.trim()) return;
    setLoading(true); setFound(null);
    try {
      const r = await axios.get(`${API}/orders/my-orders`, tok());
      const match = r.data.find(o => (o.orderNumber||'').toLowerCase().includes(search.toLowerCase()) || o._id.includes(search));
      setFound(match || 'not_found');
    } catch(e) { setFound('not_found'); }
    setLoading(false);
  };

  useEffect(() => {
    if (user && !fetched) fetchMyOrders();
  }, [user]);

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '2.5rem 1rem', fontFamily: 'system-ui,sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, background: `${M}15`, borderRadius: '50%', marginBottom: 14 }}>
          <Truck size={28} color={M}/>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#1f2937', margin: '0 0 8px', letterSpacing: '-0.4px' }}>Track Your Order</h1>
        <p style={{ color: '#9ca3af', fontSize: 14, margin: 0 }}>Enter your order number or view all recent orders</p>
      </div>

      {/* Search */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchOrder()}
          placeholder="Enter order number e.g. ORD-1234567890-123" style={{ flex: 1, border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '11px 16px', fontSize: 13, outline: 'none', fontFamily: 'system-ui,sans-serif' }}/>
        <button onClick={searchOrder} disabled={loading} style={{ background: M, color: '#fff', border: 'none', borderRadius: 10, padding: '11px 20px', cursor: 'pointer', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          {loading ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }}/> : <Search size={14}/>} Track
        </button>
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      </div>

      {/* Searched result */}
      {found && found !== 'not_found' && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12, color: '#1f2937' }}>Search Result</div>
          <OrderTimeline order={found}/>
        </div>
      )}
      {found === 'not_found' && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 12, padding: '14px 18px', marginBottom: 24, fontSize: 13, color: '#dc2626', fontWeight: 600 }}>
          Order not found. Please check the order number and try again.
        </div>
      )}

      {/* All orders */}
      {user ? (
        loading && !fetched ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }}/> Loading your orders...
          </div>
        ) : orders.length > 0 ? (
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 14, color: '#1f2937' }}>Your Orders</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {orders.slice(0, 5).map(o => <OrderTimeline key={o._id} order={o}/>)}
            </div>
            {orders.length > 5 && (
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Link to="/dashboard" style={{ color: M, fontWeight: 700, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  View all {orders.length} orders in Dashboard <ChevronRight size={14}/>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: 14, border: '1px solid #f0f0f0', color: '#9ca3af' }}>
            <Package size={36} color="#e5e7eb" style={{ margin: '0 auto 12px', display: 'block' }}/>
            <p style={{ fontSize: 14, marginBottom: 16 }}>No orders yet</p>
            <Link to="/products" style={{ background: M, color: '#fff', padding: '8px 20px', borderRadius: 9, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>Start Shopping</Link>
          </div>
        )
      ) : (
        <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: 14, border: '1px solid #f0f0f0', color: '#9ca3af' }}>
          <Package size={36} color="#e5e7eb" style={{ margin: '0 auto 12px', display: 'block' }}/>
          <p style={{ fontSize: 14, marginBottom: 16 }}>Login to view your orders</p>
          <Link to="/login" style={{ background: M, color: '#fff', padding: '8px 20px', borderRadius: 9, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>Login</Link>
        </div>
      )}
    </div>
  );
}
