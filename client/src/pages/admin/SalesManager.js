import React, { useState, useEffect } from 'react';
import {
  Tag, Plus, Trash2, RefreshCw, Mail, Users,
  Calendar, ToggleLeft, ToggleRight, TrendingDown,
  Package, Check, ChevronDown, X, Zap
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

const iStyle = {
  width: '100%', border: '1px solid #e5e7eb', borderRadius: 8,
  padding: '8px 12px', fontSize: 13, boxSizing: 'border-box',
  outline: 'none', background: '#fafafa',
};
const label = { fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 };

export default function SalesManager() {
  const [tab, setTab]         = useState('sales');
  const [sales, setSales]     = useState([]);
  const [subs, setSubs]       = useState([]);
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]       = useState(BLANK);
  const [saving, setSaving]   = useState(false);
  const [loading, setLoading] = useState(true);
  const [winback, setWinback] = useState({ days: 30, sending: false, sent: null });

  const fetchAll = async () => {
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

  useEffect(() => { fetchAll(); }, []);

  const save = async () => {
    if (!form.name || !form.discountValue) { alert('Name and discount value are required'); return; }
    setSaving(true);
    try {
      await api.post('/sales', form);
      setShowForm(false); setForm(BLANK); fetchAll();
    } catch (e) { alert(e.response?.data?.message || 'Failed to create sale'); }
    setSaving(false);
  };

  const toggle = async (sale) => {
    try {
      await api.put(`/sales/${sale._id}`, { isActive: !sale.isActive });
      fetchAll();
    } catch (e) { alert('Failed to toggle sale'); }
  };

  const deleteSale = async (id) => {
    if (!window.confirm('Delete this sale? This will remove discounts from affected products.')) return;
    try { await api.delete(`/sales/${id}`); fetchAll(); }
    catch (e) { alert('Failed to delete'); }
  };

  const sendWinback = async () => {
    setWinback(w => ({ ...w, sending: true }));
    try {
      const { data } = await api.post('/sales/winback', { days: winback.days });
      setWinback(w => ({ ...w, sending: false, sent: data.message }));
    } catch (e) {
      setWinback(w => ({ ...w, sending: false, sent: 'Failed to send winback emails' }));
    }
  };

  const now = new Date();
  const activeSales   = sales.filter(s => s.isActive && new Date(s.startDate) <= now && new Date(s.endDate) >= now);
  const scheduledSales= sales.filter(s => s.isActive && new Date(s.startDate) > now);
  const expiredSales  = sales.filter(s => !s.isActive || new Date(s.endDate) < now);

  const tabStyle = (t) => ({
    padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
    fontWeight: 600, fontSize: 13,
    background: tab === t ? M : '#f3f4f6',
    color: tab === t ? '#fff' : '#374151',
  });

  const SaleCard = ({ sale }) => {
    const isActive  = sale.isActive && new Date(sale.startDate) <= now && new Date(sale.endDate) >= now;
    const isScheduled = sale.isActive && new Date(sale.startDate) > now;
    const statusColor = isActive ? '#16a34a' : isScheduled ? '#d97706' : '#9ca3af';
    const statusLabel = isActive ? 'LIVE' : isScheduled ? 'SCHEDULED' : 'ENDED';

    return (
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 18, marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: '#1f2937' }}>{sale.name}</span>
              <span style={{
                background: `${statusColor}15`, color: statusColor,
                fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
              }}>{statusLabel}</span>
            </div>
            <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>{sale.description}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: 12 }}>
              <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>
                {sale.discountType === 'percent' ? `${sale.discountValue}% OFF` : `₹${sale.discountValue} FLAT`}
              </span>
              <span style={{ background: '#f0fdf4', color: '#15803d', padding: '2px 8px', borderRadius: 6 }}>
                Scope: {sale.scope}
              </span>
              <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: 6 }}>
                Audience: {sale.audience === 'tier' ? `${sale.tierTarget} tier` : sale.audience}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
            <div style={{ fontSize: 11, color: '#9ca3af', textAlign: 'right' }}>
              <div>{new Date(sale.startDate).toLocaleDateString()} →</div>
              <div>{new Date(sale.endDate).toLocaleDateString()}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => toggle(sale)} style={{
                background: sale.isActive ? '#fef2f2' : '#f0fdf4',
                color: sale.isActive ? '#dc2626' : '#16a34a',
                border: 'none', borderRadius: 6, padding: '5px 10px',
                fontSize: 11, fontWeight: 600, cursor: 'pointer',
              }}>
                {sale.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button onClick={() => deleteSale(sale._id)} style={{
                background: '#fef2f2', color: '#dc2626',
                border: 'none', borderRadius: 6, padding: '5px 8px', cursor: 'pointer',
              }}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ fontFamily: 'system-ui,sans-serif', maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: M, margin: 0 }}>Sales & Promotions</h1>
          <p style={{ fontSize: 12, color: '#6b7280', marginTop: 3 }}>
            {activeSales.length} live · {scheduledSales.length} scheduled · {products.length} products
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={fetchAll} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer' }}>
            <RefreshCw size={16} color="#6b7280" />
          </button>
          <button onClick={() => setShowForm(true)} style={{
            background: M, color: '#fff', border: 'none', borderRadius: 8,
            padding: '8px 16px', cursor: 'pointer', fontWeight: 600, fontSize: 13,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <Plus size={16} /> New Sale
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[['sales','Sales'], ['subscriptions','Subscriptions'], ['winback','Winback']].map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)} style={tabStyle(t)}>{l}</button>
        ))}
      </div>

      {/* ── SALES TAB ──────────────────────────────────────────────────── */}
      {tab === 'sales' && (
        <div>
          {loading ? <p style={{ color: '#9ca3af', textAlign: 'center', padding: 40 }}>Loading sales...</p> : (
            <>
              {activeSales.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: '#16a34a', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    🟢 Live Now ({activeSales.length})
                  </h3>
                  {activeSales.map(s => <SaleCard key={s._id} sale={s} />)}
                </div>
              )}
              {scheduledSales.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: '#d97706', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    ⏰ Scheduled ({scheduledSales.length})
                  </h3>
                  {scheduledSales.map(s => <SaleCard key={s._id} sale={s} />)}
                </div>
              )}
              {expiredSales.length > 0 && (
                <div>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: '#9ca3af', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Ended / Inactive ({expiredSales.length})
                  </h3>
                  {expiredSales.map(s => <SaleCard key={s._id} sale={s} />)}
                </div>
              )}
              {sales.length === 0 && (
                <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>
                  <Tag size={40} style={{ margin: '0 auto 12px', display: 'block' }} />
                  <p>No sales yet. Create your first sale campaign!</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── SUBSCRIPTIONS TAB ──────────────────────────────────────────── */}
      {tab === 'subscriptions' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Total Subscriptions', val: subs.length, color: M },
              { label: 'Active', val: subs.filter(s => s.status === 'active').length, color: '#16a34a' },
              { label: 'Monthly Revenue', val: `₹${subs.filter(s=>s.status==='active').reduce((a,s) => a + (s.discountedPrice || 0), 0).toLocaleString('en-IN')}`, color: '#d97706' },
            ].map((k, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: k.color }}>{k.val}</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 3 }}>{k.label}</div>
              </div>
            ))}
          </div>

          {subs.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#9ca3af', padding: 40 }}>No subscriptions yet</p>
          ) : (
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    {['Customer','Product','Plan','Price','Status','Next Order'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, color: '#6b7280', fontWeight: 700 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {subs.map(sub => (
                    <tr key={sub._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '10px 14px' }}>{sub.user?.name || '—'}</td>
                      <td style={{ padding: '10px 14px' }}>{sub.product?.name || '—'}</td>
                      <td style={{ padding: '10px 14px', textTransform: 'capitalize' }}>{sub.plan}</td>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: M }}>₹{sub.discountedPrice}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{
                          background: sub.status === 'active' ? '#f0fdf4' : '#fef2f2',
                          color: sub.status === 'active' ? '#16a34a' : '#dc2626',
                          padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                        }}>{sub.status}</span>
                      </td>
                      <td style={{ padding: '10px 14px', color: '#6b7280' }}>
                        {sub.nextOrderDate ? new Date(sub.nextOrderDate).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── WINBACK TAB ────────────────────────────────────────────────── */}
      {tab === 'winback' && (
        <div style={{ maxWidth: 500 }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
            <h3 style={{ fontWeight: 700, fontSize: 16, color: '#1f2937', marginBottom: 4 }}>Winback Campaign</h3>
            <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 20 }}>
              Send re-engagement emails to customers who haven't ordered in N days. This fetches real inactive users from your database.
            </p>
            <div style={{ marginBottom: 16 }}>
              <span style={label}>Inactive for (days)</span>
              <input type="number" value={winback.days} min={7} max={365}
                onChange={e => setWinback(w => ({ ...w, days: e.target.value }))}
                style={{ ...iStyle, width: 120 }} />
            </div>
            <button onClick={sendWinback} disabled={winback.sending} style={{
              background: M, color: '#fff', border: 'none', borderRadius: 8,
              padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 13,
              display: 'flex', alignItems: 'center', gap: 8, opacity: winback.sending ? 0.7 : 1,
            }}>
              <Mail size={16} />
              {winback.sending ? 'Sending...' : 'Send Winback Emails'}
            </button>
            {winback.sent && (
              <div style={{ marginTop: 16, background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#15803d' }}>
                ✅ {winback.sent}
              </div>
            )}
          </div>

          {/* <div style={{ background: '#fff8f0', border: '1px solid #fed7aa', borderRadius: 12, padding: 16, marginTop: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#92400e', marginBottom: 6 }}>💡 For email to work on Render:</p>
            <p style={{ fontSize: 12, color: '#78350f', lineHeight: 1.6 }}>
              Add <code>BREVO_SMTP_USER</code> and <code>BREVO_SMTP_KEY</code> to your Render environment variables, then update <code>emailService.js</code> to use Brevo's SMTP relay (<code>smtp-relay.brevo.com</code> port 587).
            </p>
          </div> */}
        </div>
      )}

      {/* ── CREATE SALE MODAL ──────────────────────────────────────────── */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 560, width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontWeight: 700, fontSize: 18, color: M, margin: 0 }}>Create New Sale</h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="#9ca3af" />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {/* Name */}
              <div style={{ gridColumn: '1/-1' }}>
                <span style={label}>Sale Name *</span>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  placeholder="e.g. Diwali Sale 2025" style={iStyle} />
              </div>

              {/* Description */}
              <div style={{ gridColumn: '1/-1' }}>
                <span style={label}>Description</span>
                <input value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="Brief description shown to customers" style={iStyle} />
              </div>

              {/* Discount type + value */}
              <div>
                <span style={label}>Discount Type</span>
                <select value={form.discountType} onChange={e => setForm({...form, discountType: e.target.value})} style={iStyle}>
                  <option value="percent">Percentage (%)</option>
                  <option value="flat">Flat Amount (₹)</option>
                </select>
              </div>
              <div>
                <span style={label}>Discount Value *</span>
                <input type="number" value={form.discountValue}
                  onChange={e => setForm({...form, discountValue: e.target.value})}
                  placeholder={form.discountType === 'percent' ? '20 = 20% off' : '100 = ₹100 off'}
                  style={iStyle} />
              </div>

              {/* Scope */}
              <div>
                <span style={label}>Apply To</span>
                <select value={form.scope} onChange={e => setForm({...form, scope: e.target.value})} style={iStyle}>
                  <option value="all">All Products</option>
                  <option value="category">Specific Category</option>
                  <option value="specific">Specific Products</option>
                </select>
              </div>

              {/* Category selector */}
              {form.scope === 'category' && (
                <div>
                  <span style={label}>Categories</span>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {['skin','hair','body'].map(cat => (
                      <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                        <input type="checkbox"
                          checked={form.categories.includes(cat)}
                          onChange={e => setForm({...form, categories: e.target.checked
                            ? [...form.categories, cat]
                            : form.categories.filter(c => c !== cat)
                          })} />
                        {cat}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Product selector */}
              {form.scope === 'specific' && (
                <div style={{ gridColumn: '1/-1' }}>
                  <span style={label}>Select Products</span>
                  <div style={{ maxHeight: 150, overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: 8, padding: 8 }}>
                    {products.map(p => (
                      <label key={p._id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0', fontSize: 12 }}>
                        <input type="checkbox"
                          checked={form.products.includes(p._id)}
                          onChange={e => setForm({...form, products: e.target.checked
                            ? [...form.products, p._id]
                            : form.products.filter(id => id !== p._id)
                          })} />
                        {p.name} — ₹{p.price}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Audience */}
              <div>
                <span style={label}>Target Audience</span>
                <select value={form.audience} onChange={e => setForm({...form, audience: e.target.value})} style={iStyle}>
                  <option value="all">All Customers</option>
                  <option value="tier">Specific Tier</option>
                  <option value="new">New Customers</option>
                </select>
              </div>
              {form.audience === 'tier' && (
                <div>
                  <span style={label}>Tier</span>
                  <select value={form.tierTarget} onChange={e => setForm({...form, tierTarget: e.target.value})} style={iStyle}>
                    <option value="">Select tier</option>
                    <option value="bronze">Bronze</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="platinum">Platinum</option>
                  </select>
                </div>
              )}

              {/* Dates */}
              <div>
                <span style={label}>Start Date</span>
                <input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} style={iStyle} />
              </div>
              <div>
                <span style={label}>End Date</span>
                <input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} style={iStyle} />
              </div>

              {/* Active toggle */}
              <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" id="isActive" checked={form.isActive}
                  onChange={e => setForm({...form, isActive: e.target.checked})} />
                <label htmlFor="isActive" style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                  Activate immediately (applies discounts to products now)
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button onClick={save} disabled={saving} style={{
                flex: 1, background: M, color: '#fff', border: 'none', borderRadius: 8,
                padding: '12px', fontWeight: 700, cursor: 'pointer', fontSize: 14,
                opacity: saving ? 0.7 : 1,
              }}>
                {saving ? 'Creating Sale...' : '🚀 Launch Sale'}
              </button>
              <button onClick={() => setShowForm(false)} style={{
                background: '#f3f4f6', border: 'none', borderRadius: 8,
                padding: '12px 20px', cursor: 'pointer', fontSize: 14,
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}