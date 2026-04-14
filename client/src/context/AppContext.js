import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  // Get auth from AuthContext
  const { user, isAuthenticated, logout, loading: authLoading } = useAuth();
  const [totalItems, setTotalItems] = useState(0);
  const { cartItems } = useCart();

  // Calculate cart total
  useEffect(() => {
    const total = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    setTotalItems(total);
  }, [cartItems]);

  // App-specific values only
  const value = {
    // Auth values (from AuthContext)
    user,
    isAuthenticated,
    logout,
    loading: authLoading,
    glowPoints: user?.glowPoints || 0,
    
    // Cart values
    totalItems,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};