import { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { 
  Sprout, 
  Plus, 
  Calendar, 
  TrendingUp, 
  Droplets, 
  Sun,
  Loader2,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

const CropCard = ({ crop }: any) => {
  const statusConfig: any = {
    'Planted': { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', icon: <Clock size={14} /> },
    'Growing': { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', icon: <TrendingUp size={14} /> },
    'Harvested': { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', icon: <CheckCircle2 size={14} /> },
    'Failed': { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', icon: <Clock size={14} /> }
  };

  const config = statusConfig[crop.status] || statusConfig['Planted'];

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 hover:border-border-bright transition-all duration-300">
      <div className="flex justify-between items-center mb-6">
        <div className="w-12 h-12 rounded-xl bg-bg-accent flex items-center justify-center text-primary border border-border-subtle">
          <Sprout size={24} />
        </div>
        <div 
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest"
          style={{ backgroundColor: config.bg, color: config.color }}
        >
          {config.icon}
          {crop.status}
        </div>
      </div>
      
      <div className="flex flex-col gap-5">
        <div>
          <h3 className="text-xl font-bold text-white">{crop.name}</h3>
          <p className="text-zinc-500 text-sm mt-1">{crop.variety || 'Organic Heritage'}</p>
        </div>
        
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 text-sm text-zinc-400 font-medium">
            <Calendar size={16} className="text-zinc-600" />
            <span>Planted: {new Date(crop.plantedDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-zinc-400 font-medium">
            <TrendingUp size={16} className="text-zinc-600" />
            <span>Growth: {crop.growthStage || '45%'}</span>
          </div>
        </div>

        <div className="h-2 w-full bg-bg-accent rounded-full overflow-hidden">
          <motion.div 
            className="h-full rounded-full" 
            initial={{ width: 0 }}
            animate={{ width: crop.growthStage || '45%' }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{ backgroundColor: config.color }}
          />
        </div>

        <div className="flex justify-between items-center mt-2">
          <div className="flex gap-2">
            <button className="w-9 h-9 rounded-lg bg-bg-accent text-zinc-400 flex items-center justify-center hover:text-primary transition-colors border border-border-subtle">
              <Droplets size={16} />
            </button>
            <button className="w-9 h-9 rounded-lg bg-bg-accent text-zinc-400 flex items-center justify-center hover:text-amber-500 transition-colors border border-border-subtle">
              <Sun size={16} />
            </button>
          </div>
          <button className="text-xs font-bold px-4 py-2 rounded-lg bg-bg-accent text-white border border-border-subtle hover:bg-border-subtle transition-all">
            Update Status
          </button>
        </div>
      </div>
    </div>
  );
};

const Crops = () => {
  const [crops, setCrops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const res = await apiClient.get('/crops');
        setCrops(res.data);
      } catch (err) {
        console.error('Failed to fetch crops', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCrops();
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Crop Management</h1>
          <p className="text-zinc-400 mt-1">Monitor and manage your farm's productivity and growth cycles.</p>
        </div>
        <button className="bg-primary text-black font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20">
          <Plus size={20} /> New Crop
        </button>
      </header>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {crops.length > 0 ? (
            crops.map((crop) => <CropCard key={crop.id || crop._id} crop={crop} />)
          ) : (
            // Mock data for demonstration
            [
              { id: '1', name: 'Premium Wheat', status: 'Growing', plantedDate: '2024-03-15', growthStage: '65%' },
              { id: '2', name: 'Organic Corn', status: 'Planted', plantedDate: '2024-04-02', growthStage: '15%' },
              { id: '3', name: 'Soybeans', status: 'Harvested', plantedDate: '2024-01-10', growthStage: '100%' }
            ].map(crop => <CropCard key={crop.id} crop={crop} />)
          )}
        </div>
      )}
    </div>
  );
};

export default Crops;
