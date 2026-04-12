import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, TrendingUp, AlertTriangle, Search, RefreshCw,
  BarChart3, MessageSquare, Star, Award, Heart,
  ChevronRight, UserCheck, Filter, Download,
  ArrowUpRight, Layers, Activity, Clock, Zap
} from 'lucide-react';
import api from '../../services/api';

const M = '#4A0E2E';
const fmt = v => '₹' + (v || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

const TIER_STYLE = {
  bronze:   { bg: '#fef3c7', color: '#d97706', border: '#fde68a' },
  silver:   { bg: '#f1f5f9', color: '#64748b', border: '#cbd5e1' },
  gold:     { bg: '#fefce8', color: '#b45309', border: '#fde047' },
  platinum: { bg: '#ede9fe', color: '#7c3aed', border: '#c4b5fd' },
};

function KPICard({ label, value, sub, color, icon, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14,
      padding: '18px 20px', flex: 1, minWidth: 130,
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'box-shadow 0.15s',
    }}
      onMouseEnter={e => onClick && (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)')}
      onMouseLeave={e => onClick && (e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)')}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ background: color ? `${color}18` : '#f3f4f6', borderRadius: 9, padding: 7 }}>
          {React.cloneElement(icon, { size: 16, color: color || '#6b7280' })}
        </div>
        {onClick && <ArrowUpRight size={14} color="#d1d5db" />}
      </div>
      <div style={{ fontSize: 24, fontWeight: 800, color: color || '#1f2937', lineHeight: 1, marginBottom: 3 }}>{value}</div>
      <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: '#d97706', marginTop: 3, fontWeight: 600 }}>{sub}</div>}
    </div>
  );
}

function TierBadge({ tier }) {
  const s = TIER_STYLE[tier] || TIER_STYLE.bronze;
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, padding: '2px 9px', borderRadius: 999, fontSize: 11, fontWeight: 700, textTransform: 'capitalize' }}>{tier || 'bronze'}</span>
  );
}

function BarRow({ label, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
        <span style={{ fontWeight: 500, textTransform: 'capitalize', color: '#374151' }}>{label || 'Unknown'}</span>
        <span style={{ fontWeight: 700, color }}>{count} <span style={{ color: '#9ca3af', fontWeight: 400 }}>({pct}%)</span></span>
      </div>
      <div style={{ background: '#f3f4f6', borderRadius: 999, height: 7, overflow: 'hidden' }}>
        <div style={{ height: 7, background: color, width: `${pct}%`, borderRadius: 999, transition: 'width 0.7s ease' }} />
      </div>
    </div>
  );
}

const inputStyle = {
  border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px',
  fontSize: 13, width: '100%', boxSizing: 'border-box',
  fontFamily: 'system-ui,sans-serif', background: '#fafafa', color: '#1f2937', outline: 'none'
};

