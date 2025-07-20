import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  Edit, 
  Eye, 
  Truck, 
  CheckCircle,
  X,
  Calendar,
  User,
  MapPin,
  CreditCard
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Order {
  id: string;
  order_number: string;
  status: string;
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  created_at: string;
  tracking_number: string | null;
  estimated_delivery: string | null;
  payment_method: string;
  shipping_address: any;
  users: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  order_items: Array<{
    product_name: string;
    quantity: number;
    price: number;
    selected_color: string | null;
    selected_size: string | null;
  }>;
}

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          users (
            first_name,
            last_name,
            email,
            phone
          ),
          order_items (
            product_name,
            quantity,
            price,
            selected_color,
            selected_size
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
      } else {
        setOrders(data || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string, trackingNumber?: string) => {
    try {
      setIsUpdating(true);
      const updateData: any = { status: newStatus };
      
      if (trackingNumber) {
        updateData.tracking_number = trackingNumber;
      }
      
      if (newStatus === 'shipped' && !trackingNumber) {
        updateData.tracking_number = 'TRK' + Math.random().toString(36).substr(2, 9).toUpperCase();
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;

      // Refresh orders
      await fetchOrders();
      
      // Update selected order if it's the one being updated
      if (selectedOrder && selectedOrder.id === orderId) {
        const updatedOrder = orders.find(order => order.id === orderId);
        if (updatedOrder) {
          setSelectedOrder({ ...updatedOrder, ...updateData });
        }
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.users?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${order.users?.first_name} ${order.users?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openOrderModal = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeOrderModal = () => {
    setSelectedOrder(null);
    setIsModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
              <p className="text-gray-600 mt-1">Manage and track all customer orders</p>
            </div>
            <div className="flex space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.order_number}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.order_items?.length || 0} items
                        </div>
                        {order.tracking_number && (
                          <div className="text-xs text-blue-600">
                            Tracking: {order.tracking_number}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.users?.first_name} {order.users?.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{order.users?.email}</div>
                        {order.users?.phone && (
                          <div className="text-xs text-gray-500">{order.users?.phone}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{Number(order.total).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openOrderModal(order)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {order.status !== 'delivered' && order.status !== 'cancelled' && (
                          <div className="flex space-x-1">
                            {order.status === 'pending' && (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'confirmed')}
                                className="text-green-600 hover:text-green-900 p-1 rounded"
                                title="Confirm Order"
                                disabled={isUpdating}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            )}
                            {(order.status === 'confirmed' || order.status === 'processing') && (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'shipped')}
                                className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                                title="Mark as Shipped"
                                disabled={isUpdating}
                              >
                                <Truck className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                Order Details - {selectedOrder.order_number}
              </h2>
              <button
                onClick={closeOrderModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Status and Actions */}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </span>
                  {selectedOrder.tracking_number && (
                    <span className="text-sm text-gray-600">
                      Tracking: {selectedOrder.tracking_number}
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                    <>
                      {selectedOrder.status === 'pending' && (
                        <button
                          onClick={() => updateOrderStatus(selectedOrder.id, 'confirmed')}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                          disabled={isUpdating}
                        >
                          Confirm Order
                        </button>
                      )}
                      {(selectedOrder.status === 'confirmed' || selectedOrder.status === 'processing') && (
                        <button
                          onClick={() => updateOrderStatus(selectedOrder.id, 'shipped')}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                          disabled={isUpdating}
                        >
                          Mark as Shipped
                        </button>
                      )}
                      {selectedOrder.status === 'shipped' && (
                        <button
                          onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                          disabled={isUpdating}
                        >
                          Mark as Delivered
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Customer Information
                  </h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {selectedOrder.users?.first_name} {selectedOrder.users?.last_name}</p>
                    <p><span className="font-medium">Email:</span> {selectedOrder.users?.email}</p>
                    {selectedOrder.users?.phone && (
                      <p><span className="font-medium">Phone:</span> {selectedOrder.users?.phone}</p>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Shipping Address
                  </h3>
                  <div className="space-y-1">
                    <p>{selectedOrder.shipping_address?.firstName} {selectedOrder.shipping_address?.lastName}</p>
                    <p>{selectedOrder.shipping_address?.address}</p>
                    <p>{selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state}</p>
                    <p>{selectedOrder.shipping_address?.pincode}</p>
                    {selectedOrder.shipping_address?.phone && (
                      <p>Phone: {selectedOrder.shipping_address.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Items</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Options</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedOrder.order_items?.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.product_name}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {item.selected_color && <span>Color: {item.selected_color}</span>}
                            {item.selected_color && item.selected_size && <br />}
                            {item.selected_size && <span>Size: {item.selected_size}</span>}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">₹{Number(item.price).toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">₹{(Number(item.price) * item.quantity).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Order Summary
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{Number(selectedOrder.subtotal).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>₹{Number(selectedOrder.tax).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>₹{Number(selectedOrder.shipping).toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total:</span>
                      <span>₹{Number(selectedOrder.total).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="font-medium">Payment Method:</span> {selectedOrder.payment_method.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Order Timeline */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Order Timeline
                </h3>
                <div className="text-sm text-gray-600">
                  <p><span className="font-medium">Order Placed:</span> {new Date(selectedOrder.created_at).toLocaleString()}</p>
                  {selectedOrder.estimated_delivery && (
                    <p><span className="font-medium">Estimated Delivery:</span> {new Date(selectedOrder.estimated_delivery).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;