import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ShieldCheck, ShieldAlert, Lock, Users, Activity, 
  EyeOff, Cpu, Database, RefreshCw, UserCheck 
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

  // 1. Fetch Audit Logs
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/erp/audit-log`, tok());
      setAuditLog(res.data.logs || []);
    } catch (err) { console.error("Audit fetch failed:", err); }
    setLoading(false);
  };

  // 2. Fetch Masked Users (PII Tab)
  const fetchPiiUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/users`, tok()); // Uses your masked route
      setPiiUsers(res.data || []);
    } catch (err) { console.error("PII fetch failed:", err); }
    setLoading(false);
  };

  const runSentimentAnalysis = async () => {
    setLoading(true);
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
    padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
    fontSize: '0.85rem', fontWeight: 600,
    background: tab === t ? R : '#fff', color: tab === t ? '#fff' : '#6b7280',
    border: `1px solid ${tab === t ? R : '#e5e7eb'}`,
    transition: '0.3s'
  });

  return (
    <div style={{ padding: '20px', backgroundColor: '#fcfcfc', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: `2px solid ${R}`, paddingBottom: '10px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: R, margin: 0 }}>Security & Audit SOC</h1>
        <button onClick={tab === 'audit' ? fetchLogs : fetchPiiUsers} style={{ background: 'none', border: 'none', cursor: 'pointer', color: R }}>
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
        <button onClick={() => setTab('audit')} style={tabStyle('audit')}><Database size={16}/> Audit Trail</button>
        <button onClick={() => setTab('masking')} style={tabStyle('masking')}><EyeOff size={16}/> PII Masking</button>
        <button onClick={() => setTab('vibe')} style={tabStyle('vibe')}><Cpu size={16}/> Sentiment QA</button>
      </div>

      {/* ── AUDIT LOG TAB ── */}
      {tab === 'audit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {auditLog.length > 0 ? auditLog.map((log) => (
            <div key={log._id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                {log.riskLevel === 'high' ? <ShieldAlert color="#dc2626" /> : <ShieldCheck color="#16a34a" />}
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827' }}>{log.action.replace(/_/g, ' ')}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{log.description}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.7rem', color: '#9ca3af' }}>
                <div style={{ fontWeight: 600, color: R }}>{log.adminName || 'System'}</div>
                <div>{new Date(log.createdAt).toLocaleString()}</div>
              </div>
            </div>
          )) : <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af' }}>No logs found. Perform an action to generate logs.</div>}
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
              {piiUsers.map(u => (
                <tr key={u._id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '12px 20px', fontWeight: 600 }}><UserCheck size={14} style={{display:'inline', marginRight:'8px'}}/> {u.name}</td>
                  <td style={{ padding: '12px 20px', color: '#D97706', fontFamily: 'monospace' }}>{u.email}</td>
                  <td style={{ padding: '12px 20px' }}><span style={{ background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>{u.role}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── SENTIMENT QA TAB ── */}
   {tab === 'vibe' && vibeData && (
  <div style={{ marginTop: '20px' }}>
    {/* Distribution Bars */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '20px' }}>
      <div style={{ background: '#f0fdf4', padding: '15px', borderRadius: '10px', textAlign: 'center' }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16a34a' }}>{vibeData.positiveThemes?.length || 0}</div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700 }}>POSITIVE THEMES</div>
      </div>
      <div style={{ background: '#fef2f2', padding: '15px', borderRadius: '10px', textAlign: 'center' }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#dc2626' }}>{vibeData.negativeThemes?.length || 0}</div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700 }}>CRITICAL ALERTS</div>
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
      {/* Detailed Keyword Lists */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', padding: '20px', borderRadius: '12px' }}>
        <h4 style={{ color: '#16a34a', fontSize: '0.8rem', marginBottom: '10px' }}>TOP POSITIVE KEYWORDS</h4>
        {vibeData.positiveThemes?.map(t => (
          <div key={t.word} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '5px 0', borderBottom: '1px solid #f9fafb' }}>
            <span style={{ textTransform: 'capitalize' }}>{t.word}</span>
            <strong>{t.count}</strong>
          </div>
        ))}
      </div>
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', padding: '20px', borderRadius: '12px' }}>
        <h4 style={{ color: '#dc2626', fontSize: '0.8rem', marginBottom: '10px' }}>TOP NEGATIVE KEYWORDS</h4>
        {vibeData.negativeThemes?.map(t => (
          <div key={t.word} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '5px 0', borderBottom: '1px solid #f9fafb' }}>
            <span style={{ textTransform: 'capitalize' }}>{t.word}</span>
            <strong>{t.count}</strong>
          </div>
        ))}
      </div>
    </div>
  </div>
)}
    </div>
  );
}