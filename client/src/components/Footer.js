import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-border bg-secondary/50 py-12">
      <div className="container mx-auto grid gap-8 px-4 md:grid-cols-4">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-maroon" />
            <span className="font-display text-lg font-bold">Derma Flow</span>
          </div>
          <p className="text-sm text-muted-foreground">Personalized skincare & haircare backed by dermatological science.</p>
        </div>
        <div>
          <h4 className="mb-3 font-display text-sm font-semibold">Shop</h4>
          <div className="flex flex-col gap-2">
            <Link to="/products" className="text-sm text-muted-foreground hover:text-foreground">All Products</Link>
            <Link to="/quiz" className="text-sm text-muted-foreground hover:text-foreground">AI Diagnostic</Link>
            <Link to="/offers" className="text-sm text-muted-foreground hover:text-foreground">Offers</Link>
          </div>
        </div>
        <div>
          <h4 className="mb-3 font-display text-sm font-semibold">Account</h4>
          <div className="flex flex-col gap-2">
            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">Login</Link>
            <Link to="/register" className="text-sm text-muted-foreground hover:text-foreground">Register</Link>
            <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">Dashboard</Link>
          </div>
        </div>
        <div>
          <h4 className="mb-3 font-display text-sm font-semibold">Support</h4>
          <div className="flex flex-col gap-2">
            <Link to="/help" className="text-sm text-muted-foreground hover:text-foreground">Help Center</Link>
            <span className="text-sm text-muted-foreground">help@dermaflow.com</span>
            <span className="text-sm text-muted-foreground">+91 123-456-7890</span>
          </div>
        </div>
      </div>
      <div className="container mx-auto mt-8 border-t border-border px-4 pt-6 text-center text-xs text-muted-foreground">
        © 2026 Derma Flow. All rights reserved. Dermatologist Recommended.
      </div>
    </footer>
  );
};

export default Footer;