import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle, Package, Mail, Printer, Download, FileText, ShoppingBag } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const OrderConfirmation = () => {
  const { id } = useParams();
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
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-maroon">Loading order details...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold">Order Not Found</h1>
        <p className="text-gray-500 mt-2">We couldn't find your order details.</p>
        <Link to="/products" className="inline-block mt-6 bg-maroon text-white px-6 py-2 rounded-lg">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Success Message */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-display font-bold text-gray-800">Order Confirmed!</h1>
        <p className="text-gray-600 mt-2">Thank you for your purchase</p>
        <p className="text-sm text-gray-500 mt-1">Order #{order.orderNumber}</p>
      </div>

      {/* Order Details */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Order Details</h3>
            <p className="text-sm text-gray-600">Order Date: {new Date(order.orderDate).toLocaleString()}</p>
            <p className="text-sm text-gray-600">Payment Method: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
            <p className="text-sm text-gray-600">Payment Status: <span className="capitalize">{order.paymentStatus}</span></p>
            <p className="text-sm text-gray-600">Invoice: {order.invoiceNumber}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Shipping Address</h3>
            <p className="text-sm text-gray-600">{order.shippingAddress?.street}</p>
            <p className="text-sm text-gray-600">{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
            <p className="text-sm text-gray-600">{order.shippingAddress?.zipCode}</p>
            <p className="text-sm text-gray-600">Phone: {order.phone}</p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Quantity</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {order.items.map((item, idx) => (
              <tr key={idx}>
                <td className="px-6 py-4 text-sm">{item.name}</td>
                <td className="px-6 py-4 text-sm text-center">{item.quantity}</td>
                <td className="px-6 py-4 text-sm text-right">₹{item.price.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan="2" className="px-6 py-3 text-right font-semibold">Subtotal:</td>
              <td className="px-6 py-3 text-right">₹{order.totalAmount?.toFixed(2)}</td>
            </tr>
            <tr>
              <td colSpan="2" className="px-6 py-3 text-right font-semibold">Tax (18% GST):</td>
              <td className="px-6 py-3 text-right">₹{order.taxAmount?.toFixed(2)}</td>
            </tr>
            <tr>
              <td colSpan="2" className="px-6 py-3 text-right font-semibold">Shipping:</td>
              <td className="px-6 py-3 text-right">{order.shippingAmount === 0 ? 'Free' : `₹${order.shippingAmount?.toFixed(2)}`}</td>
            </tr>
            <tr className="border-t border-gray-200">
              <td colSpan="2" className="px-6 py-3 text-right font-bold text-lg">Grand Total:</td>
              <td className="px-6 py-3 text-right font-bold text-maroon text-lg">₹{order.grandTotal?.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Link to="/products" className="bg-maroon text-white px-6 py-2 rounded-lg hover:bg-maroon-light transition flex items-center gap-2">
          <ShoppingBag size={18} /> Continue Shopping
        </Link>
        <Link to={`/invoice/${order._id}`} className="border border-maroon text-maroon px-6 py-2 rounded-lg hover:bg-maroon hover:text-white transition flex items-center gap-2">
          <FileText size={18} /> View Invoice
        </Link>
        <button onClick={handlePrint} className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
          <Printer size={18} /> Print
        </button>
      </div>

      {/* Email Notification */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-2 text-sm text-gray-500">
          <Mail size={16} />
          <span>A confirmation email has been sent to your registered email address.</span>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Need help? Contact us at <a href="mailto:support@dermaflow.com" className="text-maroon">support@dermaflow.com</a>
        </p>
      </div>
    </div>
  );
};

export default OrderConfirmation;