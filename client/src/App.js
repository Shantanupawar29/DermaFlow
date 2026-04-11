import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import DiscountBanner from './components/DiscountBanner';
import FirstTimePopup from './components/FirstTimePopup';
import SessionTimeout from './components/SessionTimeout';
import ExitIntentPopup from './components/ExitIntentPopup';
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
import OrderConfirmation from './pages/OrderConfirmation';
import Invoice from './pages/Invoice';
import Reviews from './pages/Reviews';
import Feedback from './pages/Feedback';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Returns from './pages/Returns';
import AdminDashboard from './pages/admin/AdminDashboard';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import BIHub from './pages/admin/BIHub';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppProvider>
            <Toaster position="top-right" richColors />
            <SessionTimeout />
            <FirstTimePopup />
            <ExitIntentPopup />
            
            <Routes>
              {/* Admin routes - NO Navbar/Footer */}
              <Route path="/admin/*" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />
              
              {/* Public routes - WITH Navbar/Footer */}
              <Route path="*" element={
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
                      <Route path="/order-confirmation/:id" element={<PrivateRoute><OrderConfirmation /></PrivateRoute>} />
                      <Route path="/invoice/:id" element={<PrivateRoute><Invoice /></PrivateRoute>} />
                      <Route path="/reviews" element={<Reviews />} />
                      <Route path="/feedback" element={<Feedback />} />
                      <Route path="/privacy" element={<Privacy />} />
                      <Route path="/terms" element={<Terms />} />
                      <Route path="/returns" element={<Returns />} />
                      <Route path="/admin/bidashboard" element={<BIHub />} />
                     
                    </Routes>
                  </main>
                  <Footer />
                </div>
              } />
            </Routes>
          </AppProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;