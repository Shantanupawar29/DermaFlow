import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Menu, X, Sparkles, Shield, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
const { cartCount: cartTotal } = useCart();
  const { isAuthenticated, user, logout, glowPoints } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  
  // Check if user is admin (you can add role check)
  const isAdmin = user?.role === 'admin';

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${searchQuery}`);
      setSearchQuery('');
      setMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-maroon" />
          <span className="font-display text-xl font-bold text-foreground">Derma Flow</span>
        </Link>

        {/* Desktop Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-cream-dark rounded-lg focus:outline-none focus:border-maroon"
              />
              <button type="submit" className="absolute right-3 top-2.5">
                <Search size={18} className="text-gray-400" />
              </button>
            </div>
          </form>
        </div>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-8 md:flex">
          <Link to="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Home</Link>
          <Link to="/quiz" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Quiz</Link>
          <Link to="/products" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Products</Link>
          <Link to="/offers" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Offers</Link>
          <Link to="/about" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">About</Link>
          {isAuthenticated && (
            <Link to="/dashboard" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Dashboard</Link>
          )}
          {isAdmin && (
            <Link to="/admin" className="flex items-center gap-1 text-sm font-medium text-maroon transition-colors hover:text-maroon/80">
              <Shield className="h-3.5 w-3.5" />Admin
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated && user && (
            <span className="hidden items-center gap-1 text-sm font-medium text-maroon md:flex">
              <Sparkles className="h-3.5 w-3.5" />
              {glowPoints || 0} pts
            </span>
          )}
          <Link to="/cart" className="relative">
            <ShoppingBag className="h-5 w-5 text-foreground" />
            {cartTotal > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-maroon text-[10px] font-bold text-white">
                {cartTotal}
              </span>
            )}
          </Link>
          {isAuthenticated ? (
            <button onClick={handleLogout} className="text-foreground">
              <User className="h-5 w-5" />
            </button>
          ) : (
            <Link to="/login">
              <User className="h-5 w-5 text-foreground" />
            </Link>
          )}
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border md:hidden"
          >
            <div className="flex flex-col gap-4 p-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="mb-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-cream-dark rounded-lg focus:outline-none focus:border-maroon"
                  />
                  <button type="submit" className="absolute right-3 top-2.5">
                    <Search size={18} className="text-gray-400" />
                  </button>
                </div>
              </form>
              <Link to="/" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-foreground">Home</Link>
              <Link to="/quiz" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-foreground">AI Quiz</Link>
              <Link to="/products" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-foreground">Products</Link>
              <Link to="/offers" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-foreground">Offers</Link>
              <Link to="/about" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-foreground">About</Link>
              {isAuthenticated && (
                <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-foreground">Dashboard</Link>
              )}
              {isAdmin && (
                <Link to="/admin" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-maroon flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5" />Admin Panel
                </Link>
              )}
              {isAuthenticated && (
                <button onClick={handleLogout} className="text-sm font-medium text-red-600 text-left">
                  Logout
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;