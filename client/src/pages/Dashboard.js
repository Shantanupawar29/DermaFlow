import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const tok = () => localStorage.getItem('token');
const R   = '#7B2D3C';

// ── Icon components (no emoji) ────────────────────────────────────────────────
const Icon = ({ d, size = 18, color = 'currentColor', stroke = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const StarIcon    = (p) => <Icon {...p} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />;
const BoxIcon     = (p) => <Icon {...p} d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />;
const WalletIcon  = (p) => <Icon {...p} d="M21 12V7H5a2 2 0 010-4h14v4M21 12a2 2 0 010 4H5a2 2 0 010 4h16v-4" />;
const TierIcon    = (p) => <Icon {...p} d="M12 15l-3-3 3-3 3 3-3 3zM2 12l5 5 5-5-5-5-5 5zM17 7l5 5-5 5-5-5 5-5z" />;
const ShopIcon    = (p) => <Icon {...p} d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />;
const SkinIcon    = (p) => <Icon {...p} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />;
const CartIcon    = (p) => <Icon {...p} d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z M9 22V12h6v10" />;
const GiftIcon    = (p) => <Icon {...p} d="M20 12v10H4V12M22 7H2v5h20V7zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />;
const TicketIcon  = (p) => <Icon {...p} d="M2 9a3 3 0 010-6h20a3 3 0 010 6H2M2 15a3 3 0 010 6h20a3 3 0 010-6H2" />;
const LogoutIcon  = (p) => <Icon {...p} d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />;
const CheckIcon   = (p) => <Icon {...p} d="M20 6L9 17l-5-5" />;

const TIER_STYLE = {
  bronze:   { color:'#d97706', bg:'#fef3c7', bar:'#f59e0b', label:'Bronze',   next:'Spend ₹5,000 for Silver' },
  silver:   { color:'#64748b', bg:'#f1f5f9', bar:'#94a3b8', label:'Silver',   next:'Spend ₹20,000 for Gold' },
  gold:     { color:'#b45309', bg:'#fefce8', bar:'#eab308', label:'Gold',     next:'Spend ₹50,000 for Platinum' },
  platinum: { color:'#7c3aed', bg:'#ede9fe', bar:'#8b5cf6', label:'Platinum', next:"You're at the top tier!" },
};

const STATUS_STYLE = {
  pending:    { bg:'#fefce8', color:'#d97706' },
  processing: { bg:'#eff6ff', color:'#1d4ed8' },
  confirmed:  { bg:'#f0fdf4', color:'#16a34a' },
  shipped:    { bg:'#f0fdfa', color:'#0d9488' },
  delivered:  { bg:'#dcfce7', color:'#15803d' },
  cancelled:  { bg:'#fef2f2', color:'#dc2626' },
};

function Tab({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{ padding:'0.45rem 1.1rem', borderRadius:'9999px', border:'none', cursor:'pointer', fontSize:'0.85rem', fontWeight:600, background:active?R:'transparent', color:active?'#fff':'#6b7280', transition:'all 0.15s' }}>
      {label}
    </button>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{ background:'#fff', border:'1px solid #f3f4f6', borderRadius:'1rem', padding:'1.25rem', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
      <div style={{ color: color||'#6b7280', marginBottom:'0.5rem' }}>{icon}</div>
      <div style={{ fontSize:'1.5rem', fontWeight:800, color: color||'#1f2937', lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:'0.75rem', color:'#9ca3af', marginTop:'0.3rem' }}>{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [u,       setU]       = useState(null);
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState('overview');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    Promise.all([
      axios.get(`${API}/auth/me`,          { headers:{ Authorization:`Bearer ${tok()}` } }),
      axios.get(`${API}/orders/my-orders`, { headers:{ Authorization:`Bearer ${tok()}` } }),
    ])
      .then(([ur, or]) => { setU(ur.data.user); setOrders(or.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, navigate]);

  if (!user || loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh', color:'#6b7280' }}>
      <span>Loading dashboard...</span>
    </div>
  );

  const cu         = u || user;
  const tier       = TIER_STYLE[cu.loyaltyTier] || TIER_STYLE.bronze;
  const totalSpent = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const pct        = Math.min((totalSpent / ({ bronze:500000, silver:2000000, gold:5000000, platinum:5000000 }[cu.loyaltyTier]||500000)) * 100, 100);
  const activeVouchers = (cu.vouchers||[]).filter(v => !v.isUsed && new Date(v.expiresAt) > new Date());

  return (
    <div style={{ maxWidth:960, margin:'0 auto', padding:'2rem 1rem', fontFamily:'system-ui,sans-serif' }}>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.75rem', flexWrap:'wrap', gap:'1rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.875rem' }}>
          <div style={{ width:48, height:48, borderRadius:'50%', background:`linear-gradient(135deg,${R},#4A0E2E)`, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:'1.1rem' }}>
            {cu.name?.[0]?.toUpperCase()||'U'}
          </div>
          <div>
            <h1 style={{ fontSize:'1.35rem', fontWeight:800, color:'#1f2937', margin:0 }}>Hello, {cu.name?.split(' ')[0]}</h1>
            <p style={{ color:'#9ca3af', fontSize:'0.8rem', margin:0 }}>{cu.email}</p>
          </div>
        </div>
        <div style={{ display:'flex', gap:'0.6rem' }}>
          <Link to="/products" style={{ display:'flex', alignItems:'center', gap:'0.4rem', padding:'0.5rem 1rem', background:R, color:'#fff', borderRadius:'0.6rem', textDecoration:'none', fontSize:'0.85rem', fontWeight:700 }}>
            <ShopIcon size={15} color="#fff" /> Shop
          </Link>
          <button onClick={() => { logout(); navigate('/'); }}
            style={{ display:'flex', alignItems:'center', gap:'0.4rem', padding:'0.5rem 1rem', border:'1px solid #e5e7eb', borderRadius:'0.6rem', background:'#fff', color:'#6b7280', cursor:'pointer', fontSize:'0.85rem' }}>
            <LogoutIcon size={15} /> Sign Out
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:'0.875rem', marginBottom:'1.5rem' }}>
        <StatCard icon={<StarIcon size={20} color={R} />}          label="Glow Points"  value={cu.glowPoints||0}                                                    color={R} />
        <StatCard icon={<BoxIcon size={20} color="#1d4ed8" />}     label="Orders"       value={orders.length}                                                       color="#1d4ed8" />
        <StatCard icon={<WalletIcon size={20} color="#047857" />}  label="Total Spent"  value={`₹${((totalSpent)/100).toFixed(0)}`}                                color="#047857" />
        <StatCard icon={<TierIcon size={20} color={tier.color} />} label="Loyalty Tier" value={tier.label}                                                          color={tier.color} />
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:'0.25rem', background:'#f3f4f6', borderRadius:'9999px', padding:'0.3rem', width:'fit-content', marginBottom:'1.5rem' }}>
        {['overview','orders','rewards','vouchers'].map(t => (
          <Tab key={t} label={t.charAt(0).toUpperCase()+t.slice(1)} active={tab===t} onClick={() => setTab(t)} />
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === 'overview' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:'1rem' }}>

          {/* Loyalty card */}
          <div style={{ background:`linear-gradient(135deg,${tier.bg},#fff)`, border:`1.5px solid ${tier.color}30`, borderRadius:'1.25rem', padding:'1.5rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1rem' }}>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:'0.4rem', fontWeight:800, color:tier.color, fontSize:'0.9rem' }}>
                  <TierIcon size={16} color={tier.color} /> {tier.label.toUpperCase()}
                </div>
                <div style={{ fontSize:'0.75rem', color:'#6b7280', marginTop:'0.2rem' }}>{tier.next}</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:'1.75rem', fontWeight:800, color:tier.color, lineHeight:1 }}>{cu.glowPoints||0}</div>
                <div style={{ fontSize:'0.7rem', color:'#9ca3af' }}>Glow Points</div>
              </div>
            </div>
            <div style={{ background:'#e5e7eb', borderRadius:'999px', height:7, overflow:'hidden' }}>
              <div style={{ height:7, background:tier.bar, width:`${pct}%`, borderRadius:'999px', transition:'width 0.8s ease' }} />
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:'0.4rem', fontSize:'0.72rem', color:'#9ca3af' }}>
              <span>₹{(totalSpent/100).toFixed(0)} spent</span>
              <span>500 pts = ₹50 off</span>
            </div>
          </div>

          {/* Quick actions */}
          <div style={{ background:'#fff', border:'1px solid #f3f4f6', borderRadius:'1.25rem', padding:'1.5rem', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontWeight:700, color:'#1f2937', marginBottom:'0.875rem', fontSize:'0.95rem' }}>Quick Actions</h3>
            {[
              { to:'/products', Icon:ShopIcon,  label:'Browse All Products' },
              { to:'/cart',     Icon:CartIcon,  label:'View Cart' },
            ].map(a => (
              <Link key={a.to} to={a.to} style={{ display:'flex', alignItems:'center', gap:'0.65rem', background:'#f9fafb', borderRadius:'0.6rem', padding:'0.65rem 0.875rem', textDecoration:'none', color:'#374151', fontSize:'0.875rem', fontWeight:500, marginBottom:'0.5rem', border:'1px solid #f3f4f6' }}>
                <a.Icon size={16} color={R} /> {a.label}
              </Link>
            ))}
          </div>

          {/* Latest order */}
          {orders.length > 0 && (() => {
            const o = orders[0];
            const sc = STATUS_STYLE[o.status] || STATUS_STYLE.pending;
            return (
              <div style={{ background:'#fff', border:'1px solid #f3f4f6', borderRadius:'1.25rem', padding:'1.5rem', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontWeight:700, color:'#1f2937', marginBottom:'0.875rem', fontSize:'0.95rem', display:'flex', alignItems:'center', gap:'0.4rem' }}>
                  <BoxIcon size={16} color={R} /> Latest Order
                </h3>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.4rem' }}>
                  <span style={{ fontWeight:700, fontSize:'0.875rem' }}>#{o._id.slice(-8).toUpperCase()}</span>
                  <span style={{ background:sc.bg, color:sc.color, fontSize:'0.7rem', fontWeight:700, padding:'0.2rem 0.6rem', borderRadius:999 }}>{o.status?.toUpperCase()}</span>
                </div>
                <div style={{ fontSize:'0.8rem', color:'#6b7280', marginBottom:'0.5rem' }}>{(o.items||[]).map(i=>i.name).join(', ')}</div>
                <div style={{ fontWeight:800, color:R }}>₹{((o.totalAmount||0)/100).toFixed(2)}</div>
                <button onClick={() => setTab('orders')} style={{ marginTop:'0.75rem', fontSize:'0.8rem', color:R, background:'none', border:'none', cursor:'pointer', fontWeight:600, padding:0 }}>
                  View all orders →
                </button>
              </div>
            );
          })()}
        </div>
      )}

      {/* ── ORDERS ── */}
      {tab === 'orders' && (
        <div>
          {orders.length === 0 ? (
            <div style={{ textAlign:'center', padding:'3rem', color:'#9ca3af' }}>
              <BoxIcon size={40} color="#d1d5db" />
              <p style={{ marginTop:'0.75rem', marginBottom:'1.25rem' }}>No orders yet</p>
              <Link to="/products" style={{ background:R, color:'#fff', padding:'0.65rem 1.5rem', borderRadius:9999, textDecoration:'none', fontSize:'0.875rem', fontWeight:600 }}>Start Shopping</Link>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
              {orders.map(o => {
                const sc = STATUS_STYLE[o.status] || STATUS_STYLE.pending;
                return (
                  <div key={o._id} style={{ background:'#fff', border:'1px solid #f3f4f6', borderRadius:'1rem', padding:'1.25rem', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:'0.5rem', marginBottom:'0.5rem' }}>
                      <div>
                        <p style={{ fontWeight:700, fontSize:'0.9rem', color:'#1f2937', margin:0 }}>#{o._id.slice(-8).toUpperCase()}</p>
                        <p style={{ fontSize:'0.75rem', color:'#9ca3af', margin:0 }}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</p>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
                        <span style={{ background:sc.bg, color:sc.color, fontSize:'0.7rem', fontWeight:700, padding:'0.2rem 0.6rem', borderRadius:999 }}>{o.status?.toUpperCase()}</span>
                        <span style={{ fontWeight:800, color:R }}>₹{((o.totalAmount||0)/100).toFixed(2)}</span>
                      </div>
                    </div>
                    <p style={{ fontSize:'0.82rem', color:'#6b7280', margin:0 }}>{(o.items||[]).map(i=>i.name).join(', ')||'—'}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── REWARDS ── */}
      {tab === 'rewards' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))', gap:'1rem' }}>
          {[
            { pts:0,    label:'Welcome Bonus',         Icon:GiftIcon,   desc:'Signed up' },
            { pts:100,  label:'₹10 off next order',    Icon:TicketIcon, desc:'100 pts needed' },
            { pts:250,  label:'Free delivery',         Icon:BoxIcon,    desc:'250 pts needed' },
            { pts:500,  label:'₹50 off any order',     Icon:StarIcon,   desc:'500 pts needed' },
            { pts:1000, label:'₹150 off + free gift',  Icon:GiftIcon,   desc:'1000 pts needed' },
          ].map(r => {
            const done = r.pts === 0 || (cu.glowPoints||0) >= r.pts;
            return (
              <div key={r.pts} style={{ background:done?'linear-gradient(135deg,#f0fdf4,#dcfce7)':'#fff', border:done?'2px solid #86efac':'1px solid #f3f4f6', borderRadius:'1rem', padding:'1.25rem', position:'relative', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
                {done && (
                  <div style={{ position:'absolute', top:10, right:10, background:'#16a34a', color:'#fff', borderRadius:999, padding:'0.15rem 0.45rem', fontSize:'0.65rem', fontWeight:700, display:'flex', alignItems:'center', gap:'2px' }}>
                    <CheckIcon size={10} color="#fff" /> Done
                  </div>
                )}
                <div style={{ color:done?'#16a34a':R, marginBottom:'0.5rem' }}>
                  <r.Icon size={24} color={done?'#16a34a':R} />
                </div>
                <div style={{ fontWeight:700, color:'#1f2937', marginBottom:'0.2rem', fontSize:'0.9rem' }}>{r.label}</div>
                <div style={{ fontSize:'0.78rem', color:'#6b7280' }}>{r.desc}</div>
                {!done && (
                  <div style={{ marginTop:'0.75rem' }}>
                    <div style={{ background:'#e5e7eb', borderRadius:999, height:5, overflow:'hidden' }}>
                      <div style={{ height:5, background:R, width:`${Math.min(((cu.glowPoints||0)/r.pts)*100,100)}%`, borderRadius:999 }} />
                    </div>
                    <div style={{ fontSize:'0.7rem', color:'#9ca3af', marginTop:'0.3rem' }}>{cu.glowPoints||0} / {r.pts} pts</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── VOUCHERS ── */}
      {tab === 'vouchers' && (
        <div>
          {activeVouchers.length === 0 ? (
            <div style={{ textAlign:'center', padding:'3rem', color:'#9ca3af' }}>
              <TicketIcon size={40} color="#d1d5db" />
              <p style={{ marginTop:'0.75rem' }}>No active vouchers.</p>
              <p style={{ fontSize:'0.85rem', marginTop:'0.4rem' }}>New users get a 15% welcome voucher on signup!</p>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:'1rem' }}>
              {activeVouchers.map((v,i) => (
                <div key={i} style={{ background:`linear-gradient(135deg,${R},#4A0E2E)`, borderRadius:'1.25rem', padding:'1.5rem', color:'#fff', position:'relative', overflow:'hidden', boxShadow:'0 6px 24px rgba(123,45,60,0.35)' }}>
                  <div style={{ position:'absolute', top:-24, right:-24, width:96, height:96, background:'rgba(255,255,255,0.06)', borderRadius:'50%' }} />
                  <GiftIcon size={28} color="rgba(255,255,255,0.9)" />
                  <div style={{ fontSize:'2.25rem', fontWeight:900, letterSpacing:'-0.02em', margin:'0.5rem 0 0.25rem' }}>{v.discount}% OFF</div>
                  <div style={{ fontSize:'0.78rem', color:'rgba(255,255,255,0.65)', marginBottom:'1rem' }}>On your order · Min spend ₹999</div>
                  <div style={{ background:'rgba(255,255,255,0.12)', borderRadius:'0.6rem', padding:'0.6rem 0.875rem', display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem' }}>
                    <span style={{ fontFamily:'monospace', fontWeight:800, fontSize:'1.05rem', letterSpacing:'0.12em' }}>{v.code}</span>
                    <button onClick={() => { navigator.clipboard.writeText(v.code); alert('Copied!'); }}
                      style={{ background:'rgba(255,255,255,0.2)', border:'none', color:'#fff', borderRadius:'0.35rem', padding:'0.25rem 0.6rem', cursor:'pointer', fontSize:'0.75rem', fontWeight:700 }}>
                      Copy
                    </button>
                  </div>
                  <div style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.55)' }}>Expires: {new Date(v.expiresAt).toLocaleDateString('en-IN')}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
