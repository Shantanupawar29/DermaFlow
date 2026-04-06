import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle, Package, Mail, Printer } from 'lucide-react';
import axios from 'axios';

const OrderConfirmation = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/orders/${id}`);
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-16">Loading order details...</div>;
  }

  if (!order) {
    return <div className="text-center py-16">Order not found</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-display font-bold text-foreground">Order Confirmed!</h1>
        <p className="text-gray-600 mt-2">Thank you for your purchase</p>
        <p className="text-sm text-gray-500 mt-1">Order #{order.orderNumber}</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Order Details</h3>
            <p className="text-sm text-gray-600">Order Date: {new Date(order.orderDate).toLocaleString()}</p>
            <p className="text-sm text-gray-600">Payment Method: {order.paymentMethod}</p>
            <p className="text-sm text-gray-600">Payment Status: {order.paymentStatus}</p>
            <p className="text-sm text-gray-600">Invoice: {order.invoiceNumber}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Shipping Address</h3>
            <p className="text-sm text-gray-600">{order.shippingAddress.street}</p>
            <p className="text-sm text-gray-600">{order.shippingAddress.city}, {order.shippingAddress.state}</p>
            <p className="text-sm text-gray-600">{order.shippingAddress.zipCode}</p>
          </div>
        </div>
      </div>

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
                <td className="px-6 py-4 text-sm text-right">₹{item.price}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan="2" className="px-6 py-3 text-right font-semibold">Total:</td>
              <td className="px-6 py-3 text-right font-bold text-maroon">₹{order.grandTotal}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="flex gap-4 justify-center">
        <Link to="/products" className="bg-maroon text-white px-6 py-2 rounded-lg hover:bg-maroon-light">
          Continue Shopping
        </Link>
        <button onClick={() => window.print()} className="border border-maroon text-maroon px-6 py-2 rounded-lg hover:bg-maroon hover:text-white transition">
          <Printer size={18} className="inline mr-2" /> Print Invoice
        </button>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          A confirmation email has been sent to your registered email address.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 text-sm text-gray-500">
          <Mail size={16} />
          <span>Need help? Contact support@dermaflow.com</span>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;