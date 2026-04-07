import { useEffect, useState } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const tok = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
const R   = '#7B2D3C';

// ── Hardcoded revenue stream data (as required by assignment) ─────────────────
// Real data comes from the analytics API below. These are the DEFINED revenue models.

const REVENUE_MODELS = [
  {
    model: 'Sales Revenue Model',
    emoji: '🛍️',
    color: '#7B2D3C',
    description: 'Direct product sales — skincare & haircare products at full price. Primary revenue driver.',
    streams: [
      { name: 'Skincare Products',  value: 1847520, pct: 52 },
      { name: 'Haircare Products',  value: 921600,  pct: 26 },
      { name: 'Combo Kits / Bundles',value: 284400, pct: 8  },
    ],
    total: 3053520,
    applicable: true,
  },
  {
    model: 'Subscription Revenue Model',
    emoji: '🔄',
    color: '#1d4ed8',
    description: 'Monthly auto-delivery subscriptions at 10% discount. Provides predictable recurring revenue.',
    streams: [
      { name: 'Monthly Skincare Routine Box', value: 389700, pct: 11 },
      { name: 'Haircare Monthly Plan',        value: 177600, pct: 5  },
    ],
    total: 567300,
    applicable: true,
  },
  {
    model: 'Affiliate Revenue Model',
    emoji: '🤝',
    color: '#047857',
    description: 'Commission from partnered dermatologists & beauty influencers who drive sales through referral codes.',
    streams: [
      { name: 'Dermatologist Partner Referrals', value: 89400,  pct: 2.5 },
      { name: 'Influencer Affiliate Codes',      value: 71520,  pct: 2   },
      { name: 'Brand Ambassador Programme',      value: 53600,  pct: 1.5 },
    ],
    total: 214520,
    applicable: true,
  },
  {
    model: 'Transaction Fee Revenue Model',
    emoji: '💳',
    color: '#7c3aed',
    description: 'NOT currently applicable — DermaFlow is a direct-to-consumer brand, not a marketplace. Would apply if we added a seller marketplace feature.',
    streams: [],
    total: 0,
    applicable: false,
  },
  {
    model: 'Advertising Revenue Model',
    emoji: '📢',
    color: '#d97706',
    description: 'NOT currently applicable — DermaFlow does not show third-party ads to users. Ads would harm the premium brand experience. May consider sponsored dermatologist content in future.',
    streams: [],
    total: 0,
    applicable: false,
  },
];

const TOTAL_ANNUAL  = 3835340;
const MONTHLY_DATA  = [
  { month: 'Oct', revenue: 287600, orders: 124, subs: 18 },
  { month: 'Nov', revenue: 312400, orders: 138, subs: 24 },
  { month: 'Dec', revenue: 398200, orders: 187, subs: 31 },
  { month: 'Jan', revenue: 356100, orders: 162, subs: 38 },
  { month: 'Feb', revenue: 334800, orders: 149, subs: 42 },
  { month: 'Mar', revenue: 378240, orders: 171, subs: 47 },
];

function fmt(v) { return '₹' + (v / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 }); }
function fmtK(v) { return v >= 100000 ? '₹' + (v/100000).toFixed(1) + 'L' : fmt(v); }

export default function RevenueDashboard() {
  const [liveData, setLiveData] = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    axios.get(`${API}/analytics/sales?period=30`, tok())
      .then(r => setLiveData(r.data))
      .catch(() => setLiveData(null))
      .finally(() => setLoading(false));
  }, []);

  const maxMonthly = Math.max(...MONTHLY_DATA.map(m => m.revenue));

  return (
    <div className="overflow-x-auto">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1f2937', margin: 0 }}>Revenue Dashboard</h1>
        <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.3rem' }}>
          Revenue model analysis — all 5 e-business revenue types evaluated against DermaFlow.
        </p>
      </div>

      {/* ── Live KPIs ── */}
      {liveData && (
        <div style={{ background: 'linear-gradient(135deg,#7B2D3C,#4A0E2E)', borderRadius: '1.25rem', padding: '1.5rem', marginBottom: '1.5rem', color: '#fff', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)' }}>Revenue (30 days)</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{fmtK(liveData.totalRevenue || 0)}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)' }}>Orders</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{liveData.totalOrders || 0}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)' }}>Avg Order Value</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{fmtK(liveData.avgOrderValue || 0)}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)' }}>Annual Target</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{fmtK(TOTAL_ANNUAL)}</div>
          </div>
        </div>
      )}

      {/* ── Revenue Model Cards ── */}
      <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#374151', marginBottom: '1rem' }}>
        Revenue Model Evaluation (All 5 Types)
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        {REVENUE_MODELS.map(m => (
          <div key={m.model} style={{ background: '#fff', border: `1px solid ${m.applicable ? m.color + '30' : '#e5e7eb'}`, borderRadius: '1rem', padding: '1.25rem', opacity: m.applicable ? 1 : 0.7 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: '0.75rem', background: m.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>{m.emoji}</div>
                <div>
                  <h3 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1f2937', margin: 0 }}>{m.model}</h3>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '999px', background: m.applicable ? '#dcfce7' : '#f3f4f6', color: m.applicable ? '#15803d' : '#6b7280' }}>
                    {m.applicable ? '✅ APPLICABLE' : '❌ NOT APPLICABLE'}
                  </span>
                </div>
              </div>
              {m.applicable && m.total > 0 && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: m.color }}>{fmtK(m.total)}</div>
                  <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>Annual est.</div>
                </div>
              )}
            </div>
            <p style={{ fontSize: '0.85rem', color: '#4b5563', margin: '0 0 0.75rem', lineHeight: 1.5 }}>{m.description}</p>
            {m.streams.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {m.streams.map(s => (
                  <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#374151', minWidth: 220 }}>{s.name}</span>
                    <div style={{ flex: 1, background: '#f3f4f6', borderRadius: '999px', height: 8, overflow: 'hidden' }}>
                      <div style={{ height: 8, background: m.color, width: `${s.pct}%`, borderRadius: '999px' }} />
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: m.color, minWidth: 60, textAlign: 'right' }}>{fmtK(s.value)}</span>
                    <span style={{ fontSize: '0.72rem', color: '#9ca3af', minWidth: 30 }}>{s.pct}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Monthly revenue chart ── */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '1rem', padding: '1.5rem' }}>
        <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#374151', marginBottom: '1.25rem' }}>📅 Monthly Revenue (Last 6 Months)</h2>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', height: 180 }}>
          {MONTHLY_DATA.map(m => (
            <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: R }}>₹{(m.revenue/100000).toFixed(1)}L</span>
              <div style={{ width: '100%', background: '#f3f4f6', borderRadius: '0.5rem 0.5rem 0 0', display: 'flex', alignItems: 'flex-end' }}>
                <div style={{ width: '100%', background: `linear-gradient(to top,${R},#a83254)`, borderRadius: '0.5rem 0.5rem 0 0', height: `${(m.revenue / maxMonthly) * 150}px`, transition: 'height 0.5s ease' }} />
              </div>
              <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>{m.month}</span>
              <span style={{ fontSize: '0.68rem', color: '#9ca3af' }}>{m.orders} orders</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}