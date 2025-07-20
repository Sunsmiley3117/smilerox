import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { state } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50">
      {/* Main Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" onClick={scrollToTop} className="flex items-center space-x-2">
              <div className="bg-blue-900 p-2 rounded-lg">
                <Zap className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-blue-900">Falcon</h1>
                <p className="text-xs text-gray-600 -mt-1">LIFESTYLE</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link 
                to="/" 
                onClick={scrollToTop}
                className="text-gray-900 hover:text-blue-900 font-medium transition-colors"
              >
                Home
              </Link>
              <div className="relative group">
                <Link 
                  to="/accessories" 
                  onClick={scrollToTop}
                  className="text-gray-900 hover:text-blue-900 font-medium transition-colors"
                >
                  Accessories
                </Link>
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                  <div className="py-2">
                    <Link to="/accessories?category=phone-cases" onClick={scrollToTop} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Phone Cases</Link>
                    <Link to="/accessories?category=chargers" onClick={scrollToTop} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Chargers</Link>
                    <Link to="/accessories?category=audio" onClick={scrollToTop} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Audio</Link>
                    <Link to="/accessories?category=mounts" onClick={scrollToTop} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Mounts</Link>
                  </div>
                </div>
              </div>
              <div className="relative group">
                <Link 
                  to="/menswear" 
                  onClick={scrollToTop}
                  className="text-gray-900 hover:text-blue-900 font-medium transition-colors"
                >
                  Men's Fashion
                </Link>
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                  <div className="py-2">
                    <Link to="/menswear?category=shirts" onClick={scrollToTop} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Shirts</Link>
                    <Link to="/menswear?category=jackets" onClick={scrollToTop} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Jackets</Link>
                    <Link to="/menswear?category=shoes" onClick={scrollToTop} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Shoes</Link>
                    <Link to="/menswear?category=accessories" onClick={scrollToTop} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Accessories</Link>
                  </div>
                </div>
              </div>
              <Link 
                to="/about" 
                onClick={scrollToTop}
                className="text-gray-900 hover:text-blue-900 font-medium transition-colors"
              >
                About
              </Link>
            </nav>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </form>
            </div>

            {/* Right Icons */}
            <div className="flex items-center space-x-4">
              {/* User Account */}
              <div className="relative group">
                <button className="flex items-center space-x-1 text-gray-900 hover:text-blue-900 transition-colors">
                  <User className="h-6 w-6" />
                  <span className="hidden md:inline text-sm">
                    {isAuthenticated ? user?.firstName : 'Account'}
                  </span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                  <div className="py-2">
                    {isAuthenticated ? (
                      <>
                        <Link to="/account" onClick={scrollToTop} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Account</Link>
                        <Link to="/account" onClick={() => { scrollToTop(); setActiveTab('orders'); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Orders</Link>
                        {(user?.email === 'admin@falconlifestyle.com' || user?.email?.includes('admin')) && (
                          <Link to="/admin" onClick={scrollToTop} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Admin Panel</Link>
                        )}
                        <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</button>
                      </>
                    ) : (
                      <>
                        <Link to="/login" onClick={scrollToTop} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Login</Link>
                        <Link to="/register" onClick={scrollToTop} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Register</Link>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Cart */}
              <Link to="/cart" onClick={scrollToTop} className="relative p-2 text-gray-900 hover:text-blue-900 transition-colors">
                <ShoppingCart className="h-6 w-6" />
                {state.itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {state.itemCount}
                  </span>
                )}
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-gray-900 hover:text-blue-900 transition-colors"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-2 space-y-2">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </form>
            <Link 
              to="/" 
              className="block py-2 text-gray-900 hover:text-blue-900 font-medium" 
              onClick={() => {
                setIsMenuOpen(false);
                scrollToTop();
              }}
            >
              Home
            </Link>
            <Link 
              to="/accessories" 
              className="block py-2 text-gray-900 hover:text-blue-900 font-medium" 
              onClick={() => {
                setIsMenuOpen(false);
                scrollToTop();
              }}
            >
              Accessories
            </Link>
            <Link 
              to="/menswear" 
              className="block py-2 text-gray-900 hover:text-blue-900 font-medium" 
              onClick={() => {
                setIsMenuOpen(false);
                scrollToTop();
              }}
            >
              Men's Fashion
            </Link>
            <Link 
              to="/about" 
              className="block py-2 text-gray-900 hover:text-blue-900 font-medium" 
              onClick={() => {
                setIsMenuOpen(false);
                scrollToTop();
              }}
            >
              About
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;