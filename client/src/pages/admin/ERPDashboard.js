import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle, Package, TrendingUp, RefreshCw, Shield,
  FileText, X, Plus, ChevronRight, Clock, BarChart2,
  CheckCircle, XCircle, Layers, Thermometer, Activity,
  ArrowUpRight, ArrowDownRight, Info, Search, Filter
} from 'lucide-react';
import api from '../../services/api';

const M = '#4A0E2E';
const ML = '#6B1D45';

const fmt = v => '₹' + ((v || 0)).toLocaleString('en-IN', { maximumFractionDigits: 0 });

const STATUS = {
  active:      { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0', label: 'Active' },
  quarantined: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', label: 'Quarantined' },
  recalled:    { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa', label: 'Recalled' },
  expired:     { bg: '#f3f4f6', color: '#4b5563', border: '#d1d5db', label: 'Expired' },
  depleted:    { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', label: 'Depleted' },
};

const RISK = {
  low:      { color: '#16a34a', bg: '#f0fdf4' },
  medium:   { color: '#d97706', bg: '#fffbeb' },
  high:     { color: '#dc2626', bg: '#fef2f2' },
  critical: { color: '#7c3aed', bg: '#faf5ff' },
};

const CAT = {
  health_data:    { color: '#dc2626', label: 'Health' },
  financial_data: { color: '#7c3aed', label: 'Financial' },
  personal_data:  { color: '#d97706', label: 'Personal' },
  operational:    { color: '#16a34a', label: 'Operational' },
  security:       { color: '#1d4ed8', label: 'Security' },
};

function KPICard({ label, value, icon, color, sub, trend }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #f0f0f0', borderRadius: '14px',
      padding: '20px 22px', flex: 1, minWidth: 130,
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{
          background: color ? `${color}15` : '#f3f4f6',
          borderRadius: 10, padding: 8, display: 'flex', alignItems: 'center'
        }}>
          {React.cloneElement(icon, { size: 18, color: color || '#6b7280' })}
        </div>
        {trend != null && (
          <span style={{ fontSize: 11, fontWeight: 700, color: trend >= 0 ? '#16a34a' : '#dc2626', display: 'flex', alignItems: 'center', gap: 2 }}>
            {trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: color || '#1f2937', lineHeight: 1, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: '#d97706', marginTop: 4, fontWeight: 600 }}>{sub}</div>}
    </div>
  );
}

function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.active;
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
      letterSpacing: '0.02em'
    }}>{s.label}</span>
  );
}

function SectionCard({ title, icon, children, action }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #f9fafb' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 13, color: '#1f2937' }}>
          {React.cloneElement(icon, { size: 15, color: M })}
          {title}
        </div>
        {action}
      </div>
      <div style={{ padding: '16px 20px' }}>{children}</div>
    </div>
  );
}

function EmptyState({ icon, message }) {
  return (
    <div style={{ textAlign: 'center', padding: '32px 20px', color: '#9ca3af' }}>
      {React.cloneElement(icon, { size: 32, color: '#e5e7eb', style: { margin: '0 auto 10px', display: 'block' } })}
      <p style={{ fontSize: 13, margin: 0 }}>{message}</p>
    </div>
  );
}

