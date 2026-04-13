import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Shield, Leaf, Star, Truck, Clock, Heart, Timer, Tag, Zap, Bell, ChevronLeft, ChevronRight, Circle, CircleDot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "../components/ProductCard";
import { useProducts } from "../hooks/useProducts";
import api from '../services/api';
import heroBanner from "../assets/hero-banner.png";

// Sale Timer Component (Individual Sale Slide)
const SaleSlide = ({ sale, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState({});
  const [isExpired, setIsExpired] = useState(false);

  const now = new Date();
  const hasStarted = new Date(sale.startDate) <= now;
  const targetDate = hasStarted ? sale.endDate : sale.startDate;
  const label = hasStarted ? 'Sale Ends In' : 'Sale Starts In';
  const discountText = sale.discountType === 'percent'
    ? `${sale.discountValue}% OFF`
    : `₹${sale.discountValue} FLAT`;

  useEffect(() => {
    const calculate = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setIsExpired(true);
        onExpire?.();
        return;
      }
      setTimeLeft({
        days:    Math.floor(diff / 86400000),
        hours:   Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    calculate();
    const t = setInterval(calculate, 1000);
    return () => clearInterval(t);
  }, [targetDate]);

  if (isExpired) return null;

  return (
    <div className="bg-gradient-to-r from-maroon to-rose-700 text-white rounded-xl p-4 md:p-6 shadow-lg w-full">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="bg-white/20 rounded-full p-3 flex-shrink-0">
            <Zap size={28} className="text-gold" />
          </div>
          <div>
            <h3 className="font-bold text-lg md:text-xl flex items-center gap-2">
              <Tag size={18} /> {sale.name}
            </h3>
            <p className="text-sm text-white/80">
              {hasStarted
                ? sale.description || `Get ${discountText} on selected products`
                : <span className="flex items-center gap-1"><Clock size={14} /> Upcoming — Get ${discountText} soon!</span>}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-white/70 font-bold">
            {label}
          </span>
          <div className="flex gap-2 md:gap-4">
            {['days', 'hours', 'minutes', 'seconds'].map(unit => (
              <div key={unit} className="text-center bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg px-2 py-1 md:px-4 md:py-2 min-w-[55px] md:min-w-[70px]">
                <div className="text-xl md:text-2xl font-black">
                  {String(timeLeft[unit] ?? 0).padStart(2, '0')}
                </div>
                <div className="text-[10px] uppercase tracking-tighter opacity-70">{unit}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full lg:w-auto flex justify-center">
          {hasStarted
            ? <Link to="/products" className="bg-gold text-maroon px-8 py-3 rounded-lg font-bold hover:bg-white transition-all duration-300 whitespace-nowrap flex items-center gap-2 shadow-md hover:shadow-xl">
                Shop Sale <ArrowRight size={18} />
              </Link>
            : <div className="bg-white/20 text-white px-8 py-3 rounded-lg font-bold text-sm text-center flex items-center gap-2 border border-white/30">
                <Bell size={18} /> Notify Me
              </div>
          }
        </div>
      </div>
    </div>
  );
};

// Sale Carousel Component
const SaleCarousel = ({ sales, onSaleExpired }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  if (!sales || sales.length === 0) return null;

  const nextSale = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % sales.length);
  };

  const prevSale = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + sales.length) % sales.length);
  };

  const goToSale = (index) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction > 0 ? -50 : 50,
      opacity: 0,
    }),
  };

  return (
    <div className="relative group">
      {/* Carousel Container with Fixed Min-Height to prevent layout shift */}
      <div className="overflow-hidden min-h-[280px] sm:min-h-[220px] lg:min-h-[140px] flex items-center">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 400, damping: 40 },
              opacity: { duration: 0.2 },
            }}
            className="w-full"
          >
            <SaleSlide 
              sale={sales[currentIndex]} 
              onExpire={() => onSaleExpired(sales[currentIndex]._id)} 
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      {sales.length > 1 && (
        <>
          <button
            onClick={prevSale}
            className="absolute -left-2 md:-left-5 top-1/2 -translate-y-1/2 bg-maroon text-white hover:bg-gold hover:text-maroon shadow-lg rounded-full p-2 md:p-3 transition-all duration-300 z-20 opacity-0 group-hover:opacity-100"
            aria-label="Previous sale"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={nextSale}
            className="absolute -right-2 md:-right-5 top-1/2 -translate-y-1/2 bg-maroon text-white hover:bg-gold hover:text-maroon shadow-lg rounded-full p-2 md:p-3 transition-all duration-300 z-20 opacity-0 group-hover:opacity-100"
            aria-label="Next sale"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {sales.length > 1 && (
        <div className="flex justify-center gap-3 mt-4">
          {sales.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSale(index)}
              className="transition-all duration-300 p-1"
              aria-label={`Go to sale ${index + 1}`}
            >
              {index === currentIndex ? (
                <div className="w-6 h-2 bg-gold rounded-full" />
              ) : (
                <div className="w-2 h-2 bg-gray-300 hover:bg-maroon/40 rounded-full" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default function Home() {
  const { products, loading } = useProducts();
  const [activeSales, setActiveSales] = useState([]);
  const [saleLoading, setSaleLoading] = useState(true);
  const featuredProducts = products?.slice(0, 4) || [];

  const fetchSales = async () => {
    try {
      setSaleLoading(true);
      let sales = [];
      try {
        const upcomingResponse = await api.get('/sales/upcoming');
        sales = upcomingResponse.data || [];
      } catch (error) {
        const response = await api.get('/sales');
        sales = response.data || [];
      }
      
      const now = new Date();
      const validSales = sales.filter(sale => {
        const endDate = new Date(sale.endDate);
        return endDate > now;
      });
      
      setActiveSales(validSales);
    } catch (error) {
      console.error('Error fetching sales:', error);
      setActiveSales([]);
    } finally {
      setSaleLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleSaleExpired = (saleId) => {
    setActiveSales(prev => prev.filter(sale => sale._id !== saleId));
    fetchSales();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-pulse text-maroon">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-cream/30 min-h-screen">
      {/* Sale Carousel Container */}
      {!saleLoading && activeSales.length > 0 && (
        <div className="container mx-auto px-4 pt-8">
          <SaleCarousel sales={activeSales} onSaleExpired={handleSaleExpired} />
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-light rounded-full opacity-20 blur-3xl"></div>
        <div className="container mx-auto grid min-h-[70vh] items-center gap-8 px-4 py-16 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-maroon">Dermatologist Recommended</p>
            <h1 className="font-display text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl">
              Find Your<br />
              <span className="text-gradient">Perfect Routine</span>
            </h1>
            <p className="mt-4 max-w-md text-lg text-muted-foreground">
              Clinically-backed skincare & haircare personalized to your unique needs. 
              Take our AI diagnostic quiz and discover your ideal routine.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/quiz" className="bg-maroon text-white px-6 py-3 rounded-lg hover:bg-maroon-light transition duration-200 flex items-center shadow-lg">
                <Sparkles className="mr-2 h-4 w-4" /> Take a Quiz
              </Link>
              <Link to="/products" className="border-2 border-maroon text-maroon px-6 py-3 rounded-lg hover:bg-maroon hover:text-white transition duration-200 flex items-center">
                Shop All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="hidden md:block relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={heroBanner} alt="Derma Flow skincare collection"
                className="w-full h-auto object-cover"
              />
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Star className="text-gold fill-current" size={16} />
                  <span className="text-sm font-semibold">4.9/5 from 10,000+ reviews</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-y border-cream-dark bg-white py-8">
        <div className="container mx-auto flex flex-wrap items-center justify-center gap-8 px-4 text-center md:gap-16">
          {[
            { icon: Shield, text: "Dermatologist Tested" },
            { icon: Leaf, text: "Clean Ingredients" },
            { icon: Sparkles, text: "Personalized Routines" },
            { icon: Truck, text: "Free Shipping on ₹1000+" },
            { icon: Clock, text: "24/7 Expert Support" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Icon className="h-5 w-5 text-maroon" />
              {text}
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">Bestsellers</h2>
            <p className="mt-2 text-muted-foreground">Our most loved formulas, backed by science</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product._id || product.id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link to="/products" className="border-2 border-maroon text-maroon px-10 py-3 rounded-lg hover:bg-maroon hover:text-white transition duration-300 inline-flex items-center font-semibold">
              View All Products <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-cream/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">Why Choose DermaFlow?</h2>
            <p className="mt-2 text-muted-foreground">Experience the difference of science-backed skincare</p>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="text-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="bg-maroon/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="text-maroon" size={40} />
              </div>
              <h3 className="font-bold text-xl mb-3">Dermatologist Tested</h3>
              <p className="text-gray-600 leading-relaxed">Clinically proven ingredients for sensitive skin, approved by industry experts</p>
            </div>
            <div className="text-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="bg-maroon/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Leaf className="text-maroon" size={40} />
              </div>
              <h3 className="font-bold text-xl mb-3">Clean Ingredients</h3>
              <p className="text-gray-600 leading-relaxed">No parabens, sulfates, or harsh chemicals. 100% transparent formulations</p>
            </div>
            <div className="text-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="bg-maroon/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="text-maroon" size={40} />
              </div>
              <h3 className="font-bold text-xl mb-3">Cruelty-Free</h3>
              <p className="text-gray-600 leading-relaxed">Never tested on animals. PETA certified with various vegan-friendly options</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-maroon py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <Sparkles className="absolute top-10 left-10 text-white" size={100} />
          <Sparkles className="absolute bottom-10 right-10 text-white" size={150} />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-6">Not Sure Where to Start?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-cream/90 text-lg md:text-xl">
            Our AI-powered diagnostic quiz analyzes your skin type, hair concerns, 
            and sensitivities to build a routine just for you.
          </p>
          <Link to="/quiz" className="inline-flex items-center bg-gold text-maroon px-10 py-4 rounded-xl font-bold hover:bg-white transition-all duration-300 mt-10 shadow-2xl scale-105 hover:scale-110">
            <Sparkles className="mr-2 h-5 w-5" /> Start Your Free Diagnostic
          </Link>
        </div>
      </section>
    </div>
  );
}