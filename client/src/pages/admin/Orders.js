import React, { useEffect, useState } from 'react';
import {
  Package, Search, Filter, RefreshCw, ChevronDown,
  Truck, CheckCircle, XCircle, Clock, Eye, TrendingUp
} from 'lucide-react';
import api from '../../services/api';

const M = '#4A0E2E';
const fmt = v => '₹' + (v || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

const STATUS = {
  pending:    { bg: '#fefce8', c: '#d97706', border: '#fde68a', label: 'Pending',    Icon: Clock },
  processing: { bg: '#eff6ff', c: '#1d4ed8', border: '#bfdbfe', label: 'Processing', Icon: RefreshCw },
  confirmed:  { bg: '#f0fdf4', c: '#16a34a', border: '#bbf7d0', label: 'Confirmed',  Icon: CheckCircle },
  shipped:    { bg: '#f0fdfa', c: '#0d9488', border: '#99f6e4', label: 'Shipped',    Icon: Truck },
  delivered:  { bg: '#dcfce7', c: '#15803d', border: '#86efac', label: 'Delivered',  Icon: CheckCircle },
  cancelled:  { bg: '#fef2f2', c: '#dc2626', border: '#fca5a5', label: 'Cancelled',  Icon: XCircle },
};
const STATUS_LIST = ['pending', 'processing', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [trackingInput, setTracking] = useState({});
  const [updating, setUpdating] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (statusFilter) params.append('status', statusFilter);
      const r = await api.get(`/orders?${params}`);
      setOrders(r.data.orders || r.data);
      setTotal(r.data.total || (r.data.orders || r.data).length);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [statusFilter, page]);

  const updateStatus = async (id, newStatus) => {
    setUpdating(id);
    try {
      const tracking = trackingInput[id] || '';
      await api.put(`/orders/${id}/status`, { status: newStatus, trackingNumber: tracking });
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status: newStatus, trackingNumber: tracking || o.trackingNumber } : o));
      if (newStatus === 'shipped') alert(`Order marked as shipped. Shipping confirmation email sent to customer automatically.`);
      if (newStatus === 'delivered') alert(`Order marked as delivered. Delivery email + review request sent to customer.`);
    } catch (e) { alert('Failed to update: ' + (e.response?.data?.message || e.message)); }
    setUpdating(null);
  };

  const filtered = search
    ? orders.filter(o => (o.orderNumber || '').toLowerCase().includes(search.toLowerCase()) || (o.user?.name || '').toLowerCase().includes(search.toLowerCase()) || (o.user?.email || '').toLowerCase().includes(search.toLowerCase()))
    : orders;

  const visibleRevenue = filtered.reduce((s, o) => s + (o.grandTotal || 0), 0);

  return (
    <div style={{ fontFamily: 'system-ui,sans-serif', color: '#1f2937' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: M, margin: 0 }}>Order Management</h1>
          <p style={{ color: '#9ca3af', fontSize: 12, marginTop: 4, marginBottom: 0 }}>
            {total} total orders · {fmt(visibleRevenue)} shown · Emails auto-sent on status changes
          </p>
        </div>
        <button onClick={fetchOrders} style={{ background: '#f3f4f6', border: 'none', borderRadius: 9, padding: '8px 12px', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search order, name, email..."
            style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px 8px 30px', fontSize: 13, boxSizing: 'border-box', outline: 'none', background: '#fafafa' }} />
        </div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {['', ...STATUS_LIST].map(s => {
            const st = STATUS[s];
            return (
              <button key={s} onClick={() => { setStatus(s); setPage(1); }} style={{
                padding: '6px 12px', borderRadius: 999, border: '1px solid', fontSize: 11, cursor: 'pointer', fontWeight: 600,
                borderColor: statusFilter === s ? M : '#e5e7eb',
                background: statusFilter === s ? M : '#fff',
                color: statusFilter === s ? '#fff' : '#374151',
              }}>{s ? st?.label : 'All'}</button>
            );
          })}
        </div>
      </div>

      {/* Revenue summary cards */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Orders', value: total, color: M },
          { label: 'Pending', value: orders.filter(o => o.status === 'pending').length, color: '#d97706' },
          { label: 'Shipped', value: orders.filter(o => o.status === 'shipped').length, color: '#0d9488' },
          { label: 'Delivered', value: orders.filter(o => o.status === 'delivered').length, color: '#15803d' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 12, padding: '12px 18px', flex: 1, minWidth: 100, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Loading orders...
            <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
            <Package size={32} color="#e5e7eb" style={{ margin: '0 auto 10px', display: 'block' }} />
            <p>No orders found.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['Order', 'Customer', 'Date', 'Items', 'Total', 'Status', 'Update'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#6b7280', fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => {
                const st = STATUS[o.status] || STATUS.pending;
                const isExpanded = expanded === o._id;
                return (
                  <React.Fragment key={o._id}>
                    <tr style={{ borderTop: '1px solid #f9fafb', cursor: 'pointer' }}
                      onClick={() => setExpanded(isExpanded ? null : o._id)}
                      onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ fontWeight: 700, fontSize: 12, color: M, fontFamily: 'monospace' }}>{o.orderNumber || o._id.slice(-8).toUpperCase()}</div>
                        {o.invoiceNumber && <div style={{ fontSize: 10, color: '#9ca3af' }}>{o.invoiceNumber}</div>}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ fontWeight: 600 }}>{o.user?.name || '—'}</div>
                        <div style={{ fontSize: 10, color: '#9ca3af' }}>{o.user?.email}</div>
                      </td>
                      <td style={{ padding: '10px 14px', color: '#6b7280' }}>
                        {new Date(o.orderDate || o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </td>
                      <td style={{ padding: '10px 14px', color: '#6b7280' }}>{o.items?.length || 0} item{o.items?.length !== 1 ? 's' : ''}</td>
                      <td style={{ padding: '10px 14px', fontWeight: 700 }}>{fmt(o.grandTotal || o.totalAmount)}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ background: st.bg, color: st.c, border: `1px solid ${st.border}`, padding: '3px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700 }}>{st.label}</span>
                        {o.trackingNumber && <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 3 }}>#{o.trackingNumber}</div>}
                      </td>
                      <td style={{ padding: '10px 14px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <select value={o.status} onChange={e => updateStatus(o._id, e.target.value)} disabled={updating === o._id}
                            style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 8px', fontSize: 11, cursor: 'pointer', outline: 'none', background: '#fff' }}>
                            {STATUS_LIST.map(s => <option key={s} value={s}>{STATUS[s]?.label}</option>)}
                          </select>
                          {updating === o._id && <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite', color: '#9ca3af' }} />}
                        </div>
                       </td>
                    </tr>
                    {isExpanded && (
                      <tr style={{ borderTop: '1px solid #f0f0f0', background: '#fafafa' }}>
                        <td colSpan={7} style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                            {/* Items */}
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 11, color: '#6b7280', textTransform: 'uppercase', marginBottom: 8 }}>Items Ordered</div>
                              {(o.items || []).map((item, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 0', borderBottom: '1px solid #f3f4f6' }}>
                                  <span style={{ fontWeight: 600 }}>{item.name}</span>
                                  <span style={{ color: '#6b7280' }}>×{item.quantity} · {fmt(item.price)}</span>
                                </div>
                              ))}
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '6px 0', fontWeight: 700 }}>
                                <span>Grand Total</span>
                                <span style={{ color: M }}>{fmt(o.grandTotal)}</span>
                              </div>
                            </div>

                            {/* Shipping */}
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 11, color: '#6b7280', textTransform: 'uppercase', marginBottom: 8 }}>Shipping Address</div>
                              {o.shippingAddress ? (
                                <div style={{ fontSize: 12, color: '#4b5563', lineHeight: 1.7 }}>
                                  {o.shippingAddress.street}<br />
                                  {o.shippingAddress.city}, {o.shippingAddress.state}<br />
                                  {o.shippingAddress.zipCode}
                                </div>
                              ) : <span style={{ fontSize: 12, color: '#9ca3af' }}>No address recorded</span>}
                              {o.phone && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>{o.phone}</div>}
                            </div>

                            {/* Tracking */}
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 11, color: '#6b7280', textTransform: 'uppercase', marginBottom: 8 }}>Tracking</div>
                              <input value={trackingInput[o._id] || o.trackingNumber || ''} onChange={e => setTracking(t => ({ ...t, [o._id]: e.target.value }))}
                                placeholder="Enter tracking number" style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 7, padding: '7px 10px', fontSize: 12, boxSizing: 'border-box', outline: 'none', marginBottom: 8 }} />
                              <div style={{ fontSize: 10, color: '#9ca3af', lineHeight: 1.5 }}>
                                Setting status to "Shipped" auto-sends shipping email.<br />
                                Setting to "Delivered" sends delivery confirmation + review request.
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {total > 15 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ background: '#f3f4f6', border: 'none', borderRadius: 7, padding: '7px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: page === 1 ? '#d1d5db' : '#374151' }}>Previous</button>
          <span style={{ padding: '7px 14px', fontSize: 12, color: '#6b7280' }}>Page {page} of {Math.ceil(total / 15)}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={filtered.length < 15} style={{ background: M, color: '#fff', border: 'none', borderRadius: 7, padding: '7px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Next</button>
        </div>
      )}
    </div>
  );
}