export default function ERPDashboard() {
  const [tab, setTab] = useState('overview');
  const [dash, setDash] = useState(null);
  const [batches, setBatches] = useState([]);
  const [cogs, setCogs] = useState(null);
  const [auditLog, setAuditLog] = useState([]);
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [newBatch, setNewBatch] = useState({
    productId: '', manufacturedDate: '', expiryDate: '',
    quantity: '', packagingCost: '', labourCost: '', shippingCost: ''
  });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [dRes, bRes, pRes] = await Promise.allSettled([
        api.get('/erp/dashboard'),
        api.get('/erp/batches'),
        api.get('/products'),
      ]);
      if (dRes.status === 'fulfilled') setDash(dRes.value.data);
      if (bRes.status === 'fulfilled') setBatches(bRes.value.data);
      if (pRes.status === 'fulfilled') setProducts(pRes.value.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    if (tab === 'cogs') {
      api.get('/erp/cogs-report').then(r => setCogs(r.data)).catch(() => {});
    }
    if (tab === 'audit') {
      api.get('/erp/audit-log?limit=50').then(r => setAuditLog(r.data.logs || [])).catch(() => {});
    }
  }, [tab]);

  const runQualityCheck = async () => {
    setChecking(true);
    try {
      const r = await api.post('/erp/batches/check-quality', {});
      alert(r.data.message);
      fetchAll();
    } catch (e) { alert('Quality check failed: ' + (e.response?.data?.message || e.message)); }
    setChecking(false);
  };

  const quarantine = async (id, batchId) => {
    const reason = window.prompt(`Reason for quarantining ${batchId}:`);
    if (!reason) return;
    try {
      await api.post(`/erp/batches/${id}/quarantine`, { reason });
      fetchAll();
    } catch (e) { alert('Failed: ' + (e.response?.data?.message || e.message)); }
  };

  const createBatch = async () => {
    if (!newBatch.productId || !newBatch.quantity || !newBatch.expiryDate) {
      alert('Please fill in Product, Quantity, and Expiry Date');
      return;
    }
    try {
      await api.post('/erp/batches', {
        ...newBatch,
        quantity: Number(newBatch.quantity),
        packagingCost: Number(newBatch.packagingCost) || 0,
        labourCost: Number(newBatch.labourCost) || 0,
        shippingCost: Number(newBatch.shippingCost) || 0,
      });
      setShowAdd(false);
      setNewBatch({ productId: '', manufacturedDate: '', expiryDate: '', quantity: '', packagingCost: '', labourCost: '', shippingCost: '' });
      fetchAll();
    } catch (e) { alert('Failed: ' + (e.response?.data?.message || e.message)); }
  };

  const filtered = batches
    .filter(b => !statusFilter || b.status === statusFilter)
    .filter(b => !searchTerm || (b.productName || '').toLowerCase().includes(searchTerm.toLowerCase()) || b.batchId.toLowerCase().includes(searchTerm.toLowerCase()));

  const inputStyle = {
    border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px',
    fontSize: 13, width: '100%', boxSizing: 'border-box',
    outline: 'none', color: '#1f2937', background: '#fafafa'
  };

  const tabBtn = (t, label, Icon) => (
    <button key={t} onClick={() => setTab(t)} style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
      fontSize: 12, fontWeight: 600,
      background: tab === t ? M : 'transparent',
      color: tab === t ? '#fff' : '#6b7280',
      transition: 'all 0.15s'
    }}>
      <Icon size={14} />{label}
    </button>
  );

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12, color: '#9ca3af' }}>
      <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
      <span style={{ fontSize: 14 }}>Loading ERP data...</span>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#1f2937', maxWidth: 1200 }}>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: M, margin: 0 }}>Enterprise Resource Planning</h1>
          <p style={{ color: '#9ca3af', fontSize: 12, marginTop: 4, marginBottom: 0 }}>
            Batch integrity · COGS · Ingredient provenance · Audit trail
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowAdd(v => !v)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#fff', border: `1.5px solid ${M}`, color: M,
            borderRadius: 9, padding: '8px 16px', cursor: 'pointer', fontWeight: 700, fontSize: 12
          }}>
            <Plus size={14} /> New Batch
          </button>
          <button onClick={runQualityCheck} disabled={checking} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: checking ? '#9ca3af' : '#dc2626', color: '#fff',
            border: 'none', borderRadius: 9, padding: '8px 16px', cursor: 'pointer', fontWeight: 700, fontSize: 12
          }}>
            <Shield size={14} style={{ animation: checking ? 'spin 1s linear infinite' : 'none' }} />
            {checking ? 'Scanning...' : 'AI Quality Check'}
          </button>
          <button onClick={fetchAll} style={{ background: '#f3f4f6', border: 'none', borderRadius: 9, padding: '8px 12px', cursor: 'pointer', color: '#6b7280' }}>
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        <KPICard label="Total Batches"  value={dash?.batchStats?.total || batches.length} icon={<Layers />} color="#374151" />
        <KPICard label="Active"         value={dash?.batchStats?.active || batches.filter(b => b.status === 'active').length} icon={<CheckCircle />} color="#16a34a" />
        <KPICard label="Quarantined"    value={dash?.batchStats?.quarantined || batches.filter(b => b.status === 'quarantined').length} icon={<XCircle />} color="#dc2626" />
        <KPICard label="Near Expiry"    value={dash?.batchStats?.nearExpiry || 0} icon={<Clock />} color="#d97706" sub="Within 90 days" />
        <KPICard label="Avg Margin"     value={`${dash?.avgMargin || 0}%`} icon={<TrendingUp />} color={M} />
      </div>

      {/* Add Batch Form */}
      {showAdd && (
        <div style={{ background: '#fff', border: `1.5px solid ${M}30`, borderRadius: 14, padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700, margin: 0, fontSize: 14, color: M }}>Create New Batch</h3>
            <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={16} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Product *</label>
              <select value={newBatch.productId} onChange={e => setNewBatch(p => ({ ...p, productId: e.target.value }))} style={inputStyle}>
                <option value="">Select product</option>
                {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>
            {[
              ['Mfg Date', 'manufacturedDate', 'date'],
              ['Expiry Date *', 'expiryDate', 'date'],
              ['Quantity *', 'quantity', 'number'],
              ['Packaging Cost (₹)', 'packagingCost', 'number'],
              ['Labour Cost (₹)', 'labourCost', 'number'],
              ['Shipping Cost (₹)', 'shippingCost', 'number'],
            ].map(([l, k, t]) => (
              <div key={k}>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>{l}</label>
                <input type={t} value={newBatch[k]} onChange={e => setNewBatch(p => ({ ...p, [k]: e.target.value }))} style={inputStyle} min={t === 'number' ? 0 : undefined} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={createBatch} style={{ background: M, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
              Create Batch
            </button>
            <button onClick={() => setShowAdd(false)} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13, color: '#6b7280' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#f3f4f6', borderRadius: 10, padding: 4, width: 'fit-content', marginBottom: 20 }}>
        {tabBtn('overview', 'Overview', Activity)}
        {tabBtn('batches', 'Batch Tracker', Package)}
        {tabBtn('cogs', 'COGS Report', BarChart2)}
        {tabBtn('audit', 'Audit Log', FileText)}
      </div>

      {/* OVERVIEW TAB */}
      {tab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
          {/* Quarantine alert banner */}
          {batches.filter(b => b.status === 'quarantined').length > 0 && (
            <div style={{ gridColumn: '1 / -1', background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 12, padding: '14px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, color: '#dc2626', fontWeight: 800, fontSize: 13 }}>
                <AlertTriangle size={16} />
                {batches.filter(b => b.status === 'quarantined').length} Quarantined Batch(es) — Immediate Review Required
              </div>
              {batches.filter(b => b.status === 'quarantined').map(b => (
                <div key={b._id} style={{ background: '#fff', borderRadius: 8, padding: '10px 14px', marginBottom: 6, border: '1px solid #fecaca', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 12, fontFamily: 'monospace', color: '#dc2626' }}>{b.batchId}</div>
                    <div style={{ fontSize: 12, color: '#4b5563', marginTop: 2 }}>{b.productName}</div>
                    {b.quarantineReason && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{b.quarantineReason}</div>}
                  </div>
                  <button onClick={() => { setSelected(b); setTab('batches'); }} style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    View <ChevronRight size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Reorder Alerts */}
          <SectionCard title="Lead-Time Reorder Alerts" icon={<AlertTriangle />}>
            {(dash?.reorderAlerts || []).length === 0
              ? <EmptyState icon={<CheckCircle />} message="All stock levels healthy" />
              : (dash.reorderAlerts).map(p => (
                <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{p.daysOfStock}d stock · {p.leadTimeDays}d lead time</div>
                  </div>
                  <span style={{ background: '#fef2f2', color: '#dc2626', padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 800 }}>REORDER</span>
                </div>
              ))
            }
          </SectionCard>

          {/* Near Expiry */}
          <SectionCard title="Near-Expiry Stock" icon={<Clock />}
            action={<span style={{ fontSize: 11, color: '#9ca3af' }}>Within 90 days</span>}>
            {(dash?.nearExpiryBatches || []).length === 0
              ? <EmptyState icon={<CheckCircle />} message="No batches expiring within 90 days" />
              : dash.nearExpiryBatches.map(b => (
                <div key={b._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{b.productName}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{b.remainingQuantity} units remaining</div>
                  </div>
                  <span style={{
                    background: b.daysLeft < 30 ? '#fef2f2' : '#fffbeb',
                    color: b.daysLeft < 30 ? '#dc2626' : '#d97706',
                    padding: '3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 800
                  }}>{b.daysLeft}d</span>
                </div>
              ))
            }
          </SectionCard>

          {/* Recent Batches */}
          <SectionCard title="Recent Batches" icon={<Layers />}
            action={<button onClick={() => setTab('batches')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: M, fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>View all <ChevronRight size={12} /></button>}>
            {(dash?.recentBatches || []).slice(0, 5).length === 0
              ? <EmptyState icon={<Package />} message="No batches yet. Create one above." />
              : (dash?.recentBatches || []).slice(0, 5).map(b => (
                <div key={b._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{b.productName}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'monospace', marginTop: 2 }}>{b.batchId}</div>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
              ))
            }
          </SectionCard>

          {/* COGS Summary */}
          <SectionCard title="Financial Summary" icon={<TrendingUp />}
            action={<button onClick={() => setTab('cogs')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: M, fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>Full report <ChevronRight size={12} /></button>}>
            {[
              { label: 'Total COGS', value: fmt(dash?.totalCOGS), color: '#dc2626' },
              { label: 'Revenue Potential', value: fmt(dash?.totalRevPot), color: '#16a34a' },
              { label: 'Avg Profit Margin', value: `${dash?.avgMargin || 0}%`, color: M },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ fontSize: 13, color: '#4b5563' }}>{label}</span>
                <span style={{ fontWeight: 800, fontSize: 14, color }}>{value}</span>
              </div>
            ))}
          </SectionCard>
        </div>
      )}

      {/* BATCH TRACKER TAB */}
      {tab === 'batches' && (
        <div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
              <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                placeholder="Search batch ID or product..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ ...inputStyle, paddingLeft: 30 }}
              />
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['', 'active', 'quarantined', 'recalled', 'expired', 'depleted'].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)} style={{
                  padding: '5px 12px', borderRadius: 999, border: '1px solid',
                  borderColor: statusFilter === s ? M : '#e5e7eb',
                  background: statusFilter === s ? M : '#fff',
                  color: statusFilter === s ? '#fff' : '#374151',
                  fontSize: 11, cursor: 'pointer', fontWeight: 600
                }}>
                  {s || 'All'} ({s ? batches.filter(b => b.status === s).length : batches.length})
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #f0f0f0' }}>
                  {['Batch ID', 'Product', 'Mfg Date', 'Expiry', 'Qty', 'Margin', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#6b7280', fontSize: 11 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                    No batches found. {!batches.length && 'Create your first batch using the "New Batch" button above.'}
                  </td></tr>
                ) : filtered.map(b => (
                  <tr key={b._id} onClick={() => setSelected(b)} style={{ borderTop: '1px solid #f9fafb', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <td style={{ padding: '11px 14px', fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: M }}>{b.batchId}</td>
                    <td style={{ padding: '11px 14px', fontWeight: 600, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.productName}</td>
                    <td style={{ padding: '11px 14px', color: '#6b7280' }}>{b.manufacturedDate ? new Date(b.manufacturedDate).toLocaleDateString('en-IN') : '—'}</td>
                    <td style={{ padding: '11px 14px', color: '#6b7280' }}>{b.expiryDate ? new Date(b.expiryDate).toLocaleDateString('en-IN') : '—'}</td>
                    <td style={{ padding: '11px 14px', fontWeight: 700 }}>{b.remainingQuantity ?? b.quantity ?? '—'}</td>
                    <td style={{ padding: '11px 14px', fontWeight: 800, color: (b.profitMargin || 0) > 50 ? '#16a34a' : '#d97706' }}>{b.profitMargin || 0}%</td>
                    <td style={{ padding: '11px 14px' }}><StatusBadge status={b.status} /></td>
                    <td style={{ padding: '11px 14px' }}>
                      {b.status === 'active' && (
                        <button onClick={e => { e.stopPropagation(); quarantine(b._id, b.batchId); }} style={{
                          background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca',
                          borderRadius: 6, padding: '3px 10px', fontSize: 11, cursor: 'pointer', fontWeight: 600
                        }}>Quarantine</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* COGS REPORT TAB */}
      {tab === 'cogs' && (
        <div>
          {!cogs ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, gap: 10, color: '#9ca3af' }}>
              <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} /> Loading COGS data...
            </div>
          ) : (
            <>
              <div style={{ background: `linear-gradient(135deg, ${M}, ${ML})`, borderRadius: 14, padding: '20px 24px', color: '#fff', marginBottom: 20, display: 'flex', gap: 32, flexWrap: 'wrap' }}>
                {[
                  { label: 'Revenue Potential', value: fmt(cogs.summary?.totalRevenue) },
                  { label: 'Total COGS', value: fmt(cogs.summary?.totalCOGS) },
                  { label: 'Gross Profit', value: fmt(cogs.summary?.totalProfit) },
                  { label: 'Overall Margin', value: `${cogs.summary?.overallMargin || 0}%` },
                ].map(k => (
                  <div key={k.label}>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>{k.label}</div>
                    <div style={{ fontSize: 22, fontWeight: 800 }}>{k.value}</div>
                  </div>
                ))}
              </div>

              {!cogs.report?.length ? (
                <EmptyState icon={<BarChart2 />} message="No batches yet. Create batches to see COGS data." />
              ) : (
                <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, overflow: 'auto', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 900 }}>
                    <thead>
                      <tr style={{ background: '#f9fafb', borderBottom: '1px solid #f0f0f0' }}>
                        {['Product', 'Selling Price', 'Ingredient', 'Packaging', 'Labour', 'Shipping', 'COGS', 'Gross Profit', 'Margin', 'Status'].map(h => (
                          <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#6b7280', fontSize: 11, whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {cogs.report.map((r, i) => (
                        <tr key={i} style={{ borderTop: '1px solid #f9fafb' }}>
                          <td style={{ padding: '10px 12px', fontWeight: 600, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.productName}</td>
                          <td style={{ padding: '10px 12px', fontWeight: 600 }}>{fmt(r.sellingPrice)}</td>
                          <td style={{ padding: '10px 12px', color: '#dc2626' }}>{fmt(r.ingredientCost)}</td>
                          <td style={{ padding: '10px 12px', color: '#d97706' }}>{fmt(r.packagingCost)}</td>
                          <td style={{ padding: '10px 12px', color: '#7c3aed' }}>{fmt(r.labourCost)}</td>
                          <td style={{ padding: '10px 12px', color: '#0891b2' }}>{fmt(r.shippingCost)}</td>
                          <td style={{ padding: '10px 12px', fontWeight: 700 }}>{fmt(r.totalCOGS)}</td>
                          <td style={{ padding: '10px 12px', fontWeight: 700, color: '#16a34a' }}>{fmt(r.grossProfit)}</td>
                          <td style={{ padding: '10px 12px', fontWeight: 800, color: (r.profitMargin || 0) > 50 ? '#16a34a' : '#d97706' }}>{r.profitMargin || 0}%</td>
                          <td style={{ padding: '10px 12px' }}><StatusBadge status={r.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* AUDIT LOG TAB */}
      {tab === 'audit' && (
        <div>
          <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: '10px 16px', marginBottom: 16, fontSize: 12, color: '#9a3412', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <Info size={14} style={{ flexShrink: 0, marginTop: 1 }} />
            Every admin action on health data, financial data, and inventory is logged here automatically — satisfying DPDP Act 2023 audit requirements.
          </div>
          {auditLog.length === 0 ? (
            <EmptyState icon={<FileText />} message="No audit events yet. Logs are created automatically as admins perform actions." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {auditLog.map((log, i) => {
                const rc = RISK[log.riskLevel] || RISK.low;
                const cc = CAT[log.dataCategory] || CAT.operational;
                return (
                  <div key={log._id || i} style={{
                    background: '#fff', border: `1px solid ${log.riskLevel === 'high' || log.riskLevel === 'critical' ? '#fecaca' : '#f3f4f6'}`,
                    borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'flex-start'
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: rc.color, marginTop: 5, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6, marginBottom: 3 }}>
                        <span style={{ fontWeight: 700, fontSize: 12, color: '#1f2937' }}>{log.action?.replace(/_/g, ' ')}</span>
                        <div style={{ display: 'flex', gap: 5 }}>
                          <span style={{ background: rc.bg, color: rc.color, fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 999 }}>{log.riskLevel}</span>
                          <span style={{ background: `${cc.color}15`, color: cc.color, fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 999 }}>{cc.label}</span>
                        </div>
                      </div>
                      <p style={{ fontSize: 12, color: '#4b5563', margin: '0 0 4px', lineHeight: 1.4 }}>{log.description}</p>
                      <div style={{ fontSize: 10, color: '#9ca3af' }}>
                        {log.adminName} · {new Date(log.createdAt).toLocaleString('en-IN')}
                        {log.ipAddress && ` · ${log.ipAddress}`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* BATCH DETAIL PANEL */}
      {selected && (
        <>
          <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 400, background: '#fff', boxShadow: '-4px 0 30px rgba(0,0,0,0.12)', zIndex: 200, overflowY: 'auto' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
              <div>
                <div style={{ fontSize: 10, color: '#9ca3af', fontFamily: 'monospace', marginBottom: 2 }}>{selected.batchId}</div>
                <h2 style={{ fontWeight: 800, fontSize: 15, color: '#1f2937', margin: 0 }}>{selected.productName}</h2>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', display: 'flex' }}>
                <X size={16} color="#6b7280" />
              </button>
            </div>

            <div style={{ padding: '20px 24px' }}>
              <div style={{ marginBottom: 16 }}>
                <StatusBadge status={selected.status} />
              </div>

              {selected.status === 'quarantined' && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
                  <div style={{ fontWeight: 700, color: '#dc2626', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <AlertTriangle size={13} /> Quarantine Reason
                  </div>
                  <div style={{ fontSize: 12, color: '#4b5563', lineHeight: 1.5 }}>{selected.quarantineReason}</div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
                {[
                  ['Units Produced', selected.quantity],
                  ['Remaining', selected.remainingQuantity ?? selected.quantity],
                  ['Selling Price', fmt(selected.sellingPrice)],
                  ['Total COGS', fmt(selected.totalCOGS)],
                  ['Profit Margin', `${selected.profitMargin || 0}%`],
                  ['Ingredient Cost', fmt(selected.ingredientCost)],
                ].map(([l, v]) => (
                  <div key={l} style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 3 }}>{l}</div>
                    <div style={{ fontWeight: 700, color: '#1f2937', fontSize: 14 }}>{v}</div>
                  </div>
                ))}
              </div>

              {(selected.provenance || []).length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <h4 style={{ fontWeight: 700, marginBottom: 10, fontSize: 12, color: '#374151', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Thermometer size={13} color={M} /> Ingredient Provenance
                  </h4>
                  {selected.provenance.map((p, i) => (
                    <div key={i} style={{ background: '#f0fdf4', borderRadius: 8, padding: '10px 12px', marginBottom: 6 }}>
                      <div style={{ fontWeight: 600, fontSize: 12 }}>{p.ingredient}</div>
                      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{p.origin} · {p.supplierName}</div>
                      {(p.certifications || []).length > 0 && (
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
                          {p.certifications.map(c => (
                            <span key={c} style={{ background: '#dcfce7', color: '#15803d', fontSize: 10, padding: '1px 7px', borderRadius: 999, fontWeight: 600 }}>{c}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {(selected.billOfMaterials || []).length > 0 && (
                <div>
                  <h4 style={{ fontWeight: 700, marginBottom: 10, fontSize: 12, color: '#374151', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Layers size={13} color={M} /> Bill of Materials
                  </h4>
                  <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f9fafb' }}>
                        {['Ingredient', 'Qty', 'Cost/Unit'].map(h => (
                          <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 700, color: '#6b7280' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selected.billOfMaterials.map((item, i) => (
                        <tr key={i} style={{ borderTop: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '6px 8px' }}>{item.ingredient}</td>
                          <td style={{ padding: '6px 8px' }}>{item.quantity}{item.unit}</td>
                          <td style={{ padding: '6px 8px', fontWeight: 600 }}>{fmt(item.costPerUnit)}</td>
                          
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
          <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.2)', zIndex: 199 }} />
        </>
      )}
    </div>
  );
}