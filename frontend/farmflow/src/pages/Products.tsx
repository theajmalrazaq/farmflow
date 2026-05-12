import { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, ShoppingCart, Filter, Loader2, ShoppingBag, X, Edit, Trash2, Clock, CheckCircle2, XCircle, LayoutGrid } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Dropdown from '../components/Dropdown';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import Button from '../components/Button';
import { useToast } from '../context/ToastContext';

const ProductCard = ({ product, onAddToCart, isAdminView, onDelete, onEdit }: any) => {
  const stock = product.quantity ?? 0;
  const isOutOfStock = stock === 0;
  const isLowStock = stock > 0 && stock <= 10;
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(product._id);
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div 
      className={`group bg-bg-primary/50 backdrop-blur-xl border rounded-[32px] overflow-hidden transition-all duration-500 ${isOutOfStock ? 'border-white/5 opacity-75' : 'border-white/5 hover:border-primary/30 /20'}`}
    >
      <Link to={`/product/${product._id}`} className="h-64 relative overflow-hidden bg-white/5 block">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name} 
            className={`w-full h-full object-cover transition-transform duration-700 ${!isOutOfStock && 'group-hover:scale-110'}`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-300 gap-3">
            <ShoppingBag size={48} className="opacity-20" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">No Harvest Image</span>
          </div>
        )}

        
        
        <div className="absolute top-4 left-4 bg-primary/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
          {product.category || 'Fresh'}
        </div>

        
        {!isAdminView && (
          <div className={`absolute top-4 right-4 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full backdrop-blur-md ${
            isOutOfStock 
              ? 'bg-red-500 text-white' 
              : isLowStock 
              ? 'bg-amber-400 text-white' 
              : 'bg-white/90 text-primary'
          }`}>
            {isOutOfStock ? 'Out of Stock' : isLowStock ? `Only ${stock} left` : `${stock} kg`}
          </div>
        )}

        
        {isOutOfStock && !isAdminView && (
          <div className="absolute inset-0 bg-primary/50 backdrop-blur-sm flex items-center justify-center">
            <span className="bg-white/5 text-white font-bold text-xs uppercase tracking-widest px-5 py-2.5 rounded-[32px]">
              Out of Stock
            </span>
          </div>
        )}
      </Link>
      
      <div className="p-6 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <Link to={`/product/${product._id}`}>
              <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors leading-tight mb-1">{product.name}</h3>
            </Link>
            {!isAdminView && product.farmer && (
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10px] text-white/40 font-medium uppercase tracking-wider">from</span>
                {product.farmer.farmSlug ? (
                  <Link 
                    to={`/farm/${product.farmer.farmSlug}`}
                    className="text-xs text-primary font-bold hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {product.farmer.farmName || product.farmer.name}
                  </Link>
                ) : (
                  <span className="text-xs text-primary font-bold">{product.farmer.farmName || product.farmer.name}</span>
                )}
              </div>
            )}
            {isAdminView && (
              <div className="flex flex-col gap-1.5">
                <span className={`w-fit text-[10px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 rounded-md ${isOutOfStock ? 'bg-red-500/10 text-red-400' : isLowStock ? 'bg-amber-400/10 text-amber-400' : 'bg-primary/10 text-primary'}`}>
                  Stock: {stock}
                </span>
                <span className={`w-fit inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 rounded-md ${
                  product.status === 'approved' 
                    ? 'bg-green-500/10 text-green-400' 
                    : product.status === 'rejected'
                    ? 'bg-red-500/10 text-red-400'
                    : 'bg-amber-400/10 text-amber-400'
                }`}>
                  {product.status === 'approved' ? <CheckCircle2 size={10} /> : product.status === 'rejected' ? <XCircle size={10} /> : <Clock size={10} />}
                  {product.status || 'pending'}
                </span>
              </div>
            )}
          </div>

        </div>
        
        <p className="text-white/40 text-sm line-clamp-2 leading-relaxed font-medium">
          {product.description || 'Premium organic product directly from local farms.'}
        </p>

        
        {!isAdminView && (
          <div className="flex items-center gap-2">
            {isOutOfStock ? (
              <span className="text-[10px] font-bold uppercase tracking-widest text-red-400 bg-red-400/10 border border-red-400/20 px-2.5 py-1 rounded-xl">
                Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-xl">
                Only {stock} left
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-xl">
                {stock} in stock
              </span>
            )}
          </div>
        )}
        
        <div className="flex justify-between items-center mt-2 pt-4 border-t border-white/5">
          <div className="flex flex-col">
            <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest mb-0.5">
              {product.category === 'livestock' ? 'Per animal' : 'Per kg'}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-primary text-sm font-bold">Rs.</span>
              <span className="text-3xl font-bold text-white er">{product.price}</span>
            </div>
          </div>
          
          {isAdminView ? (
            <div className="flex gap-2">
              <Button 
                size="icon"
                variant="secondary"
                onClick={() => onEdit(product)} 
              >
                <Edit size={20} />
              </Button>
              <Button 
                size="icon"
                variant="danger"
                onClick={() => setIsDeleteModalOpen(true)} 
              >
                <Trash2 size={20} />
              </Button>
            </div>
          ) : (
            <Button 
              size="icon"
              variant={isOutOfStock ? 'secondary' : 'primary'}
              onClick={() => !isOutOfStock && onAddToCart(product)} 
              disabled={isOutOfStock}
              className="w-14 h-14 rounded-full"
            >
              <ShoppingCart size={22} />
            </Button>
          )}
        </div>
      </div>
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${product.name}"? This will remove it from the marketplace.`}
        confirmText="Delete Product"
        isLoading={isDeleting}
      />
    </div>
  );
};


