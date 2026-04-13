import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
        setCartItems([]);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    } else {
      localStorage.removeItem('cart');
    }
  }, [cartItems]);

  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

  const totalPrice = cartItems.reduce((sum, item) => {
    const price = item.isSubscription
      ? (item.originalPrice || item.price) * 0.9
      : (item.price || item.originalPrice);
    return sum + (price * (item.quantity || 0));
  }, 0);

  const addToCart = (product, quantity = 1) => {
    // Always store ID as plain string to avoid ObjectId serialization issues
    const productId = String(product._id || product.id);

    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === productId);

      if (existingItem) {
        return prevItems.map(item =>
          item.id === productId
            ? { ...item, quantity: (item.quantity || 0) + quantity }
            : item
        );
      }

      return [...prevItems, {
        id: productId,       // plain string — used everywhere
        _id: productId,      // kept for compatibility
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice || product.price,
        image: product.images?.[0] || product.image || '/api/placeholder/100/100',
        quantity,
        sku: product.sku,
        isSubscription: product.isSubscription || false,
      }];
    });
  };

  const removeFromCart = (productId) => {
    const id = String(productId);
    setCartItems(prev => prev.filter(item => item.id !== id && item._id !== id));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) { removeFromCart(productId); return; }
    const id = String(productId);
    setCartItems(prev =>
      prev.map(item =>
        (item.id === id || item._id === id) ? { ...item, quantity } : item
      )
    );
  };

  // ✅ No window.confirm — clearCart is called after successful order
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  const getCartTotal = () => totalPrice;
  const getItemCount = () => cartCount;

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      totalPrice,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getItemCount,
      loading,
    }}>
      {children}
    </CartContext.Provider>
  );
};