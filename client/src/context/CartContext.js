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
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
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

  // Calculate total items (cartCount)
  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  
  // Calculate total price (without subscription discounts)
  const totalPrice = cartItems.reduce((sum, item) => {
    const price = item.isSubscription 
      ? (item.originalPrice || item.price) * 0.9 
      : (item.price || item.originalPrice);
    return sum + (price * (item.quantity || 0));
  }, 0);

  // Add to cart function
  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product._id || item._id === product._id);
      
      if (existingItem) {
        // Update existing item
        return prevItems.map(item =>
          (item.id === product._id || item._id === product._id)
            ? { ...item, quantity: (item.quantity || 0) + quantity }
            : item
        );
      }
      
      // Add new item
      const newItem = {
        id: product._id,
        _id: product._id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice || product.price,
        image: product.images?.[0] || product.image || '/api/placeholder/100/100',
        quantity: quantity,
        sku: product.sku,
        isSubscription: product.isSubscription || false
      };
      
      return [...prevItems, newItem];
    });
  };

  // Remove from cart function
  const removeFromCart = async (productId) => {
    setCartItems(prevItems => prevItems.filter(item => 
      item.id !== productId && item._id !== productId
    ));
  };

  // Update quantity function
  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }
    
    setCartItems(prevItems =>
      prevItems.map(item =>
        (item.id === productId || item._id === productId) 
          ? { ...item, quantity: quantity } 
          : item
      )
    );
  };

  // Clear entire cart
  const clearCart = () => {
    if (window.confirm('Clear your entire cart?')) {
      setCartItems([]);
      localStorage.removeItem('cart');
    }
  };

  // Get cart total function
  const getCartTotal = () => {
    return cartItems.reduce((sum, item) => {
      const price = item.isSubscription 
        ? (item.originalPrice || item.price) * 0.9 
        : (item.price || item.originalPrice);
      return sum + (price * (item.quantity || 0));
    }, 0);
  };

  // Get item count
  const getItemCount = () => {
    return cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  };

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
      loading
    }}>
      {children}
    </CartContext.Provider>
  );
};