const Products = () => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [newProduct, setNewProduct] = useState({ 
    name: '', 
    description: '', 
    price: '', 
    quantity: '', 
    category: 'other',
    image: '' 
  });
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct({ ...newProduct, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        const res = await apiClient.put(`/products/${editingProduct._id}`, newProduct);
        setProducts(products.map(p => p._id === editingProduct._id ? res.data.product : p));
        showToast('Product updated successfully!', 'success');
      } else {
        const res = await apiClient.post('/products', newProduct);
        setProducts([...products, res.data.product]);
        showToast('Product submitted! It will be listed after SuperAdmin approval.', 'info');
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      setNewProduct({ name: '', description: '', price: '', quantity: '', category: 'other', image: '' });
    } catch (err: any) {
      console.error('Failed to save product', err);
      showToast(err.response?.data?.message || 'Failed to save product', 'error');
    }
  };

  const handleEditClick = (product: any) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
      category: product.category || 'other',
      image: product.image || ''
    });
    setIsModalOpen(true);
  };

  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const isInventoryView = window.location.pathname.includes('/admin/products');
      const endpoint = isInventoryView ? '/products?mine=true' : '/products';
      const res = await apiClient.get(endpoint, { 
        params: { 
          category: category !== 'all' ? category : undefined,
          sort: sortBy
        } 
      });
      setProducts(res.data.products || []);
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [window.location.pathname, category, sortBy]);

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`${window.location.pathname.includes('/admin/products') ? 'flex flex-col gap-8' : 'max-w-[1400px] mx-auto px-8 flex flex-col gap-12 pt-40 pb-20'}`}>
      {window.location.pathname.includes('/admin/products') ? (
        <header className="flex justify-between items-center mb-2">
          <div>
            <h1 className="text-xl font-bold text-white ">My Products</h1>
            <p className="text-white/40 mt-1 text-sm font-medium">Manage your listed harvests and monitor real-time stock levels.</p>
          </div>
          {(user?.role === 'admin' || user?.role === 'farmer') && (
            <Button 
              onClick={() => {
                setEditingProduct(null);
                setNewProduct({ name: '', description: '', price: '', quantity: '', category: 'other', image: '' });
                setIsModalOpen(true);
              }}
              leftIcon={<Plus size={20} />}
            >
              Add Product
            </Button>
          )}
        </header>
      ) : (
        <header className="mb-16 max-w-[800px] mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-[1.1]  mb-6">
            Organic <span className="text-primary">Market</span>
          </h1>
          <p className="text-white/40 text-lg leading-relaxed">
            Discover fresh, certified organic products direct from verified farms across Pakistan.
          </p>
        </header>
      )}

        <div className={`flex flex-col md:flex-row gap-4 mb-12 ${window.location.pathname.includes('/admin/products') ? 'bg-white/5 p-4 rounded-[32px] border border-white/10' : ''}`}>
          <div className="flex-1 relative flex items-center group">
            <Search size={18} className="absolute left-4 text-white/30 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search for organic produce..." 
              className={`w-full bg-bg-primary border border-white/10 rounded-full pl-12 pr-4 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 text-white transition-all ${window.location.pathname.includes('/admin/products') ? 'h-12' : 'h-14'}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3 min-w-[200px]">
            <Dropdown 
              value={category === 'all' ? 'All Categories' : category}
              onChange={setCategory}
              className="min-w-[180px]"
              size={window.location.pathname.includes('/admin/products') ? 'md' : 'lg'}
              icon={<Filter size={18} />}
              options={[
                { value: 'all', label: 'All Categories' },
                { value: 'vegetables', label: 'Vegetables' },
                { value: 'fruits', label: 'Fruits' },
                { value: 'grains', label: 'Grains' },
                { value: 'dairy', label: 'Dairy' },
                { value: 'eggs', label: 'Eggs' },
                { value: 'honey', label: 'Honey' },
                { value: 'livestock', label: 'Livestock' },
                { value: 'other', label: 'Other' },
              ]}
            />
            <Dropdown 
              value={sortBy === 'newest' ? 'Newest First' : sortBy === 'price_asc' ? 'Price: Low to High' : 'Price: High to Low'}
              onChange={setSortBy}
              className="min-w-[180px]"
              size={window.location.pathname.includes('/admin/products') ? 'md' : 'lg'}
              options={[
                { value: 'newest', label: 'Newest First' },
                { value: 'price_asc', label: 'Price: Low to High' },
                { value: 'price_desc', label: 'Price: High to Low' },
              ]}
            />
          </div>
        </div>
      
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard 
              key={product.id || product._id} 
              product={product} 
              isAdminView={window.location.pathname.includes('/admin/products')}
              onEdit={handleEditClick}
              onDelete={async (id: string) => {
                try {
                  await apiClient.delete(`/products/${id}`);
                  setProducts(products.filter(p => p._id !== id));
                } catch (err: any) {
                  console.error('Failed to delete product', err);
                  showToast(err.response?.data?.message || 'Failed to delete product', 'error');
                  throw err;
                }
              }}
              onAddToCart={async (p: any) => {
                if (!user) {
                  navigate('/register');
                  return;
                }
                
                try {
                  await apiClient.post('/cart/add', { productId: p._id || p.id, quantity: 1 });
                  window.dispatchEvent(new Event('cartUpdated'));
                  showToast('Added to cart successfully!', 'success');
                } catch (err: any) {
                  console.error('Failed to add to cart', err);
                  showToast(err.response?.data?.message || 'Failed to add to cart', 'error');
                }
              }}
            />
          ))}

          
          {filteredProducts.length === 0 && (
            <div className="col-span-full py-32 flex flex-col items-center gap-4 text-white/40">
              <ShoppingBag size={64} className="opacity-20" />
              <h3 className="text-xl font-bold">No products found</h3>
              <p>Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      )}


      <Modal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
          setNewProduct({ name: '', description: '', price: '', quantity: '', category: 'other', image: '' });
        }}
        title={editingProduct ? "Edit Product" : "Add New Product"}
        subtitle={editingProduct ? "Update your product details and stock information." : "Submit your product for SuperAdmin approval before it goes live."}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col items-center gap-4 py-4 bg-white/5 rounded-3xl border-2 border-dashed border-white/10">
            {newProduct.image ? (
              <div className="relative group w-32 h-32">
                <img src={newProduct.image} className="w-full h-full object-cover rounded-[24px]" />
                <button 
                  type="button"
                  onClick={() => setNewProduct({...newProduct, image: ''})}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                <div className="w-16 h-16 rounded-[24px] bg-white/5 flex items-center justify-center shadow-sm">
                  <Plus size={32} className="text-white/30" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-white/40">Upload Image</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            )}
          </div>

          <input 
            type="text" 
            placeholder="Product Name (e.g. Organic Heritage Tomatoes)" 
            className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 px-6 focus:outline-none focus:border-primary transition-all text-white font-medium"
            value={newProduct.name}
            onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
            required
          />
          
          <textarea 
            placeholder="Tell customers about your product..." 
            className="w-full bg-white/5 border border-white/10 rounded-[20px] py-2.5 px-6 focus:outline-none focus:border-primary transition-all text-white font-medium min-h-[80px]"
            value={newProduct.description}
            onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
            required
          />
          
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30 font-bold">Rs.</span>
              <input 
                type="number" 
                placeholder="Price" 
                className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-14 pr-6 focus:outline-none focus:border-primary transition-all text-white font-medium"
                value={newProduct.price}
                onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                required
              />
            </div>
            <input 
              type="number" 
              placeholder="Quantity" 
              className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 px-6 focus:outline-none focus:border-primary transition-all text-white font-medium"
              value={newProduct.quantity}
              onChange={(e) => setNewProduct({...newProduct, quantity: e.target.value})}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-white/40 ml-2">Category</label>
            <Dropdown 
              value={newProduct.category}
              onChange={(val) => setNewProduct({...newProduct, category: val})}
              icon={<LayoutGrid size={18} />}
              options={[
                { value: 'vegetables', label: 'Vegetables' },
                { value: 'fruits', label: 'Fruits' },
                { value: 'grains', label: 'Grains' },
                { value: 'dairy', label: 'Dairy' },
                { value: 'eggs', label: 'Eggs' },
                { value: 'honey', label: 'Honey' },
                { value: 'livestock', label: 'Livestock' },
                { value: 'other', label: 'Other' },
              ]}
            />
          </div>

          <Button 
            type="submit"
            fullWidth
            size="lg"
            className="mt-2"
          >
            {editingProduct ? "Save Changes" : "Submit for Approval"}
          </Button>
        </form>
      </Modal>

    </div>
  );
};

export default Products;
