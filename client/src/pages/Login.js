import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';
 
export default function Login() {
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { saveAuth } = useAuth();
  const navigate = useNavigate();
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await login(form);
      saveAuth(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };
 
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='bg-white p-8 rounded-xl shadow border w-full max-w-md'>
        <h1 className='text-2xl font-bold text-rose-DEFAULT mb-6'>Sign In</h1>
        {error && <p className='text-red-600 text-sm mb-4'>{error}</p>}
        <form onSubmit={handleSubmit} className='space-y-4'>
          <input type='email' placeholder='Email'
            className='w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300'
            value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          <input type='password' placeholder='Password'
            className='w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300'
            value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
          <button type='submit' disabled={loading}
            className='w-full bg-rose-DEFAULT text-white py-2 rounded-lg font-medium hover:opacity-90'>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className='mt-4 text-sm text-center text-gray-500'>
          No account? <Link to='/register' className='text-rose-DEFAULT font-medium'>Register</Link>
        </p>
      </div>
    </div>
  );
}
