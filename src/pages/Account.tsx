import React, { useState } from 'react';
import { User, Package, MapPin, Heart, Settings, LogOut, Truck, Plus, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Account: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    type: 'home',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    landmark: '',
    isDefault: false
  });

  React.useEffect(() => {
    if (user) {
      fetchUserOrders();
      fetchUserAddresses();
    }
  }, [user]);

  const fetchUserOrders = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchUserAddresses = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const addressData = {
        user_id: user.id,
        type: addressForm.type,
        first_name: addressForm.firstName,
        last_name: addressForm.lastName,
        phone: addressForm.phone,
        address: `${addressForm.address}${addressForm.apartment ? ', ' + addressForm.apartment : ''}`,
        city: addressForm.city,
        state: addressForm.state,
        pincode: addressForm.zipCode,
        is_default: addressForm.isDefault
      };

      if (editingAddress) {
        const { error } = await supabase
          .from('addresses')
          .update(addressData)
          .eq('id', editingAddress.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('addresses')
          .insert(addressData);
        if (error) throw error;
      }

      await fetchUserAddresses();
      setShowAddressForm(false);
      setEditingAddress(null);
      resetAddressForm();
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Failed to save address. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setAddressForm({
      type: address.type,
      firstName: address.first_name,
      lastName: address.last_name,
      phone: address.phone,
      address: address.address.split(',')[0] || '',
      apartment: address.address.split(',')[1]?.trim() || '',
      city: address.city,
      state: address.state,
      zipCode: address.pincode,
      country: 'India',
      landmark: '',
      isDefault: address.is_default
    });
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (addressId) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId);

      if (error) throw error;
      await fetchUserAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Failed to delete address. Please try again.');
    }
  };

  const resetAddressForm = () => {
    setAddressForm({
      type: 'home',
      firstName: '',
      lastName: '',
      phone: '',
      address: '',
      apartment: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India',
      landmark: '',
      isDefault: false
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'orders', name: 'Orders', icon: Package },
    { id: 'addresses', name: 'Addresses', icon: MapPin },
    { id: 'wishlist', name: 'Wishlist', icon: Heart },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-blue-600 p-3 rounded-full">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{user?.name}</h3>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
              
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          value="John"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value="Doe"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={user?.email}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value="+91 98765 43210"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Save Changes
                    </button>
                  </form>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Order History</h2>
                  {orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-semibold text-gray-900">Order #{order.order_number}</h3>
                              <p className="text-sm text-gray-500">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                          <div className="space-y-2 mb-4">
                            {order.order_items?.map((item, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span>{item.product_name} x{item.quantity}</span>
                                <span>₹{Number(item.price).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between items-center pt-4 border-t">
                            <span className="font-semibold">Total: ₹{Number(order.total).toLocaleString()}</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
                      <p className="text-gray-600 mb-6">You haven't placed any orders yet</p>
                      <Link
                        to="/"
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Start Shopping
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Track Order Tab */}
              {/* Addresses Tab */}
              {activeTab === 'addresses' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Saved Addresses</h2>
                  
                  {!showAddressForm && (
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="mb-6 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Address
                    </button>
                  )}

                  {showAddressForm && (
                    <div className="bg-gray-50 p-6 rounded-lg mb-6">
                      <h3 className="text-lg font-semibold mb-4">
                        {editingAddress ? 'Edit Address' : 'Add New Address'}
                      </h3>
                      <form onSubmit={handleAddressSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                            <input
                              type="text"
                              value={addressForm.firstName}
                              onChange={(e) => setAddressForm({...addressForm, firstName: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                            <input
                              type="text"
                              value={addressForm.lastName}
                              onChange={(e) => setAddressForm({...addressForm, lastName: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
                          <input
                            type="text"
                            value={addressForm.address}
                            onChange={(e) => setAddressForm({...addressForm, address: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="House number and street name"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Apartment/Suite (Optional)</label>
                          <input
                            type="text"
                            value={addressForm.apartment}
                            onChange={(e) => setAddressForm({...addressForm, apartment: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Apartment, suite, unit, building, floor, etc."
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                            <input
                              type="text"
                              value={addressForm.city}
                              onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">State/Province *</label>
                            <input
                              type="text"
                              value={addressForm.state}
                              onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">ZIP/Postal Code *</label>
                            <input
                              type="text"
                              value={addressForm.zipCode}
                              onChange={(e) => setAddressForm({...addressForm, zipCode: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                            <select
                              value={addressForm.country}
                              onChange={(e) => setAddressForm({...addressForm, country: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            >
                              <option value="India">India</option>
                              <option value="USA">United States</option>
                              <option value="UK">United Kingdom</option>
                              <option value="Canada">Canada</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                            <input
                              type="tel"
                              value={addressForm.phone}
                              onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Landmark (Optional)</label>
                          <input
                            type="text"
                            value={addressForm.landmark}
                            onChange={(e) => setAddressForm({...addressForm, landmark: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nearby landmark for easy delivery"
                          />
                        </div>
                        
                        <div>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={addressForm.isDefault}
                              onChange={(e) => setAddressForm({...addressForm, isDefault: e.target.checked})}
                              className="mr-2"
                            />
                            <span className="text-sm">Set as default address</span>
                          </label>
                        </div>
                        
                        <div className="flex space-x-3">
                          <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                          >
                            {isLoading ? 'Saving...' : 'Save Address'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddressForm(false);
                              setEditingAddress(null);
                              resetAddressForm();
                            }}
                            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className="space-y-4">
                    {addresses.length > 0 ? (
                      addresses.map((address) => (
                        <div key={address.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-gray-900 capitalize">{address.type}</h3>
                            {address.is_default && (
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 mb-2">
                            {address.first_name} {address.last_name}<br />
                            {address.address}<br />
                            {address.city}, {address.state} {address.pincode}<br />
                            India
                          </p>
                          <p className="text-sm text-gray-500 mb-3">{address.phone}</p>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleEditAddress(address)}
                              className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteAddress(address.id)}
                              className="text-red-600 hover:text-red-700 text-sm flex items-center"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      !showAddressForm && (
                        <div className="text-center py-12">
                          <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">No addresses found</h3>
                          <p className="text-gray-600 mb-6">Add your first address for faster checkout</p>
                          <button
                            onClick={() => setShowAddressForm(true)}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Add Address
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Wishlist Tab */}
              {activeTab === 'wishlist' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Wishlist</h2>
                  <div className="text-center py-12">
                    <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
                    <p className="text-gray-600 mb-6">Save items you love for later</p>
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Start Shopping
                    </button>
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Email Notifications</h3>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" defaultChecked />
                          <span className="text-sm">Order updates</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" defaultChecked />
                          <span className="text-sm">New product announcements</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" />
                          <span className="text-sm">Marketing emails</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Privacy Settings</h3>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" defaultChecked />
                          <span className="text-sm">Allow data collection for better experience</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" />
                          <span className="text-sm">Share data with partners</span>
                        </label>
                      </div>
                    </div>
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Save Settings
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;