import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const CartContext = createContext();

// Custom hook to use the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Cart Provider component
export const CartProvider = ({ children }) => {
  // Initialize cart from localStorage
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return [];
    }
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cartItems]);

  // Add item to cart
  const addToCart = (product, isSubscription = false) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item._id === product._id);
      
      if (existingItem) {
        // Update quantity if item already exists
        return prevItems.map(item =>
          item._id === product._id
            ? { 
                ...item, 
                quantity: item.quantity + 1,
                isSubscription: isSubscription || item.isSubscription
              }
            : item
        );
      }
      
      // Add new item
      return [...prevItems, { 
        ...product, 
        quantity: 1, 
        isSubscription,
        originalPrice: product.price
      }];
    });
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item._id !== productId));
  };

  // Update quantity of an item
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(prevItems =>
      prevItems.map(item =>
        item._id === productId ? { ...item, quantity } : item
      )
    );
  };

  // Clear entire cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Get total number of items in cart
  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Get total cart value
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const itemPrice = item.isSubscription 
        ? (item.originalPrice || item.price) * 0.9 
        : (item.price || item.originalPrice);
      return total + (itemPrice / 100) * item.quantity;
    }, 0);
  };

  // Check if cart is empty
  const isCartEmpty = () => {
    return cartItems.length === 0;
  };

  // Update subscription status for an item
  const updateSubscription = (productId, isSubscription) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item._id === productId ? { ...item, isSubscription } : item
      )
    );
  };

  // Get item by ID
  const getCartItem = (productId) => {
    return cartItems.find(item => item._id === productId);
  };

  // Values to be provided to consumers
  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartCount,
    getCartTotal,
    isCartEmpty,
    updateSubscription,
    getCartItem,
    cartCount: getCartCount(),
    cartTotal: getCartTotal()
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};