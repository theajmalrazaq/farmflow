import { useState, useEffect } from 'react';
import { Shield, Trash2, CheckCircle2, Search, MapPin, Package, Loader2, XCircle, UserCircle} from 'lucide-react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../context/ToastContext';

const SuperAdmin = () => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'farms' | 'products'>('farms');
  const [farms, setFarms] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText: string;
    variant: 'danger' | 'primary' | 'warning';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: '',
    variant: 'danger'
  });
  const [processingAction, setProcessingAction] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'farms') {
        const res = await apiClient.get('/farms');
        setFarms(res.data.farms || []);
      } else {
        const res = await apiClient.get('/products?all=true');
        setProducts(res.data.products || []);
      }
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const deleteFarm = (farmId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Farm',
      message: 'Are you sure you want to delete this farm? This action cannot be undone and will remove all associated data.',
      confirmText: 'Delete Farm',
      variant: 'danger',
      onConfirm: async () => {
        setProcessingAction(true);
        try {
          await apiClient.delete(`/farms/${farmId}`);
          setFarms(farms.filter(f => f._id !== farmId));
          showToast('Farm deleted successfully', 'success');
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (err) {
          showToast('Failed to delete farm', 'error');
        } finally {
          setProcessingAction(false);
        }
      }
    });
  };

  const approveProduct = async (productId: string) => {
    try {
      await apiClient.put(`/products/${productId}/approve`);
      setProducts(products.map(p => p._id === productId ? { ...p, status: 'approved' } : p));
    } catch (err) {
      showToast('Failed to approve product', 'error');
    }
  };

  const rejectProduct = (productId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Reject Product',
      message: 'Are you sure you want to reject this product? It will not be visible in the marketplace.',
      confirmText: 'Reject Product',
      variant: 'warning',
      onConfirm: async () => {
        setProcessingAction(true);
        try {
          await apiClient.put(`/products/${productId}/reject`);
          setProducts(products.map(p => p._id === productId ? { ...p, status: 'rejected' } : p));
          showToast('Product rejected', 'info');
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (err) {
          showToast('Failed to reject product', 'error');
        } finally {
          setProcessingAction(false);
        }
      }
    });
  };

  const deleteProduct = (productId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Product',
      message: 'Are you sure you want to permanently delete this product? This action cannot be undone.',
      confirmText: 'Delete Permanently',
      variant: 'danger',
      onConfirm: async () => {
        setProcessingAction(true);
        try {
          await apiClient.delete(`/products/${productId}`);
          setProducts(products.filter(p => p._id !== productId));
          showToast('Product deleted successfully', 'success');
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (err) {
          showToast('Failed to delete product', 'error');
        } finally {
          setProcessingAction(false);
        }
      }
    });
  };

  const filteredFarms = farms.filter(f => 
    f.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.farmName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
             Welcome, {user?.name} <Shield size={18} className="text-primary" />
          </h1>
          <p className="text-white/40 mt-1 text-sm font-medium">System Overseer: Global overview and approvals.</p>
        </div>
        
        <div className="flex bg-white/5 p-1 rounded-full border border-white/10">
          <Button 
            variant={activeTab === 'farms' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => { setActiveTab('farms'); setSearchTerm(''); }}
            className={`rounded-full px-6 font-bold ${activeTab !== 'farms' && 'text-white/40'}`}
          >
            Manage Farms
          </Button>
          <Button 
            variant={activeTab === 'products' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => { setActiveTab('products'); setSearchTerm(''); }}
            className={`rounded-full px-6 font-bold ${activeTab !== 'products' && 'text-white/40'}`}
          >
            Product Approvals
          </Button>
        </div>
      </header>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
        <input 
          type="text" 
          placeholder={`Search ${activeTab === 'farms' ? 'farms...' : 'products...'}`}
          className="w-full bg-bg-primary/50 backdrop-blur-md border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {activeTab === 'farms' ? (
            filteredFarms.length > 0 ? (
              filteredFarms.map(farm => (
                <div key={farm._id} className="bg-bg-primary/50 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-primary/30 transition-all">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-primary overflow-hidden border border-white/10">
                      {farm.logo ? <img src={farm.logo} alt={farm.farmName} className="w-full h-full object-cover" /> : <UserCircle size={32} />}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">{farm.farmName || 'Untitled Farm'}</h3>
                      <p className="text-white/40 text-sm">{farm.name} • {farm.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8 text-sm">
                    <div className="flex flex-col gap-1">
                      <span className="text-white/20 uppercase tracking-widest text-[10px] font-black">Location</span>
                      <div className="flex items-center gap-1.5 text-white/60">
                        <MapPin size={14} className="text-primary" />
                        {farm.address || 'Global'}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-white/20 uppercase tracking-widest text-[10px] font-black">Status</span>
                      <span className="px-2.5 py-0.5 bg-green-500/10 text-green-500 rounded-full text-[10px] font-black uppercase border border-green-500/20">
                        Active
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="icon"
                      variant="danger"
                      onClick={() => deleteFarm(farm._id)}
                      className="rounded-full"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center border-2 border-dashed border-white/10 rounded-[40px]">
                <Shield size={48} className="mx-auto text-white/10 mb-4" />
                <p className="text-white/40">No farms found matching your search.</p>
              </div>
            )
          ) : (
            filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <div key={product._id} className="bg-bg-primary/50 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-primary/30 transition-all">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-primary overflow-hidden border border-white/10">
                      {product.image ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" /> : <Package size={32} />}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">{product.name}</h3>
                      <p className="text-white/40 text-sm">Farmer: {product.farmer?.farmName || 'Unknown'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 text-sm">
                    <div className="flex flex-col gap-1">
                      <span className="text-white/20 uppercase tracking-widest text-[10px] font-black">Price</span>
                      <span className="text-white font-bold text-lg">Rs. {product.price}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-white/20 uppercase tracking-widest text-[10px] font-black">Status</span>
                      <span className={`w-fit px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                        product.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                        product.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                        'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                      }`}>
                        {product.status || 'pending'}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {product.status !== 'approved' && (
                      <Button 
                        size="sm"
                        onClick={() => approveProduct(product._id)}
                        leftIcon={<CheckCircle2 size={16} />}
                      >
                        Approve
                      </Button>
                    )}
                    {product.status !== 'rejected' && (
                      <Button 
                        size="sm"
                        variant="secondary"
                        onClick={() => rejectProduct(product._id)}
                        leftIcon={<XCircle size={16} />}
                      >
                        Reject
                      </Button>
                    )}
                    <Button 
                      size="icon"
                      variant="danger"
                      onClick={() => deleteProduct(product._id)}
                      className="rounded-full h-10 w-10"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center border-2 border-dashed border-white/10 rounded-[40px]">
                <Package size={48} className="mx-auto text-white/10 mb-4" />
                <p className="text-white/40">No products found awaiting review.</p>
              </div>
            )
          )}
        </div>
      )}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        variant={confirmModal.variant}
        isLoading={processingAction}
      />
    </div>
  );
};

export default SuperAdmin;
