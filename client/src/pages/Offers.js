import React, { useState } from 'react';
import { Copy, Check, Tag, Gift, Sparkles, Clock } from 'lucide-react';

const Offers = () => {
  const [copiedCode, setCopiedCode] = useState(null);
  
  const coupons = [
    {
      code: "WELCOME15",
      discount: "15% OFF",
      description: "First purchase discount for new customers",
      minSpend: 999,
      validTill: "2025-12-31",
      icon: Gift,
      color: "bg-purple-100 text-purple-700"
    },
    {
      code: "DERMA20",
      discount: "20% OFF",
      description: "Sitewide sale - limited time offer",
      minSpend: 1499,
      validTill: "2025-03-31",
      icon: Sparkles,
      color: "bg-pink-100 text-pink-700"
    },
    {
      code: "FREESHIP",
      discount: "Free Shipping",
      description: "Free shipping on orders above ₹999",
      minSpend: 999,
      validTill: "2025-12-31",
      icon: Gift,
      color: "bg-green-100 text-green-700"
    },
    {
      code: "BUNDLE10",
      discount: "10% OFF",
      description: "Buy 2 or more products and save",
      minSpend: 1999,
      validTill: "2025-06-30",
      icon: Tag,
      color: "bg-blue-100 text-blue-700"
    }
  ];

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-display font-bold mb-4">Exclusive Offers</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Unlock amazing discounts and special deals. Use the codes below at checkout to save on your purchase.
        </p>
      </div>

      {/* Coupons Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {coupons.map((coupon, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-md overflow-hidden border border-cream hover:shadow-lg transition">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`${coupon.color} p-3 rounded-full`}>
                  <coupon.icon size={24} />
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-maroon">{coupon.discount}</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">{coupon.description}</h3>
              <div className="space-y-2 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-2">
                  <Tag size={14} /> Min. Spend: ₹{coupon.minSpend}
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} /> Valid till: {new Date(coupon.validTill).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-cream/30 px-4 py-2 rounded-lg border border-cream font-mono font-semibold">
                  {coupon.code}
                </div>
                <button
                  onClick={() => copyToClipboard(coupon.code)}
                  className="bg-maroon text-white px-4 py-2 rounded-lg hover:bg-maroon-light transition flex items-center gap-2"
                >
                  {copiedCode === coupon.code ? <Check size={16} /> : <Copy size={16} />}
                  {copiedCode === coupon.code ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Referral Section */}
      <div className="bg-gradient-to-r from-maroon to-maroon-light rounded-2xl p-8 text-white text-center">
        <h2 className="text-2xl font-display font-bold mb-4">Refer a Friend & Earn ₹500</h2>
        <p className="mb-6 opacity-90">Share your unique referral code with friends. When they make their first purchase, you both get ₹500 off!</p>
        <div className="max-w-md mx-auto flex gap-3">
          <input
            type="text"
            value="DERMAFLOW-REF-12345"
            readOnly
            className="flex-1 px-4 py-3 rounded-lg text-gray-900 font-mono"
          />
          <button
            onClick={() => copyToClipboard("DERMAFLOW-REF-12345")}
            className="bg-white text-maroon px-6 py-3 rounded-lg font-semibold hover:bg-cream transition flex items-center gap-2"
          >
            {copiedCode === "DERMAFLOW-REF-12345" ? <Check size={16} /> : <Copy size={16} />}
            Copy
          </button>
        </div>
      </div>

      {/* Terms */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>*Terms and conditions apply. Offers cannot be combined with other promotions.</p>
      </div>
    </div>
  );
};

export default Offers;