import { useState, useEffect } from 'react';
import { Shield, Trash2, CheckCircle2,Search, MapPin, Package, Loader2, Lock } from 'lucide-react';
import apiClient from '../api/client';

const SuperAdmin = () => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'farms' | 'products'>('farms');
  const [farms, setFarms] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Ajmal@002') {
      setIsAuthenticated(true);
      fetchData();
    } else {
      alert('Incorrect Password');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'farms') {
        const res = await apiClient.get('/farms');
        setFarms(res.data.farms || []);
      } else {
        const res = await apiClient.get('/products');
        setProducts(res.data.products || []);
      }
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [activeTab, isAuthenticated]);

  const deleteFarm = async (farmId: string) => {
    if (!window.confirm('Are you sure you want to delete this farm? This action cannot be undone.')) return;
    try {
      await apiClient.delete(`/farms/${farmId}`);
      setFarms(farms.filter(f => f._id !== farmId));
    } catch (err) {
      alert('Failed to delete farm');
    }
  };

  const approveProduct = async (productId: string) => {
    try {
      await apiClient.put(`/products/${productId}/approve`);
      setProducts(products.map(p => p._id === productId ? { ...p, status: 'approved' } : p));
    } catch (err) {
      alert('Failed to approve product');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-bg-card border border-white/10 rounded-[40px] p-10 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 text-primary">
            <Lock size={40} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">SuperAdmin Access</h1>
          <p className="text-white/40 mb-8">Enter your master password to continue</p>
          
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input 
              type="password" 
              placeholder="Enter Password" 
              className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary transition-all text-center text-xl tracking-widest"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            <button className="bg-primary text-black font-bold py-4 rounded-2xl hover:brightness-110 transition-all text-lg">
              Unlock Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-dark text-white pt-32 pb-24">
      <div className="max-w-[1400px] mx-auto px-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold tracking-widest uppercase text-xs mb-4">
              <Shield size={16} /> SYSTEM OVERSEER
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter">SuperAdmin <span className="text-primary">Console</span></h1>
          </div>
          
          <div className="flex bg-white/5 p-2 rounded-[32px] border border-white/10">
            <button 
              onClick={() => setActiveTab('farms')}
              className={`px-8 py-3 rounded-[24px] font-bold transition-all ${activeTab === 'farms' ? 'bg-primary text-black' : 'text-white/40 hover:text-white'}`}
            >
              Farms
            </button>
            <button 
              onClick={() => setActiveTab('products')}
              className={`px-8 py-3 rounded-[24px] font-bold transition-all ${activeTab === 'products' ? 'bg-primary text-black' : 'text-white/40 hover:text-white'}`}
            >
              Products
            </button>
          </div>
        </header>

        <div className="bg-white/5 border border-white/10 rounded-[48px] overflow-hidden">
          <div className="p-8 border-b border-white/10 flex flex-col md:flex-row gap-4 justify-between items-center bg-white/[0.02]">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} />
              <input 
                type="text" 
                placeholder={`Search ${activeTab}...`}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary/50 text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="text-white/40 font-medium">
              Total {activeTab}: {activeTab === 'farms' ? farms.length : products.length}
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary" size={48} /></div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 text-white/30 uppercase text-xs font-bold tracking-widest">
                    <th className="px-8 py-6">{activeTab === 'farms' ? 'Farm Details' : 'Product Details'}</th>
                    <th className="px-8 py-6">{activeTab === 'farms' ? 'Location' : 'Price / Category'}</th>
                    <th className="px-8 py-6">Status</th>
                    <th className="px-8 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTab === 'farms' ? (
                    farms.filter(f => f.farmName.toLowerCase().includes(searchTerm.toLowerCase())).map((farm) => (
                      <tr key={farm._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary overflow-hidden">
                              {farm.logo ? <img src={farm.logo} alt="" className="w-full h-full object-cover" /> : farm.farmName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-white text-lg">{farm.farmName}</div>
                              <div className="text-white/30 text-sm">{farm.owner?.email || 'No email'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2 text-white/60">
                            <MapPin size={16} className="text-primary" />
                            {farm.address || 'Global'}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-green-500/20">
                            Active
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button 
                            onClick={() => deleteFarm(farm._id)}
                            className="w-12 h-12 rounded-xl border border-red-500/20 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all ml-auto"
                          >
                            <Trash2 size={20} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((product) => (
                      <tr key={product._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary overflow-hidden">
                              {product.images?.[0] ? <img src={product.images[0]} alt="" className="w-full h-full object-cover" /> : <Package size={24} />}
                            </div>
                            <div>
                              <div className="font-bold text-white text-lg">{product.name}</div>
                              <div className="text-white/30 text-sm">Farm: {product.farm?.farmName || 'Unknown'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="font-bold text-primary">Rs. {product.price}</div>
                          <div className="text-white/30 text-xs uppercase font-bold">{product.category}</div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                            product.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                          }`}>
                            {product.status || 'Pending'}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex gap-2 justify-end">
                            {product.status !== 'approved' && (
                              <button 
                                onClick={() => approveProduct(product._id)}
                                className="w-12 h-12 rounded-xl border border-green-500/20 text-green-500 flex items-center justify-center hover:bg-green-500 hover:text-white transition-all"
                              >
                                <CheckCircle2 size={20} />
                              </button>
                            )}
                            <button className="w-12 h-12 rounded-xl border border-red-500/20 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdmin;
