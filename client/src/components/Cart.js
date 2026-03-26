import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { getConflicts } from '../utils/skincareConflicts';
import { Link } from 'react-router-dom';

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

  useEffect(() => {
    // Debug: Log what's available
    console.log('Cart items:', cartItems);
    console.log('getConflicts function:', typeof getConflicts);
    
    // Check for conflicts whenever cart changes
    if (cartItems && cartItems.length > 0 && typeof getConflicts === 'function') {
      try {
        const conflictsList = getConflicts(cartItems);
        console.log('Conflicts found:', conflictsList);
        setConflicts(conflictsList);
      } catch (error) {
        console.error('Error checking conflicts:', error);
        setConflicts([]);
      }
    } else {
      setConflicts([]);
    }
  }, [cartItems]);

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your entire cart?')) {
      clearCart();
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
        <p className="text-gray-600 mb-6">Looks like you haven't added any products yet.</p>
        <Link 
          to="/products" 
          className="bg-rose-DEFAULT text-white px-6 py-2 rounded-lg hover:opacity-90 inline-block"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Shopping Cart ({cartCount} items)</h1>
        <button 
          onClick={handleClearCart}
          className="text-red-500 hover:text-red-700 text-sm"
        >
          Clear Cart
        </button>
      </div>
      
      {/* Conflicts/Warnings Section */}
      {conflicts && conflicts.length > 0 && showConflicts && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Skincare Compatibility Notes</h3>
            <button 
              onClick={() => setShowConflicts(false)}
              className="text-yellow-600 hover:text-yellow-800"
            >
              ✕
            </button>
          </div>
          <div className="space-y-2">
            {conflicts.map((conflict, index) => (
              <div key={index} className="text-sm text-yellow-700">
                {conflict.message}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border">
            {cartItems.map((item) => {
              const itemPrice = item.isSubscription 
                ? (item.originalPrice || item.price) * 0.9 
                : (item.price || item.originalPrice);
              
              return (
                <div key={item._id} className="flex p-4 border-b last:border-b-0">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <span className="text-xs text-gray-500 text-center px-2">{item.name.substring(0, 15)}</span>
                    )}
                  </div>
                  
                  <div className="flex-1 ml-4">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500">
                          {item.isSubscription ? '🔄 Subscription (Save 10%)' : '🛒 One-time purchase'}
                        </p>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                    
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="w-8 h-8 border rounded-lg hover:bg-gray-50"
                        >
                          -
                        </button>
                        <span className="w-12 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="w-8 h-8 border rounded-lg hover:bg-gray-50"
                        >
                          +
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-bold text-rose-DEFAULT">
                          ₹{(itemPrice / 100).toFixed(2)}
                        </div>
                        {item.isSubscription && (
                          <div className="text-xs text-gray-500">
                            {(item.originalPrice || item.price) && 
                              `Was: ₹${((item.originalPrice || item.price) / 100).toFixed(2)}`
                            }
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal ({cartCount} items)</span>
                <span>₹{getCartTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              {cartItems.some(item => item.isSubscription) && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Subscription Savings</span>
                  <span>-10% on selected items</span>
                </div>
              )}
            </div>
            
            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="text-rose-DEFAULT text-xl">₹{getCartTotal().toFixed(2)}</span>
              </div>
            </div>
            
            <Link to="/checkout">
              <button className="w-full bg-rose-DEFAULT text-white py-3 rounded-lg font-semibold hover:opacity-90 transition">
                Proceed to Checkout
              </button>
            </Link>
            
            <Link to="/products" className="block text-center mt-4 text-sm text-rose-DEFAULT hover:underline">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}