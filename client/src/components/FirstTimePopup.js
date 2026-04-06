import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';

const FirstTimePopup = () => {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (localStorage.getItem('visited')) return;
    const timer = setTimeout(() => setShow(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem('visited', 'true');
  };

  const claim = (e) => {
    e.preventDefault();
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error('Please enter a valid email');
      return;
    }
    localStorage.setItem('leadEmail', email);
    navigator.clipboard.writeText('DERMA15').catch(() => {});
    toast.success('Code DERMA15 copied to clipboard!');
    dismiss();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-sm rounded-xl bg-maroon p-8 text-white text-center">
        <button onClick={dismiss} className="absolute top-3 right-3 text-white/60 hover:text-white">
          <X className="h-5 w-5" />
        </button>
        <h2 className="text-2xl font-bold mb-2">👋 Welcome to Derma Flow!</h2>
        <p className="text-white/80 text-sm mb-6">Take our free AI skin quiz and get 15% off your first order.</p>
        <form onSubmit={claim} className="space-y-3">
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-lg text-gray-900"
            required
          />
          <button type="submit" className="w-full bg-white text-maroon py-2 rounded-lg font-semibold hover:bg-cream transition">
            Claim 15% Off
          </button>
        </form>
        <button onClick={dismiss} className="mt-3 text-xs text-white/50 hover:text-white/80 underline">
          No thanks
        </button>
      </div>
    </div>
  );
};

export default FirstTimePopup;