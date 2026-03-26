import { Link, useNavigate } from 'react-router-dom';
import { useAuth }   from '../context/AuthContext';
import { useCart }   from '../context/CartContext';
import { ShoppingCart, User, LogOut } from 'lucide-react';  // npm install lucide-react
 
export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems }   = useCart();
  const navigate = useNavigate();
 
  const handleLogout = () => { logout(); navigate('/'); };
 
  return (
    <nav className='sticky top-0 z-50 bg-white border-b border-gray-200'>
      <div className='container mx-auto px-4 h-16 flex items-center justify-between'>
        <Link to='/' className='text-xl font-bold text-rose-DEFAULT'>✦ Derma Flow</Link>
 
        <div className='flex items-center gap-6'>
          <Link to='/products' className='text-sm text-gray-600 hover:text-rose-DEFAULT'>Products</Link>
          <Link to='/quiz'     className='text-sm text-gray-600 hover:text-rose-DEFAULT'>AI Quiz</Link>
 
          <Link to='/cart' className='relative'>
            <ShoppingCart className='h-5 w-5 text-gray-700' />
            {totalItems > 0 && (
              <span className='absolute -top-2 -right-2 bg-rose-DEFAULT text-white
                               text-xs rounded-full h-4 w-4 flex items-center justify-center'>
                {totalItems}
              </span>
            )}
          </Link>
 
          {user ? (
            <div className='flex items-center gap-3'>
              <Link to='/dashboard' className='flex items-center gap-1 text-sm'>
                <User className='h-4 w-4' /> {user.name}
              </Link>
              <button onClick={handleLogout} className='text-gray-500 hover:text-rose-DEFAULT'>
                <LogOut className='h-4 w-4' />
              </button>
            </div>
          ) : (
            <Link to='/login'
              className='text-sm bg-rose-DEFAULT text-white px-4 py-1.5 rounded-full'>
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

