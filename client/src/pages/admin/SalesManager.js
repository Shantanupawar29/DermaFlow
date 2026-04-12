import React, { useState, useEffect } from 'react';
import {
  Tag, Plus, Trash2, RefreshCw, Mail, Users,
  Calendar, ToggleLeft, ToggleRight, TrendingDown,
  Package, AlertTriangle, Check, ChevronDown
} from 'lucide-react';
import api from '../../services/api';

const M = '#4A0E2E';

const BLANK = {
  name: '', description: '', discountType: 'percent', discountValue: '',
  scope: 'all', categories: [], products: [], audience: 'all', tierTarget: '',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
  isActive: true,
};

const iStyle = { width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', fontSize: 13, boxSizing: 'border-box', outline: 'none', background: '#fafafa' };
const labelStyle = { fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 };

export default function SalesManager() {
  const [tab, setTab] = useState('sales');
  const [sales, setSales] = useState([]);
  const [subs, setSubs] = useState([]);
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [winback, setWinback] = useState({ days: 30, sending: false, sent: null });

  const fetch = async () => {
    setLoading(true);
    try {
      const [sRes, subRes, pRes] = await Promise.allSettled([
        api.get('/sales/admin-all'),
        api.get('/sales/subscriptions/admin-all'),
        api.get('/products'),
      ]);
      if (sRes.status === 'fulfilled') setSales(sRes.value.data);
      if (subRes.status === 'fulfilled') setSubs(subRes.value.data);
      if (pRes.status === 'fulfilled') setProducts(pRes.value.data.products || pRes.value.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const save = async () => {
    if (!form.name || !form.discountValue) { alert('Name and discount value are required'); return; }
    setSaving(true);
    try {
      await api.post('/sales', form);
      setShowForm(false); setForm(BLANK); fetch();
    } catch (e) { alert(e.response?.data?.message || 'Failed to create sale'); }
    setSaving(false);
  };

  const toggle = async (sale) => {
    try {
      await api.put(`/sales/${sale._id}`, { isActive: !sale.isActive });
      fetch();
    } catch (e) { alert('Failed'); }
  };

  const deleteSale = async (id) => {
    if (!window.confirm('Delete this sale? Product discounts will be removed.')) return;
    await api.delete(`/sales/${id}`);
    fetch();
  };

  const sendWinback = async () => {
    setWinback(w => ({ ...w, sending: true }));
    try {
      const r = await api.post('/sales/winback', { days: winback.days });
      setWinback(w => ({ ...w, sending: false, sent: r.data.sent }));
    } catch (e) { setWinback(w => ({ ...w, sending: false })); alert('Failed'); }
  };

  const now = new Date();
  const activeSales = sales.filter(s => s.isActive && new Date(s.startDate) <= now && new Date(s.endDate) >= now);
  const FREEBIE = { none: '—', mini: 'Free Mini (₹5k+)', standard: 'Free Standard (₹7.5k+)', premium: 'Free Premium (₹10k+)' };

  const tabBtn = (t, l, I) => (
    <button onClick={() => setTab(t)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: tab === t ? M : 'transparent', color: tab === t ? '#fff' : '#6b7280' }}>
      <I size={13} />{l}
    </button>
  );

  return (
    <div style={{ fontFamily: 'system-ui,sans-serif', color: '#1f2937' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: M, margin: 0 }}>Sales & Subscriptions</h1>
          <p style={{ color: '#9ca3af', fontSize: 12, marginTop: 4, marginBottom: 0 }}>
            {activeSales.length} active sale{activeSales.length !== 1 ? 's' : ''} · {subs.filter(s => s.status === 'active').length} active subscriptions
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={fetch} style={{ background: '#f3f4f6', border: 'none', borderRadius: 9, padding: '8px 12px', cursor: 'pointer', color: '#6b7280' }}>
            <RefreshCw size={14} />
          </button>
          {tab === 'sales' && (
            <button onClick={() => setShowForm(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: M, color: '#fff', border: 'none', borderRadius: 9, padding: '8px 16px', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
              <Plus size={14} /> New Sale
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#f3f4f6', borderRadius: 10, padding: 4, width: 'fit-content', marginBottom: 20 }}>
        {tabBtn('sales', 'Sales', Tag)}
        {tabBtn('subs', 'Subscriptions', Package)}
        {tabBtn('winback', 'Win-Back', Mail)}
      </div>

      {/* SALES TAB */}
      {tab === 'sales' && (
        <div>
          {/* Create form */}
          {showForm && (
            <div style={{ background: '#fff', border: `1.5px solid ${M}30`, borderRadius: 14, padding: 22, marginBottom: 20 }}>
              <h3 style={{ fontWeight: 800, fontSize: 15, color: M, marginBottom: 16 }}>Create New Sale</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12, marginBottom: 16 }}>
                <div><label style={labelStyle}>Sale Name *</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Summer Sale" style={iStyle} /></div>
                <div><label style={labelStyle}>Discount Type</label>
                  <select value={form.discountType} onChange={e => setForm(f => ({ ...f, discountType: e.target.value }))} style={iStyle}>
                    <option value="percent">Percent (%)</option>
                    <option value="flat">Flat (₹)</option>
                  </select>
                </div>
                <div><label style={labelStyle}>Discount Value *</label><input type="number" value={form.discountValue} onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))} placeholder={form.discountType === 'percent' ? '20 = 20%' : '500 = ₹500 off'} style={iStyle} min="0" /></div>
                <div><label style={labelStyle}>Applies To</label>
                  <select value={form.scope} onChange={e => setForm(f => ({ ...f, scope: e.target.value }))} style={iStyle}>
                    <option value="all">All Products</option>
                    <option value="category">By Category</option>
                    <option value="specific">Specific Products</option>
                  </select>
                </div>
                {form.scope === 'category' && (
                  <div><label style={labelStyle}>Categories (comma separated)</label>
                    <input value={form.categories.join(',')} onChange={e => setForm(f => ({ ...f, categories: e.target.value.split(',').map(s => s.trim()) }))} placeholder="skin,hair" style={iStyle} />
                  </div>
                )}
                <div><label style={labelStyle}>Start Date</label><input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} style={iStyle} /></div>
                <div><label style={labelStyle}>End Date</label><input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} style={iStyle} /></div>
                <div><label style={labelStyle}>Target Audience</label>
                  <select value={form.audience} onChange={e => setForm(f => ({ ...f, audience: e.target.value }))} style={iStyle}>
                    <option value="all">All Customers</option>
                    <option value="tier">Specific Tier</option>
                    <option value="new">New Customers Only</option>
                  </select>
                </div>
                {form.audience === 'tier' && (
                  <div><label style={labelStyle}>Tier</label>
                    <select value={form.tierTarget} onChange={e => setForm(f => ({ ...f, tierTarget: e.target.value }))} style={iStyle}>
                      {['bronze', 'silver', 'gold', 'platinum'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                    </select>
                  </div>
                )}
                <div style={{ gridColumn: '1/-1' }}><label style={labelStyle}>Description (optional)</label><input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short description for banner" style={iStyle} /></div>
              </div>
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 9, padding: '10px 14px', fontSize: 12, color: '#92400e', marginBottom: 14 }}>
                Creating this sale will immediately update <strong>discountPercentage</strong> on matching products in your database. Deleting or deactivating it will reset them to 0%.
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={save} disabled={saving} style={{ background: M, color: '#fff', border: 'none', borderRadius: 8, padding: '9px 20px', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                  {saving ? 'Creating...' : 'Create Sale'}
                </button>
                <button onClick={() => setShowForm(false)} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '9px 16px', cursor: 'pointer', fontSize: 13, color: '#6b7280' }}>Cancel</button>
              </div>
            </div>
          )}

          {/* Sales list */}
          {loading ? <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading...</div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sales.length === 0 && (
                <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 14, border: '1px solid #f0f0f0', color: '#9ca3af' }}>
                  <Tag size={32} color="#e5e7eb" style={{ margin: '0 auto 12px', display: 'block' }} />
                  <p>No sales yet. Create your first sale to start discounting products.</p>
                </div>
              )}
              {sales.map(s => {
                const isLive = s.isActive && new Date(s.startDate) <= now && new Date(s.endDate) >= now;
                const isUpcoming = s.isActive && new Date(s.startDate) > now;
                const isExpired = new Date(s.endDate) < now;
                return (
                  <div key={s._id} style={{ background: '#fff', border: `1.5px solid ${isLive ? '#86efac' : isExpired ? '#f3f4f6' : '#f0f0f0'}`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <span style={{ fontWeight: 800, fontSize: 15, color: '#1f2937' }}>{s.name}</span>
                        <span style={{ background: isLive ? '#f0fdf4' : isUpcoming ? '#fffbeb' : isExpired ? '#f3f4f6' : '#fef2f2', color: isLive ? '#15803d' : isUpcoming ? '#d97706' : isExpired ? '#9ca3af' : '#dc2626', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999 }}>
                          {isLive ? 'LIVE' : isUpcoming ? 'UPCOMING' : isExpired ? 'EXPIRED' : s.isActive ? 'ACTIVE' : 'PAUSED'}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>
                        {s.discountValue}{s.discountType === 'percent' ? '%' : '₹'} off · {s.scope === 'all' ? 'All products' : s.scope === 'category' ? `Categories: ${s.categories.join(', ')}` : s.scope + ' products'} · {new Date(s.startDate).toLocaleDateString('en-IN')} – {new Date(s.endDate).toLocaleDateString('en-IN')}
                      </div>
                      {s.description && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{s.description}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <button onClick={() => toggle(s)} title={s.isActive ? 'Deactivate' : 'Activate'} style={{ background: 'none', border: 'none', cursor: 'pointer', color: s.isActive ? '#16a34a' : '#9ca3af' }}>
                        {s.isActive ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                      </button>
                      <button onClick={() => deleteSale(s._id)} style={{ background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: 7, padding: '5px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUBSCRIPTIONS TAB */}
      {tab === 'subs' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Active', value: subs.filter(s => s.status === 'active').length, color: '#16a34a' },
              { label: 'Paused', value: subs.filter(s => s.status === 'paused').length, color: '#d97706' },
              { label: 'Cancelled', value: subs.filter(s => s.status === 'cancelled').length, color: '#dc2626' },
              { label: 'Total', value: subs.length, color: M },
            ].map(k => (
              <div key={k.label} style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 12, padding: '14px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: k.color }}>{k.value}</div>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>{k.label}</div>
              </div>
            ))}
          </div>

          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 12, padding: '12px 16px', marginBottom: 16, fontSize: 12, color: '#15803d', lineHeight: 1.7 }}>
            <strong>Freebie tiers:</strong> Subscription value ≥₹5,000 → Free Mini · ≥₹7,500 → Free Standard · ≥₹10,000 → Premium Gift. These are included with the first delivery of each subscription cycle.
          </div>

          <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead><tr style={{ background: '#f9fafb' }}>
                {['Customer', 'Product', 'Plan', 'Next Delivery', 'Freebie', 'Status'].map(h => <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#6b7280', fontSize: 11 }}>{h}</th>)}
               </tr></thead>
              <tbody>
                {subs.length === 0 && <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>No subscriptions yet.</td></tr>}
                {subs.map(s => (
                  <tr key={s._id} style={{ borderTop: '1px solid #f9fafb' }}>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontWeight: 600 }}>{s.user?.name || '—'}</div>
                      <div style={{ fontSize: 10, color: '#9ca3af' }}>{s.user?.email}</div>
                     </td>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>{s.productName || s.product?.name}</td>
                    <td style={{ padding: '10px 14px', textTransform: 'capitalize', color: '#6b7280' }}>{s.plan}</td>
                    <td style={{ padding: '10px 14px', color: '#6b7280' }}>{s.nextDelivery ? new Date(s.nextDelivery).toLocaleDateString('en-IN') : '—'}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ background: s.freebieLevel === 'none' ? '#f3f4f6' : '#f0fdf4', color: s.freebieLevel === 'none' ? '#9ca3af' : '#15803d', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999 }}>
                        {FREEBIE[s.freebieLevel] || '—'}
                      </span>
                     </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ background: s.status === 'active' ? '#f0fdf4' : s.status === 'paused' ? '#fffbeb' : '#fef2f2', color: s.status === 'active' ? '#15803d' : s.status === 'paused' ? '#d97706' : '#dc2626', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, textTransform: 'capitalize' }}>
                        {s.status}
                      </span>
                     </td>
                   </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* WIN-BACK TAB */}
      {tab === 'winback' && (
        <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 20, alignItems: 'start' }}>
          <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, padding: 22, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 7, color: '#1f2937' }}>
              <Mail size={16} color={M} /> Win-Back Campaign
            </div>
            <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16, lineHeight: 1.7 }}>
              Send emotional re-engagement emails to customers who placed at least 1 order but haven't returned in X days. Email includes "We miss you" messaging with a personalized Glow Points reminder.
            </p>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Inactive for more than (days)</label>
              <input type="number" value={winback.days} onChange={e => setWinback(w => ({ ...w, days: Number(e.target.value) }))} style={iStyle} min="7" />
            </div>
            <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 9, padding: '10px 14px', fontSize: 12, color: '#92400e', marginBottom: 14, lineHeight: 1.6 }}>
              Only customers with <code>emailPrefs.marketing !== false</code> will receive emails. Make sure your EMAIL_USER + EMAIL_PASS are configured in .env.
            </div>
            <button onClick={sendWinback} disabled={winback.sending} style={{ display: 'flex', alignItems: 'center', gap: 7, background: M, color: '#fff', border: 'none', borderRadius: 9, padding: '10px 20px', cursor: 'pointer', fontWeight: 700, fontSize: 13, width: '100%', justifyContent: 'center' }}>
              {winback.sending ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Sending...</> : <><Mail size={14} /> Send Win-Back Emails</>}
            </button>
            {winback.sent != null && (
              <div style={{ marginTop: 12, background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 9, padding: '10px 14px', fontSize: 13, color: '#15803d', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Check size={15} /> {winback.sent} win-back emails sent successfully
              </div>
            )}
            <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
          </div>

          <div>
            <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 14, color: '#1f2937' }}>Win-Back Email Preview</div>
              <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', fontSize: 13 }}>
                <div style={{ background: M, padding: '16px 20px', color: '#fff' }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>We miss you, Anushka</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>Subject: Your skin deserves some love — come back!</div>
                </div>
                <div style={{ padding: '16px 20px', lineHeight: 1.8, color: '#4b5563' }}>
                  <p>Hi there! It's been a while and we genuinely miss you.</p>
                  <p>Your skin journey doesn't have to pause — and we've saved <strong style={{ color: M }}>250 Glow Points</strong> in your account, worth <strong style={{ color: M }}>₹25 off</strong> your next order.</p>
                  <p>Come back and pick up where you left off. Your routine is waiting.</p>
                  <div style={{ background: '#f9fafb', borderRadius: 8, padding: '12px 14px', marginTop: 8, border: '1px solid #f0f0f0' }}>
                    <strong>Your personalized recommendations are ready.</strong> Based on your skin type, we think you'd love what's new.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}