import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LayoutDashboard, Package, ShoppingBag, Users, BarChart3, Shield, Cloud, Database, FileText, TrendingUp, Megaphone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Overview from './Overview';
import Orders from './Orders';
import Inventory from './Inventory';
import Customers from './Customers';
import SalesReport from './SalesReport';
import Security from './Security';
import Deployment from './Deployment';
import ERPIntegration from './ERPIntegration';
import LegalDashboard from './Legaldashboard'; // Fixed: Capital L
import RevenueDashboard from './RevenueDashboard';
import MarketingDashboard from './MarketingDashboard';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalRevenue: 0,
    lowStockItems: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = response.data;
      setStats({
        totalOrders: data.totalOrders || 0,
        totalProducts: data.totalProducts || 0,
        totalUsers: data.totalUsers || 0,
        totalRevenue: data.totalRevenue || 0,
        lowStockItems: (data.lowStock || []).length
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { path: '', label: 'Overview', icon: LayoutDashboard },
    { path: 'orders', label: 'Orders', icon: ShoppingBag },
    { path: 'inventory', label: 'Inventory', icon: Package },
    { path: 'customers', label: 'Customers', icon: Users },
    { path: 'reports', label: 'Sales Report', icon: BarChart3 },
    { path: 'revenue', label: 'Revenue Analytics', icon: TrendingUp },
    { path: 'marketing', label: 'Marketing', icon: Megaphone },
    { path: 'legal', label: 'Legal & Compliance', icon: FileText },
    { path: 'erp', label: 'ERP Integration', icon: Database },
    { path: 'security', label: 'Security', icon: Shield },
    { path: 'deployment', label: 'Deployment', icon: Cloud },
  ];

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar - Fixed with proper overflow */}
        <div className="w-64 bg-[#4A0E2E] shadow-lg min-h-screen fixed overflow-y-auto">
          <div className="p-6 border-b border-[#6B1D45]">
            <h2 className="text-xl font-bold text-white">Admin Panel</h2>
            <p className="text-[#F5E6D3] text-sm mt-1">Welcome, {user?.name}</p>
          </div>
          <nav className="mt-6 pb-6">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={`/admin/${item.path}`}
                className="flex items-center px-6 py-3 text-[#F5E6D3] hover:bg-[#6B1D45] transition"
              >
                <item.icon size={18} className="mr-3 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Main Content - Fixed overflow issues */}
        <div className="flex-1 ml-64 min-w-0">
          <div className="p-6 overflow-x-auto">
            <Routes>
              <Route path="/" element={<Overview stats={stats} loading={loading} />} />
              <Route path="overview" element={<Overview stats={stats} loading={loading} />} />
              <Route path="orders" element={<Orders />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="customers" element={<Customers />} />
              <Route path="reports" element={<SalesReport />} />
              <Route path="revenue" element={<RevenueDashboard />} />
              <Route path="marketing" element={<MarketingDashboard />} />
              <Route path="legal" element={<LegalDashboard />} />
              <Route path="erp" element={<ERPIntegration />} />
              <Route path="security" element={<Security />} />
              <Route path="deployment" element={<Deployment />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;