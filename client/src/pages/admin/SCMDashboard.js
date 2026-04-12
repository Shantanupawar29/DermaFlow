import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, AlertTriangle, Truck, TrendingUp, Bell, Send, RefreshCw, CheckCircle, Clock } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';
const token = () => localStorage.getItem('token');

export default function SCMDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingAlerts, setCheckingAlerts] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [dashboardRes, alertsRes, suppliersRes] = await Promise.all([
        axios.get(`${API_URL}/scm/dashboard`, { headers: { Authorization: `Bearer ${token()}` } }),
        axios.get(`${API_URL}/scm/alerts`, { headers: { Authorization: `Bearer ${token()}` } }),
        axios.get(`${API_URL}/scm/suppliers`, { headers: { Authorization: `Bearer ${token()}` } })
      ]);
      
      setDashboard(dashboardRes.data);
      setAlerts(alertsRes.data);
      setSuppliers(suppliersRes.data);
    } catch (error) {
      console.error('Error fetching SCM data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAlerts = async () => {
    setCheckingAlerts(true);
    try {
      await axios.post(`${API_URL}/scm/check-alerts`, {}, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      await fetchData();
      alert('✅ Alerts checked and emails sent to suppliers!');
    } catch (error) {
      console.error('Error checking alerts:', error);
      alert('Failed to check alerts');
    } finally {
      setCheckingAlerts(false);
    }
  };

  const reorderProduct = async (productId) => {
    try {
      await axios.post(`${API_URL}/scm/reorder`, { productId }, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      alert('📦 Reorder request sent to supplier!');
      fetchData();
    } catch (error) {
      console.error('Error reordering:', error);
      alert('Failed to send reorder request');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading SCM Dashboard...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Supply Chain Management</h1>
          <p className="text-gray-500 mt-1">Monitor inventory, suppliers, and automated reordering</p>
        </div>
        <button
          onClick={checkAlerts}
          disabled={checkingAlerts}
          className="bg-[#4A0E2E] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#6B1D45]"
        >
          <RefreshCw size={18} className={checkingAlerts ? 'animate-spin' : ''} />
          {checkingAlerts ? 'Checking...' : 'Check Stock & Send Alerts'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Low Stock Products</p>
              <p className="text-2xl font-bold text-orange-600">{dashboard?.lowStockCount || 0}</p>
            </div>
            <AlertTriangle size={32} className="text-orange-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">{dashboard?.outOfStockCount || 0}</p>
            </div>
            <Package size={32} className="text-red-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending Alerts</p>
              <p className="text-2xl font-bold text-yellow-600">{dashboard?.pendingAlerts || 0}</p>
            </div>
            <Bell size={32} className="text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Suppliers</p>
              <p className="text-2xl font-bold text-green-600">{suppliers.length}</p>
            </div>
            <Truck size={32} className="text-green-500" />
          </div>
        </div>
      </div>

      {/* Low Stock Products Table with Alert Status */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <AlertTriangle size={20} className="text-orange-500" /> 
            Low Stock Products
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Critical Threshold</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days Left</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alert Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dashboard?.lowStockProducts?.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    ✅ No low stock products. All inventory levels are healthy!
                   </td>
                </tr>
              ) : (
                dashboard?.lowStockProducts?.map(product => {
                  // Check if alert was sent for this product
                  const alertSent = alerts.some(a => a.product?._id === product._id && a.emailSent);
                  return (
                    <tr key={product._id}>
                      <td className="px-6 py-4 font-medium">{product.name}</td>
                      <td className="px-6 py-4">
                        <span className={`font-bold ${product.stockQuantity === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                          {product.stockQuantity}
                        </span>
                       </td>
                      <td className="px-6 py-4">{product.criticalThreshold}</td>
                      <td className="px-6 py-4">{product.supplier || 'Unassigned'}</td>
                      <td className="px-6 py-4">{product.daysLeft !== 'N/A' ? `${product.daysLeft} days` : 'N/A'}</td>
                      <td className="px-6 py-4">
                        {alertSent ? 
                          <span className="text-green-600 flex items-center gap-1">✅ Alert Sent</span> : 
                          <span className="text-yellow-600 flex items-center gap-1">⚠️ Pending</span>
                        }
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => reorderProduct(product._id)}
                          className="bg-[#4A0E2E] text-white px-3 py-1 rounded text-sm hover:bg-[#6B1D45] flex items-center gap-1"
                        >
                          <Send size={14} /> Reorder
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Alerts Section */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Bell size={20} className="text-blue-500" /> 
              Recent Alerts
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Threshold</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alert Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {alerts.slice(0, 10).map(alert => (
                  <tr key={alert._id}>
                    <td className="px-6 py-4 font-medium">{alert.product?.name || 'N/A'}</td>
                    <td className="px-6 py-4">{alert.supplier?.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-orange-600 font-bold">{alert.currentStock}</td>
                    <td className="px-6 py-4">{alert.criticalThreshold}</td>
                    <td className="px-6 py-4">
                      {alert.emailSent ? 
                        <span className="text-green-600 flex items-center gap-1">
                          <CheckCircle size={14} /> Sent at {new Date(alert.emailSentAt).toLocaleTimeString()}
                        </span> : 
                        <span className="text-yellow-600 flex items-center gap-1">
                          <Clock size={14} /> Pending
                        </span>
                      }
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(alert.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SCM Strategies Info */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3"> SCM Strategies Implemented</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={18} className="text-orange-500" />
              <strong>1. Critical Stock Alert System</strong>
            </div>
            <p className="text-sm text-gray-600">Auto-triggers when stock ≤ threshold, sends email to supplier</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Truck size={18} className="text-green-500" />
              <strong>2. Supplier Performance Tracking</strong>
            </div>
            <p className="text-sm text-gray-600">Monitors lead times, on-time delivery, and quality ratings</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={18} className="text-blue-500" />
              <strong>3. Demand Forecasting</strong>
            </div>
            <p className="text-sm text-gray-600">Sales velocity calculation predicts stockout dates</p>
          </div>
        </div>
      </div>
    </div>
  );
}