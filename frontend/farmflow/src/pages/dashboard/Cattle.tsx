import { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { Target, Plus, Trash2, Loader2, Activity, ShoppingCart,  LayoutGrid, HeartPulse, Shield, Search, Pencil } from 'lucide-react';
import Dropdown from '../../components/ui/Dropdown';
import Modal from '../../components/modals/Modal';
import ConfirmModal from '../../components/modals/ConfirmModal';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';


const Cattle = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [cattles, setCattles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCattle, setEditingCattle] = useState<any>(null);
  const [newCattle, setNewCattle] = useState({ type: 'Cow', count: 1, healthStatus: 'Healthy', purpose: 'Dairy' });
  const [submitting, setSubmitting] = useState(false);
  const [listingCattle, setListingCattle] = useState<any>(null);
  const [listingData, setListingData] = useState({ price: '', description: '' });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchCattle();
  }, []);

  const fetchCattle = async () => {
    try {
      const res = await apiClient.get('/cattle');
      setCattles(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error fetching cattle:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCattle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingCattle) {
        const res = await apiClient.put(`/cattle/${editingCattle._id}`, {
          ...newCattle,
          count: Number(newCattle.count)
        });
        setCattles(cattles.map(c => c._id === editingCattle._id ? res.data : c));
      } else {
        const res = await apiClient.post('/cattle', {
          ...newCattle,
          count: Number(newCattle.count)
        });
        setCattles([res.data, ...cattles]);
      }
      setIsAddModalOpen(false);
      setEditingCattle(null);
      setNewCattle({ type: 'Cow', count: 1, healthStatus: 'Healthy', purpose: 'Dairy' });
    } catch (error) {
      console.error('Error saving cattle:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (cattle: any) => {
    setEditingCattle(cattle);
    setNewCattle({
      type: cattle.type,
      count: cattle.count,
      healthStatus: cattle.healthStatus,
      purpose: cattle.purpose
    });
    setIsAddModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/cattle/${deletingId}`);
      setCattles(cattles.filter(c => c._id !== deletingId));
      showToast('Livestock entry removed', 'info');
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting cattle:', error);
      showToast('Failed to delete livestock entry', 'error');
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  const handleListForSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.post('/products', {
        name: `${listingCattle.type} (${listingCattle.purpose})`,
        description: listingData.description || `Healthy ${listingCattle.type} livestock available for purchase. Purpose: ${listingCattle.purpose}.`,
        price: Number(listingData.price),
        quantity: listingCattle.count,
        category: 'livestock',
      });
      showToast('Livestock listed in store successfully! Awaiting SuperAdmin approval.', 'success');
      setListingCattle(null);
      setListingData({ price: '', description: '' });
    } catch (error: any) {
      console.error('Error listing cattle:', error);
      showToast(error.response?.data?.message || 'Failed to list livestock', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'Healthy': return 'text-primary bg-primary/10 border-primary/20';
      case 'Sick': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'Treatment': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      default: return 'text-white/40 bg-white/10 border-white/10';
    }
  };

  return (
    <div className="w-full">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-xl font-bold text-white ">Livestock Management</h1>
          <p className="text-white/40 mt-1 text-sm font-medium">Track your cattle, herds, and overall health status.</p>
        </div>
        {(user?.role === 'farmer' || (user?.role === 'employee' && user?.permissions?.cattle)) && (
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<Plus size={20} />}
          >
            Add Livestock
          </Button>
        )}
      </header>

      <div className="flex flex-col md:flex-row gap-4 mb-12 bg-white/5 p-4 rounded-[32px] border border-white/10">
        <div className="flex-1 relative flex items-center group">
          <Search size={18} className="absolute left-4 text-white/30 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search livestock by type or status..." 
            className="w-full h-12 bg-bg-primary border border-white/10 rounded-full pl-12 pr-4 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 text-white transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(cattles || []).map((cattle) => (
            <div 
              key={cattle._id}
              className="bg-bg-primary/50 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 relative group overflow-hidden"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="font-bold text-2xl text-white flex items-center gap-2">
                    {cattle.count}x {cattle.type}
                  </h3>
                  <p className="text-white/40 text-sm mt-1">Purpose: {cattle.purpose}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(cattle)}
                    className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/20"
                  >
                    <Pencil size={14} />
                  </button>
                  <button 
                    onClick={() => {
                      setDeletingId(cattle._id);
                      setIsDeleteModalOpen(true);
                    }}
                    className="w-8 h-8 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <button 
                onClick={() => setListingCattle(cattle)}
                className="w-full bg-white/5 border border-white/10 hover:border-primary/30 text-white/80 hover:text-primary py-3 rounded-2xl flex items-center justify-center gap-2 transition-all mb-6 font-bold text-sm"
              >
                <ShoppingCart size={18} /> List for Sale
              </button>
              
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-sm font-medium text-white/40 flex items-center gap-1.5">
                  <Activity size={16} /> Status
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getHealthColor(cattle.healthStatus)}`}>
                  {cattle.healthStatus}
                </span>
              </div>
            </div>
          ))}
          
          {cattles.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-white/10 rounded-[32px]">
              <Target size={48} className="mx-auto text-white/40 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Livestock Found</h3>
              <p className="text-white/40">Start tracking your herds by adding new livestock.</p>
            </div>
          )}
        </div>
      )}

      

      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingCattle(null);
          setNewCattle({ type: 'Cow', count: 1, healthStatus: 'Healthy', purpose: 'Dairy' });
        }}
        title={editingCattle ? "Edit Livestock" : "Add Livestock"}
        subtitle={editingCattle ? "Update the details of your livestock entry." : "Track your herds and overall health status."}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddCattle} className="flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-sm font-medium text-white/40">Animal Type</label>
              <Dropdown 
                value={newCattle.type}
                onChange={val => setNewCattle({...newCattle, type: val})}
                icon={<LayoutGrid size={18} />}
                options={[
                  { value: 'Cow', label: 'Cow' },
                  { value: 'Sheep', label: 'Sheep' },
                  { value: 'Goat', label: 'Goat' },
                  { value: 'Chicken', label: 'Chicken' },
                  { value: 'Pig', label: 'Pig' },
                  { value: 'Horse', label: 'Horse' },
                ]}
              />
            </div>
            
            <div className="flex flex-col gap-1.5 w-1/3">
              <label className="text-sm font-medium text-white/40">Quantity</label>
              <input 
                type="number" 
                min="1"
                required
                className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-white focus:outline-none focus:border-primary/50 transition-colors"
                value={newCattle.count}
                onChange={e => setNewCattle({...newCattle, count: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-white/40">Purpose</label>
            <Dropdown 
              value={newCattle.purpose}
              onChange={val => setNewCattle({...newCattle, purpose: val})}
              icon={<Shield size={18} />}
              options={[
                { value: 'Dairy', label: 'Dairy' },
                { value: 'Meat', label: 'Meat' },
                { value: 'Breeding', label: 'Breeding' },
                { value: 'Other', label: 'Other' },
              ]}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-white/40">Health Status</label>
            <Dropdown 
              value={newCattle.healthStatus}
              onChange={val => setNewCattle({...newCattle, healthStatus: val})}
              icon={<HeartPulse size={18} />}
              options={[
                { value: 'Healthy', label: 'Healthy' },
                { value: 'Sick', label: 'Sick' },
                { value: 'Treatment', label: 'In Treatment' },
                { value: 'Unknown', label: 'Unknown' },
              ]}
            />
          </div>

          <div className="flex gap-3 mt-4">
            <button 
              type="button" 
              onClick={() => setIsAddModalOpen(false)}
              className="flex-1 px-4 py-2.5 rounded-full font-bold text-white/40 hover:bg-white/5 transition-colors border border-white/10"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={submitting}
              className="flex-1 px-4 py-2.5 rounded-full font-bold bg-primary text-black hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Save Entry'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal 
        isOpen={!!listingCattle} 
        onClose={() => setListingCattle(null)}
        title="List Livestock for Sale"
        subtitle="Submit your listing for SuperAdmin approval."
        maxWidth="max-w-md"
      >
        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 mb-6">
          <p className="text-xs text-white/40 uppercase font-bold tracking-widest mb-1">Listing details</p>
          <p className="text-white font-bold">{listingCattle?.count}x {listingCattle?.type} ({listingCattle?.purpose})</p>
        </div>

        <form onSubmit={handleListForSale} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-white/40 ml-2">Sale Price (per animal)</label>
            <div className="relative flex items-center group">
              <span className="absolute left-4 text-white/30 font-bold">Rs.</span>
              <input 
                type="number" 
                required
                placeholder="e.g. 150000"
                className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 transition-colors font-medium"
                value={listingData.price}
                onChange={e => setListingData({...listingData, price: e.target.value})}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-white/40 ml-2">Sale Description</label>
            <textarea 
              placeholder="Describe your livestock for potential buyers..."
              className="w-full bg-white/5 border border-white/10 rounded-3xl py-4 px-6 text-white focus:outline-none focus:border-primary/50 transition-colors font-medium min-h-[120px]"
              value={listingData.description}
              onChange={e => setListingData({...listingData, description: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            className="w-full bg-primary text-black font-bold py-4 rounded-full hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {submitting ? <Loader2 className="animate-spin" size={20} /> : 'List in Store'}
          </button>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingId(null);
        }}
        onConfirm={handleDelete}
        title="Remove Livestock"
        message="Are you sure you want to remove this livestock entry? This will delete all associated records."
        confirmText="Remove Entry"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Cattle;
