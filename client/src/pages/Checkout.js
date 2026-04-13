import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import LocationDetector from '../components/LocationDetector';
import api from '../services/api';
import { Sparkles, Gift, Percent, Truck, Shield, Clock } from 'lucide-react';

const Checkout = () => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading]           = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [couponCode, setCouponCode]     = useState('');
  const [discount, setDiscount]         = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponMessage, setCouponMessage] = useState('');
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [useNewAddress, setUseNewAddress] = useState(true);
  const [formData, setFormData]         = useState({
    address: { street: '', city: '', state: '', zipCode: '', country: 'India' },
    phone: ''
  });

  // Glow points state
  const [userGlowPoints, setUserGlowPoints] = useState(0);
  const [userVouchers, setUserVouchers]     = useState([]);
  const [pointsDiscount, setPointsDiscount] = useState(0);
  const [pointsApplied, setPointsApplied]   = useState(false);
  const [pointsToUse, setPointsToUse]       = useState(0);
  const [pointsMsg, setPointsMsg]           = useState('');
  const [maxPointsToUse, setMaxPointsToUse] = useState(0);

  useEffect(() => {
    if (user) {
      fetchSavedAddresses();
      fetchUserData();
    }
  }, [user]);

  // Calculate max points that can be used (based on order total)
  useEffect(() => {
    if (userGlowPoints > 0 && totalPrice > 0) {
      // Max discount cannot exceed 50% of order total
      const maxDiscountAmount = totalPrice * 0.5;
      const maxPointsPossible = Math.floor(maxDiscountAmount * 10); // 100 points = ₹10, so ₹1 = 10 points
      const calculatedMaxPoints = Math.min(userGlowPoints, maxPointsPossible);
      // Round down to nearest 100
      const roundedMaxPoints = Math.floor(calculatedMaxPoints / 100) * 100;
      setMaxPointsToUse(roundedMaxPoints);
      
      // If points were applied but now exceed max, adjust
      if (pointsApplied && pointsToUse > roundedMaxPoints) {
        const newPointsToUse = roundedMaxPoints;
        setPointsToUse(newPointsToUse);
        const newDiscount = (newPointsToUse / 100) * 10;
        setPointsDiscount(newDiscount);
      }
    }
  }, [userGlowPoints, totalPrice]);

  const fetchUserData = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUserGlowPoints(data.glowPoints || 0);
      // show vouchers earned from spin/scratch that aren't used yet
      const active = (data.vouchers || []).filter(v => !v.isUsed && new Date(v.expiresAt) > new Date());
      setUserVouchers(active);
    } catch (e) { console.error(e); }
  };

  const fetchSavedAddresses = async () => {
    try {
      const response = await api.get('/profile/addresses');
      setSavedAddresses(response.data || []);
      const defaultAddr = response.data?.find(addr => addr.isDefault);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr._id);
        setUseNewAddress(false);
        setFormData({
          address: { street: defaultAddr.street, city: defaultAddr.city, state: defaultAddr.state, zipCode: defaultAddr.zipCode, country: defaultAddr.country || 'India' },
          phone: defaultAddr.phone
        });
      }
    } catch (error) { console.error('Error fetching addresses:', error); }
  };

  const handleSelectAddress = (addressId) => {
    const address = savedAddresses.find(a => a._id === addressId);
    if (address) {
      setSelectedAddressId(addressId);
      setUseNewAddress(false);
      setFormData({
        address: { street: address.street, city: address.city, state: address.state, zipCode: address.zipCode, country: address.country || 'India' },
        phone: address.phone
      });
    }
  };

  const validCoupons = {
    'WELCOME15': { type: 'percentage', value: 15, minOrder: 500 },
    'DERMA20':   { type: 'percentage', value: 20, minOrder: 1000 },
    'GLOW10':    { type: 'percentage', value: 10, minOrder: 300 },
    'FREESHIP':  { type: 'freeshipping', value: 0, minOrder: 999 }
  };

  const fetchAddressFromPincode = async (pincode) => {
    if (!/^\d{6}$/.test(pincode)) return;
    try {
      const res = await api.get(`/pincode/${pincode}`);
      const data = res.data[0];
      if (data.Status === "Success" && data.PostOffice?.length > 0) {
        const postOffice = data.PostOffice[0];
        setFormData((prev) => ({ ...prev, address: { ...prev.address, city: postOffice.District || "", state: postOffice.State || "", country: "India" } }));
      }
    } catch (error) { console.error("Pincode fetch error:", error); }
  };

  const applyCoupon = () => {
    // First check user earned vouchers
    const earnedVoucher = userVouchers.find(v => v.code === couponCode.toUpperCase());
    if (earnedVoucher) {
      const discAmt = earnedVoucher.type === 'flat'
        ? earnedVoucher.discount
        : (totalPrice * earnedVoucher.discount) / 100;
      setDiscount(discAmt);
      setCouponMessage(` Voucher applied! You saved ₹${discAmt.toFixed(2)}`);
      setCouponApplied(true);
      setTimeout(() => setCouponMessage(''), 3000);
      return;
    }

    // Then check static coupons
    const code = couponCode.toUpperCase();
    const coupon = validCoupons[code];
    if (!coupon) { setCouponMessage('Invalid coupon code'); setCouponApplied(false); setDiscount(0); return; }
    if (totalPrice < coupon.minOrder) { setCouponMessage(`Minimum order of ₹${coupon.minOrder} required`); setCouponApplied(false); setDiscount(0); return; }
    if (coupon.type === 'percentage') {
      const discountAmount = (totalPrice * coupon.value) / 100;
      setDiscount(discountAmount);
      setCouponMessage(`✅ Coupon applied! You saved ₹${discountAmount.toFixed(2)}`);
      setCouponApplied(true);
    } else if (coupon.type === 'freeshipping') {
      setDiscount(0);
      setCouponMessage('Free shipping applied!');
      setCouponApplied(true);
    }
    setTimeout(() => setCouponMessage(''), 3000);
  };

  // Auto-apply max available Glow Points
  const applyGlowPoints = () => {
    if (pointsApplied) {
      // Remove points discount
      setPointsDiscount(0);
      setPointsApplied(false);
      setPointsToUse(0);
      setPointsMsg('');
      return;
    }
    
    if (userGlowPoints < 100) { 
      setPointsMsg('You need at least 100 Glow Points to redeem'); 
      return; 
    }
    
    if (maxPointsToUse < 100) {
      setPointsMsg(`Maximum discount cannot exceed 50% of order total`);
      return;
    }
    
    const discountAmount = (maxPointsToUse / 100) * 10; // 100 pts = ₹10
    setPointsDiscount(discountAmount);
    setPointsApplied(true);
    setPointsToUse(maxPointsToUse);
    setPointsMsg(`✅ ${maxPointsToUse} Glow Points applied — ₹${discountAmount.toFixed(2)} off!`);
  };

  const taxAmount      = totalPrice * 0.18;
  const shippingAmount = totalPrice > 1000 ? 0 : 50;
  const discountedTotal= totalPrice - discount - pointsDiscount;
  const grandTotal     = discountedTotal + taxAmount + shippingAmount;

  const loadRazorpayScript = () => new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

 // In createOrderAndRedirect function, modify the orderData:

