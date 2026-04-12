import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  TrendingUp, Target, BarChart3, Activity, PieChart,
  ArrowUpRight, ArrowDownRight, RefreshCw, Package,
  DollarSign, ShoppingBag, Users, Percent, Star
} from 'lucide-react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const M   = '#4A0E2E';
const tok = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
const fmt = v => '₹' + (v || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

function KPI({ label, value, sub, icon: Icon, color, trend }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, padding: '18px 20px', flex: 1, minWidth: 130, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ background: `${color||M}15`, borderRadius: 9, padding: 7 }}>
          <Icon size={16} color={color || M} />
        </div>
        {trend != null && (
          <span style={{ fontSize: 11, fontWeight: 700, color: trend >= 0 ? '#16a34a' : '#dc2626', display: 'flex', alignItems: 'center', gap: 2 }}>
            {trend >= 0 ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>}{Math.abs(trend)}%
          </span>
        )}
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: color || M, lineHeight: 1, marginBottom: 3 }}>{value}</div>
      <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: '#6b7280', marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function BarRow({ label, value, maxVal, color, sub }) {
  const pct = maxVal > 0 ? (value / maxVal) * 100 : 0;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
        <span style={{ fontWeight: 600, color: '#374151' }}>{label}</span>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontWeight: 700, color }}>{value}</span>
          {sub && <span style={{ color: '#9ca3af', fontSize: 11 }}> {sub}</span>}
        </div>
      </div>
      <div style={{ background: '#f3f4f6', borderRadius: 999, height: 8, overflow: 'hidden' }}>
        <div style={{ height: 8, background: color, width: `${pct}%`, borderRadius: 999, transition: 'width 0.7s ease' }}/>
      </div>
    </div>
  );
}

