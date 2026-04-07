import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Truck, Eye, EyeOff } from 'lucide-react';

export default function SellerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:5000/api/seller/auth/login', {
        email, password
      });
      
      localStorage.setItem('sellerToken', response.data.token);
      localStorage.setItem('seller', JSON.stringify(response.data.supplier));
      navigate('/seller/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-lg shadow p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#4A0E2E]/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Truck size={32} className="text-[#4A0E2E]" />
          </div>
          <h1 className="text-2xl font-bold">Seller Login</h1>
          <p className="text-gray-500 text-sm">Access your supplier dashboard</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-[#4A0E2E]"
              placeholder="seller@example.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded-lg p-2 pr-10 focus:ring-2 focus:ring-[#4A0E2E]"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4A0E2E] text-white py-2 rounded-lg font-semibold hover:bg-[#6B1D45] disabled:bg-gray-400"
          >
            {loading ? 'Logging in...' : 'Login as Seller'}
          </button>
        </form>
      </div>
    </div>
  );
}