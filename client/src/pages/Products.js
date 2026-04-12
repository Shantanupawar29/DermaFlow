import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Filter, ChevronDown } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import api from '../services/api';



const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    sort: 'newest'
  });
  const [showFilters, setShowFilters] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setFilters({
      category: params.get('category') || '',
      minPrice: params.get('minPrice') || '',
      maxPrice: params.get('maxPrice') || '',
      sort: params.get('sort') || 'newest',
      search: params.get('search') || ''
    });
  }, [location.search]);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.sort) params.append('sort', filters.sort);
      if (filters.search) params.append('search', filters.search);
      
      const response = await api.get(`/products?${params}`);
      console.log("Fetched products:", response.data.products);
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.append(k, v);
    });
    navigate(`/products?${params}`);
  };

  const categories = ['Serums', 'Moisturizers', 'Cleansers', 'Sunscreens', 'Treatments', 'Haircare'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">Our Products</h1>
        <p className="text-muted-foreground mt-2">Discover science-backed skincare for every concern</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar - Desktop */}
        <div className="hidden lg:block w-64 space-y-6">
          <div>
            <h3 className="font-semibold mb-3">Categories</h3>
            <div className="space-y-2">
              <button 
                onClick={() => updateFilter('category', '')}
                className={`block text-sm ${!filters.category ? 'text-maroon font-semibold' : 'text-gray-600'} hover:text-maroon`}
              >
                All Products
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => updateFilter('category', cat)}
                  className={`block text-sm ${filters.category === cat ? 'text-maroon font-semibold' : 'text-gray-600'} hover:text-maroon`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Price Range</h3>
            <div className="space-y-2">
              <input
                type="number"
                placeholder="Min Price"
                value={filters.minPrice}
                onChange={(e) => updateFilter('minPrice', e.target.value)}
                className="w-full border border-cream-dark rounded-lg p-2 text-sm"
              />
              <input
                type="number"
                placeholder="Max Price"
                value={filters.maxPrice}
                onChange={(e) => updateFilter('maxPrice', e.target.value)}
                className="w-full border border-cream-dark rounded-lg p-2 text-sm"
              />
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Sort By</h3>
            <select
              value={filters.sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="w-full border border-cream-dark rounded-lg p-2 text-sm"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Mobile Filter Button */}
        <div className="lg:hidden">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full bg-cream text-maroon py-2 rounded-lg flex items-center justify-center gap-2 mb-4"
          >
            <Filter size={18} /> Filters <ChevronDown size={18} className={`transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          
          {showFilters && (
            <div className="bg-white rounded-lg shadow p-4 mb-6 space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Categories</h3>
                <select
                  value={filters.category}
                  onChange={(e) => updateFilter('category', e.target.value)}
                  className="w-full border border-cream-dark rounded-lg p-2"
                >
                  <option value="">All Products</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Price Range</h3>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => updateFilter('minPrice', e.target.value)}
                    className="flex-1 border border-cream-dark rounded-lg p-2"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => updateFilter('maxPrice', e.target.value)}
                    className="flex-1 border border-cream-dark rounded-lg p-2"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-pulse text-maroon">Loading products...</div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;