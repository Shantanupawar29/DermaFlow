import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/price';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
      <Link to={`/product/${product._id || product.id}`}>
        <div className="relative overflow-hidden">
          <img 
            src={product.images?.[0] || '/api/placeholder/300/300'} 
            alt={product.name}
            className="w-full h-64 object-cover group-hover:scale-105 transition duration-300"
          />
          {product.discountPercentage > 0 && (
            <div className="absolute top-2 right-2 bg-maroon text-white px-2 py-1 rounded text-xs font-semibold">
              {product.discountPercentage}% OFF
            </div>
          )}
        </div>
      </Link>
      <div className="p-4">
        <Link to={`/product/${product._id || product.id}`}>
          <h3 className="font-semibold text-lg text-gray-800 hover:text-maroon transition">
            {product.name}
          </h3>
        </Link>
        <p className="text-gray-600 text-sm mt-1 line-clamp-2">{product.description}</p>
        
        {/* Rating */}
        <div className="flex items-center mt-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={14} 
                className={`${i < (product.rating || 4.5) ? 'text-gold fill-current' : 'text-gray-300'}`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-2">({product.numReviews || 128})</span>
        </div>

        <div className="flex justify-between items-center mt-3">
          <div>
            <span className="text-2xl font-bold text-maroon">{formatPrice(product.price)}</span>
            {product.oldPrice && (
              <span className="text-sm text-gray-400 line-through ml-2">{formatPrice(product.oldPrice)}</span>
            )}
          </div>
          <button
            onClick={() => addToCart(product, 1)}
            className="bg-maroon text-white p-2 rounded-full hover:bg-maroon-light transition"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;