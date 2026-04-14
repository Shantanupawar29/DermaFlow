import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  User, ShoppingBag, Heart, MapPin, Settings, Star, 
  Package, Truck, CheckCircle, Clock, AlertCircle,
  Plus, Edit2, Trash2, LogOut, Sparkles, Gift,
  ChevronRight, Award, Copy, X, Home,
  Phone, Mail, Map, RefreshCw, TrendingUp, LayoutDashboard,
  History, Wallet, Bell, Shield, HelpCircle, Sun, Moon, CreditCard,
  Info, Menu, Calendar, Tag, Percent, Crown, Gem, Calendar as CalendarIcon,
  Repeat, Pause, Play
} from 'lucide-react';
import { Briefcase } from 'lucide-react';
import LocationDetector from '../components/LocationDetector';
import api from '../services/api';
import { Search } from 'lucide-react';
import DermaLoader from '../components/Loader';
import { useLoading } from '../context/LoadingContext';

// Add the M constant here - this fixes the error
const M = '#4A0E2E';

const ORDER_STATUS = {
  pending: { label: 'Pending', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  confirmed: { label: 'Confirmed', icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
  shipped: { label: 'Shipped', icon: Truck, color: 'text-purple-600', bg: 'bg-purple-50' },
  delivered: { label: 'Delivered', icon: Package, color: 'text-green-600', bg: 'bg-green-50' },
  cancelled: { label: 'Cancelled', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' }
};

const TIERS = {
  bronze: { name: 'Bronze', min: 0, max: 4999, color: '#cd7f32', bg: '#fef3c7', icon: Award },
  silver: { name: 'Silver', min: 5000, max: 19999, color: '#94a3b8', bg: '#f1f5f9', icon: Shield },
  gold: { name: 'Gold', min: 20000, max: 49999, color: '#d4af37', bg: '#fefce8', icon: Crown },
  platinum: { name: 'Platinum', min: 50000, max: Infinity, color: '#7c3aed', bg: '#ede9fe', icon: Gem }
};

const REWARD_TIERS = [
  { pts: 100, reward: '10 Off', discount: 10, desc: 'Get 10 discount on next order', icon: Tag },
  { pts: 250, reward: 'Free Shipping', discount: 0, desc: 'Free shipping on any order', icon: Truck },
  { pts: 500, reward: '50 Off', discount: 50, desc: '50 discount on any order', icon: Percent },
  { pts: 1000, reward: '150 Off + Gift', discount: 150, desc: '150 off plus free gift', icon: Gift }
];

const INDIAN_STATES = [
  "Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Telangana", 
  "West Bengal", "Gujarat", "Rajasthan", "Uttar Pradesh", "Punjab", 
  "Haryana", "Kerala", "Madhya Pradesh", "Bihar", "Odisha"
];

const PLAN_INFO = {
  monthly:   { label: 'Monthly',   freq: 'Every 30 days',  disc: 10, color: '#1d4ed8', bg: '#eff6ff', icon: CalendarIcon },
  quarterly: { label: 'Quarterly', freq: 'Every 90 days',  disc: 15, color: '#16a34a', bg: '#f0fdf4', icon: Repeat },
  biannual:  { label: 'Biannual',  freq: 'Every 180 days', disc: 20, color: M,          bg: `${M}18`,  icon: Clock },
};
// Add this state near other useState declarations (around line 50)

export default function Dashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const { addToCart } = useCart();
  const { showLoading, hideLoading } = useLoading();
  
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [stats, setStats] = useState({});
  const [routine, setRoutine] = useState({ amRoutine: [], pmRoutine: [], skinType: null, concerns: [] });
  const [savedCards, setSavedCards] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    name: '', street: '', city: '', state: '', zipCode: '', 
    phone: '', label: 'Home', isDefault: false, landmark: ''
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewProduct, setReviewProduct] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  
  const [pointsToRedeem, setPointsToRedeem] = useState(100);
  const [redeemMsg, setRedeemMsg] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [redeemSuccess, setRedeemSuccess] = useState(false);
const [showAddCardModal, setShowAddCardModal] = useState(false);
const [cardForm, setCardForm] = useState({
  cardNumber: '',
  cardHolder: '',
  expiryMonth: '',
  expiryYear: '',
  cvv: '',
  isDefault: false
});

// Add this function to handle adding a card
const handleAddCard = async () => {
  if (!cardForm.cardNumber || cardForm.cardNumber.length < 15) {
    alert('Please enter a valid card number');
    return;
  }
  
  const last4 = cardForm.cardNumber.slice(-4);
  let cardType = 'Visa';
  if (cardForm.cardNumber.startsWith('5')) cardType = 'Mastercard';
  else if (cardForm.cardNumber.startsWith('6')) cardType = 'RuPay';
  else if (cardForm.cardNumber.startsWith('3')) cardType = 'Amex';
  
  try {
    await api.post('/profile/cards', {
      last4,
      cardType,
      expiryMonth: parseInt(cardForm.expiryMonth),
      expiryYear: parseInt(cardForm.expiryYear),
      isDefault: cardForm.isDefault
    });
    
    setShowAddCardModal(false);
    setCardForm({ cardNumber: '', cardHolder: '', expiryMonth: '', expiryYear: '', cvv: '', isDefault: false });
    fetchDashboardData();
    alert('Card added successfully!');
  } catch (error) {
    alert('Failed to add card');
  }
};
  const fetchDashboardData = async () => {
    try {
      showLoading('Loading your dashboard...');
      
      const [userResult, ordersResult, wishlistResult, addressesResult, statsResult, routineResult, cardsResult, subsResult] = 
        await Promise.allSettled([
          api.get('/auth/me'),
          api.get('/orders/my-orders'),
          api.get('/profile/wishlist'),
          api.get('/profile/addresses'),
          api.get('/profile/stats'),
          api.get('/quiz/routine'),
          api.get('/profile/cards'),
          api.get('/subscriptions/mine')
        ]);
      
      setUserData(userResult.status === 'fulfilled' ? userResult.value.data : user);
      setOrders(ordersResult.status === 'fulfilled' ? ordersResult.value.data || [] : []);
      setWishlist(wishlistResult.status === 'fulfilled' ? wishlistResult.value.data || [] : []);
      setAddresses(addressesResult.status === 'fulfilled' ? addressesResult.value.data || [] : []);
      setStats(statsResult.status === 'fulfilled' ? statsResult.value.data || {} : {});
      setRoutine(routineResult.status === 'fulfilled' ? routineResult.value.data || { amRoutine: [], pmRoutine: [], skinType: null, concerns: [] } : { amRoutine: [], pmRoutine: [], skinType: null, concerns: [] });
      setSavedCards(cardsResult.status === 'fulfilled' ? cardsResult.value.data || [] : []);
      setSubscriptions(subsResult.status === 'fulfilled' ? subsResult.value.data || [] : []);
      
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      setUserData(user);
      setOrders([]);
      setWishlist([]);
      setAddresses([]);
      setStats({});
      setRoutine({ amRoutine: [], pmRoutine: [], skinType: null, concerns: [] });
      setSavedCards([]);
      setSubscriptions([]);
    } finally {
      setLoading(false);
      hideLoading();
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const handlePauseSubscription = async (subId) => {
    setActionLoading(subId);
    try {
      await api.put(`/subscriptions/${subId}/pause`);
      await fetchDashboardData();
    } catch (e) { alert('Failed to update subscription'); }
    setActionLoading('');
  };

  const handleResumeSubscription = async (subId) => {
    setActionLoading(subId);
    try {
      await api.put(`/subscriptions/${subId}/resume`);
      await fetchDashboardData();
    } catch (e) { alert('Failed to resume subscription'); }
    setActionLoading('');
  };

  const handleCancelSubscription = async (subId) => {
    if (!window.confirm('Cancel this subscription?')) return;
    setActionLoading(subId);
    try {
      await api.put(`/subscriptions/${subId}/cancel`, { reason: 'User cancelled' });
      await fetchDashboardData();
    } catch (e) { alert('Failed to cancel'); }
    setActionLoading('');
  };

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" />;
  }
  
  if (loading) {
    return <DermaLoader message="Loading your dashboard" />;
  }

  const cu = userData || user;
  const spent = stats.totalSpent || 0;
  const currentTier = Object.values(TIERS).find(t => spent >= t.min && spent <= t.max) || TIERS.bronze;
  const nextTier = Object.values(TIERS).find(t => t.min > spent);
  const progressToNext = nextTier ? ((spent - currentTier.min) / (nextTier.min - currentTier.min)) * 100 : 100;
  const points = cu.glowPoints || 0;
  const TierIcon = currentTier.icon;

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'subscriptions', label: 'Subscriptions', icon: Repeat, badge: subscriptions.filter(s => s.status === 'active').length },
    { id: 'routine', label: 'My Routine', icon: Sun },
    { id: 'orders', label: 'Orders', icon: Package, badge: orders.length },
    { id: 'track', label: 'Track Order', icon: Truck },
    { id: 'wishlist', label: 'Wishlist', icon: Heart, badge: wishlist.length },
    { id: 'addresses', label: 'Addresses', icon: MapPin, badge: addresses.length },
    { id: 'rewards', label: 'Rewards', icon: Award },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'cards', label: 'Saved Cards', icon: CreditCard, badge: savedCards.length },
    { id: 'settings', label: 'Settings', icon: Settings },
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
      setAddressForm({ 
        name: '', street: '', city: '', state: '', zipCode: '', 
        phone: '', label: 'Home', isDefault: false, landmark: '' 
      });
      fetchDashboardData();
    } catch (error) {
      alert('Failed to save address');
    }
  };

  const deleteAddress = async (addressId) => {
    if (window.confirm('Delete this address?')) {
      try {
        await api.delete(`/profile/addresses/${addressId}`);
        fetchDashboardData();
      } catch (error) {
        alert('Failed to delete address');
      }
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

  const handleRedeemPoints = async () => {
    if (pointsToRedeem < 100) {
      setRedeemMsg('Minimum 100 points required for redemption');
      return;
    }
    if (pointsToRedeem > points) {
      setRedeemMsg('Insufficient GlowPoints balance');
      return;
    }
    
    setRedeeming(true);
    setRedeemMsg('');
    setRedeemSuccess(false);
    
    try {
      const { data } = await api.post('/auth/redeem-points', { points: pointsToRedeem });
      setRedeemMsg(`Voucher ${data.voucherCode} created! ${data.discountRs} off applied. Remaining balance: ${data.remainingPoints} points`);
      setRedeemSuccess(true);
      fetchDashboardData();
    } catch (error) {
      setRedeemMsg(error.response?.data?.message || 'Failed to redeem points');
    } finally {
      setRedeeming(false);
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
          <p class="font-semibold text-green-800">Order Found</p>
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
          <a href="/track" class="inline-block mt-3 text-maroon text-sm">Go to Track Page</a>
        </div>
      `;
    }
  };

  const handleProfileUpdate = async () => {
    const name = document.getElementById('profileName')?.value;
    const phone = document.getElementById('profilePhone')?.value;
    const dob = document.getElementById('profileDOB')?.value;
    const newsletter = document.getElementById('newsletter')?.checked;
    
    try {
      await api.put('/auth/profile', { 
        name, 
        phone, 
        dateOfBirth: dob, 
        preferences: { newsletter } 
      });
      alert('Profile updated successfully');
      fetchDashboardData();
    } catch (error) {
      alert('Failed to update profile');
    }
  };

  const navigate = (section) => {
    setActiveSection(section);
    setSidebarOpen(false);
  };

  const Sidebar = () => (
    <aside className={`
      w-72 bg-white shadow-lg fixed h-full overflow-y-auto z-40 transition-transform duration-300
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      lg:translate-x-0
    `}>
      <div className="flex items-center justify-between px-6 py-4 border-b bg-maroon/5">
        <Link to="/" className="flex items-center gap-2 text-maroon font-medium text-sm">
          <ChevronRight size={16} className="rotate-180" />
          Back to Store
        </Link>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-600">
          <X size={18} />
        </button>
      </div>

      <div className="p-6 border-b">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-maroon/10 rounded-full flex items-center justify-center">
            <User size={24} className="text-maroon" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-gray-800 truncate">{cu.name}</h2>
            <p className="text-xs text-gray-500 truncate">{cu.email}</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-3 border">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600 flex items-center gap-1">
              <Sparkles size={12} className="text-maroon" />
              Glow Points
            </span>
            <span className="font-bold text-maroon">{points.toLocaleString()}</span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-maroon to-maroon-light rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(progressToNext, 100)}%` }} 
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {nextTier 
              ? `${Math.round(progressToNext)}% to ${nextTier.name}` 
              : 'Maximum tier achieved'
            }
          </p>
        </div>
      </div>

      <nav className="p-4">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => navigate(item.id)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg mb-1 transition-all ${
              activeSection === item.id
                ? 'bg-maroon text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
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
  );

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-hidden">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-30 lg:hidden" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      <Sidebar />

      <div className="lg:hidden fixed top-0 left-0 right-0 z-20 bg-white border-b px-4 py-3 flex items-center justify-between">
        <button onClick={() => setSidebarOpen(true)} className="text-gray-700">
          <Menu size={22} />
        </button>
        <span className="font-semibold text-maroon">Dashboard</span>
        <Link to="/" className="text-sm text-maroon font-medium flex items-center gap-1">
          <ChevronRight size={14} className="rotate-180" />
          Store
        </Link>
      </div>

      <main className="flex-1 lg:ml-72 min-h-screen pt-14 lg:pt-0 overflow-x-hidden">
        <div className="p-4 lg:p-8 pb-16">
          
          {activeSection === 'overview' && (
            <>
             <div className="bg-gradient-to-r from-maroon to-maroon-light rounded-xl p-5 text-white mb-6 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <Truck size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Track Your Order</h3>
                      <p className="text-sm text-white/80">Enter your order number to track delivery status</p>
                    </div>
                  </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <input 
                      type="text" 
                      placeholder="Order number"
                      className="px-4 py-2 rounded-lg text-gray-800 text-sm flex-1 min-w-0"
                      id="quickTrackInput"
                    />
                    <button 
                      onClick={handleQuickTrack}
                      className="bg-white text-maroon px-3 py-2 rounded-lg font-medium text-sm hover:bg-gray-100 transition flex-shrink-0"
                    >
                      Track
                    </button>
                  </div>
                </div>
              </div>

              <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { 
                    icon: ShoppingBag, 
                    bg: 'bg-maroon/10', 
                    iconColor: 'text-maroon',
                    val: stats.totalOrders || 0, 
                    label: 'Total Orders' 
                  },
                  { 
                    icon: Wallet, 
                    bg: 'bg-green-100', 
                    iconColor: 'text-green-600',
                    val: spent.toLocaleString('en-IN'), 
                    label: 'Total Spent',
                    prefix: true
                  },
                  { 
                    icon: Heart, 
                    bg: 'bg-purple-100', 
                    iconColor: 'text-purple-600',
                    val: wishlist.length, 
                    label: 'Wishlist Items' 
                  },
                  { 
                    icon: Repeat, 
                    bg: 'bg-blue-100', 
                    iconColor: 'text-blue-600',
                    val: subscriptions.filter(s => s.status === 'active').length, 
                    label: 'Active Subs' 
                  },
                ].map((stat, idx) => {
                  const IconComponent = stat.icon;
                  return (
                    <div key={idx} className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${stat.bg} rounded-full flex items-center justify-center`}>
                          <IconComponent size={20} className={stat.iconColor} />
                        </div>
                        <div>
                          <p className="text-xl font-bold text-gray-800 truncate">
                            {stat.prefix ? '₹' : ''}{stat.val}
                          </p>
                          <p className="text-xs text-gray-500">{stat.label}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div 
                className="rounded-xl p-6 mb-6 border"
                style={{ background: currentTier.bg, borderColor: currentTier.color + '40' }}
              >
                <div className="flex justify-between items-start flex-wrap gap-4">
                  <div className="flex items-start gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: currentTier.color + '20' }}
                    >
                      <TierIcon size={20} style={{ color: currentTier.color }} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">{currentTier.name} Member</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        Total spent: ₹{spent.toLocaleString('en-IN')}
                      </p>
                      {nextTier && (
                        <p className="text-xs text-gray-500 mt-2">
                          ₹{(nextTier.min - spent).toLocaleString('en-IN')} more to reach {nextTier.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-gray-800">{points.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1 justify-end">
                      <Sparkles size={12} />
                      GlowPoints
                    </p>
                    <button 
                      onClick={() => navigate('rewards')} 
                      className="mt-2 text-sm font-medium hover:underline"
                      style={{ color: currentTier.color }}
                    >
                      Redeem Points
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Subscriptions Preview */}
              {subscriptions.filter(s => s.status === 'active').length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      <Repeat size={18} className="text-maroon" />
                      Active Subscriptions
                    </h3>
                    <button 
                      onClick={() => navigate('subscriptions')} 
                      className="text-maroon text-sm hover:underline"
                    >
                      View All
                    </button>
                  </div>
                  <div className="space-y-3">
                    {subscriptions.filter(s => s.status === 'active').slice(0, 2).map(sub => {
                      const plan = PLAN_INFO[sub.plan] || PLAN_INFO.monthly;
                      const PlanIcon = plan.icon;
                      return (
                        <div key={sub._id} className="border rounded-lg p-4">
                          <div className="flex flex-col sm:flex-row gap-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              <img 
  src={sub.product?.images?.[0] || sub.productImage || '/api/placeholder/60/60'} 
  alt={sub.productName} 
  className="w-full h-full object-cover"
/>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{sub.productName}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <PlanIcon size={12} className="text-gray-500" />
                                <span className="text-xs text-gray-500">{plan.label} · {plan.disc}% off</span>
                              </div>
                              {sub.nextDelivery && (
                                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                  <CalendarIcon size={10} />
                                  Next: {new Date(sub.nextDelivery).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-maroon">
                               ₹{(sub.pricePerCycle || sub.product?.price * (1 - (sub.discountPct || 10) / 100) || 0).toFixed(2)}
                              </p>
                              <span className="text-xs text-gray-500">per cycle</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                  <h3 className="font-semibold text-gray-800">Recent Orders</h3>
                  <Link 
                    to="#" 
                    onClick={(e) => { e.preventDefault(); navigate('orders'); }}
                    className="text-maroon text-sm hover:underline"
                  >
                    View All
                  </Link>
                </div>
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">No orders yet</p>
                    <Link to="/products" className="text-maroon text-sm mt-2 inline-block hover:underline">
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 3).map(order => {
                      const StatusIcon = ORDER_STATUS[order.status]?.icon || Package;
                      return (
                        <div 
                          key={order._id} 
                          className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition"
                          onClick={() => openOrderDetails(order)}
                        >
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 flex-wrap gap-2">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 ${ORDER_STATUS[order.status]?.bg} rounded-full flex items-center justify-center`}>
                                <StatusIcon size={14} className={ORDER_STATUS[order.status]?.color} />
                              </div>
                              <div>
                                <p className="font-medium">Order #{order.orderNumber?.slice(-8)}</p>
                                <p className="text-sm text-gray-500">
                                  {new Date(order.orderDate).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-maroon">
                                ₹{(order.grandTotal || 0).toFixed(2)}
                              </p>
                              <span className={`text-xs px-2 py-1 rounded-full ${ORDER_STATUS[order.status]?.bg} ${ORDER_STATUS[order.status]?.color}`}>
                                {ORDER_STATUS[order.status]?.label}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {activeSection === 'subscriptions' && (
            <div className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
                <h1 className="text-2xl font-bold text-gray-800">My Subscriptions</h1>
                <Link 
                  to="/subscriptions" 
                  className="bg-maroon text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-maroon-light transition"
                >
                  <Repeat size={16} />
                  Manage Subscriptions
                </Link>
              </div>

              {subscriptions.length === 0 ? (
                <div className="text-center py-12">
                  <Repeat size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">No subscriptions yet</p>
                  <Link to="/subscriptions" className="text-maroon mt-2 inline-block hover:underline">
                    Browse Subscription Plans
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {subscriptions.map(sub => {
                    const plan = PLAN_INFO[sub.plan] || PLAN_INFO.monthly;
                    const PlanIcon = plan.icon;
                    const isActive = sub.status === 'active';
                    
                    return (
                      <div key={sub._id} className="border rounded-lg overflow-hidden">
                        <div className={`p-4 ${isActive ? 'bg-green-50' : 'bg-gray-50'} border-b`}>
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isActive ? 'bg-green-100' : 'bg-gray-200'}`}>
                                <PlanIcon size={14} className={isActive ? 'text-green-600' : 'text-gray-500'} />
                              </div>
                              <div>
                                <p className="font-semibold">{plan.label} Plan</p>
                                <p className="text-xs text-gray-500">{plan.freq}</p>
                              </div>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              sub.status === 'active' ? 'bg-green-100 text-green-700' :
                              sub.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {sub.status === 'active' ? 'Active' : sub.status === 'paused' ? 'Paused' : 'Cancelled'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <div className="flex flex-col sm:flex-row gap-4">
                            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              <img 
  src={sub.product?.images?.[0] || sub.productImage || '/api/placeholder/80/80'} 
  alt={sub.productName} 
  className="w-full h-full object-cover"
/>
                            </div>
                            <div className="flex-1">
                              <Link 
                                to={`/product/${sub.product?._id}`} 
                                className="font-semibold text-gray-800 hover:text-maroon transition"
                              >
                                {sub.productName}
                              </Link>
                              <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-lg font-bold text-maroon">
                                  ₹{(sub.pricePerCycle || sub.product?.price * (1 - (sub.discountPct || 10) / 100) || 0).toFixed(2)}
                                </span>
                                <span className="text-xs text-gray-500 line-through">
                                  ₹{sub.originalPrice?.toFixed(2) || 0}
                                </span>
                                <span className="text-xs text-green-600 font-medium">
                                  Save {sub.discountPct || plan.disc}%
                                </span>
                              </div>
                              {sub.nextDelivery && (
                                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                  <CalendarIcon size={12} />
                                  Next delivery: {new Date(sub.nextDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                              )}
                              <p className="text-xs text-gray-400 mt-1">
                                {sub.deliveryCount || 0} deliveries completed
                              </p>
                            </div>
                          </div>
                          
                          {sub.status !== 'cancelled' && (
                           <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t">
                              {sub.status === 'active' ? (
                                <button
                                  onClick={() => handlePauseSubscription(sub._id)}
                                  disabled={actionLoading === sub._id}
                                  className="flex items-center gap-2 px-4 py-2 border border-yellow-400 text-yellow-700 rounded-lg text-sm font-medium hover:bg-yellow-50 transition disabled:opacity-50"
                                >
                                  <Pause size={14} />
                                  Pause
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleResumeSubscription(sub._id)}
                                  disabled={actionLoading === sub._id}
                                  className="flex items-center gap-2 px-4 py-2 border border-green-500 text-green-600 rounded-lg text-sm font-medium hover:bg-green-50 transition disabled:opacity-50"
                                >
                                  <Play size={14} />
                                  Resume
                                </button>
                              )}
                              <button
                                onClick={() => handleCancelSubscription(sub._id)}
                                disabled={actionLoading === sub._id}
                                className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition disabled:opacity-50"
                              >
                                <X size={14} />
                                Cancel
                              </button>
                              <Link
                                to={`/product/${sub.product?._id}`}
                                className="flex items-center gap-2 px-4 py-2 bg-maroon text-white rounded-lg text-sm font-medium hover:bg-maroon-light transition sm:ml-auto w-full sm:w-auto justify-center"
                              >
                                <ShoppingBag size={14} />
                                Shop Now
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeSection === 'rewards' && (
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-6">Rewards & Benefits</h1>

              <div className="bg-gradient-to-br from-maroon/5 to-white rounded-xl shadow-sm p-6 mb-6 border border-maroon/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-maroon/10 rounded-full flex items-center justify-center">
                    <Sparkles size={20} className="text-maroon" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-800">Redeem Glow Points</h2>
                    <p className="text-sm text-gray-500">
                      Available balance: <span className="font-bold text-maroon">{points} points</span>
                    </p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">
                  Every 100 points = ₹10 off. Minimum 100 points required for redemption.
                </p>
                
                <div className="flex gap-3 flex-wrap items-center">
                  <select 
                    value={pointsToRedeem} 
                    onChange={e => setPointsToRedeem(Number(e.target.value))}
                    className="border rounded-lg p-2 text-sm bg-white"
                    disabled={points < 100}
                  >
                    {[100, 200, 300, 500, 1000].filter(p => p <= points).map(p => (
                      <option key={p} value={p}>{p} points → ₹{p / 10} off</option>
                    ))}
                    {points >= 100 && (
                      <option value={points}>{points} points → ₹{Math.floor(points / 10)} off</option>
                    )}
                  </select>
                  
                  <button 
                    onClick={handleRedeemPoints} 
                    disabled={redeeming || points < 100}
                    className="bg-maroon text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-maroon-light transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {redeeming ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw size={14} className="animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      'Redeem as Voucher'
                    )}
                  </button>
                </div>
                
                {redeemMsg && (
                  <div className={`mt-4 p-3 rounded-lg text-sm ${
                    redeemSuccess 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    <div className="flex items-start gap-2">
                      {redeemSuccess ? (
                        <CheckCircle size={16} className="text-green-600 mt-0.5" />
                      ) : (
                        <AlertCircle size={16} className="text-red-600 mt-0.5" />
                      )}
                      <span>{redeemMsg}</span>
                    </div>
                  </div>
                )}
                
                <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                  <Info size={12} />
                  Voucher will be available in your Offers section and can be applied at checkout.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {REWARD_TIERS.map(reward => {
                  const RewardIcon = reward.icon;
                  const isUnlocked = points >= reward.pts;
                  return (
                    <div 
                      key={reward.pts} 
                      className={`border rounded-lg p-4 transition ${
                        isUnlocked 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-white hover:shadow-md'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isUnlocked ? 'bg-green-100' : 'bg-gray-100'
                          }`}>
                            <RewardIcon size={18} className={isUnlocked ? 'text-green-600' : 'text-gray-500'} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">₹{reward.discount} Off</p>
                            {reward.reward === 'Free Shipping' && (
                              <p className="font-semibold text-gray-800">Free Shipping</p>
                            )}
                            <p className="text-sm text-gray-500">{reward.desc}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-maroon">{reward.pts}</p>
                          <p className="text-xs text-gray-500">points</p>
                          {isUnlocked ? (
                            <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium mt-1">
                              <CheckCircle size={12} />
                              Unlocked
                            </span>
                          ) : (
                            <span className="text-xs text-gray-500 mt-1 block">
                              {points}/{reward.pts}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-white rounded-xl shadow-sm p-5">
                <h3 className="font-semibold text-gray-800 mb-4">Loyalty Tier Benefits</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 pr-4 text-gray-500 text-xs font-semibold">Tier</th>
                        <th className="text-left py-3 pr-4 text-gray-500 text-xs font-semibold">Min Spend</th>
                        <th className="text-left py-3 pr-4 text-gray-500 text-xs font-semibold">Free Shipping</th>
                        <th className="text-left py-3 pr-4 text-gray-500 text-xs font-semibold">Priority Support</th>
                        <th className="text-left py-3 pr-4 text-gray-500 text-xs font-semibold">Birthday Gift</th>
                        <th className="text-left py-3 pr-4 text-gray-500 text-xs font-semibold">Exclusive Offers</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { tier: 'Bronze', min: '₹0', ship: 'On orders above ₹1000', support: false, bday: false, exclusive: false },
                        { tier: 'Silver', min: '₹5,000', ship: 'On orders above ₹499', support: false, bday: false, exclusive: false },
                        { tier: 'Gold', min: '₹20,000', ship: 'Free on all orders', support: true, bday: true, exclusive: false },
                        { tier: 'Platinum', min: '₹50,000', ship: 'Free on all orders', support: true, bday: true, exclusive: true },
                      ].map(row => {
                        const isCurrentTier = cu.loyaltyTier?.toLowerCase() === row.tier.toLowerCase();
                        return (
                          <tr key={row.tier} className={`border-b ${isCurrentTier ? 'bg-maroon/5 font-medium' : ''}`}>
                            <td className="py-3 pr-4">
                              {row.tier}
                              {isCurrentTier && (
                                <span className="ml-2 text-xs text-maroon">(Current)</span>
                              )}
                            </td>
                            <td className="py-3 pr-4 text-gray-600">{row.min}</td>
                            <td className="py-3 pr-4">{row.ship}</td>
                            <td className="py-3 pr-4">
                              {row.support ? (
                                <CheckCircle size={16} className="text-green-600" />
                              ) : (
                                <X size={16} className="text-gray-400" />
                              )}
                            </td>
                            <td className="py-3 pr-4">
                              {row.bday ? (
                                <CheckCircle size={16} className="text-green-600" />
                              ) : (
                                <X size={16} className="text-gray-400" />
                              )}
                            </td>
                            <td className="py-3 pr-4">
                              {row.exclusive ? (
                                <CheckCircle size={16} className="text-green-600" />
                              ) : (
                                <X size={16} className="text-gray-400" />
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'track' && (
            <div className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Track Your Order</h1>
                <Link to="/track" className="bg-maroon text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-maroon-light transition">
                  <Truck size={16} />
                  Full Tracking Page
                </Link>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-5">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Search size={16} className="text-gray-500" />
                    Search by Order Number
                  </h3>
               <div className="flex flex-col sm:flex-row gap-2 w-full">
  <input 
    type="text" 
    id="trackOrderNumber"
    placeholder="Enter order number"
    className="flex-1 min-w-0 border rounded-lg p-2 text-sm focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none"
  />
  <button 
    onClick={handleTrackSearch}
    className="bg-maroon text-white px-3 py-2 rounded-lg text-sm hover:bg-maroon-light transition w-full sm:w-auto"
  >
    Track
  </button>
</div>
                  <div id="trackResult" className="mt-4"></div>
                </div>

                <div className="border rounded-lg p-5">
                  <h3 className="font-semibold text-gray-800 mb-3">Recent Orders</h3>
                  {orders.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">No orders to track</p>
                  ) : (
                    <div className="space-y-2">
                      {orders.slice(0, 4).map(order => {
                        const StatusIcon = ORDER_STATUS[order.status]?.icon || Package;
                        return (
                          <div 
                            key={order._id} 
                            className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition"
                            onClick={() => window.location.href = `/track?order=${order.orderNumber}`}
                          >
                            <div className="flex items-center gap-3">
                              <StatusIcon size={14} className={ORDER_STATUS[order.status]?.color} />
                              <div>
                                <p className="font-medium text-sm">Order #{order.orderNumber?.slice(-8)}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(order.orderDate).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 sm:ml-auto">
                              <span className={`text-xs px-2 py-1 rounded-full ${ORDER_STATUS[order.status]?.bg} ${ORDER_STATUS[order.status]?.color}`}>
                                {ORDER_STATUS[order.status]?.label}
                              </span>
                              <ChevronRight size={16} className="text-gray-400" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2">
                  <Info size={16} className="text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Need help tracking your order?</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Visit the full tracking page or contact support for assistance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'routine' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">My Skincare Routine</h1>
                  <p className="text-gray-500 text-sm mt-1">
                    Personalized routine based on your skin profile
                  </p>
                </div>
                <Link 
                  to="/quiz" 
                  className="text-maroon text-sm font-medium hover:underline flex items-center gap-1"
                >
                  Retake Quiz
                  <ChevronRight size={14} />
                </Link>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-6">
                {[
                  { 
                    label: 'Morning Routine', 
                    time: 'AM', 
                    icon: Sun, 
                    bg: 'from-amber-50', 
                    iconBg: 'bg-amber-100',
                    iconColor: 'text-amber-600',
                    products: routine.amRoutine 
                  },
                  { 
                    label: 'Evening Routine', 
                    time: 'PM', 
                    icon: Moon, 
                    bg: 'from-indigo-50', 
                    iconBg: 'bg-indigo-100',
                    iconColor: 'text-indigo-600',
                    products: routine.pmRoutine 
                  },
                ].map(slot => {
                  const SlotIcon = slot.icon;
                  return (
                    <div key={slot.time} className="bg-white rounded-xl shadow-sm overflow-hidden">
                      <div className={`bg-gradient-to-r ${slot.bg} to-white p-5 border-b`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${slot.iconBg} rounded-full flex items-center justify-center`}>
                            <SlotIcon size={20} className={slot.iconColor} />
                          </div>
                          <div>
                            <h2 className="text-lg font-semibold text-gray-800">{slot.label}</h2>
                            <p className="text-sm text-gray-500">Daily skincare steps</p>
                          </div>
                          <span className="ml-auto px-3 py-1 bg-white/60 text-gray-700 text-xs rounded-full font-medium border">
                            {slot.time}
                          </span>
                        </div>
                      </div>
                      <div className="p-5">
                        {!slot.products?.length ? (
                          <div className="text-center py-8">
                            <SlotIcon size={40} className="mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-500 text-sm">No products in your {slot.time} routine yet</p>
                            <Link to="/quiz" className="text-maroon text-sm mt-2 inline-block hover:underline">
                              Take the Skin Quiz
                            </Link>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {slot.products.map((product, idx) => (
                              <div 
                                key={product._id} 
                                className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:shadow-md transition group"
                              >
                                <div className="w-8 h-8 bg-maroon rounded-full flex items-center justify-center text-white font-medium text-sm">
                                  {idx + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <Link 
                                    to={`/product/${product._id}`} 
                                    className="font-medium text-gray-800 hover:text-maroon transition text-sm block truncate"
                                  >
                                    {product.name}
                                  </Link>
                                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                                    {product.brand && `${product.brand} • `}{product.category}
                                  </p>
                                </div>
                                <Link 
                                  to={`/product/${product._id}`} 
                                  className="text-maroon text-sm font-medium opacity-0 group-hover:opacity-100 transition"
                                >
                                  View
                                </Link>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {routine.skinType && (
                <div className="mt-6 bg-white rounded-xl shadow-sm p-5">
                  <h3 className="font-semibold text-gray-800 mb-3">Your Skin Profile</h3>
                  <div className="flex flex-wrap gap-3 items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Skin Type:</span>
                      <span className="px-3 py-1 bg-maroon/10 text-maroon rounded-full text-xs font-medium capitalize">
                        {routine.skinType}
                      </span>
                    </div>
                    {routine.concerns?.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-gray-500">Concerns:</span>
                        {routine.concerns.slice(0, 4).map(concern => (
                          <span 
                            key={concern} 
                            className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs capitalize"
                          >
                            {concern.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        ))}
                        {routine.concerns.length > 4 && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                            +{routine.concerns.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSection === 'orders' && (
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h1 className="text-2xl font-bold text-gray-800 mb-6">My Orders</h1>
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">No orders yet</p>
                  <Link to="/products" className="text-maroon mt-2 inline-block hover:underline">
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => {
                    const StatusIcon = ORDER_STATUS[order.status]?.icon || Package;
                    return (
                      <div 
                        key={order._id} 
                        className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition"
                        onClick={() => openOrderDetails(order)}
                      >
                        <div className="flex justify-between items-start flex-wrap gap-3">
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 ${ORDER_STATUS[order.status]?.bg} rounded-full flex items-center justify-center`}>
                              <StatusIcon size={18} className={ORDER_STATUS[order.status]?.color} />
                            </div>
                            <div>
                              <p className="font-medium">Order #{order.orderNumber}</p>
                              <p className="text-sm text-gray-500 mt-1">
                                {new Date(order.orderDate).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-gray-400 mt-1">
                                {order.items?.slice(0, 2).map(i => i.name).join(', ')}
                                {order.items?.length > 2 && ` +${order.items.length - 2} more`}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-maroon">₹{(order.grandTotal || 0).toFixed(2)}</p>
                            <span className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${ORDER_STATUS[order.status]?.bg} ${ORDER_STATUS[order.status]?.color}`}>
                              {ORDER_STATUS[order.status]?.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeSection === 'wishlist' && (
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h1 className="text-2xl font-bold text-gray-800 mb-6">My Wishlist</h1>
              {wishlist.length === 0 ? (
                <div className="text-center py-12">
                  <Heart size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">Your wishlist is empty</p>
                  <Link to="/products" className="text-maroon mt-2 inline-block hover:underline">
                    Explore Products
                  </Link>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {wishlist.map(product => (
                    <div key={product._id} className="border rounded-lg p-3 hover:shadow-md transition group">
                      <Link to={`/product/${product._id}`}>
                        <img 
                          src={product.images?.[0] || '/api/placeholder/200/200'} 
                          className="w-full h-32 object-cover rounded mb-3" 
                          alt={product.name} 
                        />
                      </Link>
                      <Link to={`/product/${product._id}`}>
                        <h4 className="font-medium text-gray-800 line-clamp-1 text-sm hover:text-maroon transition">
                          {product.name}
                        </h4>
                      </Link>
                      <p className="text-maroon font-bold mt-1">₹{(product.price || 0).toFixed(2)}</p>
                      <div className="flex gap-2 mt-3">
                        <button 
                          onClick={() => handleAddToCart(product)} 
                          className="flex-1 bg-maroon text-white text-xs py-1.5 rounded hover:bg-maroon-light transition"
                        >
                          Add to Cart
                        </button>
                        <button 
                          onClick={() => removeFromWishlist(product._id)} 
                          className="p-1.5 border rounded hover:bg-gray-50 transition"
                        >
                          <Trash2 size={14} className="text-gray-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSection === 'addresses' && (
            <div className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">My Addresses</h1>
                <button 
                  onClick={() => setShowAddressForm(true)} 
                  className="bg-maroon text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-maroon-light transition"
                >
                  <Plus size={16} />
                  Add Address
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="text-center py-12">
                  <MapPin size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">No saved addresses</p>
                  <button 
                    onClick={() => setShowAddressForm(true)}
                    className="text-maroon text-sm mt-2 hover:underline"
                  >
                    Add your first address
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map(addr => (
                    <div 
                      key={addr._id} 
                      className={`border rounded-lg p-4 ${addr.isDefault ? 'border-maroon/30 bg-maroon/5' : ''}`}
                    >
                      <div className="flex justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {addr.label === 'Work' ? (
                              <Briefcase size={14} className="text-gray-500" />
                            ) : (
                              <Home size={14} className="text-gray-500" />
                            )}
                            <span className="font-medium text-sm">{addr.label}</span>
                            {addr.isDefault && (
                              <span className="text-xs bg-maroon/20 text-maroon px-2 py-0.5 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="font-medium">{addr.name}</p>
                          <p className="text-sm text-gray-600">{addr.street}</p>
                          <p className="text-sm text-gray-600">{addr.city}, {addr.state} - {addr.zipCode}</p>
                          <p className="text-sm text-gray-500 mt-1">{addr.phone}</p>
                          {addr.landmark && (
                            <p className="text-sm text-gray-500">Landmark: {addr.landmark}</p>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button 
                            onClick={() => { 
                              setEditingAddress(addr); 
                              setAddressForm(addr); 
                              setShowAddressForm(true); 
                            }} 
                            className="text-blue-500 hover:text-blue-700 p-1"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => deleteAddress(addr._id)} 
                            className="text-red-500 hover:text-red-700 p-1"
                          >
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

          {activeSection === 'profile' && (
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h1 className="text-2xl font-bold text-gray-800 mb-6">Profile Information</h1>
              <div className="max-w-md space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    id="profileName" 
                    defaultValue={cu.name} 
                    className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    defaultValue={cu.email} 
                    disabled 
                    className="w-full border rounded-lg p-2 bg-gray-50 text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input 
                    type="tel" 
                    id="profilePhone" 
                    defaultValue={cu.phone || ''} 
                    className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                    <span className="text-xs text-gray-400 ml-1">(for birthday rewards)</span>
                  </label>
                  <input 
                    type="date" 
                    id="profileDOB" 
                    defaultValue={cu.dateOfBirth?.split('T')[0] || ''} 
                    className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none" 
                  />
                </div>
                <div className="flex gap-2 items-center">
                  <input 
                    type="checkbox" 
                    id="newsletter" 
                    defaultChecked={cu.preferences?.newsletter} 
                    className="rounded border-gray-300 text-maroon focus:ring-maroon"
                  />
                  <label htmlFor="newsletter" className="text-sm text-gray-600">
                    Subscribe to email updates and exclusive offers
                  </label>
                </div>
                <button 
                  onClick={handleProfileUpdate} 
                  className="bg-maroon text-white px-6 py-2 rounded-lg hover:bg-maroon-light transition"
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeSection === 'cards' && (
  <div className="bg-white rounded-xl shadow-sm p-5">
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold text-gray-800">Saved Cards</h1>
      <button 
        onClick={() => setShowAddCardModal(true)}
        className="bg-maroon text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-maroon-light transition"
      >
        <Plus size={16} />
        Add New Card
      </button>
    </div>

    {savedCards.length === 0 ? (
      <div className="text-center py-12">
        <CreditCard size={48} className="mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500">No saved cards yet</p>
        <button 
          onClick={() => setShowAddCardModal(true)}
          className="text-maroon text-sm mt-2 inline-block hover:underline"
        >
          Add your first card
        </button>
      </div>
    ) : (
      <div className="grid md:grid-cols-2 gap-4">
        {savedCards.map((card, idx) => (
          <div 
            key={idx} 
            className={`border rounded-xl p-4 transition-all hover:shadow-md ${
              card.isDefault ? 'border-maroon/30 bg-gradient-to-r from-maroon/5 to-transparent' : 'border-gray-200'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-14 h-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-md">
                  {card.cardType === 'Visa' ? 'VISA' : card.cardType === 'Mastercard' ? 'MC' : card.cardType === 'Amex' ? 'AMEX' : 'CARD'}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">•••• •••• •••• {card.last4}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Expires {card.expiryMonth}/{card.expiryYear}
                  </p>
                </div>
              </div>
              {card.isDefault && (
                <span className="text-xs bg-maroon/20 text-maroon px-2 py-1 rounded-full font-medium">
                  Default
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}



{showAddCardModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl max-w-md w-full p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-xl">Add New Card</h3>
        <button 
          onClick={() => setShowAddCardModal(false)} 
          className="text-gray-400 hover:text-gray-600 transition"
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
          <input 
            type="text" 
            placeholder="1234 5678 9012 3456"
            maxLength="19"
            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none transition"
            value={cardForm.cardNumber}
            onChange={e => {
              let value = e.target.value.replace(/\D/g, '');
              if (value.length > 16) value = value.slice(0, 16);
              value = value.replace(/(\d{4})/g, '$1 ').trim();
              setCardForm({...cardForm, cardNumber: value});
            }}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Card Holder Name</label>
          <input 
            type="text" 
            placeholder="JOHN DOE"
            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none transition"
            value={cardForm.cardHolder}
            onChange={e => setCardForm({...cardForm, cardHolder: e.target.value.toUpperCase()})}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Month</label>
            <select 
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none"
              value={cardForm.expiryMonth}
              onChange={e => setCardForm({...cardForm, expiryMonth: e.target.value})}
            >
              <option value="">Month</option>
              {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Year</label>
            <select 
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none"
              value={cardForm.expiryYear}
              onChange={e => setCardForm({...cardForm, expiryYear: e.target.value})}
            >
              <option value="">Year</option>
              {Array.from({length: 10}, (_, i) => new Date().getFullYear() + i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
          <input 
            type="password" 
            placeholder="123"
            maxLength="4"
            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none transition"
            value={cardForm.cvv}
            onChange={e => setCardForm({...cardForm, cvv: e.target.value.replace(/\D/g, '').slice(0, 4)})}
          />
        </div>
        
        <label className="flex items-center gap-3 cursor-pointer">
          <input 
            type="checkbox" 
            checked={cardForm.isDefault}
            onChange={e => setCardForm({...cardForm, isDefault: e.target.checked})}
            className="w-4 h-4 text-maroon rounded border-gray-300 focus:ring-maroon"
          />
          <span className="text-sm text-gray-700">Set as default payment method</span>
        </label>
        
        <button 
          onClick={handleAddCard}
          className="w-full bg-gradient-to-r from-maroon to-maroon-light text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 mt-4"
        >
          Add Card
        </button>
      </div>
    </div>
  </div>
)}

          {activeSection === 'settings' && (
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>
              <div className="space-y-4 max-w-lg">
                {[
                  { 
                    icon: Bell, 
                    label: 'Email Notifications', 
                    desc: 'Receive order updates, offers, and skincare tips' 
                  },
                  { 
                    icon: Shield, 
                    label: 'Privacy Settings', 
                    desc: 'Manage your data and privacy preferences' 
                  },
                  { 
                    icon: HelpCircle, 
                    label: 'Help & Support', 
                    desc: 'Get help with your account and orders' 
                  },
                ].map(setting => {
                  const SettingIcon = setting.icon;
                  return (
                    <div key={setting.label} className="flex justify-between items-center p-4 border rounded-lg hover:shadow-sm transition">
                      <div className="flex items-start gap-3">
                        <SettingIcon size={18} className="text-gray-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">{setting.label}</p>
                          <p className="text-xs text-gray-500">{setting.desc}</p>
                        </div>
                      </div>
                      <button className="text-maroon text-sm font-medium hover:underline">
                        Configure
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Address Form Modal */}
      {showAddressForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h3>
              <button 
                onClick={() => { 
                  setShowAddressForm(false); 
                  setEditingAddress(null); 
                }} 
                className="text-gray-500 hover:text-gray-700"
              >
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
              buttonText="Use Current Location"
            />
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-gray-500">Or enter manually</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  className="border rounded-lg p-2 text-sm focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none" 
                  value={addressForm.name} 
                  onChange={e => setAddressForm({...addressForm, name: e.target.value})} 
                />
                <input 
                  type="tel" 
                  placeholder="Phone" 
                  className="border rounded-lg p-2 text-sm focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none" 
                  value={addressForm.phone} 
                  onChange={e => setAddressForm({...addressForm, phone: e.target.value})} 
                />
              </div>
              <input 
                type="text" 
                placeholder="Street Address" 
                className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none" 
                value={addressForm.street} 
                onChange={e => setAddressForm({...addressForm, street: e.target.value})} 
              />
              <input 
                type="text" 
                placeholder="Landmark (Optional)" 
                className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none" 
                value={addressForm.landmark} 
                onChange={e => setAddressForm({...addressForm, landmark: e.target.value})} 
              />
              <div className="grid grid-cols-2 gap-3">
                <input 
                  type="text" 
                  placeholder="City" 
                  className="border rounded-lg p-2 text-sm focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none" 
                  value={addressForm.city} 
                  onChange={e => setAddressForm({...addressForm, city: e.target.value})} 
                />
                <select 
                  className="border rounded-lg p-2 text-sm focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none" 
                  value={addressForm.state} 
                  onChange={e => setAddressForm({...addressForm, state: e.target.value})}
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input 
                  type="text" 
                  placeholder="ZIP Code" 
                  className="border rounded-lg p-2 text-sm focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none" 
                  value={addressForm.zipCode} 
                  onChange={e => setAddressForm({...addressForm, zipCode: e.target.value})} 
                />
                <select 
                  className="border rounded-lg p-2 text-sm focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none" 
                  value={addressForm.label} 
                  onChange={e => setAddressForm({...addressForm, label: e.target.value})}
                >
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={addressForm.isDefault} 
                  onChange={e => setAddressForm({...addressForm, isDefault: e.target.checked})} 
                  className="rounded border-gray-300 text-maroon focus:ring-maroon"
                />
                <span className="text-sm">Set as default address</span>
              </label>
              <button 
                onClick={saveAddress} 
                className="w-full bg-maroon text-white py-2 rounded-lg mt-2 hover:bg-maroon-light transition font-medium"
              >
                Save Address
              </button>
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
              <button 
                onClick={() => setShowOrderModal(false)} 
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <p className="text-sm text-gray-500">Order #{selectedOrder.orderNumber}</p>
                <p className="text-sm text-gray-500">
                  Placed on {new Date(selectedOrder.orderDate).toLocaleDateString()}
                </p>
              </div>
              
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex gap-4 border-b pb-3">
                      <Link 
                        to={item.product?._id ? `/product/${item.product._id}` : '#'} 
                        className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0"
                      >
                        <img 
                          src={item.product?.images?.[0] || '/api/placeholder/60/60'} 
                          className="w-full h-full object-cover" 
                          alt={item.name} 
                        />
                      </Link>
                      <div className="flex-1">
                        <Link 
                          to={item.product?._id ? `/product/${item.product._id}` : '#'} 
                          className="font-medium hover:text-maroon"
                        >
                          {item.name}
                        </Link>
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                        <p className="text-sm text-gray-500">Price: ₹{item.price.toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₹{(item.price * item.quantity).toFixed(2)}</p>
                        {selectedOrder.status === 'delivered' && (
                          <button 
                            onClick={() => {
                              setShowOrderModal(false);
                              openReviewModal(item, selectedOrder._id);
                            }} 
                            className="text-maroon text-sm hover:underline mt-1"
                          >
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
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>₹{(selectedOrder.totalAmount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (18% GST)</span>
                    <span>₹{(selectedOrder.taxAmount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span>
                      {selectedOrder.shippingAmount === 0 
                        ? 'Free' 
                        : `₹${(selectedOrder.shippingAmount || 0).toFixed(2)}`
                      }
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span className="text-maroon">₹{(selectedOrder.grandTotal || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex gap-3">
                <button 
                  onClick={() => window.print()} 
                  className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition"
                >
                  Print Order
                </button>
                <Link 
                  to={`/invoice/${selectedOrder._id}`} 
                  className="flex-1 bg-maroon text-white py-2 rounded-lg text-center hover:bg-maroon-light transition"
                >
                  Download Invoice
                </Link>
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
              <button 
                onClick={() => setShowReviewModal(false)} 
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="font-medium">{reviewProduct.name}</p>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button 
                    key={star} 
                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    className="hover:scale-110 transition"
                  >
                    <Star 
                      size={24} 
                      className={star <= reviewForm.rating 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'text-gray-300'
                      } 
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <input 
              type="text" 
              placeholder="Review title" 
              className="w-full border rounded-lg p-2 mb-3 text-sm focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none" 
              value={reviewForm.title} 
              onChange={e => setReviewForm({...reviewForm, title: e.target.value})} 
            />
            
            <textarea 
              rows="4" 
              placeholder="Write your review..." 
              className="w-full border rounded-lg p-2 mb-4 text-sm focus:ring-2 focus:ring-maroon/20 focus:border-maroon outline-none resize-none" 
              value={reviewForm.comment} 
              onChange={e => setReviewForm({...reviewForm, comment: e.target.value})} 
            />
            
            <button 
              onClick={submitReview} 
              disabled={submittingReview} 
              className="w-full bg-maroon text-white py-2 rounded-lg hover:bg-maroon-light transition disabled:opacity-50 font-medium"
            >
              {submittingReview ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw size={16} className="animate-spin" />
                  Submitting...
                </span>
              ) : (
                'Submit Review (+25 GlowPoints)'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}