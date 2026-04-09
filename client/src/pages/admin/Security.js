import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ShieldCheck, ShieldAlert, EyeOff, Cpu, Database, RefreshCw, UserCheck, Play
} from 'lucide-react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const tok = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
const R = '#4A0E2E';

export default function Security() {
  const [tab, setTab] = useState('audit');
  const [auditLog, setAuditLog] = useState([]);
  const [piiUsers, setPiiUsers] = useState([]);
  const [vibeData, setVibeData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/erp/audit-log`, tok());
      setAuditLog(res.data.logs || []);
    } catch (err) { console.error("Audit fetch failed:", err); }
    setLoading(false);
  };

  const fetchPiiUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/users`, tok());
      setPiiUsers(res.data || []);
    } catch (err) { console.error("PII fetch failed:", err); }
    setLoading(false);
  };

  const runSentimentAnalysis = async () => {
    setLoading(true);
    setVibeData(null);
    try {
      const res = await axios.get(`${API}/admin/sentiment-vibe`, tok());
      setVibeData(res.data);
    } catch (err) { console.error("NLP Analysis failed:", err); }
    setLoading(false);
  };

  useEffect(() => {
    if (tab === 'audit') fetchLogs();
    if (tab === 'masking') fetchPiiUsers();
  }, [tab]);

  const tabStyle = (t) => ({
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer',
    fontSize: '0.85rem', fontWeight: 600,
    background: tab === t ? R : '#fff', color: tab === t ? '#fff' : '#6b7280',
    border: `1px solid ${tab === t ? R : '#e5e7eb'}`,
    transition: '0.3s'
  });

  const riskColor = (level) => {
    if (level === 'critical') return '#7c2d12';
    if (level === 'high') return '#dc2626';
    if (level === 'medium') return '#d97706';
    return '#16a34a';
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#fcfcfc', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: `2px solid ${R}`, paddingBottom: '10px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: R, margin: 0 }}>Security & Audit SOC</h1>
        <button
          onClick={tab === 'audit' ? fetchLogs : tab === 'masking' ? fetchPiiUsers : runSentimentAnalysis}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: R }}
        >
          <RefreshCw size={20} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
        <button onClick={() => setTab('audit')} style={tabStyle('audit')}><Database size={16} /> Audit Trail</button>
        <button onClick={() => setTab('masking')} style={tabStyle('masking')}><EyeOff size={16} /> PII Masking</button>
        <button onClick={() => setTab('vibe')} style={tabStyle('vibe')}><Cpu size={16} /> Sentiment QA</button>
      </div>

      {/* ── AUDIT LOG TAB ── */}
      {tab === 'audit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {loading && <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af' }}>Loading logs...</div>}
          {!loading && auditLog.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              No logs found. Change an order status to generate the first log.
            </div>
          )}
          {auditLog.map((log) => (
            <div key={log._id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                {['high','critical'].includes(log.riskLevel)
                  ? <ShieldAlert color="#dc2626" size={20} />
                  : <ShieldCheck color="#16a34a" size={20} />}
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827' }}>
                    {log.action?.replace(/_/g, ' ')}
                    <span style={{ marginLeft: '8px', fontSize: '0.7rem', fontWeight: 600, padding: '2px 7px', borderRadius: '10px', background: log.riskLevel === 'high' ? '#fef2f2' : '#f0fdf4', color: riskColor(log.riskLevel) }}>
                      {log.riskLevel?.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>{log.description}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.7rem', color: '#9ca3af', flexShrink: 0, marginLeft: '20px' }}>
                <div style={{ fontWeight: 600, color: R }}>{log.adminName || 'System'}</div>
                <div>{new Date(log.createdAt).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── PII MASKING TAB ── */}
      {tab === 'masking' && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              <tr>
                <th style={{ padding: '12px 20px', color: '#4B5563' }}>Customer</th>
                <th style={{ padding: '12px 20px', color: '#4B5563' }}>Email (Masked)</th>
                <th style={{ padding: '12px 20px', color: '#4B5563' }}>Role</th>
              </tr>
            </thead>
            <tbody>
              {piiUsers.map(u => {
                // Mask email: sh***@gmail.com
                const [localPart, domain] = (u.email || '').split('@');
                const masked = localPart.length > 2
                  ? localPart.slice(0, 2) + '***@' + domain
                  : '***@' + domain;
                return (
                  <tr key={u._id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '12px 20px', fontWeight: 600 }}>
                      <UserCheck size={14} style={{ display: 'inline', marginRight: '8px' }} />
                      {u.name}
                    </td>
                    <td style={{ padding: '12px 20px', color: '#D97706', fontFamily: 'monospace' }}>{masked}</td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{ background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>
                        {u.role}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── SENTIMENT QA TAB ── */}
      {tab === 'vibe' && (
        <div>
          {/* Run button — always visible on this tab */}
          {!vibeData && !loading && (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <Cpu size={40} color="#d1d5db" style={{ marginBottom: '16px' }} />
              <p style={{ color: '#6b7280', marginBottom: '20px', fontSize: '0.9rem' }}>
                Run NLP analysis on all customer reviews to generate the sentiment report.
              </p>
              <button
                onClick={runSentimentAnalysis}
                style={{ background: R, color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <Play size={16} /> Run Sentiment Analysis
              </button>
            </div>
          )}

          {loading && (
            <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
              Analysing reviews...
            </div>
          )}

          {vibeData && !loading && (
            <div>
              {/* Vibe banner */}
              <div style={{ background: R, color: '#fff', borderRadius: '12px', padding: '20px 24px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{vibeData.vibe}</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '6px' }}>{vibeData.aiSummary}</div>
                </div>
                <button
                  onClick={runSentimentAnalysis}
                  style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '8px', padding: '8px 16px', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}
                >
                  <RefreshCw size={14} /> Re-run
                </button>
              </div>

              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                {[
                  { label: 'Total Reviews', value: vibeData.totalReviews, bg: '#f8fafc', color: '#334155' },
                  { label: 'Positive', value: vibeData.distribution?.positive, bg: '#f0fdf4', color: '#16a34a' },
                  { label: 'Negative', value: vibeData.distribution?.negative, bg: '#fef2f2', color: '#dc2626' },
                  { label: 'Quality Alerts', value: vibeData.alertCount, bg: '#fffbeb', color: '#d97706' },
                ].map(s => (
                  <div key={s.label} style={{ background: s.bg, padding: '14px', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color }}>{s.value ?? 0}</div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6b7280', marginTop: '4px' }}>{s.label.toUpperCase()}</div>
                  </div>
                ))}
              </div>

              {/* Action required banner */}
              {vibeData.requiresAction && (
                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '10px', padding: '12px 20px', marginBottom: '20px', color: '#dc2626', fontWeight: 600, fontSize: '0.85rem' }}>
                  ⚠️ Action required — high negative sentiment or quality alerts detected. Review flagged keywords below.
                </div>
              )}

              {/* Keyword lists */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', padding: '20px', borderRadius: '12px' }}>
                  <h4 style={{ color: '#16a34a', fontSize: '0.8rem', marginBottom: '12px', margin: '0 0 12px' }}>TOP POSITIVE KEYWORDS</h4>
                  {vibeData.positiveThemes?.length === 0 && <p style={{ color: '#9ca3af', fontSize: '0.8rem' }}>None detected</p>}
                  {vibeData.positiveThemes?.map(t => (
                    <div key={t.word} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '6px 0', borderBottom: '1px solid #f9fafb' }}>
                      <span style={{ textTransform: 'capitalize' }}>{t.word}</span>
                      <span style={{ background: '#f0fdf4', color: '#16a34a', fontWeight: 700, padding: '1px 8px', borderRadius: '10px', fontSize: '0.75rem' }}>{t.count}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', padding: '20px', borderRadius: '12px' }}>
                  <h4 style={{ color: '#dc2626', fontSize: '0.8rem', marginBottom: '12px', margin: '0 0 12px' }}>TOP NEGATIVE KEYWORDS</h4>
                  {vibeData.negativeThemes?.length === 0 && <p style={{ color: '#9ca3af', fontSize: '0.8rem' }}>None detected</p>}
                  {vibeData.negativeThemes?.map(t => (
                    <div key={t.word} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '6px 0', borderBottom: '1px solid #f9fafb' }}>
                      <span style={{ textTransform: 'capitalize' }}>{t.word}</span>
                      <span style={{ background: '#fef2f2', color: '#dc2626', fontWeight: 700, padding: '1px 8px', borderRadius: '10px', fontSize: '0.75rem' }}>{t.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}