import { useEffect, useState } from 'react';
import { getProducts } from '../services/api';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
 
export default function Products() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('all');
  const [loading,  setLoading]  = useState(true);
  const { addToCart } = useCart();
 
  useEffect(() => {
    setLoading(true);
    getProducts(category === 'all' ? undefined : category)
      .then(res => setProducts(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category]);
 
  return (
    <div className='container mx-auto px-4 py-10'>
      <h1 className='text-3xl font-bold mb-6'>Our Products</h1>
 
      {/* Category filter */}
      <div className='flex gap-3 mb-8'>
        {['all','skin','hair'].map(c => (
          <button key={c} onClick={() => setCategory(c)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors
              ${category === c ? 'bg-rose-DEFAULT text-white border-rose-DEFAULT' : 'border-gray-300 hover:border-rose-DEFAULT'}`}>
            {c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
      </div>
 
      {loading ? (<p>Loading...</p>) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          {products.map(product => (
            <div key={product._id} className='bg-white rounded-xl border p-4 hover:shadow-md transition'>
              <div className='h-40 bg-rose-light rounded-lg mb-4 flex items-center justify-center text-rose-DEFAULT text-sm'>
                {product.name}
              </div>
              <h3 className='font-semibold text-gray-900'>{product.name}</h3>
              <p className='text-sm text-gray-500 mt-1 line-clamp-2'>{product.description}</p>
              <div className='mt-3 flex items-center justify-between'>
                <span className='font-bold text-rose-DEFAULT'>
                  ₹{(product.price / 100).toFixed(2)}
                </span>
                <div className='flex gap-2'>
                  <Link to={`/product/${product._id}`}
                    className='text-xs border border-gray-300 px-3 py-1.5 rounded-lg hover:border-rose-DEFAULT'>
                    View
                  </Link>
                  {product.stockQuantity > 0 ? (
                    <button onClick={() => addToCart(product)}
                      className='text-xs bg-rose-DEFAULT text-white px-3 py-1.5 rounded-lg hover:opacity-90'>
                      Add to Cart
                    </button>
                  ) : (
                    <span className='text-xs text-red-500 px-3 py-1.5'>Out of stock</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
