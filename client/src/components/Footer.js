import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, FileText, Shield, Star, MessageCircle, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#4A0E2E] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-6 w-6" />
              <span className="font-display text-xl font-bold">Derma Flow</span>
            </div>
            <p className="text-sm text-cream/80">Personalized skincare & haircare backed by dermatological science.</p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-cream/80">
              <li><Link to="/products" className="hover:text-gold transition">Shop All</Link></li>
              <li><Link to="/quiz" className="hover:text-gold transition">AI Skin Quiz</Link></li>
              <li><Link to="/offers" className="hover:text-gold transition">Offers & Coupons</Link></li>
              <li><Link to="/about" className="hover:text-gold transition">About Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Support & Legal</h4>
            <ul className="space-y-2 text-sm text-cream/80">
              <li><Link to="/help" className="hover:text-gold transition">Help Center</Link></li>
              <li><Link to="/reviews" className="hover:text-gold transition">Customer Reviews</Link></li>
              <li><Link to="/feedback" className="hover:text-gold transition">Feedback & Complaints</Link></li>
              <li><Link to="/terms" className="hover:text-gold transition">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-gold transition">Privacy Policy</Link></li>
              <li><Link to="/returns" className="hover:text-gold transition">Return Policy</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-cream/80">
              <li>📧 support@dermaflow.com</li>
              <li>📞 +91 123-456-7890</li>
              <li>📍 Mumbai, India</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-cream/20 mt-8 pt-8 text-center text-sm text-cream/60">
          <p>&copy; 2024 DermaFlow. All rights reserved. Your skin deserves the best.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;