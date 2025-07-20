import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Package, Clock, Phone } from 'lucide-react';

const ThankYou: React.FC = () => {
  // Generate 8-digit order ID
  const orderId = 'FL' + Math.random().toString().slice(2, 8).padStart(6, '0');
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">Thank you for your purchase</p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <p className="text-sm text-gray-600 mb-1">Order ID</p>
          <p className="text-lg font-semibold text-gray-900">{orderId}</p>
        </div>
        
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <Package className="h-5 w-5" />
            <span className="text-sm">Order will be processed within 24 hours</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <Clock className="h-5 w-5" />
            <span className="text-sm">Expected delivery: 3-5 business days</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <Phone className="h-5 w-5" />
            <span className="text-sm">We'll send updates via SMS & email</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <Link
            to="/account"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium block"
          >
            View Your Orders
          </Link>
          <Link
            to="/"
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors block"
          >
            Continue Shopping
          </Link>
        </div>
        
        <div className="mt-6 pt-6 border-t text-center">
          <p className="text-sm text-gray-600">
            Need help? Contact us at{' '}
            <a href="tel:+919876543210" className="text-blue-600 hover:underline">
              +91 98765 43210
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;