import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Plus, Edit, Trash2, Star, Truck, Package, Mail, Phone } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';
const token = () => localStorage.getItem('token');

export default function SellerManagement() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', company: '', gstNumber: '',
    address: { street: '', city: '', state: '', zipCode: '' },
    categories: []
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(`${API_URL}/scm/suppliers`, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      setSuppliers(response.data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSupplier) {
        await axios.put(`${API_URL}/scm/suppliers/${editingSupplier._id}`, formData, {
          headers: { Authorization: `Bearer ${token()}` }
        });
      } else {
        await axios.post(`${API_URL}/scm/suppliers/register`, formData, {
          headers: { Authorization: `Bearer ${token()}` }
        });
      }
      fetchSuppliers();
      setShowModal(false);
      setEditingSupplier(null);
      setFormData({ name: '', email: '', password: '', phone: '', company: '', gstNumber: '', address: { street: '', city: '', state: '', zipCode: '' }, categories: [] });
    } catch (error) {
      console.error('Error saving supplier:', error);
      alert('Failed to save supplier');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading sellers...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Seller Management</h1>
          <p className="text-gray-500 mt-1">Manage suppliers and their performance</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#4A0E2E] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#6B1D45]"
        >
          <Plus size={18} /> Add New Seller
        </button>
      </div>

      {/* Suppliers Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map(supplier => (
          <div key={supplier._id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#4A0E2E]/10 rounded-full flex items-center justify-center">
                  <Users size={24} className="text-[#4A0E2E]" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{supplier.name}</h3>
                  <p className="text-sm text-gray-500">{supplier.company}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditingSupplier(supplier); setFormData(supplier); setShowModal(true); }} className="text-blue-500 hover:text-blue-700">
                  <Edit size={16} />
                </button>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail size={14} /> {supplier.email}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone size={14} /> {supplier.phone}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Package size={14} /> Categories: {supplier.categories?.join(', ') || 'All'}
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t flex justify-between items-center">
              <div className="flex items-center gap-1">
                <Star size={14} className="text-yellow-500 fill-current" />
                <span className="text-sm font-medium">{supplier.rating || 0}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Truck size={14} /> {supplier.totalOrders || 0} orders
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${supplier.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {supplier.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-4">{editingSupplier ? 'Edit Seller' : 'Add New Seller'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Name" required className="w-full border rounded p-2"
                value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              <input type="email" placeholder="Email" required className="w-full border rounded p-2"
                value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              {!editingSupplier && (
                <input type="password" placeholder="Password" required className="w-full border rounded p-2"
                  value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
              )}
              <input type="tel" placeholder="Phone" required className="w-full border rounded p-2"
                value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              <input type="text" placeholder="Company Name" required className="w-full border rounded p-2"
                value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} />
              <input type="text" placeholder="GST Number" className="w-full border rounded p-2"
                value={formData.gstNumber} onChange={(e) => setFormData({...formData, gstNumber: e.target.value})} />
              <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="Street" className="border rounded p-2"
                  value={formData.address.street} onChange={(e) => setFormData({...formData, address: {...formData.address, street: e.target.value}})} />
                <input type="text" placeholder="City" className="border rounded p-2"
                  value={formData.address.city} onChange={(e) => setFormData({...formData, address: {...formData.address, city: e.target.value}})} />
                <input type="text" placeholder="State" className="border rounded p-2"
                  value={formData.address.state} onChange={(e) => setFormData({...formData, address: {...formData.address, state: e.target.value}})} />
                <input type="text" placeholder="ZIP Code" className="border rounded p-2"
                  value={formData.address.zipCode} onChange={(e) => setFormData({...formData, address: {...formData.address, zipCode: e.target.value}})} />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-[#4A0E2E] text-white py-2 rounded-lg hover:bg-[#6B1D45]">
                  {editingSupplier ? 'Update' : 'Create'} Seller
                </button>
                <button type="button" onClick={() => { setShowModal(false); setEditingSupplier(null); }} className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}