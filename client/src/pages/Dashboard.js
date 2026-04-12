import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  User, ShoppingBag, Heart, MapPin, Settings, Star, 
  Package, Truck, CheckCircle, Clock, AlertCircle,
  Plus, Edit2, Trash2, LogOut, Sparkles, Gift,
  ChevronRight, Calendar, Award, Copy, X, Home,
  Phone, Mail, Map, RefreshCw, TrendingUp, LayoutDashboard,
  History, Wallet, Bell, Shield, HelpCircle, Sun, Moon, CreditCard,
  Info
} from 'lucide-react';

import { Briefcase } from 'lucide-react';
import LocationDetector from '../components/LocationDetector';
import api from '../services/api';

// Status config
const ORDER_STATUS = {
  pending: { label: 'Pending', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  confirmed: { label: 'Confirmed', icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
  shipped: { label: 'Shipped', icon: Truck, color: 'text-purple-600', bg: 'bg-purple-50' },
  delivered: { label: 'Delivered', icon: Package, color: 'text-green-600', bg: 'bg-green-50' },
  cancelled: { label: 'Cancelled', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' }
};

// Tier config
const TIERS = {
  bronze: { name: 'Bronze', min: 0, max: 4999, color: '#cd7f32', bg: '#fef3c7' },
  silver: { name: 'Silver', min: 5000, max: 19999, color: '#94a3b8', bg: '#f1f5f9' },
  gold: { name: 'Gold', min: 20000, max: 49999, color: '#d4af37', bg: '#fefce8' },
  platinum: { name: 'Platinum', min: 50000, max: Infinity, color: '#7c3aed', bg: '#ede9fe' }
};

export default function Dashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [stats, setStats] = useState({});
  const [routine, setRoutine] = useState({ amRoutine: [], pmRoutine: [], skinType: null, concerns: [] });
  const [activeSection, setActiveSection] = useState('overview');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    name: '', street: '', city: '', state: '', zipCode: '', phone: '', label: 'Home', isDefault: false, landmark: ''
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewProduct, setReviewProduct] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [savedCards, setSavedCards] = useState([]);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const [userRes, ordersRes, wishlistRes, addressesRes, statsRes, routineRes] = await Promise.all([
        api.get('/auth/me'),
        api.get('/orders/my-orders'),
        api.get('/profile/wishlist'),
        api.get('/profile/addresses'),
        api.get('/profile/stats'),
        api.get('/quiz/routine')
      ]);
      
      setUserData(userRes.data);
      setOrders(ordersRes.data || []);
      setWishlist(wishlistRes.data || []);
      setAddresses(addressesRes.data || []);
      setStats(statsRes.data);
      setRoutine(routineRes.data);
      
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Handle authentication and loading after all hooks
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" />;
  }
  
  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading your dashboard...</div>;
  }

  const cu = userData || user;
  const spent = stats.totalSpent || 0;
  const currentTier = Object.values(TIERS).find(t => spent >= t.min && spent <= t.max) || TIERS.bronze;
  const nextTier = Object.values(TIERS).find(t => t.min > spent);
  const progressToNext = nextTier ? ((spent - currentTier.min) / (nextTier.min - currentTier.min)) * 100 : 100;
  const points = cu.glowPoints || 0;

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'routine', label: 'My Routine', icon: Sun, badge: 0 },
    { id: 'orders', label: 'Orders', icon: Package, badge: orders.length },
    { id: 'track', label: 'Track Order', icon: Truck },
    { id: 'wishlist', label: 'Wishlist', icon: Heart, badge: wishlist.length },
    { id: 'addresses', label: 'Addresses', icon: MapPin, badge: addresses.length },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'rewards', label: 'Rewards', icon: Award },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'cards', label: 'Saved Cards', icon: CreditCard, badge: userData?.savedCards?.length || 0 },
  ];

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    alert(`${product.name} added to cart!`);
  };

  const removeFromWishlist = async (productId) => {
    try {
      await api.delete(`/profile/wishlist/${productId}`);
      setWishlist(prev => prev.filter(p => p._id !== productId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const saveAddress = async () => {
    try {
      if (editingAddress) {
        await api.put(`/profile/addresses/${editingAddress._id}`, addressForm);
      } else {
        await api.post('/profile/addresses', addressForm);
      }
      setShowAddressForm(false);
      setEditingAddress(null);
      setAddressForm({ name: '', street: '', city: '', state: '', zipCode: '', phone: '', label: 'Home', isDefault: false, landmark: '' });
      fetchDashboardData();
    } catch (error) {
      alert('Failed to save address');
    }
  };

  const deleteAddress = async (addressId) => {
    if (window.confirm('Delete this address?')) {
      await api.delete(`/profile/addresses/${addressId}`);
      fetchDashboardData();
    }
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const openReviewModal = (item, orderId) => {
    const productDetails = {
      _id: item.product?._id || item.product || item._id,
      name: item.name,
      price: item.price,
      images: item.product?.images || item.images || [],
      orderId: orderId
    };
    setReviewProduct(productDetails);
    setShowReviewModal(true);
  };

  const submitReview = async () => {
    if (!reviewForm.comment.trim()) {
      alert('Please write a review');
      return;
    }
    
    setSubmittingReview(true);
    try {
      await api.post('/reviews', {
        productId: reviewProduct._id,
        orderId: reviewProduct.orderId,
        rating: reviewForm.rating,
        title: reviewForm.title,
        comment: reviewForm.comment
      });
      
      alert('Review submitted! +25 GlowPoints added!');
      setShowReviewModal(false);
      setReviewForm({ rating: 5, title: '', comment: '' });
      fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleQuickTrack = () => {
    const orderNum = document.getElementById('quickTrackInput')?.value;
    if (orderNum) {
      window.location.href = `/track?order=${orderNum}`;
    }
  };

  const handleTrackSearch = () => {
    const trackInput = document.getElementById('trackOrderNumber');
    const orderNumber = trackInput?.value;
    if (!orderNumber) {
      alert('Please enter an order number');
      return;
    }
    
    const foundOrder = orders.find(o => 
      o.orderNumber?.toLowerCase().includes(orderNumber.toLowerCase()) ||
      o._id.includes(orderNumber)
    );
    
    const resultDiv = document.getElementById('trackResult');
    if (foundOrder) {
      resultDiv.innerHTML = `
        <div class="p-4 bg-green-50 rounded-lg border border-green-200">
          <p class="font-semibold text-green-800">Order Found!</p>
          <p class="text-sm text-gray-600 mt-1">Order #${foundOrder.orderNumber}</p>
          <p class="text-sm mt-2">Status: <span class="font-semibold">${ORDER_STATUS[foundOrder.status]?.label}</span></p>
          <button onclick="window.location.href='/track?order=${foundOrder.orderNumber}'" 
            class="mt-3 bg-maroon text-white px-4 py-1 rounded text-sm">
            View Full Tracking
          </button>
        </div>
      `;
    } else {
      resultDiv.innerHTML = `
        <div class="p-4 bg-red-50 rounded-lg border border-red-200">
          <p class="font-semibold text-red-800">Order Not Found</p>
          <p class="text-sm text-gray-600 mt-1">Please check your order number and try again</p>
          <a href="/track" class="inline-block mt-3 text-maroon text-sm">Go to Track Page →</a>
        </div>
      `;
    }
  };

  const handleProfileUpdate = async () => {
    const name = document.getElementById('profileName')?.value;
    const phone = document.getElementById('profilePhone')?.value;
    const newsletter = document.getElementById('newsletter')?.checked;
    try {
      await api.put('/auth/profile', { name, phone, preferences: { newsletter } });
      alert('Profile updated!');
      fetchDashboardData();
    } catch (error) {
      alert('Failed to update profile');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-72 bg-white shadow-lg fixed h-full overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-maroon/10 rounded-full flex items-center justify-center">
              <User size={24} className="text-maroon" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">{cu.name}</h2>
              <p className="text-xs text-gray-500">{cu.email}</p>
            </div>
          </div>
          <div className="bg-cream rounded-lg p-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Glow Points</span>
              <span className="font-bold text-maroon">{points}</span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-maroon rounded-full" style={{ width: `${progressToNext}%` }} />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {nextTier ? `${Math.round(progressToNext)}% to ${nextTier.name}` : 'Top Tier!'}
            </p>
          </div>
        </div>

        <nav className="p-4">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg mb-1 transition ${
                activeSection === item.id
                  ? 'bg-maroon text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              {item.badge > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  activeSection === item.id
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
          
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mt-4 text-red-600 hover:bg-red-50 transition"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 min-h-screen">
        <div className="p-8 pb-16">
          
          {/* Quick Track Card - Dashboard Overview */}
          {activeSection === 'overview' && (
            <div className="bg-gradient-to-r from-maroon to-maroon/80 rounded-xl p-5 text-white mb-8">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Truck size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Track Your Order</h3>
                    <p className="text-sm text-white/80">Enter your order number to track delivery status</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    placeholder="Order number"
                    className="px-4 py-2 rounded-lg text-gray-800 text-sm w-48"
                    id="quickTrackInput"
                  />
                  <button 
                    onClick={handleQuickTrack}
                    className="bg-white text-maroon px-5 py-2 rounded-lg font-medium text-sm hover:bg-gray-100 transition"
                  >
                    Track
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Dashboard Overview */}
          {activeSection === 'overview' && (
            <>
              <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-maroon/10 rounded-full flex items-center justify-center">
                      <ShoppingBag size={20} className="text-maroon" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.totalOrders || 0}</p>
                      <p className="text-sm text-gray-500">Total Orders</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Wallet size={20} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">₹{spent.toLocaleString('en-IN')}</p>
                      <p className="text-sm text-gray-500">Total Spent</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Heart size={20} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{wishlist.length}</p>
                      <p className="text-sm text-gray-500">Wishlist Items</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Truck size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{orders.filter(o => o.status === 'delivered').length}</p>
                      <p className="text-sm text-gray-500">Delivered</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`${currentTier.bg} rounded-xl p-6 mb-8`}>
                <div className="flex justify-between items-start flex-wrap gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{currentTier.name} Member</h2>
                    <p className="text-sm text-gray-600 mt-1">You've spent ₹{spent.toLocaleString('en-IN')}</p>
                    {nextTier && (
                      <p className="text-xs text-gray-500 mt-2">
                        ₹{(nextTier.min - spent).toLocaleString('en-IN')} more to reach {nextTier.name}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-gray-800">{points}</p>
                    <p className="text-sm text-gray-500">GlowPoints</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-5">
                <h3 className="font-semibold text-gray-800 mb-4">Recent Orders</h3>
                {orders.slice(0, 3).length === 0 ? (
                  <div className="text-center py-8">
                    <Package size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">No orders yet</p>
                    <Link to="/products" className="text-maroon text-sm mt-2 inline-block">Start Shopping →</Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 3).map(order => (
                      <div key={order._id} className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition" onClick={() => openOrderDetails(order)}>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">Order #{order.orderNumber?.slice(-8)}</p>
                            <p className="text-sm text-gray-500">{new Date(order.orderDate).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-maroon">₹{(order.grandTotal || 0).toFixed(2)}</p>
                            <span className={`text-xs px-2 py-1 rounded-full ${ORDER_STATUS[order.status]?.bg} ${ORDER_STATUS[order.status]?.color}`}>
                              {ORDER_STATUS[order.status]?.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Track Order Section */}
          {activeSection === 'track' && (
            <div className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Track Your Order</h1>
                <Link to="/track" className="bg-maroon text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                  <Truck size={16} /> Go to Track Page
                </Link>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-5">
                  <h3 className="font-semibold text-gray-800 mb-3">Track by Order Number</h3>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      id="trackOrderNumber"
                      placeholder="Enter order number (e.g., ORD-12345)"
                      className="flex-1 border rounded-lg p-2 text-sm"
                    />
                    <button 
                      onClick={handleTrackSearch}
                      className="bg-maroon text-white px-4 py-2 rounded-lg text-sm hover:bg-maroon-light transition"
                    >
                      Track
                    </button>
                  </div>
                  <div id="trackResult" className="mt-4"></div>
                </div>

                <div className="border rounded-lg p-5">
                  <h3 className="font-semibold text-gray-800 mb-3">Recent Orders</h3>
                  {orders.slice(0, 3).length === 0 ? (
                    <p className="text-gray-500 text-sm">No orders to track</p>
                  ) : (
                    <div className="space-y-3">
                      {orders.slice(0, 3).map(order => (
                        <div 
                          key={order._id} 
                          className="flex justify-between items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition"
                          onClick={() => {
                            window.location.href = `/track?order=${order.orderNumber}`;
                          }}
                        >
                          <div>
                            <p className="font-medium text-sm">Order #{order.orderNumber?.slice(-8)}</p>
                            <p className="text-xs text-gray-500">{new Date(order.orderDate).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <span className={`text-xs px-2 py-1 rounded-full ${ORDER_STATUS[order.status]?.bg} ${ORDER_STATUS[order.status]?.color}`}>
                              {ORDER_STATUS[order.status]?.label}
                            </span>
                            <ChevronRight size={16} className="text-gray-400 ml-2 inline" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Info size={16} className="text-blue-600" />
                  <p className="text-sm font-medium text-blue-800">Need help tracking your order?</p>
                </div>
                <p className="text-sm text-blue-700">
                  You can also track your order by visiting the full 
                  <Link to="/track" className="font-bold underline mx-1">Track Order Page</Link>
                  or contact our support team at support@dermaflow.com
                </p>
              </div>
            </div>
          )}

          {/* Routine Section */}
          {activeSection === 'routine' && (
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-6">My Skincare Routine</h1>
              <p className="text-gray-500 mb-6">Your personalized AM and PM routine based on your skin quiz results</p>
              
              <div className="grid lg:grid-cols-2 gap-6">
                {/* AM Routine */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-50 to-white p-5 border-b">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                        <Sun size={20} className="text-amber-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-800">Morning Routine</h2>
                        <p className="text-sm text-gray-500">Start your day with these products</p>
                      </div>
                      <span className="ml-auto px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">AM</span>
                    </div>
                  </div>
                  <div className="p-5">
                    {routine.amRoutine?.length === 0 ? (
                      <div className="text-center py-8">
                        <Sun size={40} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">No products in your AM routine yet</p>
                        <Link to="/quiz" className="text-maroon text-sm mt-2 inline-block hover:underline">Take the Skin Quiz →</Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {routine.amRoutine?.map((product, idx) => (
                          <div key={product._id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:shadow-md transition group">
                            <div className="w-8 h-8 bg-maroon rounded-full flex items-center justify-center text-white font-bold text-sm">{idx + 1}</div>
                            <div className="flex-1">
                              <Link to={`/product/${product._id}`} className="font-medium text-gray-800 hover:text-maroon transition">{product.name}</Link>
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{product.description?.substring(0, 80)}</p>
                            </div>
                            <Link to={`/product/${product._id}`} className="text-maroon text-sm font-medium opacity-0 group-hover:opacity-100 transition">View →</Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* PM Routine */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-50 to-white p-5 border-b">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <Moon size={20} className="text-indigo-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-800">Evening Routine</h2>
                        <p className="text-sm text-gray-500">Wind down with these products</p>
                      </div>
                      <span className="ml-auto px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium">PM</span>
                    </div>
                  </div>
                  <div className="p-5">
                    {routine.pmRoutine?.length === 0 ? (
                      <div className="text-center py-8">
                        <Moon size={40} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">No products in your PM routine yet</p>
                        <Link to="/quiz" className="text-maroon text-sm mt-2 inline-block hover:underline">Take the Skin Quiz →</Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {routine.pmRoutine?.map((product, idx) => (
                          <div key={product._id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:shadow-md transition group">
                            <div className="w-8 h-8 bg-maroon rounded-full flex items-center justify-center text-white font-bold text-sm">{idx + 1}</div>
                            <div className="flex-1">
                              <Link to={`/product/${product._id}`} className="font-medium text-gray-800 hover:text-maroon transition">{product.name}</Link>
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{product.description?.substring(0, 80)}</p>
                            </div>
                            <Link to={`/product/${product._id}`} className="text-maroon text-sm font-medium opacity-0 group-hover:opacity-100 transition">View →</Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {routine.skinType && (
                <div className="mt-6 bg-white rounded-xl shadow-sm p-5">
                  <h3 className="font-semibold text-gray-800 mb-3">Your Skin Profile</h3>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Skin Type:</span>
                      <span className="px-2 py-1 bg-maroon/10 text-maroon rounded-full text-xs font-medium capitalize">{routine.skinType}</span>
                    </div>
                    {routine.concerns?.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Concerns:</span>
                        <div className="flex gap-1 flex-wrap">
                          {routine.concerns.slice(0, 3).map(concern => (
                            <span key={concern} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs capitalize">
                              {concern.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                          ))}
                          {routine.concerns.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">+{routine.concerns.length - 3}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <Link to="/quiz" className="inline-flex items-center gap-1 text-maroon text-sm mt-4 hover:underline">
                    Retake Quiz <ChevronRight size={14} />
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Orders Section */}
          {activeSection === 'orders' && (
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h1 className="text-2xl font-bold text-gray-800 mb-6">My Orders</h1>
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">No orders yet</p>
                  <Link to="/products" className="text-maroon mt-2 inline-block">Start Shopping →</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order._id} className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition" onClick={() => openOrderDetails(order)}>
                      <div className="flex justify-between items-start flex-wrap gap-3">
                        <div>
                          <p className="font-medium">Order #{order.orderNumber}</p>
                          <p className="text-sm text-gray-500 mt-1">{new Date(order.orderDate).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-maroon">₹{(order.grandTotal || 0).toFixed(2)}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${ORDER_STATUS[order.status]?.bg} ${ORDER_STATUS[order.status]?.color}`}>
                            {ORDER_STATUS[order.status]?.label}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 text-sm text-gray-500">
                        {order.items?.slice(0, 2).map(i => i.name).join(', ')}
                        {order.items?.length > 2 && ` + ${order.items.length - 2} more`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Wishlist Section */}
          {activeSection === 'wishlist' && (
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h1 className="text-2xl font-bold text-gray-800 mb-6">My Wishlist</h1>
              {wishlist.length === 0 ? (
                <div className="text-center py-12">
                  <Heart size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">Your wishlist is empty</p>
                  <Link to="/products" className="text-maroon mt-2 inline-block">Explore Products →</Link>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {wishlist.map(product => (
                    <div key={product._id} className="border rounded-lg p-3 hover:shadow-md transition">
                      <img src={product.images?.[0] || '/api/placeholder/120/120'} className="w-full h-32 object-cover rounded mb-3" alt={product.name} />
                      <h4 className="font-medium text-gray-800 line-clamp-1">{product.name}</h4>
                      <p className="text-maroon font-bold mt-1">₹{(product.price || 0).toFixed(2)}</p>
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => handleAddToCart(product)} className="flex-1 bg-maroon text-white text-sm py-1.5 rounded hover:bg-maroon-light transition">
                          Add to Cart
                        </button>
                        <button onClick={() => removeFromWishlist(product._id)} className="p-1.5 border rounded hover:bg-gray-50 transition">
                          <Trash2 size={16} className="text-gray-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Addresses Section */}
          {activeSection === 'addresses' && (
            <div className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">My Addresses</h1>
                <button onClick={() => setShowAddressForm(true)} className="bg-maroon text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                  <Plus size={16} /> Add Address
                </button>
              </div>

              {addresses.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No saved addresses</p>
              ) : (
                <div className="space-y-3">
                  {addresses.map(addr => (
                    <div key={addr._id} className={`border rounded-lg p-4 ${addr.isDefault ? 'border-maroon/30 bg-maroon/5' : ''}`}>
                      <div className="flex justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {addr.label === 'Work' ? <Briefcase size={14} /> : <Home size={14} />}
                            <span className="font-medium">{addr.label}</span>
                            {addr.isDefault && <span className="text-xs bg-maroon/20 text-maroon px-2 py-0.5 rounded ml-2">Default</span>}
                          </div>
                          <p className="font-medium">{addr.name}</p>
                          <p className="text-sm text-gray-600">{addr.street}, {addr.city}</p>
                          <p className="text-sm text-gray-600">{addr.state} - {addr.zipCode}</p>
                          <p className="text-sm text-gray-500 mt-1">{addr.phone}</p>
                          {addr.landmark && <p className="text-sm text-gray-500">Landmark: {addr.landmark}</p>}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => { setEditingAddress(addr); setAddressForm(addr); setShowAddressForm(true); }} className="text-blue-500 hover:text-blue-700">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => deleteAddress(addr._id)} className="text-red-500 hover:text-red-700">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Profile Section */}
          {activeSection === 'profile' && (
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h1 className="text-2xl font-bold text-gray-800 mb-6">Profile Information</h1>
              <div className="max-w-md space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" id="profileName" defaultValue={cu.name} className="w-full border rounded-lg p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" defaultValue={cu.email} disabled className="w-full border rounded-lg p-2 bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input type="tel" id="profilePhone" defaultValue={cu.phone || ''} className="w-full border rounded-lg p-2" />
                </div>
                <div className="flex gap-2">
                  <input type="checkbox" id="newsletter" defaultChecked={cu.preferences?.newsletter} />
                  <label htmlFor="newsletter" className="text-sm text-gray-600">Subscribe to email updates and offers</label>
                </div>
                <button onClick={handleProfileUpdate} className="bg-maroon text-white px-6 py-2 rounded-lg hover:bg-maroon-light transition">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Rewards Section */}
          {activeSection === 'rewards' && (
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h1 className="text-2xl font-bold text-gray-800 mb-6">Rewards & Benefits</h1>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { pts: 100, reward: '₹10 off', desc: 'Get ₹10 discount on next order' },
                  { pts: 250, reward: 'Free Shipping', desc: 'Free shipping on any order' },
                  { pts: 500, reward: '₹50 off', desc: '₹50 discount on any order' },
                  { pts: 1000, reward: '₹150 off + Gift', desc: '₹150 off plus free gift' }
                ].map(r => (
                  <div key={r.pts} className={`border rounded-lg p-4 ${points >= r.pts ? 'bg-green-50 border-green-200' : ''}`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{r.reward}</p>
                        <p className="text-sm text-gray-500">{r.desc}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-maroon">{r.pts} pts</p>
                        {points >= r.pts ? (
                          <span className="text-xs text-green-600">Available</span>
                        ) : (
                          <span className="text-xs text-gray-500">{points}/{r.pts}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings Section */}
          {activeSection === 'settings' && (
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-gray-500">Receive order updates and offers</p>
                  </div>
                  <button className="bg-maroon text-white px-4 py-1 rounded-lg text-sm">Configure</button>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Privacy Settings</p>
                    <p className="text-sm text-gray-500">Manage your data preferences</p>
                  </div>
                  <button className="bg-maroon text-white px-4 py-1 rounded-lg text-sm">Configure</button>
                </div>
              </div>
            </div>
          )}

          {/* Saved Cards Section */}
          {activeSection === 'cards' && (
            <div className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Saved Cards</h1>
                <button className="bg-maroon text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                  <Plus size={16} /> Add New Card
                </button>
              </div>

              {!userData?.savedCards || userData.savedCards.length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">No saved cards yet</p>
                  <p className="text-sm text-gray-400 mt-1">Add a card for faster checkout</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {userData.savedCards.map((card, idx) => (
                    <div key={idx} className={`border rounded-lg p-4 ${card.isDefault ? 'border-maroon/30 bg-maroon/5' : ''}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-8 bg-gray-800 rounded flex items-center justify-center text-white text-xs font-bold">
                            {card.cardType === 'Visa' ? 'VISA' : card.cardType === 'Mastercard' ? 'MC' : '卡'}
                          </div>
                          <div>
                            <p className="font-medium">•••• •••• •••• {card.last4}</p>
                            <p className="text-sm text-gray-500">Expires {card.expiryMonth}/{card.expiryYear}</p>
                          </div>
                        </div>
                        {card.isDefault && (
                          <span className="text-xs bg-maroon/20 text-maroon px-2 py-0.5 rounded">Default</span>
                        )}
                      </div>
                      <div className="flex gap-3 mt-3">
                        <button className="text-sm text-maroon hover:underline">Edit</button>
                        <button className="text-sm text-red-500 hover:underline">Remove</button>
                        {!card.isDefault && (
                          <button className="text-sm text-gray-500 hover:underline">Set as Default</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Address Form Modal */}
      {showAddressForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
              <button onClick={() => { setShowAddressForm(false); setEditingAddress(null); }} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            
            <LocationDetector 
              onAddressFetched={(address) => {
                setAddressForm({
                  ...addressForm,
                  street: address.street || addressForm.street,
                  city: address.city || addressForm.city,
                  state: address.state || addressForm.state,
                  zipCode: address.zipCode || addressForm.zipCode
                });
              }}
              buttonText="Use My Current Location"
            />
            
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
              <div className="relative flex justify-center text-xs"><span className="bg-white px-2 text-gray-500">Or enter manually</span></div>
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Full Name" className="border rounded-lg p-2 text-sm" value={addressForm.name} onChange={e => setAddressForm({...addressForm, name: e.target.value})} />
                <input type="tel" placeholder="Phone" className="border rounded-lg p-2 text-sm" value={addressForm.phone} onChange={e => setAddressForm({...addressForm, phone: e.target.value})} />
              </div>
              <input type="text" placeholder="Street Address" className="border rounded-lg p-2 text-sm" value={addressForm.street} onChange={e => setAddressForm({...addressForm, street: e.target.value})} />
              <input type="text" placeholder="Landmark (Optional)" className="border rounded-lg p-2 text-sm" value={addressForm.landmark} onChange={e => setAddressForm({...addressForm, landmark: e.target.value})} />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="City" className="border rounded-lg p-2 text-sm" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} />
                <select className="border rounded-lg p-2 text-sm" value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})}>
                  <option value="">Select State</option>
                  {["Maharashtra","Delhi","Karnataka","Tamil Nadu","Telangana","West Bengal","Gujarat","Rajasthan","Uttar Pradesh","Punjab","Haryana","Kerala"].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="ZIP Code" className="border rounded-lg p-2 text-sm" value={addressForm.zipCode} onChange={e => setAddressForm({...addressForm, zipCode: e.target.value})} />
                <select className="border rounded-lg p-2 text-sm" value={addressForm.label} onChange={e => setAddressForm({...addressForm, label: e.target.value})}>
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={addressForm.isDefault} onChange={e => setAddressForm({...addressForm, isDefault: e.target.checked})} />
                <span className="text-sm">Set as default address</span>
              </label>
              <button onClick={saveAddress} className="w-full bg-maroon text-white py-2 rounded-lg mt-2">Save Address</button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h3 className="font-semibold text-lg">Order Details</h3>
              <button onClick={() => setShowOrderModal(false)} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <p className="text-sm text-gray-500">Order #{selectedOrder.orderNumber}</p>
                <p className="text-sm text-gray-500">Placed on {new Date(selectedOrder.orderDate).toLocaleDateString()}</p>
              </div>
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex gap-4 border-b pb-3">
                      <Link to={item.product?._id ? `/product/${item.product._id}` : '#'} className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                        <img src={item.product?.images?.[0] || '/api/placeholder/60/60'} className="w-full h-full object-cover" alt={item.name} />
                      </Link>
                      <div className="flex-1">
                        <Link to={item.product?._id ? `/product/${item.product._id}` : '#'} className="font-medium hover:text-maroon">
                          {item.name}
                        </Link>
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                        <p className="text-sm text-gray-500">Price: ₹{item.price.toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₹{(item.price * item.quantity).toFixed(2)}</p>
                        {selectedOrder.status === 'delivered' && (
                          <button onClick={() => openReviewModal(item, selectedOrder._id)} className="text-maroon text-sm hover:underline mt-1">
                            Write a Review
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between"><span>Subtotal</span><span>₹{(selectedOrder.totalAmount || 0).toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Tax (18% GST)</span><span>₹{(selectedOrder.taxAmount || 0).toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Shipping</span><span>{selectedOrder.shippingAmount === 0 ? 'Free' : `₹${(selectedOrder.shippingAmount || 0).toFixed(2)}`}</span></div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total</span><span className="text-maroon">₹{(selectedOrder.grandTotal || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button onClick={() => window.print()} className="flex-1 border border-gray-300 py-2 rounded-lg">Print Order</button>
                <Link to={`/invoice/${selectedOrder._id}`} className="flex-1 bg-maroon text-white py-2 rounded-lg text-center">Download Invoice</Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && reviewProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Review Product</h3>
              <button onClick={() => setShowReviewModal(false)} className="text-gray-500"><X size={20} /></button>
            </div>
            <div className="mb-4">
              <p className="font-medium">{reviewProduct.name}</p>
              <div className="flex gap-1 mt-2">
                {[1,2,3,4,5].map(star => (
                  <button key={star} onClick={() => setReviewForm({ ...reviewForm, rating: star })}>
                    <Star size={24} className={star <= reviewForm.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
                  </button>
                ))}
              </div>
            </div>
            <input type="text" placeholder="Review title" className="w-full border rounded-lg p-2 mb-3" value={reviewForm.title} onChange={e => setReviewForm({...reviewForm, title: e.target.value})} />
            <textarea rows="4" placeholder="Write your review..." className="w-full border rounded-lg p-2 mb-4" value={reviewForm.comment} onChange={e => setReviewForm({...reviewForm, comment: e.target.value})} />
            <button onClick={submitReview} disabled={submittingReview} className="w-full bg-maroon text-white py-2 rounded-lg">
              {submittingReview ? 'Submitting...' : 'Submit Review (+25 GlowPoints)'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}