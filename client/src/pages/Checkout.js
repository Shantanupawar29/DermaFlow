import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Checkout = () => {
  const { cartItems, totalPrice, clearCart } = useCart();
  // Add this state
const [couponCode, setCouponCode] = useState('');
const [discount, setDiscount] = useState(0);
const [couponApplied, setCouponApplied] = useState(false);
const [couponMessage, setCouponMessage] = useState('');

// Valid coupons
const validCoupons = {
  'WELCOME15': { type: 'percentage', value: 15, minOrder: 500 },
  'DERMA20': { type: 'percentage', value: 20, minOrder: 1000 },
  'GLOW10': { type: 'percentage', value: 10, minOrder: 300 },
  'FREESHIP': { type: 'freeshipping', value: 0, minOrder: 999 }
};

const applyCoupon = () => {
  const code = couponCode.toUpperCase();
  const coupon = validCoupons[code];
  
  if (!coupon) {
    setCouponMessage('Invalid coupon code');
    setCouponApplied(false);
    setDiscount(0);
    return;
  }
  
  if (totalPrice < coupon.minOrder) {
    setCouponMessage(`Minimum order of ₹${coupon.minOrder} required`);
    setCouponApplied(false);
    setDiscount(0);
    return;
  }
  
  if (coupon.type === 'percentage') {
    const discountAmount = (totalPrice * coupon.value) / 100;
    setDiscount(discountAmount);
    setCouponMessage(`Coupon applied! You saved ₹${discountAmount.toFixed(2)}`);
    setCouponApplied(true);
  } else if (coupon.type === 'freeshipping') {
    setDiscount(0);
    setCouponMessage('Free shipping applied!');
    setCouponApplied(true);
  }
  
  setTimeout(() => setCouponMessage(''), 3000);
};
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [formData, setFormData] = useState({
    address: { street: '', city: '', state: '', zipCode: '', country: 'India' },
    phone: ''
  });

  useEffect(() => {
    if (cartItems.length === 0) navigate('/cart');
  }, [cartItems, navigate]);

  const taxAmount = totalPrice * 0.18;
  const shippingAmount = totalPrice > 1000 ? 0 : 50;
  const grandTotal = totalPrice + taxAmount + shippingAmount;

  // Load Razorpay script
  

  // Replace the handleRazorpayPayment function with this:



const loadRazorpayScript = () => new Promise((resolve) => {
  if (window.Razorpay) return resolve(true);
  const s = document.createElement('script');
  s.src = 'https://checkout.razorpay.com/v1/checkout.js';
  s.onload  = () => resolve(true);
  s.onerror = () => resolve(false);
  document.body.appendChild(s);
});

const handleRazorpayPayment = async () => {
  try {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      alert('Could not load Razorpay SDK. Check your internet connection.');
      setLoading(false);
      return;
    }

    console.log('Sending grandTotal to backend:', grandTotal);

    const { data: razorpayOrder } = await axios.post(
      'http://localhost:5000/api/payment/create-order',
      { amount: grandTotal },
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    );

    console.log('Razorpay order from backend:', razorpayOrder);

    if (!razorpayOrder.id) {
      alert('Failed to create payment order. Please try again.');
      setLoading(false);
      return;
    }

    const options = {
      key:         process.env.REACT_APP_RAZORPAY_KEY_ID,
      amount:      razorpayOrder.amount,
      currency:    razorpayOrder.currency,
      name:        'Derma Flow',
      description: 'Skincare Order',
      order_id:    razorpayOrder.id,
      prefill: {
        name:    user?.name  || '',
        email:   user?.email || '',
        contact: formData.phone || '',
      },
      theme: { color: '#4A0E2E' },
      handler: async (response) => {
        try {
          const verifyRes = await axios.post(
            'http://localhost:5000/api/payment/verify',
            {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            },
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
          );

          if (verifyRes.data.success) {
            await axios.post(
              'http://localhost:5000/api/orders',
              {
                items: cartItems.map(item => ({
                  product:  item.id || item._id,
                  quantity: item.quantity,
                  name:     item.name,
                  price:    item.price,
                })),
                shippingAddress: formData.address,
                paymentMethod:   'razorpay',
                phone:           formData.phone,
                totalAmount:     grandTotal,
              },
              { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );

            clearCart();
            navigate('/dashboard');
          }
        } catch (err) {
          console.error('Order save error:', err);
          alert('Payment done but order save failed: ' + (err.response?.data?.message || err.message));
        }
      },
      modal: {
        ondismiss: () => {
          console.log('Payment modal dismissed');
          setLoading(false);
        },
      },
    };

    const rzp = new window.Razorpay(options);

    rzp.on('payment.failed', (response) => {
      console.error('Payment failed event:', response.error);
      alert('Payment failed: ' + response.error.description);
      setLoading(false);
    });

    rzp.open();

  } catch (error) {
    console.error('Payment error:', error.response?.data || error.message);
    alert(error.response?.data?.error || 'Payment failed. Please try again.');
    setLoading(false);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (paymentMethod === 'razorpay') {
      await handleRazorpayPayment();
      setLoading(false);
      return;
    }

    try {
      const orderData = {
        items: cartItems.map(item => ({
          product: item.id,
          quantity: item.quantity,
          name: item.name,
          price: item.price
        })),
        shippingAddress: formData.address,
        paymentMethod: 'cod',
        phone: formData.phone,
        totalAmount: grandTotal
      };

      await axios.post('http://localhost:5000/api/orders', orderData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      alert('Order placed successfully! You will pay on delivery.');
      clearCart();
      navigate('/dashboard');
    } catch (error) {
      alert(error.response?.data?.message || 'Order failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <input type="text" placeholder="Street Address" required className="border p-2 rounded"
                  value={formData.address.street} onChange={(e) => setFormData({
                    ...formData, address: { ...formData.address, street: e.target.value }
                  })} />
                <input type="text" placeholder="City" required className="border p-2 rounded"
                  value={formData.address.city} onChange={(e) => setFormData({
                    ...formData, address: { ...formData.address, city: e.target.value }
                  })} />
                <input type="text" placeholder="State" required className="border p-2 rounded"
                  value={formData.address.state} onChange={(e) => setFormData({
                    ...formData, address: { ...formData.address, state: e.target.value }
                  })} />
                <input type="text" placeholder="ZIP Code" required className="border p-2 rounded"
                  value={formData.address.zipCode} onChange={(e) => setFormData({
                    ...formData, address: { ...formData.address, zipCode: e.target.value }
                  })} />
                <input type="tel" placeholder="Phone Number" required className="border p-2 rounded"
                  value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
              <div className="space-y-3">
                <label className="flex items-center p-3 border rounded cursor-pointer">
                  <input type="radio" value="cod" checked={paymentMethod === 'cod'} 
                    onChange={(e) => setPaymentMethod(e.target.value)} className="mr-3" />
                  <div><span className="font-medium">Cash on Delivery</span></div>
                </label>
                <label className="flex items-center p-3 border rounded cursor-pointer">
                  <input type="radio" value="razorpay" checked={paymentMethod === 'razorpay'} 
                    onChange={(e) => setPaymentMethod(e.target.value)} className="mr-3" />
                  <div><span className="font-medium">Credit/Debit Card / UPI</span>
                    <p className="text-xs text-gray-500">Powered by Razorpay</p>
                  </div>
                </label>
              </div>
            </div>
          </form>
        </div>
<div className="mb-4">
  <div className="flex gap-2">
    <input
      type="text"
      placeholder="Coupon Code"
      value={couponCode}
      onChange={(e) => setCouponCode(e.target.value)}
      className="flex-1 border border-gray-300 rounded-lg p-2 text-sm"
    />
    <button
      type="button"
      onClick={applyCoupon}
      className="bg-[#4A0E2E] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#6B1D45]"
    >
      Apply
    </button>
  </div>
  {couponMessage && (
    <p className={`text-xs mt-1 ${couponApplied ? 'text-green-600' : 'text-red-600'}`}>
      {couponMessage}
    </p>
  )}
  {couponApplied && discount > 0 && (
    <p className="text-xs text-green-600 mt-1">Discount: -₹{discount.toFixed(2)}</p>
  )}
</div>
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.name} x {item.quantity}</span>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between"><span>Subtotal</span><span>₹{totalPrice.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Tax (18% GST)</span><span>₹{taxAmount.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{shippingAmount === 0 ? 'Free' : `₹${shippingAmount}`}</span></div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span><span className="text-[#4A0E2E]">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
            <button onClick={handleSubmit} disabled={loading}
              style={{ width: '100%', marginTop: '1.5rem', backgroundColor: '#4A0E2E', color: 'white', padding: '12px', borderRadius: '8px', fontWeight: '600', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Processing...' : `Place Order (₹${grandTotal.toFixed(2)})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;