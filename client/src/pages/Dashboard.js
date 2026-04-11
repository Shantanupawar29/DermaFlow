import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  User, ShoppingBag, Heart, MapPin, Settings, Star, 
  Package, Truck, CheckCircle, Clock, AlertCircle,
  Plus, Edit2, Trash2, LogOut, Sparkles, Gift,
  ChevronRight, Calendar, Award, Copy, X, Home,
  Phone, Mail, Map, RefreshCw, TrendingUp
} from 'lucide-react';
import axios from 'axios';
import { Briefcase } from 'lucide-react';
import LocationDetector from '../components/LocationDetector';

const API_URL = 'http://localhost:5000/api';
const token = () => localStorage.getItem('token');

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
  bronze: { name: 'Bronze', min: 0, max: 4999, color: '#cd7f32', bg: '#fef3c7', icon: '🥉' },
  silver: { name: 'Silver', min: 5000, max: 19999, color: '#94a3b8', bg: '#f1f5f9', icon: '🥈' },
  gold: { name: 'Gold', min: 20000, max: 49999, color: '#d4af37', bg: '#fefce8', icon: '🥇' },
  platinum: { name: 'Platinum', min: 50000, max: Infinity, color: '#7c3aed', bg: '#ede9fe', icon: '💎' }
};

