import { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { Package, Plus, Search, MoreVertical, Loader2 } from 'lucide-react';

const Inventory = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await apiClient.get('/inventory');
        setItems(res.data);
      } catch (err) {
        console.error('Failed to fetch inventory', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Inventory Management</h1>
          <p className="text-zinc-400 mt-1">Track your seeds, fertilizers, and equipment.</p>
        </div>
        <button className="bg-primary text-black font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all">
          <Plus size={20} /> Add Item
        </button>
      </header>

      <div className="bg-bg-surface border border-border-subtle rounded-2xl overflow-hidden glass">
        <div className="p-6 border-b border-border-subtle">
          <div className="relative flex items-center max-w-md group">
            <Search size={18} className="absolute left-4 text-zinc-500 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search inventory..." 
              className="w-full bg-bg-accent border border-border-subtle rounded-xl py-2.5 pl-12 pr-4 focus:outline-none focus:border-primary/50 transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02]">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Item Name</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Category</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Quantity</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Unit</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {items.length > 0 ? items.map((item: any) => (
                  <tr key={item.id || item._id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-6 py-4"><span className="font-bold text-white group-hover:text-primary transition-colors">{item.itemName}</span></td>
                    <td className="px-6 py-4 text-zinc-400 text-sm">{item.category}</td>
                    <td className="px-6 py-4 text-white font-medium">{item.quantity}</td>
                    <td className="px-6 py-4 text-zinc-500 text-sm">{item.unit}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest">Low Stock</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"><MoreVertical size={16} /></button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <Package size={48} className="mx-auto mb-4 opacity-10 text-white" />
                      <p className="text-zinc-500 font-medium">No inventory items found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;
