import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { LoadingProvider } from './context/LoadingContext'; // Keep this
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import DiscountBanner from './components/DiscountBanner';
import FirstTimePopup from './components/FirstTimePopup';
import SessionTimeout from './components/SessionTimeout';
import ExitIntentPopup from './components/ExitIntentPopup';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import { DermaLoader } from './components/Loader';
import { ApiLoaderWrapper } from './components/ApiLoaderWrapper';
// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Quiz = lazy(() => import('./pages/Quiz'));
const About = lazy(() => import('./pages/About'));
const Help = lazy(() => import('./pages/Help'));
const Offers = lazy(() => import('./pages/Offers'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'));
const Invoice = lazy(() => import('./pages/Invoice'));
const Reviews = lazy(() => import('./pages/Reviews'));
const Feedback = lazy(() => import('./pages/Feedback'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const Returns = lazy(() => import('./pages/Returns'));
const TrackOrder = lazy(() => import('./pages/TrackOrder'));
const SlotMachine = lazy(() => import('./pages/SlotMachine'));
const BIHub = lazy(() => import('./pages/admin/BIHub'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const Subscriptions = lazy(() => import('./pages/Subscriptions'));

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppProvider>
          <LoadingProvider>
  <ApiLoaderWrapper>
              <Toaster position="top-right" richColors />
              <SessionTimeout />
              <FirstTimePopup />
              <ExitIntentPopup />

              <Routes>
                {/* Admin routes - NO Navbar/Footer */}
                <Route path="/admin/*" element={
                  <AdminRoute>
                    <Suspense fallback={<DermaLoader message="Loading admin panel..." />}>
                      <AdminDashboard />
                    </Suspense>
                  </AdminRoute>
                } />

                {/* BIHub route */}
                <Route path="/admin/bidashboard" element={
                  <AdminRoute>
                    <Suspense fallback={<DermaLoader message="Loading BI Dashboard..." />}>
                      <BIHub />
                    </Suspense>
                  </AdminRoute>
                } />

                {/* Dashboard route */}
                <Route path="/dashboard" element={
                  <PrivateRoute>
                    <Suspense fallback={<DermaLoader message="Loading dashboard..." />}>
                      <Dashboard />
                    </Suspense>
                  </PrivateRoute>
                } />

                <Route path="/subscriptions" element={
                  <PrivateRoute>
                    <Suspense fallback={<DermaLoader message="Loading subscriptions..." />}>
                      <Subscriptions />
                    </Suspense>
                  </PrivateRoute>
                } />

                {/* Public routes - WITH Navbar/Footer */}
                <Route path="*" element={
                  <div className="min-h-screen bg-background flex flex-col">
                    <DiscountBanner />
                    <Navbar />
                    <main className="flex-grow">
                      <Suspense fallback={<DermaLoader />}>
                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/home" element={<Home />} />
                          <Route path="/products" element={<Products />} />
                          <Route path="/product/:id" element={<ProductDetail />} />
                          <Route path="/quiz" element={<Quiz />} />
                          <Route path="/cart" element={<Cart />} />
                          <Route path="/track" element={<TrackOrder />} />
                          <Route path="/slot" element={<SlotMachine />} />
                          <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
                          <Route path="/login" element={<Login />} />
                          <Route path="/register" element={<Register />} />
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
                        </Routes>
                      </Suspense>
                    </main>
                    <Footer />
                  </div>
                } />
              </Routes>
              </ApiLoaderWrapper>
            </LoadingProvider>
          </AppProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;