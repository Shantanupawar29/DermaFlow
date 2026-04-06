import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { getConflicts } from '../utils/skincareConflicts';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowLeft, CreditCard, Minus, Plus, X } from 'lucide-react';

const R = '#7B2D3C';

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart, cartCount } = useCart();
  const [conflicts, setConflicts]       = useState([]);
  const [showConflicts, setShowConflicts] = useState(true);

  useEffect(() => {
    if (cartItems?.length > 0 && typeof getConflicts === 'function') {
      try { setConflicts(getConflicts(cartItems)); }
      catch { setConflicts([]); }
    } else {
      setConflicts([]);
    }
  }, [cartItems]);

  if (!cartItems || cartItems.length === 0) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ width: 96, height: 96, background: '#F5E8EA', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <ShoppingBag size={40} color={R} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1f2937', marginBottom: '0.75rem' }}>Your Cart is Empty</h2>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Looks like you haven't added any products yet.</p>
          <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: R, color: '#fff', padding: '0.75rem 1.75rem', borderRadius: '0.75rem', textDecoration: 'none', fontWeight: 600 }}>
            <ShoppingBag size={18} /> Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1f2937', margin: 0 }}>Shopping Cart</h1>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '0.875rem' }}>{cartCount} item{cartCount !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => window.confirm('Clear entire cart?') && clearCart()}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 500, fontSize: '0.875rem' }}>
            <Trash2 size={14} /> Clear Cart
          </button>
        </div>

        {/* Conflict warning */}
        {conflicts?.length > 0 && showConflicts && (
          <div style={{ background: '#fefce8', borderLeft: '4px solid #f59e0b', borderRadius: '0.75rem', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.25rem' }}>⚠️</span>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontWeight: 700, color: '#92400e', margin: '0 0 0.5rem', fontSize: '0.9rem' }}>Skincare Compatibility Notes</h3>
              {conflicts.map((c, i) => <p key={i} style={{ margin: '0.2rem 0', fontSize: '0.85rem', color: '#78350f' }}>{c.message}</p>)}
            </div>
            <button onClick={() => setShowConflicts(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#92400e', padding: '0.2rem' }}>
              <X size={18} />
            </button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 360px', gap: '1.5rem', alignItems: 'start' }}>

          {/* Cart Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {cartItems.map((item) => {
              const itemPrice = item.isSubscription
                ? (item.originalPrice || item.price) * 0.9
                : (item.price || item.originalPrice);
              return (
                <div key={item._id} style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #f3f4f6', padding: '1rem', display: 'flex', gap: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  {/* Image */}
                  <div style={{ width: 88, height: 88, borderRadius: '0.75rem', background: '#f9fafb', flexShrink: 0, overflow: 'hidden' }}>
                    {item.image
                      ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShoppingBag size={28} color="#d1d5db" /></div>
                    }
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <h3 style={{ fontWeight: 600, color: '#1f2937', margin: 0, fontSize: '0.95rem', lineHeight: 1.3 }}>{item.name}</h3>
                      <button onClick={() => removeFromCart(item._id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: '0.2rem', flexShrink: 0 }}>
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <span style={{ display: 'inline-block', marginTop: '0.3rem', fontSize: '0.75rem', padding: '0.15rem 0.6rem', borderRadius: '999px', background: item.isSubscription ? '#dcfce7' : '#f3f4f6', color: item.isSubscription ? '#15803d' : '#6b7280', fontWeight: 500 }}>
                      {item.isSubscription ? '🔄 Subscription −10%' : '🛒 One-time'}
                    </span>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                      {/* Qty stepper */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          style={{ width: 30, height: 30, border: '1px solid #e5e7eb', borderRadius: '0.4rem', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Minus size={13} />
                        </button>
                        <span style={{ width: 28, textAlign: 'center', fontWeight: 700, fontSize: '0.9rem' }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          style={{ width: 30, height: 30, border: '1px solid #e5e7eb', borderRadius: '0.4rem', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Plus size={13} />
                        </button>
                      </div>
                      {/* Price */}
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, color: R, fontSize: '1.1rem' }}>₹{(itemPrice / 100).toFixed(2)}</div>
                        {item.isSubscription && item.originalPrice && (
                          <div style={{ fontSize: '0.75rem', color: '#9ca3af', textDecoration: 'line-through' }}>₹{(item.originalPrice / 100).toFixed(2)}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary — sticky */}
          <div style={{ position: 'sticky', top: 80 }}>
            <div style={{ background: '#fff', borderRadius: '1.25rem', border: '1px solid #f3f4f6', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}>
              <h2 style={{ fontWeight: 700, fontSize: '1.2rem', color: '#1f2937', marginBottom: '1.25rem' }}>Order Summary</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#6b7280' }}>
                  <span>Subtotal ({cartCount} item{cartCount !== 1 ? 's' : ''})</span>
                  <span style={{ fontWeight: 600, color: '#1f2937' }}>₹{getCartTotal().toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#6b7280' }}>
                  <span>Shipping</span>
                  <span style={{ color: '#16a34a', fontWeight: 600 }}>Free</span>
                </div>
                {cartItems.some(i => i.isSubscription) && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', background: '#f0fdf4', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', color: '#15803d' }}>
                    <span>Subscription savings</span>
                    <span style={{ fontWeight: 600 }}>−10% applied</span>
                  </div>
                )}
              </div>

              <div style={{ borderTop: '2px solid #f3f4f6', paddingTop: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '1rem' }}>Total</span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: R }}>₹{getCartTotal().toFixed(2)}</div>
                    <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>Inclusive of all taxes</div>
                  </div>
                </div>
              </div>

              {/* ✅ Prominent checkout button */}
              <Link to="/checkout" style={{ display: 'block', textDecoration: 'none' }}>
                <button style={{
                  width: '100%', background: R, color: '#fff',
                  padding: '0.9rem', border: 'none', borderRadius: '0.875rem',
                  fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  boxShadow: '0 4px 16px rgba(123,45,60,0.4)',
                  transition: 'opacity 0.15s',
                }}>
                  <CreditCard size={18} />
                  Proceed to Checkout
                </button>
              </Link>

              <Link to="/products" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '0.875rem', color: R, textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>
                <ArrowLeft size={14} /> Continue Shopping
              </Link>

              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'center', gap: '1.25rem' }}>
                {['🔒 Secure', '🔄 Easy Returns', '🚚 Free Shipping'].map(b => (
                  <span key={b} style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{b}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}