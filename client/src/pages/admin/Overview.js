import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  TrendingUp, ShoppingBag, Users, Package, AlertTriangle,
  ArrowUpRight, Star, RefreshCw, Activity, Clock
} from 'lucide-react';

const API   = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const M     = '#4A0E2E';
const tok   = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
const fmt   = v => '₹' + (v || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

function KPICard({ label, value, icon: Icon, color, sub, trend }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, padding: '20px 22px', flex: 1, minWidth: 140, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ background: color ? `${color}15` : '#f3f4f6', borderRadius: 10, padding: 8 }}>
          <Icon size={17} color={color || '#6b7280'} />
        </div>
        {trend != null && (
          <span style={{ fontSize: 11, fontWeight: 700, color: trend >= 0 ? '#16a34a' : '#dc2626', display: 'flex', alignItems: 'center', gap: 2 }}>
            <ArrowUpRight size={12} /> {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: color || '#1f2937', lineHeight: 1, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: '#d97706', marginTop: 3, fontWeight: 600 }}>{sub}</div>}
    </div>
  );
}

export default function Overview() {
  const [data, setData]       = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const [dRes, rRes] = await Promise.allSettled([
        axios.get(`${API}/admin/dashboard`, tok()),
        axios.get(`${API}/reviews?flagged=true&limit=5`),
      ]);
      if (dRes.status === 'fulfilled') setData(dRes.value.data);
      if (rRes.status === 'fulfilled') setReviews(rRes.value.data.reviews || []);
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, gap: 10, color: '#9ca3af' }}>
      <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if (!data) return <p style={{ color: '#dc2626', padding: '2rem' }}>Failed to load dashboard data.</p>;

  const maxRev = Math.max(...(data.dailyRevenue || []).map(d => d.revenue), 1);

  return (
    <div style={{ fontFamily: 'system-ui,sans-serif' }}>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: M, margin: 0 }}>Dashboard Overview</h1>
          <p style={{ color: '#9ca3af', fontSize: 12, marginTop: 4, marginBottom: 0 }}>Real-time business metrics</p>
        </div>
        <button onClick={fetch} style={{ background: '#f3f4f6', border: 'none', borderRadius: 9, padding: '8px 12px', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        <KPICard label="Total Revenue"   value={fmt(data.totalRevenue)}   icon={TrendingUp} color={M} />
        <KPICard label="Total Orders"    value={data.totalOrders}         icon={ShoppingBag} color="#1d4ed8" />
        <KPICard label="Customers"       value={data.totalUsers}          icon={Users}       color="#047857" />
        <KPICard label="Products"        value={data.totalProducts}       icon={Package}     color="#b45309" />
        <KPICard label="Low Stock Items" value={(data.lowStock||[]).length} icon={AlertTriangle} color="#dc2626" sub={(data.lowStock||[]).length > 0 ? 'Needs attention' : 'All healthy'} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Revenue chart */}
        <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 700, fontSize: 13, marginBottom: 20, color: '#1f2937' }}>
            <Activity size={15} color={M} /> Revenue — Last 7 Days
          </div>
          {(data.dailyRevenue || []).length === 0
            ? <p style={{ color: '#9ca3af', fontSize: 13 }}>No revenue data yet. Revenue appears when orders are placed.</p>
            : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(data.dailyRevenue || []).map(d => {
                  const pct = (d.revenue / maxRev) * 100;
                  const date = new Date(d._id).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                  return (
                    <div key={d._id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ width: 55, fontSize: 11, color: '#9ca3af', flexShrink: 0 }}>{date}</span>
                      <div style={{ flex: 1, background: '#f3f4f6', borderRadius: 999, height: 22, overflow: 'hidden', position: 'relative' }}>
                        <div style={{ height: '100%', background: `linear-gradient(90deg, ${M}, #7B2D3C)`, width: `${Math.max(pct, 2)}%`, borderRadius: 999, transition: 'width 0.6s ease' }} />
                      </div>
                      <div style={{ width: 90, textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: M }}>{fmt(d.revenue)}</div>
                        <div style={{ fontSize: 10, color: '#9ca3af' }}>{d.orders} orders</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          }
        </div>

        {/* Low stock */}
        <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 700, fontSize: 13, marginBottom: 16, color: '#dc2626' }}>
            <AlertTriangle size={15} /> Low Stock Alerts
          </div>
          {(data.lowStock || []).length === 0
            ? <p style={{ color: '#9ca3af', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>All inventory levels are healthy.</p>
            : (data.lowStock || []).map(p => (
              <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #f9fafb' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#1f2937' }}>{p.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: p.stockQuantity === 0 ? '#dc2626' : '#d97706' }}>{p.stockQuantity}</span>
                  <span style={{ background: p.stockQuantity === 0 ? '#fef2f2' : '#fffbeb', color: p.stockQuantity === 0 ? '#dc2626' : '#d97706', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 999 }}>
                    {p.stockQuantity === 0 ? 'OUT' : 'LOW'}
                  </span>
                </div>
              </div>
            ))
          }
        </div>
      </div>

      {/* Flagged reviews */}
      <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 700, fontSize: 13, marginBottom: 16, color: '#1f2937' }}>
          <Star size={15} color={M} /> Flagged Reviews — Need Attention
        </div>
        {reviews.length === 0
          ? <p style={{ color: '#9ca3af', fontSize: 13 }}>No flagged reviews. Reviews are flagged when quality concerns or low ratings are detected.</p>
          : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {reviews.map(r => (
                <div key={r._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px 14px', background: '#fef2f2', borderRadius: 10, border: '1px solid #fecaca' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontWeight: 700, fontSize: 12 }}>{r.name}</span>
                      {r.product?.name && <span style={{ fontSize: 10, color: '#9ca3af' }}>on {r.product.name}</span>}
                    </div>
                    <p style={{ fontSize: 12, color: '#4b5563', margin: 0, lineHeight: 1.5 }}>{(r.comment || '').slice(0, 120)}...</p>
                    {r.flagReason && <div style={{ fontSize: 10, color: '#dc2626', marginTop: 4, fontWeight: 600 }}>{r.flagReason}</div>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0, marginLeft: 12 }}>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {[1,2,3,4,5].map(n => (
                        <Star key={n} size={11} fill={r.rating >= n ? '#f59e0b' : 'none'} color={r.rating >= n ? '#f59e0b' : '#d1d5db'}/>
                      ))}
                    </div>
                    <span style={{ fontSize: 10, color: '#9ca3af' }}>{new Date(r.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          )
        }
      </div>
    </div>
  );
}
