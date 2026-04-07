import React from 'react';
import { FileText, Scale, CreditCard, Truck, AlertCircle } from 'lucide-react';

export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <FileText className="h-12 w-12 text-maroon mx-auto mb-4" />
        <h1 className="text-4xl font-display font-bold">Terms of Service</h1>
        <p className="text-gray-600 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="bg-white rounded-lg shadow p-8 space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
          <p className="text-gray-600">By accessing or using DermaFlow's website, you agree to be bound by these Terms of Service and our Privacy Policy.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">2. Account Registration</h2>
          <p className="text-gray-600">To place orders, you must create an account. You are responsible for:</p>
          <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1">
            <li>Providing accurate and complete information</li>
            <li>Maintaining the security of your password</li>
            <li>All activities that occur under your account</li>
            <li>Notifying us immediately of any unauthorized use</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">3. Products & Pricing</h2>
          <p className="text-gray-600">All product descriptions, prices, and availability are subject to change without notice. We reserve the right to:</p>
          <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1">
            <li>Modify or discontinue any product</li>
            <li>Correct pricing errors</li>
            <li>Limit quantities of purchases</li>
            <li>Refuse or cancel orders</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">4. Payment Terms</h2>
          <p className="text-gray-600">We accept payments via Razorpay (credit/debit cards, UPI, net banking) and Cash on Delivery. All payments are processed securely.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">5. Shipping & Delivery</h2>
          <p className="text-gray-600">Estimated delivery times are provided at checkout. We are not responsible for delays caused by:</p>
          <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1">
            <li>Incorrect shipping addresses</li>
            <li>Weather conditions or natural disasters</li>
            <li>Courier service delays</li>
            <li>Customs clearance (for international orders)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">6. Return & Refund Policy</h2>
          <p className="text-gray-600">We offer a 30-day satisfaction guarantee. To be eligible for a return:</p>
          <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1">
            <li>Product must be unused and in original packaging</li>
            <li>Return request must be made within 30 days</li>
            <li>Customer pays return shipping unless product is defective</li>
            <li>Refunds processed within 7-10 business days</li>
          </ul>
        </section>

        <section className="bg-yellow-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2"><AlertCircle size={20} /> Limitation of Liability</h2>
          <p className="text-gray-600">DermaFlow shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or website.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">7. Contact Information</h2>
          <p className="text-gray-600">For questions about these Terms, contact us at:</p>
          <p className="text-gray-600 mt-2">📧 legal@dermaflow.com</p>
          <p className="text-gray-600">📞 +91 123-456-7890</p>
        </section>
      </div>
    </div>
  );
}