import React, { useState } from 'react';
import { X } from 'lucide-react';

const DiscountBanner = () => {
  const [visible, setVisible] = useState(() => !localStorage.getItem('announcementDismissed'));

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem('announcementDismissed', 'true');
  };

  if (!visible) return null;

  return (
    <div className="relative bg-maroon text-white overflow-hidden">
      <div className="container mx-auto flex items-center justify-center px-8 py-2 text-center text-xs sm:text-sm font-medium">
        <span className="inline-block sm:inline">
          🚚 Free shipping on orders above ₹999 &nbsp;|&nbsp; Use DERMA15 for 15% off your first order &nbsp;|&nbsp; ♻️ Recycle & Earn 50 GlowPoints
        </span>
        <button onClick={dismiss} className="absolute right-3 text-white/70 hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default DiscountBanner;