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
  Clock,
  X,
  MapPin
} from 'lucide-react';


const CropCard = ({ crop }: any) => {
  const statusConfig: any = {
    'Planted': { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', icon: <Clock size={14} /> },
    'Growing': { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', icon: <TrendingUp size={14} /> },
    'Harvested': { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', icon: <CheckCircle2 size={14} /> },
    'Failed': { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', icon: <Clock size={14} /> }
  };

  const config = statusConfig[crop.status] || statusConfig['Planted'];

  return (
    <div className="bg-bg-primary/50 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 hover:border-border-bright transition-all duration-300">
      <div className="flex justify-between items-center mb-6">
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-primary border border-white/10">
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
          <p className="text-white/40 text-sm mt-1">{crop.cropType || 'Organic Heritage'}</p>
        </div>
        
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 text-sm text-white/40 font-medium">
            <Calendar size={16} className="text-white/40" />
            <span>Planted: {new Date(crop.plantedDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-white/40 font-medium">
            <TrendingUp size={16} className="text-white/40" />
            <span>Field: {crop.fieldArea || 'Section A'}</span>
          </div>
        </div>

        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full" 
            style={{ width: crop.status === 'Harvested' ? '100%' : '45%', backgroundColor: config.color }}
          />
        </div>

        <div className="flex justify-between items-center mt-2">
          <div className="flex gap-2">
            <button className="w-9 h-9 rounded-xl bg-white/5 text-white/40 flex items-center justify-center hover:text-primary transition-colors border border-white/10">
              <Droplets size={16} />
            </button>
            <button className="w-9 h-9 rounded-xl bg-white/5 text-white/40 flex items-center justify-center hover:text-amber-500 transition-colors border border-white/10">
              <Sun size={16} />
            </button>
          </div>
          <button className="text-xs font-bold px-4 py-2 rounded-xl bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-all">
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    cropType: 'Vegetable',
    plantedDate: '',
    expectedHarvestDate: '',
    quantity: '',
    unit: 'kg',
    fieldArea: '',
    notes: ''
  });

  const fetchCrops = async () => {
    try {
      const res = await apiClient.get('/crops');
      setCrops(res.data.crops);
    } catch (err) {
      console.error('Failed to fetch crops', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrops();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/crops', formData);
      setIsModalOpen(false);
      setFormData({
        name: '',
        cropType: 'Vegetable',
        plantedDate: '',
        expectedHarvestDate: '',
        quantity: '',
        unit: 'kg',
        fieldArea: '',
        notes: ''
      });
      fetchCrops();
    } catch (err) {
      console.error('Failed to add crop', err);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-xl font-bold text-white ">Crop Management</h1>
          <p className="text-white/40 mt-1 text-sm font-medium">Monitor and manage your farm's productivity and growth cycles.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-black font-bold px-5 py-2.5 rounded-full flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all"
        >
          <Plus size={20} /> New Crop
        </button>
      </header>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {crops && crops.length > 0 ? (
            crops.map((crop) => <CropCard key={crop._id} crop={crop} />)
          ) : (
            <div className="col-span-full py-20 text-center bg-white/5/50 rounded-3xl border-2 border-dashed border-white/10">
              <Sprout size={48} className="mx-auto text-zinc-300 mb-4" />
              <p className="text-white/40 font-medium">No crops listed yet. Add your first crop to start tracking!</p>
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-sm p-4">
          <div className="bg-bg-primary w-full max-w-2xl rounded-[32px] border border-white/10 overflow-hidden">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
              <div>
                <h2 className="text-xl font-bold text-white ">Add New Crop</h2>
                <p className="text-white/40 text-sm">Fill in the details to start tracking a new growth cycle.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/30">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 grid grid-cols-2 gap-6 bg-bg-primary">
              <div className="col-span-2">
                <label className="block text-sm font-bold text-white/80 mb-2">Crop Name</label>
                <input 
                  type="text" 
                  className="w-full px-5 py-3.5 rounded-[32px] bg-white/5 border border-white/10 focus:border-primary outline-none transition-all font-medium"
                  placeholder="e.g. Organic Heritage Tomatoes"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white/80 mb-2">Crop Category</label>
                <select 
                  className="w-full px-5 py-3.5 rounded-[32px] bg-white/5 border border-white/10 focus:border-primary outline-none transition-all font-medium"
                  value={formData.cropType}
                  onChange={(e) => setFormData({...formData, cropType: e.target.value})}
                >
                  <option value="Vegetable">Vegetable</option>
                  <option value="Fruit">Fruit</option>
                  <option value="Grain">Grain</option>
                  <option value="Legume">Legume</option>
                  <option value="Herb">Herb</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-white/80 mb-2">Field / Section</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-5 top-4 text-white/30" />
                  <input 
                    type="text" 
                    className="w-full pl-12 pr-5 py-3.5 rounded-[32px] bg-white/5 border border-white/10 focus:border-primary outline-none transition-all font-medium"
                    placeholder="e.g. North Field"
                    value={formData.fieldArea}
                    onChange={(e) => setFormData({...formData, fieldArea: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-white/80 mb-2">Planted Date</label>
                <input 
                  type="date" 
                  className="w-full px-5 py-3.5 rounded-[32px] bg-white/5 border border-white/10 focus:border-primary outline-none transition-all font-medium"
                  value={formData.plantedDate}
                  onChange={(e) => setFormData({...formData, plantedDate: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white/80 mb-2">Exp. Harvest Date</label>
                <input 
                  type="date" 
                  className="w-full px-5 py-3.5 rounded-[32px] bg-white/5 border border-white/10 focus:border-primary outline-none transition-all font-medium"
                  value={formData.expectedHarvestDate}
                  onChange={(e) => setFormData({...formData, expectedHarvestDate: e.target.value})}
                  required
                />
              </div>

              <div className="col-span-2 flex gap-4 mt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 rounded-[32px] font-bold text-white/40 hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-primary text-black py-4 rounded-[32px] font-bold hover:brightness-110 transition-all shadow-xl shadow-zinc-900/10"
                >
                  Save Crop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Crops;