export default function Dashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState(null);
const [showOrderModal, setShowOrderModal] = useState(false);
const [showReviewModal, setShowReviewModal] = useState(false);
const [reviewProduct, setReviewProduct] = useState(null);
const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
const [submittingReview, setSubmittingReview] = useState(false);
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    name: '', street: '', city: '', state: '', zipCode: '', phone: '', label: 'Home', isDefault: false
  });

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [userRes, ordersRes, wishlistRes, addressesRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token()}` } }),
        axios.get(`${API_URL}/orders/my-orders`, { headers: { Authorization: `Bearer ${token()}` } }),
        axios.get(`${API_URL}/profile/wishlist`, { headers: { Authorization: `Bearer ${token()}` } }),
        axios.get(`${API_URL}/profile/addresses`, { headers: { Authorization: `Bearer ${token()}` } }),
        axios.get(`${API_URL}/profile/stats`, { headers: { Authorization: `Bearer ${token()}` } })
      ]);
      
      setUserData(userRes.data);
      setOrders(ordersRes.data || []);
      setWishlist(wishlistRes.data || []);
      setAddresses(addressesRes.data || []);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };
const openOrderDetails = (order) => {
  setSelectedOrder(order);
  setShowOrderModal(true);
};

const openReviewModal = (item, orderId) => {
  // Extract product details properly
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
    const token = localStorage.getItem('token');
    await axios.post(`${API_URL}/reviews`, {
      productId: reviewProduct._id,
      orderId: reviewProduct.orderId,
      rating: reviewForm.rating,
      title: reviewForm.title,
      comment: reviewForm.comment
    }, { headers: { Authorization: `Bearer ${token}` } });
    
    alert('Review submitted! +25 GlowPoints added!');
    setShowReviewModal(false);
    setReviewForm({ rating: 5, title: '', comment: '' });
    fetchDashboardData();
  } catch (error) {
    console.error('Error submitting review:', error);
    alert(error.response?.data?.message || 'Failed to submit review');
  } finally {
    setSubmittingReview(false);
  }
};
  const handleAddToCart = (product) => {
    addToCart(product, 1);
    alert(`${product.name} added to cart!`);
  };

  const removeFromWishlist = async (productId) => {
    try {
      await axios.delete(`${API_URL}/profile/wishlist/${productId}`, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      setWishlist(prev => prev.filter(p => p._id !== productId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const saveAddress = async () => {
    try {
      if (editingAddress) {
        await axios.put(`${API_URL}/profile/addresses/${editingAddress._id}`, addressForm, {
          headers: { Authorization: `Bearer ${token()}` }
        });
      } else {
        await axios.post(`${API_URL}/profile/addresses`, addressForm, {
          headers: { Authorization: `Bearer ${token()}` }
        });
      }
      setShowAddressForm(false);
      setEditingAddress(null);
      setAddressForm({ name: '', street: '', city: '', state: '', zipCode: '', phone: '', label: 'Home', isDefault: false });
      fetchDashboardData();
    } catch (error) {
      alert('Failed to save address');
    }
  };

  const deleteAddress = async (addressId) => {
    if (window.confirm('Delete this address?')) {
      await axios.delete(`${API_URL}/profile/addresses/${addressId}`, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      fetchDashboardData();
    }
  };

  if (!isAuthenticated || !user) return <Navigate to="/login" />;
  if (loading) return <div className="flex justify-center items-center h-64">Loading your dashboard...</div>;

  const cu = userData || user;
  const spent = stats.totalSpent || 0;
  const currentTier = Object.values(TIERS).find(t => spent >= t.min && spent <= t.max) || TIERS.bronze;
  const nextTier = Object.values(TIERS).find(t => t.min > spent);
  const progressToNext = nextTier ? ((spent - currentTier.min) / (nextTier.min - currentTier.min)) * 100 : 100;
  const points = cu.glowPoints || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Account</h1>
          <p className="text-gray-500 text-sm">Manage your orders, wishlist, and profile</p>
        </div>
        <div className="flex gap-3">
          <Link to="/products" className="bg-maroon text-white px-4 py-2 rounded-lg hover:bg-maroon-light transition flex items-center gap-2">
            <ShoppingBag size={18} /> Shop Now
          </Link>
          <button onClick={logout} className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-maroon/10 rounded-full flex items-center justify-center">
              <ShoppingBag size={20} className="text-maroon" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.totalOrders || 0}</p>
              <p className="text-sm text-gray-500">Total Orders</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Star size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{points}</p>
              <p className="text-sm text-gray-500">Glow Points</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Heart size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{wishlist.length}</p>
              <p className="text-sm text-gray-500">Wishlist Items</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Truck size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{orders.filter(o => o.status === 'delivered').length}</p>
              <p className="text-sm text-gray-500">Delivered Orders</p>
            </div>
          </div>
        </div>
      </div>

      {/* Loyalty Card */}
      <div className={`bg-gradient-to-r ${currentTier.bg} rounded-xl p-6 mb-8 border`}>
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{currentTier.icon}</span>
              <h2 className="text-xl font-bold text-gray-800">{currentTier.name} Member</h2>
            </div>
            <p className="text-gray-600 text-sm">You've spent ₹{spent.toLocaleString('en-IN')}</p>
            {nextTier && (
              <p className="text-sm text-gray-500 mt-1">
                ₹{(nextTier.min - spent).toLocaleString('en-IN')} more to reach {nextTier.name}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-800">{points}</p>
            <p className="text-sm text-gray-500">GlowPoints earned</p>
          </div>
        </div>
        {nextTier && (
          <div className="mt-4">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-maroon rounded-full transition-all" style={{ width: `${progressToNext}%` }} />
            </div>
            <p className="text-xs text-gray-500 mt-2">{Math.round(progressToNext)}% to {nextTier.name}</p>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: User },
            { id: 'orders', label: 'Orders', icon: Package },
            { id: 'wishlist', label: 'Wishlist', icon: Heart },
            { id: 'addresses', label: 'Addresses', icon: MapPin },
            { id: 'profile', label: 'Profile', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-3 px-1 transition ${
                activeTab === tab.id 
                  ? 'border-b-2 border-maroon text-maroon font-medium' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon size={18} />
              <span className="text-sm">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">Recent Orders</h3>
              <button onClick={() => setActiveTab('orders')} className="text-maroon text-sm hover:underline">View All</button>
            </div>
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <Package size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No orders yet</p>
                <Link to="/products" className="text-maroon text-sm mt-2 inline-block">Start Shopping →</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 3).map(order => {
                  const StatusIcon = ORDER_STATUS[order.status]?.icon || Package;
                  return (
                    <div key={order._id} className="border rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-800">Order #{order.orderNumber?.slice(-8)}</p>
                          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                            <Calendar size={12} /> {new Date(order.orderDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-maroon">₹{(order.grandTotal || 0).toFixed(2)}</p>
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${ORDER_STATUS[order.status]?.bg} ${ORDER_STATUS[order.status]?.color}`}>
                            <StatusIcon size={12} />
                            {ORDER_STATUS[order.status]?.label || order.status}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        {order.items?.slice(0, 2).map(i => i.name).join(', ')}
                        {order.items?.length > 2 && ` + ${order.items.length - 2} more`}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions & Wishlist Preview */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-800 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Link to="/products" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition">
                  <ShoppingBag size={18} className="text-maroon" />
                  <span className="text-sm">Continue Shopping</span>
                </Link>
                <Link to="/quiz" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition">
                  <Sparkles size={18} className="text-maroon" />
                  <span className="text-sm">Take Skin Quiz</span>
                </Link>
              </div>
            </div>

            {/* Wishlist Preview */}
            {wishlist.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-gray-800">Wishlist</h3>
                  <button onClick={() => setActiveTab('wishlist')} className="text-maroon text-sm hover:underline">View All</button>
                </div>
                <div className="space-y-2">
                  {wishlist.slice(0, 2).map(product => (
                    <div key={product._id} className="flex gap-3">
                      <img src={product.images?.[0] || '/api/placeholder/60/60'} className="w-12 h-12 object-cover rounded" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="text-maroon font-bold text-sm">₹{(product.price || 0).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

     {/* Orders Tab */}
{activeTab === 'orders' && (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
    <h3 className="font-semibold text-gray-800 mb-4">All Orders</h3>
    {orders.length === 0 ? (
      <div className="text-center py-12">
        <Package size={48} className="mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500">No orders yet</p>
        <Link to="/products" className="text-maroon mt-2 inline-block">Start Shopping →</Link>
      </div>
    ) : (
      <div className="space-y-4">
        {orders.map(order => {
          const StatusIcon = ORDER_STATUS[order.status]?.icon || Package;
          const canReview = order.status === 'delivered';
          const reviewedProducts = []; // You can track reviewed products from state
          
          return (
            <div key={order._id} className="border rounded-lg p-4 hover:shadow-md transition cursor-pointer" onClick={() => openOrderDetails(order)}>
              <div className="flex justify-between items-start flex-wrap gap-3">
                <div>
                  <p className="font-medium text-gray-800">Order #{order.orderNumber}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                    <Calendar size={14} /> {new Date(order.orderDate).toLocaleDateString()}
                    <span className="text-gray-300">|</span>
                    <span className="capitalize">{order.paymentMethod}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-maroon text-lg">₹{(order.grandTotal || 0).toFixed(2)}</p>
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${ORDER_STATUS[order.status]?.bg} ${ORDER_STATUS[order.status]?.color}`}>
                    <StatusIcon size={12} />
                    {ORDER_STATUS[order.status]?.label || order.status}
                  </span>
                </div>
              </div>
              <div className="border-t mt-3 pt-3">
                <p className="text-sm font-medium mb-2">Items ({order.items?.length}):</p>
                <div className="space-y-1">
                  {order.items?.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{item.name} x {item.quantity}</span>
                      <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  {order.items?.length > 3 && (
                    <p className="text-xs text-gray-500">+{order.items.length - 3} more items</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
)}

      {/* Wishlist Tab */}
      {activeTab === 'wishlist' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">My Wishlist</h3>
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
                  <img src={product.images?.[0] || '/api/placeholder/120/120'} className="w-full h-32 object-cover rounded mb-3" />
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

      {/* Addresses Tab */}
      {activeTab === 'addresses' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">Saved Addresses</h3>
            <button onClick={() => setShowAddressForm(true)} className="bg-maroon text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1">
              <Plus size={16} /> Add Address
            </button>
          </div>

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
      
      {/* Location Detector */}
        <div className="mb-4">
        <LocationDetector 
          onAddressFetched={(address) => {
            setAddressForm({
              ...addressForm,
              street: address.street || addressForm.street,
              city: address.city || addressForm.city,
              state: address.state || addressForm.state,
              zipCode: address.zipCode || addressForm.zipCode,
              country: address.country || addressForm.country
            });
          }}
          buttonText="Use My Current Location"
        />
        <div className="relative my-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-gray-500">Or enter manually</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input type="text" placeholder="Full Name" className="border rounded-lg p-2 text-sm" value={addressForm.name} onChange={e => setAddressForm({...addressForm, name: e.target.value})} />
          <input type="tel" placeholder="Phone" className="border rounded-lg p-2 text-sm" value={addressForm.phone} onChange={e => setAddressForm({...addressForm, phone: e.target.value})} />
        </div>
        <input type="text" placeholder="Street Address" className="border rounded-lg p-2 text-sm w-full" value={addressForm.street} onChange={e => setAddressForm({...addressForm, street: e.target.value})} />
        <input type="text" placeholder="Landmark (Optional)" className="border rounded-lg p-2 text-sm w-full" value={addressForm.landmark} onChange={e => setAddressForm({...addressForm, landmark: e.target.value})} />
        <div className="grid grid-cols-2 gap-3">
          <input type="text" placeholder="City" className="border rounded-lg p-2 text-sm" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} />
          <select className="border rounded-lg p-2 text-sm" value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})}>
            <option value="">Select State</option>
            {["Maharashtra","Delhi","Karnataka","Tamil Nadu","Telangana","West Bengal","Gujarat","Rajasthan","Uttar Pradesh","Punjab","Haryana","Kerala","Bihar","Madhya Pradesh","Assam","Odisha","Chhattisgarh","Jharkhand","Uttarakhand","Himachal Pradesh","Goa","Puducherry"].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
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

          <div className="space-y-3">
            {addresses.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No saved addresses</p>
            ) : (
              addresses.map(addr => (
                <div key={addr._id} className={`border rounded-lg p-4 ${addr.isDefault ? 'border-maroon/30 bg-maroon/5' : ''}`}>
                  <div className="flex justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {addr.label === 'Work' ? <Briefcase size={14} /> : <Home size={14} />}
                        <span className="font-medium">{addr.label}</span>
                        {addr.isDefault && <span className="text-xs bg-maroon/20 text-maroon px-2 py-0.5 rounded">Default</span>}
                      </div>
                      <p className="font-medium">{addr.name}</p>
                      <p className="text-sm text-gray-600">{addr.street}, {addr.city}</p>
                      <p className="text-sm text-gray-600">{addr.state} - {addr.zipCode}</p>
                      <p className="text-sm text-gray-500 mt-1">{addr.phone}</p>
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
              ))
            )}
          </div>
        </div>
      )}
{/* Order Details Modal */}
{showOrderModal && selectedOrder && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
        <h3 className="font-semibold text-lg">Order Details</h3>
        <button onClick={() => setShowOrderModal(false)} className="text-gray-500 hover:text-gray-700">
          <X size={20} />
        </button>
      </div>
      
      <div className="p-6">
        {/* Order Header */}
        <div className="mb-6">
          <p className="text-sm text-gray-500">Order #{selectedOrder.orderNumber}</p>
          <p className="text-sm text-gray-500">Placed on {new Date(selectedOrder.orderDate).toLocaleDateString()}</p>
          <div className="mt-2">
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${ORDER_STATUS[selectedOrder.status]?.bg} ${ORDER_STATUS[selectedOrder.status]?.color}`}>
              {ORDER_STATUS[selectedOrder.status]?.label || selectedOrder.status}
            </span>
          </div>
        </div>
        
        {/* Items - Now clickable */}
        <div className="mb-6">
          <h4 className="font-semibold mb-3">Items</h4>
          <div className="space-y-3">
            {selectedOrder.items?.map((item, idx) => (
              <div key={idx} className="flex gap-4 border-b pb-3 group">
                {/* Product Image - Clickable */}
                <Link 
                 to={item.product?._id ? `/product/${item.product._id}` : '#'}
                  className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 hover:opacity-80 transition"
                >
                  <img 
                    src={item.product?.images?.[0] || item.image || '/api/placeholder/60/60'} 
                    className="w-full h-full object-cover" 
                    alt={item.name}
                  />
                </Link>
                
                {/* Product Details - Clickable */}
                <div className="flex-1">
                  <Link 
                   to={item.product?._id ? `/product/${item.product._id}` : '#'}
                    className="font-medium hover:text-maroon transition"
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
                      onClick={(e) => {
                        e.stopPropagation();
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
        
        {/* Shipping Address */}
        <div className="mb-6">
          <h4 className="font-semibold mb-2">Shipping Address</h4>
          <p className="text-sm text-gray-600">{selectedOrder.shippingAddress?.street}</p>
          <p className="text-sm text-gray-600">{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}</p>
          <p className="text-sm text-gray-600">{selectedOrder.shippingAddress?.zipCode}</p>
          <p className="text-sm text-gray-600">Phone: {selectedOrder.phone}</p>
        </div>
        
        {/* Payment Summary */}
        <div className="border-t pt-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>₹{(selectedOrder.totalAmount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax (18% GST)</span>
              <span>₹{(selectedOrder.taxAmount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span>{selectedOrder.shippingAmount === 0 ? 'Free' : `₹${(selectedOrder.shippingAmount || 0).toFixed(2)}`}</span>
            </div>
            {selectedOrder.discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>-₹{(selectedOrder.discountAmount || 0).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total</span>
              <span className="text-maroon">₹{(selectedOrder.grandTotal || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          <button 
            onClick={() => window.print()}
            className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition"
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
        <button onClick={() => setShowReviewModal(false)} className="text-gray-500 hover:text-gray-700">
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
              className="focus:outline-none"
            >
              <Star 
                size={24} 
                className={star <= reviewForm.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
              />
            </button>
          ))}
        </div>
      </div>
      
      <div className="mb-4">
        <input
          type="text"
          placeholder="Review title (optional)"
          className="w-full border rounded-lg p-2 mb-3"
          value={reviewForm.title}
          onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
        />
        <textarea
          rows="4"
          placeholder="Write your review here..."
          className="w-full border rounded-lg p-2"
          value={reviewForm.comment}
          onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
        />
      </div>
      
      <button
        onClick={submitReview}
        disabled={submittingReview}
        className="w-full bg-maroon text-white py-2 rounded-lg font-semibold hover:bg-maroon-light disabled:bg-gray-400"
      >
        {submittingReview ? 'Submitting...' : 'Submit Review (+25 GlowPoints)'}
      </button>
    </div>
  </div>
)}
     
      {/* Profile Tab */}
{activeTab === 'profile' && (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
    <h3 className="font-semibold text-gray-800 mb-4">Profile Information</h3>
    <div className="max-w-md space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <input 
          type="text" 
          id="profileName"
          defaultValue={cu.name} 
          className="w-full border rounded-lg p-2" 
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input 
          type="email" 
          defaultValue={cu.email} 
          disabled 
          className="w-full border rounded-lg p-2 bg-gray-50" 
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
        <input 
          type="tel" 
          id="profilePhone"
          defaultValue={cu.phone || ''} 
          className="w-full border rounded-lg p-2" 
        />
      </div>
      <div className="flex gap-2">
        <input type="checkbox" id="newsletter" defaultChecked={cu.preferences?.newsletter} />
        <label htmlFor="newsletter" className="text-sm text-gray-600">Subscribe to email updates and offers</label>
      </div>
      <button 
        onClick={async () => {
          const name = document.getElementById('profileName').value;
          const phone = document.getElementById('profilePhone').value;
          const newsletter = document.getElementById('newsletter').checked;
          
          try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/auth/profile`, 
              { name, phone, preferences: { newsletter } },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Profile updated successfully!');
            fetchDashboardData();
          } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
          }
        }}
        className="bg-maroon text-white px-6 py-2 rounded-lg hover:bg-maroon-light transition"
      >
        Save Changes
      </button>
    </div>
  </div>
)}
    </div>
  );
}

// Add Briefcase icon if not already in lucide-react
