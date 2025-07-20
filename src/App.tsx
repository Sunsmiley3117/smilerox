import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import AppPopup from './components/AppPopup';
import FloatingActionButton from './components/FloatingActionButton';
import Homepage from './pages/Homepage';
import Accessories from './pages/Accessories';
import Menswear from './pages/Menswear';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import TrackOrder from './pages/TrackOrder';
import About from './pages/About';
import Contact from './pages/Contact';
import Feedback from './pages/Feedback';
import Account from './pages/Account';
import ThankYou from './pages/ThankYou';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import OrderManagement from './pages/Admin/OrderManagement';
import UserManagement from './pages/Admin/UserManagement';
import ProductManagement from './pages/Admin/ProductManagement';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="pt-16">
              <Routes>
                <Route path="/" element={<Homepage />} />
                <Route path="/accessories" element={<Accessories />} />
                <Route path="/menswear" element={<Menswear />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/account" element={<Account />} />
                <Route path="/thank-you" element={<ThankYou />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="orders" element={<OrderManagement />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="products" element={<ProductManagement />} />
                </Route>
              </Routes>
            </main>
            <Footer />
            <AppPopup />
            <FloatingActionButton />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;