import React, { useState } from 'react';
import { Mail, Phone, MessageCircle, Clock, ChevronDown, ChevronUp, Headphones, FileText, Shield } from 'lucide-react';

const Help = () => {
  const [openFaq, setOpenFaq] = useState(null);
  
  const faqs = [
    {
      q: "How long does shipping take?",
      a: "Standard shipping takes 3-5 business days. Express shipping (1-2 business days) is available at checkout for an additional fee."
    },
    {
      q: "What is your return policy?",
      a: "We offer a 30-day satisfaction guarantee. If you're not happy with your purchase, we'll refund your money - no questions asked."
    },
    {
      q: "Are your products cruelty-free?",
      a: "Yes! All DermaFlow products are certified cruelty-free and never tested on animals."
    },
    {
      q: "How do I track my order?",
      a: "Once your order ships, you'll receive a tracking number via email. You can also track your order from your dashboard."
    },
    {
      q: "Do you offer international shipping?",
      a: "Currently we ship within India only. International shipping coming soon!"
    },
    {
      q: "How do I use the products?",
      a: "Each product comes with detailed instructions. You can also take our AI quiz for personalized routine recommendations."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-display font-bold text-center mb-4">How Can We Help?</h1>
      <p className="text-center text-gray-600 mb-12">We're here to assist you with any questions or concerns</p>

      {/* Contact Options */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-lg shadow text-center border border-cream">
          <div className="bg-maroon/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="text-maroon" size={28} />
          </div>
          <h3 className="font-semibold text-lg mb-2">Email Us</h3>
          <p className="text-gray-500 text-sm mb-3">Response within 24 hours</p>
          <a href="mailto:support@dermaflow.com" className="text-maroon hover:underline">support@dermaflow.com</a>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow text-center border border-cream">
          <div className="bg-maroon/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="text-maroon" size={28} />
          </div>
          <h3 className="font-semibold text-lg mb-2">Call Us</h3>
          <p className="text-gray-500 text-sm mb-3">Mon-Sat, 10 AM - 7 PM</p>
          <a href="tel:+911234567890" className="text-maroon hover:underline">+91 123-456-7890</a>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow text-center border border-cream">
          <div className="bg-maroon/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="text-maroon" size={28} />
          </div>
          <h3 className="font-semibold text-lg mb-2">Live Chat</h3>
          <p className="text-gray-500 text-sm mb-3">Available 24/7</p>
          <button className="text-maroon hover:underline">Start Chat →</button>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-2xl font-display font-bold mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border border-cream rounded-lg overflow-hidden">
              <button
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-cream/30 transition"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              >
                <span className="font-semibold">{faq.q}</span>
                {openFaq === idx ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {openFaq === idx && (
                <div className="px-6 py-4 bg-cream/20 border-t border-cream">
                  <p className="text-gray-600">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-display font-bold mb-6">Still Need Help?</h2>
        <form className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <input type="text" placeholder="Your Name" className="w-full px-4 py-2 border border-cream-dark rounded-lg focus:outline-none focus:border-maroon" />
            <input type="email" placeholder="Your Email" className="w-full px-4 py-2 border border-cream-dark rounded-lg focus:outline-none focus:border-maroon" />
          </div>
          <input type="text" placeholder="Order Number (optional)" className="w-full px-4 py-2 border border-cream-dark rounded-lg focus:outline-none focus:border-maroon" />
          <textarea rows="5" placeholder="How can we help you?" className="w-full px-4 py-2 border border-cream-dark rounded-lg focus:outline-none focus:border-maroon"></textarea>
          <button className="bg-maroon text-white px-6 py-3 rounded-lg font-semibold hover:bg-maroon-light transition">
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default Help;