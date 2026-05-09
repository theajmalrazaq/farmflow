import { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { Package, Plus, Search, MoreVertical, Loader2, X, MapPin, Hash, Trash2 } from 'lucide-react';

const Inventory = () => {
  const [items, setItems] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
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
    } catch (err) {
      console.error('Failed to add inventory', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this stock record?')) return;
    try {
      await apiClient.delete(`/inventory/${id}`);
      setItems(items.filter(item => item._id !== id));
    } catch (err) {
      console.error('Failed to delete inventory', err);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-xl font-bold text-white ">Inventory Management</h1>
          <p className="text-white/40 mt-1 text-sm font-medium">Track your product stock levels and storage locations.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-black font-bold px-5 py-2.5 rounded-full flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all"
        >
          <Plus size={20} /> Add Stock
        </button>
      </header>

      <div className="bg-bg-primary border border-white/10 rounded-3xl overflow-hidden glass">
        <div className="p-6 border-b border-white/10">
          <div className="relative flex items-center max-w-md group">
            <Search size={18} className="absolute left-4 text-white/40 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search inventory..." 
              className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-12 pr-4 focus:outline-none focus:border-primary/50 transition-all"
            />
          </div>
        </div>

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
                        <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest">Low Stock</span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">In Stock</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(item._id)}
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-sm p-4">
          <div className="bg-bg-primary w-full max-w-xl rounded-[32px] border border-white/10 overflow-hidden">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
              <div>
                <h2 className="text-xl font-bold text-white ">Add Stock Entry</h2>
                <p className="text-white/40 text-sm">Update the inventory levels for your products.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/30">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6 bg-bg-primary">
              <div>
                <label className="block text-sm font-bold text-white/80 mb-2">Select Product</label>
                <select 
                  className="w-full px-5 py-3.5 rounded-[32px] bg-white/5 border border-white/10 focus:border-primary outline-none transition-all font-medium appearance-none"
                  value={formData.product}
                  onChange={(e) => setFormData({...formData, product: e.target.value})}
                  required
                >
                  {products.length === 0 && <option value="">No products found</option>}
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-white/80 mb-2">Quantity</label>
                  <input 
                    type="number" 
                    className="w-full px-5 py-3.5 rounded-[32px] bg-white/5 border border-white/10 focus:border-primary outline-none transition-all font-medium"
                    placeholder="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-white/80 mb-2">Unit</label>
                  <select 
                    className="w-full px-5 py-3.5 rounded-[32px] bg-white/5 border border-white/10 focus:border-primary outline-none transition-all font-medium appearance-none"
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  >
                    <option value="kg">kg</option>
                    <option value="tons">tons</option>
                    <option value="liters">liters</option>
                    <option value="pieces">pieces</option>
                    <option value="dozens">dozens</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-white/80 mb-2">Location</label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-5 top-4 text-white/30" />
                    <input 
                      type="text" 
                      className="w-full pl-12 pr-5 py-3.5 rounded-[32px] bg-white/5 border border-white/10 focus:border-primary outline-none transition-all font-medium"
                      placeholder="e.g. Warehouse A"
                      value={formData.warehouseLocation}
                      onChange={(e) => setFormData({...formData, warehouseLocation: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-white/80 mb-2">Batch Number</label>
                  <div className="relative">
                    <Hash size={18} className="absolute left-5 top-4 text-white/30" />
                    <input 
                      type="text" 
                      className="w-full pl-12 pr-5 py-3.5 rounded-[32px] bg-white/5 border border-white/10 focus:border-primary outline-none transition-all font-medium"
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
                  className="flex-1 py-4 rounded-[32px] font-bold text-white/40 hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting || products.length === 0}
                  className="flex-1 bg-primary text-black py-4 rounded-[32px] font-bold hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Add to Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
