import { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { Package, Plus, Search, Loader2, MapPin, Hash, Trash2, ShoppingBag, Scale } from 'lucide-react';
import Dropdown from '../components/Dropdown';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Inventory = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [formData, setFormData] = useState({
    product: '',
    quantity: '',
    unit: 'kg',
    warehouseLocation: '',
    quality: 'good',
    batchNumber: '',
    notes: ''
  });

  const fetchInventory = async () => {
    try {
      const res = await apiClient.get('/inventory');
      setItems(Array.isArray(res.data.inventory) ? res.data.inventory : []);
    } catch (err) {
      console.error('Failed to fetch inventory', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await apiClient.get('/products?mine=true');
      setProducts(res.data.products || []);
      if (res.data.products?.length > 0) {
        setFormData(prev => ({ ...prev, product: res.data.products[0]._id }));
      }
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.post('/inventory', {
        ...formData,
        quantity: Number(formData.quantity)
      });
      setIsModalOpen(false);
      setFormData({
        product: products[0]?._id || '',
        quantity: '',
        unit: 'kg',
        warehouseLocation: '',
        quality: 'good',
        batchNumber: '',
        notes: ''
      });
      fetchInventory();
      showToast('Stock record added successfully!', 'success');
    } catch (err: any) {
      console.error('Failed to add inventory', err);
      showToast(err.response?.data?.message || 'Failed to add inventory', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/inventory/${deletingId}`);
      setItems(items.filter(item => item._id !== deletingId));
      showToast('Stock record removed', 'info');
      setIsDeleteModalOpen(false);
    } catch (err: any) {
      console.error('Failed to delete inventory', err);
      showToast('Failed to delete inventory record', 'error');
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white ">Inventory Management</h1>
          <p className="text-white/40 mt-1 text-sm font-medium">Track your product stock levels and storage locations.</p>
        </div>
        {(user?.role === 'farmer' || (user?.role === 'employee' && user?.permissions?.inventory)) && (
          <Button 
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Plus size={20} />}
          >
            Add Stock
          </Button>
        )}
      </header>

      <div className="flex flex-col md:flex-row gap-4 mb-4 bg-white/5 p-4 rounded-[32px] border border-white/10">
        <div className="flex-1 relative flex items-center group">
          <Search size={18} className="absolute left-4 text-white/30 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search inventory..." 
            className="w-full h-12 bg-bg-primary border border-white/10 rounded-full pl-12 pr-4 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 text-white transition-all"
          />
        </div>
      </div>

      <div className="bg-bg-primary border border-white/10 rounded-3xl overflow-hidden glass">

        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-primary/[0.02]">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Product</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Category</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Quantity</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Location</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {(items || []).length > 0 ? items.map((item: any) => (
                  <tr key={item._id} className="hover:bg-bg-primary/[0.01] transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-bold text-white group-hover:text-primary transition-colors">
                        {item.product?.name || 'Deleted Product'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/40 text-sm">{item.product?.category || 'N/A'}</td>
                    <td className="px-6 py-4 text-white font-medium">{item.quantity} {item.unit}</td>
                    <td className="px-6 py-4 text-white/40 text-sm">{item.warehouseLocation || 'Main Store'}</td>
                    <td className="px-6 py-4">
                      {item.quantity < 10 ? (
                        <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-widest">Low Stock</span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">In Stock</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => {
                          setDeletingId(item._id);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-2 text-white/30 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <Package size={48} className="mx-auto mb-4 opacity-10 text-white" />
                      <p className="text-white/40 font-medium">No inventory items found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Add Stock Entry"
        subtitle="Update the inventory levels for your products."
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold text-white/80 mb-1.5">Select Product</label>
            <Dropdown 
              value={formData.product}
              onChange={(val) => setFormData({...formData, product: val})}
              icon={<ShoppingBag size={18} />}
              placeholder={products.length === 0 ? "No products found" : "Select Product"}
              options={products.map(p => ({ value: p._id, label: p.name }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-white/80 mb-1.5">Quantity</label>
              <input 
                type="number" 
                className="w-full px-5 py-2.5 rounded-[20px] bg-white/5 border border-white/10 focus:border-primary outline-none transition-all font-medium text-white"
                placeholder="0"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-white/80 mb-1.5">Unit</label>
              <Dropdown 
                value={formData.unit}
                onChange={(val) => setFormData({...formData, unit: val})}
                icon={<Scale size={18} />}
                options={[
                  { value: 'kg', label: 'kg' },
                  { value: 'tons', label: 'tons' },
                  { value: 'liters', label: 'liters' },
                  { value: 'pieces', label: 'pieces' },
                  { value: 'dozens', label: 'dozens' },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-white/80 mb-1.5">Location</label>
              <div className="relative">
                <MapPin size={18} className="absolute left-5 top-4 text-white/30" />
                <input 
                  type="text" 
                  className="w-full pl-12 pr-5 py-2.5 rounded-[20px] bg-white/5 border border-white/10 focus:border-primary outline-none transition-all font-medium text-white"
                  placeholder="e.g. Warehouse A"
                  value={formData.warehouseLocation}
                  onChange={(e) => setFormData({...formData, warehouseLocation: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-white/80 mb-1.5">Batch Number</label>
              <div className="relative">
                <Hash size={18} className="absolute left-5 top-4 text-white/30" />
                <input 
                  type="text" 
                  className="w-full pl-12 pr-5 py-2.5 rounded-[20px] bg-white/5 border border-white/10 focus:border-primary outline-none transition-all font-medium text-white"
                  placeholder="e.g. B-2024-001"
                  value={formData.batchNumber}
                  onChange={(e) => setFormData({...formData, batchNumber: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-4">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-3 rounded-full font-bold text-white/40 hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={submitting || products.length === 0}
              className="flex-1 bg-primary text-black py-3 rounded-full font-bold hover:brightness-110 transition-all disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Add to Inventory'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingId(null);
        }}
        onConfirm={handleDelete}
        title="Remove Stock Record"
        message="Are you sure you want to remove this stock record? This action cannot be undone."
        confirmText="Remove Record"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Inventory;
