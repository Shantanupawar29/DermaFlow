// client/src/pages/admin/SaleManager.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Tag, Zap, Mail, RefreshCw, Check, X, Package, Users, ChevronDown } from 'lucide-react';

import api from '../../services/api';
const M   = '#4A0E2E';
const tok = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
const fmt = v => '₹' + (v||0).toLocaleString('en-IN');

export default function SaleManager() {
  const [tab, setTab]           = useState('launch');
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);

  const [saleForm, setSaleForm] = useState({
    discountPercent: 20, label: '', endsAt: '', applyToCategory: '',
  });
  const [winbackForm, setWinbackForm] = useState({
    daysSinceOrder: 60, voucherDiscount: 10, customMessage: '',
  });

  useEffect(() => {
    axios.get(`${API}/sales/products`, tok()).then(r => setProducts(r.data)).catch(() => {});
  }, []);

  const toggleProduct = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const selectAll     = () => setSelected(products.map(p => p._id));
  const selectCat     = (cat) => setSelected(products.filter(p => p.category === cat).map(p => p._id));

  const launchSale = async () => {
    if (!saleForm.label) { alert('Please enter a sale label'); return; }
    setLoading(true); setResult(null);
    try {
      const r = await axios.post(`${API}/sales/launch`, {
        productIds: selected.length ? selected : undefined,
        applyToCategory: !selected.length && saleForm.applyToCategory ? saleForm.applyToCategory : undefined,
        discountPercent: Number(saleForm.discountPercent),
        label: saleForm.label,
        endsAt: saleForm.endsAt || undefined,
      }, tok());
      setResult({ type: 'success', message: `Sale launched! ${r.data.affected} products updated.` });
      setSelected([]);
    } catch(e) { setResult({ type: 'error', message: e.response?.data?.message || 'Failed' }); }
    setLoading(false);
  };

  const endSale = async () => {
    if (!window.confirm('End sale on all selected products?')) return;
    setLoading(true);
    try {
      await axios.post(`${API}/sales/end`, { productIds: selected.length ? selected : undefined }, tok());
      setResult({ type: 'success', message: 'Sale ended successfully.' });
      setSelected([]);
    } catch(e) { setResult({ type: 'error', message: 'Failed to end sale' }); }
    setLoading(false);
  };

  const sendWinback = async () => {
    if (!window.confirm(`Send win-back emails to customers inactive for ${winbackForm.daysSinceOrder}+ days?`)) return;
    setLoading(true); setResult(null);
    try {
      const r = await axios.post(`${API}/sales/winback`, winbackForm, tok());
      setResult({ type: 'success', message: `Win-back campaign sent to ${r.data.sent} customers.` });
    } catch(e) { setResult({ type: 'error', message: e.response?.data?.message || 'Failed' }); }
    setLoading(false);
  };

  const inp = { border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', fontSize: 13, width: '100%', boxSizing: 'border-box', outline: 'none', background: '#fafafa' };
  const categories = [...new Set(products.map(p => p.category))];

  return (
    <div style={{ fontFamily: 'system-ui,sans-serif', color: '#1f2937' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: M, margin: 0 }}>Sale & Campaign Manager</h1>
        <p style={{ color: '#9ca3af', fontSize: 12, marginTop: 4 }}>Launch flash sales, set discounts, and send win-back campaigns to dormant customers</p>
      </div>

      {result && (
        <div style={{ background: result.type === 'success' ? '#f0fdf4' : '#fef2f2', border: `1px solid ${result.type === 'success' ? '#86efac' : '#fca5a5'}`, borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 600, color: result.type === 'success' ? '#15803d' : '#dc2626' }}>
          {result.type === 'success' ? <Check size={15}/> : <X size={15}/>} {result.message}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#f3f4f6', borderRadius: 10, padding: 4, width: 'fit-content', marginBottom: 24 }}>
        {[
          { k: 'launch',  l: 'Launch Sale',      I: Tag },
          { k: 'winback', l: 'Win-Back Campaign', I: Mail },
          { k: 'active',  l: 'Active Sales',      I: Zap },
        ].map(({ k, l, I }) => (
          <button key={k} onClick={() => setTab(k)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: tab === k ? M : 'transparent', color: tab === k ? '#fff' : '#6b7280', transition: 'all 0.15s' }}>
            <I size={13}/>{l}
          </button>
        ))}
      </div>

      {/* ── LAUNCH SALE ── */}
      {tab === 'launch' && (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, alignItems: 'start' }}>
          {/* Config */}
          <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, color: '#1f2937', display: 'flex', alignItems: 'center', gap: 6 }}><Tag size={15} color={M}/> Sale Configuration</div>
            {[
              { label: 'Sale Label *', key: 'label', type: 'text', ph: 'e.g. Summer Sale, Monsoon Mega Deal' },
              { label: 'Discount %',   key: 'discountPercent', type: 'number', ph: '20' },
              { label: 'Ends On (optional)', key: 'endsAt', type: 'date', ph: '' },
            ].map(({ label, key, type, ph }) => (
              <div key={key} style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>{label}</label>
                <input type={type} placeholder={ph} value={saleForm[key]} onChange={e => setSaleForm(f => ({ ...f, [key]: e.target.value }))} style={inp}/>
              </div>
            ))}

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Quick select by category</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {categories.map(cat => (
                  <button key={cat} onClick={() => selectCat(cat)} style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer', fontWeight: 600, textTransform: 'capitalize' }}>{cat}</button>
                ))}
                <button onClick={selectAll} style={{ background: `${M}15`, border: `1px solid ${M}40`, borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer', fontWeight: 600, color: M }}>All</button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={launchSale} disabled={loading} style={{ flex: 1, background: M, color: '#fff', border: 'none', borderRadius: 8, padding: '10px', cursor: 'pointer', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                {loading ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }}/> : <Zap size={14}/>}
                Launch Sale
              </button>
              <button onClick={endSale} disabled={loading || !selected.length} style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                End Sale
              </button>
            </div>
            <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
          </div>

          {/* Product selector */}
          <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#1f2937', display: 'flex', alignItems: 'center', gap: 6 }}><Package size={14} color={M}/> Select Products ({selected.length} selected)</div>
              <button onClick={() => setSelected([])} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#9ca3af' }}>Clear</button>
            </div>
            <div style={{ maxHeight: 440, overflowY: 'auto' }}>
              {products.map(p => {
                const sel = selected.includes(p._id);
                return (
                  <div key={p._id} onClick={() => toggleProduct(p._id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px', borderBottom: '1px solid #f9fafb', cursor: 'pointer', background: sel ? `${M}06` : '#fff', transition: 'background 0.1s' }}>
                    <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${sel ? M : '#d1d5db'}`, background: sel ? M : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {sel && <Check size={11} color="#fff"/>}
                    </div>
                    <img src={p.images?.[0]} alt={p.name} style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', background: '#f3f4f6', flexShrink: 0 }} onError={e => e.target.style.display='none'}/>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: '#1f2937' }}>{p.name}</div>
                      <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'capitalize' }}>{p.category}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: M }}>{fmt(p.price)}</div>
                      {p.saleActive && <div style={{ fontSize: 10, background: '#fef2f2', color: '#dc2626', padding: '1px 6px', borderRadius: 999, fontWeight: 700 }}>SALE {p.saleDiscount}%</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── WIN-BACK CAMPAIGN ── */}
      {tab === 'winback' && (
        <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 20, alignItems: 'start' }}>
          <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, color: '#1f2937', display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={15} color={M}/> Win-Back Campaign</div>
            <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16, lineHeight: 1.6 }}>Send emotional re-engagement emails to customers who haven't ordered in a while, with a personal voucher.</p>

            {[
              { label: 'Inactive for (days)', key: 'daysSinceOrder', type: 'number' },
              { label: 'Voucher Discount %', key: 'voucherDiscount', type: 'number' },
            ].map(({ label, key, type }) => (
              <div key={key} style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>{label}</label>
                <input type={type} value={winbackForm[key]} onChange={e => setWinbackForm(f => ({ ...f, [key]: e.target.value }))} style={inp}/>
              </div>
            ))}

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Custom message (optional)</label>
              <textarea value={winbackForm.customMessage} onChange={e => setWinbackForm(f => ({ ...f, customMessage: e.target.value }))} rows={3} placeholder="We miss you! It's been a while since we've seen you..." style={{ ...inp, resize: 'vertical' }}/>
            </div>

            <button onClick={sendWinback} disabled={loading} style={{ width: '100%', background: M, color: '#fff', border: 'none', borderRadius: 8, padding: '10px', cursor: 'pointer', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {loading ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }}/> : <Mail size={14}/>}
              Send Campaign
            </button>
          </div>

          {/* Preview */}
          <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 14, color: '#1f2937' }}>Email Preview</div>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ background: M, padding: '16px 20px', color: '#fff' }}>
                <div style={{ fontWeight: 800, fontSize: 16 }}>DermaFlow</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>We miss you, [Name]</div>
              </div>
              <div style={{ padding: '20px', fontSize: 13, color: '#4b5563', lineHeight: 1.8 }}>
                <p>Hi <strong>[Name]</strong>,</p>
                <p>It's been a while since we've seen you, and honestly — we miss you. Your skin deserves the best, and we want to make sure you have everything you need.</p>
                {winbackForm.customMessage && <p style={{ fontStyle: 'italic', color: M }}>{winbackForm.customMessage}</p>}
                <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 10, padding: '14px', margin: '16px 0', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>A GIFT, JUST FOR YOU</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 900, color: M, letterSpacing: '0.15em' }}>MISSYOUXXXX</div>
                  <div style={{ fontSize: 12, color: '#78350f', marginTop: 4 }}>{winbackForm.voucherDiscount}% OFF — valid for 14 days</div>
                </div>
                <p style={{ color: '#9ca3af', fontSize: 11 }}>With love, The DermaFlow Team</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ACTIVE SALES ── */}
      {tab === 'active' && (
        <ActiveSalesTab tok={tok} API={API} fmt={fmt} M={M}/>
      )}
    </div>
  );
}

function ActiveSalesTab({ tok, API, fmt, M }) {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    axios.get(`${API}/sales`, tok()).then(r => setSales(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);
  if (loading) return <div style={{ color: '#9ca3af', textAlign: 'center', padding: '40px' }}>Loading...</div>;
  if (!sales.length) return (
    <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: 14, border: '1px solid #f0f0f0', color: '#9ca3af' }}>
      <Tag size={32} color="#e5e7eb" style={{ margin: '0 auto 10px', display: 'block' }}/>
      <p>No active sales. Launch one from the "Launch Sale" tab.</p>
    </div>
  );
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 14 }}>
      {sales.map(p => (
        <div key={p._id} style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <img src={p.images?.[0]} alt={p.name} style={{ width: '100%', height: 120, objectFit: 'cover', background: '#f3f4f6' }} onError={e => e.target.style.display='none'}/>
          <div style={{ padding: '12px 14px' }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{p.name}</div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontWeight: 800, color: '#dc2626', fontSize: 14 }}>{fmt(Math.round(p.price * (1 - p.saleDiscount/100)))}</span>
              <span style={{ textDecoration: 'line-through', color: '#9ca3af', fontSize: 11 }}>{fmt(p.price)}</span>
              <span style={{ background: '#fef2f2', color: '#dc2626', fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 999 }}>{p.saleDiscount}% OFF</span>
            </div>
            <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 4 }}>{p.saleLabel}</div>
            {p.saleEndsAt && <div style={{ fontSize: 10, color: '#d97706', marginTop: 2 }}>Ends {new Date(p.saleEndsAt).toLocaleDateString('en-IN')}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
