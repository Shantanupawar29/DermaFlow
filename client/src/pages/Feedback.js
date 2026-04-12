import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const R = '#7B2D3C';

const TYPES = ['review', 'complaint', 'suggestion', 'support', 'survey'];
const CATEGORIES = ['payment', 'delivery', 'product_quality', 'website', 'customer_service', 'other'];

export default function FeedbackPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    type: 'review', category: 'other', rating: 5,
    subject: '', message: '', name: user?.name || '', email: user?.email || '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.message.trim()) { setError('Please enter your message.'); return; }
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/feedback', form);
      setSubmitted(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const input = { width: '100%', border: '1px solid #e5e7eb', borderRadius: '0.6rem', padding: '0.6rem 0.875rem', fontSize: '0.875rem', boxSizing: 'border-box', outline: 'none', fontFamily: 'sans-serif' };

  if (submitted) return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: 440 }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🙏</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1f2937', marginBottom: '0.5rem' }}>Thank you!</h2>
        <p style={{ color: '#4b5563', lineHeight: 1.6, marginBottom: '1rem' }}>
          Your feedback has been received and automatically analysed.
        </p>
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '0.875rem', padding: '1rem', marginBottom: '1.5rem', textAlign: 'left' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div><div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Sentiment</div><div style={{ fontWeight: 700, fontSize: '0.9rem', textTransform: 'capitalize', color: submitted.sentiment === 'positive' ? '#16a34a' : submitted.sentiment === 'negative' ? '#dc2626' : '#6b7280' }}>{submitted.sentiment}</div></div>
            <div><div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Priority</div><div style={{ fontWeight: 700, fontSize: '0.9rem', textTransform: 'capitalize' }}>{submitted.priority || 'low'}</div></div>
            <div><div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Ref ID</div><div style={{ fontWeight: 700, fontSize: '0.85rem', fontFamily: 'monospace' }}>{submitted.id?.slice(-8).toUpperCase()}</div></div>
          </div>
        </div>
        <button onClick={() => setSubmitted(null)}
          style={{ background: R, color: '#fff', border: 'none', borderRadius: '0.6rem', padding: '0.65rem 1.5rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem' }}>
          Submit Another
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 620, margin: '0 auto', padding: '2.5rem 1rem', fontFamily: 'sans-serif' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1f2937', margin: 0 }}>Share Your Feedback</h1>
        <p style={{ color: '#6b7280', marginTop: '0.3rem', lineHeight: 1.6 }}>
          Your feedback is automatically analysed to help us improve. All reports are reviewed within 24 hours.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.3rem' }}>Feedback Type</label>
            <select value={form.type} onChange={set('type')} style={input}>
              {TYPES.map(t => <option key={t} value={t} style={{ textTransform: 'capitalize' }}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.3rem' }}>Category</label>
            <select value={form.category} onChange={set('category')} style={input}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
            </select>
          </div>
        </div>

        {form.type === 'review' && (
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.5rem' }}>Rating</label>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button" onClick={() => setForm(f => ({ ...f, rating: n }))}
                  style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid', borderColor: form.rating >= n ? '#d97706' : '#e5e7eb', background: form.rating >= n ? '#fef3c7' : '#fff', cursor: 'pointer', fontSize: '1.1rem' }}>
                  {form.rating >= n ? '★' : '☆'}
                </button>
              ))}
              <span style={{ alignSelf: 'center', fontSize: '0.85rem', color: '#6b7280' }}>{['', 'Terrible', 'Poor', 'Average', 'Good', 'Excellent'][form.rating]}</span>
            </div>
          </div>
        )}

        {!user && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.3rem' }}>Name</label>
              <input placeholder="Your name" value={form.name} onChange={set('name')} style={input} />
            </div>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.3rem' }}>Email</label>
              <input type="email" placeholder="your@email.com" value={form.email} onChange={set('email')} style={input} />
            </div>
          </div>
        )}

        <div>
          <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.3rem' }}>Subject</label>
          <input placeholder="Brief summary of your feedback" value={form.subject} onChange={set('subject')} style={input} />
        </div>

        <div>
          <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.3rem' }}>Message <span style={{ color: '#dc2626' }}>*</span></label>
          <textarea rows={5} placeholder="Tell us in detail..." value={form.message} onChange={set('message')} required
            style={{ ...input, resize: 'vertical' }} />
        </div>

        {error && <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '0.5rem', padding: '0.75rem', color: '#dc2626', fontSize: '0.875rem' }}>{error}</div>}

        <button type="submit" disabled={loading}
          style={{ background: loading ? '#9ca3af' : R, color: '#fff', border: 'none', borderRadius: '0.75rem', padding: '0.875rem', fontWeight: 700, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'sans-serif' }}>
          {loading ? 'Submitting...' : 'Submit Feedback →'}
        </button>

        <p style={{ fontSize: '0.78rem', color: '#9ca3af', textAlign: 'center', lineHeight: 1.5 }}>
          Your feedback is automatically analysed for sentiment and priority. All data is handled per our Privacy Policy.
        </p>
      </form>
    </div>
  );
}