export default function BIHub() {
  const [tab, setTab]           = useState('financials');
  const [sales, setSales]       = useState(null);
  const [cogs, setCogs]         = useState(null);
  const [crm, setCrm]           = useState(null);
  const [loading, setLoading]   = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [sRes, cogRes, crmRes] = await Promise.allSettled([
        axios.get(`${API}/analytics/sales?period=30`, tok()),
        axios.get(`${API}/erp/cogs-report`, tok()),
        axios.get(`${API}/crm/summary`, tok()),
      ]);
      if (sRes.status === 'fulfilled')    setSales(sRes.value.data);
      if (cogRes.status === 'fulfilled')  setCogs(cogRes.value.data);
      if (crmRes.status === 'fulfilled')  setCrm(crmRes.value.data);
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const tabBtn = (t, label, Icon) => (
    <button key={t} onClick={() => setTab(t)} style={{
      display: 'flex', alignItems: 'center', gap: 5,
      padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
      fontSize: 12, fontWeight: 600, transition: 'all 0.15s',
      background: tab === t ? M : 'transparent', color: tab === t ? '#fff' : '#6b7280'
    }}><Icon size={13}/>{label}</button>
  );

  // Derived metrics
  const grossProfit = (sales?.totalRevenue || 0) - (cogs?.summary?.totalCOGS || 0);
  const grossMargin = sales?.totalRevenue > 0 ? Math.round((grossProfit / sales.totalRevenue) * 100) : 0;
  const maxProduct  = Math.max(...(sales?.topProducts || []).map(p => p.revenue), 1);

  return (
    <div style={{ fontFamily: 'system-ui,sans-serif', color: '#1f2937' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: M, margin: 0 }}>Business Intelligence</h1>
          <p style={{ color: '#9ca3af', fontSize: 12, marginTop: 4, marginBottom: 0 }}>Cross-pillar analytics — all data live from your database</p>
        </div>
        <button onClick={fetchAll} style={{ background: '#f3f4f6', border: 'none', borderRadius: 9, padding: '8px 12px', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
          <RefreshCw size={13}/> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#f3f4f6', borderRadius: 10, padding: 4, width: 'fit-content', marginBottom: 24 }}>
        {tabBtn('financials', 'Revenue & COGS', TrendingUp)}
        {tabBtn('products',   'Products',       Package)}
        {tabBtn('customers',  'Customers',      Users)}
      </div>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, gap: 10, color: '#9ca3af' }}>
          <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }}/>
          <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {!loading && tab === 'financials' && (
        <div>
          {/* Revenue vs COGS banner */}
          <div style={{ background: `linear-gradient(135deg, ${M}, #7B2D3C)`, borderRadius: 16, padding: '22px 28px', color: '#fff', marginBottom: 20, display: 'flex', gap: 36, flexWrap: 'wrap' }}>
            {[
              { label: 'Total Revenue (30d)',  value: fmt(sales?.totalRevenue || 0) },
              { label: 'Total COGS (batches)', value: fmt(cogs?.summary?.totalCOGS || 0) },
              { label: 'Gross Profit',          value: fmt(grossProfit) },
              { label: 'Gross Margin',          value: `${grossMargin}%` },
              { label: 'Avg Order Value',       value: fmt(sales?.avgOrderValue || 0) },
            ].map(k => (
              <div key={k.label}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>{k.label}</div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{k.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 20 }}>
            <KPI label="Total Orders (30d)" value={sales?.totalOrders || 0}       icon={ShoppingBag} color="#1d4ed8" />
            <KPI label="COGS per Batch Avg"  value={fmt(cogs?.summary?.totalCOGS / Math.max(cogs?.report?.length||1,1))} icon={Package} color="#d97706" />
            <KPI label="Overall Margin"      value={`${cogs?.summary?.overallMargin || 0}%`} icon={Percent} color="#16a34a" />
            <KPI label="Revenue Potential"   value={fmt(cogs?.summary?.totalRevenue || 0)} icon={TrendingUp} color={M} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Daily revenue */}
            <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Activity size={14} color={M}/> Daily Revenue (30 days)
              </div>
              {(sales?.revenueByDay || []).length === 0
                ? <p style={{ color: '#9ca3af', fontSize: 13 }}>No revenue data yet. Place orders to see the chart.</p>
                : (() => {
                  const maxRev = Math.max(...(sales.revenueByDay).map(d => d.revenue), 1);
                  const recent = sales.revenueByDay.slice(-14);
                  return recent.map(d => (
                    <div key={d.date} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ width: 50, fontSize: 10, color: '#9ca3af', flexShrink: 0 }}>
                        {new Date(d.date).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
                      </span>
                      <div style={{ flex: 1, background: '#f3f4f6', borderRadius: 999, height: 18, overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: `linear-gradient(90deg, ${M}, #7B2D3C)`, width: `${(d.revenue / maxRev) * 100}%`, borderRadius: 999 }}/>
                      </div>
                      <span style={{ width: 70, textAlign: 'right', fontSize: 11, fontWeight: 700, color: M, flexShrink: 0 }}>{fmt(d.revenue)}</span>
                    </div>
                  ));
                })()
              }
            </div>

            {/* COGS breakdown */}
            <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                <DollarSign size={14} color={M}/> COGS Breakdown by Batch
              </div>
              {!(cogs?.report?.length > 0)
                ? <p style={{ color: '#9ca3af', fontSize: 13 }}>No batches created yet. Create ERP batches to see COGS analysis.</p>
                : cogs.report.slice(0, 6).map(r => (
                  <div key={r.batchId} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f9fafb', fontSize: 12 }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{r.productName}</div>
                      <div style={{ fontSize: 10, color: '#9ca3af' }}>COGS: {fmt(r.totalCOGS)} · Sell: {fmt(r.sellingPrice)}</div>
                    </div>
                    <span style={{ fontWeight: 800, color: (r.profitMargin||0) > 50 ? '#16a34a' : '#d97706', fontSize: 13 }}>{r.profitMargin||0}%</span>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}

      {!loading && tab === 'products' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Top products by revenue */}
          <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
              <TrendingUp size={14} color={M}/> Top Products by Revenue
            </div>
            {!(sales?.topProducts?.length > 0)
              ? <p style={{ color: '#9ca3af', fontSize: 13 }}>No product sales data yet.</p>
              : sales.topProducts.map((p, i) => (
                <BarRow key={p._id} label={p._id} value={fmt(p.revenue)} maxVal={maxProduct} color={[M,'#1d4ed8','#16a34a','#d97706','#7c3aed'][i%5]} sub={`${p.unitsSold} units`}/>
              ))
            }
          </div>

          {/* Sales by category */}
          <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
              <PieChart size={14} color={M}/> Revenue by Category
            </div>
            {!(sales?.salesByCategory?.length > 0)
              ? <p style={{ color: '#9ca3af', fontSize: 13 }}>No category data yet.</p>
              : (() => {
                const maxCat = Math.max(...sales.salesByCategory.map(c => c.revenue), 1);
                return sales.salesByCategory.map((c, i) => (
                  <BarRow key={c._id} label={c._id || 'Other'} value={fmt(c.revenue)} maxVal={maxCat} color={[M,'#1d4ed8','#16a34a'][i%3]}/>
                ));
              })()
            }

            {/* Business model explainer */}
            <div style={{ marginTop: 20, background: '#f9fafb', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontWeight: 700, fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Business Model</div>
              {[
                { label: 'D2C Sales (direct)', pct: 82, color: M },
                { label: 'Subscription boxes', pct: 15, color: '#1d4ed8' },
                { label: 'Influencer / affiliate', pct: 3,  color: '#16a34a' },
              ].map(s => (
                <div key={s.label} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                    <span style={{ color: '#374151' }}>{s.label}</span>
                    <span style={{ fontWeight: 700, color: s.color }}>{s.pct}%</span>
                  </div>
                  <div style={{ background: '#e5e7eb', borderRadius: 999, height: 5, overflow: 'hidden' }}>
                    <div style={{ height: 5, background: s.color, width: `${s.pct}%`, borderRadius: 999 }}/>
                  </div>
                </div>
              ))}
              <p style={{ fontSize: 10, color: '#9ca3af', marginTop: 8, lineHeight: 1.6 }}>
                DermaFlow is a D2C brand — products are manufactured in-house (see ERP for batch/COGS data) and sold directly to consumers. Gross profit = selling price minus manufacturing cost.
              </p>
            </div>
          </div>
        </div>
      )}

      {!loading && tab === 'customers' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', gridColumn: '1/-1' }}>
            <KPI label="Total Customers"  value={crm?.totalCustomers || 0}  icon={Users}       color={M} />
            <KPI label="At-Risk"          value={crm?.atRisk || 0}           icon={Target}      color="#dc2626" sub="60+ days inactive" />
            <KPI label="Total Reviews"    value={crm?.feedbackCount || 0}    icon={Star}        color="#d97706" />
            <KPI label="Avg Order Value"  value={fmt(crm?.avgOrderValue || 0)} icon={DollarSign} color="#047857" />
          </div>

          {/* Tier breakdown */}
          <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
              <BarChart3 size={14} color={M}/> Loyalty Tier Distribution
            </div>
            {!(crm?.tierCounts?.length > 0)
              ? <p style={{ color: '#9ca3af', fontSize: 13 }}>No customers yet.</p>
              : (() => {
                const maxTier = Math.max(...crm.tierCounts.map(t => t.count), 1);
                const TIER_COLORS = { bronze: '#d97706', silver: '#64748b', gold: '#b45309', platinum: '#7c3aed' };
                return crm.tierCounts.map(t => (
                  <BarRow key={t._id} label={t._id || 'Unknown'} value={t.count} maxVal={maxTier} color={TIER_COLORS[t._id] || '#6b7280'} sub={`${crm.totalCustomers > 0 ? Math.round((t.count/crm.totalCustomers)*100) : 0}%`}/>
                ));
              })()
            }
          </div>

          {/* Skin type distribution */}
          <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Activity size={14} color={M}/> Skin Type Distribution
            </div>
            <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 14, lineHeight: 1.6 }}>Populated from quiz completions. Oily skin customers tend to buy more BHA products; segment for targeted campaigns.</p>
            {!(crm?.skinTypeCounts?.length > 0)
              ? <p style={{ color: '#9ca3af', fontSize: 13 }}>No quiz data yet.</p>
              : (() => {
                const maxSkin = Math.max(...crm.skinTypeCounts.map(s => s.count), 1);
                return crm.skinTypeCounts.map((s, i) => (
                  <BarRow key={s._id} label={s._id || 'Unknown'} value={s.count} maxVal={maxSkin} color={[M,'#1d4ed8','#16a34a','#d97706','#7c3aed'][i%5]}/>
                ));
              })()
            }
          </div>
        </div>
      )}
    </div>
  );
}
