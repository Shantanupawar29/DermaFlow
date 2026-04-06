import React from 'react';

export default function Deployment() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Deployment Status</h1>
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '1rem', padding: '1.5rem' }}>
        <h2 style={{ fontWeight: 600, marginBottom: '1rem' }}>🌐 Application Deployment</h2>
        <div style={{ marginBottom: '1rem' }}>
          <p><strong>Frontend:</strong> Vercel / Netlify</p>
          <p><strong>Backend:</strong> Render / Railway</p>
          <p><strong>Database:</strong> MongoDB Atlas</p>
        </div>
        <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '0.5rem' }}>
          <p style={{ color: '#15803d' }}>✅ Ready for deployment</p>
        </div>
      </div>
    </div>
  );
}