const createOrderAndRedirect = async (orderData) => {
  try {
    setLoading(true);
    
    // Log the cart items to debug
    console.log('Cart items before mapping:', cartItems);
    
    // Ensure we're sending the correct product ID
    const mappedItems = cartItems.map(item => {
      // Try multiple possible ID fields
      const productId = item._id || item.id || item.productId;
      
      if (!productId) {
        console.error('Item missing ID:', item);
        throw new Error(`Product ${item.name} is missing an ID`);
      }
      
      return {
        product: productId,
        quantity: item.quantity,
        name: item.name,
        price: item.price
      };
    });
    
    const payload = {
      items: mappedItems,
      shippingAddress: formData.address,
      paymentMethod: orderData.paymentMethod || paymentMethod,
      phone: formData.phone,
      totalAmount: Math.round(grandTotal * 100),
      discountAmount: Math.round((discount + pointsDiscount) * 100),
      couponCode: couponApplied ? couponCode : null,
      glowPointsUsed: pointsApplied ? pointsToUse : 0,
    };
    
    console.log('Sending payload to backend:', payload);
    
    const response = await api.post('/orders', payload);
    const orderId = response.data._id;
    
    clearCart();
    navigate(`/order-confirmation/${orderId}`);
    return true;
  } catch (error) {
    console.error('Order creation failed:', error.response?.data || error.message);
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message ||
                        'Order failed. Please try again.';
    alert(errorMessage);
    return false;
  } finally {
    setLoading(false);
  }
};

  const handleRazorpayPayment = async () => {
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) { alert('Could not load Razorpay SDK.'); setLoading(false); return; }
      const amountInPaise = Math.round(grandTotal * 100);
      const { data: razorpayOrder } = await api.post('/payment/create-order', { amount: amountInPaise });
      if (!razorpayOrder.id) { alert('Failed to create payment order.'); setLoading(false); return; }

      const options = {
        key:         process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount:      razorpayOrder.amount,
        currency:    razorpayOrder.currency,
        name:        'Derma Flow',
        description: 'Skincare Order',
        order_id:    razorpayOrder.id,
        prefill: { name: user?.name || '', email: user?.email || '', contact: formData.phone || '' },
        theme: { color: '#4A0E2E' },
        handler: async (response) => {
          try {
            
            const verifyRes = await api.post('/payment/verify', {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            });
            if (verifyRes.data.success) {
              await createOrderAndRedirect({
  items: cartItems.map(item => ({ 
    product: item._id || item.id,  // Use _id first for consistency
    quantity: item.quantity, 
    name: item.name, 
    price: item.price 
  })),
  shippingAddress: formData.address,
  paymentMethod: 'razorpay',
  phone: formData.phone,
  totalAmount:    Math.round(grandTotal * 100),
  discountAmount: Math.round((discount + pointsDiscount) * 100),
  couponCode: couponApplied ? couponCode : null,
  glowPointsUsed: pointsApplied ? pointsToUse : 0,
});
            } else {
              alert('Payment verification failed.'); setLoading(false);
            }
          } catch (err) {
            alert('Payment done but order save failed: ' + (err.response?.data?.message || err.message)); setLoading(false);
          }
        },
        modal: { ondismiss: () => { setLoading(false); } },
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => { alert('Payment failed: ' + response.error.description); setLoading(false); });
      rzp.open();
    } catch (error) {
      alert(error.response?.data?.error || 'Payment failed.'); setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  
  // Debug: Log cart items to see what IDs we have
  console.log('Cart items in handleSubmit:', cartItems.map(item => ({
    id: item.id,
    _id: item._id,
    name: item.name
  })));
  
  if (paymentMethod === 'razorpay') { await handleRazorpayPayment(); return; }
  await createOrderAndRedirect({
    items: cartItems.map(item => ({ 
      product: item._id || item.id,  // Use _id first, then fallback to id
      quantity: item.quantity, 
      name: item.name, 
      price: item.price 
    })),
    shippingAddress: formData.address,
    paymentMethod: 'cod',
    phone: formData.phone,
    totalAmount:    Math.round(grandTotal * 100),
    discountAmount: Math.round((discount + pointsDiscount) * 100),
    couponCode: couponApplied ? couponCode : null,
    glowPointsUsed: pointsApplied ? pointsToUse : 0,
  });
  setLoading(false);
};

  if (cartItems.length === 0 && !loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <Link to="/products" className="bg-maroon text-white px-6 py-2 rounded-lg inline-block">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            {/* ── Shipping Address ─────────────────────────────────────── */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
              {savedAddresses.length > 0 && (
                <div className="mb-6">
                  <label className="flex items-center gap-2 mb-3">
                    <input type="radio" checked={!useNewAddress} onChange={() => {
                      setUseNewAddress(false);
                      if (selectedAddressId) handleSelectAddress(selectedAddressId);
                    }} />
                    <span className="font-medium">Use a saved address</span>
                  </label>
                  {!useNewAddress && (
                    <div className="ml-6 space-y-2">
                      {savedAddresses.map(addr => (
                        <label key={addr._id} className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <input type="radio" name="savedAddress" checked={selectedAddressId === addr._id} onChange={() => handleSelectAddress(addr._id)} className="mt-1" />
                          <div>
                            <p className="font-medium">{addr.name}</p>
                            <p className="text-sm text-gray-600">{addr.street}, {addr.city}, {addr.state} - {addr.zipCode}</p>
                            <p className="text-sm text-gray-500">Phone: {addr.phone}</p>
                            {addr.isDefault && <span className="text-xs text-green-600">Default</span>}
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                    <div className="relative flex justify-center text-xs"><span className="bg-white px-2 text-gray-500">OR</span></div>
                  </div>
                  <label className="flex items-center gap-2">
                    <input type="radio" checked={useNewAddress} onChange={() => setUseNewAddress(true)} />
                    <span className="font-medium">Use a new address</span>
                  </label>
                </div>
              )}
              {useNewAddress && (
                <div className="space-y-4">
                  <LocationDetector onAddressFetched={(address) => setFormData(prev => ({ ...prev, address: { ...prev.address, ...address } }))} buttonText="Use My Current Location" />
                  <div className="grid md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Street Address" required className="border p-2 rounded w-full"
                      value={formData.address.street} onChange={(e) => setFormData({...formData, address: {...formData.address, street: e.target.value}})} />
                    <input type="text" placeholder="City" required className="border p-2 rounded w-full"
                      value={formData.address.city} onChange={(e) => setFormData({...formData, address: {...formData.address, city: e.target.value}})} />
                    <select required className="border p-2 rounded w-full" value={formData.address.state}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: { ...prev.address, state: e.target.value } }))}>
                      <option value="">Select State</option>
                      {["Maharashtra","Delhi","Karnataka","Tamil Nadu","Telangana","West Bengal","Gujarat","Rajasthan","Uttar Pradesh","Punjab","Haryana","Kerala"].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <input type="text" placeholder="Pincode" required maxLength={6} className="border p-2 rounded w-full"
                      value={formData.address.zipCode}
                      onChange={(e) => {
                        const pincode = e.target.value.replace(/\D/g, "");
                        setFormData(prev => ({ ...prev, address: { ...prev.address, zipCode: pincode } }));
                        if (pincode.length === 6) fetchAddressFromPincode(pincode);
                      }} />
                    <input type="tel" placeholder="Phone Number" required className="border p-2 rounded w-full"
                      value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                </div>
              )}
            </div>

            {/* ── Payment Method ──────────────────────────────────────── */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
              <div className="space-y-3">
                <label className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
                  <input type="radio" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)} className="mr-3" />
                  <span className="font-medium">Cash on Delivery</span>
                </label>
                <label className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
                  <input type="radio" value="razorpay" checked={paymentMethod === 'razorpay'} onChange={(e) => setPaymentMethod(e.target.value)} className="mr-3" />
                  <div>
                    <span className="font-medium">Credit/Debit Card / UPI</span>
                    <p className="text-xs text-gray-500">Powered by Razorpay</p>
                  </div>
                </label>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full mt-4 bg-maroon text-white py-3 rounded-lg font-semibold hover:bg-maroon/90 transition disabled:bg-gray-400">
              {loading ? 'Processing...' : `Place Order (₹${grandTotal.toFixed(2)})`}
            </button>
          </form>
        </div>

        {/* ── Order Summary ─────────────────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

            {/* Coupon */}
            <div className="mb-4">
              <div className="flex gap-2">
                <input type="text" placeholder="Coupon Code" value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg p-2 text-sm" />
                <button type="button" onClick={applyCoupon}
                  className="bg-maroon text-white px-4 py-2 rounded-lg text-sm hover:bg-maroon/90">Apply</button>
              </div>
              {couponMessage && <p className={`text-xs mt-1 ${couponApplied ? 'text-green-600' : 'text-red-600'}`}>{couponMessage}</p>}
            </div>

            {/* Earned vouchers quick-apply */}
            {userVouchers.length > 0 && (
              <div className="mb-4 p-3 bg-maroon/5 rounded-lg">
                <p className="text-xs font-semibold text-maroon mb-2 flex items-center gap-1">
                  <Gift size={12} /> Your Earned Vouchers
                </p>
                {userVouchers.slice(0, 3).map((v, i) => (
                  <button key={i} type="button"
                    onClick={() => { setCouponCode(v.code); }}
                    className="block w-full text-left text-xs text-gray-700 hover:text-maroon py-1 border-b border-gray-100 last:border-0">
                    <span className="font-mono font-bold">{v.code}</span> —{' '}
                    {v.type === 'flat' ? `₹${v.discount} off` : `${v.discount}% off`}
                    <span className="text-gray-400 ml-1">· exp {new Date(v.expiresAt).toLocaleDateString()}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Glow Points - Auto apply max available */}
            {userGlowPoints >= 100 && (
              <div className="mb-4 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-amber-800 flex items-center gap-1">
                    <Sparkles size={14} /> Glow Points Balance
                  </p>
                  <span className="text-lg font-bold text-amber-700">{userGlowPoints}</span>
                </div>
                
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-amber-700 mb-1">
                    <span>Max points you can use:</span>
                    <span className="font-semibold">{maxPointsToUse} pts</span>
                  </div>
                  <div className="w-full bg-amber-200 rounded-full h-2">
                    <div 
                      className="bg-amber-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(maxPointsToUse / userGlowPoints) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-amber-600 mt-1">
                    {pointsApplied ? ` You'll save ₹${pointsDiscount.toFixed(2)}` : `Apply to save ₹${(maxPointsToUse / 100 * 10).toFixed(2)}`}
                  </p>
                </div>

                <button 
                  type="button" 
                  onClick={applyGlowPoints}
                  disabled={maxPointsToUse < 100}
                  className={`w-full text-sm py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                    pointsApplied 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : maxPointsToUse >= 100
                        ? 'bg-amber-600 text-white hover:bg-amber-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {pointsApplied ? (
                    <> {pointsToUse} pts applied — remove</>
                  ) : (
                    <>✨ Apply {maxPointsToUse} Points ✨</>
                  )}
                </button>
                
                {pointsMsg && <p className="text-xs mt-2 text-green-700">{pointsMsg}</p>}
                {!pointsApplied && maxPointsToUse < 100 && userGlowPoints >= 100 && (
                  <p className="text-xs mt-2 text-amber-600">
                    ⚡ Minimum 100 points required. Add more items to use your points!
                  </p>
                )}
              </div>
            )}

            {/* Items */}
            <div className="space-y-2 mb-4 max-h-48 overflow-auto">
              {cartItems.map((item, index) => (
                <div key={item.id || index} className="flex justify-between text-sm">
                  <span className="text-gray-700">{item.name} × {item.quantity}</span>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t pt-3 space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>₹{totalPrice.toFixed(2)}</span></div>
              {discount > 0 && <div className="flex justify-between text-green-600"><span>Coupon Discount</span><span>-₹{discount.toFixed(2)}</span></div>}
              {pointsDiscount > 0 && <div className="flex justify-between text-amber-600"><span>Glow Points ({pointsToUse} pts)</span><span>-₹{pointsDiscount.toFixed(2)}</span></div>}
              <div className="flex justify-between"><span>Tax (18% GST)</span><span>₹{taxAmount.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{shippingAmount === 0 ? 'Free' : `₹${shippingAmount}`}</span></div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span><span className="text-maroon">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;