import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Printer, Download, ArrowLeft, Sparkles } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

export default function Invoice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => window.print();

  if (loading) {
    return <div className="text-center py-16">Loading invoice...</div>;
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold">Order Not Found</h1>
        <Link to="/dashboard" className="text-[#4A0E2E] mt-4 inline-block">Go to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="no-print mb-6 flex gap-3">
        <button onClick={() => navigate(-1)} className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2">
          <ArrowLeft size={18} /> Back
        </button>
        <div className="flex-1" />
        <button onClick={handlePrint} className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2">
          <Printer size={18} /> Print
        </button>
        <button onClick={handlePrint} className="bg-[#4A0E2E] text-white px-4 py-2 rounded-lg hover:bg-[#6B1D45] flex items-center gap-2">
          <Download size={18} /> Download PDF
        </button>
      </div>

      {/* Invoice */}
      <div className="bg-white rounded-lg shadow-lg p-8 print:shadow-none">
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-6 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-[#4A0E2E]" />
              <h1 className="text-2xl font-bold text-[#4A0E2E]">DERMA FLOW</h1>
            </div>
            <p className="text-sm text-gray-500 mt-1">Premium Skincare & Haircare</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold">INVOICE</h2>
            <p className="text-sm text-gray-500">#{order.invoiceNumber || order.orderNumber}</p>
            <p className="text-sm text-gray-500">{new Date(order.orderDate).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Bill To</p>
            <p className="font-semibold mt-1">{order.user?.name || 'Customer'}</p>
            <p className="text-sm text-gray-500">{order.user?.email}</p>
            <p className="text-sm text-gray-500">{order.phone}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Ship To</p>
            <p className="text-sm mt-1">{order.shippingAddress?.street}</p>
            <p className="text-sm">{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
            <p className="text-sm">{order.shippingAddress?.zipCode}</p>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-6">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold">#</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">Product</th>
              <th className="px-4 py-2 text-center text-sm font-semibold">Qty</th>
              <th className="px-4 py-2 text-right text-sm font-semibold">Price</th>
              <th className="px-4 py-2 text-right text-sm font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, idx) => (
              <tr key={idx} className="border-b">
                <td className="px-4 py-2 text-sm">{idx + 1}</td>
                <td className="px-4 py-2 text-sm">{item.name}</td>
                <td className="px-4 py-2 text-sm text-center">{item.quantity}</td>
                <td className="px-4 py-2 text-sm text-right">₹{item.price.toFixed(2)}</td>
                <td className="px-4 py-2 text-sm text-right">₹{(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{order.totalAmount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (18% GST):</span>
              <span>₹{order.taxAmount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span>{order.shippingAmount === 0 ? 'Free' : `₹${order.shippingAmount?.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Grand Total:</span>
              <span className="text-[#4A0E2E]">₹{order.grandTotal?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t text-center">
          <p className="font-semibold text-[#4A0E2E]">Thank you for choosing Derma Flow! ✨</p>
          <p className="text-xs text-gray-500 mt-1">Questions? support@dermaflow.com</p>
        </div>
      </div>
    </div>
  );
}