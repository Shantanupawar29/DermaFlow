import React from 'react';
import { RotateCcw, Package, Clock, CreditCard, Mail } from 'lucide-react';

export default function Returns() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <RotateCcw className="h-12 w-12 text-maroon mx-auto mb-4" />
        <h1 className="text-4xl font-display font-bold">Return & Refund Policy</h1>
        <p className="text-gray-600 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="bg-white rounded-lg shadow p-8 space-y-6">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <Package className="h-8 w-8 text-maroon mx-auto mb-2" />
            <h3 className="font-semibold">30-Day Returns</h3>
            <p className="text-sm text-gray-600">Return within 30 days</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <Clock className="h-8 w-8 text-maroon mx-auto mb-2" />
            <h3 className="font-semibold">Quick Processing</h3>
            <p className="text-sm text-gray-600">7-10 business days</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <CreditCard className="h-8 w-8 text-maroon mx-auto mb-2" />
            <h3 className="font-semibold">Full Refund</h3>
            <p className="text-sm text-gray-600">Money-back guarantee</p>
          </div>
        </div>

        <section>
          <h2 className="text-2xl font-semibold mb-3">How to Return an Item</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-600">
            <li>Contact our support team at returns@dermaflow.com with your order number</li>
            <li>Explain the reason for return</li>
            <li>We'll provide you with return instructions</li>
            <li>Pack the item securely in original packaging</li>
            <li>Ship the item back to our warehouse</li>
            <li>Once received, we'll process your refund within 7-10 business days</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Return Conditions</h2>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li>Items must be unused and in original condition</li>
            <li>Original tags and packaging must be intact</li>
            <li>Return shipping costs are customer's responsibility unless item is defective</li>
            <li>Sale items are final sale (unless defective)</li>
          </ul>
        </section>

        <section className="bg-green-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Need Help?</h2>
          <p className="text-gray-600">Contact our customer service team:</p>
          <p className="text-gray-600 mt-2"><Mail className="inline mr-2 h-4 w-4" /> returns@dermaflow.com</p>
          <p className="text-gray-600">📞 +91 123-456-7890 (Mon-Sat, 10 AM - 7 PM)</p>
        </section>
      </div>
    </div>
  );
}