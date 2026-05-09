import { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { Link } from 'react-router-dom';
import { Plus, Search, ShoppingCart, Filter, Loader2, ShoppingBag, X, Edit, Trash2} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProductCard = ({ product, onAddToCart, isAdminView, onDelete }: any) => {
  const stock = product.quantity ?? 0;
  const isOutOfStock = stock === 0;
  const isLowStock = stock > 0 && stock <= 10;

  return (
    <div 
      className={`group bg-bg-primary/50 backdrop-blur-xl border rounded-[32px] overflow-hidden transition-all duration-500 ${isOutOfStock ? 'border-white/5 opacity-75' : 'border-white/5 hover:border-primary/30 shadow-2xl shadow-black/20'}`}
    >
      <div className="h-64 relative overflow-hidden bg-white/5">
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

        {/* Category badge */}
        {/* Category badge — top left */}
        <div className="absolute top-4 left-4 bg-primary/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
          {product.category || 'Fresh'}
        </div>

        {/* Stock badge — top right, customer view only */}
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

        {/* Out of stock overlay */}
        {isOutOfStock && !isAdminView && (
          <div className="absolute inset-0 bg-primary/50 backdrop-blur-sm flex items-center justify-center">
            <span className="bg-white/5 text-white font-bold text-xs uppercase tracking-widest px-5 py-2.5 rounded-[32px]">
              Out of Stock
            </span>
          </div>
        )}
      </div>
      
      <div className="p-6 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors leading-tight mb-1">{product.name}</h3>
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
              <span className={`text-[10px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 rounded-md ${isOutOfStock ? 'bg-red-500/10 text-red-400' : isLowStock ? 'bg-amber-400/10 text-amber-400' : 'bg-primary/10 text-primary'}`}>
                Stock: {stock}
              </span>
            )}
          </div>

        </div>
        
        <p className="text-white/40 text-sm line-clamp-2 leading-relaxed font-medium">
          {product.description || 'Premium organic product directly from local farms.'}
        </p>

        {/* Stock badge — customer view only */}
        {!isAdminView && (
          <div className="flex items-center gap-2">
            {isOutOfStock ? (
              <span className="text-[10px] font-bold uppercase tracking-widest text-red-500 bg-red-50 px-2.5 py-1 rounded-xl">
                Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 rounded-xl">
                Only {stock} left
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/5 px-2.5 py-1 rounded-xl">
                {stock} in stock
              </span>
            )}
          </div>
        )}
        
        <div className="flex justify-between items-center mt-2 pt-4 border-t border-white/5">
          <div className="flex flex-col">
            <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest mb-0.5">Price per kg</span>
            <div className="flex items-baseline gap-1">
              <span className="text-primary text-sm font-bold">Rs.</span>
              <span className="text-3xl font-bold text-white er">{product.price}</span>
            </div>
          </div>
          
          {isAdminView ? (
            <div className="flex gap-2">
              <button 
                onClick={() => alert('Edit functionality coming soon!')} 
                className="w-12 h-12 rounded-[32px] bg-white/5/50 text-white flex items-center justify-center hover:bg-primary hover:text-white transition-all active:scale-90"
              >
                <Edit size={20} />
              </button>
              <button 
                onClick={() => onDelete(product._id)} 
                className="w-12 h-12 rounded-[32px] bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all active:scale-90"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => !isOutOfStock && onAddToCart(product)} 
              disabled={isOutOfStock}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                isOutOfStock 
                  ? 'bg-white/10 text-zinc-300 cursor-not-allowed' 
                  : 'bg-primary text-black hover:brightness-110 shadow-lg shadow-primary/10'
              }`}
            >
              <ShoppingCart size={22} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


const Products = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient.post('/products', newProduct);
      setProducts([...products, res.data.product]);
      setIsAddModalOpen(false);
      setNewProduct({ name: '', description: '', price: '', quantity: '', category: 'other', image: '' });
    } catch (err: any) {
      console.error('Failed to add product', err);
      alert(err.response?.data?.message || 'Failed to add product');
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const isInventoryView = window.location.pathname.includes('/admin/products');
        const endpoint = isInventoryView ? '/products?mine=true' : '/products';
        const res = await apiClient.get(endpoint);
        setProducts(res.data.products || []);
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [window.location.pathname]);

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
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-primary text-black font-bold px-5 py-2.5 rounded-[32px] flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all"
            >
              <Plus size={20} /> Add Product
            </button>
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
          {(user?.role === 'admin' || user?.role === 'farmer') && (
            <div className="mt-8 flex justify-center">
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-primary text-black font-bold px-8 py-3.5 rounded-full flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all"
              >
                <Plus size={20} /> Add Product
              </button>
            </div>
          )}
        </header>
      )}

        <div className={`flex flex-col md:flex-row gap-4 mb-12 ${window.location.pathname.includes('/admin/products') ? 'bg-white/5 p-4 rounded-[32px] border border-white/10' : ''}`}>
          <div className="flex-1 relative flex items-center group">
            <Search size={18} className="absolute left-4 text-white/30 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search for organic produce..." 
              className={`w-full bg-bg-primary border border-white/10 rounded-full py-4 pl-12 pr-4 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 text-white transition-all ${window.location.pathname.includes('/admin/products') ? 'py-3' : ''}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <button className={`bg-white/5 border border-white/10 text-white px-8 py-4 rounded-full flex items-center gap-2 hover:bg-white/10 transition-all font-bold ${window.location.pathname.includes('/admin/products') ? 'py-3' : ''}`}>
              <Filter size={18} /> Filter
            </button>
            <select className={`bg-white/5 border border-white/10 text-white px-8 py-4 rounded-full focus:outline-none focus:border-primary/50 transition-all cursor-pointer font-bold appearance-none ${window.location.pathname.includes('/admin/products') ? 'py-3' : ''}`}>
              <option>Newest First</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
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
              onDelete={async (id: string) => {
                if (!confirm('Are you sure you want to delete this product?')) return;
                try {
                  await apiClient.delete(`/products/${id}`);
                  setProducts(products.filter(p => p._id !== id));
                } catch (err: any) {
                  console.error('Failed to delete product', err);
                  alert(err.response?.data?.message || 'Failed to delete product');
                }
              }}
              onAddToCart={async (p: any) => {
                try {
                  await apiClient.post('/cart/add', { productId: p._id || p.id, quantity: 1 });
                  alert('Added to cart successfully!');
                } catch (err: any) {
                  console.error('Failed to add to cart', err);
                  alert(err.response?.data?.message || 'Failed to add to cart');
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


        {isAddModalOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <div 
              className="bg-transparent/50 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 w-full max-w-lg glass overflow-hidden"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white ">Add New Product</h2>
                  <p className="text-white/40 text-sm">List your fresh farm produce for customers.</p>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full text-white/30 transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleAddProduct} className="flex flex-col gap-5">
                <div className="flex flex-col items-center gap-4 py-4 bg-white/5 rounded-3xl border-2 border-dashed border-white/10">
                  {newProduct.image ? (
                    <div className="relative group w-32 h-32">
                      <img src={newProduct.image} className="w-full h-full object-cover rounded-[32px]" />
                      <button 
                        type="button"
                        onClick={() => setNewProduct({...newProduct, image: ''})}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                      <div className="w-16 h-16 rounded-[32px] bg-white/5 flex items-center justify-center shadow-sm">
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
                  className="w-full bg-white/5 border border-white/10 rounded-[32px] py-3.5 px-5 focus:outline-none focus:border-primary transition-all text-white font-medium"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  required
                />
                
                <textarea 
                  placeholder="Tell customers about your product..." 
                  className="w-full bg-white/5 border border-white/10 rounded-[32px] py-3.5 px-5 focus:outline-none focus:border-primary transition-all text-white font-medium min-h-[100px]"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  required
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30 font-bold">Rs.</span>
                    <input 
                      type="number" 
                      placeholder="Price" 
                      className="w-full bg-white/5 border border-white/10 rounded-[32px] py-3.5 pl-12 pr-5 focus:outline-none focus:border-primary transition-all text-white font-medium"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                      required
                    />
                  </div>
                  <input 
                    type="number" 
                    placeholder="Quantity" 
                    className="w-full bg-white/5 border border-white/10 rounded-[32px] py-3.5 px-5 focus:outline-none focus:border-primary transition-all text-white font-medium"
                    value={newProduct.quantity}
                    onChange={(e) => setNewProduct({...newProduct, quantity: e.target.value})}
                    required
                  />
                </div>

                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-[32px] py-3.5 px-5 focus:outline-none focus:border-primary transition-all text-white font-medium appearance-none"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  required
                >
                  <option value="other">Select Category</option>
                  <option value="vegetables">Vegetables</option>
                  <option value="fruits">Fruits</option>
                  <option value="grains">Grains</option>
                  <option value="dairy">Dairy</option>
                  <option value="eggs">Eggs</option>
                  <option value="honey">Honey</option>
                  <option value="other">Other</option>
                </select>

                <button 
                  type="submit"
                  className="w-full bg-primary text-black font-bold py-4 rounded-[32px] mt-2 hover:brightness-110 transition-all"
                >
                  List Product Now
                </button>
              </form>
            </div>
          </div>
        )}

    </div>
  );
};

export default Products;
