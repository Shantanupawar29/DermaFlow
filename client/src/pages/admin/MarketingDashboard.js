import { useState } from 'react';

const R = '#7B2D3C';

const CAMPAIGNS = [
  { name: 'Holi Glow Sale',         channel: 'Email + Instagram', status: 'active',   reach: 12400, clicks: 1840, conversions: 312, spend: 18000, revenue: 187200, roi: 940 },
  { name: 'Skin Quiz Launch',        channel: 'Google Ads',        status: 'completed',reach: 38200, clicks: 4210, conversions: 587, spend: 45000, revenue: 342800, roi: 661 },
  { name: 'Dermatologist Collab',    channel: 'YouTube + Reels',   status: 'active',   reach: 89400, clicks: 7120, conversions: 423, spend: 62000, revenue: 254800, roi: 311 },
  { name: 'Newsletter — March Tips', channel: 'Email',             status: 'completed',reach: 4200,  clicks: 987,  conversions: 143, spend: 2200,  revenue: 85800,  roi: 3800 },
  { name: 'Welcome Voucher Flow',    channel: 'Email Automation',  status: 'active',   reach: 1840,  clicks: 1680, conversions: 411, spend: 1200,  revenue: 246600, roi: 20450 },
];

const SEO = [
  { keyword: 'best niacinamide serum india',  rank: 4,  monthly: 8100, intent: 'Transactional' },
  { keyword: 'hyaluronic acid moisturizer',   rank: 7,  monthly: 22000, intent: 'Commercial' },
  { keyword: 'retinol serum for beginners',   rank: 12, monthly: 5400, intent: 'Informational' },
  { keyword: 'dermaflow review',              rank: 2,  monthly: 1200, intent: 'Navigational' },
  { keyword: 'buy vitamin c serum online',    rank: 9,  monthly: 14000, intent: 'Transactional' },
  { keyword: 'hair growth serum india',       rank: 6,  monthly: 9800, intent: 'Transactional' },
];

const CHANNELS = [
  { name: 'Organic Search',  visitors: 12840, pct: 38, color: '#16a34a' },
  { name: 'Direct',          visitors: 8710,  pct: 26, color: '#1d4ed8' },
  { name: 'Email Marketing', visitors: 5340,  pct: 16, color: R },
  { name: 'Social Media',    visitors: 3760,  pct: 11, color: '#d97706' },
  { name: 'Paid Ads',        visitors: 2240,  pct: 7,  color: '#7c3aed' },
  { name: 'Referral',        visitors: 670,   pct: 2,  color: '#0891b2' },
];

const STATUS_COLOR = { active: '#16a34a', completed: '#6b7280', paused: '#d97706' };

export default function MarketingDashboard() {
  const [tab, setTab] = useState('campaigns');

  const tabStyle = (t) => ({
    padding: '0.45rem 1rem', borderRadius: '9999px', border: 'none', cursor: 'pointer',
    fontSize: '0.85rem', fontWeight: 600,
    background: tab === t ? R : 'transparent', color: tab === t ? '#fff' : '#6b7280',
  });

  return (
    <div className="overflow-x-auto">
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1f2937', marginBottom: '0.3rem' }}>Marketing Dashboard</h1>
      <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Campaigns, SEO performance, and traffic channels.</p>

      {/* KPIs */}
      <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Reach',       value: '1.44L',  color: '#1d4ed8' },
          { label: 'Total Conversions', value: '1,876',   color: '#16a34a' },
          { label: 'Email Subscribers', value: '4,218',   color: R },
          { label: 'Avg Campaign ROI',  value: '5,232%',  color: '#7c3aed' },
        ].map(k => (
          <div key={k.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '1rem', padding: '1.25rem', flex: 1, minWidth: 130 }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.2rem' }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.3rem', background: '#f3f4f6', borderRadius: '9999px', padding: '0.3rem', width: 'fit-content', marginBottom: '1.5rem' }}>
        {['campaigns', 'seo', 'channels'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={tabStyle(t)}>
            {t === 'campaigns' ? '📣 Campaigns' : t === 'seo' ? '🔍 SEO' : '📊 Channels'}
          </button>
        ))}
      </div>

      {/* Campaigns */}
      {tab === 'campaigns' && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '1rem', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.835rem' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['Campaign','Channel','Status','Reach','Conversions','Spend','Revenue','ROI'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 0.875rem', textAlign: 'left', fontWeight: 700, color: '#374151', fontSize: '0.8rem' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CAMPAIGNS.map((c, i) => (
                <tr key={i} style={{ borderTop: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '0.75rem 0.875rem', fontWeight: 600 }}>{c.name}</td>
                  <td style={{ padding: '0.75rem 0.875rem', color: '#6b7280' }}>{c.channel}</td>
                  <td style={{ padding: '0.75rem 0.875rem' }}>
                    <span style={{ background: (STATUS_COLOR[c.status] || '#6b7280') + '15', color: STATUS_COLOR[c.status] || '#6b7280', fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '999px', textTransform: 'capitalize' }}>{c.status}</span>
                  </td>
                  <td style={{ padding: '0.75rem 0.875rem' }}>{c.reach.toLocaleString()}</td>
                  <td style={{ padding: '0.75rem 0.875rem', color: '#16a34a', fontWeight: 600 }}>{c.conversions}</td>
                  <td style={{ padding: '0.75rem 0.875rem' }}>₹{(c.spend/100).toLocaleString()}</td>
                  <td style={{ padding: '0.75rem 0.875rem', fontWeight: 700, color: R }}>₹{(c.revenue/100).toLocaleString()}</td>
                  <td style={{ padding: '0.75rem 0.875rem' }}>
                    <span style={{ color: c.roi > 500 ? '#16a34a' : '#d97706', fontWeight: 800 }}>{c.roi.toLocaleString()}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SEO */}
      {tab === 'seo' && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '1rem', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.835rem' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['Keyword','Rank','Monthly Searches','Intent','Status'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 700, color: '#374151', fontSize: '0.8rem' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SEO.map((s, i) => (
                <tr key={i} style={{ borderTop: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>{s.keyword}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ fontWeight: 800, color: s.rank <= 5 ? '#16a34a' : s.rank <= 10 ? '#d97706' : '#dc2626', fontSize: '1rem' }}>#{s.rank}</span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: '#6b7280' }}>{s.monthly.toLocaleString()}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ background: '#f3f4f6', fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '999px', fontWeight: 500 }}>{s.intent}</span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ color: s.rank <= 5 ? '#16a34a' : '#d97706', fontWeight: 600, fontSize: '0.8rem' }}>
                      {s.rank <= 5 ? '✅ Top 5' : s.rank <= 10 ? '⚡ Top 10' : '📈 Improving'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Channels */}
      {tab === 'channels' && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '1rem', padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', fontSize: '0.95rem' }}>Traffic Sources (Last 30 Days)</h3>
          {CHANNELS.map(c => (
            <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.875rem' }}>
              <span style={{ width: 140, fontSize: '0.85rem', color: '#374151', fontWeight: 500 }}>{c.name}</span>
              <div style={{ flex: 1, background: '#f3f4f6', borderRadius: '999px', height: 12, overflow: 'hidden' }}>
                <div style={{ height: 12, background: c.color, width: `${c.pct}%`, borderRadius: '999px' }} />
              </div>
              <span style={{ width: 60, textAlign: 'right', fontWeight: 700, color: c.color }}>{c.pct}%</span>
              <span style={{ width: 60, textAlign: 'right', fontSize: '0.8rem', color: '#6b7280' }}>{c.visitors.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}