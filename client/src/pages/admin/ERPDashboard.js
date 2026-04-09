import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Package, Truck, Factory, AlertCircle, 
  TrendingUp, ShoppingBag, RefreshCw, ChevronRight 
} from 'lucide-react';

const API = 'http://localhost:5000/api/admin';
const tok = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
const R = '#4A0E2E';

export default function ERPHub() {
  const [data, setData] = useState({ stats: {}, lowStock: [], orders: [] });
  const [loading, setLoading] = useState(false);

  const fetchERPData = async () => {
    setLoading(true);
    try {
      // Functional: Fetches your real dashboard stats from admin.js
      const res = await axios.get(`${API}/dashboard`, tok());
      setData({
        stats: res.data,
        lowStock: res.data.lowStock || [],
        orders: res.data.recentOrders || []
      });
    } catch (err) { console.error("ERP Data Fetch Error", err); }
    setLoading(false);
  };

  useEffect(() => { fetchERPData(); }, []);

  return (
    <div style={{ padding: '25px', backgroundColor: '#fcfcfc' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: R }}>Enterprise Operations (ERP & SCM)</h1>
        <button onClick={fetchERPData} style={{ background: R, color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer' }}>
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* ── REAL-TIME KPI TILES ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <KPICard title="Total Revenue" value={`₹${data.stats.totalRevenue || 0}`} icon={<TrendingUp color={R}/>} />
        <KPICard title="Total Orders" value={data.stats.totalOrders || 0} icon={<ShoppingBag color={R}/>} />
        <KPICard title="Active Products" value={data.stats.totalProducts || 0} icon={<Package color={R}/>} />
        <KPICard title="Low Stock Alerts" value={data.lowStock.length} icon={<AlertCircle color="#dc2626"/>} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '25px' }}>
        
        {/* ── SCM: LOW STOCK REORDER TRIGGER ── */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '15px', padding: '20px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Factory size={18} /> SCM Inventory Reorder Trigger
          </h3>
          {data.lowStock.length > 0 ? data.lowStock.map(p => (
            <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderBottom: '1px solid #f3f4f6', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#ef4444' }}>Current Stock: {p.stockQuantity} (Threshold: {p.safetyThreshold})</div>
              </div>
              <button style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                Notify Supplier
              </button>
            </div>
          )) : <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Inventory levels healthy.</p>}
        </div>

        {/* ── LOGISTICS: ORDER FLOW ── */}
     {/* Logistics Status Section */}
<div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '15px', padding: '20px' }}>
  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
    <Truck size={18} color="#4A0E2E" /> Logistics Status
  </h3>
  {data.recentOrders && data.recentOrders.length > 0 ? (
    data.recentOrders.map(o => (
      <div key={o._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f9fafb' }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>ID: #{o._id.slice(-6)}</div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{o.user?.name || 'Customer'}</div>
        </div>
        <span style={{ 
          fontSize: '0.75rem', 
          fontWeight: 700, 
          color: o.status === 'Delivered' ? '#16a34a' : '#4A0E2E',
          background: o.status === 'Delivered' ? '#f0fdf4' : '#4A0E2E10',
          padding: '4px 8px',
          borderRadius: '4px'
        }}>
          {o.status.toUpperCase()}
        </span>
      </div>
    ))
  ) : (
    <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>No recent logistics activity.</p>
  )}
</div>

      </div>
    </div>
  );
}

const KPICard = ({ title, value, icon }) => (
  <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
    <div style={{ marginBottom: '10px' }}>{icon}</div>
    <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{value}</div>
    <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>{title}</div>
  </div>
);