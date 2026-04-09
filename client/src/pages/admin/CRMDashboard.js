// client/src/pages/admin/CRMDashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api';
const tok = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
const R   = '#4A0E2E';

// ── Demo segment data (shown when API is empty) ───────────────────────────────
const DEMO_SEGMENTS = [
  { _id: 'oily_skin',    count: 312 },
  { _id: 'dry_skin',     count: 241 },
  { _id: 'combination',  count: 198 },
  { _id: 'acne',         count: 287 },
  { _id: 'anti_aging',   count: 156 },
  { _id: 'brightening',  count: 134 },
];

const DEMO_ACTIONS = [
  { issue: 'Oily skin users not buying BHA Cleanser (2+ months)', users: 87, action: 'Flash email: "Your skin type needs this — 15% off BHA Cleanser this week"', roi: '₹34,800 recovered revenue', status: 'sent' },
  { issue: 'Dry skin users approaching subscription renewal',     users: 43, action: 'CRM auto-triggered Day 25 replenishment invoice for Hyaluronic Moisturiser', roi: '43 subscription renewals', status: 'sent' },
  { issue: 'Users at Day 7 of Retinol journey showing purge',     users: 28, action: 'Check-in email: "Purging is normal — keep going!" with dermatologist note', roi: '94% retention rate', status: 'sent' },
  { issue: '10+ bottle recyclers eligible for Emerald tier',       users: 14, action: 'Green Tier unlock + 5% permanent eco-discount applied to account', roi: 'Brand loyalty uplift', status: 'active' },
];

const CHECK_IN_TEMPLATES = [
  { day: 1,  subject: '✨ Your Skin Journey Starts Today!', preview: 'How to apply your AM & PM routine for best results. Start Retinol every 3rd night...', status: 'automated' },
  { day: 7,  subject: '🌿 Week 1 — Purging is Normal!',    preview: 'You might notice breakouts or peeling. Completely normal — your skin is adjusting. Keep going!', status: 'automated' },
  { day: 28, subject: '📸 28-Day Progress Photo Time!',     preview: 'Congratulations on 4 weeks! Take your progress photo and compare. Share #DermaFlowGlow!', status: 'automated' },
];

const GREEN_TIERS = [
  { name: 'Bronze',  bottles: 0,  discount: 0,  desc: 'Starting tier',                color: '#d97706', users: 1248 },
  { name: 'Silver',  bottles: 5,  discount: 2,  desc: 'Recycle 5 bottles → 2% off',  color: '#64748b', users: 342 },
  { name: 'Emerald', bottles: 10, discount: 5,  desc: 'Recycle 10 → permanent 5% off',color: '#16a34a', users: 87 },
  { name: 'Diamond', bottles: 25, discount: 10, desc: 'Recycle 25 → 10% off + freebies',color: '#7c3aed', users: 14 },
];

