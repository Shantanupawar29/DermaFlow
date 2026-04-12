import React, { useEffect, useState } from 'react';

const M = '#4A0E2E';
const TIPS = [
  'Always apply SPF last in your AM routine.',
  'Retinol and Vitamin C should not be used together.',
  'Hyaluronic Acid works best on damp skin.',
  'Double cleansing removes 99% of sunscreen & makeup.',
  'Niacinamide pairs with almost everything in your routine.',
  'Patch test new products for 24–48 hours first.',
  'Less is more — build your routine slowly.',
];

export function DermaLoader({ message = 'Loading' }) {
  const [tip] = useState(TIPS[Math.floor(Math.random() * TIPS.length)]);
  const [dots, setDots] = useState(1);
  useEffect(() => {
    const t = setInterval(() => setDots(d => d >= 3 ? 1 : d + 1), 500);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', fontFamily:'system-ui,sans-serif', padding:'2rem' }}>
      <div style={{ position:'relative', width:80, height:80, marginBottom:28 }}>
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <defs>
            <linearGradient id="dg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7B2D3C"/>
              <stop offset="100%" stopColor={M}/>
            </linearGradient>
          </defs>
          <rect x="32" y="8" width="16" height="32" rx="8" fill="url(#dg)">
            <animate attributeName="opacity" values="0.9;0.5;0.9" dur="1.5s" repeatCount="indefinite"/>
          </rect>
          <path d="M38 40 L40 52 L42 40 Z" fill={M}/>
          <ellipse cx="40" cy="62" rx="7" ry="9" fill={M} opacity="0.85">
            <animate attributeName="cy" values="62;68;62" dur="1.5s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.85;0.3;0.85" dur="1.5s" repeatCount="indefinite"/>
          </ellipse>
        </svg>
        <div style={{ position:'absolute', bottom:0, left:'50%', transform:'translateX(-50%)', width:20, height:4, borderRadius:'50%', background:`${M}30`, animation:'ripple 1.5s ease-out infinite' }}/>
        <style>{`@keyframes ripple{0%{width:8px;opacity:0.6}100%{width:40px;opacity:0}}`}</style>
      </div>
      <div style={{ fontSize:16, fontWeight:700, color:M, marginBottom:8 }}>{message}{'.'.repeat(dots)}</div>
      <div style={{ maxWidth:300, textAlign:'center', background:'#fef3c7', border:'1px solid #fde68a', borderRadius:12, padding:'10px 16px', marginTop:12 }}>
        <div style={{ fontSize:10, fontWeight:700, color:'#92400e', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>Skincare Tip</div>
        <div style={{ fontSize:12, color:'#78350f', lineHeight:1.6 }}>{tip}</div>
      </div>
    </div>
  );
}
export default DermaLoader;