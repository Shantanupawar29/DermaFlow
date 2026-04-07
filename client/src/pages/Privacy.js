import React from 'react';
import { Shield, Lock, Eye, Server, FileText } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <Shield className="h-12 w-12 text-maroon mx-auto mb-4" />
        <h1 className="text-4xl font-display font-bold">Privacy Policy</h1>
        <p className="text-gray-600 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="bg-white rounded-lg shadow p-8 space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-3">1. Information We Collect</h2>
          <p className="text-gray-600">We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us. This includes:</p>
          <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1">
            <li>Name, email address, phone number</li>
            <li>Shipping and billing addresses</li>
            <li>Payment information (processed securely via Razorpay)</li>
            <li>Skin type and skincare concerns (to personalize recommendations)</li>
            <li>Order history and product preferences</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">2. How We Use Your Information</h2>
          <p className="text-gray-600">We use your information to:</p>
          <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1">
            <li>Process and fulfill your orders</li>
            <li>Send order confirmations and shipping updates</li>
            <li>Personalize product recommendations</li>
            <li>Improve our website and customer service</li>
            <li>Send promotional offers (you can opt out anytime)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">3. Data Security</h2>
          <p className="text-gray-600">We implement industry-standard security measures including:</p>
          <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1">
            <li>SSL/TLS encryption for all data transmission</li>
            <li>Secure payment gateway (Razorpay) - we never store card details</li>
            <li>Regular security audits and updates</li>
            <li>Password hashing using bcrypt</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">4. Cookies & Tracking</h2>
          <p className="text-gray-600">We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. You can disable cookies in your browser settings.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">5. Your Rights</h2>
          <p className="text-gray-600">You have the right to:</p>
          <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1">
            <li>Access your personal data</li>
            <li>Request corrections to your data</li>
            <li>Request deletion of your data</li>
            <li>Opt out of marketing communications</li>
          </ul>
        </section>

        <section className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Contact Us</h2>
          <p className="text-gray-600">If you have questions about this Privacy Policy, contact us at:</p>
          <p className="text-gray-600 mt-2">📧 privacy@dermaflow.com</p>
          <p className="text-gray-600">📞 +91 123-456-7890</p>
        </section>
      </div>
    </div>
  );
}