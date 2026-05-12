import { useEffect, useState } from 'react';
import apiClient from '../../api/client';
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
  MapPin,
  LayoutGrid,
  Search,
  Pencil,
  Trash2
} from 'lucide-react';
import Dropdown from '../../components/ui/Dropdown';
import Modal from '../../components/modals/Modal';
import ConfirmModal from '../../components/modals/ConfirmModal';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';


const CropCard = ({ crop, onUpdate, onEdit }: any) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await apiClient.delete(`/crops/${crop._id}`);
      showToast('Crop deleted successfully', 'success');
      setIsDeleteModalOpen(false);
      onUpdate();
    } catch (err: any) {
      console.error('Failed to delete crop', err);
      showToast(err.response?.data?.message || 'Failed to delete crop', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const statusConfig: any = {
    'planning': { label: 'Planning', color: '#a1a1aa', bg: 'rgba(161, 161, 170, 0.1)', icon: <Clock size={14} /> },
    'growing': { label: 'Growing', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', icon: <TrendingUp size={14} /> },
    'harvesting': { label: 'Harvesting', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', icon: <TrendingUp size={14} /> },
    'harvested': { label: 'Harvested', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', icon: <CheckCircle2 size={14} /> },
    'failed': { label: 'Failed', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', icon: <X size={14} /> }
  };

  const config = statusConfig[crop.status] || statusConfig['planning'];

  const handleStatusChange = async (newStatus: string) => {
    try {
      setIsUpdating(true);
      await apiClient.put(`/crops/${crop._id}/status`, { status: newStatus });
      showToast(`Status updated to ${newStatus}`, 'success');
      setIsStatusOpen(false);
      onUpdate();
    } catch (err: any) {
      console.error('Failed to update status', err);
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-bg-primary/50 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 hover:border-primary/30 transition-all duration-300 group">
      <div className="flex justify-between items-center mb-6">
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-primary border border-white/10">
          <Sprout size={24} />
        </div>
        <div className="flex items-center gap-3">
          <div 
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black "
            style={{ backgroundColor: config.bg, color: config.color }}
          >
            {config.icon}
            {config.label}
          </div>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <button 
              onClick={() => onEdit(crop)}
              className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-all"
              title="Edit Crop"
            >
              <Pencil size={14} />
            </button>
            <button 
              onClick={() => setIsDeleteModalOpen(true)}
              className="w-8 h-8 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500/20 transition-all"
              title="Delete Crop"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Crop"
        message={`Are you sure you want to delete "${crop.name}"? This action cannot be undone.`}
        confirmText="Delete Crop"
        isLoading={isDeleting}
      />
      
      <div className="flex flex-col gap-5">
        <div>
          <h3 className="text-xl font-bold text-white leading-tight">{crop.name}</h3>
          <p className="text-white/40 text-xs font-bold uppercase tracking-wider mt-1">{crop.cropType}</p>
        </div>
        
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 text-sm text-white/40 font-medium">
            <Calendar size={16} className="text-white/30" />
            <span>Planted: {new Date(crop.plantedDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-white/40 font-medium">
            <MapPin size={16} className="text-white/30" />
            <span>{crop.location || 'Not specified'}</span>
          </div>
        </div>

        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-1000" 
            style={{ 
              width: crop.status === 'harvested' ? '100%' : (crop.status === 'growing' ? '60%' : '20%'), 
              backgroundColor: config.color 
            }}
          />
        </div>

        <div className="flex justify-between items-center mt-2 relative">
          <div className="flex gap-2">
            <Button size="icon" variant="secondary" className="w-10 h-10 rounded-2xl">
              <Droplets size={18} className="text-blue-400" />
            </Button>
            <Button size="icon" variant="secondary" className="w-10 h-10 rounded-2xl">
              <Sun size={18} className="text-amber-400" />
            </Button>
          </div>

          <div className="relative">
            {(user?.role === 'farmer' || (user?.role === 'employee' && user?.permissions?.crops)) && (
              <Button 
                variant="secondary" 
                size="sm" 
                className="rounded-2xl"
                onClick={() => setIsStatusOpen(!isStatusOpen)}
                isLoading={isUpdating}
              >
                Update Status
              </Button>
            )}

            {isStatusOpen && (
              <div className="absolute bottom-full right-0 mb-3 w-48 bg-bg-card border border-white/10 rounded-3xl p-2 z-50  animate-slideUp">
                {Object.keys(statusConfig).map((statusKey) => (
                  <button
                    key={statusKey}
                    onClick={() => handleStatusChange(statusKey)}
                    className={`w-full text-left px-4 py-2.5 rounded-2xl text-xs font-bold  transition-colors flex items-center gap-3 ${
                      crop.status === statusKey ? 'bg-primary/20 text-primary' : 'text-white/40 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: statusConfig[statusKey].color }}></span>
                    {statusConfig[statusKey].label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Crops = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [crops, setCrops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    cropType: 'vegetables',
    plantedDate: '',
    expectedHarvestDate: '',
    quantity: '',
    unit: 'kg',
    fieldArea: '',
    location: '',
    notes: ''
  });

  const fetchCrops = async () => {
    try {
      const res = await apiClient.get('/crops');
      setCrops(res.data.crops);
    } catch (err: any) {
      console.error('Failed to fetch crops', err);
      showToast('Failed to load crops data', 'error');
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
      if (editingId) {
        await apiClient.put(`/crops/${editingId}`, formData);
      } else {
        await apiClient.post('/crops', formData);
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({
        name: '',
        cropType: 'vegetables',
        plantedDate: '',
        expectedHarvestDate: '',
        quantity: '',
        unit: 'kg',
        fieldArea: '',
        location: '',
        notes: ''
      });
      showToast(editingId ? 'Crop updated successfully' : 'New crop added successfully', 'success');
      fetchCrops();
    } catch (err: any) {
      console.error('Failed to save crop', err);
      showToast(err.response?.data?.message || 'Failed to save crop', 'error');
    }
  };

  const handleEdit = (crop: any) => {
    setEditingId(crop._id);
    setFormData({
      name: crop.name,
      cropType: crop.cropType,
      plantedDate: new Date(crop.plantedDate).toISOString().split('T')[0],
      expectedHarvestDate: new Date(crop.expectedHarvestDate).toISOString().split('T')[0],
      quantity: crop.quantity.toString(),
      unit: crop.unit,
      fieldArea: crop.fieldArea?.toString() || '',
      location: crop.location || '',
      notes: crop.notes || ''
    });
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white ">Crop Management</h1>
          <p className="text-white/40 mt-1 text-sm font-medium">Monitor and manage your farm's productivity and growth cycles.</p>
        </div>
        {(user?.role === 'farmer' || (user?.role === 'employee' && user?.permissions?.crops)) && (
          <Button 
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Plus size={20} />}
          >
            New Crop
          </Button>
        )}
      </header>

      <div className="flex flex-col md:flex-row gap-4 mb-4 bg-white/5 p-4 rounded-[32px] border border-white/10">
        <div className="flex-1 relative flex items-center group">
          <Search size={18} className="absolute left-4 text-white/30 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search crops by name..." 
            className="w-full h-12 bg-bg-primary border border-white/10 rounded-full pl-12 pr-4 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 text-white transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {crops && crops.length > 0 ? (
            crops.map((crop) => (
              <CropCard 
                key={crop._id} 
                crop={crop} 
                onUpdate={fetchCrops} 
                onEdit={handleEdit} 
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-white/5/50 rounded-3xl border-2 border-dashed border-white/10">
              <Sprout size={48} className="mx-auto text-zinc-300 mb-4" />
              <p className="text-white/40 font-medium">No crops listed yet. Add your first crop to start tracking!</p>
            </div>
          )}
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingId(null);
          setFormData({
            name: '',
            cropType: 'vegetables',
            plantedDate: '',
            expectedHarvestDate: '',
            quantity: '',
            unit: 'kg',
            fieldArea: '',
            location: '',
            notes: ''
          });
        }}
        title={editingId ? "Edit Crop" : "Add New Crop"}
        subtitle={editingId ? "Modify crop details and schedule." : "Fill in the details to start tracking a new growth cycle."}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-bold text-white/80 mb-1.5">Crop Name</label>
            <input 
              type="text" 
              className="w-full px-5 py-2.5 rounded-[20px] bg-white/5 border border-white/10 focus:border-primary outline-none transition-all font-medium text-white"
              placeholder="e.g. Organic Heritage Tomatoes"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-white/80 mb-1.5">Crop Category</label>
            <Dropdown 
              value={formData.cropType}
              onChange={(val) => setFormData({...formData, cropType: val})}
              icon={<LayoutGrid size={18} />}
              options={[
                { value: 'vegetables', label: 'Vegetables' },
                { value: 'fruits', label: 'Fruits' },
                { value: 'grains', label: 'Grains' },
                { value: 'dairy', label: 'Dairy' },
                { value: 'eggs', label: 'Eggs' },
                { value: 'honey', label: 'Honey' },
                { value: 'other', label: 'Other' },
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-white/80 mb-1.5">Field / Section Name</label>
            <div className="relative">
              <MapPin size={18} className="absolute left-5 top-4 text-white/30" />
              <input 
                type="text" 
                className="w-full pl-12 pr-5 py-2.5 rounded-[20px] bg-white/5 border border-white/10 focus:border-primary outline-none transition-all font-medium text-white"
                placeholder="e.g. North Field"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-white/80 mb-1.5">Area (Acres)</label>
            <input 
              type="number" 
              className="w-full px-5 py-2.5 rounded-[20px] bg-white/5 border border-white/10 focus:border-primary outline-none transition-all font-medium text-white"
              placeholder="e.g. 5"
              value={formData.fieldArea}
              onChange={(e) => setFormData({...formData, fieldArea: e.target.value})}
            />
          </div>

          <div className="col-span-2 grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-bold text-white/80 mb-1.5">Estimated Quantity</label>
              <input 
                type="number" 
                className="w-full px-5 py-2.5 rounded-[20px] bg-white/5 border border-white/10 focus:border-primary outline-none transition-all font-medium text-white"
                placeholder="e.g. 500"
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
                options={[
                  { value: 'kg', label: 'kg' },
                  { value: 'lbs', label: 'lbs' },
                  { value: 'tons', label: 'tons' },
                  { value: 'liters', label: 'liters' },
                  { value: 'pieces', label: 'pieces' },
                ]}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-white/80 mb-1.5">Planted Date</label>
            <input 
              type="date" 
              className="w-full px-5 py-2.5 rounded-[20px] bg-white/5 border border-white/10 focus:border-primary outline-none transition-all font-medium text-white"
              value={formData.plantedDate}
              onChange={(e) => setFormData({...formData, plantedDate: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-white/80 mb-1.5">Exp. Harvest Date</label>
            <input 
              type="date" 
              className="w-full px-5 py-2.5 rounded-[20px] bg-white/5 border border-white/10 focus:border-primary outline-none transition-all font-medium text-white"
              value={formData.expectedHarvestDate}
              onChange={(e) => setFormData({...formData, expectedHarvestDate: e.target.value})}
              required
            />
          </div>

          <div className="col-span-2 flex gap-4 mt-4">
            <Button 
              type="button" 
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
            >
              Save Crop
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Crops;
