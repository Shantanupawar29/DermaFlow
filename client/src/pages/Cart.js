// Cart.js - Add conflict warnings at the top
import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { getConflicts } from '../utils/skincareConflicts';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowLeft, CreditCard, Minus, Plus, X, AlertTriangle } from 'lucide-react';

const R = '#7B2D3C';

export default function Cart() {
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    getCartTotal, 
    clearCart, 
    cartCount 
  } = useCart();
  
  const [conflicts, setConflicts] = useState([]);
  const [showConflicts, setShowConflicts] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Check for conflicts whenever cart items change
  useEffect(() => {
    if (cartItems && cartItems.length > 0) {
      // Get product details for conflict checking
      const productsForConflictCheck = cartItems.map(item => ({
        id: item.id,
        name: item.name,
        ingredients: item.ingredients || [], // Make sure your product has ingredients
        category: item.category
      }));
      
      const conflictWarnings = getConflicts(productsForConflictCheck);
      setConflicts(conflictWarnings);
    } else {
      setConflicts([]);
    }
  }, [cartItems]);

  // Handle quantity update
  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      await updateQuantity(productId, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle remove item
  const handleRemoveItem = async (productId, productName) => {
    if (window.confirm(`Remove ${productName} from cart?`)) {
      setIsUpdating(true);
      try {
        await removeFromCart(productId);
      } catch (error) {
        console.error('Error removing item:', error);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  // Empty cart state
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
            <p style={{ color: '#6b7280', margin: 0, fontSize: '0.875rem' }}>
              {cartCount} item{cartCount !== 1 ? 's' : ''}
            </p>
          </div>
          <button 
            onClick={clearCart}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              padding: '0.5rem 1rem', 
              background: '#fef2f2', 
              color: '#dc2626', 
              border: 'none', 
              borderRadius: '0.5rem', 
              cursor: 'pointer', 
              fontWeight: 500, 
              fontSize: '0.875rem'
            }}
          >
            <Trash2 size={14} /> Clear Cart
          </button>
        </div>

        {/* CONFLICT WARNINGS - Add this section */}
        {conflicts.length > 0 && showConflicts && (
          <div style={{ 
            background: '#fef2f2', 
            borderLeft: '4px solid #dc2626', 
            borderRadius: '0.75rem', 
            padding: '1rem 1.25rem', 
            marginBottom: '1.5rem',
            border: '1px solid #fecaca'
          }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <AlertTriangle size={20} color="#dc2626" style={{ marginTop: '2px' }} />
              <div style={{ flex: 1 }}>
                <h3 style={{ fontWeight: 700, color: '#991b1b', margin: '0 0 0.5rem', fontSize: '0.95rem' }}>
                  Skincare Compatibility Warning
                </h3>
                {conflicts.map((conflict, index) => (
                  <div key={index} style={{ marginBottom: index < conflicts.length - 1 ? '0.75rem' : 0 }}>
                    <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: '#7f1d1d', lineHeight: 1.4 }}>
                      {conflict.message}
                    </p>
                    {conflict.severity === 'high' && (
                      <span style={{
                        display: 'inline-block',
                        marginTop: '0.25rem',
                        fontSize: '0.7rem',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '999px',
                        background: '#fee2e2',
                        color: '#dc2626',
                        fontWeight: 600
                      }}>
                        High Severity
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setShowConflicts(false)} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  color: '#991b1b', 
                  padding: '0.2rem',
                  marginTop: '-4px'
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
  
          {/* Cart Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {cartItems.map((item) => {
              const itemPrice = item.isSubscription
                ? (item.originalPrice || item.price) * 0.9
                : (item.price || item.originalPrice);
              
              const itemTotal = itemPrice * item.quantity;
              
              return (
                <div key={item.id || item._id} style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #f3f4f6', padding: '1rem', display: 'flex', gap: '1rem' }}>
                  {/* Image */}
                  <div style={{ width: 88, height: 88, borderRadius: '0.75rem', background: '#f9fafb', flexShrink: 0, overflow: 'hidden' }}>
                    {item.image
                      ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ShoppingBag size={28} color="#d1d5db" />
                        </div>
                    }
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <h3 style={{ fontWeight: 600, color: '#1f2937', margin: 0, fontSize: '0.95rem' }}>{item.name}</h3>
                      <button 
                        onClick={() => handleRemoveItem(item.id || item._id, item.name)}
                        disabled={isUpdating}
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          cursor: 'pointer', 
                          color: '#dc2626', 
                          padding: '0.2rem'
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {item.isSubscription && (
                      <span style={{ 
                        display: 'inline-block', 
                        marginTop: '0.3rem', 
                        fontSize: '0.75rem', 
                        padding: '0.15rem 0.6rem', 
                        borderRadius: '999px', 
                        background: '#dcfce7', 
                        color: '#15803d', 
                        fontWeight: 500 
                      }}>
                        🔄 Subscription −10%
                      </span>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                      {/* Quantity controls */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button 
                          onClick={() => handleUpdateQuantity(item.id || item._id, item.quantity - 1)}
                          disabled={isUpdating}
                          style={{ 
                            width: 32, 
                            height: 32, 
                            border: '1px solid #e5e7eb', 
                            borderRadius: '0.5rem', 
                            background: '#fff', 
                            cursor: 'pointer',
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center'
                          }}
                        >
                          <Minus size={14} />
                        </button>
                        <span style={{ width: 40, textAlign: 'center', fontWeight: 600 }}>
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => handleUpdateQuantity(item.id || item._id, item.quantity + 1)}
                          disabled={isUpdating}
                          style={{ 
                            width: 32, 
                            height: 32, 
                            border: '1px solid #e5e7eb', 
                            borderRadius: '0.5rem', 
                            background: '#fff', 
                            cursor: 'pointer',
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center'
                          }}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      
                      {/* Price */}
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                          ₹{itemTotal.toFixed(2)}
                        </div>
                        {item.isSubscription && item.originalPrice && (
                          <div style={{ fontSize: '0.75rem', color: '#9ca3af', textDecoration: 'line-through' }}>
                            ₹{(item.originalPrice * item.quantity).toFixed(2)}
                          </div>
                        )}
                        <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                          ₹{itemPrice.toFixed(2)} each
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
        <div className="lg:sticky lg:top-20">
            <div style={{ background: '#fff', borderRadius: '1.25rem', border: '1px solid #f3f4f6', padding: '1.5rem' }}>
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
              </div>

              <div style={{ borderTop: '2px solid #f3f4f6', paddingTop: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '1rem' }}>Total</span>
                  <div style={{ textAlign: 'right', flexShrink: 0, maxWidth: '30%' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: R }}>₹{getCartTotal().toFixed(2)}</div>
                    <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>Inclusive of all taxes</div>
                  </div>
                </div>
              </div>

              <Link to="/checkout">
                <button style={{
                  width: '100%', 
                  background: R, 
                  color: '#fff',
                  padding: '0.9rem', 
                  border: 'none', 
                  borderRadius: '0.875rem',
                  fontWeight: 700, 
                  fontSize: '1rem', 
                  cursor: 'pointer',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '0.5rem'
                }}>
                  <CreditCard size={18} />
                  Proceed to Checkout
                </button>
              </Link>

              <Link to="/products" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '0.875rem', color: R, textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>
                <ArrowLeft size={14} /> Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}