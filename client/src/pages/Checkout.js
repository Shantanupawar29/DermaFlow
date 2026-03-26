import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart }   from '../context/CartContext';
import { useAuth }   from '../context/AuthContext';
import { createRazorpayOrder, verifyPayment, createOrder } from '../services/api';
 
// Load Razorpay script dynamically
const loadRazorpay = () => new Promise((resolve) => {
  if (document.getElementById('rzp-script')) { resolve(true); return; }
  const s = document.createElement('script');
  s.id = 'rzp-script';
  s.src = 'https://checkout.razorpay.com/v1/checkout.js';
  s.onload = () => resolve(true);
  s.onerror = () => resolve(false);
  document.body.appendChild(s);
});
 
export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
 
  const gst   = subtotal * 0.18;
  const total = subtotal + gst;
 
  const [step,    setStep]    = useState(1);  // 1=shipping, 2=paying, 3=done
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState(null);
  const [form,    setForm]    = useState({
    firstName:'', lastName:'', email: user?.email||'',
    phone:'', address:'', city:'', state:'Maharashtra', pincode:''
  });
 
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
 
  const handlePayment = async () => {
    setLoading(true);
    try {
      // 1. Load Razorpay SDK
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error('Razorpay SDK failed to load');
 
      // 2. Create order on YOUR backend (gets a Razorpay order_id)
      const { data } = await createRazorpayOrder(total);
 
      // 3. Open Razorpay checkout
      const result = await new Promise((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: data.amount,
          currency: 'INR',
          name: 'Derma Flow',
          order_id: data.orderId,
          prefill: {
            name:    `${form.firstName} ${form.lastName}`,
            email:   form.email,
            contact: form.phone,
          },
          theme: { color: '#7B2D3C' },
          handler: (response) => resolve(response),
          modal: { ondismiss: () => reject(new Error('Payment cancelled')) }
        });
        rzp.open();
      });
 
      // 4. Verify payment on backend
      await verifyPayment(result);
 
      // 5. Save order to MongoDB
      const orderData = {
        items: items.map(i => ({
          product: i.product._id,
          name: i.product.name,
          price: i.isSubscription ? i.product.price * 0.9 : i.product.price,
          quantity: i.quantity,
          isSubscription: i.isSubscription,
        })),
        shipping: {
          name:    `${form.firstName} ${form.lastName}`,
          email:   form.email,
          phone:   form.phone,
          address: form.address,
          city:    form.city,
          state:   form.state,
          pincode: form.pincode,
        },
        payment: {
          razorpayOrderId:   result.razorpay_order_id,
          razorpayPaymentId: result.razorpay_payment_id,
          razorpaySignature: result.razorpay_signature,
          status: 'paid',
        },
        subtotal, gst, total
      };
 
      const saved = await createOrder(orderData);
 
      // 6. Show invoice
      setInvoice({
        invoiceNumber: `INV-DF-${new Date().getFullYear()}-${Math.floor(Math.random()*9000+1000)}`,
        date: new Date().toLocaleDateString('en-IN'),
        transactionId: result.razorpay_payment_id,
        orderId: saved.data._id,
        shipping: form,
        items, subtotal, gst, total
      });
      clearCart();
      setStep(3);
    } catch (err) {
      if (err.message !== 'Payment cancelled') alert(err.message);
    } finally { setLoading(false); }
  };
 
  if (step === 3 && invoice) return <InvoiceView invoice={invoice} />;
 
  return (
    <div className='container mx-auto px-4 py-10 max-w-3xl'>
      <h1 className='text-2xl font-bold mb-6'>Checkout</h1>
 
      {step === 1 && (
        <div className='bg-white rounded-xl border p-6 space-y-4'>
          <h2 className='font-semibold text-lg'>Shipping Details</h2>
          <div className='grid grid-cols-2 gap-4'>
            <input placeholder='First name' className='border rounded-lg px-3 py-2 text-sm'
              value={form.firstName} onChange={set('firstName')} />
            <input placeholder='Last name'  className='border rounded-lg px-3 py-2 text-sm'
              value={form.lastName}  onChange={set('lastName')}  />
          </div>
          <input placeholder='Email'   type='email' className='w-full border rounded-lg px-3 py-2 text-sm'
            value={form.email}   onChange={set('email')}   />
          <input placeholder='Phone'   type='tel'   className='w-full border rounded-lg px-3 py-2 text-sm'
            value={form.phone}   onChange={set('phone')}   />
          <input placeholder='Address' className='w-full border rounded-lg px-3 py-2 text-sm'
            value={form.address} onChange={set('address')} />
          <div className='grid grid-cols-2 gap-4'>
            <input placeholder='City'    className='border rounded-lg px-3 py-2 text-sm'
              value={form.city}    onChange={set('city')}    />
            <input placeholder='Pincode' className='border rounded-lg px-3 py-2 text-sm'
              value={form.pincode} onChange={set('pincode')} />
          </div>
          <button onClick={() => setStep(2)}
            className='w-full bg-rose-DEFAULT text-white py-3 rounded-lg font-medium mt-2'>
            Continue to Payment
          </button>
        </div>
      )}
 
      {step === 2 && (
        <div className='bg-white rounded-xl border p-6 space-y-4'>
          <h2 className='font-semibold text-lg'>Payment</h2>
          <div className='bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800'>
            <strong>Test Mode</strong> — Card: 4111 1111 1111 1111 · OTP: 1234
          </div>
          <div className='border rounded-lg p-3 text-sm text-gray-600'>
            <p>Subtotal: ₹{(subtotal/100).toFixed(2)}</p>
            <p>GST 18%: ₹{(gst/100).toFixed(2)}</p>
            <p className='font-bold text-base mt-1'>Total: ₹{(total/100).toFixed(2)}</p>
          </div>
          <button onClick={handlePayment} disabled={loading}
            className='w-full bg-rose-DEFAULT text-white py-3 rounded-lg font-medium'>
            {loading ? 'Processing...' : `Pay ₹${(total/100).toFixed(2)} via Razorpay`}
          </button>
          <p className='text-center text-xs text-gray-400'>Secured by Razorpay · 256-bit SSL</p>
          <button onClick={() => setStep(1)} className='text-xs text-gray-500 underline w-full text-center'>
            Back to shipping
          </button>
        </div>
      )}
    </div>
  );
}
 
