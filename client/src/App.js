import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import DiscountBanner from './components/DiscountBanner';
import FirstTimePopup from './components/FirstTimePopup';
import SessionTimeout from './components/SessionTimeout';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Quiz from './pages/Quiz';
import About from './pages/About';
import Help from './pages/Help';
import Offers from './pages/Offers';
import AdminDashboard from './pages/admin/AdminDashboard';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppProvider>
            <Toaster position="top-right" richColors />
            <SessionTimeout />
            <FirstTimePopup />
            <div className="min-h-screen bg-background flex flex-col">
              <DiscountBanner />
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/quiz" element={<Quiz />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                  <Route path="/about" element={<About />} />
                  <Route path="/help" element={<Help />} />
                  <Route path="/offers" element={<Offers />} />
                  <Route path="/admin/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                </Routes>
              </main>
              <Footer />
            </div>
          </AppProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;