import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingBag, Users, BarChart3,
  Shield, Cloud, Database, FileText, TrendingUp, Megaphone,
  Truck, FlaskConical, Heart, Tag
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

// Existing pages
import Overview         from './Overview';
import Orders           from './Orders';
import Inventory        from './Inventory';
import Customers        from './Customers';
import SalesReport      from './SalesReport';
import Security         from './Security';
import BIHub from './BIHub';
import LegalDashboard   from './Legaldashboard';
import SCMDashboard     from './SCMDashboard';
import SellerManagement from './SellerManagement';

// NEW PAGES
import ERPDashboard     from './ERPDashboard';
import CRMDashboard     from './CRMDashboard';
import SalesManager from './SalesManager'; 
const MAROON = '#4A0E2E';

const NAV_ITEMS = [
  { path: '',          label: 'Overview',        Icon: LayoutDashboard },
  { path: 'orders',    label: 'Orders / SCM',    Icon: ShoppingBag },
  { path: 'inventory', label: 'Inventory',       Icon: Package },
  { path: 'customers', label: 'Customers',       Icon: Users },
  { path: 'sales',     label: 'Sales Report',    Icon: BarChart3 },
  { path: 'sales-manager', label: 'Sales Manager', Icon: Tag, isNew: true },
  { path: 'erp',       label: 'ERP',             Icon: FlaskConical, isNew: true },
  { path: 'crm',       label: 'CRM',             Icon: Heart,        isNew: true },
  { path: 'scm',       label: 'SCM / Suppliers', Icon: Truck },
  { path: 'bi-hub',    label: 'Business Intelligence', Icon: TrendingUp, isNew: true },
  { path: 'security',  label: 'Security',        Icon: Shield },
  { path: 'sellers',   label: 'Sellers',         Icon: Users },
  { path: 'legal',     label: 'Legal',           Icon: FileText },
];

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalOrders: 0, totalProducts: 0, totalUsers: 0, totalRevenue: 0, lowStockItems: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      const data = response.data;
      setStats({
        totalOrders:   data.totalOrders   || 0,
        totalProducts: data.totalProducts || 0,
        totalUsers:    data.totalUsers    || 0,
        totalRevenue:  data.totalRevenue  || 0,
        lowStockItems: (data.lowStock || []).length
      });
    } catch (error) {
      console.error('Dashboard data error:', error);
      if (error.response?.status === 401 || error.response?.status === 403) navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    navigate('/login');
    return null;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>

      {/* Sidebar */}
      <aside style={{ width: 220, background: '#1a0a15', flexShrink: 0, overflowY: 'auto', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50 }}>
        {/* Logo */}
        <div style={{ padding: '1.25rem 1.25rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div style={{ color: '#fff', fontWeight: 900, fontSize: '1rem', letterSpacing: '-0.02em' }}>✦ DermaFlow</div>
          </Link>
          <div style={{ color: '#9ca3af', fontSize: '0.72rem', marginTop: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
          <div style={{ display: 'inline-block', background: MAROON, color: '#fff', fontSize: '0.62rem', fontWeight: 700, padding: '0.1rem 0.5rem', borderRadius: '999px', marginTop: '0.4rem' }}>ADMIN</div>
        </div>

        {/* Stats mini */}
        {!loading && (
          <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
            {[
              { label: 'Orders',   value: stats.totalOrders },
              { label: 'Products', value: stats.totalProducts },
              { label: 'Users',    value: stats.totalUsers },
              { label: 'Low Stock',value: stats.lowStockItems, warn: stats.lowStockItems > 0 },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '0.4rem', padding: '0.4rem 0.5rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: s.warn ? '#fca5a5' : '#fff' }}>{s.value}</div>
                <div style={{ fontSize: '0.62rem', color: '#9ca3af' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Nav */}
        <nav style={{ padding: '0.5rem 0' }}>
          {NAV_ITEMS.map(({ path, label, Icon, isNew }) => (
            <NavLink
              key={path}
              to={`/admin${path ? `/${path}` : ''}`}
              end={path === ''}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                padding: '0.6rem 1.25rem', textDecoration: 'none', fontSize: '0.835rem',
                color: isActive ? '#fff' : '#9ca3af',
                background: isActive ? MAROON : 'transparent',
                borderLeft: isActive ? '3px solid #f87171' : '3px solid transparent',
                fontWeight: isActive ? 700 : 400,
                transition: 'all 0.15s',
              })}
            >
              <Icon size={15} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{label}</span>
              {isNew && <span style={{ background: '#16a34a', color: '#fff', fontSize: '0.58rem', fontWeight: 800, padding: '0.1rem 0.35rem', borderRadius: '999px' }}>NEW</span>}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ marginLeft: 220, flex: 1, background: '#f8fafc', minHeight: '100vh', padding: '2rem' }}>
        <Routes>
          <Route index                    element={<Overview />} />
          <Route path="orders"            element={<Orders />} />
          <Route path="inventory"         element={<Inventory />} />
          <Route path="customers"         element={<Customers />} />
          <Route path="sales"             element={<SalesReport />} />
           <Route path="sales-manager"     element={<SalesManager />} />
          <Route path="erp"               element={<ERPDashboard />} />
          <Route path="crm"               element={<CRMDashboard />} />
          <Route path="scm"               element={<SCMDashboard />} />
          <Route path="bi-hub"            element={<BIHub />} />
          <Route path="security"          element={<Security />} />
          <Route path="legal"             element={<LegalDashboard />} />
          <Route path="sellers"           element={<SellerManagement />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;