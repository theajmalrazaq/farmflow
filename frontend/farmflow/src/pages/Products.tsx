import { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { 
  Plus, 
  Search, 
  ShoppingCart, 
  Filter, 
  Star,
  Loader2,
  ShoppingBag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const ProductCard = ({ product, onAddToCart }: any) => {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group bg-bg-surface border border-border-subtle rounded-2xl overflow-hidden hover:border-border-bright transition-all duration-300"
    >
      <div className="h-52 relative overflow-hidden">
        <img 
          src={product.image || `https://images.unsplash.com/photo-1592419044706-39796d40f98c?w=400&q=80`} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-3 left-3 bg-primary text-black text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg">
          {product.category || 'Fresh'}
        </div>
      </div>
      
      <div className="p-5 flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{product.name}</h3>
          <div className="flex items-center gap-1 text-amber-500 text-sm font-bold">
            <Star size={14} fill="currentColor" />
            <span>4.5</span>
          </div>
        </div>
        
        <p className="text-zinc-400 text-sm line-clamp-2 leading-relaxed">
          {product.description || 'Premium organic product directly from local farms.'}
        </p>
        
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-baseline gap-1">
            <span className="text-primary text-sm font-bold">$</span>
            <span className="text-2xl font-black text-white">{product.price}</span>
            <span className="text-zinc-500 text-xs font-medium">/kg</span>
          </div>
          <button 
            onClick={() => onAddToCart(product)} 
            className="w-10 h-10 rounded-xl bg-bg-accent border border-border-subtle text-white flex items-center justify-center hover:bg-primary hover:text-black hover:border-primary transition-all active:scale-90"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const Products = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await apiClient.get('/products');
        setProducts(res.data);
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Products Marketplace</h1>
            <p className="text-zinc-400 mt-1">Discover fresh, organic products from our network of farmers.</p>
          </div>
          {user?.role !== 'customer' && (
            <button className="bg-primary text-black font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20">
              <Plus size={20} /> Add Product
            </button>
          )}
        </div>

        <div className="flex gap-4 items-center">
          <div className="flex-1 relative flex items-center group">
            <Search size={18} className="absolute left-4 text-zinc-500 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full bg-bg-surface border border-border-subtle rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="bg-bg-accent border border-border-subtle text-white px-5 py-3 rounded-xl flex items-center gap-2 hover:bg-border-subtle transition-all">
            <Filter size={18} /> Filter
          </button>
          <select className="bg-bg-accent border border-border-subtle text-white px-5 py-3 rounded-xl focus:outline-none focus:border-primary/50 transition-all cursor-pointer">
            <option>Newest First</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
          </select>
        </div>
      </header>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      ) : (
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" layout>
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id || product._id} 
                product={product} 
                onAddToCart={(p: any) => console.log('Add to cart', p)}
              />
            ))}
          </AnimatePresence>
          
          {filteredProducts.length === 0 && (
            <div className="col-span-full py-32 flex flex-col items-center gap-4 text-zinc-500">
              <ShoppingBag size={64} className="opacity-20" />
              <h3 className="text-xl font-bold">No products found</h3>
              <p>Try adjusting your search or filters.</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default Products;
