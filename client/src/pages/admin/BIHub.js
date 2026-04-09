import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  TrendingUp, Target, Cloud, BarChart3, 
  Globe, Settings, ShieldCheck, Zap, 
  Search, Users, Activity, PieChart, ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const M = '#4A0E2E'; // Brand Maroon
const tok = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

export default function BIHub() {
  const [tab, setTab] = useState('financials');
  const [loading, setLoading] = useState(false);

  const tabStyle = (t) => ({
    padding: '12px 24px',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    transition: '0.3s',
    background: tab === t ? M : 'transparent',
    color: tab === t ? '#fff' : '#6b7280',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  });

  return (
    <div className="p-8 max-w-7xl mx-auto bg-[#FCFAFA] min-h-screen font-sans">
      {/* 1. Header */}
      <header className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Business Intelligence</h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2 flex items-center gap-2">
            <Activity size={14} className="text-green-500"/> Cross-Pillar Analytics Engine
          </p>
        </div>
        <div className="flex bg-gray-100 p-1.5 rounded-2xl gap-1">
          <button style={tabStyle('financials')} onClick={() => setTab('financials')}><TrendingUp size={14}/> Revenue</button>
          <button style={tabStyle('growth')} onClick={() => setTab('growth')}><Target size={14}/> Growth</button>
          <button style={tabStyle('cloud')} onClick={() => setTab('cloud')}><Cloud size={14}/> Infrastructure</button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.div 
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* ── TAB 1: FINANCIALS (Merged RevenueDashboard) ── */}
          {tab === 'financials' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <KPICard title="Projected ARR" value="₹38.3L" icon={BarChart3} sub="Annual Target" />
              <KPICard title="Avg Order Value" value="₹1,840" icon={Activity} sub="Last 30 Days" />
              <KPICard title="Subscription Share" value="16%" icon={PieChart} sub="Recurring Revenue" />

              <div className="md:col-span-3 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6">Primary Revenue Streams</h3>
                <div className="space-y-6">
                  <StreamBar label="Sales Revenue Model (Direct B2C)" pct={82} val="₹30.5L" color={M} />
                  <StreamBar label="Subscription Model (Box)" pct={15} val="₹5.6L" color="#1d4ed8" />
                  <StreamBar label="Affiliate Model (Influencer)" pct={3} val="₹2.1L" color="#047857" />
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 2: GROWTH (Merged MarketingDashboard) ── */}
          {tab === 'growth' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                  <Search size={16}/> SEO Keyword Ranking
                </h3>
                <div className="space-y-4">
                  {['Niacinamide Serum', 'Hyaluronic Moisturizer', 'Beginner Retinol'].map((kw, i) => (
                    <div key={kw} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                      <span className="text-sm font-bold text-gray-700">{kw}</span>
                      <span className="text-xs font-black text-green-600 bg-white px-3 py-1 rounded-full shadow-sm">Rank #{i+2}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                  <Users size={16}/> Customer Acquisition
                </h3>
                <div className="space-y-4">
                  <StreamBar label="Organic Search" pct={38} val="12k" color="#16a34a" />
                  <StreamBar label="Email Automation" pct={26} val="8k" color={M} />
                  <StreamBar label="Social / Reels" pct={22} val="5k" color="#d97706" />
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 3: INFRASTRUCTURE (Merged Deployment) ── */}
          {tab === 'cloud' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <DeployCard title="Frontend" status="Live" platform="Vercel" icon={Globe} />
                <DeployCard title="Backend API" status="Live" platform="Render" icon={Settings} />
                <DeployCard title="Database" status="Connected" platform="Atlas" icon={ShieldCheck} />
                <DeployCard title="SSL/Security" status="Active" platform="LetsEncrypt" icon={ShieldCheck} />
              </div>
              
              <div className="bg-gray-900 p-8 rounded-[2.5rem] text-white">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-6">Production Environment Variables</h3>
                <div className="bg-black/30 p-6 rounded-2xl font-mono text-xs text-green-400 overflow-x-auto">
                  <div>API_GATEWAY=https://api.dermaflow.com</div>
                  <div>DATABASE_CLUSTER=mongodb+srv://prod_main</div>
                  <div>SECURITY_PROTOCOL=AES-256-GCM</div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Reusable Components ──

function KPICard({ title, value, icon: Icon, sub }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
      <div className="p-3 bg-gray-50 w-fit rounded-xl mb-4" style={{ color: M }}><Icon size={20}/></div>
      <div className="text-2xl font-black text-gray-900">{value}</div>
      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{title}</div>
      <div className="text-[9px] font-black text-gray-300 uppercase mt-4">{sub}</div>
    </div>
  );
}

function StreamBar({ label, pct, val, color }) {
  return (
    <div>
      <div className="flex justify-between items-end mb-2">
        <span className="text-xs font-black text-gray-700 uppercase tracking-tighter">{label}</span>
        <span className="text-xs font-black text-gray-900">{val}</span>
      </div>
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }} 
          animate={{ width: `${pct}%` }} 
          className="h-full rounded-full" 
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

function DeployCard({ title, status, platform, icon: Icon }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
      <div className="p-2 bg-gray-50 rounded-lg" style={{ color: M }}><Icon size={18}/></div>
      <div>
        <div className="text-[10px] font-black text-gray-900 uppercase">{title}</div>
        <div className="text-[9px] font-bold text-green-600 uppercase flex items-center gap-1">
          <div className="w-1 h-1 bg-green-500 rounded-full" /> {status}
        </div>
        <div className="text-[9px] font-bold text-gray-300 uppercase">{platform}</div>
      </div>
    </div>
  );
}