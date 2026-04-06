import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Truck, Clock, ThumbsUp, ArrowRight, Star } from 'lucide-react';

const Landing = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold mb-6">
                Transform Your Skincare Routine
              </h1>
              <p className="text-xl mb-8 opacity-90">
                Discover premium dermatologist-approved products for radiant, healthy skin. 
                Free shipping on orders over ₹1000.
              </p>
              <div className="flex gap-4">
                <Link to="/products" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition">
                  Shop Now
                </Link>
                <Link to="/register" className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition">
                  Join Now
                </Link>
              </div>
            </div>
            <div className="relative">
              <img 
                src="/api/placeholder/500/400" 
                alt="Skincare products" 
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose DermaFlow?</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-blue-600" size={32} />
              </div>
              <h3 className="font-semibold mb-2">Dermatologist Tested</h3>
              <p className="text-gray-600">Clinically proven ingredients for sensitive skin</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="text-blue-600" size={32} />
              </div>
              <h3 className="font-semibold mb-2">Free Shipping</h3>
              <p className="text-gray-600">On orders above ₹1000</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="text-blue-600" size={32} />
              </div>
              <h3 className="font-semibold mb-2">24/7 Support</h3>
              <p className="text-gray-600">Expert skincare consultation</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ThumbsUp className="text-blue-600" size={32} />
              </div>
              <h3 className="font-semibold mb-2">100% Authentic</h3>
              <p className="text-gray-600">Direct from manufacturers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Best Sellers</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
                <img src={`/api/placeholder/400/300`} alt="Product" className="w-full h-64 object-cover" />
                <div className="p-4">
                  <h3 className="font-semibold text-lg">Hydrating Serum</h3>
                  <p className="text-gray-600 mb-2">Intense hydration for dry skin</p>
                  <div className="flex items-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className="text-yellow-400 fill-current" />
                    ))}
                    <span className="text-sm text-gray-500 ml-2">(128 reviews)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-blue-600">₹1,299</span>
                    <Link to="/products" className="text-blue-600 hover:text-blue-700">Shop Now →</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">Get 15% Off Your First Order</h2>
          <p className="mb-8">Subscribe to our newsletter and receive exclusive offers and skincare tips</p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 px-4 py-3 rounded-lg text-gray-900"
            />
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Landing;