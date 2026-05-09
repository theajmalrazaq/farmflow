import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Target, Plus, Trash2, Loader2, Activity,} from 'lucide-react';


const Cattle = () => {
  const [cattles, setCattles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCattle, setNewCattle] = useState({ type: 'Cow', count: 1, healthStatus: 'Healthy', purpose: 'Dairy' });
  const [submitting, setSubmitting] = useState(false);

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
      const res = await apiClient.post('/cattle', {
        ...newCattle,
        count: Number(newCattle.count)
      });
      setCattles([res.data, ...cattles]);
      setIsAddModalOpen(false);
      setNewCattle({ type: 'Cow', count: 1, healthStatus: 'Healthy', purpose: 'Dairy' });
    } catch (error) {
      console.error('Error adding cattle:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this livestock entry?')) return;
    try {
      await apiClient.delete(`/cattle/${id}`);
      setCattles(cattles.filter(c => c._id !== id));
    } catch (error) {
      console.error('Error deleting cattle:', error);
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
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-xl font-bold text-white ">Livestock Management</h1>
          <p className="text-white/40 mt-1 text-sm font-medium">Track your cattle, herds, and overall health status.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary text-black font-bold px-5 py-2.5 rounded-full flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all"
        >
          <Plus size={20} /> Add Livestock
        </button>
      </header>

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
                <button 
                  onClick={() => handleDelete(cattle._id)}
                  className="w-8 h-8 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
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

      {/* Add Cattle Modal */}

        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsAddModalOpen(false)}
            />
            <div 
              className="bg-bg-primary border border-white/10 w-full max-w-md rounded-[32px] p-6 relative z-10"
            >
              <h2 className="text-xl font-bold text-white  mb-6">Add Livestock</h2>
              <form onSubmit={handleAddCattle} className="flex flex-col gap-4">
                <div className="flex gap-4">
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-sm font-medium text-white/40">Animal Type</label>
                    <select 
                      className="w-full bg-bg-primary border border-white/10 rounded-full px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors appearance-none"
                      value={newCattle.type}
                      onChange={e => setNewCattle({...newCattle, type: e.target.value})}
                    >
                      <option value="Cow">Cow</option>
                      <option value="Sheep">Sheep</option>
                      <option value="Goat">Goat</option>
                      <option value="Chicken">Chicken</option>
                      <option value="Pig">Pig</option>
                      <option value="Horse">Horse</option>
                    </select>
                  </div>
                  
                  <div className="flex flex-col gap-1.5 w-1/3">
                    <label className="text-sm font-medium text-white/40">Quantity</label>
                    <input 
                      type="number" 
                      min="1"
                      required
                      className="w-full bg-bg-primary border border-white/10 rounded-full px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                      value={newCattle.count}
                      onChange={e => setNewCattle({...newCattle, count: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-white/40">Purpose</label>
                  <select 
                    className="w-full bg-bg-primary border border-white/10 rounded-full px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors appearance-none"
                    value={newCattle.purpose}
                    onChange={e => setNewCattle({...newCattle, purpose: e.target.value})}
                  >
                    <option value="Dairy">Dairy</option>
                    <option value="Meat">Meat</option>
                    <option value="Breeding">Breeding</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-white/40">Health Status</label>
                  <select 
                    className="w-full bg-bg-primary border border-white/10 rounded-full px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors appearance-none"
                    value={newCattle.healthStatus}
                    onChange={e => setNewCattle({...newCattle, healthStatus: e.target.value})}
                  >
                    <option value="Healthy">Healthy</option>
                    <option value="Sick">Sick</option>
                    <option value="Treatment">In Treatment</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>

                <div className="flex gap-3 mt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 px-4 py-3 rounded-full font-bold text-white/80 hover:bg-bg-primary/5 transition-colors border border-white/10"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="flex-1 px-4 py-3 rounded-full font-bold bg-primary text-black hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Save Entry'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

    </div>
  );
};

export default Cattle;
