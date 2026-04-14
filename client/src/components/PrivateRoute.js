import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  // ✅ Show loader while checking auth (not just "Loading..." text)
  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon"></div>
    </div>;
  }
  
  // ✅ Check if user exists AND user is not a temporary loading object
  return user && !user.temp ? children : <Navigate to="/login" />;  // ✅ Correct
};

export default PrivateRoute;