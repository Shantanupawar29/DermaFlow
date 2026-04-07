import React, { useState } from 'react';
import { Cloud, Database, Globe, Settings, CheckCircle, XCircle, Server, Rocket, Shield } from 'lucide-react';

const R = '#7B2D3C';

export default function Deployment() {
  const [deploymentStatus, setDeploymentStatus] = useState({
    frontend: 'deployed',
    backend: 'deployed',
    database: 'connected',
    domain: 'configured'
  });

  const deploymentSteps = [
    {
      title: 'Frontend Deployment',
      platform: 'Vercel / Netlify',
      status: deploymentStatus.frontend,
      instructions: 'Connect GitHub repo to Vercel, set build command: npm run build',
      url: 'https://dermaflow.vercel.app',
      icon: Globe
    },
    {
      title: 'Backend API',
      platform: 'Render / Railway',
      status: deploymentStatus.backend,
      instructions: 'Deploy Express.js server, set environment variables',
      url: 'https://dermaflow-api.onrender.com',
      icon: Server
    },
    {
      title: 'Database',
      platform: 'MongoDB Atlas',
      status: deploymentStatus.database,
      instructions: 'Create cluster, whitelist IP, get connection string',
      url: 'mongodb+srv://cluster.mongodb.net',
      icon: Database
    },
    {
      title: 'Domain Configuration',
      platform: 'GoDaddy / Namecheap',
      status: deploymentStatus.domain,
      instructions: 'Configure DNS records, SSL certificate',
      url: 'www.dermaflow.com',
      icon: Globe
    }
  ];

  return (
    <div className="overflow-x-auto">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1f2937', margin: 0 }}>Deployment Dashboard</h1>
        <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.3rem' }}>
          Cloud deployment status and configuration for the DermaFlow e-commerce platform.
        </p>
      </div>

      {/* Deployment Status Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {deploymentSteps.map((step, idx) => (
          <div key={idx} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '1rem', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: '0.75rem', background: `${R}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <step.icon size={20} color={R} />
              </div>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>{step.title}</h3>
                <p style={{ fontSize: '0.7rem', color: '#6b7280', margin: 0 }}>{step.platform}</p>
              </div>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#4b5563', marginBottom: '0.75rem' }}>{step.instructions}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: step.status === 'deployed' || step.status === 'connected' || step.status === 'configured' ? '#16a34a' : '#d97706' }}>
                {step.status === 'deployed' || step.status === 'connected' || step.status === 'configured' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                {step.status}
              </span>
              {step.url && (
                <a href="#" style={{ fontSize: '0.7rem', color: R, textDecoration: 'none' }}>Configure →</a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Environment Variables */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#374151', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Settings size={18} color={R} /> Environment Configuration
        </h2>
        <div style={{ background: '#f8fafc', borderRadius: '0.75rem', padding: '1rem', overflowX: 'auto' }}>
          <pre style={{ fontSize: '0.75rem', margin: 0, whiteSpace: 'pre-wrap' }}>
            <code>
{`# Backend (.env)
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_super_secret_key
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
EMAIL_USER=noreply@dermaflow.com
EMAIL_PASS=...

# Frontend (.env)
REACT_APP_API_URL=https://api.dermaflow.com
REACT_APP_RAZORPAY_KEY_ID=rzp_test_...`}
            </code>
          </pre>
        </div>
      </div>

      {/* Cloud Platform Options */}
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '1rem', padding: '1.5rem', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <Cloud size={24} />
          <h2 style={{ fontWeight: 700, fontSize: '1rem', margin: 0 }}>Recommended Cloud Platforms</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {[
            { name: 'AWS (EC2 + RDS)', cost: '$$', bestFor: 'Enterprise scale' },
            { name: 'Google Cloud Run', cost: '$$', bestFor: 'Serverless deployment' },
            { name: 'Azure App Service', cost: '$$', bestFor: 'Microsoft ecosystem' },
            { name: 'Render', cost: '$', bestFor: 'Startup friendly' },
            { name: 'Railway', cost: '$', bestFor: 'Quick deployment' },
            { name: 'Vercel (Frontend)', cost: 'Free tier', bestFor: 'React hosting' },
          ].map(platform => (
            <div key={platform.name} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '0.75rem', padding: '0.75rem' }}>
              <p style={{ fontWeight: 700, fontSize: '0.85rem', margin: 0 }}>{platform.name}</p>
              <p style={{ fontSize: '0.7rem', opacity: 0.8, margin: '0.25rem 0' }}>{platform.cost}</p>
              <p style={{ fontSize: '0.65rem', opacity: 0.7 }}>{platform.bestFor}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}