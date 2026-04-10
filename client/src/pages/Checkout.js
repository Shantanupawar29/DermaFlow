import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Checkout = () => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponMessage, setCouponMessage] = useState('');
  const [formData, setFormData] = useState({
    address: { street: '', city: '', state: '', zipCode: '', country: 'India' },
    phone: ''
  });

  const validCoupons = {
    'WELCOME15': { type: 'percentage', value: 15, minOrder: 500 },
    'DERMA20': { type: 'percentage', value: 20, minOrder: 1000 },
    'GLOW10': { type: 'percentage', value: 10, minOrder: 300 },
    'FREESHIP': { type: 'freeshipping', value: 0, minOrder: 999 }
  };
const fetchAddressFromPincode = async (pincode) => {
  // Only trigger when EXACTLY 6 digits
  if (!/^\d{6}$/.test(pincode)) return;

  try {
    console.log("Fetching address for:", pincode);

    const res = await axios.get(`http://localhost:5000/api/pincode/${pincode}`);

    const data = res.data[0];

    if (data.Status === "Success" && data.PostOffice?.length > 0) {
      const postOffice = data.PostOffice[0];

      console.log("API Response:", postOffice);

      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          city: postOffice.District || "",
          state: postOffice.State || "",
          street: postOffice.Name || prev.address.street,
          country: "India"
        }
      }));
    } else {
      console.log("Invalid pincode");
    }
  } catch (error) {
    console.error("Pincode fetch error:", error);
  }
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

  // IMPORTANT: totalPrice from CartContext is already in rupees
  // Because cartItems store price in paise, but totalPrice converts to rupees
  const taxAmount = totalPrice * 0.18;
  const shippingAmount = totalPrice > 1000 ? 0 : 50;
  const discountedTotal = totalPrice - discount;
  const grandTotal = discountedTotal + taxAmount + shippingAmount;

  console.log('Price breakdown (in rupees):');
  console.log('Total Price:', totalPrice);
  console.log('Discount:', discount);
  console.log('Tax:', taxAmount);
  console.log('Grand Total:', grandTotal);

  const loadRazorpayScript = () => new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

  const createOrderAndRedirect = async (orderData) => {
    try {
      console.log('Creating order with data:', orderData);
      
      const response = await axios.post('http://localhost:5000/api/orders', orderData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      console.log('Order created successfully:', response.data);
      console.log('Order ID:', response.data._id);
      
      const orderId = response.data._id;
      
      clearCart();
      console.log('Cart cleared');
      
      // Navigate to order confirmation
      navigate(`/order-confirmation/${orderId}`);
      
      return true;
    } catch (error) {
      console.error('Order creation failed:', error.response?.data || error.message);
      alert(error.response?.data?.message || 'Order failed. Please try again.');
      return false;
    }
  };

  const handleRazorpayPayment = async () => {
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        alert('Could not load Razorpay SDK. Check your internet connection.');
        setLoading(false);
        return;
      }
      
      // Convert rupees to paise for Razorpay (multiply by 100)
      const amountInPaise = Math.round(grandTotal * 100);
      console.log('💰 Sending amount to backend (paise):', amountInPaise);
      console.log('💰 Original amount (rupees):', grandTotal);
      
      const { data: razorpayOrder } = await axios.post(
        'http://localhost:5000/api/payment/create-order',
        { amount: amountInPaise }, // Send in paise
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      if (!razorpayOrder.id) {
        alert('Failed to create payment order. Please try again.');
        setLoading(false);
        return;
      }

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Derma Flow',
        description: 'Skincare Order',
        order_id: razorpayOrder.id,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: formData.phone || '',
        },
        theme: { color: '#4A0E2E' },
        handler: async (response) => {
          try {
            const verifyRes = await axios.post(
              'http://localhost:5000/api/payment/verify',
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );

            if (verifyRes.data.success) {
              const orderData = {
                items: cartItems.map(item => ({
                  product: item.id || item._id,
                  quantity: item.quantity,
                  name: item.name,
                  price: item.price, // Price in paise from cart
                })),
                shippingAddress: formData.address,
                paymentMethod: 'razorpay',
                phone: formData.phone,
                totalAmount: Math.round(grandTotal * 100), // Store in paise
                discountAmount: Math.round(discount * 100),
                couponCode: couponApplied ? couponCode : null,
              };
              
              await createOrderAndRedirect(orderData);
            } else {
              alert('Payment verification failed. Please contact support.');
              setLoading(false);
            }
          } catch (err) {
            console.error('Order save error:', err);
            alert('Payment done but order save failed: ' + (err.response?.data?.message || err.message));
            setLoading(false);
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
      return;
    }

    // COD order
    const orderData = {
      items: cartItems.map(item => ({
        product: item.id,
        quantity: item.quantity,
        name: item.name,
        price: item.price, // Price in paise
      })),
      shippingAddress: formData.address,
      paymentMethod: 'cod',
      phone: formData.phone,
      totalAmount: Math.round(grandTotal * 100), // Store in paise
      discountAmount: Math.round(discount * 100),
      couponCode: couponApplied ? couponCode : null
    };

    await createOrderAndRedirect(orderData);
    setLoading(false);
  };

  // Show empty cart message only if no items AND not loading
  if (cartItems.length === 0 && !loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-gray-600 mb-6">Please add some items to proceed with checkout.</p>
        <Link to="/products" className="bg-maroon text-white px-6 py-2 rounded-lg inline-block">
          Continue Shopping
        </Link>
      </div>
    );
  }

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
                <input
  type="text"
  placeholder="City"
  required
  className="border p-2 rounded bg-gray-100"
  value={formData.address.city}
  readOnly
/>
<select
  required
  className="border p-2 rounded"
  value={formData.address.state}
  onChange={(e) => setFormData((prev) => ({
    ...prev,
    address: { ...prev.address, state: e.target.value }
  }))}
>
  <option value="">Select State</option>
  {[
    "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa",
    "Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala",
    "Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland",
    "Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
    "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
    "Delhi","Jammu and Kashmir","Ladakh","Puducherry"
  ].map((state) => (
    <option key={state} value={state}>{state}</option>
  ))}
</select>
<input
  type="text"
  placeholder="Pincode"
  required
  maxLength={6}
  className="border p-2 rounded"
  value={formData.address.zipCode}
  onChange={(e) => {
    const pincode = e.target.value.replace(/\D/g, ""); // allow only numbers

    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, zipCode: pincode }
    }));

    if (pincode.length === 6) {
      fetchAddressFromPincode(pincode);
    }
  }}
/>
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
            
            <button type="submit" disabled={loading}
              style={{ width: '100%', marginTop: '1rem', backgroundColor: '#4A0E2E', color: 'white', padding: '12px', borderRadius: '8px', fontWeight: '600', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Processing...' : `Place Order (₹${grandTotal.toFixed(2)})`}
            </button>
          </form>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
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
            </div>
            
            <div className="space-y-2 mb-4 max-h-60 overflow-auto">
              {cartItems.map((item, index) => (
                <div key={item.id || index} className="flex justify-between text-sm">
                  <span>{item.name} x {item.quantity}</span>
                  <span>₹{((item.price * item.quantity) ).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between"><span>Subtotal</span><span>₹{totalPrice.toFixed(2)}</span></div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{discount.toFixed(2)}</span></div>
              )}
              <div className="flex justify-between"><span>Tax (18% GST)</span><span>₹{taxAmount.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{shippingAmount === 0 ? 'Free' : `₹${shippingAmount}`}</span></div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span><span className="text-[#4A0E2E]">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;