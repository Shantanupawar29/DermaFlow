import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

import api from '../services/api';

export default function WishlistButton({ productId, size = 20, className = '' }) {
  const { user, isAuthenticated } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      checkWishlistStatus();
    }
  }, [productId, isAuthenticated]);

  const checkWishlistStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/profile/wishlist`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const wishlist = response.data;
      setIsWishlisted(wishlist.some(item => item._id === productId));
    } catch (error) {
      console.error('Error checking wishlist:', error);
    }
  };

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      alert('Please login to add items to wishlist');
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (isWishlisted) {
        await axios.delete(`${API_URL}/profile/wishlist/${productId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsWishlisted(false);
      } else {
        await axios.post(`${API_URL}/profile/wishlist/${productId}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsWishlisted(true);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleWishlist}
      disabled={loading}
      className={`${className} transition-transform hover:scale-110`}
    >
      <Heart
        size={size}
        className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'}
      />
    </button>
  );
}