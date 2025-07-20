import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Edit, 
  Eye, 
  Trash2,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Package
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  date_of_birth: string | null;
  created_at: string;
  updated_at: string;
  orders?: Array<{
    id: string;
    order_number: string;
    total: number;
    status: string;
    created_at: string;
  }>;
  addresses?: Array<{
    id: string;
    type: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    is_default: boolean;
  }>;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          orders (
            id,
            order_number,
            total,
            status,
            created_at
          ),
          addresses (
            id,
            type,
            address,
            city,
            state,
            pincode,
            is_default
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
      } else {
        setUsers(data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      // Remove user from local state
      setUsers(users.filter(user => user.id !== userId));
      
      // Close modal if the deleted user was selected
      if (selectedUser && selectedUser.id === userId) {
        closeUserModal();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.first_name.toLowerCase().includes(searchLower) ||
      user.last_name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      (user.phone && user.phone.includes(searchTerm))
    );
  });

  const openUserModal = async (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeUserModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  const getTotalSpent = (orders: User['orders']) => {
    if (!orders) return 0;
    return orders.reduce((total, order) => total + Number(order.total), 0);
  };

  const getOrderCount = (orders: User['orders']) => {
    return orders ? orders.length : 0;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 mt-1">Manage customer accounts and information</p>
            </div>
            <div className="flex space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Spent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-blue-600 p-2 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                          <span className="text-white text-sm font-semibold">
                            {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-sm text-gray-500">ID: {user.id.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900 flex items-center">
                          <Mail className="h-4 w-4 mr-1 text-gray-400" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <Phone className="h-4 w-4 mr-1 text-gray-400" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getOrderCount(user.orders)} orders
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{getTotalSpent(user.orders).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openUserModal(user)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                User Details - {selectedUser.first_name} {selectedUser.last_name}
              </h2>
              <button
                onClick={closeUserModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* User Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Personal Information
                  </h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {selectedUser.first_name} {selectedUser.last_name}</p>
                    <p><span className="font-medium">Email:</span> {selectedUser.email}</p>
                    {selectedUser.phone && (
                      <p><span className="font-medium">Phone:</span> {selectedUser.phone}</p>
                    )}
                    {selectedUser.date_of_birth && (
                      <p><span className="font-medium">Date of Birth:</span> {new Date(selectedUser.date_of_birth).toLocaleDateString()}</p>
                    )}
                    <p><span className="font-medium">Joined:</span> {new Date(selectedUser.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Order Statistics
                  </h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Total Orders:</span> {getOrderCount(selectedUser.orders)}</p>
                    <p><span className="font-medium">Total Spent:</span> ₹{getTotalSpent(selectedUser.orders).toLocaleString()}</p>
                    <p><span className="font-medium">Average Order:</span> ₹{getOrderCount(selectedUser.orders) > 0 ? Math.round(getTotalSpent(selectedUser.orders) / getOrderCount(selectedUser.orders)).toLocaleString() : '0'}</p>
                  </div>
                </div>
              </div>

              {/* Addresses */}
              {selectedUser.addresses && selectedUser.addresses.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Saved Addresses
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedUser.addresses.map((address) => (
                      <div key={address.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900 capitalize">{address.type}</h4>
                          {address.is_default && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>{address.address}</p>
                          <p>{address.city}, {address.state}</p>
                          <p>{address.pincode}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Orders */}
              {selectedUser.orders && selectedUser.orders.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Recent Orders
                  </h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedUser.orders.slice(0, 5).map((order) => (
                          <tr key={order.id}>
                            <td className="px-4 py-3 text-sm text-gray-900">{order.order_number}</td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">₹{Number(order.total).toLocaleString()}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;