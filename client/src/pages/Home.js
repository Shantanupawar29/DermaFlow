import React from 'react';
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Shield, Leaf, Star, Truck, Clock, Heart } from "lucide-react";
import { motion } from "framer-motion";
import ProductCard from "../components/ProductCard";
import { useProducts } from "../hooks/useProducts";
import heroBanner from "../assets/hero-banner.png";
export default function Home() {
  const { products, loading } = useProducts();
  const featuredProducts = products?.slice(0, 4) || [];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-pulse text-maroon">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-cream">
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
              <Link to="/quiz" className="bg-maroon text-white px-6 py-3 rounded-lg hover:bg-maroon-light transition duration-200 flex items-center">
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
            <div className="relative rounded-lg overflow-hidden shadow-2xl">
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
      <section className="border-b border-cream-dark bg-white py-6">
        <div className="container mx-auto flex flex-wrap items-center justify-center gap-8 px-4 text-center md:gap-16">
          {[
            { icon: Shield, text: "Dermatologist Tested" },
            { icon: Leaf, text: "Clean Ingredients" },
            { icon: Sparkles, text: "Personalized Routines" },
            { icon: Truck, text: "Free Shipping on ₹1000+" },
            { icon: Clock, text: "24/7 Expert Support" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Icon className="h-4 w-4 text-maroon" />
              {text}
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="font-display text-3xl font-bold text-foreground">Bestsellers</h2>
            <p className="mt-2 text-muted-foreground">Our most loved formulas, backed by science</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link to="/products" className="border-2 border-maroon text-maroon px-8 py-3 rounded-lg hover:bg-maroon hover:text-white transition duration-200 inline-flex items-center">
              View All Products <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-cream">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-foreground">Why Choose DermaFlow?</h2>
            <p className="mt-2 text-muted-foreground">Experience the difference of science-backed skincare</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition">
              <div className="bg-maroon/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-maroon" size={32} />
              </div>
              <h3 className="font-semibold text-xl mb-2">Dermatologist Tested</h3>
              <p className="text-gray-600">Clinically proven ingredients for sensitive skin, approved by experts</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition">
              <div className="bg-maroon/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="text-maroon" size={32} />
              </div>
              <h3 className="font-semibold text-xl mb-2">Clean Ingredients</h3>
              <p className="text-gray-600">No parabens, sulfates, or harsh chemicals. 100% transparent</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition">
              <div className="bg-maroon/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="text-maroon" size={32} />
              </div>
              <h3 className="font-semibold text-xl mb-2">Cruelty-Free</h3>
              <p className="text-gray-600">Never tested on animals. PETA certified and vegan options</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-maroon py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-bold text-white">Not Sure Where to Start?</h2>
          <p className="mx-auto mt-3 max-w-lg text-cream">
            Our AI-powered diagnostic quiz analyzes your skin type, hair concerns, 
            and sensitivities to build a routine just for you.
          </p>
          <Link to="/quiz" className="inline-flex items-center bg-gold text-maroon px-8 py-3 rounded-lg font-semibold hover:bg-gold/90 transition mt-8">
            <Sparkles className="mr-2 h-4 w-4" /> Start Your Free Diagnostic
          </Link>
        </div>
      </section>
    </div>
  );
}