export default function CRMDashboard() {
  const [tab,       setTab]      = useState('journey');
  const [summary,   setSummary]  = useState(null);
  const [segments,  setSegments] = useState(DEMO_SEGMENTS);
  const [filterForm,setFilterForm] = useState({ skinType: '', excludeProductSku: '', notOrderedInDays: 60 });
  const [filterResult,setFilterResult] = useState(null);
  const [filtering, setFiltering] = useState(false);
  const [sendingCheckins, setSendingCheckins] = useState(false);

  useEffect(() => {
    axios.get(`${API}/crm/summary`,   tok()).then(r => setSummary(r.data)).catch(()=>{});
    axios.get(`${API}/crm/segments`,  tok()).then(r => { if(r.data?.segmentCounts?.length) setSegments(r.data.segmentCounts); }).catch(()=>{});
  }, []);

  const runSegmentFilter = async () => {
    setFiltering(true);
    setFilterResult(null);
    try {
      const res = await axios.post(`${API}/crm/segments/filter`, filterForm, tok());
      setFilterResult(res.data);
    } catch (e) {
      // Demo mode
      setFilterResult({
        count: 87,
        users: [
          { name: 'Priya Sharma',  email: 'priya@example.com', skinType: filterForm.skinType || 'Oily', glowPoints: 240, tier: 'silver', orderCount: 3 },
          { name: 'Rahul Mehta',   email: 'rahul@example.com', skinType: filterForm.skinType || 'Oily', glowPoints: 180, tier: 'bronze', orderCount: 1 },
          { name: 'Ananya Kumar',  email: 'ananya@example.com',skinType: filterForm.skinType || 'Oily', glowPoints: 420, tier: 'gold',   orderCount: 7 },
        ],
      });
    }
    setFiltering(false);
  };

  const triggerCheckIns = async () => {
    setSendingCheckins(true);
    try {
      const res = await axios.post(`${API}/crm/journey/checkin`, {}, tok());
      alert(`✅ Check-in emails sent: ${res.data.sent}`);
    } catch (e) {
      alert('✅ Check-in emails triggered! (Demo Mode — configure SMTP to actually send)');
    }
    setSendingCheckins(false);
  };

  const tabStyle = (t) => ({
    padding: '0.45rem 1rem', borderRadius: '9999px', border: 'none', cursor: 'pointer',
    fontSize: '0.85rem', fontWeight: 600,
    background: tab === t ? R : 'transparent', color: tab === t ? '#fff' : '#6b7280',
  });

  const totalSegs = segments.reduce((s, x) => s + x.count, 0);

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1f2937', margin: 0 }}>CRM Dashboard</h1>
        <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Skin Journey · Check-in Emails · Segmentation · Green Tier · Referrals
        </p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '0.875rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Active Journeys',    value: summary?.activeJourneys ?? 284,  color: '#16a34a' },
          { label: 'Check-ins Sent',     value: summary?.checkInsSent   ?? 1247, color: '#1d4ed8' },
          { label: 'Total Segments',     value: DEMO_SEGMENTS.length,            color: '#7c3aed' },
          { label: 'Recycled Users',     value: 87,                              color: '#16a34a' },
          { label: 'Referral Signups',   value: 134,                             color: R },
        ].map(k => (
          <div key={k.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '1rem', padding: '1.1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.2rem' }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.3rem', background: '#f3f4f6', borderRadius: '9999px', padding: '0.3rem', width: 'fit-content', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['journey','segments','checkins','sustainability','referral','actions'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={tabStyle(t)}>
            {t === 'journey' ? '🧴 Skin Journey' : t === 'segments' ? '🎯 Segments' : t === 'checkins' ? '📧 Check-ins' : t === 'sustainability' ? '♻️ Green Tier' : t === 'referral' ? '🎁 Referral' : '⚡ Actions'}
          </button>
        ))}
      </div>

      {/* ── SKIN JOURNEY TAB ── */}
      {tab === 'journey' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1.25rem' }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '1rem', padding: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.95rem' }}>📅 The Skin Journey Timeline</h3>
            <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              When a customer completes the AI quiz and starts a routine, a 4-week automated journey begins. CRM sends personalised check-in emails at Day 1, Day 7, and Day 28 — no manual effort required.
            </p>
            {[
              { day: 1,  icon: '🚀', label: 'Day 1 — How to Apply',    desc: 'Welcome email with AM/PM routine guide and application tips', color: '#1d4ed8' },
              { day: 7,  icon: '⚠️', label: 'Day 7 — Purging Phase',    desc: '"Purging is normal, keep going" — dermatologist-backed reassurance', color: '#d97706' },
              { day: 14, icon: '🌱', label: 'Day 14 — Adaptation',      desc: 'Skin is adjusting. Tips to reduce sensitivity if any', color: '#16a34a' },
              { day: 28, icon: '📸', label: 'Day 28 — Results!',         desc: 'Progress photo prompt. Social sharing. Replenishment suggestion', color: R },
            ].map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: '1rem', marginBottom: '0.875rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: m.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>{m.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1f2937' }}>{m.label}</div>
                  <div style={{ fontSize: '0.78rem', color: '#6b7280', lineHeight: 1.4, marginTop: '0.15rem' }}>{m.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '1rem', padding: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '0.875rem', fontSize: '0.95rem' }}>📊 Journey Statistics</h3>
            {[
              { label: 'Journeys Started',   value: summary?.totalJourneys  ?? 412 },
              { label: 'Active Journeys',    value: summary?.activeJourneys ?? 284 },
              { label: 'Completed 28 Days',  value: 128 },
              { label: 'Day 1 Emails Sent',  value: 412 },
              { label: 'Day 7 Emails Sent',  value: 367 },
              { label: 'Day 28 Emails Sent', value: 128 },
              { label: 'Avg Retention',      value: '89%' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6', fontSize: '0.875rem' }}>
                <span style={{ color: '#6b7280' }}>{s.label}</span>
                <span style={{ fontWeight: 700, color: '#1f2937' }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SEGMENTS TAB ── */}
      {tab === 'segments' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: '1.25rem' }}>
          {/* Segment overview */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '1rem', padding: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>🎯 Customer Segments</h3>
            {segments.map((s, i) => (
              <div key={s._id} style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>{s._id?.replace('_', ' ')}</span>
                  <span style={{ fontWeight: 700 }}>{s.count} users ({totalSegs > 0 ? Math.round(s.count/totalSegs*100) : 0}%)</span>
                </div>
                <div style={{ background: '#f3f4f6', borderRadius: '999px', height: 8, overflow: 'hidden' }}>
                  <div style={{ height: 8, borderRadius: '999px', background: [R,'#1d4ed8','#16a34a','#d97706','#7c3aed','#0891b2'][i%6], width: `${totalSegs > 0 ? (s.count/totalSegs*100) : 0}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Segment filter tool */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '1rem', padding: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.95rem' }}>🔍 Segment Filter Tool</h3>
            <p style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: '1rem', lineHeight: 1.5 }}>
              Example: "Show me all Oily Skin users who haven't bought BHA Cleanser in 60 days"
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.3rem' }}>Skin Type</label>
                <select value={filterForm.skinType} onChange={e => setFilterForm(f => ({...f, skinType: e.target.value}))}
                  style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}>
                  <option value="">All Skin Types</option>
                  {['Oily','Dry','Combination','Normal','Sensitive'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.3rem' }}>Exclude users who bought product (SKU)</label>
                <input placeholder="e.g. SKIN-SAL-004" value={filterForm.excludeProductSku}
                  onChange={e => setFilterForm(f => ({...f, excludeProductSku: e.target.value}))}
                  style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.875rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.3rem' }}>Not ordered in (days)</label>
                <input type="number" value={filterForm.notOrderedInDays}
                  onChange={e => setFilterForm(f => ({...f, notOrderedInDays: e.target.value}))}
                  style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.875rem', boxSizing: 'border-box' }} />
              </div>
              <button onClick={runSegmentFilter} disabled={filtering}
                style={{ background: filtering ? '#9ca3af' : R, color: '#fff', border: 'none', borderRadius: '0.6rem', padding: '0.65rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>
                {filtering ? 'Filtering...' : 'Run Filter →'}
              </button>
            </div>

            {filterResult && (
              <div style={{ marginTop: '1rem', background: '#f9fafb', borderRadius: '0.75rem', padding: '1rem' }}>
                <div style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.875rem' }}>
                  {filterResult.count} matching customers
                </div>
                {filterResult.users?.slice(0,5).map(u => (
                  <div key={u._id || u.email} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', padding: '0.35rem 0', borderBottom: '1px solid #e5e7eb' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{u.name}</div>
                      <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>{u.skinType} · {u.orderCount} orders</div>
                    </div>
                    <span style={{ background: '#F5E8EA', color: R, fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '999px', alignSelf: 'center' }}>{u.tier}</span>
                  </div>
                ))}
                <button style={{ marginTop: '0.75rem', width: '100%', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '0.5rem', padding: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}>
                  📧 Send Targeted Campaign to These {filterResult.count} Users
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── CHECK-INS TAB ── */}
      {tab === 'checkins' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button onClick={triggerCheckIns} disabled={sendingCheckins}
              style={{ background: sendingCheckins ? '#9ca3af' : '#1d4ed8', color: '#fff', border: 'none', borderRadius: '0.6rem', padding: '0.6rem 1.25rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem' }}>
              {sendingCheckins ? 'Sending...' : '📧 Send Due Check-in Emails Now'}
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {CHECK_IN_TEMPLATES.map((t) => (
              <div key={t.day} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '1rem', padding: '1.5rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#F5E8EA', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <div style={{ fontWeight: 800, color: R, fontSize: '0.8rem' }}>Day</div>
                  <div style={{ fontWeight: 900, color: R, fontSize: '1.2rem', lineHeight: 1 }}>{t.day}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1f2937', margin: 0 }}>{t.subject}</h3>
                    <span style={{ background: '#f0fdf4', color: '#16a34a', fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '999px' }}>🤖 {t.status}</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#4b5563', lineHeight: 1.6, margin: 0 }}>{t.preview}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── GREEN TIER / SUSTAINABILITY TAB ── */}
      {tab === 'sustainability' && (
        <div>
          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '1rem', padding: '1rem 1.25rem', marginBottom: '1.5rem', fontSize: '0.875rem', color: '#166534', lineHeight: 1.6 }}>
            <strong>♻️ Gamified Sustainability (Green Tier):</strong> Users earn tier upgrades by recycling empty DermaFlow bottles. The SCM system tracks pickup requests → marks bottles received at warehouse → triggers the tier upgrade and discount automatically.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {GREEN_TIERS.map(tier => (
              <div key={tier.name} style={{ background: '#fff', border: `2px solid ${tier.color}30`, borderRadius: '1.25rem', padding: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>
                  {tier.name === 'Bronze' ? '🥉' : tier.name === 'Silver' ? '🥈' : tier.name === 'Emerald' ? '💚' : '💎'}
                </div>
                <div style={{ fontWeight: 800, color: tier.color, fontSize: '1.1rem', marginBottom: '0.25rem' }}>{tier.name}</div>
                <div style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: '0.5rem' }}>{tier.desc}</div>
                {tier.discount > 0 && <div style={{ fontWeight: 700, color: tier.color, fontSize: '1rem' }}>{tier.discount}% OFF</div>}
                <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#9ca3af' }}>{tier.users} users</div>
              </div>
            ))}
          </div>

          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '1rem', padding: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>How it works — SCM Integration</h3>
            {[
              { step: 1, icon: '📱', desc: 'User schedules a pickup for empty bottles via the dashboard' },
              { step: 2, icon: '🚚', desc: 'SCM assigns a courier pickup (Delhivery integration)' },
              { step: 3, icon: '🏭', desc: 'Bottles arrive at warehouse → admin confirms receipt' },
              { step: 4, icon: '✅', desc: 'CRM auto-updates bottle count → triggers tier upgrade if threshold reached' },
              { step: 5, icon: '🎉', desc: 'User gets email: "You\'ve hit Emerald Tier! Your 5% eco-discount is now active."' },
            ].map(s => (
              <div key={s.step} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1rem' }}>{s.icon}</div>
                <div style={{ fontSize: '0.875rem', color: '#374151', paddingTop: '0.4rem' }}><strong>Step {s.step}:</strong> {s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── REFERRAL TAB ── */}
      {tab === 'referral' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1.25rem' }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '1rem', padding: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '0.875rem', fontSize: '0.95rem' }}>🎁 Give ₹200, Get ₹200 Referral Program</h3>
            <p style={{ fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Every customer gets a unique referral code. When a friend completes the AI Quiz and places a first order, both get 200 Glow Points (= ₹200 off). This creates a viral loop — the Quiz acts as a "Lead Magnet" (free skin report in exchange for email).
            </p>
            <div style={{ background: '#F5E8EA', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: '0.25rem' }}>How it flows</div>
              <div style={{ fontSize: '0.85rem', color: '#1f2937', lineHeight: 1.6 }}>
                User takes Quiz → Gets free skin report (email captured) → Shares referral code → Friend completes quiz + buys → Both get 200 Glow Points → Referrer has incentive to share more
              </div>
            </div>
            {[
              { label: 'Total Referral Signups',  value: 134 },
              { label: 'Converted to Buyers',     value: 89 },
              { label: 'Conversion Rate',         value: '66%' },
              { label: 'Glow Points Distributed', value: '26,800' },
              { label: 'Revenue from Referrals',  value: '₹1,34,000' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0', borderBottom: '1px solid #f3f4f6', fontSize: '0.875rem' }}>
                <span style={{ color: '#6b7280' }}>{s.label}</span>
                <span style={{ fontWeight: 700 }}>{s.value}</span>
              </div>
            ))}
          </div>

          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '1rem', padding: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '0.875rem', fontSize: '0.95rem' }}>📊 Customer Acquisition (CAC) Strategy</h3>
            {[
              { channel: '🧬 AI Quiz (Lead Magnet)',         cac: '₹0',    desc: 'Free skin report = email capture + segmentation data', conversion: '34%' },
              { channel: '📧 Referral Loop',                 cac: '₹200',  desc: 'Glow Points cost vs LTV of ₹8,000+ avg customer',     conversion: '66%' },
              { channel: '📣 Influencer Affiliate',         cac: '₹800',  desc: '15-20% commission on referred sales',                  conversion: '12%' },
              { channel: '🔍 Google Ads (Paid)',            cac: '₹1,400', desc: 'Retargeting users who started quiz but didn\'t buy',   conversion: '8%' },
              { channel: '📱 Organic Social (Instagram)',   cac: '₹220',  desc: 'UGC + before/after content drives organic traffic',     conversion: '18%' },
            ].map(c => (
              <div key={c.channel} style={{ padding: '0.75rem 0', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{c.channel}</span>
                  <span style={{ fontWeight: 800, color: R, fontSize: '0.875rem' }}>{c.cac} CAC</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{c.desc} · {c.conversion} conversion</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ACTIONS TAB ── */}
      {tab === 'actions' && (
        <div>
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '1rem', padding: '1rem 1.25rem', marginBottom: '1.25rem', fontSize: '0.875rem', color: '#1e40af', lineHeight: 1.6 }}>
            <strong>CRM → Action Pipeline:</strong> The table below shows how each customer insight gets converted into a specific, measurable action. This is the "Relational CRM" model — moving from transactional to relationship-driven revenue.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {DEMO_ACTIONS.map((a, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '1rem', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.6rem' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1f2937', margin: 0 }}>📌 {a.issue}</h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span style={{ background: '#f3f4f6', color: '#374151', fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '999px' }}>{a.users} users</span>
                    <span style={{ background: '#f0fdf4', color: '#16a34a', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '999px', textTransform: 'capitalize' }}>{a.status}</span>
                  </div>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.5, margin: '0 0 0.6rem' }}>
                  <strong>Action:</strong> {a.action}
                </p>
                <div style={{ background: '#f0fdf4', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.8rem', color: '#166534', fontWeight: 500 }}>
                  📈 Result: {a.roi}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}