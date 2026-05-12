import { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import { 
  Package, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Truck,
  Loader2,
  ChevronRight,
  Calendar,
  MapPin,
  Phone,
  User,
  ShoppingBag,
  Trash2
} from 'lucide-react';
import Dropdown from '../../components/ui/Dropdown';
import ConfirmModal from '../../components/modals/ConfirmModal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const OrderRow = ({ order, onUpdateStatus }: any) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={16} />;
      case 'processing': return <Package size={16} />;
      case 'shipped': return <Truck size={16} />;
      case 'delivered': return <CheckCircle2 size={16} />;
      case 'cancelled': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'processing': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'shipped': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'delivered': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-white/5 text-white/40 border-white/5';
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await apiClient.delete(`/orders/${order._id}`);
      showToast('Order deleted successfully', 'success');
      onUpdateStatus(order._id, 'deleted'); 
      setIsDeleteModalOpen(false);
    } catch (err: any) {
      console.error('Failed to delete order', err);
      showToast(err.response?.data?.message || 'Failed to delete order', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white/5 border border-white/5 rounded-[32px] transition-all hover:border-primary/20 group relative">
      <div 
        className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[32px] bg-white/5/50 flex items-center justify-center text-primary">
            <Package size={28} />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-lg font-bold text-white ">Order #{order._id.slice(-6).toUpperCase()}</h3>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black  border flex items-center gap-1.5 ${getStatusStyle(order.status)}`}>
                {getStatusIcon(order.status)}
                {order.status}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-white/40 font-medium">
              <span className="flex items-center gap-1.5"><User size={14} /> {order.customer?.name}</span>
              <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(order.createdAt).toLocaleDateString()}</span>
              <span className="text-primary font-black">Rs. {order.totalPrice.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div 
          className="flex items-center gap-3 w-full md:w-auto min-w-[180px]"
          onClick={(e) => e.stopPropagation()}
        >
          {(user?.role === 'farmer' || (user?.role === 'employee' && user?.permissions?.inventory)) && (
            <Dropdown 
              value={order.status}
              onChange={(val) => onUpdateStatus(order._id, val)}
              className="w-full"
              options={[
                { value: 'pending', label: 'Mark Pending', icon: <Clock size={14} className="text-amber-500" /> },
                { value: 'processing', label: 'Mark Processing', icon: <Package size={14} className="text-blue-500" /> },
                { value: 'shipped', label: 'Mark Shipped', icon: <Truck size={14} className="text-purple-500" /> },
                { value: 'delivered', label: 'Mark Delivered', icon: <CheckCircle2 size={14} className="text-green-500" /> },
                { value: 'cancelled', label: 'Mark Cancelled', icon: <XCircle size={14} className="text-red-500" /> },
              ]}
            />
          )}
          <div className="flex items-center gap-2">
            {user?.role === 'farmer' && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDeleteModalOpen(true);
                }}
                className="w-10 h-10 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20"
                title="Delete Order"
              >
                <Trash2 size={18} />
              </button>
            )}
            <div className={`p-2 rounded-full transition-transform duration-300 ${isExpanded ? 'rotate-90 bg-primary/5 text-primary' : 'text-white/30'}`}>
              <ChevronRight size={20} />
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-8 pb-8 pt-2 border-t border-white/10 grid md:grid-cols-2 gap-10">
          <div className="flex flex-col gap-6">
            <div>
              <h4 className="text-xs font-black text-white/30  mb-4">Ordered Items</h4>
              <div className="flex flex-col gap-3">
                {order.items.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between items-center bg-white/5/20 p-4 rounded-[32px]">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/5 border border-white/5 flex-shrink-0">
                        {item.product?.image ? (
                           <img src={item.product.image} className="w-full h-full object-cover" />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center text-white/40"><ShoppingBag size={20} /></div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-white">{item.product?.name || 'Unknown Product'}</p>
                        <p className="text-xs text-white/40">{item.quantity} x Rs. {item.price}</p>
                      </div>
                    </div>
                    <p className="font-black text-white">Rs. {item.quantity * item.price}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <h4 className="text-xs font-black text-white/30  mb-4">Delivery & Contact</h4>
              <div className="bg-white/5/20 p-6 rounded-3xl flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-primary mt-0.5" />
                  <div>
                    <p className="text-xs font-black text-white/30  mb-1">Shipping Address</p>
                    <p className="text-white/80 font-medium leading-relaxed">{order.deliveryAddress}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-primary" />
                  <div>
                    <p className="text-xs font-black text-white/30  mb-1">Customer Phone</p>
                    <p className="text-white/80 font-medium">{order.customer?.phone || 'Not Provided'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Order"
        message={`Are you sure you want to permanently delete order #${order._id.slice(-6).toUpperCase()}? This action cannot be undone.`}
        confirmText="Delete Order"
        isLoading={isDeleting}
      />
    </div>
  );
};

const Orders = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await apiClient.get('/orders');
        setOrders(res.data.orders || []);
      } catch (err) {
        console.error('Failed to fetch orders', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, status: string) => {
    if (status === 'deleted') {
      setOrders(orders.filter(o => o._id !== orderId));
      return;
    }
    try {
      await apiClient.put(`/orders/${orderId}`, { status });
      setOrders(orders.map(o => o._id === orderId ? { ...o, status } : o));
    } catch (err: any) {
      console.error('Failed to update status', err);
      showToast(err.response?.data?.message || 'Failed to update order status', 'error');
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesStatus = filterStatus === 'all' || o.status === filterStatus;
    const matchesSearch = o.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         o._id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white ">Order Management</h1>
          <p className="text-white/40 mt-1 text-sm font-medium">Track and manage all customer shipments and fulfillment status.</p>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-white/5 p-4 rounded-[32px] border border-white/10">
        <div className="flex-1 relative flex items-center w-full group">
          <Search size={18} className="absolute left-5 text-white/30 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search by ID or customer..." 
            className="w-full h-12 bg-bg-primary border border-white/10 rounded-full pl-14 pr-6 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 text-white transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto min-w-[200px]">
          <Dropdown 
            value={filterStatus}
            onChange={setFilterStatus}
            size="md"
            className="w-full md:w-auto"
            icon={<Filter size={18} />}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'pending', label: 'Pending' },
              { value: 'processing', label: 'Processing' },
              { value: 'shipped', label: 'Shipped' },
              { value: 'delivered', label: 'Delivered' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
          />
        </div>
      </div>
      
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <OrderRow 
                key={order._id} 
                order={order} 
                onUpdateStatus={handleUpdateStatus}
              />
            ))
          ) : (
            <div className="py-32 flex flex-col items-center gap-4 text-white/40">
              <Package size={64} className="opacity-20" />
              <h3 className="text-xl font-bold">No orders found</h3>
              <p>Current filters don't match any shipments.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Orders;