function InvoiceView({ invoice }) {
  return (
    <div className='container mx-auto px-4 py-10 max-w-2xl'>
      <div className='bg-white rounded-xl border p-8'>
        <div className='flex justify-between items-start mb-6 pb-4 border-b'>
          <div>
            <p className='text-xl font-bold text-rose-DEFAULT'>✦ Derma Flow</p>
            <p className='text-xs text-gray-500'>dermaflow.in</p>
          </div>
          <div className='text-right text-xs text-gray-500'>
            <p className='font-bold text-gray-900'>{invoice.invoiceNumber}</p>
            <p>{invoice.date}</p>
            <span className='inline-block bg-green-100 text-green-700 px-2 py-0.5 rounded-full mt-1'>PAID</span>
          </div>
        </div>
        <table className='w-full text-sm mb-4'>
          <thead><tr className='border-b text-gray-500 text-xs uppercase'>
            <th className='text-left py-2'>Product</th>
            <th className='text-center py-2'>Qty</th>
            <th className='text-right py-2'>Amount</th>
          </tr></thead>
          <tbody>
            {invoice.items.map((i, idx) => (
              <tr key={idx} className='border-b'>
                <td className='py-2'>{i.product.name}</td>
                <td className='py-2 text-center'>{i.quantity}</td>
                <td className='py-2 text-right'>
                  ₹{((i.isSubscription ? i.product.price*0.9 : i.product.price) * i.quantity / 100).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className='flex justify-end'>
          <div className='w-44 text-sm space-y-1'>
            <div className='flex justify-between'><span className='text-gray-500'>Subtotal</span><span>₹{(invoice.subtotal/100).toFixed(2)}</span></div>
            <div className='flex justify-between'><span className='text-gray-500'>GST 18%</span><span>₹{(invoice.gst/100).toFixed(2)}</span></div>
            <div className='flex justify-between font-bold text-base border-t pt-1'>
              <span>Total</span><span>₹{(invoice.total/100).toFixed(2)}</span>
            </div>
          </div>
        </div>
        <p className='text-xs text-gray-400 mt-6 border-t pt-4'>
          Transaction ID: {invoice.transactionId}
        </p>
      </div>
      <div className='flex gap-4 mt-4'>
        <button onClick={() => window.print()}
          className='border rounded-lg px-4 py-2 text-sm'>Download Invoice</button>
        <Link to='/products'
          className='bg-rose-DEFAULT text-white rounded-lg px-4 py-2 text-sm'>Continue Shopping</Link>
      </div>
    </div>
  );
}
 