export default function CRMDashboard() {
  const [tab, setTab] = useState('overview');
  const [summary, setSummary] = useState(null);
  const [clv, setClv] = useState([]);
  const [fbAnalysis, setFbAnalysis] = useState(null);
  const [segResult, setSegResult] = useState(null);
  const [vibe, setVibe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [vibeLoading, setVibeLoading] = useState(false);

  const [segForm, setSegForm] = useState({
    skinType: '', notBoughtSku: '', notBoughtDays: 60, minOrders: '', tier: '',
  });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, cRes, fRes] = await Promise.allSettled([
        api.get('/crm/summary'),
        api.get('/crm/customer-lifetime'),
        api.get('/crm/feedback-analysis'),
      ]);
      if (sRes.status === 'fulfilled') setSummary(sRes.value.data);
      if (cRes.status === 'fulfilled') setClv(cRes.value.data);
      if (fRes.status === 'fulfilled') setFbAnalysis(fRes.value.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const runSegmentFilter = async () => {
    setFiltering(true); setSegResult(null);
    try {
      const body = {};
      if (segForm.skinType) body.skinType = segForm.skinType;
      if (segForm.tier) body.tier = segForm.tier;
      if (segForm.minOrders) body.minOrders = Number(segForm.minOrders);
      if (segForm.notBoughtSku) body.notBoughtSkuInDays = { sku: segForm.notBoughtSku, days: Number(segForm.notBoughtDays) };
      const r = await api.post('/crm/segment-filter', body);
      setSegResult(r.data);
    } catch (e) { alert('Filter failed: ' + (e.response?.data?.message || e.message)); }
    setFiltering(false);
  };

  const runVibe = async () => {
    setVibeLoading(true);
    try {
      const r = await api.get('/admin/sentiment-vibe');
      setVibe(r.data);
    } catch (e) { alert('Analysis failed'); }
    setVibeLoading(false);
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, gap: 10, color: '#9ca3af' }}>
      <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
      <span style={{ fontSize: 14 }}>Loading CRM data...</span>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const total = summary?.totalCustomers || 0;

  return (
    <div style={{ fontFamily: 'system-ui,sans-serif', color: '#1f2937' }}>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: M, margin: 0 }}>Customer Relationship Management</h1>
          <p style={{ color: '#9ca3af', fontSize: 12, marginTop: 4, marginBottom: 0 }}>Live customer data · Segmentation · Feedback · Lifetime value</p>
        </div>
        <button onClick={fetchAll} style={{ background: '#f3f4f6', border: 'none', borderRadius: 9, padding: '8px 12px', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        <KPICard label="Total Customers" value={total} icon={<Users />} color={M} />
        <KPICard label="At-Risk" value={summary?.atRisk || 0} sub="No order in 60+ days" icon={<AlertTriangle />} color="#dc2626"
          onClick={() => { setTab('segments'); setSegForm(f => ({ ...f, minOrders: '1' })); }} />
        <KPICard label="Reviews" value={summary?.feedbackCount || 0} icon={<MessageSquare />} color="#1d4ed8"
          onClick={() => setTab('feedback')} />
        <KPICard label="Avg Order Value" value={fmt(summary?.avgOrderValue)} icon={<TrendingUp />} color="#047857" />
        <KPICard label="Loyalty Members" value={(summary?.tierCounts || []).reduce((s, t) => s + t.count, 0)} icon={<Award />} color="#d97706" />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#f3f4f6', borderRadius: 10, padding: 4, width: 'fit-content', marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { k: 'overview', l: 'Overview', I: Activity },
          { k: 'segments', l: 'Segment Filter', I: Filter },
          { k: 'lifetime', l: 'Top Customers', I: Star },
          { k: 'feedback', l: 'Feedback', I: MessageSquare },
          { k: 'vibe', l: 'Sentiment', I: BarChart3 },
        ].map(({ k, l, I }) => (
          <button key={k} onClick={() => setTab(k)} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontSize: 12, fontWeight: 600,
            background: tab === k ? M : 'transparent',
            color: tab === k ? '#fff' : '#6b7280', transition: 'all 0.15s'
          }}><I size={13} />{l}</button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>

          {/* Tier breakdown */}
          <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 700, fontSize: 13, marginBottom: 16, color: '#1f2937' }}>
              <Award size={15} color={M} /> Loyalty Tier Breakdown
            </div>
            {(summary?.tierCounts || []).length === 0
              ? <p style={{ color: '#9ca3af', fontSize: 13 }}>No customer data yet. Users populate this by signing up and placing orders.</p>
              : (summary.tierCounts || []).map(t => {
                const s = TIER_STYLE[t._id] || { bg: '#f3f4f6', color: '#6b7280', border: '#e5e7eb' };
                return (
                  <div key={t._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f9fafb' }}>
                    <TierBadge tier={t._id} />
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: 14 }}>{t.count}</div>
                      <div style={{ fontSize: 10, color: '#9ca3af' }}>{total > 0 ? Math.round((t.count / total) * 100) : 0}%</div>
                    </div>
                  </div>
                );
              })
            }
          </div>

          {/* Skin type distribution */}
          <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 700, fontSize: 13, marginBottom: 6, color: '#1f2937' }}>
              <Layers size={15} color={M} /> Skin Type Distribution
            </div>
            <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 14, lineHeight: 1.5 }}>
              Populated from quiz completions. Use to target campaigns.
            </p>
            {(summary?.skinTypeCounts || []).length === 0
              ? <p style={{ color: '#9ca3af', fontSize: 13 }}>No quiz data yet. Customers must complete the skin quiz to appear here.</p>
              : (summary.skinTypeCounts || []).map((s, i) => (
                <BarRow key={s._id} label={s._id} count={s.count} total={total}
                  color={[M, '#1d4ed8', '#16a34a', '#d97706', '#7c3aed'][i % 5]} />
              ))
            }
          </div>

          {/* At-risk */}
          <div style={{
            background: (summary?.atRisk || 0) > 0 ? '#fef2f2' : '#f0fdf4',
            border: `1px solid ${(summary?.atRisk || 0) > 0 ? '#fca5a5' : '#86efac'}`,
            borderRadius: 14, padding: '20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 700, fontSize: 13, marginBottom: 8, color: (summary?.atRisk || 0) > 0 ? '#dc2626' : '#15803d' }}>
              <AlertTriangle size={15} /> At-Risk Customers
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: (summary?.atRisk || 0) > 0 ? '#dc2626' : '#15803d', marginBottom: 8 }}>
              {summary?.atRisk || 0}
            </div>
            <p style={{ fontSize: 12, color: '#4b5563', lineHeight: 1.6, margin: '0 0 12px' }}>
              Customers who placed at least 1 order but have not returned in 60+ days. Use Segment Filter to target them with a re-engagement campaign.
            </p>
            <button onClick={() => { setTab('segments'); setSegForm(f => ({ ...f, minOrders: '1' })); }}
              style={{ background: M, color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Filter size={12} /> Filter these customers
            </button>
          </div>

          {/* CRM pipeline */}
          <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 700, fontSize: 13, marginBottom: 14, color: '#1f2937' }}>
              <Zap size={15} color={M} /> CRM Action Pipeline
            </div>
            {[
              { trigger: 'Oily skin + no BHA in 60 days', action: 'Auto-send targeted BHA campaign', tag: 'Re-engagement' },
              { trigger: 'Review rated 2 stars or below', action: 'Flagged in Feedback, admin notified', tag: 'Quality control' },
              { trigger: 'Quiz completed', action: 'User added to skin-type segment', tag: 'Targeting' },
              { trigger: 'Customer hits Silver tier', action: 'Loyalty email: unlock benefits', tag: 'Retention' },
              { trigger: 'Batch quarantined by ERP', action: 'Flag customers who received that batch', tag: 'Safety' },
            ].map((a, i) => (
              <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid #f9fafb', fontSize: 12 }}>
                <div style={{ fontWeight: 600, color: '#1f2937', marginBottom: 2 }}>{a.trigger}</div>
                <div style={{ color: '#6b7280', marginBottom: 4 }}>{a.action}</div>
                <span style={{ background: `${M}12`, color: M, fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 999 }}>{a.tag}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SEGMENT FILTER ── */}
      {tab === 'segments' && (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20, alignItems: 'start' }}>
          <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, color: '#1f2937', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Filter size={14} color={M} /> Segment Filter
            </div>
            <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 16, lineHeight: 1.6 }}>
              Query the live customer database. Example: "Oily skin users who haven't bought the BHA Cleanser in 60 days."
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Skin Type', key: 'skinType', type: 'select', options: ['', 'Oily', 'Dry', 'Combination', 'Normal', 'Sensitive'] },
                { label: 'Loyalty Tier', key: 'tier', type: 'select', options: ['', 'bronze', 'silver', 'gold', 'platinum'] },
              ].map(({ label, key, options }) => (
                <div key={key}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>{label}</label>
                  <select value={segForm[key]} onChange={e => setSegForm(f => ({ ...f, [key]: e.target.value }))} style={inputStyle}>
                    {options.map(o => <option key={o} value={o}>{o || `All ${label.toLowerCase()}s`}</option>)}
                  </select>
                </div>
              ))}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Has not bought SKU</label>
                <input placeholder="e.g. SKIN-SAL-004" value={segForm.notBoughtSku}
                  onChange={e => setSegForm(f => ({ ...f, notBoughtSku: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>In the last (days)</label>
                <input type="number" value={segForm.notBoughtDays}
                  onChange={e => setSegForm(f => ({ ...f, notBoughtDays: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Min order count</label>
                <input type="number" placeholder="e.g. 1" value={segForm.minOrders}
                  onChange={e => setSegForm(f => ({ ...f, minOrders: e.target.value }))} style={inputStyle} />
              </div>
              <button onClick={runSegmentFilter} disabled={filtering} style={{
                background: filtering ? '#9ca3af' : M, color: '#fff', border: 'none',
                borderRadius: 8, padding: '9px', fontWeight: 700, cursor: 'pointer', fontSize: 13,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
              }}>
                {filtering
                  ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Querying...</>
                  : <><Search size={14} /> Run Filter</>}
              </button>
            </div>
          </div>

          <div>
            {!segResult ? (
              <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, padding: '60px 20px', textAlign: 'center', color: '#9ca3af' }}>
                <Search size={32} color="#e5e7eb" style={{ margin: '0 auto 12px', display: 'block' }} />
                <p style={{ fontSize: 13 }}>Configure filters and click Run Filter to query the live customer database.</p>
              </div>
            ) : (
              <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#1f2937' }}>
                    {segResult.count} customer{segResult.count !== 1 ? 's' : ''} match your filters
                  </div>
                  <button style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: 7, padding: '6px 14px', cursor: 'pointer', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Download size={12} /> Export CSV
                  </button>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: '#f9fafb' }}>
                      {['Customer', 'Skin Type', 'Orders', 'Total Spent', 'Glow Pts', 'Tier', 'Last Login'].map(h => (
                        <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontWeight: 700, color: '#6b7280', fontSize: 11 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {segResult.users.length === 0
                      ? <tr><td colSpan={7} style={{ padding: '30px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No customers match these criteria.</td></tr>
                      : segResult.users.map(u => (
                        <tr key={u._id} style={{ borderTop: '1px solid #f9fafb' }}>
                          <td style={{ padding: '10px 14px' }}>
                            <div style={{ fontWeight: 600 }}>{u.name}</div>
                            <div style={{ fontSize: 10, color: '#9ca3af' }}>{u.email}</div>
                          </td>
                          <td style={{ padding: '10px 14px', color: '#6b7280' }}>{u.skinType || '—'}</td>
                          <td style={{ padding: '10px 14px', fontWeight: 700, textAlign: 'center' }}>{u.orderCount}</td>
                          <td style={{ padding: '10px 14px', fontWeight: 700 }}>{fmt(u.totalSpent)}</td>
                          <td style={{ padding: '10px 14px', textAlign: 'center' }}>{u.glowPoints}</td>
                          <td style={{ padding: '10px 14px' }}><TierBadge tier={u.tier} /></td>
                          <td style={{ padding: '10px 14px', color: '#9ca3af', fontSize: 11 }}>
                            {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('en-IN') : 'Never'}
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TOP CUSTOMERS ── */}
      {tab === 'lifetime' && (
        <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #f3f4f6' }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#1f2937', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Star size={14} color={M} /> Top Customers by Lifetime Value
            </div>
            <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 3, marginBottom: 0 }}>
              Sorted by total spend. Est. LTV = actual spend × 1.4 (repeat-purchase multiplier).
            </p>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['#', 'Customer', 'Skin Type', 'Orders', 'Total Spent', 'Est. LTV', 'Glow Pts', 'Tier'].map(h => (
                  <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontWeight: 700, color: '#6b7280', fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clv.length === 0
                ? <tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No customers with orders yet. Data appears here once users place orders.</td></tr>
                : clv.map((u, i) => (
                  <tr key={u._id} style={{ borderTop: '1px solid #f9fafb', background: i < 3 ? `${M}04` : '#fff' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 800, color: i < 3 ? M : '#9ca3af' }}>{i + 1}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontWeight: 600 }}>{u.name}</div>
                      <div style={{ fontSize: 10, color: '#9ca3af' }}>{u.email}</div>
                    </td>
                    <td style={{ padding: '10px 14px', color: '#6b7280' }}>{u.skinType || '—'}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700, textAlign: 'center' }}>{u.orderCount}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700 }}>{fmt(u.totalSpent)}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#047857' }}>{fmt(u.ltv)}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>{u.glowPoints}</td>
                    <td style={{ padding: '10px 14px' }}><TierBadge tier={u.tier} /></td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      )}

      {/* ── FEEDBACK ── */}
      {tab === 'feedback' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {!fbAnalysis ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
              <RefreshCw size={24} style={{ margin: '0 auto 10px', display: 'block', animation: 'spin 1s linear infinite' }} />
              Loading feedback analysis...
            </div>
          ) : (
            <>
              <div style={{ gridColumn: '1/-1', background: fbAnalysis.positivePercent >= 60 ? '#f0fdf4' : '#fef2f2', border: `1px solid ${fbAnalysis.positivePercent >= 60 ? '#86efac' : '#fca5a5'}`, borderRadius: 14, padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Overall Sentiment</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#1f2937' }}>{fbAnalysis.vibe}</div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3 }}>
                      Based on {fbAnalysis.total} reviews · Avg rating: {fbAnalysis.avgRating}/5
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 24 }}>
                    {[
                      { label: 'Positive', value: fbAnalysis.distribution?.positive || 0, color: '#16a34a' },
                      { label: 'Neutral', value: fbAnalysis.distribution?.neutral || 0, color: '#6b7280' },
                      { label: 'Negative', value: fbAnalysis.distribution?.negative || 0, color: '#dc2626' },
                    ].map(s => (
                      <div key={s.label} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: 10, color: '#9ca3af' }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 14, color: '#1f2937' }}>Detected Keywords</div>
                {(fbAnalysis.topKeywords || []).length === 0
                  ? <p style={{ color: '#9ca3af', fontSize: 13 }}>No keywords detected yet. Keywords appear once reviews are submitted.</p>
                  : <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {fbAnalysis.topKeywords.map(k => (
                      <span key={k.word} style={{ background: '#fef3c7', color: '#92400e', padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>
                        {k.word} ({k.count})
                      </span>
                    ))}
                  </div>
                }
              </div>

              <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 14, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertTriangle size={14} /> Low-Rated Reviews
                </div>
                {(fbAnalysis.recentFlagged || []).length === 0
                  ? <p style={{ color: '#9ca3af', fontSize: 13 }}>No low-rated reviews.</p>
                  : fbAnalysis.recentFlagged.map(f => (
                    <div key={f._id} style={{ background: '#fef2f2', borderRadius: 8, padding: '10px 12px', marginBottom: 8, border: '1px solid #fecaca' }}>
                      <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 3 }}>{f.name} · {f.rating}/5</div>
                      <div style={{ fontSize: 12, color: '#4b5563', lineHeight: 1.5 }}>{(f.message || '').slice(0, 120)}...</div>
                    </div>
                  ))
                }
              </div>
            </>
          )}
        </div>
      )}

      {/* ── SENTIMENT VIBE ── */}
      {tab === 'vibe' && (
        <div>
          <div style={{ background: '#ede9fe', border: '1px solid #c4b5fd', borderRadius: 12, padding: '12px 16px', marginBottom: 16, fontSize: 12, color: '#5b21b6', lineHeight: 1.6, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <BarChart3 size={14} style={{ flexShrink: 0, marginTop: 1 }} />
            NLP analysis of all customer reviews — get a single summary of overall sentiment, top positive and negative themes, without reading reviews manually.
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <button onClick={runVibe} disabled={vibeLoading} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: vibeLoading ? '#9ca3af' : '#7c3aed', color: '#fff',
              border: 'none', borderRadius: 8, padding: '8px 18px', cursor: 'pointer', fontWeight: 700, fontSize: 13
            }}>
              <BarChart3 size={15} style={{ animation: vibeLoading ? 'spin 1s linear infinite' : 'none' }} />
              {vibeLoading ? 'Analysing...' : 'Run Sentiment Analysis'}
            </button>
          </div>

          {!vibe && !vibeLoading && (
            <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: 14, border: '1px solid #f0f0f0', color: '#9ca3af' }}>
              <BarChart3 size={32} color="#e5e7eb" style={{ margin: '0 auto 10px', display: 'block' }} />
              <p style={{ fontSize: 13 }}>Click "Run Sentiment Analysis" to analyse all reviews in the database.</p>
            </div>
          )}

          {vibe && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{
                background: vibe.requiresAction ? '#fff7ed' : '#f0fdf4',
                border: `1.5px solid ${vibe.requiresAction ? '#fed7aa' : '#86efac'}`,
                borderRadius: 14, padding: '18px 20px'
              }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#1f2937', marginBottom: 10 }}>{vibe.vibe}</div>
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  {[
                    { label: 'Positive', value: vibe.distribution?.positive || 0, color: '#16a34a' },
                    { label: 'Neutral', value: vibe.distribution?.neutral || 0, color: '#6b7280' },
                    { label: 'Negative', value: vibe.distribution?.negative || 0, color: '#dc2626' },
                    { label: 'Quality Alerts', value: vibe.alertCount, color: '#d97706' },
                  ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 800, color: s.color, fontSize: 20 }}>{s.value}</div>
                      <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                {vibe.requiresAction && (
                  <div style={{ marginTop: 12, background: '#fef2f2', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#dc2626', fontWeight: 600 }}>
                    Action required — {vibe.alertCount} quality-alert reviews detected. Check ERP batch quality.
                  </div>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { title: 'Top Positive Themes', data: vibe.positiveThemes, color: '#16a34a', bg: '#f0fdf4' },
                  { title: 'Negative / Alert Themes', data: vibe.negativeThemes, color: '#dc2626', bg: '#fef2f2' },
                ].map(({ title, data, color, bg }) => (
                  <div key={title} style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                    <div style={{ fontWeight: 700, color, fontSize: 13, marginBottom: 12 }}>{title}</div>
                    {!data?.length
                      ? <p style={{ color: '#9ca3af', fontSize: 13 }}>None detected.</p>
                      : data.map(t => (
                        <div key={t.word || t} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f9fafb', fontSize: 12 }}>
                          <span style={{ textTransform: 'capitalize' }}>{t.word || t}</span>
                          <span style={{ background: bg, color, padding: '1px 7px', borderRadius: 999, fontSize: 10, fontWeight: 700 }}>{t.count || '+'}</span>
                        </div>
                      ))
                    }
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}