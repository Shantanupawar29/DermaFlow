import React, { useState, useEffect } from 'react';
import { X, Gift } from 'lucide-react';
import { toast } from 'sonner';

const ExitIntentPopup = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleMouseLeave = (e) => {
      if (e.clientY <= 0 && !localStorage.getItem('exitIntentShown')) {
        setShow(true);
        localStorage.setItem('exitIntentShown', 'true');
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, []);

  const dismiss = () => setShow(false);

  const claimOffer = () => {
    navigator.clipboard.writeText('EXIT10');
    toast.success('Code EXIT10 copied! Get 10% off on your next purchase.');
    dismiss();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 p-4">
      <div className="relative w-full max-w-md rounded-xl bg-gradient-to-r from-maroon to-maroon-light p-8 text-white text-center">
        <button onClick={dismiss} className="absolute top-3 right-3 text-white/60 hover:text-white">
          <X className="h-5 w-5" />
        </button>
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-white/20 p-3">
            <Gift className="h-8 w-8" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2">Wait! Don't Go Empty-Handed!</h2>
        <p className="text-white/80 text-sm mb-4">
          Complete your purchase today and get an exclusive 10% off your order.
        </p>
        <div className="bg-white/20 rounded-lg p-3 mb-4">
          <p className="text-sm">Use code: <span className="font-mono font-bold text-gold">EXIT10</span></p>
        </div>
        <button
          onClick={claimOffer}
          className="w-full bg-white text-maroon py-3 rounded-lg font-semibold hover:bg-cream transition"
        >
          Claim My 10% Off
        </button>
        <button onClick={dismiss} className="mt-3 text-xs text-white/50 hover:text-white/80 underline">
          No thanks, I'll continue browsing
        </button>
      </div>
    </div>
  );
};

export default ExitIntentPopup;